/**
 * Full-page screenshots for design review: every page x [360, 1280] x [light, dark], written to
 * test-results/screenshots/<page>-<width>-<scheme>.png. They are not baselines and nothing
 * compares them, so this spec passes whatever the page looks like.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { KEY_WIDTHS, PAGES, SCHEMES, VIEWPORT_HEIGHT, fontsReady, loadEverything, screenshotName, test } from './support';

const DIRECTORY = join('test-results', 'screenshots');

for (const scheme of SCHEMES) {
  for (const width of KEY_WIDTHS) {
    test.describe(`screenshots, ${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      for (const info of PAGES) {
        test(`${info.label}`, async ({ page }) => {
          mkdirSync(DIRECTORY, { recursive: true });
          await page.goto(info.url, { waitUntil: 'load' });
          await fontsReady(page);
          await loadEverything(page);
          await page.screenshot({ path: join(DIRECTORY, screenshotName(info, width, scheme)), fullPage: true });
        });
      }
    });
  }
}
