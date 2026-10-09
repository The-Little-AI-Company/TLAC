/**
 * Motion: one curve at .18s for color and border changes, nothing moves on load, and
 * prefers-reduced-motion: reduce stops every transition.
 */
import type { Page } from '@playwright/test';
import { normalizeValue } from '../helpers/css';
import { HOME, MOTION } from '../helpers/spec';
import { PAGES, SCHEMES, VIEWPORT_HEIGHT, expect, loadEverything, nextFrames, open, rgb, secondsOf, test } from './support';

const [getCallout, seeVivary] = HOME.buttons;
const MOTION_MS = MOTION.seconds * 1000;

/** The curves of a computed `transition-timing-function`, split at the commas outside parentheses. */
const curvesOf = (timing: string): string[] => timing.split(/,(?![^(]*\))/).map(normalizeValue);

/** Longest transition or animation duration on the page, in seconds, and which element has it. */
async function longestMotion(page: Page): Promise<{ transition: number; animation: number; where: string }> {
  const all = await page.evaluate(() =>
    Array.from(document.querySelectorAll('*')).map((el) => {
      const cs = getComputedStyle(el);
      return {
        where: `${el.tagName.toLowerCase()}.${String(el.className)} (${cs.transitionProperty})`,
        transition: cs.transitionDuration,
        animation: cs.animationName === 'none' ? '0s' : cs.animationDuration,
      };
    }),
  );
  let transition = 0;
  let animation = 0;
  let where = '';
  for (const el of all) {
    const t = Math.max(...secondsOf(el.transition));
    if (t > transition) {
      transition = t;
      where = el.where;
    }
    animation = Math.max(animation, ...secondsOf(el.animation));
  }
  return { transition, animation, where };
}

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1280, height: VIEWPORT_HEIGHT } });

  test('a button has a transition duration of at most 0.01s', async ({ page }) => {
    await open(page, '/');
    const duration = await page.getByRole('link', { name: getCallout.label }).evaluate((el) => getComputedStyle(el).transitionDuration);
    for (const d of secondsOf(duration)) expect(d, `transition-duration ${duration}`).toBeLessThanOrEqual(0.01);
  });

  for (const info of PAGES) {
    test(`${info.label}: no element transitions for longer than 0.01s, and none animates`, async ({ page }) => {
      await open(page, info);
      const motion = await longestMotion(page);
      expect(motion.transition, `longest transition ${motion.transition}s on ${motion.where}`).toBeLessThanOrEqual(0.01);
      expect(motion.animation).toBeLessThanOrEqual(0.01);
    });
  }

  test('hover colors apply at once', async ({ page }) => {
    await open(page, '/');
    const secondary = page.getByRole('link', { name: seeVivary.label });
    await secondary.hover();
    // No polling: with reduced motion the new border color is there on the next frame.
    await nextFrames(page);
    const border = await secondary.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).toBe(rgb('light', 'ink'));
  });
});

test.describe('without reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' }, viewport: { width: 1280, height: VIEWPORT_HEIGHT } });

  test('a button transitions its colors over .18s on the one curve', async ({ page }) => {
    await open(page, '/');
    const s = await page.getByRole('link', { name: getCallout.label }).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { duration: cs.transitionDuration, timing: cs.transitionTimingFunction, property: cs.transitionProperty };
    });
    expect(secondsOf(s.duration).every((d) => Math.abs(d - MOTION.seconds) < 0.001), s.duration).toBe(true);
    expect(curvesOf(s.timing).every((t) => t === normalizeValue(MOTION.ease)), s.timing).toBe(true);
    expect(s.property).not.toMatch(/\ball\b|transform|opacity|width|height/);
  });

  test('links and buttons all use the same .18s duration', async ({ page }) => {
    await open(page, '/');
    const durations = await page.locator('a').evaluateAll((links) => links.map((a) => getComputedStyle(a).transitionDuration));
    expect(new Set(durations.flatMap(secondsOf).map((d) => Math.round(d * 1000)))).toEqual(new Set([MOTION_MS]));
  });
});

for (const scheme of SCHEMES) {
  test.describe(`nothing moves on load, ${scheme}`, () => {
    test.use({ viewport: { width: 1280, height: VIEWPORT_HEIGHT }, colorScheme: scheme, contextOptions: { reducedMotion: 'no-preference' } });

    for (const info of PAGES) {
      test(`${info.label}: no transition or animation runs while it loads, and nothing shifts once every image and font is in`, async ({ page }) => {
        await page.addInitScript(() => {
          const w = window as unknown as { __motion: string[] };
          w.__motion = [];
          for (const type of ['transitionrun', 'transitionstart', 'animationstart']) {
            document.addEventListener(type, (event) => w.__motion.push(`${type} on ${(event.target as Element)?.tagName}`), true);
          }
        });
        /** Where the first 80 elements of main sit on the page, whatever the scroll position, to a tenth of a pixel. */
        const positions = (): Promise<number[]> =>
          page.evaluate(() => Array.from(document.querySelectorAll('main *')).slice(0, 80).map((el) => Math.round((el.getBoundingClientRect().top + window.scrollY) * 10)));

        await open(page, info);
        const first = await positions();
        await loadEverything(page);
        await nextFrames(page);

        expect(await positions(), 'element positions changed after every image and font loaded').toEqual(first);
        expect(await page.evaluate(() => (window as unknown as { __motion: string[] }).__motion), 'transition or animation events').toEqual([]);
        expect(await page.evaluate(() => document.getAnimations().length), 'running CSS transitions or animations').toBe(0);
      });
    }
  });
}
