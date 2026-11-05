import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";
import { putR2Object, isR2Configured } from "../src/lib/r2";

// Brings back products that image-health archived because the supplier CDN dropped their
// photos. Each photo is looked up in a Wayback Machine CDX index of cdnbigbuy.com, copied
// to R2 so it cannot disappear again, and the product returns as sold out (quantity 0):
// the supplier no longer lists it, so it must not be orderable.
//
//   tsx scripts/restore-archived-images.ts --cdx <dir> [--apply] [--limit n] [--concurrency n]
//
// <dir> holds CDX JSON pages fetched with fl=original,timestamp,mimetype&filter=statuscode:200.

const argv = process.argv.slice(2);
const value = (flag: string) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const APPLY = argv.includes("--apply");
const CDX_DIR = value("--cdx");
const LIMIT = value("--limit") ? Number(value("--limit")) : undefined;
const CONCURRENCY = Number(value("--concurrency") || 4);
const KEY_PREFIX = "brasmora/archive";

function normalise(url: string): string {
  return url.split("#")[0].replace(/^https?:\/\//i, "").replace(/^www\./i, "").toLowerCase();
}

function loadIndex(dir: string): Map<string, string> {
  const index = new Map<string, string>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const rows = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as string[][];
    for (const [original, timestamp, mime] of rows.slice(1)) {
      if (!mime?.startsWith("image/")) continue;
      const key = normalise(original);
      const known = index.get(key);
      if (!known || timestamp > known) index.set(key, timestamp);
    }
  }
  return index;
}

async function download(url: string, timestamp: string): Promise<{ body: Buffer; type: string } | null> {
  const source = `https://web.archive.org/web/${timestamp}id_/${url.split("#")[0]}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(source, { signal: AbortSignal.timeout(60_000) });
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 5000 * attempt));
        continue;
      }
      if (!res.ok) return null;
      const type = (res.headers.get("content-type") || "").split(";")[0];
      const body = Buffer.from(await res.arrayBuffer());
      if (!type.startsWith("image/") || body.length < 1024) return null;
      return { body, type };
    } catch {
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  return null;
}

async function mapLimit<T>(items: T[], limit: number, fn: (item: T, index: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i], i);
      }
    }),
  );
}

async function main() {
  if (!CDX_DIR) throw new Error("--cdx <dir> is required");
  if (APPLY && !isR2Configured()) throw new Error("R2 is not configured (R2_* env)");
  const index = loadIndex(CDX_DIR);
  console.log(`=== restore archived images ${APPLY ? "(APPLY)" : "(report only)"} — ${index.size} archived images indexed ===`);

  const products = await prisma.$queryRaw<Array<{ id: string; slug: string; metadata: Record<string, unknown> | null }>>`
    SELECT id, slug, metadata FROM "Product"
    WHERE status = 'ARCHIVED' AND (metadata->'imageHealth'->>'archived') = 'true'
    ORDER BY slug`;
  const images = await prisma.$queryRaw<Array<{ productId: string; url: string; alt: string | null; sortOrder: number }>>`
    SELECT "productId", url, alt, "sortOrder" FROM "ProductImage"
    WHERE "productId" = ANY(${products.map((p) => p.id)}::text[])
    ORDER BY "productId", "sortOrder"`;
  const byProduct = new Map<string, typeof images>();
  for (const img of images) byProduct.set(img.productId, [...(byProduct.get(img.productId) ?? []), img]);

  const candidates = products.filter((p) => (byProduct.get(p.id) ?? []).some((img) => index.has(normalise(img.url))));
  const work = LIMIT ? candidates.slice(0, LIMIT) : candidates;
  console.log(`archived products ${products.length}, with at least one archived photo ${candidates.length}, processing ${work.length}`);

  let restored = 0;
  let photos = 0;
  let failed = 0;
  await mapLimit(work, CONCURRENCY, async (product, i) => {
    const recovered: Array<{ url: string; alt: string | null }> = [];
    for (const img of byProduct.get(product.id) ?? []) {
      const timestamp = index.get(normalise(img.url));
      if (!timestamp) continue;
      if (!APPLY) {
        recovered.push({ url: img.url, alt: img.alt });
        continue;
      }
      const file = await download(img.url, timestamp);
      if (!file) continue;
      const name = img.url.split("#")[0].split("/").pop()!;
      const url = await putR2Object(`${KEY_PREFIX}/${name}`, file.body, file.type, { cacheControl: "public, max-age=31536000, immutable" });
      recovered.push({ url, alt: img.alt });
    }
    if (!recovered.length) {
      failed++;
      return;
    }
    restored++;
    photos += recovered.length;
    if (APPLY) {
      const now = new Date().toISOString();
      const mark = { checkedAt: now, restoredFromArchiveAt: now, supplierDelisted: true };
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: product.id } }),
        prisma.productImage.createMany({ data: recovered.map((r, order) => ({ url: r.url, alt: r.alt, sortOrder: order, productId: product.id })) }),
        prisma.$executeRaw`
          UPDATE "Product"
          SET status = 'ACTIVE', quantity = 0, "trackInventory" = true, "updatedAt" = now(),
              metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{imageHealth}', ${JSON.stringify(mark)}::jsonb)
          WHERE id = ${product.id}`,
      ]);
    }
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${work.length}: restored ${restored}, photos ${photos}, failed ${failed}`);
  });

  console.log(`\n${APPLY ? "restored" : "would restore"} ${restored} products with ${photos} photos; ${failed} had no downloadable photo`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
