// @ts-check
// Renders the app icons from the shared mark: public/apple-touch-icon.png (180px), public/icon-192.png
// and public/icon-512.png. Each is an opaque square of --ground with the mark in --ink, centered, its
// longer side 62% of the square, so the clear space is wider than an ear and the 512px mark stays
// inside the central 80% that maskable cropping keeps. Run it with `pnpm icons`.

import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { fromRoot, markPathTag, markViewBox, tokens } from './lib.mjs';

const SHARE = 0.62; // the mark's longer side as a share of the square
const SAMPLE = 1024; // the path is rasterized at this size to find its ink box

const light = tokens();
/** @param {string} name */
const token = (name) => {
  const value = light.get(name) ?? '';
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${name} is not a hex colour in tokens.css`);
  return value;
};
const ground = token('--ground');
const ink = token('--ink');

/**
 * The mark's ink box in viewBox units, found by rasterizing the path and reading its alpha.
 * @returns {Promise<{ x: number, y: number, width: number, height: number }>}
 */
async function markBox() {
  const [vx = 0, vy = 0, vw = 0] = markViewBox.split(/\s+/).map(Number);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SAMPLE}" height="${SAMPLE}" viewBox="${markViewBox}">${markPathTag({ fill: '#000' })}</svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if ((data[(y * info.width + x) * 4 + 3] ?? 0) >= 128) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) throw new Error('the mark rasterized empty');
  const unit = vw / info.width; // viewBox units per sample pixel
  return { x: vx + minX * unit, y: vy + minY * unit, width: (maxX - minX + 1) * unit, height: (maxY - minY + 1) * unit };
}

/**
 * @param {number} size
 * @param {{ x: number, y: number, width: number, height: number }} box
 */
function iconSvg(size, box) {
  const scale = (size * SHARE) / Math.max(box.width, box.height); // px per viewBox unit
  const dx = (size - box.width * scale) / 2 - box.x * scale;
  const dy = (size - box.height * scale) / 2 - box.y * scale;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${ground}"/>` +
    markPathTag({ transform: `translate(${dx.toFixed(3)} ${dy.toFixed(3)}) scale(${scale.toFixed(5)})`, fill: ink }) +
    '</svg>'
  );
}

/** @type {[file: string, size: number][]} */
const icons = [
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
];

const box = await markBox();
for (const [file, size] of icons) {
  // flatten() drops the alpha channel: iOS fills transparent pixels with black, so the icon must be opaque.
  const png = await sharp(Buffer.from(iconSvg(size, box)), { density: 72 })
    .flatten({ background: ground })
    .png()
    .toBuffer();
  const meta = await sharp(png).metadata();
  if (meta.hasAlpha || meta.width !== size || meta.height !== size) {
    throw new Error(`${file} must be an opaque ${size}px square`);
  }
  writeFileSync(fromRoot(file), png);
  console.log(`wrote ${file} (${size}x${size}, ${png.length} bytes, opaque)`);
}
