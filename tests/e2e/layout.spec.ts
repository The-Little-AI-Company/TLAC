/**
 * Layout: one breakpoint at 860px, a centered hero, one column on a phone, two on a desktop, full-width
 * 48px buttons (up to 440px), 44px nav links, a mascot that stands on the hairline. Between 360px and 860px the page margins, the display sizes and
 * the hero padding grow along a straight line from the phone value to the desktop one (`ramp`). Layout
 * does not depend on the color scheme, so this runs in light.
 */
import type { Locator, Page } from '@playwright/test';
import { NAV_LINKS, SITE_NAME } from '../helpers/dist';
import { FOOTER } from '../helpers/spec';
import {
  CONTENT_MAX, PAGES, VIEWPORT_HEIGHT, box, boxes, chInPixels, countHairlines, expect, firstFamily, isPhone, open, ramp, rgb, round, sidePadding, space, style, test, type Box,
} from './support';

const LAYOUT_WIDTHS = [320, 360, 768, 859, 860, 861, 1024, 1280, 1440] as const;
/** Widths across the range where a lane's name and meaning go from stacked to side by side. */
const LANE_WIDTHS = [861, 900, 1000, 1100, 1160, 1200, 1280, 1440] as const;
/** The pages made of split sections: a heading in a narrow column, the content in a wide one. */
const SPLIT_PAGES = ['/', '/callout/', '/vivary/', '/about/', '/contact/'] as const;
/** A lane is side by side when it is at least 13rem + 26rem + the gap between name and meaning wide (see Lane.astro), and stacked below that. */
const LANE_ROOM = 13 * 16 + 26 * 16 + space(5);
/** The bottom of the (empty) strut we put on the first line is that line's baseline. */
const baselineOf = (target: Locator): Promise<number> =>
  target.first().evaluate((el) => {
    const strut = document.createElement('span');
    strut.style.cssText = 'display:inline-block;width:0;height:0';
    el.prepend(strut);
    const y = strut.getBoundingClientRect().bottom + window.scrollY;
    strut.remove();
    return y;
  });
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
          const links = await boxes(nav.getByRole('link').filter({ hasNotText: SITE_NAME }));
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
        expect(firstFamily(text['font-family'])).toBe('Instrument Serif');
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

      test(`has ${width <= 360 ? '36px' : width >= 860 ? '88px' : 'between 36px and 88px'} of padding above the now line`, async ({ page }) => {
        await open(page, '/');
        const pad = await style(page.locator('section.hero'), ['padding-top']);
        expect(parseFloat(pad['padding-top'] ?? '0'), `padding-top ${pad['padding-top']} at ${width}px`).toBeCloseTo(ramp(width, 36, 88), 0);
      });

      test('keeps the headline to 12ch', async ({ page }) => {
        await open(page, '/');
        const h1 = page.locator('section.hero').getByRole('heading', { level: 1 });
        const limit = await chInPixels(h1, 12);
        expect((await box(h1)).width).toBeLessThanOrEqual(limit + 1);
      });

      test(phone ? 'stacks the two buttons, each as wide as its row (at most 440px) and at least 48px tall' : 'sets the two buttons side by side, at least 46px tall, not full width', async ({ page }) => {
        await open(page, '/');
        const row = await box(page.locator('section.hero .actions'));
        const btns = await boxes(page.locator('section.hero .actions .btn'));
        expect(btns).toHaveLength(2);
        if (phone) {
          for (const b of btns) {
            expect(near(b.width, row.width, 1), `button ${round(b.width)}px wide in a row ${round(row.width)}px wide`).toBe(true);
            expect(b.width, 'a stacked button is never wider than 440px').toBeLessThanOrEqual(440.5);
            expect(b.height, 'button height').toBeGreaterThanOrEqual(48);
          }
          expect(btns[1]!.y).toBeGreaterThanOrEqual(btns[0]!.bottom);
          const content = width - 2 * sidePadding(width);
          expect(near(row.width, Math.min(content, 440), 1), `the row is the page content (${round(content)}px) up to 440px, not ${round(row.width)}px`).toBe(true);
        } else {
          for (const b of btns) {
            expect(b.height, 'button height').toBeGreaterThanOrEqual(46);
            expect(b.width, 'buttons hug their label on a desktop').toBeLessThan(row.width);
          }
          expect(near(btns[0]!.y, btns[1]!.y, 1), 'same row').toBe(true);
          expect(btns[1]!.x).toBeGreaterThan(btns[0]!.right);
        }
      });

      test(`mascot is ${width <= 360 ? '260px' : width >= 860 ? 'about 470px (78% at most)' : 'between 260px and 470px'} wide, centered, and loads the ${phone ? '640' : '760'}px file`, async ({ page }) => {
        await open(page, '/');
        const img = page.locator('section.hero picture img');
        const b = await box(img);
        const expected = Math.min(ramp(width, 260, 470), 0.78 * (width - 2 * sidePadding(width)));
        expect(b.width, `mascot ${round(b.width)}px wide at ${width}px, expected ${round(expected)}px`).toBeCloseTo(expected, 0);
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
      const sectionPadding = space(phone ? 7 : 9);
      for (const id of ['work', 'other', 'how']) {
        test(`#${id} has ${sectionPadding}px of vertical padding and a 1px rule on top`, async ({ page }) => {
          await open(page, '/');
          const s = await style(page.locator(`section#${id}`), ['padding-top', 'padding-bottom', 'border-top-width', 'border-top-style', 'border-top-color', 'background-color']);
          expect(s['padding-top']).toBe(`${sectionPadding}px`);
          expect(s['padding-bottom']).toBe(`${sectionPadding}px`);
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
      test(phone ? 'are one column: the plate and the text share the same edges' : `are two columns in the ratio 1.2 to 1 with a ${space(7)}px gap`, async ({ page }) => {
        await open(page, '/');
        const features = page.locator('section#work article.feature');
        expect(await features.count()).toBe(2);
        for (let i = 0; i < 2; i++) {
          const feature = features.nth(i);
          const text = await box(feature.locator('.copy'));
          const media = await box(feature.locator('.media'));
          if (phone) {
            expect(near(text.x, media.x, 1), `feature ${i}: left edges`).toBe(true);
            expect(near(text.width, media.width, 1), `feature ${i}: widths`).toBe(true);
            expect(Math.max(text.y, media.y), `feature ${i}: stacked, not side by side`).toBeGreaterThanOrEqual(Math.min(text.bottom, media.bottom) - 1);
          } else {
            const left = i === 0 ? media : text; // the second feature is reversed
            const right = i === 0 ? text : media;
            expect(left.right, `feature ${i}: columns do not overlap`).toBeLessThanOrEqual(right.x);
            expect(near(right.x - left.right, space(7), 1), `feature ${i}: gap ${round(right.x - left.right)}px`).toBe(true);
            const ratio = media.width / text.width;
            expect(ratio, `feature ${i}: media ${round(media.width)}px, text ${round(text.width)}px`).toBeGreaterThan(1.1);
            expect(ratio).toBeLessThan(1.3);
          }
        }
      });

      test('put the Vivary plate first and the Callout facts plate last on a desktop (reverse layout)', async ({ page }) => {
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

      test(phone ? 'are clearly apart from each other' : `have --space-9 (${space(9)}px) between them`, async ({ page }) => {
        await open(page, '/');
        const [a, b] = await boxes(page.locator('section#work article.feature'));
        const gap = b!.y - a!.bottom;
        if (phone) expect(gap, `gap between features ${round(gap)}px`).toBeGreaterThanOrEqual(40);
        else expect(near(gap, space(9), 2), `gap between features ${round(gap)}px`).toBe(true);
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
          const frame = await box(entry.locator('.thumb'));
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

      test('rules the rows, and sets each name above its meaning when the lane is too narrow for both side by side', async ({ page }) => {
        await open(page, '/');
        const terms = await boxes(page.locator('section#how dl.lanes dt'));
        const details = await boxes(page.locator('section#how dl.lanes dd'));
        const lanes = await boxes(page.locator('section#how dl.lanes .lane'));
        expect(terms).toHaveLength(4);
        terms.forEach((t, i) => {
          const stacked = details[i]!.y >= t.bottom - 1;
          const beside = details[i]!.x >= t.right - 1;
          if (lanes[i]!.width < LANE_ROOM - 1) expect(stacked, `lane ${i} is ${round(lanes[i]!.width)}px wide, too narrow to sit name and meaning side by side`).toBe(true);
          if (lanes[i]!.width > LANE_ROOM + 1) expect(beside, `lane ${i} is ${round(lanes[i]!.width)}px wide, wide enough to sit them side by side`).toBe(true);
          if (stacked) expect(near(details[i]!.x, t.x, 1), `lane ${i}: aligned`).toBe(true);
        });
        const hairlines = await countHairlines(page.locator('section#how dl.lanes'), rgb('light', 'rule'));
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
        const line = await box(footer.getByText(FOOTER.line, { exact: true }));
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

    test.describe('footer links', () => {
      test(phone ? 'keep to one row of 44px targets when they fit' : 'sit in one row', async ({ page }) => {
        await open(page, '/');
        const links = await boxes(page.getByRole('contentinfo').getByRole('link'));
        expect(links).toHaveLength(3);
        if (width >= 360) expect(new Set(links.map((l) => Math.round(l.y))).size, 'all three links share a row').toBe(1);
        if (phone) for (const l of links) expect(l.height, 'tap target').toBeGreaterThanOrEqual(44);
        const note = await style(page.getByRole('contentinfo').locator('.note'), ['text-wrap-style']);
        expect(note['text-wrap-style']).toBe('balance');
      });
    });

    // -- Tool heroes -------------------------------------------------------------------------------
    test.describe('tool heroes', () => {
      for (const [path, what] of [['/callout/', 'facts plate'], ['/vivary/', 'screenshot']] as const) {
        test(`${path}: the ${what} sits ${phone ? 'under the buttons, as wide as the text' : 'right of the text, level with its middle, in the ratio 1.2 to 1'}`, async ({ page }) => {
          await open(page, path);
          const hero = page.locator('main section').first();
          const copy = await box(hero.locator('.copy'));
          const media = await box(hero.locator('.plate'));
          if (phone) {
            expect(media.y, `plate top ${round(media.y)} vs copy bottom ${round(copy.bottom)}`).toBeGreaterThanOrEqual(copy.bottom - 1);
            expect(near(media.x, copy.x, 1) && near(media.width, copy.width, 1), 'same column').toBe(true);
          } else {
            expect(media.x, `plate left ${round(media.x)} vs copy right ${round(copy.right)}`).toBeGreaterThanOrEqual(copy.right);
            expect(near(media.y + media.height / 2, copy.y + copy.height / 2, 2), 'level with the middle of the text').toBe(true);
            expect(near(media.width / copy.width, 1.2, 0.05), `media ${round(media.width)}px, copy ${round(copy.width)}px`).toBe(true);
          }
        });
      }

      test(`stacked buttons on a tool page and the 404 page are never wider than 440px${phone ? '' : ', and hug their labels on a desktop'}`, async ({ page }) => {
        for (const path of ['/callout/', '/vivary/', '/404.html']) {
          await open(page, path);
          const btns = await boxes(page.locator('main section').first().locator('.actions .btn'));
          expect(btns.length, path).toBeGreaterThanOrEqual(2);
          for (const b of btns) {
            if (phone) expect(b.width, `${path}: button ${round(b.width)}px`).toBeLessThanOrEqual(440.5);
            else expect(b.width, `${path}: button ${round(b.width)}px`).toBeLessThan(300);
          }
        }
      });
    });

    // -- Split sections ------------------------------------------------------------------------------
    test.describe('split sections', () => {
      test(phone ? `leave the same ${space(5)}px between the heading column and the content on every page` : 'share the same two column lines on every page (heading left, content in the ratio 1 to 2)', async ({ page }) => {
        const found: { path: string; intro: Box; matter: Box }[] = [];
        for (const path of SPLIT_PAGES) {
          await open(page, path);
          const intros = await boxes(page.locator('.split > .intro'));
          const matters = await boxes(page.locator('.split > .matter'));
          expect(intros.length, `${path} has split sections`).toBeGreaterThan(0);
          intros.forEach((intro, i) => found.push({ path, intro, matter: matters[i]! }));
        }
        for (const { path, intro, matter } of found) {
          if (phone) {
            expect(near(matter.y - intro.bottom, space(5), 1), `${path}: ${round(matter.y - intro.bottom)}px between the heading column and the content`).toBe(true);
            expect(near(matter.x, intro.x, 1), `${path}: one column`).toBe(true);
          } else {
            expect(near(intro.x, found[0]!.intro.x, 1), `${path}: heading column starts at ${round(intro.x)}`).toBe(true);
            expect(near(matter.x, found[0]!.matter.x, 1), `${path}: content starts at ${round(matter.x)}`).toBe(true);
            expect(near(matter.width / intro.width, 2, 0.02), `${path}: content ${round(matter.width)}px beside heading ${round(intro.width)}px`).toBe(true);
          }
        }
      });

      if (!phone) {
        test('put the heading baseline on the baseline of the first lane name', async ({ page }) => {
          for (const path of SPLIT_PAGES) {
            await open(page, path);
            const sections = page.locator('.split:has(.matter > .lanes)');
            expect(await sections.count(), `${path} has sections of lanes to measure`).toBeGreaterThan(0);
            for (let i = 0; i < (await sections.count()); i++) {
              const heading = await baselineOf(sections.nth(i).locator('h2'));
              const name = await baselineOf(sections.nth(i).locator('dt').first());
              expect(Math.abs(heading - name), `${path} section ${i}: heading baseline ${round(heading)}, first lane name ${round(name)}`).toBeLessThanOrEqual(1);
            }
          }
        });
      }
    });

    // -- 404 -----------------------------------------------------------------------------------------
    test.describe('the 404 page', () => {
      test('is one centered block, in the middle of the space between the header and the footer', async ({ page }) => {
        await open(page, '/404.html');
        const section = await box(page.locator('main section.page-head'));
        const header = await box(page.getByRole('banner'));
        const footer = await box(page.getByRole('contentinfo'));
        for (const part of [page.getByRole('heading', { level: 1 }), page.locator('main .lede'), page.locator('main .actions')]) {
          const b = await box(part);
          expect(near(center(b), width / 2, 2), `centered (${round(center(b))} vs ${width / 2})`).toBe(true);
        }
        expect((await style(page.locator('main section.page-head'), ['text-align']))['text-align']).toBe('center');
        expect(near(section.y - header.bottom, footer.y - section.bottom, 2), `${round(section.y - header.bottom)}px above the block, ${round(footer.y - section.bottom)}px below`).toBe(true);
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
          // Prose only: not the lede, the now line, a numeral, a caption, a quotation (it fills its plate), or a paragraph that holds a badge or button.
          await check('main p:not(.lede):not(.now):not(.numeral):not(.caption):not(.actions):not(blockquote p):not(:has(.status)):not(:has(.btn))', 62);
          await check('main dl.lanes dd', 62);
        });
      }
    });
  });
}

// -- Lanes, from just past the breakpoint to the widest screen ------------------------------------------
for (const width of LANE_WIDTHS) {
  test.describe(`lanes at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    for (const path of SPLIT_PAGES) {
      test(`${path}: no lane name breaks into three lines or more, and each lane is stacked or side by side by its room`, async ({ page }) => {
        await open(page, path);
        const lanes = page.locator('dl.lanes .lane');
        const count = await lanes.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const lane = lanes.nth(i);
          const name = lane.locator('dt');
          const [laneBox, nameBox, meaningBox, nameStyle] = await Promise.all([box(lane), box(name), box(lane.locator('dd')), style(name, ['line-height'])]);
          const lines = Math.round(nameBox.height / parseFloat(nameStyle['line-height'] ?? '1'));
          const text = (await name.textContent())?.trim();
          expect(lines, `"${text}" breaks into ${lines} lines in a lane ${round(laneBox.width)}px wide`).toBeLessThanOrEqual(2);
          const stacked = meaningBox.y >= nameBox.bottom - 1;
          if (laneBox.width < LANE_ROOM - 1) expect(stacked, `"${text}": lane ${round(laneBox.width)}px wide should stack`).toBe(true);
          if (laneBox.width > LANE_ROOM + 1) expect(stacked, `"${text}": lane ${round(laneBox.width)}px wide should sit side by side`).toBe(false);
        }
      });
    }
  });
}

// -- A long address must not squeeze the description of a project -------------------------------------
for (const width of [861, 900, 950, 1024] as const) {
  test.describe(`project list at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    test('keeps the description at 300px or wider, and wraps the long address in its column', async ({ page }) => {
      await open(page, '/');
      const entries = page.locator('section#other li.entry');
      for (let i = 0; i < (await entries.count()); i++) {
        const copy = await box(entries.nth(i).locator('.copy'));
        const link = entries.nth(i).locator('.meta a');
        const address = await box(link);
        const limit = await chInPixels(link, 24);
        expect(copy.width, `entry ${i}: description column ${round(copy.width)}px`).toBeGreaterThanOrEqual(300);
        expect(address.width, `entry ${i}: address ${round(address.width)}px, limit 24ch = ${round(limit)}px`).toBeLessThanOrEqual(limit + 1);
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
      // The hero padding is fluid up to 860px, where it reaches the desktop value, so the two layouts agree there.
      expect(parseFloat((await style(page.locator('section.hero'), ['padding-top']))['padding-top'] ?? '0')).toBeCloseTo(88, 0);
      expect((await style(page.locator('section#work'), ['padding-top']))['padding-top']).toBe(layout === 'phone' ? '56px' : '96px');
      const mascot = await page.locator('section.hero picture img').evaluate((el: HTMLImageElement) => el.currentSrc);
      expect(mascot).toContain(layout === 'phone' ? '-640.webp' : '-760.webp');
      const nav = await box(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: NAV_LINKS[0].label, exact: true }));
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
