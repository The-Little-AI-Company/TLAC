/**
 * SPEC section 10 "All images load": every <img> on every page decodes to real pixels once it has
 * been scrolled into view, at a phone and a desktop width.
 */
import { KEY_WIDTHS, PAGES, VIEWPORT_HEIGHT, expect, open, test } from './support';
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
