/**
 * SPEC sections 0, 3 and 4 as rules over the CSS the site ships (the built stylesheets) and
 * over the sources under src/. Built CSS is minified, so values are compared normalised.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colorLiteralsInCss, colorLiteralsInSource } from '../helpers/color';
import {
  breakpoints,
  declarations,
  inside,
  isForcedColors,
  isReducedMotion,
  normalizeValue,
  parseCss,
  type CssBlock,
  type DeclarationContext,
} from '../helpers/css';
import { SRC, listFiles, siteCss } from '../helpers/dist';

const sheet = (): CssBlock[] => {
  const css = siteCss();
  if (!css.trim()) throw new Error('No built CSS found in dist/. Run `pnpm build`.');
  return parseCss(css);
};
const decls = (): DeclarationContext[] => declarations(sheet());
const owner = (ctx: DeclarationContext): CssBlock => ctx.chain[ctx.chain.length - 1]!;
const where = (ctx: DeclarationContext): string => `${owner(ctx).prelude} { ${ctx.declaration.prop}: ${ctx.declaration.value} }`;
const outsideReducedMotion = (ctx: DeclarationContext): boolean => !inside(ctx, isReducedMotion);
const inTokenBlock = (ctx: DeclarationContext): boolean => owner(ctx).kind === 'rule' && owner(ctx).prelude.replace(/\s+/g, '') === ':root';
const inFontFace = (ctx: DeclarationContext): boolean => ctx.chain.some((b) => b.kind === 'at' && b.name === 'font-face');

/** Duration in seconds from `.18s`, `180ms`, `0`. */
function seconds(value: string): number {
  const m = /^(-?\d*\.?\d+)(ms|s)?$/.exec(value.trim());
  if (!m) return Number.NaN;
  return m[2] === 'ms' ? Number(m[1]) / 1000 : Number(m[1]);
}

/** Splits at commas that are not inside parentheses. */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const c of value) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += c;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const sourceFiles = (): string[] => listFiles(SRC).filter((f) => /\.(astro|ts|tsx|js|mjs|css|html|svg|md|mdx)$/.test(f));

