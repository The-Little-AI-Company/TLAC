/**
 * SPEC sections 4, 6 and 8 and the layout items of section 10: one breakpoint at 860px, a centered
 * hero, one column on a phone, two on a desktop, full-width 48px buttons, 44px nav links, a mascot
 * that stands on the hairline. Layout does not depend on the color scheme, so this runs in light.
 */
import type { Page } from '@playwright/test';
import {
  CONTENT_MAX, PAGES, VIEWPORT_HEIGHT, box, boxes, chInPixels, expect, isPhone, open, rgb, round, sidePadding, style, test, type Box,
} from './support';

const LAYOUT_WIDTHS = [320, 360, 859, 860, 861, 1280, 1440] as const;
const near = (a: number, b: number, tolerance: number): boolean => Math.abs(a - b) <= tolerance;
const center = (b: Box): number => b.x + b.width / 2;

for (const width of LAYOUT_WIDTHS) {
  const phone = isPhone(width);
  test.describe(`layout at ${width}px (${phone ? 'phone' : 'desktop'} layout)`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    // -- Navigation ----------------------------------------------------------------------------
    test.describe('navigation', () => {
      for (const info of PAGES) {
        test(`${info.label}: ${phone ? 'brand on row one, the four links on row two' : 'brand left, links right, one row'}`, async ({ page }) => {
          await open(page, info);
          const nav = page.getByRole('navigation', { name: 'Main' });
          const brand = await box(nav.getByRole('link').first());
          const links = await boxes(nav.getByRole('link').filter({ hasNotText: 'The Little AI Company' }));
          expect(links).toHaveLength(4);
          if (phone) {
            for (const link of links) expect(link.y, `link top ${round(link.y)} vs brand bottom ${round(brand.bottom)}`).toBeGreaterThanOrEqual(brand.bottom - 1);
            for (const link of links) expect(link.height, 'nav links are at least 44px tall').toBeGreaterThanOrEqual(44);
            expect(Math.min(...links.map((l) => l.x))).toBeGreaterThanOrEqual(sidePadding(width) - 1);
          } else {
            expect(brand.right, 'brand ends before the first link').toBeLessThanOrEqual(Math.min(...links.map((l) => l.x)));
            for (const link of links) expect(near(link.y + link.height / 2, brand.y + brand.height / 2, 16), 'links share a row with the brand').toBe(true);
            expect(Math.max(...links.map((l) => l.right)), 'links sit on the right').toBeGreaterThan(width / 2);
            expect(Math.max(...links.map((l) => l.right))).toBeLessThanOrEqual(width - 16);
          }
          expect(brand.x, 'brand keeps the page side padding').toBeGreaterThanOrEqual(sidePadding(width) - 1);
        });
      }

      test('brand is the name in Instrument Serif at 24px (20px on a phone) beside a 24px mark', async ({ page }) => {
        await open(page, '/');
        const brand = page.getByRole('navigation', { name: 'Main' }).getByRole('link').first();
        const text = await style(brand, ['font-size', 'font-family', 'font-weight']);
        expect(text['font-size']).toBe(phone ? '20px' : '24px');
        expect(text['font-family']).toMatch(/^"?Instrument Serif"?,/);
        expect(text['font-weight']).toBe('400');
        const mark = await box(brand.locator('svg'));
        expect(mark.width).toBeGreaterThanOrEqual(phone ? 20 : 24);
        expect(mark.width).toBeLessThanOrEqual(24);
        expect(near(mark.width, mark.height, 0.5)).toBe(true);
      });
    });

    // -- Home hero -------------------------------------------------------------------------------
    test.describe('home hero', () => {
      test('is centered and runs now line, headline, lede, buttons, mascot from top to bottom', async ({ page }) => {
        await open(page, '/');
        const hero = page.locator('section.hero');
        const parts = [hero.locator('.now'), hero.getByRole('heading', { level: 1 }), hero.locator('.lede'), hero.locator('.actions'), hero.locator('picture img')];
        const found = await Promise.all(parts.map((p) => box(p)));
        for (let i = 1; i < found.length; i++) expect(found[i]!.y, `part ${i} starts below part ${i - 1}`).toBeGreaterThanOrEqual(found[i - 1]!.bottom - 4);
        for (const [i, b] of found.entries()) expect(near(center(b), width / 2, 2), `part ${i} is centered (center ${round(center(b))}, page ${width / 2})`).toBe(true);
        const align = await style(hero, ['text-align']);
        expect(align['text-align']).toBe('center');
      });

      test(`has ${phone ? 36 : 88}px of padding above the now line`, async ({ page }) => {
        await open(page, '/');
        const pad = await style(page.locator('section.hero'), ['padding-top']);
        expect(pad['padding-top']).toBe(phone ? '36px' : '88px');
      });

      test('keeps the headline to 12ch', async ({ page }) => {
        await open(page, '/');
        const h1 = page.locator('section.hero').getByRole('heading', { level: 1 });
        const limit = await chInPixels(h1, 12);
        expect((await box(h1)).width).toBeLessThanOrEqual(limit + 1);
      });

      test(phone ? 'stacks the two buttons, each full width of its row and at least 48px tall' : 'sets the two buttons side by side, at least 46px tall, not full width', async ({ page }) => {
        await open(page, '/');
        const row = await box(page.locator('section.hero .actions'));
        const btns = await boxes(page.locator('section.hero .actions .btn'));
        expect(btns).toHaveLength(2);
        if (phone) {
          for (const b of btns) {
            expect(near(b.width, row.width, 1), `button ${round(b.width)}px wide in a row ${round(row.width)}px wide`).toBe(true);
            expect(b.height, 'button height').toBeGreaterThanOrEqual(48);
          }
          expect(btns[1]!.y).toBeGreaterThanOrEqual(btns[0]!.bottom);
          expect(near(row.width, width - 2 * sidePadding(width), 1), 'the row spans the page content').toBe(true);
        } else {
          for (const b of btns) {
            expect(b.height, 'button height').toBeGreaterThanOrEqual(46);
            expect(b.width, 'buttons hug their label on a desktop').toBeLessThan(row.width);
          }
          expect(near(btns[0]!.y, btns[1]!.y, 1), 'same row').toBe(true);
          expect(btns[1]!.x).toBeGreaterThan(btns[0]!.right);
        }
      });

      test(`mascot is ${phone ? 'at most 260px' : 'about 470px (78% at most)'} wide, centered, and loads the ${phone ? '640' : '760'}px file`, async ({ page }) => {
        await open(page, '/');
        const img = page.locator('section.hero picture img');
        const b = await box(img);
        if (phone) {
          expect(b.width).toBeLessThanOrEqual(260.5);
          expect(b.width).toBeGreaterThanOrEqual(200);
        } else {
          expect(b.width).toBeLessThanOrEqual(470.5);
          expect(b.width).toBeGreaterThanOrEqual(468);
        }
        expect(near(center(b), width / 2, 2)).toBe(true);
        expect(near(b.width / b.height, phone ? 640 / 571 : 760 / 678, 0.01), 'the mascot keeps its proportions').toBe(true);
        const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
        expect(src.endsWith(phone ? '/images/vivary-mascot-skate-640.webp' : '/images/vivary-mascot-skate-760.webp'), `currentSrc is ${src}`).toBe(true);
      });

      test('mascot stands on the hairline: its bottom is within 4px of the top border of #work', async ({ page }) => {
        await open(page, '/');
        const mascot = await box(page.locator('section.hero picture img'));
        const work = await box(page.locator('section#work'));
        expect(Math.abs(mascot.bottom - work.y), `mascot bottom ${round(mascot.bottom)}, #work top ${round(work.y)}`).toBeLessThanOrEqual(4);
        const border = await style(page.locator('section#work'), ['border-top-width', 'border-top-style', 'border-top-color']);
        expect(border['border-top-width']).toBe('1px');
        expect(border['border-top-style']).toBe('solid');
        expect(border['border-top-color']).toBe(rgb('light', 'rule'));
      });

      test('has no box behind the mascot', async ({ page }) => {
        await open(page, '/');
        for (const selector of ['section.hero picture', 'section.hero picture img']) {
          const s = await style(page.locator(selector), ['background-color', 'background-image', 'border-top-width', 'box-shadow', 'padding-top', 'outline-style']);
          expect(s['background-color'], `${selector} background`).toBe('rgba(0, 0, 0, 0)');
          expect(s['background-image']).toBe('none');
          expect(s['border-top-width']).toBe('0px');
          expect(s['box-shadow']).toBe('none');
          expect(s['padding-top']).toBe('0px');
        }
        expect(await page.locator('section.hero picture').evaluate((el) => Boolean(el.closest('figure, .plate')))).toBe(false);
      });

      if (phone) {
        test('shows the headline and both buttons on the first screen of a 360x740 phone', async ({ page }) => {
          await page.setViewportSize({ width, height: 740 });
          await open(page, '/');
          const h1 = await box(page.locator('section.hero').getByRole('heading', { level: 1 }));
          const btns = await boxes(page.locator('section.hero .actions .btn'));
          expect(btns).toHaveLength(2);
          expect(h1.y).toBeGreaterThanOrEqual(0);
          expect(Math.max(...btns.map((b) => b.bottom)), 'the second button should end above the fold').toBeLessThanOrEqual(740);
        });
      }
    });

    // -- Sections ---------------------------------------------------------------------------------
    test.describe('home sections', () => {
      for (const id of ['work', 'other', 'how']) {
        test(`#${id} has ${phone ? 56 : 96}px of vertical padding and a 1px rule on top`, async ({ page }) => {
          await open(page, '/');
          const s = await style(page.locator(`section#${id}`), ['padding-top', 'padding-bottom', 'border-top-width', 'border-top-style', 'border-top-color', 'background-color']);
          expect(s['padding-top']).toBe(phone ? '56px' : '96px');
          expect(s['padding-bottom']).toBe(phone ? '56px' : '96px');
          expect(s['border-top-width']).toBe('1px');
          expect(s['border-top-style']).toBe('solid');
          expect(s['border-top-color']).toBe(rgb('light', 'rule'));
          expect(s['background-color'], 'no tinted bands between sections').toBe('rgba(0, 0, 0, 0)');
        });
      }

      test('come in order down the page', async ({ page }) => {
        await open(page, '/');
        const tops = await Promise.all(['section.hero', 'section#work', 'section#other', 'section#how', 'footer'].map(async (s) => (await box(page.locator(s))).y));
        expect([...tops].sort((a, b) => a - b)).toEqual(tops);
      });

      test(`keep their content inside ${sidePadding(width)}px page margins and ${CONTENT_MAX}px`, async ({ page }) => {
        await open(page, '/');
        const content = await page.evaluate(() => {
          // Leaves only: sections and wrappers run edge to edge so their hairlines can.
          const rects = Array.from(document.querySelectorAll('main *'))
            .filter((el) => el.children.length === 0 || el.tagName === 'IMG')
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && r.height > 0);
          return { left: Math.min(...rects.map((r) => r.left)), right: Math.max(...rects.map((r) => r.right)) };
        });
        const pad = sidePadding(width);
        expect(content.left, 'content starts at or after the left margin').toBeGreaterThanOrEqual(pad - 1);
        expect(content.right, 'content ends at or before the right margin').toBeLessThanOrEqual(width - pad + 1);
        const expectedWidth = Math.min(width - 2 * pad, CONTENT_MAX);
        const features = await boxes(page.locator('section#work article.feature'));
        for (const f of features) {
          expect(near(f.width, expectedWidth, 1), `feature ${round(f.width)}px wide, expected ${expectedWidth}`).toBe(true);
          expect(near(f.x, (width - expectedWidth) / 2, 1), 'the content is centered').toBe(true);
        }
      });
    });

    // -- ProjectFeature ----------------------------------------------------------------------------
    test.describe('project features', () => {
      test(phone ? 'are one column: the plate and the text share the same edges' : 'are two columns in the ratio 1.2 to 1 with a 56px gap', async ({ page }) => {
        await open(page, '/');
        const features = page.locator('section#work article.feature');
        expect(await features.count()).toBe(2);
        for (let i = 0; i < 2; i++) {
          const feature = features.nth(i);
          const text = await box(feature.locator('xpath=.//h2/ancestor-or-self::*[parent::article[contains(@class,"feature")]][1]'));
          const media = await box(feature.locator('xpath=./*[not(.//h2)][1]'));
          if (phone) {
            expect(near(text.x, media.x, 1), `feature ${i}: left edges`).toBe(true);
            expect(near(text.width, media.width, 1), `feature ${i}: widths`).toBe(true);
            expect(Math.max(text.y, media.y), `feature ${i}: stacked, not side by side`).toBeGreaterThanOrEqual(Math.min(text.bottom, media.bottom) - 1);
          } else {
            const left = i === 0 ? media : text; // the second feature is reversed
            const right = i === 0 ? text : media;
            expect(left.right, `feature ${i}: columns do not overlap`).toBeLessThanOrEqual(right.x);
            expect(near(right.x - left.right, 56, 1), `feature ${i}: gap ${round(right.x - left.right)}px`).toBe(true);
            const ratio = media.width / text.width;
            expect(ratio, `feature ${i}: media ${round(media.width)}px, text ${round(text.width)}px`).toBeGreaterThan(1.1);
            expect(ratio).toBeLessThan(1.3);
          }
        }
      });

      test('put the Vivary plate first and the Callout spec plate last on a desktop (reverse layout)', async ({ page }) => {
        test.skip(phone, 'a phone has one column');
        await open(page, '/');
        const [first, second] = [page.locator('section#work article.feature').nth(0), page.locator('section#work article.feature').nth(1)];
        const firstMedia = await box(first.locator('figure.plate'));
        const firstText = await box(first.getByRole('heading', { level: 2 }));
        const secondMedia = await box(second.locator('dl').first());
        const secondText = await box(second.getByRole('heading', { level: 2 }));
        expect(firstMedia.x, 'Vivary: plate on the left').toBeLessThan(firstText.x);
        expect(secondMedia.x, 'Callout: plate on the right').toBeGreaterThan(secondText.x);
      });

      test(phone ? 'are clearly apart from each other' : 'have --space-9 (96px) between them', async ({ page }) => {
        await open(page, '/');
        const [a, b] = await boxes(page.locator('section#work article.feature'));
        const gap = b!.y - a!.bottom;
        if (phone) expect(gap, `gap between features ${round(gap)}px`).toBeGreaterThanOrEqual(40);
        else expect(near(gap, 96, 2), `gap between features ${round(gap)}px`).toBe(true);
      });
    });

    // -- Other things I have made ---------------------------------------------------------------
    test.describe('other things I have made', () => {
      test('centers the heading and the list, which is at most 940px wide', async ({ page }) => {
        await open(page, '/');
        const h2 = await box(page.locator('section#other h2'));
        const list = await box(page.locator('section#other ol.contents'));
        expect(near(center(h2), width / 2, 2)).toBe(true);
        expect(list.width).toBeLessThanOrEqual(940.5);
        expect(near(center(list), width / 2, 2)).toBe(true);
        if (width >= 1100) expect(near(list.width, 940, 1), `list is ${round(list.width)}px wide`).toBe(true);
        const align = await style(page.locator('section#other h2'), ['text-align']);
        expect(align['text-align']).toBe('center');
      });

      test(`frames the thumbnail at ${phone ? 88 : 150}px, 16 to 10, object-fit cover`, async ({ page }) => {
        await open(page, '/');
        const entries = page.locator('section#other li.entry');
        expect(await entries.count()).toBe(4);
        for (let i = 0; i < 4; i++) {
          const entry = entries.nth(i);
          const img = entry.locator('img');
          const frame = await box(img.locator('xpath=..'));
          expect(near(frame.width, phone ? 88 : 150, 1), `entry ${i}: frame ${round(frame.width)}px`).toBe(true);
          const shown = await box(img);
          expect(near(shown.width / shown.height, 1.6, 0.03), `entry ${i}: thumbnail ${round(shown.width)}x${round(shown.height)}`).toBe(true);
          const fit = await style(img, ['object-fit']);
          expect(fit['object-fit']).toBe('cover');
        }
      });

      test(phone ? 'puts the status and address under the text' : 'puts the status and address in a column to the right of the text', async ({ page }) => {
        await open(page, '/');
        const entries = page.locator('section#other li.entry');
        for (let i = 0; i < 4; i++) {
          const entry = entries.nth(i);
          const text = await box(entry.getByRole('heading', { level: 3 }));
          const status = await box(entry.locator('.status'));
          const address = await box(entry.getByRole('link'));
          if (phone) {
            expect(status.y, `entry ${i}: status below the title`).toBeGreaterThanOrEqual(text.bottom - 1);
            expect(address.y, `entry ${i}: address below the title`).toBeGreaterThanOrEqual(text.bottom - 1);
            expect(address.right, 'address stays inside the page').toBeLessThanOrEqual(width - sidePadding(width) + 1);
          } else {
            expect(status.x, `entry ${i}: status right of the title`).toBeGreaterThan(text.right - 1);
            expect(address.x).toBeGreaterThan(text.right - 1);
          }
        }
      });

      test('rules each entry with a 1px hairline', async ({ page }) => {
        await open(page, '/');
        const entries = page.locator('section#other li.entry');
        for (let i = 0; i < 4; i++) {
          const s = await style(entries.nth(i), ['border-bottom-width', 'border-bottom-style', 'border-bottom-color']);
          expect(`${s['border-bottom-width']} ${s['border-bottom-style']} ${s['border-bottom-color']}`, `entry ${i}`).toBe(`1px solid ${rgb('light', 'rule')}`);
        }
      });
    });

    // -- How I work -------------------------------------------------------------------------------
    test.describe('how I work', () => {
      test(phone ? 'is one column: the lanes follow the text' : 'is two columns: heading and text left, lanes right', async ({ page }) => {
        await open(page, '/');
        const h2 = await box(page.locator('section#how h2'));
        const lanes = await box(page.locator('section#how dl.lanes'));
        if (phone) {
          expect(lanes.y).toBeGreaterThanOrEqual(h2.bottom);
          expect(near(lanes.x, h2.x, 1)).toBe(true);
        } else {
          expect(lanes.x, 'lanes start right of the heading').toBeGreaterThan(h2.right - 1);
          expect(lanes.y, 'lanes start level with the heading').toBeLessThan(h2.bottom + 40);
        }
      });

      test('shows each lane name above its detail on a phone and rules the rows', async ({ page }) => {
        await open(page, '/');
        const terms = await boxes(page.locator('section#how dl.lanes dt'));
        const details = await boxes(page.locator('section#how dl.lanes dd'));
        expect(terms).toHaveLength(4);
        if (phone) {
          terms.forEach((t, i) => {
            expect(details[i]!.y, `lane ${i}: detail below its name`).toBeGreaterThanOrEqual(t.bottom - 1);
            expect(near(details[i]!.x, t.x, 1), `lane ${i}: aligned`).toBe(true);
          });
        }
        const hairlines = await page.locator('section#how dl.lanes').evaluate((dl, rule) => {
          const els = [dl, ...Array.from(dl.querySelectorAll('div, dt, dd'))];
          return els.filter((el) => {
            const s = getComputedStyle(el);
            return (s.borderTopWidth === '1px' && s.borderTopColor === rule) || (s.borderBottomWidth === '1px' && s.borderBottomColor === rule);
          }).length;
        }, rgb('light', 'rule'));
        expect(hairlines, 'a hairline between the lanes').toBeGreaterThanOrEqual(3);
      });
    });

    // -- Footer ------------------------------------------------------------------------------------
    test.describe('footer', () => {
      test(`${phone ? 'stacks its two groups' : 'puts the line left and the links right'}, on the ground-alt band with a 1px rule`, async ({ page }) => {
        await open(page, '/');
        const footer = page.getByRole('contentinfo');
        const s = await style(footer, ['background-color', 'border-top-width', 'border-top-color', 'font-size', 'color']);
        expect(s['background-color']).toBe(rgb('light', 'ground-alt'));
        expect(s['border-top-width']).toBe('1px');
        expect(s['border-top-color']).toBe(rgb('light', 'rule'));
        expect(s['font-size']).toBe('13px');
        expect(s['color']).toBe(rgb('light', 'ink-faint'));
        const line = await box(footer.getByText('The Little AI Company · Jeff Kazzee · rural Idaho'));
        const links = await boxes(footer.getByRole('link'));
        if (phone) expect(Math.min(...links.map((l) => l.y)), 'links below the line').toBeGreaterThanOrEqual(line.bottom - 1);
        else {
          expect(Math.min(...links.map((l) => l.x)), 'links right of the line').toBeGreaterThan(line.right - 1);
          expect(near(links[0]!.y, line.y, 8), 'same row').toBe(true);
        }
        const bounds = await box(footer);
        expect(bounds.width, 'the band is full width').toBeGreaterThanOrEqual(width - 1);
      });
    });

    // -- Measure -----------------------------------------------------------------------------------
    test.describe('line length', () => {
      for (const info of PAGES) {
        test(`${info.label}: body text stops at 62ch and ledes at 52ch`, async ({ page }) => {
          await open(page, info);
          const check = async (selector: string, chs: number): Promise<void> => {
            const els = page.locator(selector);
            const count = await els.count();
            for (let i = 0; i < count; i++) {
              const el = els.nth(i);
              const limit = await chInPixels(el, chs);
              const b = await box(el);
              expect(b.width, `${selector} #${i} is ${round(b.width)}px, limit ${chs}ch = ${round(limit)}px`).toBeLessThanOrEqual(limit + 1);
            }
          };
          await check('main .lede', 52);
          // Prose only: not the lede, the now line, a numeral, a caption or quote, or a paragraph that holds a badge or button.
          await check('main p:not(.lede):not(.now):not(.numeral):not(.caption):not(.actions):not(:has(.status)):not(:has(.btn))', 62);
          await check('main dl.lanes dd', 62);
        });
      }
    });
  });
}

