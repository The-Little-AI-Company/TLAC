/**
 * SPEC section 0 and 10: the keyboard path. The first Tab lands on the skip link and shows it,
 * Enter moves the page to main so the next Tab lands on the first thing inside it (main is not itself
 * a tab stop), every focusable element shows a 2px solid accent outline offset by 3px when focused
 * from the keyboard, and Tab order follows the DOM.
 */
import type { Page } from '@playwright/test';
import { KEY_WIDTHS, PAGES, SCHEMES, VIEWPORT_HEIGHT, expect, open, rgb, test, type Scheme } from './support';

interface Focused {
  tag: string;
  text: string;
  href: string | null;
  outlineStyle: string;
  outlineWidth: string;
  outlineColor: string;
  outlineOffset: string;
  focusVisible: boolean;
  /** Whether the focused element is inside the viewport. */
  inView: boolean;
}

/** What currently has focus, and how it is outlined. */
async function focused(page: Page): Promise<Focused> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
      href: el.getAttribute('href'),
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      outlineColor: cs.outlineColor,
      outlineOffset: cs.outlineOffset,
      focusVisible: el.matches(':focus-visible'),
      inView: r.width > 0 && r.height > 0 && r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight,
    };
  });
}

/** Elements Tab should reach, in DOM order: links and anything with tabindex >= 0 that takes up space. */
async function tabbablesInDomOrder(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]'))
      .filter((el) => {
        if (el.matches('[tabindex^="-"]') || el.hasAttribute('disabled')) return false;
        const style = getComputedStyle(el);
        // The skip link is off-screen until focused but still tabbable, so only visibility and display decide.
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((el) => `${el.tagName.toLowerCase()}|${el.getAttribute('href') ?? ''}|${(el.textContent ?? '').replace(/\s+/g, ' ').trim()}`),
  );
}

for (const scheme of SCHEMES) {
  for (const width of KEY_WIDTHS) {
    test.describe(`keyboard, ${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      for (const info of PAGES) {
        test.describe(info.label, () => {
          test('first Tab focuses the skip link, and it is visible', async ({ page }) => {
            await open(page, info);
            await page.keyboard.press('Tab');
            const skip = page.getByRole('link', { name: 'Skip to content' });
            await expect(skip).toBeFocused();
            await expect(skip).toBeVisible();
            const state = await focused(page);
            expect(state.inView, 'the skip link must be inside the viewport when focused').toBe(true);
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
            expect(await page.evaluate(() => location.hash)).toBe('#main');
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

          test('clicking in main does not move the place the next Tab starts from to the top of main', async ({ page }) => {
            await open(page, info);
            const heading = page.getByRole('heading', { level: 1 });
            await heading.click();
            expect(await page.evaluate(() => document.activeElement === document.querySelector('main')), 'main is not focusable, so a click cannot focus it').toBe(false);
          });

          test('every focusable element draws a 2px solid accent outline, offset 3px, when focused by keyboard', async ({ page }) => {
            await open(page, info);
            const order = await tabbablesInDomOrder(page);
            expect(order.length, 'no focusable elements found').toBeGreaterThan(5);
            const bad: string[] = [];
            for (let i = 0; i < order.length; i++) {
              await page.keyboard.press('Tab');
              const f = await focused(page);
              const label = `${f.tag} "${f.text}" ${f.href ?? ''}`;
              if (!f.focusVisible) bad.push(`${label}: not :focus-visible after Tab`);
              if (f.outlineStyle !== 'solid') bad.push(`${label}: outline-style ${f.outlineStyle}`);
              if (f.outlineWidth !== '2px') bad.push(`${label}: outline-width ${f.outlineWidth}`);
              if (f.outlineColor !== rgb(scheme as Scheme, 'accent')) bad.push(`${label}: outline-color ${f.outlineColor}, expected ${rgb(scheme as Scheme, 'accent')}`);
              if (f.outlineOffset !== '3px') bad.push(`${label}: outline-offset ${f.outlineOffset}`);
            }
            expect(bad).toEqual([]);
          });

          test('Tab order follows the DOM order', async ({ page }) => {
            await open(page, info);
            const expected = await tabbablesInDomOrder(page);
            const seen: string[] = [];
            for (let i = 0; i < expected.length; i++) {
              await page.keyboard.press('Tab');
              seen.push(
                await page.evaluate(() => {
                  const el = document.activeElement as HTMLElement;
                  return `${el.tagName.toLowerCase()}|${el.getAttribute('href') ?? ''}|${(el.textContent ?? '').replace(/\s+/g, ' ').trim()}`;
                }),
              );
            }
            expect(seen).toEqual(expected);
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
    const names = await page.evaluate(() => {
      const nav = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav[aria-label="Main"] a')).map((a) => a.textContent?.replace(/\s+/g, ' ').trim());
      const foot = Array.from(document.querySelectorAll<HTMLAnchorElement>('footer a')).map((a) => a.textContent?.replace(/\s+/g, ' ').trim());
      return { nav, foot };
    });
    const sequence: string[] = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      sequence.push(await page.evaluate(() => (document.activeElement?.textContent ?? '').replace(/\s+/g, ' ').trim()));
    }
    expect(sequence.slice(0, 6)).toEqual(['Skip to content', ...names.nav]);
    expect(names.nav).toEqual(['The Little AI Company', 'Callout', 'Vivary', 'About', 'Contact']);
    expect(sequence.slice(6, 8)).toEqual(['Get Callout', 'See Vivary']);
    for (const label of names.foot) expect(sequence, `footer link ${label}`).toContain(label);
    expect(sequence.indexOf(names.foot[0] ?? '')).toBeGreaterThan(sequence.indexOf('More about Callout'));
  });
});
