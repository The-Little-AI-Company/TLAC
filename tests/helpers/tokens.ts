import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './dist';

export type Theme = 'company-light' | 'company-dark';
export const THEMES: readonly Theme[] = ['company-light', 'company-dark'];

/** The shape of design/tokens.json that the tests rely on. */
export interface TokenFile {
  meta: { source: string };
  color: {
    themes: { id: string; name: string }[];
    tokens: { name: string; value: Record<string, string>; usage: string }[];
  };
  type: { families: Record<string, string> };
  spacing: { tokens: { name: string; value: string }[] };
  radius: { tokens: { name: string; value: string }[] };
  layout: { tokens: { name: string; value: string }[] };
}

/** The 17 color tokens every theme defines, in the order tokens.css lists them. */
export const COLOR_NAMES = [
  'ground', 'ground-alt', 'raised', 'ink', 'ink-soft', 'ink-faint', 'rule', 'field', 'accent', 'accent-hover',
  'accent-fill', 'on-accent', 'status-live', 'status-wip', 'danger', 'success', 'selection',
] as const;
export type ColorName = (typeof COLOR_NAMES)[number];

export const TOKENS_JSON = join(ROOT, 'design/tokens.json');
export const TOKENS_CSS = join(ROOT, 'src/styles/tokens.css');

let cached: TokenFile | undefined;

/** design/tokens.json, the vendored copy of the design system's tokens. */
export function loadTokens(): TokenFile {
  cached ??= JSON.parse(readFileSync(TOKENS_JSON, 'utf-8')) as TokenFile;
  return cached;
}

/** The value of a color token in one theme, as written in tokens.json. */
export function themeColor(theme: Theme, name: ColorName): string {
  const token = loadTokens().color.tokens.find((t) => t.name === name);
  const value = token?.value[theme];
  if (!value) throw new Error(`design/tokens.json has no ${name} for ${theme}`);
  return value;
}

/** Names and values of the non-color tokens tokens.css carries: the spacing scale, the three smallest radii, the measure and the content width. */
export function nonColorTokens(): { name: string; value: string }[] {
  const t = loadTokens();
  const spacing = t.spacing.tokens.map((s) => ({ name: s.name, value: s.value }));
  const radius = t.radius.tokens.filter((r) => ['radius-none', 'radius-xs', 'radius-sm'].includes(r.name));
  const layout = t.layout.tokens.filter((l) => ['measure', 'content-max'].includes(l.name));
  return [...spacing, ...radius, ...layout];
}

/** src/styles/tokens.css, or an error that says it is missing. */
export function readTokensCss(): string {
  if (!existsSync(TOKENS_CSS)) throw new Error('src/styles/tokens.css does not exist. It defines every design token.');
  return readFileSync(TOKENS_CSS, 'utf-8');
}

/** A pixel length from design/tokens.json: `space-4` is 16, `content-max` is 1072. */
export function tokenPx(name: string): number {
  const { spacing, layout } = loadTokens();
  const value = [...spacing.tokens, ...layout.tokens].find((token) => token.name === name)?.value;
  const px = /^(\d+(?:\.\d+)?)px$/.exec(value ?? '')?.[1];
  if (px === undefined) throw new Error(`design/tokens.json has no token ${name} in pixels`);
  return Number(px);
}

/** The font family list of a design/tokens.json `type.families` entry: `display`, `display-italic`, `text` or `mono`. */
export function fontFamilyToken(name: string): string {
  const value = loadTokens().type.families[name];
  if (value === undefined) throw new Error(`design/tokens.json has no type family ${name}`);
  return value;
}
