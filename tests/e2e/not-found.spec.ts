/**
 * An address that leads nowhere shows the 404 page. `astro preview` serves dist/404.html with a 404
 * status for unknown paths, so this checks the real behavior, from paths at several depths, because the
 * page must not depend on its own URL to find its styles.
 */
import { NAV_LINKS, page as pageInfo } from '../helpers/dist';
import { ABOUT_PAGE, CALLOUT_PAGE, CONTACT_PAGE, HOME, NOT_FOUND_PAGE, RETIRED_PAGES } from '../helpers/spec';
import { expect, firstFamily, open, pageBackground, rgb, style, test } from './support';

const UNKNOWN = ['/this-page-does-not-exist', '/this-page-does-not-exist/', '/a/b/c/d', '/callout/nothing-here', '/img.png', '/services-old/?x=1#top'];
const [goHome, contact] = NOT_FOUND_PAGE.buttons;
/** The 404 page has the same header as every other page: the brand link and the four page links. */
const NAV_LINK_COUNT = 1 + NAV_LINKS.length;

test.describe('unknown addresses', () => {
  test.use({ colorScheme: 'light', viewport: { width: 1280, height: 900 } });

  for (const path of UNKNOWN) {
    test(`${path} shows the 404 page with a 404 status`, async ({ page }) => {
      const status = await open(page, path, 404);
      expect(status).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(NOT_FOUND_PAGE.h1);
      await expect(page.getByText(NOT_FOUND_PAGE.lede)).toBeVisible();
      await expect(page).toHaveTitle(pageInfo('not-found').title);
    });

    test(`${path} still has its styles, fonts and navigation`, async ({ page, probe }) => {
      await open(page, path, 404);
      expect(firstFamily((await style(page.getByRole('heading', { level: 1 }), ['font-family']))['font-family'])).toBe('Instrument Serif');
      expect((await style(page.locator('body'), ['color']))['color']).not.toBe('rgb(0, 0, 0)');
      expect(await pageBackground(page)).toBe(rgb('light', 'ground'));
      await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(NAV_LINK_COUNT);
      // Only the document itself is allowed to be a 404. Every asset the page needs loads fine.
      const self = page.url().split('#')[0] ?? '';
      expect(probe.badResponses.filter((r) => !r.endsWith(self))).toEqual([]);
      expect(probe.failedRequests).toEqual([]);
      expect(probe.foreignRequests).toEqual([]);
    });
  }

  test(`"${goHome.label}" leads home from a deep path`, async ({ page }) => {
    await open(page, '/a/b/c/d', 404);
    await page.getByRole('link', { name: goHome.label }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(HOME.h1);
  });

  test(`"${contact.label}" leads to the contact page from a deep path`, async ({ page }) => {
    await open(page, '/a/b/c/d', 404);
    await page.getByRole('link', { name: contact.label, exact: true }).first().click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(CONTACT_PAGE.h1);
  });

  test('the nav links work from a deep path', async ({ page }) => {
    const vivary = NAV_LINKS[1];
    await open(page, '/a/b/c/d', 404);
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: vivary.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${vivary.href}$`));
  });

  test('no nav link is marked as the current page', async ({ page }) => {
    await open(page, '/nothing', 404);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(NAV_LINK_COUNT);
    await expect(page.locator('nav[aria-label="Main"] [aria-current]')).toHaveCount(0);
  });
});

test.describe('known addresses are not swallowed by the 404 page', () => {
  for (const [path, heading] of [['/', HOME.h1], ['/callout/', CALLOUT_PAGE.h1], ['/callout', CALLOUT_PAGE.h1], ['/about/', ABOUT_PAGE.h1], ['/contact', CONTACT_PAGE.h1]] as const) {
    test(`${path} shows ${heading}`, async ({ page }) => {
      const status = await open(page, path);
      expect(status).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  }

  test('the built 404 file itself renders its h1 and says noindex', async ({ page }) => {
    const status = await open(page, '/404.html');
    expect(status).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(NOT_FOUND_PAGE.h1);
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toBe('noindex');
  });
});

test.describe('retired addresses', () => {
  test.use({ colorScheme: 'light' });

  for (const retired of RETIRED_PAGES) {
    test(`/${retired} sends the visitor home`, async ({ page }) => {
      await page.goto(`/${retired}`);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(HOME.h1);
    });
  }
});
