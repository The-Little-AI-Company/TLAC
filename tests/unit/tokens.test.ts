/**
 * src/styles/tokens.css is the design tokens as CSS custom properties, and it must agree with the
 * vendored design/tokens.json, in the source and in the built CSS.
 */
import { describe, expect, it } from 'vitest';
import { siteCss } from '../helpers/dist';
import { darkRootVariables, normalizeHex, normalizeValue, parseCss, rootVariables } from '../helpers/css';
import { MOTION } from '../helpers/spec';
import { COLOR_NAMES, THEMES, fontFamilyToken, loadTokens, nonColorTokens, readTokensCss, themeColor, type Theme } from '../helpers/tokens';

const source = () => parseCss(readTokensCss());
const lightVars = () => rootVariables(source());
const darkVars = () => darkRootVariables(source());
const get = (vars: Map<string, string>, name: string): string => {
  const value = vars.get(name);
  if (value === undefined) throw new Error(`tokens.css does not define ${name}`);
  return value;
};
const themeVars = (theme: Theme) => (theme === 'company-light' ? lightVars() : darkVars());
/** `0` and `0px` are the same length. */
const length = (value: string): string => normalizeValue(value).replace(/^0px$/, '0');

/** CSS custom property -> family list in design/tokens.json. */
const FONT_TOKENS = [
  ['--font-display', 'display'],
  ['--font-display-italic', 'display-italic'],
  ['--font-text', 'text'],
  ['--font-mono', 'mono'],
] as const;
const MOTION_TOKENS = [
  ['--ease', MOTION.ease],
  ['--dur', `${MOTION.seconds}s`],
] as const;

describe('design/tokens.json', () => {
  it('says where the design system file came from', () => {
    expect(loadTokens().meta.source.trim()).not.toBe('');
  });

  it('defines the two company themes and the 17 color tokens', () => {
    const tokens = loadTokens();
    expect(tokens.color.themes.map((t) => t.id)).toEqual(expect.arrayContaining(['company-light', 'company-dark']));
    expect(tokens.color.tokens.map((t) => t.name).sort()).toEqual([...COLOR_NAMES].sort());
  });
});

describe('tokens.css structure', () => {
  it('exists and holds nothing but the :root block and the dark scheme block', () => {
    const nodes = source();
    expect(nodes.length).toBeGreaterThan(0);
    for (const node of nodes) {
      const isRoot = node.kind === 'rule' && node.prelude.replace(/\s+/g, '') === ':root';
      const isDark = node.kind === 'at' && node.name === 'media' && /prefers-color-scheme:\s*dark/.test(node.prelude);
      expect(isRoot || isDark, `unexpected top-level block in tokens.css: ${node.prelude}`).toBe(true);
    }
  });

  it('sets color-scheme: light on :root and color-scheme: dark in the dark block', () => {
    expect(get(lightVars(), 'color-scheme').trim()).toBe('light');
    expect(get(darkVars(), 'color-scheme').trim()).toBe('dark');
  });

  it('redefines only color tokens and color-scheme in the dark block', () => {
    const allowed = new Set<string>([...COLOR_NAMES.map((n) => `--${n}`), 'color-scheme']);
    const extra = [...darkVars().keys()].filter((k) => !allowed.has(k));
    expect(extra).toEqual([]);
  });

  it('puts the dark block after :root so it wins the cascade', () => {
    const nodes = source();
    const lastRoot = nodes.map((n, i) => (n.kind === 'rule' ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
    const dark = nodes.findIndex((n) => n.kind === 'at');
    expect(dark).toBeGreaterThan(lastRoot);
  });

  it('says in a comment that the breakpoint is 860px (a media query cannot read a custom property)', () => {
    const comments = [...readTokensCss().matchAll(/\/\*([\s\S]*?)\*\//g)].map((m) => m[1] ?? '');
    expect(comments.some((c) => /860px/.test(c) && /breakpoint/i.test(c))).toBe(true);
  });

  it('does not define the design system tokens the site has no use for: a pill radius, shadows, a second content width, font aliases', () => {
    const vars = lightVars();
    for (const skipped of ['--radius', '--radius-pill', '--shadow-rest', '--shadow-soft', '--shadow-none', '--site-max', '--font-serif', '--font-sans']) {
      expect(vars.has(skipped), `${skipped} must not be defined`).toBe(false);
    }
  });
});

describe.each(THEMES)('tokens.css colors, %s', (theme) => {
  it.each(COLOR_NAMES)('--%s equals the value in design/tokens.json', (name) => {
    const expected = themeColor(theme, name);
    expect(get(themeVars(theme), `--${name}`)).toBe(expected);
  });
});

describe('tokens.css other tokens', () => {
  it.each(nonColorTokens().map((t) => [t.name, t.value] as const))('--%s is %s', (name, value) => {
    expect(length(get(lightVars(), `--${name}`))).toBe(length(value));
  });

  it.each(FONT_TOKENS)('%s is the %s family list of design/tokens.json', (name, family) => {
    expect(normalizeValue(get(lightVars(), name))).toBe(normalizeValue(fontFamilyToken(family)));
  });

  it.each(MOTION_TOKENS)('%s is %s (one curve, one duration)', (name, value) => {
    expect(normalizeValue(get(lightVars(), name))).toBe(normalizeValue(value));
  });

  it('writes color values as lower-case 6 digit hex', () => {
    for (const [name, value] of [...lightVars(), ...darkVars()]) {
      if (name === 'color-scheme' || !COLOR_NAMES.some((n) => `--${n}` === name)) continue;
      expect(value, name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('built CSS carries the tokens', () => {
  const built = () => parseCss(siteCss());

  it.each(THEMES)('has every %s color on :root (hex may be shortened by the minifier)', (theme) => {
    const vars = theme === 'company-light' ? rootVariables(built()) : darkRootVariables(built());
    for (const name of COLOR_NAMES) {
      const value = vars.get(`--${name}`);
      expect(value, `--${name} missing from built CSS`).toBeDefined();
      expect(normalizeHex(value ?? ''), `--${name}`).toBe(normalizeHex(themeColor(theme, name)));
    }
  });

  it('keeps color-scheme light on :root and dark in the dark block', () => {
    expect(rootVariables(built()).get('color-scheme')?.trim()).toBe('light');
    expect(darkRootVariables(built()).get('color-scheme')?.trim()).toBe('dark');
  });

  it('has the motion and font tokens', () => {
    const vars = rootVariables(built());
    const expected = [...MOTION_TOKENS, ...FONT_TOKENS.map(([name, family]) => [name, fontFamilyToken(family)] as const)];
    for (const [name, value] of expected) {
      expect(normalizeValue(vars.get(name) ?? ''), name).toBe(normalizeValue(value));
    }
  });
});
