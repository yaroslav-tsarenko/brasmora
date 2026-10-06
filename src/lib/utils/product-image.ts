const PLACEHOLDER_BASE = "https://placehold.co";

/* Placeholder art direction follows the Forest & Stone brand: a rotation of
 * pine, sage, copper and stone grounds. The swatch is picked by hashing the
 * product name, so two neighbouring cards almost never share the same image. */
const PLACEHOLDER_SWATCHES = [
  "2E5E4E/F4F2ED",
  "1E2420/E4EEE9",
  "A5561F/F6EADF",
  "6F756D/FFFFFF",
  "8FB3A3/1E2420",
  "ECE8DF/2E5E4E",
  "52290E/F2DDC8",
  "234A3D/E4EEE9",
];

function swatchFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_SWATCHES[h % PLACEHOLDER_SWATCHES.length];
}

export function getProductImage(
  imageUrl: string | null | undefined,
  productName?: string,
  size = "400x400"
): string {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/"))) {
    return imageUrl;
  }

  const name = productName || "Product";
  const label = encodeURIComponent(name.slice(0, 20));
  return `${PLACEHOLDER_BASE}/${size}/${swatchFor(name)}?text=${label}`;
}

export function getProductImageFallback(size = "400x400"): string {
  return `${PLACEHOLDER_BASE}/${size}/ECE8DF/6F756D?text=No+Image`;
}
