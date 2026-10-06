import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `<svg width="512" height="512" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="16" fill="#2E5E4E"/>
  <ellipse cx="20" cy="20" rx="6.5" ry="16" fill="none" stroke="#F4F2ED" stroke-width="2" stroke-opacity="0.85"/>
  <path d="M5.5 24.5 C 12 19.5, 28 19.5, 34.5 24.5" fill="none" stroke="#F4F2ED" stroke-width="2" stroke-opacity="0.85"/>
  <circle cx="31" cy="11.5" r="5" fill="#A5561F" stroke="#F4F2ED" stroke-width="2"/>
</svg>`;

// Slightly optimized bitmap version for very small icon sizes — thicker strokes
const svgSmall = `<svg width="64" height="64" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="17" fill="#2E5E4E"/>
  <circle cx="20" cy="21" r="9" fill="none" stroke="#F4F2ED" stroke-width="3.5"/>
  <circle cx="28.5" cy="12" r="5" fill="#A5561F" stroke="#F4F2ED" stroke-width="2.5"/>
</svg>`;

const targets = [
  { size: 16,  name: "favicon-16x16.png",         source: svgSmall },
  { size: 32,  name: "favicon-32x32.png",         source: svgSmall },
  { size: 180, name: "apple-touch-icon.png",      source: svg },
  { size: 192, name: "android-chrome-192x192.png", source: svg },
  { size: 512, name: "android-chrome-512x512.png", source: svg },
];

for (const { size, name, source } of targets) {
  const buf = await sharp(Buffer.from(source))
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(join(publicDir, name), buf);
  console.log("Generated", name);
}

// favicon.ico — 32x32 PNG (browsers accept PNG referenced via link tag)
const ico32 = await sharp(Buffer.from(svgSmall)).resize(32, 32).png().toBuffer();
await writeFile(join(publicDir, "favicon.ico"), ico32);
console.log("Generated favicon.ico (32x32 PNG)");
