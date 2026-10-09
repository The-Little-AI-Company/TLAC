// @ts-check
// Renders public/og.png, the 1200x630 social card, with Playwright.
//
// Run it from the repository root after `pnpm install`:
//
//   node scripts/og.mjs
//
// The card is built as an HTML string and screenshotted in Chromium. Colors come from the
// :root block of src/styles/tokens.css, the mark from src/components/mark-path.mjs (the module
// Mark.astro draws too), and the fonts from public/fonts/ (embedded as base64, so nothing is
// fetched). Chromium is the one Playwright already has installed; this script never runs
// `playwright install`.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { markPath, markViewBox } from '../src/components/mark-path.mjs';

const root = new URL('../', import.meta.url);
const path = (/** @type {string} */ p) => fileURLToPath(new URL(p, root));
const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 80; // the card's padding: the mark, the wordmark, the rule and the line all start at this x
const MARK = 72; // the mark's rendered size in px
const OUT = path('public/og.png');

// The light tokens. Only the first :root block is read: the dark values sit inside a media query.
const tokensCss = readFileSync(path('src/styles/tokens.css'), 'utf-8');
const rootBlock = tokensCss.match(/:root\s*\{([^}]*)\}/)?.[1];
if (!rootBlock) throw new Error('no :root block in src/styles/tokens.css');
const tokens = [...rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
  ([, name = '', value = '']) => `${name}: ${value.trim()};`,
);
for (const name of ['--ground', '--ink', '--ink-soft', '--ink-faint', '--rule', '--font-display', '--font-text']) {
  if (!tokens.some((t) => t.startsWith(`${name}:`))) throw new Error(`${name} is missing from tokens.css`);
}

/**
 * @param {string} family
 * @param {string} file
 * @param {string} weight
 */
const fontFace = (family, file, weight) => {
  const data = readFileSync(path(`public/fonts/${file}`)).toString('base64');
  return `@font-face { font-family: "${family}"; src: url(data:font/woff2;base64,${data}) format("woff2"); font-weight: ${weight}; font-style: normal; font-display: block; }`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
:root { color-scheme: light; ${tokens.join(' ')} }
${fontFace('Instrument Serif', 'instrument-serif-latin.woff2', '400')}
${fontFace('Instrument Sans', 'instrument-sans-latin.woff2', '400 700')}
html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
p { margin: 0; }
body { background: var(--ground); color: var(--ink); font-family: var(--font-text); -webkit-font-smoothing: antialiased; }
.card { box-sizing: border-box; width: ${WIDTH}px; height: ${HEIGHT}px; padding: ${PAD}px; display: flex; flex-direction: column; }
.mark { width: ${MARK}px; height: ${MARK}px; color: var(--ink); }
.mark svg { display: block; width: ${MARK}px; height: ${MARK}px; }
.lockup { margin-top: auto; }
.name { font-family: var(--font-display); font-weight: 400; font-size: 64px; line-height: 1; letter-spacing: -0.005em; color: var(--ink); }
.rule { height: 1px; margin: 36px 0 32px; background: var(--rule); }
.line { font-family: var(--font-display); font-weight: 400; font-size: 40px; line-height: 1.15; color: var(--ink-soft); }
.site { margin-top: 72px; font-family: var(--font-text); font-size: 20px; line-height: 1.4; color: var(--ink-faint); }
</style>
</head>
<body>
<div class="card">
  <div class="mark"><svg viewBox="${markViewBox}" aria-hidden="true"><path id="mark" fill="currentColor" fill-rule="evenodd" d="${markPath}"></path></svg></div>
  <div class="lockup">
    <p class="name">The Little AI Company</p>
    <div class="rule"></div>
    <p class="line">Tools for the work you keep doing by hand.</p>
  </div>
  <p class="site">littleaicompany.com</p>
</div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  await page.setContent(html, { waitUntil: 'load' });
  const { bearing } = await page.evaluate(
    async ({ mark }) => {
      // load() resolves to the faces it matched, and an empty list means no @font-face covers the family.
      // check() alone is true for a family with no faces, so both tests run.
      const fonts = [
        { name: 'Instrument Serif', load: '400 64px "Instrument Serif"', check: '64px "Instrument Serif"' },
        { name: 'Instrument Sans', load: '400 20px "Instrument Sans"', check: '20px "Instrument Sans"' },
      ];
      const matched = await Promise.all(fonts.map((f) => document.fonts.load(f.load)));
      await document.fonts.ready;
      fonts.forEach((f, i) => {
        if (matched[i]?.length === 0 || !document.fonts.check(f.check)) {
          throw new Error(`${f.name} did not load, so the card would render in a fallback face`);
        }
      });

      // getBBox() is the path's own ink box, in viewBox units. Its left edge sits inside the viewBox (the
      // side bearing), so shift the SVG left by that amount: the ink then starts at the padding edge.
      const shape = document.getElementById('mark');
      if (!(shape instanceof SVGPathElement) || !shape.ownerSVGElement) throw new Error('the mark path is missing');
      const svg = shape.ownerSVGElement;
      const scale = mark / svg.viewBox.baseVal.width;
      const bearing = shape.getBBox().x * scale;
      svg.style.marginLeft = `${-bearing}px`;
      return { bearing };
    },
    { mark: MARK },
  );
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  writeFileSync(OUT, png);
  console.log(`wrote ${OUT} (${WIDTH}x${HEIGHT}, ${png.length} bytes, mark shifted left ${bearing.toFixed(2)}px)`);
} finally {
  await browser.close();
}
