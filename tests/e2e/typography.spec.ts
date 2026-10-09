/**
 * The type scale as the browser computes it, desktop and phone, plus sweeps over every element of
 * every page for the rules that hold everywhere: no uppercase, no italic style, display faces at
 * weight 400, italics only on captions and numerals, only color transitions.
 */
import type { Locator, Page } from '@playwright/test';
import { normalizeValue } from '../helpers/css';
import { NAV_LINKS } from '../helpers/dist';
import { ABOUT_PAGE, CALLOUT_PAGE, HOME, MOTION, PROJECTS } from '../helpers/spec';
import { PAGES, VIEWPORT_HEIGHT, expect, firstFamily, isPhone, loadEverything, open, ramp, secondsOf, style, test } from './support';

interface Scale {
  /** What the row is, for the test title. */
  name: string;
  page: string;
  locate: (page: Page) => Locator;
  family: 'Instrument Serif' | 'Instrument Serif Italic' | 'Instrument Sans';
  /** Desktop and phone font size in px. */
  size: readonly [desktop: number, phone: number];
  /** Line height as a multiple of the font size: one number, or desktop and phone. */
  lineHeight: number | readonly [desktop: number, phone: number];
  weight: string;
  /** Letter spacing in em. Rows without it are not checked. */
  tracking?: number;
}

const SCALE: readonly Scale[] = [
  { name: 'display-xl: the home h1', page: '/', locate: (p) => p.locator('section.hero').getByRole('heading', { level: 1 }), family: 'Instrument Serif', size: [92, 42], lineHeight: [0.98, 1.04], weight: '400', tracking: -0.005 },
  { name: 'display-l: an inner page h1', page: '/about/', locate: (p) => p.getByRole('heading', { level: 1 }), family: 'Instrument Serif', size: [64, 40], lineHeight: 1, weight: '400', tracking: -0.005 },
  { name: 'display-l: a feature title', page: '/', locate: (p) => p.getByRole('heading', { level: 2, name: HOME.vivary.title }), family: 'Instrument Serif', size: [64, 40], lineHeight: 1, weight: '400', tracking: -0.005 },
  { name: 'heading: a section h2', page: '/', locate: (p) => p.getByRole('heading', { level: 2, name: HOME.other.heading }), family: 'Instrument Serif', size: [44, 32], lineHeight: 1.05, weight: '400' },
  { name: 'heading: a tool page section h2', page: '/callout/', locate: (p) => p.getByRole('heading', { level: 2, name: CALLOUT_PAGE.sections[0].heading }), family: 'Instrument Serif', size: [44, 32], lineHeight: 1.05, weight: '400' },
  { name: 'title: a project name', page: '/', locate: (p) => p.getByRole('heading', { level: 3, name: PROJECTS[0].title }), family: 'Instrument Serif', size: [28, 24], lineHeight: 1.1, weight: '400' },
  { name: 'caption: a plate caption', page: '/', locate: (p) => p.locator('section#work figcaption').first(), family: 'Instrument Serif Italic', size: [17, 15], lineHeight: 1.4, weight: '400' },
  { name: 'lede: the home lede', page: '/', locate: (p) => p.locator('section.hero .lede'), family: 'Instrument Sans', size: [19, 16], lineHeight: 1.65, weight: '400' },
  { name: 'lede: an inner page lede', page: '/contact/', locate: (p) => p.locator('main .lede'), family: 'Instrument Sans', size: [19, 16], lineHeight: 1.65, weight: '400' },
  { name: 'text: a feature paragraph', page: '/', locate: (p) => p.locator('section#work article.feature').first().getByText(HOME.vivary.body, { exact: true }), family: 'Instrument Sans', size: [16, 16], lineHeight: 1.6, weight: '400' },
  { name: 'text: a lane detail', page: '/about/', locate: (p) => p.locator('dl.lanes dd').first(), family: 'Instrument Sans', size: [16, 16], lineHeight: 1.6, weight: '400' },
  { name: 'text-sm: a project line', page: '/', locate: (p) => p.locator('section#other li.entry').first().getByText(PROJECTS[0].line, { exact: true }), family: 'Instrument Sans', size: [15, 15], lineHeight: 1.55, weight: '400' },
  { name: 'text-sm: a nav link', page: '/', locate: (p) => p.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: NAV_LINKS[1].label, exact: true }), family: 'Instrument Sans', size: [15, 15], lineHeight: 1.55, weight: '400' },
  { name: 'label: a status word', page: '/', locate: (p) => p.locator('section#work .status').first(), family: 'Instrument Sans', size: [13, 13], lineHeight: 1.4, weight: '600' },
  { name: 'button-text: a button', page: '/', locate: (p) => p.getByRole('link', { name: HOME.buttons[0].label }), family: 'Instrument Sans', size: [15, 15], lineHeight: 1, weight: '600' },
];

