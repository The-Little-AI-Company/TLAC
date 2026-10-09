/**
 * SPEC section 3: the type scale as the browser computes it, desktop and phone, plus sweeps over
 * every element of every page for the rules that hold everywhere: no uppercase, no italic style,
 * display faces at weight 400, italics only on captions and numerals, only color transitions.
 */
import type { Locator, Page } from '@playwright/test';
import { PAGES, VIEWPORT_HEIGHT, expect, firstFamily, isPhone, loadEverything, open, rgb, secondsOf, style, test } from './support';

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
  { name: 'display-l: a feature title', page: '/', locate: (p) => p.getByRole('heading', { level: 2, name: 'Vivary' }), family: 'Instrument Serif', size: [64, 40], lineHeight: 1, weight: '400', tracking: -0.005 },
  { name: 'heading: a section h2', page: '/', locate: (p) => p.getByRole('heading', { level: 2, name: 'Other things I have made' }), family: 'Instrument Serif', size: [44, 32], lineHeight: 1.05, weight: '400' },
  { name: 'heading: a tool page section h2', page: '/callout/', locate: (p) => p.getByRole('heading', { level: 2, name: 'What it does' }), family: 'Instrument Serif', size: [44, 32], lineHeight: 1.05, weight: '400' },
  { name: 'title: a project name', page: '/', locate: (p) => p.getByRole('heading', { level: 3, name: 'Open World Factbook' }), family: 'Instrument Serif', size: [28, 22], lineHeight: 1.1, weight: '400' },
  { name: 'caption: a plate caption', page: '/', locate: (p) => p.locator('section#work figcaption').first(), family: 'Instrument Serif Italic', size: [17, 15], lineHeight: 1.4, weight: '400' },
  { name: 'lede: the home lede', page: '/', locate: (p) => p.locator('section.hero .lede'), family: 'Instrument Sans', size: [19, 16], lineHeight: 1.65, weight: '400' },
  { name: 'lede: an inner page lede', page: '/contact/', locate: (p) => p.locator('main .lede'), family: 'Instrument Sans', size: [19, 16], lineHeight: 1.65, weight: '400' },
  { name: 'text: a feature paragraph', page: '/', locate: (p) => p.locator('section#work article.feature').first().getByText('A desktop workspace for working with AI agents', { exact: false }), family: 'Instrument Sans', size: [16, 16], lineHeight: 1.6, weight: '400' },
  { name: 'text: a lane detail', page: '/about/', locate: (p) => p.locator('dl.lanes dd').first(), family: 'Instrument Sans', size: [16, 16], lineHeight: 1.6, weight: '400' },
  { name: 'text-sm: a project line', page: '/', locate: (p) => p.locator('section#other li.entry').first().getByText('An open-source database'), family: 'Instrument Sans', size: [15, 15], lineHeight: 1.55, weight: '400' },
  { name: 'text-sm: a nav link', page: '/', locate: (p) => p.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Vivary', exact: true }), family: 'Instrument Sans', size: [15, 15], lineHeight: 1.55, weight: '400' },
  { name: 'label: a status word', page: '/', locate: (p) => p.locator('section#work .status').first(), family: 'Instrument Sans', size: [13, 13], lineHeight: 1.4, weight: '600' },
  { name: 'button-text: a button', page: '/', locate: (p) => p.getByRole('link', { name: 'Get Callout' }), family: 'Instrument Sans', size: [15, 15], lineHeight: 1, weight: '600' },
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
        expect(firstFamily(s['font-family'] ?? '')).toBe(row.family);
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

    test('the lede is ink-soft and the text is ink-soft', async ({ page }) => {
      await open(page, '/');
      expect((await style(page.locator('section.hero .lede'), ['color']))['color']).toBe(rgb('light', 'ink-soft'));
    });
  });
}

// ---------------------------------------------------------------------------------------------
// Sweeps: every element on every page

interface Offender {
  where: string;
  detail: string;
}

