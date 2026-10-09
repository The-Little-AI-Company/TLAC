import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, type HTMLElement } from 'node-html-parser';

/** Repository root, found from this file so the tests do not depend on the working directory. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const DIST = join(ROOT, 'dist');
export const SRC = join(ROOT, 'src');
export const PUBLIC = join(ROOT, 'public');

export const SITE = 'https://littleaicompany.com';
export const SITE_NAME = 'The Little AI Company';

export type PageId = 'home' | 'callout' | 'vivary' | 'about' | 'contact' | 'not-found';

export interface PageInfo {
  id: PageId;
  /** Short label for test names. */
  label: string;
  /** URL path on the site. The 404 page is served from `/404.html`. */
  url: string;
  /** File under dist/. */
  file: string;
  /** The `<title>` the page must have. */
  title: string;
  /** The nav link that carries `aria-current="page"`, or undefined for no nav match. */
  navHref?: string;
  /** The canonical URL, when the spec fixes it. */
  canonical?: string;
}

export const PAGES: readonly PageInfo[] = [
  { id: 'home', label: 'home', url: '/', file: 'index.html', title: SITE_NAME, canonical: `${SITE}/` },
  { id: 'callout', label: 'callout', url: '/callout/', file: 'callout/index.html', title: `Callout. ${SITE_NAME}`, navHref: '/callout/', canonical: `${SITE}/callout/` },
  { id: 'vivary', label: 'vivary', url: '/vivary/', file: 'vivary/index.html', title: `Vivary. ${SITE_NAME}`, navHref: '/vivary/', canonical: `${SITE}/vivary/` },
  { id: 'about', label: 'about', url: '/about/', file: 'about/index.html', title: `About. ${SITE_NAME}`, navHref: '/about/', canonical: `${SITE}/about/` },
  { id: 'contact', label: 'contact', url: '/contact/', file: 'contact/index.html', title: `Contact. ${SITE_NAME}`, navHref: '/contact/', canonical: `${SITE}/contact/` },
  { id: 'not-found', label: '404', url: '/404.html', file: '404.html', title: `Page not found. ${SITE_NAME}` },
] as const;

/** `[label, page]` tuples for `describe.each`, so test names read `home` rather than `'home'`. */
export const PAGE_CASES: readonly (readonly [string, PageInfo])[] = PAGES.map((p) => [p.label, p] as const);

export const page = (id: PageId): PageInfo => {
  const found = PAGES.find((p) => p.id === id);
  if (!found) throw new Error(`unknown page ${id}`);
  return found;
};

/** Main navigation, in the order the spec fixes. */
export const NAV_LINKS = [
  { label: 'Callout', href: '/callout/' },
  { label: 'Vivary', href: '/vivary/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export function distPath(file: string): string {
  return join(DIST, file);
}

/** Reads a file from dist/, with an error that says what to do when it is missing. */
export function readDist(file: string): string {
  const path = distPath(file);
  if (!existsSync(path)) throw new Error(`dist/${file} does not exist. Run \`pnpm build\`, and the page must be part of the site.`);
  return readFileSync(path, 'utf-8');
}

const parsed = new Map<string, HTMLElement>();

/** The built HTML of a page, parsed. Parsed once per run. */
export function parsePage(info: PageInfo): HTMLElement {
  const cached = parsed.get(info.file);
  if (cached) return cached;
  const root = parse(readDist(info.file), { comment: false });
  parsed.set(info.file, root);
  return root;
}

export function parseHtml(html: string): HTMLElement {
  return parse(html, { comment: false });
}

/** Every file under `dir`, as paths relative to it, sorted. */
export function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(relative(dir, full).split('\\').join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

export const sha256 = (data: Buffer | string): string => createHash('sha256').update(data).digest('hex');

export const fileSize = (path: string): number => statSync(path).size;

// ---------------------------------------------------------------------------
// Stylesheets

export interface Stylesheet {
  /** Where it came from: a file under dist/ or `inline`. */
  source: string;
  css: string;
}

/** Inline `<style>` blocks and linked stylesheets of one page, in document order. */
export function pageStylesheets(info: PageInfo): Stylesheet[] {
  const root = parsePage(info);
  const sheets: Stylesheet[] = [];
  for (const el of root.querySelectorAll('style, link[rel="stylesheet"]')) {
    if (el.rawTagName.toLowerCase() === 'style') {
      sheets.push({ source: `${info.file} <style>`, css: el.text });
      continue;
    }
    const href = el.getAttribute('href') ?? '';
    const file = href.replace(/^\//, '').split(/[?#]/)[0] ?? '';
    const path = distPath(file);
    if (existsSync(path) && !href.startsWith('http')) sheets.push({ source: file, css: readFileSync(path, 'utf-8') });
  }
  return sheets;
}

/**
 * Every distinct stylesheet the site ships: all of dist/**\/*.css plus the inline
 * `<style>` blocks of every page, de-duplicated by content so a shared rule set that is
 * inlined into several pages is read once.
 */
export function siteStylesheets(): Stylesheet[] {
  const seen = new Set<string>();
  const sheets: Stylesheet[] = [];
  const add = (sheet: Stylesheet): void => {
    const key = sha256(sheet.css);
    if (seen.has(key)) return;
    seen.add(key);
    sheets.push(sheet);
  };
  for (const file of listFiles(DIST).filter((f) => f.endsWith('.css'))) {
    add({ source: file, css: readFileSync(distPath(file), 'utf-8') });
  }
  for (const info of PAGES) {
    if (!existsSync(distPath(info.file))) continue;
    for (const sheet of pageStylesheets(info)) add(sheet);
  }
  return sheets;
}

/** All of the site's CSS as one string. */
export const siteCss = (): string => siteStylesheets().map((s) => s.css).join('\n');

// ---------------------------------------------------------------------------
// Links

/** Splits `/a/b/?x=1#frag` into its path and fragment. */
export function splitHref(href: string): { path: string; fragment: string | undefined } {
  const hash = href.indexOf('#');
  const noHash = hash === -1 ? href : href.slice(0, hash);
  const fragment = hash === -1 ? undefined : href.slice(hash + 1);
  return { path: noHash.split('?')[0] ?? '', fragment };
}

/**
 * Maps a site path to the file that serves it under dist/, or undefined.
 * `/callout/` -> callout/index.html, `/callout` -> callout/index.html, `/og.png` -> og.png.
 */
export function resolveSitePath(path: string): string | undefined {
  const clean = decodeURIComponent(path).replace(/^\/+/, '');
  const candidates = clean === '' || clean.endsWith('/') ? [`${clean}index.html`] : [clean, `${clean}/index.html`, `${clean}.html`];
  for (const candidate of candidates) {
    const full = distPath(candidate);
    if (existsSync(full) && statSync(full).isFile()) return candidate;
  }
  return undefined;
}

/** The `id` of every element and `name` of every anchor in a built file. */
export function fragmentsIn(file: string): Set<string> {
  const root = parseHtml(readDist(file));
  const ids = new Set<string>();
  for (const el of root.querySelectorAll('[id]')) ids.add(el.getAttribute('id') ?? '');
  for (const el of root.querySelectorAll('a[name]')) ids.add(el.getAttribute('name') ?? '');
  return ids;
}

/** Candidate URLs of an `srcset` value. */
export function srcsetUrls(srcset: string): string[] {
  return srcset
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0] ?? '')
    .filter(Boolean);
}
