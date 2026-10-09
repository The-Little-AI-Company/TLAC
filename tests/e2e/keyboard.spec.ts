/**
 * The keyboard path. The first Tab lands on the skip link and shows it, Enter moves the page to main
 * so the next Tab lands on the first thing inside it (main is not itself a tab stop), and Tab then
 * visits every focusable element in DOM order, each drawing a 2px solid accent outline offset by 3px.
 */
import { KEY_WIDTHS, PAGES, SCHEMES, VIEWPORT_HEIGHT, expect, focused, open, rgb, signature, tabbables, test } from './support';
import { FOOTER, HOME, SKIP_LINK } from '../helpers/spec';
import { NAV_LINKS, SITE_NAME } from '../helpers/dist';

for (const scheme of SCHEMES) {
  for (const width of KEY_WIDTHS) {
    test.describe(`keyboard, ${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      for (const info of PAGES) {
        test.describe(info.label, () => {
          test('first Tab focuses the skip link, and it is visible', async ({ page }) => {
            await open(page, info);
            await page.keyboard.press('Tab');
            const skip = page.getByRole('link', { name: SKIP_LINK.label });
            await expect(skip).toBeFocused();
            await expect(skip).toBeVisible();
            expect((await focused(page)).inView, 'the skip link must be inside the viewport when focused').toBe(true);
            const covered = await skip.evaluate((el) => {
              const r = el.getBoundingClientRect();
              const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              return top !== el && !el.contains(top);
            });
            expect(covered, 'something sits on top of the skip link').toBe(false);
            const opacity = await skip.evaluate((el) => getComputedStyle(el).opacity);
            expect(opacity).toBe('1');
          });

          test('Enter on the skip link points the page at main, which takes no focus of its own', async ({ page }) => {
            await open(page, info);
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            expect(await page.evaluate(() => location.hash)).toBe(SKIP_LINK.href);
            expect(await page.evaluate(() => document.activeElement === document.querySelector('main')), 'main is not a focus target').toBe(false);
          });

          test('the next Tab after the skip link lands on the first focusable thing in main, not back in the header', async ({ page }) => {
            await open(page, info);
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await page.keyboard.press('Tab');
            const landed = await page.evaluate(() => {
              const first = document.querySelector('main a[href]');
              return { isFirst: document.activeElement === first, text: (document.activeElement?.textContent ?? '').trim().slice(0, 40), inMain: Boolean(document.querySelector('main')?.contains(document.activeElement)) };
            });
            expect(landed.inMain, `focus is on "${landed.text}", outside main`).toBe(true);
            expect(landed.isFirst, `focus is on "${landed.text}", not the first link in main`).toBe(true);
          });

          test('clicking in main does not focus main', async ({ page }) => {
            await open(page, info);
            const heading = page.getByRole('heading', { level: 1 });
            await heading.click();
            expect(await page.evaluate(() => document.activeElement === document.querySelector('main')), 'main is not focusable, so a click cannot focus it').toBe(false);
          });

          test('Tab visits the focusable elements in DOM order, each with a 2px solid accent outline offset 3px', async ({ page }) => {
            await open(page, info);
            const expected = (await tabbables(page)).map(signature);
            expect(expected.length, 'no focusable elements found').toBeGreaterThan(5);
            const seen: string[] = [];
            const bad: string[] = [];
            for (let i = 0; i < expected.length; i++) {
              await page.keyboard.press('Tab');
              const f = await focused(page);
              seen.push(signature(f));
              const label = `${f.tag} "${f.text.slice(0, 60)}" ${f.href ?? ''}`;
              if (!f.focusVisible) bad.push(`${label}: not :focus-visible after Tab`);
              if (f.outline.style !== 'solid') bad.push(`${label}: outline-style ${f.outline.style}`);
              if (f.outline.width !== '2px') bad.push(`${label}: outline-width ${f.outline.width}`);
              if (f.outline.color !== rgb(scheme, 'accent')) bad.push(`${label}: outline-color ${f.outline.color}, expected ${rgb(scheme, 'accent')}`);
              if (f.outline.offset !== '3px') bad.push(`${label}: outline-offset ${f.outline.offset}`);
            }
            expect(bad).toEqual([]);
            expect(seen, 'Tab order against DOM order').toEqual(expected);
            expect(await page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').count(), 'no positive tabindex').toBe(0);
          });
        });
      }
    });
  }
}

test.describe('keyboard order on the home page', () => {
  test('goes skip link, brand, four nav links, then the page, then the footer links', async ({ page }) => {
    await open(page, '/');
    const nav = [SITE_NAME, ...NAV_LINKS.map((l) => l.label)];
    const sequence: string[] = [];
    const stops = (await tabbables(page)).length;
    for (let i = 0; i < stops; i++) {
      await page.keyboard.press('Tab');
      sequence.push((await focused(page)).text);
    }
    expect(sequence.slice(0, 6)).toEqual([SKIP_LINK.label, ...nav]);
    await expect(page.locator('nav[aria-label="Main"] a'), 'the nav links on the page').toHaveText(nav);
    expect(sequence.slice(6, 8)).toEqual(HOME.buttons.map((b) => b.label));
    const footerLinks = FOOTER.links.map((l) => l.label);
    for (const label of footerLinks) expect(sequence, `footer link ${label}`).toContain(label);
    await expect(page.locator('footer a'), 'the footer links on the page').toHaveText(footerLinks);
    expect(sequence.indexOf(footerLinks[0] ?? '')).toBeGreaterThan(sequence.indexOf(HOME.callout.button.label));
  });
});
