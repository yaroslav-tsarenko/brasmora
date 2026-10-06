import type { CatalogConfig, MatchScope } from "../../src/config/catalog";
import { containsSupplierTrace, publicBrand } from "../../src/lib/utils/supplier";
import type { BbImage, SourceData } from "./bigbuy-source";
import {
  anyMatch,
  cleanDescriptionHtml,
  cleanProductName,
  compileMatchers,
  createSlugAllocator,
  descriptionProblem,
  firstMatch,
  longestMatch,
  looksEnglishName,
  matcherLabel,
  median,
  normalizeText,
  shortDescriptionFrom,
  stripPhrases,
  type CompiledMatcher,
} from "./catalog-text";

export interface SelectedImage {
  sourceUrl: string;
  isCover: boolean;
  whiteBackground: boolean;
}

export interface SelectedProduct {
  sourceId: number;
  sourceSku: string;
  sku: string;
  name: string;
  slug: string;
  descriptionHtml: string;
  descriptionText: string;
  shortDescription: string | null;
  brand: string | null;
  price: number;
  costPrice: number | null;
  weight: number | null;
  ean: string | null;
  quantity: number;
  primary: string;
  sub: string | null;
  images: SelectedImage[];
  quality: number;
  taxonomyPath: string;
}

export interface CategoryNode {
  slug: string;
  name: string;
  description: string | null;
  parentSlug: string | null;
  sortOrder: number;
  productCount: number;
  artProductSlug: string | null;
  artPinned: boolean;
}

export interface PathCount {
  path: string;
  count: number;
}

export interface SelectionResult {
  products: SelectedProduct[];
  categories: CategoryNode[];
  excluded: Record<string, number>;
  excludedSamples: Record<string, string[]>;
  demotedSubs: Array<{ slug: string; name: string; primary: string; count: number }>;
  droppedPrimaries: Array<{ slug: string; name: string; count: number }>;
  emptySubs: Array<{ slug: string; primary: string }>;
  nearMisses: PathCount[];
  unrouted: PathCount[];
  routedTaxonomies: Array<PathCount & { to: string }>;
  primaryMedians: Record<string, number>;
  brands: Array<{ name: string; count: number }>;
  stats: {
    sourceProducts: number;
    active: number;
    inScope: number;
    passedFilters: number;
    selected: number;
    stockKnown: boolean;
  };
}

interface Level {
  id: number;
  name: string;
  norm: string;
}

interface CompiledSub {
  primary: string;
  slug: string;
  name: string;
  keywords: CompiledMatcher[];
}

interface CompiledPrimary {
  slug: string;
  name: string;
  keywords: CompiledMatcher[];
  subs: CompiledSub[];
}

interface Route {
  primary: string;
  sub: string | null;
}

interface Candidate extends Omit<SelectedProduct, "slug" | "sku"> {
  familyKey: string;
  nameKey: string;
  coverWhite: boolean;
}

const COLOUR_WORDS = [
  "black", "white", "red", "blue", "green", "grey", "gray", "pink", "yellow", "orange", "purple", "brown", "beige",
  "silver", "gold", "golden", "cream", "turquoise", "navy", "multicolour", "multicolor", "transparent", "natural",
  "copper", "bronze", "lilac", "mint", "coral", "ivory", "anthracite", "graphite", "taupe", "mustard", "burgundy",
  "terracotta", "olive", "aqua", "fuchsia", "violet", "khaki", "dark", "light",
];
const COLOUR_RE = new RegExp(`\\b(?:${COLOUR_WORDS.join("|")})\\b`, "g");

