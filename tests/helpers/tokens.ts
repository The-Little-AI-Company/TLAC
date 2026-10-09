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

/** The 17 color tokens SPEC section 1 lists, in the order it lists them. */
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

/** Names and values of the non-color tokens tokens.css must carry, as SPEC section 1 lists them. */
export function nonColorTokens(): { name: string; value: string }[] {
  const t = loadTokens();
  const spacing = t.spacing.tokens.map((s) => ({ name: s.name, value: s.value }));
  const radius = t.radius.tokens.filter((r) => ['radius-none', 'radius-xs', 'radius-sm'].includes(r.name));
  const layout = t.layout.tokens.filter((l) => ['measure', 'content-max'].includes(l.name));
  return [...spacing, ...radius, ...layout];
}

/** src/styles/tokens.css, or an error that says it is missing. */
export function readTokensCss(): string {
  if (!existsSync(TOKENS_CSS)) throw new Error('src/styles/tokens.css does not exist. It defines every design token (SPEC section 1).');
  return readFileSync(TOKENS_CSS, 'utf-8');
}
