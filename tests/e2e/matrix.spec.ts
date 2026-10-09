/**
 * SPEC section 10 "E2E" matrix: every page x width x color scheme. A visitor on any phone or
 * desktop, in light or dark, gets a page that fits, loads cleanly, talks only to this server,
 * sets in Instrument Serif and Instrument Sans, and wears the right colors.
 */
import { SCHEMES, WIDTHS, PAGES, VIEWPORT_HEIGHT, expect, firstFamily, fontsReady, loadEverything, open, pageBackground, rgb, style, test } from './support';

for (const scheme of SCHEMES) {
  for (const width of WIDTHS) {
    test.describe(`${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      for (const info of PAGES) {
        test.describe(info.label, () => {
          test('emulates the color scheme it was asked for', async ({ page }) => {
            await open(page, info);
            const dark = await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches);
            expect(dark).toBe(scheme === 'dark');
          });

          test('has no horizontal overflow', async ({ page }) => {
            await open(page, info);
            await loadEverything(page);
            const { scrollWidth, innerWidth, offenders } = await page.evaluate(() => {
              const root = document.documentElement;
              const limit = window.innerWidth;
              const offenders = Array.from(document.querySelectorAll('body *'))
                .filter((el) => {
                  if (el.closest('.skip')) return false;
                  const r = el.getBoundingClientRect();
                  return r.width > 0 && (r.right > limit + 0.5 || r.left < -0.5);
                })
                .slice(0, 8)
                .map((el) => `${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ').join('.')}` : ''} [${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}]`);
              return { scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth), innerWidth: limit, offenders };
            });
            expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}; wide elements: ${offenders.join(', ')}`).toBeLessThanOrEqual(innerWidth);
            expect(offenders, 'no element should poke past the viewport').toEqual([]);
          });

          test('logs no console errors and throws no page errors', async ({ page, probe }) => {
            await open(page, info);
            await loadEverything(page);
            expect(probe.pageErrors).toEqual([]);
            expect(probe.consoleErrors).toEqual([]);
          });

          test('has no failed requests and no 4xx or 5xx responses', async ({ page, probe }) => {
            await open(page, info);
            await loadEverything(page);
            expect(probe.failedRequests).toEqual([]);
            expect(probe.badResponses).toEqual([]);
          });

          test('talks to no origin but the preview server', async ({ page, probe }) => {
            await open(page, info);
            await loadEverything(page);
            expect(probe.foreignRequests).toEqual([]);
          });

          test('loads Instrument Serif and Instrument Sans and uses them', async ({ page }) => {
            await open(page, info);
            await loadEverything(page);
            // `check` is true for a family the page never declared, so also read each declared face's status.
            const faces = await page.evaluate(async () => {
              await Promise.all([
                document.fonts.load('16px "Instrument Sans"'),
                document.fonts.load('64px "Instrument Serif"'),
                document.fonts.load('17px "Instrument Serif Italic"'),
              ]);
              return {
                sans: document.fonts.check('16px "Instrument Sans"'),
                serif: document.fonts.check('16px "Instrument Serif"'),
                italic: document.fonts.check('16px "Instrument Serif Italic"'),
                declared: Array.from(document.fonts).map((f) => `${f.family.replace(/["']/g, '')}:${f.status}`).sort(),
              };
            });
            expect(faces.declared).toEqual(['Instrument Sans:loaded', 'Instrument Serif Italic:loaded', 'Instrument Serif:loaded']);
            expect([faces.sans, faces.serif, faces.italic]).toEqual([true, true, true]);

            const h1 = await style(page.getByRole('heading', { level: 1 }), ['font-family']);
            expect(firstFamily(h1['font-family'] ?? '')).toBe('Instrument Serif');
            const body = await style(page.locator('body'), ['font-family']);
            expect(firstFamily(body['font-family'] ?? '')).toBe('Instrument Sans');
          });

          test('paints the ground and the ink of its scheme', async ({ page }) => {
            await open(page, info);
            expect(await pageBackground(page)).toBe(rgb(scheme, 'ground'));
            const h1 = await style(page.getByRole('heading', { level: 1 }), ['color']);
            expect(h1['color']).toBe(rgb(scheme, 'ink'));
          });

          test('asks the browser for the scheme it supports (color-scheme)', async ({ page }) => {
            await open(page, info);
            const used = await style(page.locator('html'), ['color-scheme']);
            expect(used['color-scheme']).toBe(scheme);
          });
        });
      }
    });
  }
}

test.describe('fonts settle before measuring', () => {
  test('document.fonts.ready resolves', async ({ page }) => {
    await page.goto('/');
    await fontsReady(page);
    expect(await page.evaluate(() => document.fonts.status)).toBe('loaded');
  });
});
