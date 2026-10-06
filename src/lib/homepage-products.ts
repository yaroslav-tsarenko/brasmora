export interface HomepageProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  comparePrice?: number | string | null;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string; slug: string } }[];
  quantity?: number;
  status?: string;
  isFeatured?: boolean;
  brand?: string | null;
  createdAt?: string | Date;
}

export interface HomepageCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  children?: { id: string; name: string; slug: string }[];
  _count?: { products: number };
}

/**
 * Which slice of the catalogue this storefront puts on the front page.
 *
 * Solvetaworld shares its product database with a sibling store, so a plain
 * `slice(0, limit)` on the same ranked list would put the same ten items on
 * both homepages. The shelf seed fixes that without weakening the sections:
 * each one still ranks by what it claims to rank by — featured, deepest
 * discount, newest, most stock — but the picker draws from the top of that
 * ranking with a store-specific, stable shuffle instead of always taking the
 * first N.
 *
 * Stable is the point. The same seed always produces the same homepage, so the
 * page does not reshuffle under a shopper between requests, and it does not
 * differ between the server render and the client.
 */
const SHELF_SEED = process.env.NEXT_PUBLIC_SHELF_SEED ?? "solvetaworld";

/** How much of the ranking the picker is allowed to reach into, as a multiple
 *  of the section size. Three keeps the choice near the top of the ranking. */
const SHELF_DEPTH = 3;

function seedFrom(...parts: string[]): number {
  let h = 2166136261;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      h ^= part.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, and identical on server and client. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Takes an already-ranked list and returns `limit` of its strongest entries,
 * chosen for this shelf rather than simply taken from the front, and returned
 * in the ranking's own order.
 */
export function pickForShelf<T>(ranked: T[], limit: number, shelf: string): T[] {
  if (ranked.length <= limit) return ranked;

  const pool = ranked.slice(0, Math.min(ranked.length, limit * SHELF_DEPTH));
  const order = pool.map((_, i) => i);
  const next = rng(seedFrom(SHELF_SEED, shelf));

  // Fisher-Yates over the indices, so the pick is uniform across the pool.
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order
    .slice(0, limit)
    .sort((a, b) => a - b)
    .map((i) => pool[i]);
}

export function getFeaturedProducts(products: HomepageProduct[], limit = 10): HomepageProduct[] {
  return pickForShelf(products.filter((p) => p.isFeatured), limit, "featured");
}

export function getSaleProducts(products: HomepageProduct[], limit = 10): HomepageProduct[] {
  const ranked = products
    .filter((p) => {
      if (!p.comparePrice) return false;
      return Number(p.comparePrice) > Number(p.price);
    })
    .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  return pickForShelf(ranked, limit, "sale");
}

export function getNewProducts(products: HomepageProduct[], limit = 10): HomepageProduct[] {
  const ranked = [...products].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });
  return pickForShelf(ranked, limit, "new");
}

export function getPopularProducts(products: HomepageProduct[], limit = 10): HomepageProduct[] {
  const ranked = [...products].sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
  return pickForShelf(ranked, limit, "popular");
}

export function getProductsByCategory(products: HomepageProduct[], categorySlug: string): HomepageProduct[] {
  return products.filter((p) =>
    p.categories?.some((c) => c.category.slug === categorySlug)
  );
}

export function getProductsByBrand(products: HomepageProduct[], brandName: string): HomepageProduct[] {
  return products.filter((p) => p.brand?.toLowerCase() === brandName.toLowerCase());
}

export function getDiscountPercent(product: HomepageProduct): number {
  const price = Number(product.price);
  const compare = product.comparePrice ? Number(product.comparePrice) : null;
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export interface CategorySection {
  category: HomepageCategory;
  products: HomepageProduct[];
  subcategoryTabs: string[];
}

export function getHomepageCategorySections(
  products: HomepageProduct[],
  categories: HomepageCategory[],
  maxPerCategory = 10,
  maxSections?: number,
): CategorySection[] {
  // A product that belongs to two parent categories must not appear in two
  // homepage rails — each section presents its own non-overlapping assortment
  // (acquirer compliance requirement). First rail to claim an item keeps it.
  const claimed = new Set<string>();
  const sections = categories
    .map((cat) => {
      const catProducts = getProductsByCategory(products, cat.slug);
      const childSlugs = cat.children?.map((c) => c.slug) || [];
      const fromChildren = childSlugs.length > 0
        ? products.filter((p) =>
            p.categories?.some((c) => childSlugs.includes(c.category.slug))
          )
        : [];
      const merged = [...catProducts, ...fromChildren];
      const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values())
        .filter((p) => !claimed.has(p.id));

      const subcategoryTabs = cat.children?.length
        ? ["All", ...cat.children.map((c) => c.name)]
        : [];

      const picked = pickForShelf(unique, maxPerCategory, `category:${cat.slug}`);
      picked.forEach((p) => claimed.add(p.id));

      return {
        category: cat,
        products: picked,
        subcategoryTabs,
        totalCount: unique.length,
      };
    })
    .filter((s) => s.products.length > 0)
    .sort((a, b) => b.totalCount - a.totalCount);

  const limited = maxSections ? sections.slice(0, maxSections) : sections;
  return limited.map(({ totalCount: _, ...rest }) => rest);
}

export interface BrandSection {
  brand: string;
  products: HomepageProduct[];
}

export function getBrandSections(
  products: HomepageProduct[],
  brandNames: string[],
  limit = 8,
): BrandSection[] {
  return brandNames
    .map((brand) => ({
      brand,
      products: pickForShelf(getProductsByBrand(products, brand), limit, `brand:${brand}`),
    }))
    .filter((s) => s.products.length > 0);
}

/** The manufacturers actually represented in this catalogue, by volume. The
 *  list the template shipped with was consumer-electronics brands, which match
 *  nothing here and rendered as empty rows. */
export const TOP_BRANDS = [
  "Legrand", "VEXEN electric", "PAWBOL", "ETI", "Bticino",
  "ambro-sol", "GACIA", "NIKDIM", "HORA eTec", "Pollmann",
  "Mersen", "Eltako", "Schneider Electric", "WAGO",
];