for (const width of [1280, 360] as const) {
  const phone = isPhone(width);
  test.describe(`type scale at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    for (const row of SCALE) {
      test(row.name, async ({ page }) => {
        await open(page, row.page);
        const s = await style(row.locate(page), ['font-size', 'line-height', 'font-family', 'font-weight', 'font-style', 'letter-spacing', 'text-transform']);
        const expectedSize = phone ? row.size[1] : row.size[0];
        const lineHeight = typeof row.lineHeight === 'number' ? row.lineHeight : phone ? row.lineHeight[1] : row.lineHeight[0];
        expect(firstFamily(s['font-family'])).toBe(row.family);
        expect(s['font-size']).toBe(`${expectedSize}px`);
        expect(Math.abs(parseFloat(s['line-height'] ?? '0') - expectedSize * lineHeight), `line-height ${s['line-height']} for ${expectedSize}px x ${lineHeight}`).toBeLessThanOrEqual(0.6);
        expect(s['font-weight']).toBe(row.weight);
        expect(s['font-style']).toBe('normal');
        expect(s['text-transform']).toBe('none');
        if (row.tracking !== undefined) {
          const tracking = parseFloat(s['letter-spacing'] === 'normal' ? '0' : (s['letter-spacing'] ?? '0'));
          expect(Math.abs(tracking - row.tracking * expectedSize), `letter-spacing ${s['letter-spacing']}`).toBeLessThanOrEqual(0.06);
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------------------------
// Between the phone and the desktop: the display sizes are fluid, and agree with the scale at both ends

for (const width of [320, 360, 600, 768, 859, 860, 861, 1024, 1280, 1440] as const) {
  test.describe(`display sizes at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    test('run along the line from the phone size at 360px to the desktop size at 860px', async ({ page }) => {
      await open(page, '/');
      const xl = await style(page.locator('section.hero').getByRole('heading', { level: 1 }), ['font-size']);
      expect(parseFloat(xl['font-size'] ?? '0'), 'display-xl').toBeCloseTo(ramp(width, 42, 92), 1);
      await open(page, '/about/');
      const l = await style(page.getByRole('heading', { level: 1 }), ['font-size']);
      expect(parseFloat(l['font-size'] ?? '0'), 'display-l').toBeCloseTo(ramp(width, 40, 64), 1);
      const heading = await style(page.getByRole('heading', { level: 2, name: ABOUT_PAGE.position.heading }), ['font-size']);
      expect(parseFloat(heading['font-size'] ?? '0'), 'heading').toBeCloseTo(ramp(width, 32, 44), 1);
    });

    // Between 360px and 861px the sizes are on the ramp, which the test above checks. Outside it they are the design system's values.
    if (width <= 360 || width >= 861) {
      test('are exactly the design system values, the phone ones at 360px and below and the desktop ones at 861px and above', async ({ page }) => {
        const phone = width <= 360;
        await open(page, '/');
        expect((await style(page.locator('section.hero').getByRole('heading', { level: 1 }), ['font-size']))['font-size']).toBe(phone ? '42px' : '92px');
        await open(page, '/about/');
        expect((await style(page.getByRole('heading', { level: 1 }), ['font-size']))['font-size']).toBe(phone ? '40px' : '64px');
        expect((await style(page.getByRole('heading', { level: 2, name: ABOUT_PAGE.position.heading }), ['font-size']))['font-size']).toBe(phone ? '32px' : '44px');
      });
    }
  });
}

