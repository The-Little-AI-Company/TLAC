import { declarations, normalizeHex, parseCss, stripComments } from './css';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parses `#rgb`, `#rrggbb`, `#rgba` or `#rrggbbaa` (alpha is ignored). Case does not matter. */
export function parseHex(hex: string): Rgb {
  if (!/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex.trim())) throw new Error(`not a hex color: ${hex}`);
  const full = normalizeHex(hex).slice(1);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** `rgb(246, 243, 236)`, the form `getComputedStyle` returns for opaque colors. */
export function toRgbString(hex: string): string {
  const { r, g, b } = parseHex(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

const channel = (v: number): number => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG 2.x relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors, 1 to 21. Order does not matter. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ---------------------------------------------------------------------------
// Color literal scanner

/** CSS named colors (CSS Color 4). `transparent` and `currentColor` are allowed on purpose and are not listed. */
export const NAMED_COLORS: ReadonlySet<string> = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood ' +
    'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray ' +
    'darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
    'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue ' +
    'firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew ' +
    'hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
    'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue ' +
    'mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred ' +
    'midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid ' +
    'palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple ' +
    'rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue ' +
    'slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white ' +
    'whitesmoke yellow yellowgreen'
  ).split(' '),
);

export type LiteralKind = 'hex' | 'function' | 'named';

export interface ColorLiteral {
  kind: LiteralKind;
  text: string;
}

const COLOR_FUNCTIONS = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/gi;
const HEX = /#[0-9a-f]{3,8}(?![0-9a-z_-])/gi;

/** Properties whose bare keywords can be colors. Custom properties count too. */
const COLOR_PROPERTY =
  /^(?:--.*|color|background(?:-color|-image)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|caret-color|accent-color|text-decoration(?:-color)?|column-rule(?:-color)?|scrollbar-color|text-shadow|box-shadow|stop-color|flood-color|lighting-color)$/;

const stripStrings = (value: string): string => value.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');

/**
 * Finds color literals in a CSS declaration value. `transparent`, `currentColor`,
 * `inherit` and friends are fine. Built CSS minifies `transparent` to `#0000`, which
 * is the same thing, so fully transparent hex is not reported.
 *
 * `prop` decides whether bare words like `red` count; leave it empty to check
 * every word.
 */
export function colorLiteralsInValue(value: string, prop = ''): ColorLiteral[] {
  const found: ColorLiteral[] = [];
  const v = stripStrings(value).replace(/url\([^)]*\)/gi, 'url()');
  for (const m of v.matchAll(HEX)) {
    if (normalizeHex(m[0]) === '#00000000') continue; // minified `transparent`
    found.push({ kind: 'hex', text: m[0] });
  }
  for (const m of v.matchAll(COLOR_FUNCTIONS)) found.push({ kind: 'function', text: m[0] });
  if (!prop || COLOR_PROPERTY.test(prop)) {
    // `var(--x)` is a reference, `var(--x, red)` keeps its fallback, and function names are not keywords.
    const bare = v.replace(/var\(\s*--[\w-]+\s*(?:,([^()]*))?\)/gi, ' $1 ').replace(/[\w-]+\(/g, '(');
    for (const m of bare.matchAll(/(?<![\w#.-])[a-z]+(?![\w(-])/gi)) {
      if (NAMED_COLORS.has(m[0].toLowerCase())) found.push({ kind: 'named', text: m[0] });
    }
  }
  return found;
}

/**
 * Color literals in the declarations of a stylesheet. `skip` receives the selector of
 * the owning rule and can exempt it (the token blocks, for example).
 */
export function colorLiteralsInCss(css: string, skip: (selector: string) => boolean = () => false): ColorLiteral[] {
  const found: ColorLiteral[] = [];
  for (const { declaration, chain } of declarations(parseCss(css))) {
    const owner = chain[chain.length - 1];
    if (owner?.kind === 'rule' && skip(owner.prelude)) continue;
    found.push(...colorLiteralsInValue(declaration.value, declaration.prop));
  }
  return found;
}

/** Attributes in markup whose value is a color: `fill="red"`. */
const COLOR_ATTRIBUTE = /\b(?:fill|stroke|stop-color|flood-color|color|bgcolor)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
/** What may precede a `#word` that is an anchor or id reference rather than a color. */
const REFERENCE_BEFORE = /(?:href|src|id|for|name|headers|list|aria-[a-z]+|xlink:href|data-[a-z-]+)\s*=\s*["']?$|url\(\s*["']?$/i;

/**
 * Finds color literals in a source file (`.astro`, `.ts`, `.html`). `<style>` blocks are
 * parsed as CSS. Elsewhere only hex colors, color functions and color attributes are
 * checked, because bare words like `red` are ordinary prose outside CSS. Anchors such as
 * `href="#main"`, entities such as `&#8217;` and CSS ids are not colors.
 */
export function colorLiteralsInSource(source: string): ColorLiteral[] {
  const found: ColorLiteral[] = [];
  let rest = source;
  for (const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    found.push(...colorLiteralsInCss(m[1] ?? ''));
    rest = rest.replace(m[0], ' ');
  }
  rest = stripComments(rest.replace(/<!--[\s\S]*?-->/g, ' ')).replace(/&#x?[0-9a-f]+;/gi, ' ');
  for (const m of rest.matchAll(HEX)) {
    const index = m.index ?? 0;
    if (/[\w&]/.test(rest[index - 1] ?? '')) continue; // part of a word, e.g. `foo#bad`
    if (REFERENCE_BEFORE.test(rest.slice(Math.max(0, index - 40), index))) continue;
    found.push({ kind: 'hex', text: m[0] });
  }
  for (const m of rest.matchAll(COLOR_FUNCTIONS)) found.push({ kind: 'function', text: m[0] });
  for (const m of rest.matchAll(COLOR_ATTRIBUTE)) {
    const value = (m[1] ?? m[2] ?? '').trim();
    if (NAMED_COLORS.has(value.toLowerCase())) found.push({ kind: 'named', text: value });
  }
  return found;
}
