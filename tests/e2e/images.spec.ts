/**
 * SPEC section 10 "All images load": every <img> on every page decodes to real pixels once it has
 * been scrolled into view, at a phone and a desktop width.
 */
import type { Page } from '@playwright/test';
import { KEY_WIDTHS, PAGES, VIEWPORT_HEIGHT, expect, loadEverything, open, test } from './support';
import { IMAGE_COUNT } from '../helpers/spec';

interface Loaded {
  src: string;
  currentSrc: string;
  complete: boolean;
  naturalWidth: number;
  naturalHeight: number;
  alt: string | null;
  loading: string | null;
  renderedWidth: number;
  renderedHeight: number;
  decoded: boolean;
}

for (const width of KEY_WIDTHS) {
  test.describe(`images at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT } });

    for (const info of PAGES) {
      test(`${info.label}: every image has pixels after it is scrolled into view`, async ({ page, probe }) => {
        await open(page, info);
        const count = await page.locator('img').count();
        expect(count, `the spec gives ${info.label} ${IMAGE_COUNT[info.id]} image(s)`).toBe(IMAGE_COUNT[info.id]);
        for (let i = 0; i < count; i++) {
          const img = page.locator('img').nth(i);
          await img.scrollIntoViewIfNeeded();
          await expect.poll(async () => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { message: `image ${i} should load`, timeout: 5000 }).toBe(true);
        }
        const loaded = await page.evaluate(async (): Promise<Loaded[]> =>
          Promise.all(
            Array.from(document.images).map(async (img) => {
              const decoded = await img.decode().then(() => true, () => false);
              const r = img.getBoundingClientRect();
              return {
                src: img.getAttribute('src') ?? '',
                currentSrc: img.currentSrc,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                alt: img.getAttribute('alt'),
                loading: img.getAttribute('loading'),
                renderedWidth: r.width,
                renderedHeight: r.height,
                decoded,
              };
            }),
          ),
        );
        expect(loaded.length).toBe(count);
        for (const img of loaded) {
          expect(img.complete, `${img.src} complete`).toBe(true);
          expect(img.naturalWidth, `${img.src} naturalWidth`).toBeGreaterThan(0);
          expect(img.naturalHeight, `${img.src} naturalHeight`).toBeGreaterThan(0);
          expect(img.decoded, `${img.src} decodes`).toBe(true);
          expect(img.renderedWidth, `${img.src} is drawn`).toBeGreaterThan(0);
          expect(img.renderedHeight, `${img.src} is drawn`).toBeGreaterThan(0);
          expect(img.currentSrc.endsWith('.webp'), `${img.currentSrc} is WebP`).toBe(true);
        }
        expect(probe.failedRequests).toEqual([]);
        expect(probe.badResponses).toEqual([]);
      });
    }
  });
}

test.describe('the hero image', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('the hero image loads at once with high priority', async ({ page }) => {
    await open(page, '/');
    const mascot = page.locator('section.hero picture img');
    expect(await mascot.getAttribute('fetchpriority')).toBe('high');
    expect(await mascot.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  });
});

// srcset: each screen downloads the smallest file that is sharp at the size the picture is drawn.
const SMALL = /-(?:320|600|640)\.webp$/;

const sources = async (page: Page, path: string): Promise<{ thumbs: string[]; plates: string[] }> => {
  await open(page, path);
  await loadEverything(page);
  return page.evaluate(() => ({
    thumbs: Array.from(document.querySelectorAll<HTMLImageElement>('.thumb img')).map((img) => img.currentSrc),
    plates: Array.from(document.querySelectorAll<HTMLImageElement>('figure.plate img')).map((img) => img.currentSrc),
  }));
};

for (const [name, width, scale, plates] of [
  ['a phone', 360, 1, 'the smaller copy'],
  ['a desktop screen', 1280, 1, 'the smaller copy'],
  ['a high-density desktop screen', 1280, 2, 'the full 1200px file'],
] as const) {
  test.describe(`right-sized images on ${name}`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, deviceScaleFactor: scale });

    test(`thumbnails load the 320px copy and plates load ${plates}`, async ({ page }) => {
      const home = await sources(page, '/');
      expect(home.thumbs).toHaveLength(4);
      for (const src of home.thumbs) expect(src, 'thumbnail').toMatch(/-320\.webp$/);
      const vivary = await sources(page, '/vivary/');
      for (const src of [...home.plates, ...vivary.plates]) {
        if (scale === 1) expect(src, 'plate').toMatch(/-(?:600|640)\.webp$/);
        else expect(SMALL.test(src), `${src} should be the full file`).toBe(false);
      }
      expect(home.plates).toHaveLength(1);
      expect(vivary.plates).toHaveLength(1);
    });
  });
}