for (const width of [360, 1280] as const) {
  test.describe(`sweeps at ${width}px`, () => {
    test.use({ viewport: { width, height: VIEWPORT_HEIGHT }, colorScheme: 'light' });

    for (const info of PAGES) {
      test.describe(info.label, () => {
        test('no element is uppercase, italic, or lighter or heavier than its face allows', async ({ page }) => {
          await open(page, info);
          await loadEverything(page);
          const offenders = await page.evaluate((): Offender[] => {
            const out: Offender[] = [];
            const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}`;
            for (const el of Array.from(document.body.querySelectorAll('*'))) {
              const cs = getComputedStyle(el);
              const hasText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== '');
              // Empty elements (the status dots are <i>, which a browser italicises) show no letters, so they are exempt.
              if ((el.textContent ?? '').trim() === '') continue;
              if (cs.textTransform !== 'none') out.push({ where: name(el), detail: `text-transform: ${cs.textTransform}` });
              if (cs.fontStyle !== 'normal') out.push({ where: name(el), detail: `font-style: ${cs.fontStyle}` });
              if (cs.fontVariantCaps !== 'normal') out.push({ where: name(el), detail: `font-variant-caps: ${cs.fontVariantCaps}` });
              if (!hasText) continue;
              const family = (cs.fontFamily.split(',')[0] ?? '').replace(/["']/g, '').trim();
              if (family.startsWith('Instrument Serif') && cs.fontWeight !== '400') out.push({ where: name(el), detail: `${family} at weight ${cs.fontWeight}` });
              if (family !== 'Instrument Serif' && family !== 'Instrument Serif Italic' && family !== 'Instrument Sans') out.push({ where: name(el), detail: `font-family starts with ${family}` });
              if (parseFloat(cs.fontSize) < 13) out.push({ where: name(el), detail: `font-size ${cs.fontSize}` });
            }
            return out;
          });
          expect(offenders.map((o) => `${o.where}: ${o.detail}`)).toEqual([]);
        });

        test('the italic family appears only on captions and numerals', async ({ page }) => {
          await open(page, info);
          const strays = await page.evaluate(() =>
            Array.from(document.body.querySelectorAll('*'))
              .filter((el) => (getComputedStyle(el).fontFamily.split(',')[0] ?? '').replace(/["']/g, '').trim() === 'Instrument Serif Italic')
              .filter((el) => !el.matches('figcaption, .numeral') && !el.closest('figure.plate, .plate') && !el.closest('figcaption'))
              .map((el) => `${el.tagName.toLowerCase()}.${String(el.className)}: ${(el.textContent ?? '').trim().slice(0, 40)}`),
          );
          expect(strays).toEqual([]);
        });

        test('display text is never smaller than 20px, and titles and lane names never below 22px', async ({ page }) => {
          await open(page, info);
          const small = await page.evaluate(() =>
            Array.from(document.body.querySelectorAll('*'))
              .filter((el) => (getComputedStyle(el).fontFamily.split(',')[0] ?? '').replace(/["']/g, '').trim() === 'Instrument Serif')
              .filter((el) => Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== ''))
              .map((el) => ({ text: (el.textContent ?? '').trim().slice(0, 30), size: parseFloat(getComputedStyle(el).fontSize), isTitle: el.matches('h1, h2, h3, dt, .title') }))
              .map((e) => ({ ...e, tooSmall: e.size < (e.isTitle ? 22 : 20) })),
          );
          expect(small.length, 'every page sets at least its h1 in Instrument Serif').toBeGreaterThan(0);
          expect(small.filter((e) => e.tooSmall).map((e) => `${e.text}: ${e.size}px`)).toEqual([]);
        });

        test('transitions are .18s on the one curve, on color properties only', async ({ page }) => {
          await open(page, info);
          const offenders = await page.evaluate(() => {
            const out: string[] = [];
            for (const el of Array.from(document.body.querySelectorAll('*'))) {
              const cs = getComputedStyle(el);
              const durations = cs.transitionDuration.split(',').map((d) => d.trim());
              if (durations.every((d) => d === '0s')) continue;
              out.push(`${el.tagName.toLowerCase()}.${String(el.className)}|${cs.transitionProperty}|${cs.transitionDuration}|${cs.transitionTimingFunction}|${cs.transitionDelay}`);
            }
            return out;
          });
          const bad: string[] = [];
          for (const row of offenders) {
            const [el, props, durations, timing, delay] = row.split('|') as [string, string, string, string, string];
            if (!secondsOf(durations).every((d) => Math.abs(d - 0.18) < 0.001)) bad.push(`${el}: duration ${durations}`);
            if (!timing.split(/,(?![^(]*\))/).every((t) => t.trim() === 'cubic-bezier(0.22, 1, 0.36, 1)')) bad.push(`${el}: timing ${timing}`);
            if (!secondsOf(delay).every((d) => d === 0)) bad.push(`${el}: delay ${delay}`);
            for (const prop of props.split(',').map((p) => p.trim())) {
              if (!/^(?:color|background-color|border-color|border-(?:top|right|bottom|left)-color|text-decoration-color|outline-color|fill|stroke)$/.test(prop)) bad.push(`${el}: transitions ${prop}`);
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