export function validateConfig(config: CatalogConfig): string[] {
  const problems: string[] = [];
  if (config.storefront.length > config.limits.maxTopLevel) {
    problems.push(`storefront has ${config.storefront.length} top-level categories, max is ${config.limits.maxTopLevel}`);
  }
  const slugs = new Set<string>();
  for (const p of config.storefront) {
    for (const slug of [p.slug, ...p.subs.map((s) => s.slug)]) {
      if (slugs.has(slug)) problems.push(`duplicate storefront slug "${slug}"`);
      slugs.add(slug);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) problems.push(`invalid slug "${slug}"`);
    }
  }
  for (const m of config.taxonomyMap) {
    const [primary, sub] = m.to.split("/");
    const p = config.storefront.find((x) => x.slug === primary);
    if (!p) problems.push(`taxonomyMap "${m.match}" points to unknown category "${m.to}"`);
    else if (sub && !p.subs.some((s) => s.slug === sub)) problems.push(`taxonomyMap "${m.match}" points to unknown subcategory "${m.to}"`);
  }
  if (config.limits.maxPerPrimary < config.limits.minPerPrimary) problems.push("limits.maxPerPrimary < limits.minPerPrimary");
  if (config.limits.maxPerSub < config.limits.minPerSub) problems.push("limits.maxPerSub < limits.minPerSub");
  if (config.price.minRetail >= config.price.maxRetail) problems.push("price.minRetail >= price.maxRetail");
  return problems;
}

