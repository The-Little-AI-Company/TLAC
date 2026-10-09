/**
 * Page weight budget: a page is HTML, CSS, fonts and the images it loads eagerly, and together
 * they stay at or under 300 KB. Every image in public/images stays at or under 100 KB.
 * (KB here is 1000 bytes, the stricter reading.)
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { all } from '../helpers/dom';
import { PAGE_CASES, PUBLIC, distPath, listFiles, page, pageStylesheets, parsePage, resolveSitePath, srcsetUrls, type PageInfo } from '../helpers/dist';

const KB = 1000;
const PAGE_BUDGET = 300 * KB;
const IMAGE_BUDGET = 100 * KB;

const sizeOfSitePath = (path: string): number => {
  const file = resolveSitePath(path);
  if (!file) throw new Error(`${path} is not in dist/`);
  return statSync(distPath(file)).size;
};

interface Weight {
  html: number;
  css: number;
  fonts: number;
  images: number;
  total: number;
}

/** Bytes a first visit downloads: the HTML, linked CSS, every font the CSS declares, and eager images. */
function weigh(info: PageInfo): Weight {
  const doc = parsePage(info);
  const html = statSync(distPath(info.file)).size;
  const css = pageStylesheets(info)
    .filter((s) => !s.source.endsWith('<style>')) // inline styles are already part of the HTML
    .reduce((sum, s) => sum + statSync(distPath(s.source)).size, 0);

  const fontUrls = new Set<string>();
  for (const sheet of pageStylesheets(info)) {
    for (const m of sheet.css.matchAll(/url\(\s*["']?([^)"']+\.woff2?)["']?\s*\)/g)) fontUrls.add(m[1] ?? '');
  }
  const fonts = [...fontUrls].reduce((sum, url) => sum + sizeOfSitePath(url), 0);

  let images = 0;
  for (const img of all(doc, 'img')) {
    if (img.getAttribute('loading') === 'lazy') continue;
    const candidates = [img.getAttribute('src') ?? ''];
    const picture = img.closest('picture');
    if (picture) for (const source of all(picture, 'source')) candidates.push(...srcsetUrls(source.getAttribute('srcset') ?? ''));
    // Only one candidate downloads. Count the biggest, which is the desktop case.
    images += Math.max(...candidates.filter(Boolean).map(sizeOfSitePath));
  }
  return { html, css, fonts, images, total: html + css + fonts + images };
}

describe('page weight', () => {
  it.each(PAGE_CASES)(`%s stays within ${PAGE_BUDGET / KB} KB of HTML, CSS, fonts and eager images`, (_label, info) => {
    const w = weigh(info);
    const report = `html ${w.html}, css ${w.css}, fonts ${w.fonts}, eager images ${w.images} = ${w.total} bytes`;
    expect(w.total, report).toBeLessThanOrEqual(PAGE_BUDGET);
  });

  it('counts the three fonts and the mascot on the home page (the budget check sees what loads)', () => {
    const home = weigh(page('home'));
    expect(home.fonts, 'the home page should declare the three Instrument fonts').toBeGreaterThan(60 * KB);
    expect(home.images, 'the home page loads the mascot eagerly').toBeGreaterThan(40 * KB);
  });
});

describe('image weight', () => {
  const images = () => listFiles(join(PUBLIC, 'images'));

  it('has images to weigh', () => {
    expect(images().length).toBeGreaterThanOrEqual(8);
  });

  it('keeps every image in public/images at or under 100 KB', () => {
    const heavy = images()
      .map((f) => [f, statSync(join(PUBLIC, 'images', f)).size] as const)
      .filter(([, size]) => size > IMAGE_BUDGET);
    expect(heavy.map(([f, size]) => `${f}: ${size} bytes`)).toEqual([]);
  });
});
