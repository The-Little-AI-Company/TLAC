/**
 * Shared pieces of the end-to-end suites: the page x width x scheme matrix, a probe that records
 * everything the browser does on the network and console, and small helpers to measure the page
 * the way a visitor sees it (after fonts and images have settled).
 */
import { expect, test as base, type Locator, type Page } from '@playwright/test';
import { PAGES, type PageInfo } from '../helpers/dist';
import { toRgbString } from '../helpers/color';
import { fontFamilies } from '../helpers/css';
import { themeColor, tokenPx, type ColorName, type Theme } from '../helpers/tokens';

export { expect, PAGES };
export type { PageInfo };

export const WIDTHS = [320, 360, 859, 861, 1280, 1440] as const;
/** The two widths the expensive checks (axe, keyboard, screenshots) run at. */
export const KEY_WIDTHS = [360, 1280] as const;
export const SCHEMES = ['light', 'dark'] as const;
export type Scheme = (typeof SCHEMES)[number];

/** Phone layout is `max-width: 860px`. */
export const isPhone = (width: number): boolean => width <= 860;
export const VIEWPORT_HEIGHT = 900;
/**
 * A fluid value: `phone` at 360px and below, `desktop` at 860px and above, and a straight line between,
 * which is the clamp() that global.css writes for the page margins, the display sizes and the hero padding.
 */
export const ramp = (width: number, phone: number, desktop: number): number =>
  phone + (desktop - phone) * Math.min(1, Math.max(0, (width - 360) / 500));
/** A step of the spacing scale in pixels, from design/tokens.json: `space(7)` is 56. */
export const space = (step: number): number => tokenPx(`space-${step}`);
/** Side padding of the page: --space-4 at 360px and below, --space-8 at 860px and above. */
export const sidePadding = (width: number): number => ramp(width, space(4), space(8));
/** The widest the content gets, between the page margins. */
export const CONTENT_MAX = tokenPx('content-max');

export const theme = (scheme: Scheme): Theme => (scheme === 'light' ? 'company-light' : 'company-dark');
/** A token as the browser reports it: `rgb(246, 243, 236)`. */
export const rgb = (scheme: Scheme, name: ColorName): string => toRgbString(themeColor(theme(scheme), name));

// ---------------------------------------------------------------------------
// Probe: what the page did on the console and the network

export interface Probe {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  badResponses: string[];
  /** Requests to any origin other than the preview server. They are aborted, never sent. */
  foreignRequests: string[];
}

export const test = base.extend<{ probe: Probe }>({
  probe: async ({ page, baseURL }, use) => {
    const origin = new URL(baseURL ?? 'http://127.0.0.1').origin;
    const probe: Probe = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [], foreignRequests: [] };

    page.on('console', (message) => {
      if (message.type() === 'error') probe.consoleErrors.push(`${message.text()} (${message.location().url})`);
    });
    page.on('pageerror', (error) => probe.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      if (probe.foreignRequests.includes(request.url())) return; // we aborted it on purpose
      probe.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) probe.badResponses.push(`${response.status()} ${response.url()}`);
    });
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (url.startsWith(origin) || /^(?:data|blob|about):/.test(url)) await route.continue();
      else {
        probe.foreignRequests.push(url);
        await route.abort();
      }
    });
    await use(probe);
  },
});

// ---------------------------------------------------------------------------
// Opening a page

/** Waits until every font the page asked for has loaded or failed. */
export async function fontsReady(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Waits for the browser to paint `count` more frames, so a style change that was just made has been applied. */
export async function nextFrames(page: Page, count = 2): Promise<void> {
  await page.evaluate(async (frames) => {
    for (let i = 0; i < frames; i++) await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  }, count);
}

/** Scrolls to the bottom and back so lazy images load, then waits for them. */
export async function loadEverything(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight / 2));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await Promise.all(
      Array.from(document.images).map((img) => (img.complete ? Promise.resolve() : new Promise<void>((resolve) => { img.addEventListener('load', () => resolve(), { once: true }); img.addEventListener('error', () => resolve(), { once: true }); }))),
    );
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
}

/**
 * Opens a page, checks the HTTP status (200 unless the caller expects otherwise, so a missing
 * page cannot pass for a page that merely has no problems), waits for fonts, and returns the status.
 */
export async function open(page: Page, info: PageInfo | string, expectedStatus = 200): Promise<number> {
  const url = typeof info === 'string' ? info : info.url;
  const response = await page.goto(url, { waitUntil: 'load' });
  const status = response?.status() ?? 0;
  expect(status, `HTTP status of ${url}`).toBe(expectedStatus);
  await fontsReady(page);
  return status;
}

// ---------------------------------------------------------------------------
// Measuring

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

/** Position and size of the first match in document coordinates (scroll does not matter). */
export async function box(target: Locator): Promise<Box> {
  return target.first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + window.scrollX;
    const y = r.top + window.scrollY;
    return { x, y, width: r.width, height: r.height, right: x + r.width, bottom: y + r.height };
  });
}

/** Boxes of all matches, in document order. */
export async function boxes(target: Locator): Promise<Box[]> {
  return target.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left + window.scrollX;
      const y = r.top + window.scrollY;
      return { x, y, width: r.width, height: r.height, right: x + r.width, bottom: y + r.height };
    }),
  );
}

