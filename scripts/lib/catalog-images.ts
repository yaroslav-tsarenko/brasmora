import crypto from "crypto";
import fs from "fs";
import path from "path";
import { reliableFetch } from "../../src/lib/utils/reliable-fetch";

export interface ImageStore {
  head(key: string): Promise<{ exists: boolean; metadata: Record<string, string> }>;
  put(key: string, body: Buffer, contentType: string, metadata: Record<string, string>): Promise<string>;
  publicUrl(key: string): string;
}

export interface ImageSyncInput {
  slug: string;
  images: Array<{ sourceUrl: string }>;
}

export interface ImageSyncOptions {
  prefix: string;
  concurrency: number;
  timeoutMs: number;
  maxBytes: number;
  manifestPath: string;
  log: (line: string) => void;
  fetchImage?: (url: string, timeoutMs: number) => Promise<Buffer>;
}

export interface ImageSyncResult {
  urls: Map<string, string[]>;
  uploaded: number;
  fromManifest: number;
  alreadyInBucket: number;
  failed: number;
  failures: Array<{ slug: string; index: number; error: string }>;
}

interface ManifestEntry {
  srcHash: string;
  bytes: number;
  contentType: string;
  at: string;
}

interface Manifest {
  version: 1;
  entries: Record<string, ManifestEntry>;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function sourceHash(url: string): string {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 20);
}

export function extFromUrl(url: string): string {
  const m = /\.([a-z0-9]{3,4})(?:$|[?#])/i.exec(new URL(url, "https://local.invalid").pathname);
  const ext = m?.[1]?.toLowerCase();
  if (ext === "jpeg") return "jpg";
  return ext && ["jpg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
}

export function imageKey(prefix: string, slug: string, index: number, sourceUrl: string): string {
  return `${prefix.replace(/\/+$/, "")}/${slug}/${index}.${extFromUrl(sourceUrl)}`;
}

export function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buf.toString("ascii", 0, 3) === "GIF") return "image/gif";
  if (buf.toString("ascii", 4, 12) === "ftypavif") return "image/avif";
  return null;
}

export function loadManifest(file: string): Manifest {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as Manifest;
    if (parsed && parsed.version === 1 && parsed.entries && typeof parsed.entries === "object") return parsed;
  } catch {
    return { version: 1, entries: {} };
  }
  return { version: 1, entries: {} };
}

function saveManifest(file: string, manifest: Manifest) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(manifest));
  fs.renameSync(tmp, file);
}

async function defaultFetchImage(url: string, timeoutMs: number): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await reliableFetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,*/*" } }, 1);
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        lastError = new Error(`HTTP ${res.status}`);
        break;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("download failed");
}

export async function syncImages(products: ImageSyncInput[], store: ImageStore, opts: ImageSyncOptions): Promise<ImageSyncResult> {
  const manifest = loadManifest(opts.manifestPath);
  const fetchImage = opts.fetchImage ?? defaultFetchImage;
  const jobs = products.flatMap((p) => p.images.map((img, i) => ({ slug: p.slug, index: i + 1, sourceUrl: img.sourceUrl })));
  const resultUrls = new Map<string, Array<string | null>>();
  for (const p of products) resultUrls.set(p.slug, new Array(p.images.length).fill(null));
  const result: ImageSyncResult = { urls: new Map(), uploaded: 0, fromManifest: 0, alreadyInBucket: 0, failed: 0, failures: [] };

  let done = 0;
  let sinceSave = 0;
  let cursor = 0;
  const startedAt = Date.now();

  const report = () => {
    const rate = done / Math.max(1, (Date.now() - startedAt) / 1000);
    process.stdout.write(`\r  images: ${done}/${jobs.length}  uploaded ${result.uploaded}, cached ${result.fromManifest + result.alreadyInBucket}, failed ${result.failed}  (${rate.toFixed(1)}/s)   `);
  };

  async function handle(job: { slug: string; index: number; sourceUrl: string }) {
    const key = imageKey(opts.prefix, job.slug, job.index, job.sourceUrl);
    const hash = sourceHash(job.sourceUrl);
    const known = manifest.entries[key];
    if (known && known.srcHash === hash) {
      resultUrls.get(job.slug)![job.index - 1] = store.publicUrl(key);
      result.fromManifest++;
      return;
    }
    const head = await store.head(key);
    if (head.exists && head.metadata["src-hash"] === hash) {
      manifest.entries[key] = { srcHash: hash, bytes: 0, contentType: "", at: new Date().toISOString() };
      resultUrls.get(job.slug)![job.index - 1] = store.publicUrl(key);
      result.alreadyInBucket++;
      return;
    }
    const body = await fetchImage(job.sourceUrl, opts.timeoutMs);
    if (body.length < 1024) throw new Error(`image too small (${body.length} bytes)`);
    if (body.length > opts.maxBytes) throw new Error(`image too large (${(body.length / 1024 / 1024).toFixed(1)}MB)`);
    const contentType = sniffImageType(body);
    if (!contentType || !EXT_BY_MIME[contentType]) throw new Error("payload is not a supported image");
    const url = await store.put(key, body, contentType, { "src-hash": hash });
    manifest.entries[key] = { srcHash: hash, bytes: body.length, contentType, at: new Date().toISOString() };
    resultUrls.get(job.slug)![job.index - 1] = url;
    result.uploaded++;
  }

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      try {
        await handle(job);
      } catch (err) {
        result.failed++;
        if (result.failures.length < 200) result.failures.push({ slug: job.slug, index: job.index, error: (err as Error).message.slice(0, 200) });
      }
      done++;
      sinceSave++;
      if (sinceSave >= 25) {
        saveManifest(opts.manifestPath, manifest);
        sinceSave = 0;
      }
      if (done % 10 === 0 || done === jobs.length) report();
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, Math.min(opts.concurrency, jobs.length || 1)) }, () => worker()));
  saveManifest(opts.manifestPath, manifest);
  if (jobs.length) process.stdout.write("\n");

  for (const [slug, urls] of resultUrls) result.urls.set(slug, urls.filter((u): u is string => Boolean(u)));
  return result;
}