describe('color literals (SPEC 0)', () => {
  it('src/ has some files to check', () => {
    expect(sourceFiles().length).toBeGreaterThan(5);
  });

  it('has no color literal in src/ outside tokens.css and the theme-color metas', () => {
    const found: string[] = [];
    for (const file of sourceFiles()) {
      if (file === 'styles/tokens.css') continue;
      let text = readFileSync(join(SRC, file), 'utf-8');
      text = text.replace(/<meta\b[^>]*\bname=["']theme-color["'][^>]*>/gi, ' ');
      const literals = file.endsWith('.css') ? colorLiteralsInCss(text) : colorLiteralsInSource(text);
      for (const l of literals) found.push(`src/${file}: ${l.text}`);
    }
    expect(found, 'color literals found; use a token from tokens.css').toEqual([]);
  });

  it('has no color literal in the built CSS outside the :root token blocks', () => {
    const found = colorLiteralsInCss(siteCss(), (selector) => selector.replace(/\s+/g, '') === ':root').map((l) => l.text);
    expect(found, 'color literals found in built CSS rules').toEqual([]);
  });
});

describe('type rules (SPEC 3)', () => {
  it('never sets text-transform: uppercase (or capitalize)', () => {
    const bad = decls().filter((c) => c.declaration.prop === 'text-transform' && /uppercase|capitalize|full-width/.test(c.declaration.value));
    expect(bad.map(where)).toEqual([]);
  });

  it('never sets small caps', () => {
    const bad = decls().filter(
      (c) => (c.declaration.prop === 'font-variant-caps' || c.declaration.prop === 'font-variant') && /caps/.test(c.declaration.value),
    );
    expect(bad.map(where)).toEqual([]);
  });

  it('never sets font-style: italic or oblique, not even in the font shorthand or @font-face', () => {
    const bad = decls().filter(
      (c) =>
        (c.declaration.prop === 'font-style' && /italic|oblique/.test(c.declaration.value)) ||
        // var(--font-display-italic) is the italic family's name, not a style
        (c.declaration.prop === 'font' && /\b(?:italic|oblique)\b/.test(c.declaration.value.replace(/var\([^)]*\)/g, ''))),
    );
    expect(bad.map(where)).toEqual([]);
  });

  it('takes every font family from a --font-* token', () => {
    const FAMILY_VAR = /var\(--font-(?:display|display-italic|text|mono)\)/;
    const bad = decls().filter((c) => {
      if (inTokenBlock(c) || inFontFace(c)) return false;
      const { prop, value } = c.declaration;
      if (/^(?:inherit|initial|unset|revert)$/.test(value.trim())) return false;
      if (prop === 'font-family') return !new RegExp(`^${FAMILY_VAR.source}$`).test(value.trim());
      if (prop === 'font') return !FAMILY_VAR.test(value);
      return false;
    });
    expect(bad.map(where)).toEqual([]);
  });

  it('sets the family of the page itself: body text is Instrument Sans through --font-text', () => {
    const onPage = decls().filter(
      (c) =>
        /^(?:html|body|:root|\*)(?:\[|$|\s*,)/.test(owner(c).prelude.trim().split(',')[0] ?? '') &&
        (c.declaration.prop === 'font-family' || c.declaration.prop === 'font') &&
        /var\(--font-text\)/.test(c.declaration.value),
    );
    expect(onPage.length, 'html or body needs font-family: var(--font-text) (or the font shorthand with it)').toBeGreaterThan(0);
  });

  it('keeps display faces at weight 400', () => {
    const bad = decls().filter((c) => {
      if (!/^(?:h[1-6]|\.display-xl|\.display-l|\.heading|\.title|\.caption|\.numeral)\b/.test(owner(c).prelude.trim())) return false;
      const { prop, value } = c.declaration;
      return prop === 'font-weight' && !/^(?:400|normal)$/.test(value.trim());
    });
    expect(bad.map(where)).toEqual([]);
  });

  it('uses the italic family somewhere (captions and numerals). Where it lands is checked in the browser', () => {
    expect(decls().filter((c) => !inTokenBlock(c) && /var\(--font-display-italic\)/.test(c.declaration.value)).length).toBeGreaterThan(0);
  });
});

describe('type sizes (SPEC 3)', () => {
  it('sets every font size in rem, so a larger default text size in the browser scales the page', () => {
    const bad = decls().filter((c) => {
      const { prop, value } = c.declaration;
      if (prop !== 'font-size' && prop !== 'font') return false;
      return /\d(?:\.\d+)?px/.test(value);
    });
    expect(bad.map(where)).toEqual([]);
  });

  it('makes the display sizes fluid between the phone value at 360px and the desktop value at 860px', () => {
    const sizeOf = (selector: string): string | undefined =>
      decls().find((c) => owner(c).prelude.trim() === selector && c.declaration.prop === 'font-size' && outsideReducedMotion(c))?.declaration.value;
    for (const selector of ['.display-xl', '.display-l', '.heading']) expect(sizeOf(selector), selector).toMatch(/^clamp\(/);
  });
});

describe('forced colors', () => {
  const forced = (): DeclarationContext[] => decls().filter((c) => inside(c, isForcedColors));

  it('gives the filled status dots and the dot of the now line a border, since their color is a background', () => {
    const selectors = forced()
      .filter((c) => c.declaration.prop === 'border')
      .map((c) => owner(c).prelude);
    expect(selectors.some((s) => /\.status/.test(s) && /\bi\b/.test(s)), 'a filled status dot needs a border').toBe(true);
    expect(selectors.some((s) => /\.now/.test(s)), 'the now dot needs a border').toBe(true);
  });

  it('gives the primary button a 2px border, so it differs from the secondary one', () => {
    const rule = forced().find((c) => /\.btn--primary/.test(owner(c).prelude) && c.declaration.prop === 'border-width');
    expect(rule?.declaration.value.trim()).toBe('2px');
  });
});

describe('breakpoint (SPEC 0)', () => {
  it('uses 860px as the only width breakpoint, in media and container queries', () => {
    const widths = breakpoints(sheet());
    expect(widths.length, 'no width media or container queries found').toBeGreaterThan(0);
    expect(widths.filter((w) => w !== 860 && w !== 861), 'width queries other than 860px').toEqual([]);
    expect(widths).toContain(860);
  });
});

describe('motion (SPEC 0)', () => {
  const transitions = (): DeclarationContext[] => decls().filter((c) => /^transition(?:-|$)/.test(c.declaration.prop) && outsideReducedMotion(c));
  const COLOR_PROPERTIES = /^(?:color|background-color|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-color|text-decoration-color|outline-color|fill|stroke|caret-color)$/;
  const EASES = /^(?:var\(--ease\)|cubic-bezier\(\.22,1,\.36,1\))$/;
  const DURATIONS = /^(?:var\(--dur\)|\.18s|180ms)$/;

  it('has color and border transitions (hover and focus states)', () => {
    expect(transitions().length).toBeGreaterThan(0);
  });

  it('transitions only color properties, never all, transform, opacity, size or position', () => {
    const bad: string[] = [];
    for (const c of transitions()) {
      const { prop, value } = c.declaration;
      if (prop === 'transition') {
        for (const part of splitTopLevel(normalizeValue(value))) {
          const property = part.split(/\s+(?![^(]*\))/)[0] ?? '';
          if (!COLOR_PROPERTIES.test(property)) bad.push(`${where(c)} (property "${property}")`);
        }
      } else if (prop === 'transition-property') {
        for (const property of splitTopLevel(normalizeValue(value))) {
          if (!COLOR_PROPERTIES.test(property)) bad.push(`${where(c)} (property "${property}")`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('uses the one duration (.18s) and the one curve on every transition', () => {
    const bad: string[] = [];
    for (const c of transitions()) {
      const { prop, value } = c.declaration;
      const v = normalizeValue(value);
      if (prop === 'transition') {
        for (const part of splitTopLevel(v)) {
          const tokens = part.split(/\s+(?![^(]*\))/);
          if (!tokens.some((t) => DURATIONS.test(t))) bad.push(`${where(c)} (duration)`);
          if (!tokens.some((t) => EASES.test(t))) bad.push(`${where(c)} (curve)`);
          if (tokens.filter((t) => /^-?\d*\.?\d+m?s$/.test(t)).length > 1) bad.push(`${where(c)} (delay)`);
        }
      } else if (prop === 'transition-duration') {
        for (const d of splitTopLevel(v)) if (!DURATIONS.test(d)) bad.push(where(c));
      } else if (prop === 'transition-timing-function') {
        for (const e of splitTopLevel(v)) if (!EASES.test(e)) bad.push(where(c));
      } else if (prop === 'transition-delay') {
        for (const d of splitTopLevel(v)) if (seconds(d) !== 0) bad.push(where(c));
      }
    }
    expect(bad).toEqual([]);
  });

  it('moves nothing on load: no @keyframes, no animation', () => {
    const blocks = (nodes: CssBlock[]): CssBlock[] => nodes.flatMap((n) => [n, ...blocks(n.children)]);
    expect(blocks(sheet()).filter((b) => b.name.endsWith('keyframes')).map((b) => b.prelude)).toEqual([]);
    const animated = decls().filter((c) => /^animation/.test(c.declaration.prop) && !/^(?:none|0s|0ms|initial)$/.test(c.declaration.value.trim()));
    expect(animated.filter(outsideReducedMotion).map(where)).toEqual([]);
  });

  it('does not smooth-scroll', () => {
    expect(decls().filter((c) => c.declaration.prop === 'scroll-behavior' && /smooth/.test(c.declaration.value)).map(where)).toEqual([]);
  });

  describe('prefers-reduced-motion: reduce', () => {
    const reduced = (): DeclarationContext[] => decls().filter((c) => inside(c, isReducedMotion));

    it('has a block that stops transitions on everything', () => {
      const stops = reduced().filter(
        (c) =>
          (c.declaration.prop === 'transition-duration' && seconds(c.declaration.value.split(',')[0] ?? '') <= 0.00001) ||
          (c.declaration.prop === 'transition' && /^none\b/.test(c.declaration.value.trim())),
      );
      expect(stops.length, 'no transition-duration (<= .01ms) or transition: none in the reduced-motion block').toBeGreaterThan(0);
      const selectors = stops.map((c) => owner(c).prelude).join(' ');
      expect(selectors, 'the reduced-motion rule must reach every element').toMatch(/(^|[\s,>])\*(?![\w-])/);
    });
  });
});

describe('!important', () => {
  it('appears only inside the prefers-reduced-motion block', () => {
    const bad = decls().filter((c) => c.declaration.important && outsideReducedMotion(c));
    expect(bad.map(where)).toEqual([]);
  });
});

describe('shape and depth (SPEC 0 and 4)', () => {
  it('has no shadows except an inset ring', () => {
    const bad = decls().filter(
      (c) =>
        (c.declaration.prop === 'text-shadow' && c.declaration.value.trim() !== 'none') ||
        (c.declaration.prop === 'box-shadow' && c.declaration.value.trim() !== 'none' && !splitTopLevel(c.declaration.value).every((s) => /\binset\b/.test(s))) ||
        /drop-shadow\(/.test(c.declaration.value),
    );
    expect(bad.map(where)).toEqual([]);
  });

  it('has no gradients', () => {
    expect(decls().filter((c) => /gradient\(/.test(c.declaration.value)).map(where)).toEqual([]);
  });

  it('has no glow: no blur filters or backdrop filters', () => {
    expect(decls().filter((c) => /^(?:backdrop-)?filter$/.test(c.declaration.prop) && !/^none$/.test(c.declaration.value.trim())).map(where)).toEqual([]);
  });

  it('takes border radii from the radius tokens (no raw lengths)', () => {
    const bad = decls().filter((c) => /^border(?:-[a-z]+)*-radius$/.test(c.declaration.prop) && /[1-9]\d*(?:\.\d+)?(?:px|rem|em)|0\.\d+(?:px|rem|em)|\.\d+(?:px|rem|em)/.test(c.declaration.value));
    expect(bad.map(where)).toEqual([]);
  });

  it('draws no heavy rules: no border is wider than 2px (a status dot in forced colors is a dot, not a rule)', () => {
    const bad = decls().filter((c) => {
      const { prop, value } = c.declaration;
      if (!/^border/.test(prop) || /radius|spacing|collapse|image/.test(prop) || inside(c, isForcedColors)) return false;
      return [...value.matchAll(/(\d*\.?\d+)px/g)].some((m) => Number(m[1]) > 2);
    });
    expect(bad.map(where)).toEqual([]);
  });

  it('separates sections with a 1px hairline: border-top: 1px solid var(--rule)', () => {
    const hairlines = decls().filter((c) => c.declaration.prop === 'border-top' && normalizeValue(c.declaration.value) === '1px solid var(--rule)');
    expect(hairlines.length, 'no `border-top: 1px solid var(--rule)` rule found').toBeGreaterThan(0);
  });
});

describe('focus and selection (SPEC 0)', () => {
  it('draws the focus ring as 2px solid var(--accent) on :focus-visible', () => {
    const rings = decls().filter((c) => /:focus-visible/.test(owner(c).prelude) && c.declaration.prop === 'outline');
    expect(rings.length, 'no :focus-visible outline rule').toBeGreaterThan(0);
    for (const r of rings) expect(normalizeValue(r.declaration.value), where(r)).toBe('2px solid var(--accent)');
  });

  it('offsets the focus ring by 3px', () => {
    const offsets = decls().filter((c) => /:focus-visible/.test(owner(c).prelude) && c.declaration.prop === 'outline-offset');
    expect(offsets.length).toBeGreaterThan(0);
    for (const o of offsets) expect(normalizeValue(o.declaration.value), where(o)).toBe('3px');
  });

  it('never removes the outline of a focusable element', () => {
    const bad = decls().filter((c) => {
      const { prop, value } = c.declaration;
      const removes = (prop === 'outline' && /^(?:none|0|0px)$/.test(value.trim())) || (prop === 'outline-style' && value.trim() === 'none') || (prop === 'outline-width' && /^0/.test(value.trim()));
      if (!removes) return false;
      // `:focus:not(:focus-visible)` is the one fair exception
      return !/:not\(:focus-visible\)/.test(owner(c).prelude);
    });
    expect(bad.map(where)).toEqual([]);
  });

  it('styles ::selection with the --selection token', () => {
    const rules = decls().filter((c) => /::selection/.test(owner(c).prelude) && /var\(--selection\)/.test(c.declaration.value));
    expect(rules.length).toBeGreaterThan(0);
  });
});
