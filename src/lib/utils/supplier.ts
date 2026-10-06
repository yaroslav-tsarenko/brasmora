const SUPPLIER_LINES = [
  "accessories", "baby", "beauty", "car", "christmas", "cooking", "fashion", "gadget", "garden",
  "health", "home", "kids", "kitchen", "office", "outdoor", "party", "pets", "sport", "sports",
  "tech", "tools", "toys", "wellness",
];

const SUPPLIER_TEST = /big\s*-?\s*bu[yi]/i;

const SUPPLIER_PHRASE = new RegExp(
  `\\s*(?:from|by|via)?\\s*\\bbig\\s*-?\\s*bu[yi]\\b(?:\\s+(?:${SUPPLIER_LINES.join("|")})\\b)?`,
  "gi"
);

export function mentionsSupplier(value: string | null | undefined): boolean {
  return Boolean(value && SUPPLIER_TEST.test(value));
}

export function publicBrand(brand: string | null | undefined): string | null {
  if (!brand || mentionsSupplier(brand)) return null;
  return brand;
}

export function stripSupplierMentions(value: string): string {
  if (!mentionsSupplier(value)) return value;
  return value
    .replace(SUPPLIER_PHRASE, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?)])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/^[\s,.;:\-–—|]+|[\s,;:\-–—|]+$/g, "")
    .trim();
}

export function publicText(value: string | null | undefined): string | null {
  if (!value) return value ?? null;
  return mentionsSupplier(value) ? null : value;
}

const CLEARED_KEYS = new Set(["brand", "subtitle", "badgeText", "ctaLabel", "discountText", "alt"]);

const STRIPPED_KEYS = new Set([
  "name", "title", "description", "shortDescription", "metaTitle", "metaDescription",
  "label", "content", "viewAllLabel", "productName", "variantName",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sanitizeCharacteristics(value: unknown): unknown {
  if (!isPlainObject(value)) return value;
  const cleaned: Record<string, unknown> = {};
  for (const [group, entries] of Object.entries(value)) {
    if (isPlainObject(entries)) {
      const kept: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(entries)) {
        if (typeof entry === "string" && mentionsSupplier(entry)) continue;
        kept[stripSupplierMentions(key) || key] = entry;
      }
      if (Object.keys(kept).length) cleaned[stripSupplierMentions(group) || group] = kept;
    } else if (!(typeof entries === "string" && mentionsSupplier(entries))) {
      cleaned[group] = entries;
    }
  }
  return cleaned;
}

export function sanitizeSupplierData<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((entry) => sanitizeSupplierData(entry));
    return value;
  }
  if (!isPlainObject(value)) return value;

  const record: Record<string, unknown> = value;
  for (const [key, entry] of Object.entries(record)) {
    if (key === "characteristics") {
      record[key] = sanitizeCharacteristics(entry);
    } else if (typeof entry === "string") {
      if (!mentionsSupplier(entry)) continue;
      if (CLEARED_KEYS.has(key)) record[key] = null;
      else if (STRIPPED_KEYS.has(key)) record[key] = stripSupplierMentions(entry);
    } else if (typeof entry === "object" && entry !== null) {
      sanitizeSupplierData(entry);
    }
  }
  return value;
}