// -- The breakpoint itself --------------------------------------------------------------------------
test.describe('the 860px breakpoint', () => {
  test.use({ colorScheme: 'light' });

  const columnsOf = async (page: Page): Promise<number> => {
    const feature = page.locator('section#work article.feature').first();
    const media = await box(feature.locator('figure.plate'));
    const text = await box(feature.getByRole('heading', { level: 2 }));
    return Math.abs(media.x - text.x) > 20 ? 2 : 1;
  };

  for (const [width, layout] of [[860, 'phone'], [861, 'desktop']] as const) {
    test(`${width}px gets the ${layout} layout`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await open(page, '/');
      expect(await columnsOf(page), `feature columns at ${width}px`).toBe(layout === 'phone' ? 1 : 2);
      expect((await style(page.locator('section.hero'), ['padding-top']))['padding-top']).toBe(layout === 'phone' ? '36px' : '88px');
      expect((await style(page.locator('section#work'), ['padding-top']))['padding-top']).toBe(layout === 'phone' ? '56px' : '96px');
      const mascot = await page.locator('section.hero picture img').evaluate((el: HTMLImageElement) => el.currentSrc);
      expect(mascot).toContain(layout === 'phone' ? '-640.webp' : '-760.webp');
      const nav = await box(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Callout', exact: true }));
      const brand = await box(page.getByRole('navigation', { name: 'Main' }).getByRole('link').first());
      expect(nav.y >= brand.bottom - 1, `nav links on their own row: ${layout === 'phone'}`).toBe(layout === 'phone');
    });
  }

  test('resizing across the breakpoint reflows the page without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: VIEWPORT_HEIGHT });
    await open(page, '/');
    for (const width of [1280, 861, 860, 600, 320, 861, 1280]) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});
