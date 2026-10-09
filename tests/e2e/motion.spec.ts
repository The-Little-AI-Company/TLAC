/**
 * SPEC section 0 "Motion": one curve at .18s for color and border changes, nothing moves on load,
 * and prefers-reduced-motion: reduce stops every transition.
 */
import type { Page } from '@playwright/test';
import { PAGES, SCHEMES, VIEWPORT_HEIGHT, box, expect, loadEverything, open, rgb, secondsOf, test } from './support';

/** Longest transition or animation duration on the page, in seconds, and which element has it. */
async function longestMotion(page: Page): Promise<{ transition: number; animation: number; where: string }> {
  return page.evaluate(() => {
    let transition = 0;
    let animation = 0;
    let where = '';
    const seconds = (list: string): number[] => list.split(',').map((v) => (v.trim().endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v)));
    for (const el of Array.from(document.querySelectorAll('*'))) {
      const cs = getComputedStyle(el);
      const t = Math.max(...seconds(cs.transitionDuration));
      const a = cs.animationName === 'none' ? 0 : Math.max(...seconds(cs.animationDuration));
      if (t > transition) {
        transition = t;
        where = `${el.tagName.toLowerCase()}.${String(el.className)} (${cs.transitionProperty})`;
      }
      animation = Math.max(animation, a);
    }
    return { transition, animation, where };
  });
}

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' }, viewport: { width: 1280, height: VIEWPORT_HEIGHT } });

  test('a button has a transition duration of at most 0.01s', async ({ page }) => {
    await open(page, '/');
    const duration = await page.getByRole('link', { name: 'Get Callout' }).evaluate((el) => getComputedStyle(el).transitionDuration);
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
    const secondary = page.getByRole('link', { name: 'See Vivary' });
    await secondary.hover();
    // No polling: with reduced motion the new border color is there on the next frame.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined)))));
    const border = await secondary.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(border).toBe(rgb('light', 'ink'));
  });
});

test.describe('without reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' }, viewport: { width: 1280, height: VIEWPORT_HEIGHT } });

  test('a button transitions its colors over .18s on the one curve', async ({ page }) => {
    await open(page, '/');
    const s = await page.getByRole('link', { name: 'Get Callout' }).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { duration: cs.transitionDuration, timing: cs.transitionTimingFunction, property: cs.transitionProperty };
    });
    expect(secondsOf(s.duration).every((d) => Math.abs(d - 0.18) < 0.001), s.duration).toBe(true);
    expect(s.timing.split(/,(?![^(]*\))/).every((t) => t.trim() === 'cubic-bezier(0.22, 1, 0.36, 1)'), s.timing).toBe(true);
    expect(s.property).not.toMatch(/\ball\b|transform|opacity|width|height/);
  });

  test('links and buttons all use the same .18s duration', async ({ page }) => {
    await open(page, '/');
    const durations = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a')).map((a) => Math.max(...getComputedStyle(a).transitionDuration.split(',').map((d) => parseFloat(d)))),
    );
    expect(new Set(durations.map((d) => Math.round(d * 1000)))).toEqual(new Set([180]));
  });
});

for (const scheme of SCHEMES) {
  test.describe(`nothing moves on load, ${scheme}`, () => {
    test.use({ viewport: { width: 1280, height: VIEWPORT_HEIGHT }, colorScheme: scheme, contextOptions: { reducedMotion: 'no-preference' } });

    for (const info of PAGES) {
      test(`${info.label}: no transition or animation runs while it loads, and nothing shifts afterwards`, async ({ page }) => {
        await page.addInitScript(() => {
          const w = window as unknown as { __motion: string[] };
          w.__motion = [];
          for (const type of ['transitionrun', 'transitionstart', 'animationstart']) {
            document.addEventListener(type, (event) => w.__motion.push(`${type} on ${(event.target as Element)?.tagName}`), true);
          }
        });
        await open(page, info);
        const first = await page.evaluate(() => Array.from(document.querySelectorAll('main *')).slice(0, 80).map((el) => Math.round(el.getBoundingClientRect().top * 10)));
        await page.waitForTimeout(400);
        const second = await page.evaluate(() => Array.from(document.querySelectorAll('main *')).slice(0, 80).map((el) => Math.round(el.getBoundingClientRect().top * 10)));
        expect(second, 'element positions changed after load').toEqual(first);
        const events = await page.evaluate(() => (window as unknown as { __motion: string[] }).__motion);
        expect(events).toEqual([]);
        await loadEverything(page);
        const hero = await box(page.locator('main h1'));
        expect(hero.height).toBeGreaterThan(20);
      });
    }
  });
}