test.describe('text wrapping', () => {
  test.use({ viewport: { width: 1280, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

  const wrap = async (page: Page, selector: string): Promise<string> => (await style(page.locator(selector), ['text-wrap-style']))['text-wrap-style'] ?? '';

  test('balances display text, captions, lane names and the now line, so none ends on a lone word', async ({ page }) => {
    await open(page, '/');
    for (const selector of ['section.hero h1', 'section.hero .lede', 'section.hero .now', 'section#work figcaption', 'section#other h2', 'section#other h3', 'section#how dt', 'section#how h2', 'footer .note']) {
      expect(await wrap(page, selector), selector).toBe('balance');
    }
  });

  test('balances the lede under a page heading, which is two or three lines, and tidies the last line of longer text', async ({ page }) => {
    await open(page, '/callout/');
    expect(await wrap(page, '.page-head .lede'), '.page-head .lede').toBe('balance');
    for (const selector of ['#get-it .lede', 'main .text', 'main dd', 'main .text-sm']) expect(await wrap(page, selector), selector).toBe('pretty');
  });
});

// ---------------------------------------------------------------------------------------------
// Sweeps: every element on every page

/** What the sweeps need to know about one element of the page. The browser only reports it; the tests judge it. */
interface Sample {
  /** `tag.class.class`, for the failure message. */
  where: string;
  /** The first 30 characters of its text. */
  text: string;
  /** Whether it has no letters at all (the status dots are `<i>`, which a browser italicises). */
  empty: boolean;
  /** Whether text sits directly in it, rather than in a child. */
  ownText: boolean;
  /** A caption or a numeral, or inside a plate or a caption: the only places the italic family belongs. */
  italicAllowed: boolean;
  /** A heading, a lane name or a title. */
  isTitle: boolean;
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  fontStyle: string;
  fontVariantCaps: string;
  textTransform: string;
}

async function sample(page: Page): Promise<Sample[]> {
  return page.evaluate((): Sample[] =>
    Array.from(document.body.querySelectorAll('*')).map((el) => {
      const cs = getComputedStyle(el);
      const text = (el.textContent ?? '').trim();
      return {
        where: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}`,
        text: text.slice(0, 30),
        empty: text === '',
        ownText: Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== ''),
        italicAllowed: el.matches('figcaption, .numeral') || Boolean(el.closest('figure.plate, .plate, figcaption')),
        isTitle: el.matches('h1, h2, h3, dt, .title'),
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontSize: parseFloat(cs.fontSize),
        fontStyle: cs.fontStyle,
        fontVariantCaps: cs.fontVariantCaps,
        textTransform: cs.textTransform,
      };
    }),
  );
}

const FACES = ['Instrument Serif', 'Instrument Serif Italic', 'Instrument Sans'];

for (const width of [360, 1280] as const) {
  test.describe(`sweeps at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    for (const info of PAGES) {
      test.describe(info.label, () => {
        test('no element is uppercase, italic, or lighter or heavier than its face allows', async ({ page }) => {
          await open(page, info);
          await loadEverything(page);
          const problems: string[] = [];
          for (const el of (await sample(page)).filter((e) => !e.empty)) {
            if (el.textTransform !== 'none') problems.push(`${el.where}: text-transform: ${el.textTransform}`);
            if (el.fontStyle !== 'normal') problems.push(`${el.where}: font-style: ${el.fontStyle}`);
            if (el.fontVariantCaps !== 'normal') problems.push(`${el.where}: font-variant-caps: ${el.fontVariantCaps}`);
            if (!el.ownText) continue;
            const family = firstFamily(el.fontFamily);
            if (family.startsWith('Instrument Serif') && el.fontWeight !== '400') problems.push(`${el.where}: ${family} at weight ${el.fontWeight}`);
            if (!FACES.includes(family)) problems.push(`${el.where}: font-family starts with ${family}`);
            if (el.fontSize < 13) problems.push(`${el.where}: font-size ${el.fontSize}px`);
          }
          expect(problems).toEqual([]);
        });

        test('the italic family appears only on captions and numerals', async ({ page }) => {
          await open(page, info);
          const strays = (await sample(page)).filter((el) => firstFamily(el.fontFamily) === 'Instrument Serif Italic' && !el.italicAllowed);
          expect(strays.map((el) => `${el.where}: ${el.text}`)).toEqual([]);
        });

        test('display text is never smaller than 20px, and titles and lane names never below 22px', async ({ page }) => {
          await open(page, info);
          const display = (await sample(page)).filter((el) => firstFamily(el.fontFamily) === 'Instrument Serif' && el.ownText);
          expect(display.length, 'every page sets at least its h1 in Instrument Serif').toBeGreaterThan(0);
          expect(display.filter((el) => el.fontSize < (el.isTitle ? 22 : 20)).map((el) => `${el.text}: ${el.fontSize}px`)).toEqual([]);
        });

        test('transitions are .18s on the one curve, on color properties only', async ({ page }) => {
          await open(page, info);
          const transitions = await page.evaluate(() =>
            Array.from(document.body.querySelectorAll('*'))
              .map((el) => {
                const cs = getComputedStyle(el);
                return { where: `${el.tagName.toLowerCase()}.${String(el.className)}`, durations: cs.transitionDuration, timing: cs.transitionTimingFunction, delay: cs.transitionDelay, properties: cs.transitionProperty };
              })
              .filter((t) => !t.durations.split(',').every((d) => d.trim() === '0s')),
          );
          const bad: string[] = [];
          for (const t of transitions) {
            if (!secondsOf(t.durations).every((d) => Math.abs(d - MOTION.seconds) < 0.001)) bad.push(`${t.where}: duration ${t.durations}`);
            if (!t.timing.split(/,(?![^(]*\))/).every((curve) => normalizeValue(curve) === normalizeValue(MOTION.ease))) bad.push(`${t.where}: timing ${t.timing}`);
            if (!secondsOf(t.delay).every((d) => d === 0)) bad.push(`${t.where}: delay ${t.delay}`);
            for (const prop of t.properties.split(',').map((p) => p.trim())) {
              if (!/^(?:color|background-color|border-color|border-(?:top|right|bottom|left)-color|text-decoration-color|outline-color|fill|stroke)$/.test(prop)) bad.push(`${t.where}: transitions ${prop}`);
            }
          }
          expect(bad).toEqual([]);
        });

        test('nothing casts a shadow or paints a gradient, and corners use only the radius tokens', async ({ page }) => {
          await open(page, info);
          await loadEverything(page);
          const offenders = await page.evaluate((): string[] => {
            const out: string[] = [];
            for (const el of Array.from(document.body.querySelectorAll('*'))) {
              const cs = getComputedStyle(el);
              const name = `${el.tagName.toLowerCase()}.${String(el.className)}`;
              if (cs.boxShadow !== 'none' && !cs.boxShadow.includes('inset')) out.push(`${name}: box-shadow ${cs.boxShadow}`);
              if (cs.textShadow !== 'none') out.push(`${name}: text-shadow ${cs.textShadow}`);
              if (cs.backgroundImage !== 'none') out.push(`${name}: background-image ${cs.backgroundImage}`);
              if (cs.filter !== 'none') out.push(`${name}: filter ${cs.filter}`);
              const radius = cs.borderTopLeftRadius;
              // --radius-none, --radius-xs (buttons, fields, the skip link), --radius-sm (inline code), and round dots
              const allowed = ['0px', '2px', '4px', '50%'].includes(radius);
              if (!allowed && el.tagName.toLowerCase() !== 'svg' && el.tagName.toLowerCase() !== 'path') out.push(`${name}: border-radius ${radius}`);
            }
            return out;
          });
          expect(offenders).toEqual([]);
        });
      });
    }
  });
}
