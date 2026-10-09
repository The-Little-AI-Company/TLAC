/**
 * Every <img> is accessible, sized, and loads a file that exists, and the image files in public/
 * have the sizes, proportions and weights the pages rely on.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { all, show, type El } from '../helpers/dom';
import { DIST, PAGE_CASES, PAGES, PUBLIC, listFiles, parsePage, resolveSitePath, srcsetUrls } from '../helpers/dist';
import { readWebp } from '../helpers/image';
import { IMAGES, IMAGE_COUNT, IMAGE_VARIANTS } from '../helpers/spec';

const localFile = (src: string): string | undefined => (src.startsWith('/') && !src.startsWith('//') ? resolveSitePath(src) : undefined);
const positiveInt = (value: string | undefined): boolean => value !== undefined && /^[1-9]\d*$/.test(value);
const size = (el: El): { w: number; h: number } => ({ w: Number(el.getAttribute('width')), h: Number(el.getAttribute('height')) });

describe.each(PAGE_CASES)('images on %s', (_label, info) => {
  const doc = () => parsePage(info);
  const imgs = (): El[] => all(doc(), 'img');

  it('are exactly the images this page is meant to show', () => {
    expect(imgs().length).toBe(IMAGE_COUNT[info.id]);
  });

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

  it('serve each size from a file of that width: a srcset candidate says w, and the file is that wide, in the same proportions', () => {
    const bad: string[] = [];
    for (const img of imgs()) {
      const srcset = img.getAttribute('srcset');
      if (srcset === undefined || srcset === null) continue;
      if (!img.hasAttribute('sizes')) bad.push(`${show(img)} has srcset in w units but no sizes`);
      const declared = size(img);
      for (const candidate of srcset.split(',').map((part) => part.trim().split(/\s+/))) {
        const [url = '', descriptor = ''] = candidate;
        const file = localFile(url);
        if (!file) continue; // reported by the next test
        const real = readWebp(readFileSync(join(DIST, file)));
        if (descriptor !== `${real.width}w`) bad.push(`${url} is ${real.width}px wide but says "${descriptor}"`);
        const drift = Math.abs(real.width / real.height - declared.w / declared.h) / (declared.w / declared.h);
        if (drift > 0.01) bad.push(`${url} is ${real.width}x${real.height}, not the proportions of ${declared.w}x${declared.h}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('only point at files that exist in dist/', () => {
    const missing: string[] = [];
    for (const img of imgs()) {
      const src = img.getAttribute('src') ?? '';
      if (!src.startsWith('/')) missing.push(`${show(img)} src must be a site path, got "${src}"`);
      else if (!localFile(src)) missing.push(`${src} is not in dist/`);
      for (const url of srcsetUrls(img.getAttribute('srcset') ?? '')) if (!localFile(url)) missing.push(`${url} (srcset) is not in dist/`);
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

describe('the image files', () => {
  const entries = Object.entries(IMAGES).map(([name, image]) => [name, image] as const);
  const variants = Object.entries(IMAGE_VARIANTS).map(([name, variant]) => [name, variant] as const);

  it('are the only files in public/images and dist/images, with the smaller copies that srcset serves', () => {
    const expected = [...entries.map(([, i]) => i.src), ...variants.map(([, v]) => v.src)].map((src) => src.replace('/images/', '')).sort();
    expect(listFiles(join(PUBLIC, 'images'))).toEqual(expected);
    expect(listFiles(join(DIST, 'images'))).toEqual(expected);
  });

  describe.each(entries)('%s', (_name, image) => {
    const path = join(PUBLIC, image.src);

    it(`is ${image.width}x${image.height}`, () => {
      expect(existsSync(path), `${image.src} missing`).toBe(true);
      const { width, height } = readWebp(readFileSync(path));
      expect([width, height]).toEqual([image.width, image.height]);
    });
  });

  it('keeps the transparency of both mascot files (no box behind the mascot)', () => {
    for (const image of [IMAGES.mascot760, IMAGES.mascot640]) {
      expect(readWebp(readFileSync(join(PUBLIC, image.src))).alpha, image.src).toBe(true);
    }
  });

  describe.each(variants)('the smaller copy %s', (_name, variant) => {
    const bytes = () => readFileSync(join(PUBLIC, variant.src));

    it(`is ${variant.width}x${variant.height}, in the proportions of the picture it is a copy of`, () => {
      const { width, height } = readWebp(bytes());
      expect([width, height]).toEqual([variant.width, variant.height]);
      expect(Math.abs(width / height - variant.of.width / variant.of.height) / (variant.of.width / variant.of.height)).toBeLessThan(0.01);
    });

    it('weighs less than the picture it is a copy of, or it would not be worth serving', () => {
      expect(bytes().length).toBeLessThan(readFileSync(join(PUBLIC, variant.of.src)).length);
    });
  });

  // A plate is laid out at the proportions of its width and height attributes until the file it loaded says otherwise.
  // A copy that is off by a rounded pixel would move everything under it by a fraction of a pixel at that moment.
  // (Thumbnails are cropped to 16 by 10 in CSS, so their file proportions never reach the layout.)
  it.each(['workspace', 'vivarySite'] as const)('keeps the exact proportions of the plate it is a copy of: %s', (name) => {
    const { width, height, of } = IMAGE_VARIANTS[name];
    expect(width * of.height, `${width}x${height} against ${of.width}x${of.height}`).toBe(height * of.width);
  });

  it('are each used by a page (nothing orphaned)', () => {
    const used = new Set<string>();
    for (const info of PAGES) {
      if (!existsSync(join(DIST, info.file))) continue;
      const doc = parsePage(info);
      for (const img of all(doc, 'img')) {
        used.add(img.getAttribute('src') ?? '');
        srcsetUrls(img.getAttribute('srcset') ?? '').forEach((u) => used.add(u));
      }
      for (const source of all(doc, 'picture source')) srcsetUrls(source.getAttribute('srcset') ?? '').forEach((u) => used.add(u));
    }
    expect([...entries.map(([, i]) => i.src), ...variants.map(([, v]) => v.src)].filter((src) => !used.has(src))).toEqual([]);
  });
});
