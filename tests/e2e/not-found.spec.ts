/**
 * SPEC section 8 and 10 "404": an address that leads nowhere shows the 404 page. `astro preview`
 * serves dist/404.html with a 404 status for unknown paths, so this checks the real behavior, from
 * paths at several depths, because the page must not depend on its own URL to find its styles.
 */
import { expect, firstFamily, open, rgb, style, test } from './support';

const UNKNOWN = ['/this-page-does-not-exist', '/this-page-does-not-exist/', '/a/b/c/d', '/callout/nothing-here', '/img.png', '/services-old/?x=1#top'];

test.describe('unknown addresses', () => {
  test.use({ colorScheme: 'light', viewport: { width: 1280, height: 900 } });

  for (const path of UNKNOWN) {
    test(`${path} shows the 404 page with a 404 status`, async ({ page }) => {
      const status = await open(page, path, 404);
      expect(status).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
      await expect(page.getByText("That address doesn't lead anywhere on this site.")).toBeVisible();
      await expect(page).toHaveTitle('Page not found. The Little AI Company');
    });

    test(`${path} still has its styles, fonts and navigation`, async ({ page, probe }) => {
      await open(page, path, 404);
      expect(firstFamily((await style(page.getByRole('heading', { level: 1 }), ['font-family']))['font-family'] ?? '')).toBe('Instrument Serif');
      expect((await style(page.locator('body'), ['color']))['color']).not.toBe('rgb(0, 0, 0)');
      const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      expect(bg).toBe(rgb('light', 'ground'));
      await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(5);
      // Only the document itself is allowed to be a 404. Every asset the page needs loads fine.
      const self = page.url().split('#')[0] ?? '';
      expect(probe.badResponses.filter((r) => !r.endsWith(self))).toEqual([]);
      expect(probe.failedRequests).toEqual([]);
      expect(probe.foreignRequests).toEqual([]);
    });
  }

  test('"Go to the home page" leads home from a deep path', async ({ page }) => {
    await open(page, '/a/b/c/d', 404);
    await page.getByRole('link', { name: 'Go to the home page' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tools for the work you keep doing by hand.');
  });

  test('"Contact" leads to the contact page from a deep path', async ({ page }) => {
    await open(page, '/a/b/c/d', 404);
    await page.getByRole('link', { name: 'Contact', exact: true }).first().click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact');
  });

  test('the nav links work from a deep path', async ({ page }) => {
    await open(page, '/a/b/c/d', 404);
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Vivary', exact: true }).click();
    await expect(page).toHaveURL(/\/vivary\/$/);
  });

  test('no nav link is marked as the current page', async ({ page }) => {
    await open(page, '/nothing', 404);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(5);
    await expect(page.locator('nav[aria-label="Main"] [aria-current]')).toHaveCount(0);
  });
});

test.describe('known addresses are not swallowed by the 404 page', () => {
  for (const [path, heading] of [['/', 'Tools for the work you keep doing by hand.'], ['/callout/', 'Callout'], ['/callout', 'Callout'], ['/about/', 'About'], ['/contact', 'Contact']] as const) {
    test(`${path} shows ${heading}`, async ({ page }) => {
      const status = await open(page, path);
      expect(status).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  }

  test('the built 404 file itself renders its h1 and says noindex', async ({ page }) => {
    const status = await open(page, '/404.html');
    expect(status).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toBe('noindex');
  });
});

test.describe('retired addresses', () => {
  test.use({ colorScheme: 'light' });

  for (const path of ['/services', '/club', '/start-here', '/projects', '/brand', '/pages']) {
    test(`${path} sends the visitor home`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tools for the work you keep doing by hand.');
    });
  }
});
