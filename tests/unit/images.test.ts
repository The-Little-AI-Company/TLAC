/**
 * SPEC sections 5, 8 and 10: every <img> is accessible, sized, and loads a file that exists;
 * the staged images are in place byte for byte.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { all, describe as show, type El } from '../helpers/dom';
import { DIST, PAGE_CASES, PAGES, PUBLIC, listFiles, parsePage, resolveSitePath, sha256, srcsetUrls } from '../helpers/dist';
import { readWebp } from '../helpers/image';
import { IMAGES } from '../helpers/spec';

const localFile = (src: string): string | undefined => (src.startsWith('/') && !src.startsWith('//') ? resolveSitePath(src) : undefined);
const positiveInt = (value: string | undefined): boolean => value !== undefined && /^[1-9]\d*$/.test(value);
const size = (el: El): { w: number; h: number } => ({ w: Number(el.getAttribute('width')), h: Number(el.getAttribute('height')) });

describe.each(PAGE_CASES)('images on %s', (_label, info) => {
  const doc = () => parsePage(info);
  const imgs = (): El[] => all(doc(), 'img');

  it('give every <img> alt text (empty alt only when the image is aria-hidden)', () => {
    const bad: string[] = [];
    for (const img of imgs()) {
      const alt = img.getAttribute('alt');
      if (alt === undefined || alt === null) bad.push(`${show(img)} has no alt attribute`);
      else if (alt.trim() === '') {
        if (!img.closest('[aria-hidden="true"]')) bad.push(`${show(img)} has empty alt outside an aria-hidden element`);
      } else {
        if (alt.length > 200) bad.push(`${show(img)} alt is ${alt.length} characters`);
        if (/\.(?:webp|png|jpe?g|svg)\b|^(?:image|photo|picture|graphic|screenshot)$/i.test(alt.trim())) bad.push(`${show(img)} alt looks like a file name`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('give every <img> and <source> explicit width and height, and decode images async', () => {
    const bad: string[] = [];
    for (const img of imgs()) {
      if (!positiveInt(img.getAttribute('width')) || !positiveInt(img.getAttribute('height'))) bad.push(`${show(img)} needs integer width and height`);
      if (img.getAttribute('decoding') !== 'async') bad.push(`${show(img)} needs decoding="async"`);
    }
    for (const source of all(doc(), 'picture source')) {
      if (!positiveInt(source.getAttribute('width')) || !positiveInt(source.getAttribute('height'))) bad.push(`${show(source)} needs integer width and height`);
    }
    expect(bad).toEqual([]);
  });

  it('declare the width and height of the file they load (no layout shift, no stretched pixels)', () => {
    const bad: string[] = [];
    const check = (el: El, src: string): void => {
      const file = localFile(src);
      if (!file || !file.endsWith('.webp')) return;
      const real = readWebp(readFileSync(join(DIST, file)));
      const { w, h } = size(el);
      if (w !== real.width || h !== real.height) bad.push(`${show(el)} says ${w}x${h}, ${file} is ${real.width}x${real.height}`);
    };
    for (const img of imgs()) check(img, img.getAttribute('src') ?? '');
    for (const source of all(doc(), 'picture source')) srcsetUrls(source.getAttribute('srcset') ?? '').forEach((u) => check(source, u));
    expect(bad).toEqual([]);
  });

  it('have at most one fetchpriority="high" image, and it is not lazy', () => {
    const high = imgs().filter((i) => i.getAttribute('fetchpriority') === 'high');
    expect(high.length, 'more than one fetchpriority="high" image').toBeLessThanOrEqual(1);
    for (const img of high) expect(img.getAttribute('loading'), show(img)).not.toBe('lazy');
    expect(imgs().filter((i) => i.hasAttribute('fetchpriority') && i.getAttribute('fetchpriority') !== 'high').map(show)).toEqual([]);
  });

  it('load lazily unless they are the eager hero image', () => {
    const bad = imgs().filter((i) => i.getAttribute('fetchpriority') !== 'high' && i.getAttribute('loading') !== 'lazy');
    expect(bad.map(show)).toEqual([]);
  });

  it('only point at files that exist in dist/', () => {
    const missing: string[] = [];
    for (const img of imgs()) {
      const src = img.getAttribute('src') ?? '';
      if (!src.startsWith('/')) missing.push(`${show(img)} src must be a site path, got "${src}"`);
      else if (!localFile(src)) missing.push(`${src} is not in dist/`);
    }
    for (const source of all(doc(), 'picture source')) {
      for (const url of srcsetUrls(source.getAttribute('srcset') ?? '')) if (!localFile(url)) missing.push(`${url} (srcset) is not in dist/`);
    }
    expect(missing).toEqual([]);
  });

  it('are WebP files', () => {
    const notWebp = imgs().map((i) => i.getAttribute('src') ?? '').filter((src) => !src.endsWith('.webp'));
    expect(notWebp).toEqual([]);
  });
});

describe('the staged images', () => {
  const entries = Object.entries(IMAGES).map(([name, image]) => [name, image] as const);

  it('are the only files in public/images and dist/images', () => {
    const expected = entries.map(([, i]) => i.src.replace('/images/', '')).sort();
    expect(listFiles(join(PUBLIC, 'images'))).toEqual(expected);
    expect(listFiles(join(DIST, 'images'))).toEqual(expected);
  });

  describe.each(entries)('%s', (_name, image) => {
    const path = join(PUBLIC, image.src);

    it('is the staged file, byte for byte', () => {
      expect(existsSync(path), `${image.src} missing`).toBe(true);
      expect(sha256(readFileSync(path))).toBe(image.sha256);
    });

    it(`is ${image.width}x${image.height}`, () => {
      const { width, height } = readWebp(readFileSync(path));
      expect([width, height]).toEqual([image.width, image.height]);
    });
  });

  it('keeps the transparency of both mascot files (no box behind the mascot)', () => {
    for (const image of [IMAGES.mascot760, IMAGES.mascot640]) {
      expect(readWebp(readFileSync(join(PUBLIC, image.src))).alpha, image.src).toBe(true);
    }
  });

  it('are each used by a page (nothing orphaned)', () => {
    const used = new Set<string>();
    for (const info of PAGES) {
      if (!existsSync(join(DIST, info.file))) continue;
      const doc = parsePage(info);
      for (const img of all(doc, 'img')) used.add(img.getAttribute('src') ?? '');
      for (const source of all(doc, 'picture source')) srcsetUrls(source.getAttribute('srcset') ?? '').forEach((u) => used.add(u));
    }
    expect(entries.map(([, i]) => i.src).filter((src) => !used.has(src))).toEqual([]);
  });
});