/** Computed style properties of the first match, as the browser serialises them. */
export async function style(target: Locator, props: readonly string[], pseudo?: string): Promise<Record<string, string>> {
  return target.first().evaluate(
    (el, { props, pseudo }) => {
      const cs = getComputedStyle(el, pseudo ?? null);
      return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    },
    { props: [...props], pseudo },
  );
}

/** The first family in a computed `font-family`, without quotes: `"Instrument Sans", system-ui` is `Instrument Sans`. */
export const firstFamily = (fontFamily: string | undefined): string => fontFamilies(fontFamily ?? '')[0] ?? '';

/** Seconds from a computed duration list: `0.18s, 0.18s` -> [0.18, 0.18]. */
export const secondsOf = (value: string): number[] => value.split(',').map((v) => (v.trim().endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v)));

/** `12ch` in pixels for the font of `target`. */
export async function chInPixels(target: Locator, count: number): Promise<number> {
  return target.first().evaluate((el, count) => {
    const probe = document.createElement('span');
    probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${getComputedStyle(el).font};letter-spacing:${getComputedStyle(el).letterSpacing}`;
    probe.style.width = `${count}ch`;
    probe.style.display = 'inline-block';
    el.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }, count);
}

/**
 * How many of a list's rows are ruled by a 1px hairline in `ruleColor`: the list itself, and its rows and
 * their terms and details, counting a top or a bottom rule. Pass a locator that matches one element.
 */
export async function countHairlines(list: Locator, ruleColor: string): Promise<number> {
  return list.evaluate((root, rule) => {
    const els = [root, ...Array.from(root.querySelectorAll('div, dt, dd'))];
    return els.filter((el) => {
      const s = getComputedStyle(el);
      return (s.borderTopWidth === '1px' && s.borderTopColor === rule) || (s.borderBottomWidth === '1px' && s.borderBottomColor === rule);
    }).length;
  }, ruleColor);
}

/** What a test needs to know about a link, button or other element in the Tab order. */
export interface ElementState {
  tag: string;
  href: string | null;
  /** Its text with the whitespace collapsed. */
  text: string;
  /** A Tab stop: not disabled, not `tabindex="-1"`, and drawn (the skip link is off-screen but still counts). */
  tabbable: boolean;
  focusVisible: boolean;
  /** Whether it is inside the viewport. */
  inView: boolean;
  outline: { style: string; width: string; color: string; offset: string };
}

/** Elements that can take a Tab stop, before `ElementState.tabbable` rules out the ones that do not. */
const TAB_CANDIDATES = 'a[href], button, input, select, textarea, summary, [tabindex]';

/** Runs in the page, once for every element, so that the Tab order and the focused element are described in the same way. */
const describeElements = (els: Element[]): ElementState[] =>
  els.map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      href: el.getAttribute('href'),
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
      tabbable: !el.matches('[tabindex^="-"]') && !el.hasAttribute('disabled') && cs.display !== 'none' && cs.visibility !== 'hidden',
      focusVisible: el.matches(':focus-visible'),
      inView: r.width > 0 && r.height > 0 && r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight,
      outline: { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset },
    };
  });

/** The elements a keyboard reaches by Tab, in DOM order. */
export async function tabbables(page: Page): Promise<ElementState[]> {
  return (await page.locator(TAB_CANDIDATES).evaluateAll(describeElements)).filter((el) => el.tabbable);
}

/** The element that has focus now. */
export async function focused(page: Page): Promise<ElementState> {
  const [el] = await page.locator(':focus').evaluateAll(describeElements);
  if (!el) throw new Error('nothing has focus');
  return el;
}

/** One line that tells one Tab stop from another: `a|/callout/|Callout`. */
export const signature = ({ tag, href, text }: ElementState): string => `${tag}|${href ?? ''}|${text}`;

/** Readable text for an axe violation list. */
export function formatViolations(
  violations: { id: string; impact?: string | null; help: string; helpUrl: string; nodes: { target: unknown[]; html: string; failureSummary?: string }[] }[],
): string {
  if (violations.length === 0) return 'no violations';
  return violations
    .map((v) => {
      const nodes = v.nodes
        .slice(0, 6)
        .map((n) => `    - ${n.target.join(' ')}\n      ${n.html.replace(/\s+/g, ' ').slice(0, 160)}\n      ${(n.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 300)}`)
        .join('\n');
      return `[${v.impact ?? 'n/a'}] ${v.id}: ${v.help}\n  ${v.helpUrl}\n${nodes}${v.nodes.length > 6 ? `\n    ... and ${v.nodes.length - 6} more` : ''}`;
    })
    .join('\n\n');
}

/**
 * The color the page paints behind everything: the body's background, or the html element's when
 * the body has none. (Where the ground is set is the page's business; what a visitor sees is not.)
 */
export async function pageBackground(page: Page): Promise<string> {
  return page.evaluate(() => {
    const opaque = (c: string): boolean => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent';
    const body = getComputedStyle(document.body).backgroundColor;
    const html = getComputedStyle(document.documentElement).backgroundColor;
    return opaque(body) ? body : html;
  });
}

/** Name of the screenshot file for a page, width and scheme. */
export const screenshotName = (info: PageInfo, width: number, scheme: Scheme): string => `${info.label}-${width}-${scheme}.png`;

/** Rounds to one decimal for tolerant comparisons in messages. */
export const round = (n: number): number => Math.round(n * 10) / 10;