export function storefrontSku(sourceId: number): string {
  return `BRS-${sourceId.toString(36).toUpperCase().padStart(5, "0")}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computePrice(retail: number, config: CatalogConfig["price"]): number {
  let price = round2(retail * config.multiplier);
  if (config.roundToNinetyNine && price > 1) price = round2(Math.ceil(price) - 0.01);
  return price;
}

function qualityScore(images: SelectedImage[], descriptionText: string, descriptionHtml: string, ean: string | null, brand: string | null): number {
  let q = Math.min(images.length, 5) * 2;
  if (images[0]?.whiteBackground) q += 3;
  q += Math.min(descriptionText.length / 300, 4);
  if (descriptionHtml.includes("<ul>")) q += 1;
  if (ean) q += 1;
  if (brand) q += 1;
  return round2(q);
}

export function pickImages(images: BbImage[], quality: CatalogConfig["quality"]): SelectedImage[] {
  const seen = new Set<string>();
  return [...images]
    .filter((img) => !img.flagged && !(quality.skipLogoImages && img.logo))
    .sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.position - b.position)
    .filter((img) => {
      const key = img.url.split("?")[0];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, quality.maxImagesPerProduct)
    .map((img) => ({ sourceUrl: img.url, isCover: img.isCover, whiteBackground: img.whiteBackground }));
}

export function familyKeyOf(name: string): { nameKey: string; familyKey: string } {
  const nameKey = normalizeText(name).replace(/[^a-z0-9]+/g, " ").trim();
  const familyKey = normalizeText(name)
    .replace(/\([^)]*\)/g, " ")
    .replace(COLOUR_RE, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:cm|mm|ml|cl|l|litres?|liters?|oz|units?|pcs|pieces?|x)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return { nameKey, familyKey };
}

export function createRouter(config: CatalogConfig) {
  const primaries: CompiledPrimary[] = config.storefront.map((p) => ({
    slug: p.slug,
    name: p.name,
    keywords: compileMatchers(p.keywords),
    subs: p.subs.map((s) => ({ primary: p.slug, slug: s.slug, name: s.name, keywords: compileMatchers(s.keywords) })),
  }));
  const allSubs = primaries.flatMap((p) => p.subs);
  const primaryKeywords = primaries.flatMap((p) => p.keywords);
  const scope = compileMatchers(config.include.scopeKeywords);
  const mapById = new Map<number, string>();
  const mapByName: Array<{ norm: string; path: boolean; to: string }> = [];
  for (const m of config.taxonomyMap) {
    if (typeof m.match === "number") mapById.set(m.match, m.to);
    else {
      const isPath = m.match.includes(">");
      mapByName.push({ norm: isPath ? m.match.split(">").map((x) => normalizeText(x)).join(" > ") : normalizeText(m.match), path: isPath, to: m.to });
    }
  }

  function resolveTarget(to: string): Route {
    const [primary, sub] = to.split("/");
    return { primary, sub: sub || null };
  }

  function bestSubIn(text: string, subs: CompiledSub[]): CompiledSub | null {
    let best: CompiledSub | null = null;
    let bestLen = 0;
    for (const s of subs) {
      const len = longestMatch(text, s.keywords);
      if (len > bestLen) {
        best = s;
        bestLen = len;
      }
    }
    return best;
  }

  function subByName(name: string, subs: CompiledSub[]): CompiledSub | null {
    let best: { sub: CompiledSub; index: number; length: number } | null = null;
    for (const s of subs) {
      const hit = firstMatch(name, s.keywords);
      if (!hit) continue;
      if (!best || hit.index < best.index || (hit.index === best.index && hit.length > best.length)) best = { sub: s, index: hit.index, length: hit.length };
    }
    return best?.sub ?? null;
  }

  function refineByName(route: Route, nameNorm: string): Route {
    const p = primaries.find((x) => x.slug === route.primary);
    if (!p) return route;
    const byName = subByName(nameNorm, p.subs);
    return byName ? { primary: route.primary, sub: byName.slug } : route;
  }

  function route(tax: Level[], cat: Level[], nameNorm: string): { route: Route | null; reason: "out-of-scope" | "near-miss" | "unrouted" | null } {
    for (const level of tax) {
      const to = mapById.get(level.id);
      if (to) return { route: refineByName(resolveTarget(to), nameNorm), reason: null };
    }
    const levels = [...tax, ...cat];
    const scopeOk = levels.some((l) => anyMatch(l.norm, scope) || anyMatch(l.norm, primaryKeywords));
    if (!scopeOk) {
      const touches = levels.some((l) => bestSubIn(l.norm, allSubs));
      return { route: null, reason: touches ? "near-miss" : "out-of-scope" };
    }
    const taxPath = tax.map((l) => l.norm).reverse().join(" > ");
    for (const m of mapByName) {
      const hit = m.path ? taxPath.endsWith(m.norm) : tax.some((l) => l.norm === m.norm);
      if (hit) return { route: refineByName(resolveTarget(m.to), nameNorm), reason: null };
    }
    for (const level of levels) {
      const sub = bestSubIn(level.norm, allSubs);
      if (sub) return { route: refineByName({ primary: sub.primary, sub: sub.slug }, nameNorm), reason: null };
      const primary = primaries.find((p) => anyMatch(level.norm, p.keywords));
      if (primary) return { route: refineByName({ primary: primary.slug, sub: null }, nameNorm), reason: null };
    }
    if (config.include.nameFallback) {
      const sub = subByName(nameNorm, allSubs);
      if (sub) return { route: { primary: sub.primary, sub: sub.slug }, reason: null };
    }
    return { route: null, reason: "unrouted" };
  }

  return { route, primaries };
}

export interface ExcludeTexts {
  taxonomy: string[];
  category: string[];
  name: string;
  description: string;
  brand: string;
}

export function createExcluder(config: CatalogConfig) {
  const ignore = compileMatchers(config.exclude.ignorePhrases);
  const rules = config.exclude.rules.map((r) => ({ id: r.id, scopes: new Set<MatchScope>(r.scopes), keywords: compileMatchers(r.keywords), skipRoot: Boolean(r.skipRootLevel) }));
  const joinLevels = (levels: string[]) => stripPhrases(normalizeText(levels.join(" > ")), ignore);
  return (texts: ExcludeTexts): { rule: string; keyword: string } | null => {
    const prepared: Record<MatchScope, string> = {
      taxonomy: joinLevels(texts.taxonomy),
      category: joinLevels(texts.category),
      name: stripPhrases(normalizeText(texts.name), ignore),
      description: stripPhrases(normalizeText(texts.description), ignore),
      brand: normalizeText(texts.brand),
    };
    const belowRoot: Partial<Record<MatchScope, string>> = {
      taxonomy: joinLevels(texts.taxonomy.slice(1)),
      category: joinLevels(texts.category.slice(1)),
    };
    for (const rule of rules) {
      for (const scope of rule.scopes) {
        const text = rule.skipRoot && scope in belowRoot ? belowRoot[scope]! : prepared[scope];
        if (!text) continue;
        const hit = anyMatch(text, rule.keywords);
        if (hit) return { rule: rule.id, keyword: `${scope}:${matcherLabel(hit)}` };
      }
    }
    return null;
  };
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function topPaths(map: Map<string, number>, limit: number): PathCount[] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([path, count]) => ({ path, count }));
}

export function selectCatalog(source: SourceData, config: CatalogConfig, options: { limit?: number; trace?: Map<number, string> } = {}): SelectionResult {
  const excluded: Record<string, number> = {};
  const excludedSamples: Record<string, string[]> = {};
  const exclude = (reason: string, label: string | null) => {
    excluded[reason] = (excluded[reason] || 0) + 1;
    if (label == null) return;
    const id = options.trace ? /\[(\d+)\]/.exec(label) : null;
    if (id) options.trace!.set(Number(id[1]), reason);
    const list = (excludedSamples[reason] ||= []);
    if (list.length < 8) list.push(label);
  };

  const taxById = new Map(source.taxonomies.map((t) => [t.id, t]));
  const catById = new Map(source.categories.map((c) => [c.id, c]));
  const mfgById = new Map(source.manufacturers.map((m) => [m.id, m.name]));
  const infoById = new Map(source.info.map((i) => [i.id, i]));
  const imagesById = new Map(source.images.map((i) => [i.id, i.images]));
  const stockById = source.stock && source.stock.length ? new Map(source.stock.map((s) => [s.id, s.quantity])) : null;

  const taxChainCache = new Map<number, Level[]>();
  const catChainCache = new Map<number, Level[]>();
  function chain(id: number | null, cache: Map<number, Level[]>, lookup: (id: number) => { name: string; parent: number | null } | undefined): Level[] {
    if (!id) return [];
    const cached = cache.get(id);
    if (cached) return cached;
    const out: Level[] = [];
    const seen = new Set<number>();
    let cur: number | null = id;
    while (cur && !seen.has(cur)) {
      const node = lookup(cur);
      if (!node) break;
      seen.add(cur);
      out.push({ id: cur, name: node.name, norm: normalizeText(node.name) });
      cur = node.parent && node.parent > 0 ? node.parent : null;
    }
    cache.set(id, out);
    return out;
  }
  const taxChain = (id: number | null) => chain(id, taxChainCache, (x) => {
    const t = taxById.get(x);
    return t ? { name: t.name, parent: t.parentTaxonomy ?? null } : undefined;
  });
  const catChain = (id: number | null) => chain(id, catChainCache, (x) => {
    const c = catById.get(x);
    return c ? { name: c.name, parent: c.parentCategory ?? null } : undefined;
  });

  const rootCats = new Set(config.source.rootCategoryIds);
  const rootTax = new Set(config.source.rootTaxonomyIds);
  const { route, primaries } = createRouter(config);
  const excludeCheck = createExcluder(config);

  const nearMisses = new Map<string, number>();
  const unrouted = new Map<string, number>();
  const routedTax = new Map<string, { count: number; to: string }>();
  let active = 0;
  let inScope = 0;
  const candidates: Candidate[] = [];

  let pool = source.products;
  if (options.limit && Number.isFinite(options.limit)) pool = pool.slice(0, options.limit);

  for (const p of pool) {
    const info = infoById.get(p.id);
    const rawName = info?.name?.trim() || "";
    const label = `${rawName || "(no name)"} [${p.id}]`;
    if (!p.active) {
      exclude("inactive", label);
      continue;
    }
    active++;
    const tax = taxChain(p.taxonomy);
    const cat = catChain(p.category);
    if (rootCats.size && !cat.some((l) => rootCats.has(l.id))) {
      exclude("outside-root", label);
      continue;
    }
    if (rootTax.size && !tax.some((l) => rootTax.has(l.id))) {
      exclude("outside-root", label);
      continue;
    }
    const knownSkus = [p.sku];
    const name = cleanProductName(rawName, knownSkus);
    const nameNorm = normalizeText(name);
    const taxPath = tax.map((l) => l.name).reverse().join(" > ");
    const catPath = cat.map((l) => l.name).reverse().join(" > ");
    const pathLabel = taxPath || catPath || "(no taxonomy)";

    const routed = route(tax, cat, nameNorm);
    if (!routed.route) {
      const reason = routed.reason || "out-of-scope";
      if (reason === "near-miss") bump(nearMisses, pathLabel);
      if (reason === "unrouted") bump(unrouted, pathLabel);
      exclude(reason, reason === "out-of-scope" && !options.trace ? null : `${label} <${pathLabel}>`);
      continue;
    }
    inScope++;

    const brandRaw = p.manufacturer ? mfgById.get(p.manufacturer) ?? null : null;
    const desc = cleanDescriptionHtml(info?.description, knownSkus);
    const hit = excludeCheck({
      taxonomy: tax.map((l) => l.name).reverse(),
      category: cat.map((l) => l.name).reverse(),
      name: rawName,
      description: desc.text,
      brand: brandRaw || "",
    });
    if (hit) {
      exclude(hit.rule, `${label} {${hit.keyword}}`);
      continue;
    }

    if (stockById && config.quality.requireInStock && (stockById.get(p.id) ?? 0) <= 0) {
      exclude("out-of-stock", label);
      continue;
    }
    if (!name || name.length < config.quality.minNameLength || !/[a-z]/i.test(name)) {
      exclude("no-name", label);
      continue;
    }
    if (name.length > config.quality.maxNameLength) {
      exclude("name-too-long", label);
      continue;
    }
    if (!looksEnglishName(name)) {
      exclude("name-not-english", label);
      continue;
    }
    const descProblem = descriptionProblem(desc.text, config.quality.minDescriptionChars);
    if (descProblem) {
      exclude(`description-${descProblem}`, label);
      continue;
    }
    const images = pickImages(imagesById.get(p.id) || [], config.quality);
    if (images.length < config.quality.minImages) {
      exclude("no-images", label);
      continue;
    }
    const retail = config.price.source === "inShopsPrice" ? p.inShopsPrice ?? 0 : p.retailPrice;
    const price = computePrice(retail, config.price);
    if (!(price > 0) || price < config.price.minRetail) {
      exclude("price-below-min", `${label} €${price}`);
      continue;
    }
    if (price > config.price.maxRetail) {
      exclude("price-above-max", `${label} €${price}`);
      continue;
    }
    if (p.wholesalePrice > 0 && price < p.wholesalePrice * config.price.minMarginOverWholesale) {
      exclude("low-margin", `${label} €${price} vs cost €${p.wholesalePrice}`);
      continue;
    }

    const brandPublic = publicBrand(brandRaw);
    const brand = brandPublic && !/^(?:generic|unbranded|no brand|sin marca|n\/a|none|other)$/i.test(brandPublic.trim()) ? brandPublic.trim() : null;
    const shortDescription = shortDescriptionFrom(desc.text);
    const leak = [name, desc.html, shortDescription, brand].some((v) => containsSupplierTrace(v, knownSkus));
    if (leak) {
      exclude("supplier-leak", label);
      continue;
    }
    const ean = p.ean13 && /^\d{13}$/.test(p.ean13) ? p.ean13 : null;
    const routeKey = `${pathLabel}`;
    const prev = routedTax.get(routeKey);
    routedTax.set(routeKey, { count: (prev?.count || 0) + 1, to: `${routed.route.primary}${routed.route.sub ? `/${routed.route.sub}` : ""}` });

    candidates.push({
      sourceId: p.id,
      sourceSku: p.sku,
      name,
      descriptionHtml: desc.html,
      descriptionText: desc.text,
      shortDescription,
      brand,
      price,
      costPrice: p.wholesalePrice > 0 ? round2(p.wholesalePrice) : null,
      weight: p.weight && p.weight > 0 ? p.weight : null,
      ean,
      quantity: stockById ? Math.max(0, Math.floor(stockById.get(p.id) ?? 0)) : 999,
      primary: routed.route.primary,
      sub: routed.route.sub,
      images,
      quality: qualityScore(images, desc.text, desc.html, ean, brand),
      taxonomyPath: pathLabel,
      coverWhite: images[0]?.whiteBackground ?? false,
      ...familyKeyOf(name),
    });
  }

  const passedFilters = candidates.length;
  const byQuality = (a: Candidate, b: Candidate) => b.quality - a.quality || a.sourceId - b.sourceId;

  candidates.sort(byQuality);
  const nameSeen = new Set<string>();
  const familyCount = new Map<string, number>();
  const deduped: Candidate[] = [];
  for (const c of candidates) {
    if (nameSeen.has(c.nameKey)) {
      exclude("duplicate-name", `${c.name} [${c.sourceId}]`);
      continue;
    }
    const fam = familyCount.get(c.familyKey) || 0;
    if (fam >= config.quality.maxVariantsPerName) {
      exclude("too-many-variants", `${c.name} [${c.sourceId}]`);
      continue;
    }
    nameSeen.add(c.nameKey);
    familyCount.set(c.familyKey, fam + 1);
    deduped.push(c);
  }

  const primaryMedians: Record<string, number> = {};
  for (const p of primaries) {
    const prices = deduped.filter((c) => c.primary === p.slug).map((c) => c.price);
    primaryMedians[p.slug] = round2(median(prices));
  }
  const primarySize = new Map<string, number>();
  for (const c of deduped) bump(primarySize, c.primary);
  const subPrices = new Map<string, number[]>();
  for (const c of deduped) if (c.sub) (subPrices.get(c.sub) || subPrices.set(c.sub, []).get(c.sub)!).push(c.price);
  const subMedians = new Map([...subPrices.entries()].map(([k, v]) => [k, { n: v.length, med: median(v) }]));
  const priced = deduped.filter((c) => {
    const sub = c.sub ? subMedians.get(c.sub) : undefined;
    const useSub = config.price.anomalyBasis === "subcategory" && sub && sub.n >= config.price.anomalyMinSample;
    const med = useSub ? round2(sub.med) : primaryMedians[c.primary];
    const sample = useSub ? sub.n : primarySize.get(c.primary) || 0;
    if (sample >= config.price.anomalyMinSample && med > 0 && c.price > med * config.price.anomalyFactor) {
      exclude("price-anomaly", `${c.name} [${c.sourceId}] €${c.price} vs median €${med}`);
      return false;
    }
    return true;
  });

  const limits = config.limits;
  const perPrimary = new Map<string, Candidate[]>();
  for (const p of primaries) perPrimary.set(p.slug, []);
  for (const c of priced) perPrimary.get(c.primary)?.push(c);

  const cappedPrimary = new Map<string, Candidate[]>();
  for (const p of primaries) {
    const list = perPrimary.get(p.slug) || [];
    const buckets = new Map<string, Candidate[]>();
    for (const c of list) {
      const key = c.sub || "";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(c);
    }
    for (const [key, items] of buckets) {
      if (key && items.length > limits.maxPerSub) {
        for (const c of items.slice(limits.maxPerSub)) exclude("cap-per-sub", `${c.name} [${c.sourceId}]`);
        buckets.set(key, items.slice(0, limits.maxPerSub));
      }
    }
    const kept: Candidate[] = [];
    const queues = [...buckets.values()].map((q) => [...q]);
    while (kept.length < limits.maxPerPrimary && queues.some((q) => q.length)) {
      for (const q of queues) {
        const next = q.shift();
        if (next && kept.length < limits.maxPerPrimary) kept.push(next);
      }
    }
    for (const q of queues) for (const c of q) exclude("cap-per-primary", `${c.name} [${c.sourceId}]`);
    cappedPrimary.set(p.slug, kept);
  }

  const totalCap = Math.max(0, limits.maxProducts);
  const totalQueues = primaries.map((p) => [...(cappedPrimary.get(p.slug) || [])]);
  const finalList: Candidate[] = [];
  while (finalList.length < totalCap && totalQueues.some((q) => q.length)) {
    for (const q of totalQueues) {
      const next = q.shift();
      if (next && finalList.length < totalCap) finalList.push(next);
    }
  }
  for (const q of totalQueues) for (const c of q) exclude("cap-total", `${c.name} [${c.sourceId}]`);

  const tree = finalizeTree(finalList, config, exclude);
  const allocate = createSlugAllocator();
  const products: SelectedProduct[] = [...tree.kept]
    .sort((a, b) => a.sourceId - b.sourceId)
    .map((c) => toSelected(c, allocate(c.name, storefrontSku(c.sourceId))))
    .filter((p) => {
      if (containsSupplierTrace(p.slug, [p.sourceSku])) {
        exclude("supplier-leak", `${p.name} [${p.sourceId}]`);
        return false;
      }
      return true;
    });

  const categories = buildCategoryNodes(products, config, tree.demoted);
  const brandCounts = new Map<string, number>();
  for (const p of products) if (p.brand) bump(brandCounts, p.brand);
  const brands = [...brandCounts.entries()]
    .filter(([, count]) => count >= config.brands.minProducts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, config.brands.showcaseLimit)
    .map(([name, count]) => ({ name, count }));

  return {
    products,
    categories,
    excluded,
    excludedSamples,
    demotedSubs: tree.demotedList,
    droppedPrimaries: tree.dropped,
    emptySubs: tree.empty,
    nearMisses: topPaths(nearMisses, 40),
    unrouted: topPaths(unrouted, 40),
    routedTaxonomies: [...routedTax.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 80).map(([path, v]) => ({ path, count: v.count, to: v.to })),
    primaryMedians,
    brands,
    stats: {
      sourceProducts: source.products.length,
      active,
      inScope,
      passedFilters,
      selected: products.length,
      stockKnown: Boolean(stockById),
    },
  };
}

function toSelected(c: Candidate, slug: string): SelectedProduct {
  return {
    sourceId: c.sourceId,
    sourceSku: c.sourceSku,
    sku: storefrontSku(c.sourceId),
    name: c.name,
    slug,
    descriptionHtml: c.descriptionHtml,
    descriptionText: c.descriptionText,
    shortDescription: c.shortDescription,
    brand: c.brand,
    price: c.price,
    costPrice: c.costPrice,
    weight: c.weight,
    ean: c.ean,
    quantity: c.quantity,
    primary: c.primary,
    sub: c.sub,
    images: c.images,
    quality: c.quality,
    taxonomyPath: c.taxonomyPath,
  };
}

export function finalizeTree<T extends { primary: string; sub: string | null; name: string; sourceId: number }>(
  items: T[],
  config: CatalogConfig,
  exclude: (reason: string, label: string | null) => void,
): {
  kept: T[];
  demoted: Set<string>;
  demotedList: Array<{ slug: string; name: string; primary: string; count: number }>;
  dropped: Array<{ slug: string; name: string; count: number }>;
  empty: Array<{ slug: string; primary: string }>;
} {
  const demoted = new Set<string>();
  const demotedList: Array<{ slug: string; name: string; primary: string; count: number }> = [];
  const dropped: Array<{ slug: string; name: string; count: number }> = [];
  const empty: Array<{ slug: string; primary: string }> = [];
  const kept: T[] = [];
  for (const p of config.storefront) {
    const inPrimary = items.filter((c) => c.primary === p.slug);
    if (inPrimary.length < config.limits.minPerPrimary) {
      dropped.push({ slug: p.slug, name: p.name, count: inPrimary.length });
      for (const c of inPrimary) exclude("primary-below-min", `${c.name} [${c.sourceId}] in ${p.slug}`);
      continue;
    }
    for (const s of p.subs) {
      const count = inPrimary.filter((c) => c.sub === s.slug).length;
      if (count === 0) empty.push({ slug: s.slug, primary: p.slug });
      else if (count < config.limits.minPerSub) {
        demoted.add(s.slug);
        demotedList.push({ slug: s.slug, name: s.name, primary: p.slug, count });
      }
    }
    for (const c of inPrimary) {
      if (c.sub && demoted.has(c.sub)) c.sub = null;
      kept.push(c);
    }
  }
  return { kept, demoted, demotedList, dropped, empty };
}

export function buildCategoryNodes(products: SelectedProduct[], config: CatalogConfig, demoted: Set<string>): CategoryNode[] {
  const nodes: CategoryNode[] = [];
  const usedArt = new Set<string>();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const rank = (a: SelectedProduct, b: SelectedProduct) =>
    Number(b.images[0]?.whiteBackground ?? false) - Number(a.images[0]?.whiteBackground ?? false) || b.quality - a.quality || a.sourceId - b.sourceId;
  const pickArt = (pool: SelectedProduct[], pinned: string | null | undefined): { slug: string | null; pinned: boolean } => {
    if (pinned && bySlug.has(pinned) && pool.some((p) => p.slug === pinned)) {
      usedArt.add(pinned);
      return { slug: pinned, pinned: true };
    }
    const best = [...pool].sort(rank).find((p) => !usedArt.has(p.slug)) ?? null;
    if (best) usedArt.add(best.slug);
    return { slug: best?.slug ?? null, pinned: false };
  };

  config.storefront.forEach((p, i) => {
    const inPrimary = products.filter((x) => x.primary === p.slug);
    if (!inPrimary.length) return;
    const subSizes = new Map<string, number>();
    for (const x of inPrimary) if (x.sub) subSizes.set(x.sub, (subSizes.get(x.sub) || 0) + 1);
    const largest = [...subSizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const representative = largest ? inPrimary.filter((x) => x.sub === largest) : inPrimary;
    const art = p.categoryArt && inPrimary.some((x) => x.slug === p.categoryArt) ? pickArt(inPrimary, p.categoryArt) : pickArt(representative, null);
    nodes.push({ slug: p.slug, name: p.name, description: p.description ?? null, parentSlug: null, sortOrder: i, productCount: inPrimary.length, artProductSlug: art.slug, artPinned: art.pinned });
  });
  config.storefront.forEach((p) => {
    p.subs.forEach((s, j) => {
      if (demoted.has(s.slug)) return;
      const inSub = products.filter((x) => x.primary === p.slug && x.sub === s.slug);
      if (!inSub.length) return;
      const art = pickArt(inSub, s.categoryArt);
      nodes.push({ slug: s.slug, name: s.name, description: s.description ?? null, parentSlug: p.slug, sortOrder: j, productCount: inSub.length, artProductSlug: art.slug, artPinned: art.pinned });
    });
  });
  return nodes;
}

export function buildPreview(result: SelectionResult, meta: Record<string, unknown>) {
  const productsBySlug = new Map(result.products.map((p) => [p.slug, p]));
  const sample = (list: SelectedProduct[]) =>
    [...list]
      .sort((a, b) => b.quality - a.quality || a.sourceId - b.sourceId)
      .slice(0, 5)
      .map((p) => ({ name: p.name, slug: p.slug, sku: p.sku, price: p.price, brand: p.brand, images: p.images.length, quality: p.quality, sourceTaxonomy: p.taxonomyPath }));
  const tree = result.categories
    .filter((c) => !c.parentSlug)
    .map((c) => {
      const inPrimary = result.products.filter((p) => p.primary === c.slug);
      return {
        slug: c.slug,
        name: c.name,
        count: c.productCount,
        medianPrice: result.primaryMedians[c.slug] ?? null,
        categoryArt: c.artProductSlug ? { productSlug: c.artProductSlug, pinned: c.artPinned, product: productsBySlug.get(c.artProductSlug)?.name ?? null } : null,
        directOnly: inPrimary.filter((p) => !p.sub).length,
        samples: sample(inPrimary),
        subs: result.categories
          .filter((s) => s.parentSlug === c.slug)
          .map((s) => ({
            slug: s.slug,
            name: s.name,
            count: s.productCount,
            categoryArt: s.artProductSlug ? { productSlug: s.artProductSlug, pinned: s.artPinned } : null,
            samples: sample(inPrimary.filter((p) => p.sub === s.slug)),
          })),
      };
    });
  const excludedTotal = Object.entries(result.excluded).filter(([k]) => !k.endsWith("-sample")).reduce((sum, [, n]) => sum + n, 0);
  return {
    ...meta,
    totals: {
      ...result.stats,
      excluded: excludedTotal,
      topLevelCategories: tree.length,
      subcategories: result.categories.filter((c) => c.parentSlug).length,
      brandsInShowcase: result.brands.length,
    },
    excludedByRule: Object.fromEntries(Object.entries(result.excluded).filter(([k]) => !k.endsWith("-sample")).sort((a, b) => b[1] - a[1])),
    tree,
    demotedSubcategories: result.demotedSubs,
    droppedTopLevel: result.droppedPrimaries,
    emptySubcategories: result.emptySubs,
    brands: result.brands,
    review: {
      excludedSamples: result.excludedSamples,
      nearMissTaxonomies: result.nearMisses,
      unroutedTaxonomies: result.unrouted,
      routedTaxonomies: result.routedTaxonomies,
    },
  };
}
