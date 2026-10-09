/**
 * Every page at every width in both color schemes. A visitor on any phone or desktop, in light or dark,
 * gets a page that fits, loads cleanly, talks only to this server, sets in Instrument Serif and
 * Instrument Sans, and wears the colors of the scheme they asked for.
 *
 * One test, and so one page load, per cell: what each cell checks is read from the same loaded page.
 * The checks are soft, so a failing cell reports everything that is wrong with it at once.
 */
import { SCHEMES, WIDTHS, PAGES, VIEWPORT_HEIGHT, expect, firstFamily, fontsReady, loadEverything, open, pageBackground, rgb, style, test } from './support';

for (const scheme of SCHEMES) {
  for (const width of WIDTHS) {
    test.describe(`${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      for (const info of PAGES) {
        test(`${info.label}: loads cleanly, fits, and wears its scheme and fonts`, async ({ page, probe }) => {
          await open(page, info);
          await loadEverything(page);

          await test.step('the browser emulates the scheme it was asked for', async () => {
            const dark = await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches);
            expect.soft(dark).toBe(scheme === 'dark');
          });

          await test.step('no console or page errors, no failed or 4xx or 5xx requests, no request to another origin', async () => {
            expect.soft(probe.pageErrors, 'page errors').toEqual([]);
            expect.soft(probe.consoleErrors, 'console errors').toEqual([]);
            expect.soft(probe.failedRequests, 'failed requests').toEqual([]);
            expect.soft(probe.badResponses, '4xx or 5xx responses').toEqual([]);
            expect.soft(probe.foreignRequests, 'requests to another origin').toEqual([]);
          });

          await test.step('no horizontal overflow', async () => {
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
            expect.soft(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}; wide elements: ${offenders.join(', ')}`).toBeLessThanOrEqual(innerWidth);
            expect.soft(offenders, 'no element should poke past the viewport').toEqual([]);
          });

          await test.step('loads Instrument Serif and Instrument Sans and uses them', async () => {
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
            expect.soft(faces.declared).toEqual(['Instrument Sans:loaded', 'Instrument Serif Italic:loaded', 'Instrument Serif:loaded']);
            expect.soft([faces.sans, faces.serif, faces.italic]).toEqual([true, true, true]);
            expect.soft(firstFamily((await style(page.getByRole('heading', { level: 1 }), ['font-family']))['font-family']), 'h1 family').toBe('Instrument Serif');
            expect.soft(firstFamily((await style(page.locator('body'), ['font-family']))['font-family']), 'body family').toBe('Instrument Sans');
          });

          await test.step('paints the ground and the ink of its scheme, and asks for it with color-scheme', async () => {
            expect.soft(await pageBackground(page), 'ground').toBe(rgb(scheme, 'ground'));
            expect.soft((await style(page.getByRole('heading', { level: 1 }), ['color']))['color'], 'h1 ink').toBe(rgb(scheme, 'ink'));
            expect.soft((await style(page.locator('html'), ['color-scheme']))['color-scheme'], 'color-scheme').toBe(scheme);
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
