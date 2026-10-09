/**
 * SPEC section 10: WCAG contrast of the token pairs, computed from design/tokens.json for
 * both company themes. Each pair is its own case so a failure names the pair and the theme.
 * (tokens.test.ts proves tokens.css carries the same values.)
 */
import { describe, expect, it } from 'vitest';
import { contrast } from '../helpers/color';
import { THEMES, themeColor, type ColorName } from '../helpers/tokens';

type Pair = readonly [foreground: ColorName, background: ColorName, minimum: number, why: string];

/** The pairs SPEC section 10 lists. */
const SPEC_PAIRS: readonly Pair[] = [
  ['ink', 'ground', 4.5, 'headlines and primary text'],
  ['ink', 'raised', 4.5, 'text on plates'],
  ['ink-soft', 'ground', 4.5, 'body copy and nav links'],
  ['ink-soft', 'raised', 4.5, 'body copy on plates'],
  ['ink-faint', 'ground', 4.5, 'captions, dates, status words'],
  ['ink-faint', 'raised', 4.5, 'captions on plates'],
  ['ink-faint', 'ground-alt', 4.5, 'footer text'],
  ['accent', 'ground', 4.5, 'links, the numeral'],
  ['accent', 'raised', 4.5, 'links and numerals on plates'],
  ['accent-hover', 'ground', 4.5, 'link hover'],
  ['accent-hover', 'raised', 4.5, 'link hover on plates'],
  ['on-accent', 'accent-fill', 4.5, 'primary button label'],
  ['on-accent', 'accent-hover', 4.5, 'primary button label on hover'],
  ['danger', 'ground', 4.5, 'error text'],
  ['success', 'ground', 4.5, 'confirmation text'],
  ['field', 'raised', 3, 'secondary button and field borders (non-text)'],
  ['field', 'ground', 3, 'secondary button borders on the page (non-text)'],
  ['status-live', 'ground', 3, 'live and shipped dot (non-text)'],
  ['status-wip', 'ground', 3, 'work in progress dot (non-text)'],
  ['ink', 'selection', 4.5, 'selected text'],
];

/** Pairs the spec implies but does not list: the footer sits on ground-alt with ink-soft links, and the focus ring is accent. */
const IMPLIED_PAIRS: readonly Pair[] = [
  ['ink', 'ground-alt', 4.5, 'footer text in ink'],
  ['ink-soft', 'ground-alt', 4.5, 'footer links (SPEC 6: links in the footer are ink-soft)'],
  ['accent', 'ground-alt', 3, 'focus ring on footer links (non-text)'],
  ['status-live', 'raised', 3, 'status dot on a plate (non-text)'],
  ['status-wip', 'raised', 3, 'status dot on a plate (non-text)'],
  ['accent', 'selection', 3, 'a link inside a selection stays readable'],
];

const cases = (pairs: readonly Pair[]) => pairs.map(([fg, bg, min, why]) => [fg, bg, min, why] as const);

describe.each(THEMES)('contrast, %s', (theme) => {
  describe('pairs from SPEC section 10', () => {
    it.each(cases(SPEC_PAIRS))('%s on %s is at least %s:1 (%s)', (fg, bg, minimum) => {
      const ratio = contrast(themeColor(theme, fg), themeColor(theme, bg));
      expect(ratio, `${fg} ${themeColor(theme, fg)} on ${bg} ${themeColor(theme, bg)} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum);
    });
  });

  describe('pairs the spec implies', () => {
    it.each(cases(IMPLIED_PAIRS))('%s on %s is at least %s:1 (%s)', (fg, bg, minimum) => {
      const ratio = contrast(themeColor(theme, fg), themeColor(theme, bg));
      expect(ratio, `${fg} ${themeColor(theme, fg)} on ${bg} ${themeColor(theme, bg)} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum);
    });
  });
});
