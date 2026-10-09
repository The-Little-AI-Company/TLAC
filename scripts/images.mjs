// @ts-check
// Writes the smaller WebP variants that srcset serves to narrow screens:
// 320px project thumbnails (drawn at 150px, 88px on phones) and 640px Vivary
// plates for phones. Run with `pnpm images` after replacing a source image.
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = fileURLToPath(new URL('../public/images/', import.meta.url));

/** @type {[source: string, width: number][]} */
const variants = [
  ['open-world-factbook-2026-10-08', 320],
  ['llm-arcade-jeffkazzee-dev', 320],
  ['puckwork-jeffkazzee-dev', 320],
  ['neon-noir-2026-10-08', 320],
  ['vivary-workspace-2026-10-03', 640],
  ['vivary-site-2026-10-08', 640],
];

for (const [name, width] of variants) {
  const out = `${dir}${name}-${width}.webp`;
  const { height, size } = await sharp(`${dir}${name}.webp`)
    .resize({ width })
    .webp({ quality: 80, effort: 6 })
    .toFile(out);
  console.log(`${name}-${width}.webp ${width}x${height} ${(size / 1024).toFixed(1)} KB`);
}
