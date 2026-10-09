/**
 * SPEC section 0 and 10: WCAG 2.2 AA. axe-core reports zero violations on every page at 360px
 * and 1280px, in both color schemes, with the rule sets wcag2a, wcag2aa, wcag21a, wcag21aa and wcag22aa.
 */
import AxeBuilder from '@axe-core/playwright';
import { KEY_WIDTHS, PAGES, SCHEMES, VIEWPORT_HEIGHT, expect, formatViolations, loadEverything, open, test } from './support';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const scheme of SCHEMES) {
  for (const width of KEY_WIDTHS) {
    test.describe(`axe, ${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      for (const info of PAGES) {
        test(`${info.label} has no violations`, async ({ page }) => {
          await open(page, info);
          await loadEverything(page);
          const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
          expect(results.violations, formatViolations(results.violations)).toEqual([]);
        });
      }
    });
  }
}

test.describe('axe sees the whole page', () => {
  test('runs a meaningful number of rules, with none skipped for lack of a landmark or title', async ({ page }) => {
    await open(page, '/');
    await loadEverything(page);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.passes.length, 'axe should have passed plenty of rules').toBeGreaterThan(15);
    const ids = results.passes.map((r) => r.id);
    for (const id of ['document-title', 'html-has-lang', 'image-alt', 'link-name', 'color-contrast', 'bypass'] as const) {
      expect(ids, `axe should have checked ${id}`).toContain(id);
    }
  });
});
