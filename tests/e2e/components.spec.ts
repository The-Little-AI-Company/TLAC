/**
 * SPEC section 5 and 6 as the browser renders them: buttons, status badges, the now line, plates,
 * links, lanes and the nav, with the token colors of each scheme. Run at a desktop and a phone width.
 */
import { KEY_WIDTHS, SCHEMES, VIEWPORT_HEIGHT, box, expect, isPhone, open, rgb, style, test } from './support';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

for (const scheme of SCHEMES) {
  for (const width of KEY_WIDTHS) {
    const phone = isPhone(width);
    test.describe(`components, ${scheme} ${width}px`, () => {
      test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: scheme });

      test.describe('buttons', () => {
        test('primary: accent-fill ground, on-accent label, 2px radius, 15px semibold', async ({ page }) => {
          await open(page, '/');
          const s = await style(page.getByRole('link', { name: 'Get Callout' }), [
            'background-color', 'color', 'border-top-left-radius', 'border-top-width', 'border-top-color', 'font-size', 'font-weight', 'text-decoration-line', 'font-family', 'box-shadow',
          ]);
          expect(s['background-color']).toBe(rgb(scheme, 'accent-fill'));
          expect(s['color']).toBe(rgb(scheme, 'on-accent'));
          expect(s['border-top-left-radius']).toBe('2px');
          expect(s['font-size']).toBe('15px');
          expect(s['font-weight']).toBe('600');
          expect(s['text-decoration-line']).toBe('none');
          expect(s['font-family']).toMatch(/^"?Instrument Sans"?,/);
          expect(s['box-shadow']).toBe('none');
        });

        test('secondary: clear ground, 1px field border, ink label, 2px radius', async ({ page }) => {
          await open(page, '/');
          const s = await style(page.getByRole('link', { name: 'See Vivary' }), [
            'background-color', 'color', 'border-top-left-radius', 'border-top-width', 'border-top-style', 'border-top-color', 'font-size', 'font-weight',
          ]);
          expect(s['background-color']).toBe(TRANSPARENT);
          expect(s['color']).toBe(rgb(scheme, 'ink'));
          expect(s['border-top-width']).toBe('1px');
          expect(s['border-top-style']).toBe('solid');
          expect(s['border-top-color']).toBe(rgb(scheme, 'field'));
          expect(s['border-top-left-radius']).toBe('2px');
          expect(s['font-size']).toBe('15px');
          expect(s['font-weight']).toBe('600');
        });

        test('md buttons are at least 46px tall and sm buttons at least 40px', async ({ page }) => {
          await open(page, '/');
          expect((await box(page.getByRole('link', { name: 'Get Callout' }))).height).toBeGreaterThanOrEqual(phone ? 48 : 46);
          expect((await box(page.getByRole('link', { name: 'More about Vivary' }))).height).toBeGreaterThanOrEqual(40);
          expect((await box(page.getByRole('link', { name: 'More about Callout' }))).height).toBeGreaterThanOrEqual(40);
        });

        test('primary turns accent-hover on hover, secondary draws an ink border', async ({ page }) => {
          test.skip(phone, 'hover is a desktop pointer interaction');
          await open(page, '/');
          const primary = page.getByRole('link', { name: 'Get Callout' });
          await primary.hover();
          await expect.poll(async () => (await style(primary, ['background-color']))['background-color']).toBe(rgb(scheme, 'accent-hover'));
          const secondary = page.getByRole('link', { name: 'See Vivary' });
          await secondary.hover();
          await expect.poll(async () => (await style(secondary, ['border-top-color']))['border-top-color']).toBe(rgb(scheme, 'ink'));
        });

        test('hover changes color only: nothing moves or resizes', async ({ page }) => {
          test.skip(phone, 'hover is a desktop pointer interaction');
          await open(page, '/');
          const primary = page.getByRole('link', { name: 'Get Callout' });
          const before = await box(primary);
          await primary.hover();
          await page.waitForTimeout(350);
          const after = await box(primary);
          expect(after).toEqual(before);
        });
      });

      test.describe('status badges and the now line', () => {
        test('now line: 8px status-wip dot as ::before, then the sentence in ink-soft 15px', async ({ page }) => {
          await open(page, '/');
          const now = page.locator('section.hero p.now');
          const dot = await style(now, ['width', 'height', 'background-color', 'border-top-left-radius', 'content', 'display'], '::before');
          expect(dot['content']).not.toBe('none');
          expect(dot['width']).toBe('8px');
          expect(dot['height']).toBe('8px');
          expect(dot['background-color']).toBe(rgb(scheme, 'status-wip'));
          expect(dot['border-top-left-radius']).toBe('50%');
          const text = await style(now, ['color', 'font-size', 'font-family']);
          expect(text['color']).toBe(rgb(scheme, 'ink-soft'));
          expect(text['font-size']).toBe('15px');
          expect(text['font-family']).toMatch(/^"?Instrument Sans"?,/);
        });

        test('badge label: 13px semibold ink-soft; the dot is 7px', async ({ page }) => {
          await open(page, '/');
          const badge = page.locator('section#work .status').first();
          const s = await style(badge, ['color', 'font-size', 'font-weight', 'font-family']);
          expect(s['color']).toBe(rgb(scheme, 'ink-soft'));
          expect(s['font-size']).toBe('13px');
          expect(s['font-weight']).toBe('600');
          expect(s['font-family']).toMatch(/^"?Instrument Sans"?,/);
          const dot = await style(badge.locator('i'), ['width', 'height', 'border-top-left-radius']);
          expect(dot['width']).toBe('7px');
          expect(dot['height']).toBe('7px');
          expect(dot['border-top-left-radius']).toBe('50%');
        });

        test('shipped and wip dots are filled with status-live and status-wip', async ({ page }) => {
          await open(page, '/');
          const wip = await style(page.locator('section#work .status--wip i'), ['background-color']);
          const shipped = await style(page.locator('section#work .status--shipped i'), ['background-color']);
          expect(wip['background-color']).toBe(rgb(scheme, 'status-wip'));
          expect(shipped['background-color']).toBe(rgb(scheme, 'status-live'));
        });

        test('alpha and demo dots are rings, not fills', async ({ page }) => {
          await open(page, '/');
          for (const tone of ['alpha', 'demo']) {
            const dot = await style(page.locator(`section#other .status--${tone} i`).first(), ['background-color', 'box-shadow', 'border-top-width']);
            expect(dot['background-color'], `${tone} dot is hollow`).toBe(TRANSPARENT);
            expect(dot['box-shadow'] !== 'none' || dot['border-top-width'] !== '0px', `${tone} dot has a ring`).toBe(true);
          }
        });

        test('the shipped project badge says Shipped with the live dot', async ({ page }) => {
          await open(page, '/');
          const badge = page.locator('section#other .status--shipped').first();
          await expect(badge).toHaveText('Shipped');
          expect((await style(badge.locator('i'), ['background-color']))['background-color']).toBe(rgb(scheme, 'status-live'));
        });
      });

      test.describe('plates', () => {
        test('a Plate is a raised, square frame with a 1px rule and 14px (8px on a phone) padding', async ({ page }) => {
          await open(page, '/');
          const s = await style(page.locator('section#work figure.plate').first(), [
            'background-color', 'border-top-width', 'border-top-style', 'border-top-color', 'border-top-left-radius', 'padding-top', 'padding-left', 'box-shadow',
          ]);
          expect(s['background-color']).toBe(rgb(scheme, 'raised'));
          expect(`${s['border-top-width']} ${s['border-top-style']} ${s['border-top-color']}`).toBe(`1px solid ${rgb(scheme, 'rule')}`);
          expect(s['border-top-left-radius']).toBe('0px');
          expect(s['padding-top']).toBe(phone ? '8px' : '14px');
          expect(s['padding-left']).toBe(phone ? '8px' : '14px');
          expect(s['box-shadow']).toBe('none');
        });

        test('the picture fills the plate and the caption sits under it in ink-faint italic', async ({ page }) => {
          await open(page, '/');
          const plate = page.locator('section#work figure.plate').first();
          const img = await box(plate.locator('img'));
          const frame = await box(plate);
          const padding = phone ? 8 : 14;
          expect(Math.abs(img.width - (frame.width - 2 * padding - 2)), 'picture fills the frame').toBeLessThanOrEqual(1.5);
          const caption = await style(plate.locator('figcaption'), ['color', 'font-size', 'font-family', 'font-style', 'font-weight']);
          expect(caption['color']).toBe(rgb(scheme, 'ink-faint'));
          expect(caption['font-size']).toBe(phone ? '15px' : '17px');
          expect(caption['font-family']).toMatch(/^"?Instrument Serif Italic"?,/);
          expect(caption['font-style'], 'the italic is its own family, so the style stays normal').toBe('normal');
          expect(caption['font-weight']).toBe('400');
          expect((await box(plate.locator('figcaption'))).y).toBeGreaterThanOrEqual(img.bottom);
        });

        test('the spec plate wears the same frame', async ({ page }) => {
          await open(page, '/');
          const plate = page.locator('section#work article.feature').nth(1).locator('dl').first().locator('xpath=ancestor::*[self::figure or contains(@class,"plate")][1]');
          const s = await style(plate, ['background-color', 'border-top-width', 'border-top-color', 'border-top-left-radius', 'padding-top']);
          expect(s['background-color']).toBe(rgb(scheme, 'raised'));
          expect(s['border-top-width']).toBe('1px');
          expect(s['border-top-color']).toBe(rgb(scheme, 'rule'));
          expect(s['border-top-left-radius']).toBe('0px');
          expect(s['padding-top']).toBe(phone ? '8px' : '14px');
        });

        test('the spec plate rules its rows with hairlines and quotes in the caption style', async ({ page }) => {
          await open(page, '/');
          const feature = page.locator('section#work article.feature').nth(1);
          const hairlines = await feature.locator('dl').first().evaluate((dl, rule) => {
            const els = [dl, ...Array.from(dl.querySelectorAll('div, dt, dd'))];
            return els.filter((el) => {
              const s = getComputedStyle(el);
              return (s.borderTopWidth === '1px' && s.borderTopColor === rule) || (s.borderBottomWidth === '1px' && s.borderBottomColor === rule);
            }).length;
          }, rgb(scheme, 'rule'));
          expect(hairlines, 'hairlines between the four rows').toBeGreaterThanOrEqual(3);
          const quote = await style(feature.getByText('Signals in the text itself. Not a truth check.', { exact: true }), ['font-family', 'font-style']);
          expect(quote['font-family']).toMatch(/^"?Instrument Serif Italic"?,/);
          expect(quote['font-style']).toBe('normal');
        });
      });

      test.describe('type and color', () => {
        test('the numeral is italic Instrument Serif in the accent color', async ({ page }) => {
          await open(page, '/');
          const s = await style(page.locator('section#work p.numeral').first(), ['color', 'font-family', 'font-style', 'font-size', 'font-weight']);
          expect(s['color']).toBe(rgb(scheme, 'accent'));
          expect(s['font-family']).toMatch(/^"?Instrument Serif Italic"?,/);
          expect(s['font-style']).toBe('normal');
          expect(s['font-weight']).toBe('400');
          expect(parseFloat(s['font-size'] ?? '0')).toBeGreaterThanOrEqual(15);
          expect(parseFloat(s['font-size'] ?? '0')).toBeLessThanOrEqual(22);
        });

        test('body text is ink-soft, headlines are ink, status words and captions are ink-faint or ink-soft', async ({ page }) => {
          await open(page, '/');
          expect((await style(page.locator('section.hero .lede'), ['color']))['color']).toBe(rgb(scheme, 'ink-soft'));
          expect((await style(page.locator('section#how dd').first(), ['color']))['color']).toBe(rgb(scheme, 'ink-soft'));
          expect((await style(page.locator('section#work h2').first(), ['color']))['color']).toBe(rgb(scheme, 'ink'));
          expect((await style(page.locator('section#other h2'), ['color']))['color']).toBe(rgb(scheme, 'ink'));
          expect((await style(page.locator('section#other h3').first(), ['color']))['color']).toBe(rgb(scheme, 'ink'));
          expect((await style(page.locator('section#how dt').first(), ['color']))['color']).toBe(rgb(scheme, 'ink'));
        });

        test('project address links are ink with an accent underline', async ({ page }) => {
          await open(page, '/');
          const s = await style(page.locator('section#other li.entry').first().getByRole('link'), ['color', 'text-decoration-line', 'text-decoration-color']);
          expect(s['color']).toBe(rgb(scheme, 'ink'));
          expect(s['text-decoration-line']).toBe('underline');
          expect(s['text-decoration-color']).toBe(rgb(scheme, 'accent'));
        });

        test('inline links in prose carry an accent underline too', async ({ page }) => {
          await open(page, '/vivary/');
          const link = page.getByRole('link', { name: 'release queue' });
          const s = await style(link, ['text-decoration-line', 'text-decoration-color']);
          expect(s['text-decoration-line']).toBe('underline');
          expect(s['text-decoration-color']).toBe(rgb(scheme, 'accent'));
        });

        test('text selection uses the selection token', async ({ page }) => {
          await open(page, '/');
          const bg = await page.evaluate(() => {
            const p = document.querySelector('section.hero .lede') as HTMLElement;
            const style = getComputedStyle(p, '::selection');
            return { background: style.backgroundColor, color: style.color };
          });
          expect(bg.background).toBe(rgb(scheme, 'selection'));
          expect(bg.color).toBe(rgb(scheme, 'ink'));
        });
      });

      test.describe('navigation and footer colors', () => {
        test('nav links: ink-soft, 15px; the current page is ink with an accent underline', async ({ page }) => {
          await open(page, '/about/');
          const nav = page.getByRole('navigation', { name: 'Main' });
          const other = await style(nav.getByRole('link', { name: 'Vivary', exact: true }), ['color', 'font-size', 'font-family', 'text-decoration-line']);
          expect(other['color']).toBe(rgb(scheme, 'ink-soft'));
          expect(other['font-size']).toBe('15px');
          expect(other['font-family']).toMatch(/^"?Instrument Sans"?,/);
          expect(other['text-decoration-line']).toBe('none');
          const current = await style(nav.getByRole('link', { name: 'About', exact: true }), ['color', 'text-decoration-line', 'text-decoration-color']);
          expect(current['color']).toBe(rgb(scheme, 'ink'));
          expect(current['text-decoration-line']).toBe('underline');
          expect(current['text-decoration-color']).toBe(rgb(scheme, 'accent'));
        });

        test('footer: ground-alt band, ink-faint 13px text, ink-soft links', async ({ page }) => {
          await open(page, '/');
          const footer = page.getByRole('contentinfo');
          const s = await style(footer, ['background-color', 'color', 'font-size', 'font-family']);
          expect(s['background-color']).toBe(rgb(scheme, 'ground-alt'));
          expect(s['color']).toBe(rgb(scheme, 'ink-faint'));
          expect(s['font-size']).toBe('13px');
          for (const name of ['jeff@littleaicompany.com', 'GitHub', 'JeffKazzee.dev']) {
            expect((await style(footer.getByRole('link', { name }), ['color']))['color'], name).toBe(rgb(scheme, 'ink-soft'));
          }
        });

        test('the skip link is ink on the ground until focused and never covers the brand once hidden', async ({ page }) => {
          await open(page, '/');
          const skip = page.getByRole('link', { name: 'Skip to content' });
          const hidden = await box(skip);
          const visibleInViewport = hidden.x >= 0 && hidden.y >= 0 && hidden.x < width && hidden.y < VIEWPORT_HEIGHT && hidden.width > 1 && hidden.height > 1;
          expect(visibleInViewport, 'the skip link should be off-screen or clipped until it has focus').toBe(false);
          await page.keyboard.press('Tab');
          const focused = await box(skip);
          expect(focused.x).toBeGreaterThanOrEqual(0);
          expect(focused.y).toBeGreaterThanOrEqual(0);
          expect(focused.width).toBeGreaterThan(40);
        });
      });

      test.describe('lanes', () => {
        test('names are display titles (28px; 22px or more on a phone), details are body text', async ({ page }) => {
          await open(page, '/');
          const dt = await style(page.locator('section#how dt').first(), ['font-size', 'font-family', 'font-weight']);
          const size = parseFloat(dt['font-size'] ?? '0');
          if (phone) {
            expect(size).toBeGreaterThanOrEqual(22);
            expect(size).toBeLessThanOrEqual(28);
          } else expect(size).toBe(28);
          expect(dt['font-family']).toMatch(/^"?Instrument Serif"?,/);
          expect(dt['font-weight']).toBe('400');
          const dd = await style(page.locator('section#how dd').first(), ['font-size', 'font-family']);
          expect(dd['font-size']).toBe('16px');
          expect(dd['font-family']).toMatch(/^"?Instrument Sans"?,/);
        });
      });
    });
  }
}
