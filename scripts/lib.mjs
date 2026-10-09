// @ts-check
// What scripts/og.mjs (`pnpm og`) and scripts/icons.mjs (`pnpm icons`) share: where the repository root is, the
// light design tokens, and the skull bunny mark as SVG. Nothing here runs by itself.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { markFillRule, markPath } from '../src/components/mark-path.mjs';

export { markViewBox } from '../src/components/mark-path.mjs';

const root = new URL('../', import.meta.url);

/**
 * A path in the repository as an absolute file path.
 * @param {string} p relative to the repository root, such as `public/og.png`
 */
export const fromRoot = (p) => fileURLToPath(new URL(p, root));

/**
 * The light tokens: every custom property of the first :root block of src/styles/tokens.css, by name
 * (`--ground`). Only the first block is read, because the dark values sit inside a media query.
 * @returns {Map<string, string>}
 */
export function tokens() {
  const css = readFileSync(fromRoot('src/styles/tokens.css'), 'utf-8');
  const block = css.match(/:root\s*\{([^}]*)\}/)?.[1];
  if (!block) throw new Error('no :root block in src/styles/tokens.css');
  return new Map([...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name = '', value = '']) => [name, value.trim()]));
}

/**
 * The mark's <path>, with the fill rule it needs. The attributes come out in a fixed order.
 * @param {{ fill: string, id?: string, transform?: string }} attributes
 */
export function markPathTag({ fill, id, transform }) {
  const optional = [id && `id="${id}"`, transform && `transform="${transform}"`].filter(Boolean);
  return `<path ${[...optional, `fill="${fill}"`, `fill-rule="${markFillRule}"`, `d="${markPath}"`].join(' ')}/>`;
}
