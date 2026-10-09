/**
 * SPEC section 10 "Link integrity": every internal link lands on a built file, every fragment
 * exists, and everything external is https. Also: the site invents no destinations.
 */
import { describe, expect, it } from 'vitest';
import { all, attr, describe as show } from '../helpers/dom';
import { NAV_LINKS, PAGE_CASES, PAGES, SITE, fragmentsIn, parsePage, resolveSitePath, splitHref, srcsetUrls } from '../helpers/dist';
import { RETIRED_PAGES } from '../helpers/spec';

/** Every host the copy may link to. A new host means new content, which the spec did not ask for. */
const EXTERNAL_HOSTS = new Set([
  'github.com',
  'jeffkazzee.dev',
  'worldfactbook.xyz',
  'llmarcade.fun',
  'puckwork.vercel.app',
  'neon-noir-detective-agency.vercel.app',
  'vivaryagent.xyz',
  'www.npmjs.com',
  'pypi.org',
  'x.com',
  'bsky.app',
]);

interface Reference {
  /** What holds the reference, for messages. */
  from: string;
  href: string;
}

/** Links to follow: anchors, link elements, images and srcset candidates. */
function references(info: (typeof PAGES)[number]): Reference[] {
  const doc = parsePage(info);
  const refs: Reference[] = [];
  for (const a of all(doc, 'a[href]')) refs.push({ from: show(a), href: attr(a, 'href') ?? '' });
  // The canonical URL is checked exactly in page-structure.test.ts (the 404 page's points at no file).
  for (const l of all(doc, 'link[href]:not([rel="canonical"])')) refs.push({ from: show(l), href: attr(l, 'href') ?? '' });
  for (const i of all(doc, 'img[src]')) refs.push({ from: show(i), href: attr(i, 'src') ?? '' });
  for (const s of all(doc, 'source')) {
    for (const url of srcsetUrls(attr(s, 'srcset') ?? '')) refs.push({ from: show(s), href: url });
  }
  for (const m of all(doc, 'meta[property="og:image"]')) refs.push({ from: show(m), href: attr(m, 'content') ?? '' });
  return refs;
}

const isExternal = (href: string): boolean => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
const isOwnOrigin = (href: string): boolean => href === SITE || href.startsWith(`${SITE}/`);
/** Site-relative form of a same-site reference: `https://littleaicompany.com/og.png` -> `/og.png`. */
const toSitePath = (href: string): string => (isOwnOrigin(href) ? href.slice(SITE.length) || '/' : href);

describe.each(PAGE_CASES)('links on %s', (_label, info) => {
  it('send every internal href to a built file', () => {
    const missing: string[] = [];
    for (const { from, href } of references(info)) {
      const target = toSitePath(href);
      if (isExternal(target) || target.startsWith('#')) continue;
      if (!target.startsWith('/')) {
        missing.push(`${from}: "${href}" is relative, use a site path`);
        continue;
      }
      const { path } = splitHref(target);
      if (!resolveSitePath(path)) missing.push(`${from}: ${href} is not in dist/`);
    }
    expect(missing).toEqual([]);
  });

  it('use a trailing slash for pages, as GitHub Pages serves them', () => {
    const bad: string[] = [];
    for (const { from, href } of references(info)) {
      const target = toSitePath(href);
      if (isExternal(target) || !target.startsWith('/')) continue;
      const { path } = splitHref(target);
      const file = resolveSitePath(path);
      if (file?.endsWith('index.html') && !path.endsWith('/')) bad.push(`${from}: ${href} should end with a slash`);
    }
    expect(bad).toEqual([]);
  });

  it('point every #fragment at an id that exists on the target page', () => {
    const bad: string[] = [];
    const own = fragmentsIn(info.file);
    for (const { from, href } of references(info)) {
      const target = toSitePath(href);
      if (isExternal(target)) continue;
      const { path, fragment } = splitHref(target);
      if (fragment === undefined) continue;
      if (fragment === '') {
        bad.push(`${from}: "${href}" is an empty fragment`);
        continue;
      }
      const file = path === '' ? info.file : resolveSitePath(path);
      if (!file) continue; // reported by the first test
      const ids = path === '' ? own : fragmentsIn(file);
      if (!ids.has(decodeURIComponent(fragment))) bad.push(`${from}: #${fragment} does not exist in ${file}`);
    }
    expect(bad).toEqual([]);
  });

  it('use https for every external link, or mailto', () => {
    const bad: string[] = [];
    for (const { from, href } of references(info)) {
      if (!isExternal(href) || isOwnOrigin(href)) continue;
      if (href.startsWith('mailto:')) {
        if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) bad.push(`${from}: malformed ${href}`);
        continue;
      }
      if (!href.startsWith('https://')) bad.push(`${from}: ${href} is not https`);
      else {
        try {
          new URL(href);
        } catch {
          bad.push(`${from}: ${href} is not a URL`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('link only to hosts the site already names', () => {
    const bad: string[] = [];
    for (const { from, href } of references(info)) {
      if (!href.startsWith('https://') || isOwnOrigin(href)) continue;
      const host = new URL(href).host;
      if (!EXTERNAL_HOSTS.has(host)) bad.push(`${from}: ${host} is a new host`);
    }
    expect(bad).toEqual([]);
  });

  it('have no dead links: no empty href, no href="#", no whitespace', () => {
    const bad = references(info).filter(({ href }) => href === '' || href === '#' || href !== href.trim());
    expect(bad.map((r) => `${r.from}: "${r.href}"`)).toEqual([]);
  });

  it('do not point at the retired pages, the guides redirect or the renamed repository', () => {
    const bad: string[] = [];
    for (const { from, href } of references(info)) {
      const target = toSitePath(href);
      const { path } = splitHref(target);
      if (RETIRED_PAGES.some((p) => path === `/${p}` || path.startsWith(`/${p}/`)) || path === '/guides' || path.startsWith('/guides/')) bad.push(`${from}: ${href}`);
      if (/vivary-dev\/Vivary-New/i.test(href)) bad.push(`${from}: ${href} uses the old repository name`);
    }
    expect(bad).toEqual([]);
  });

  it('open nothing in a new tab without noopener', () => {
    const bad = all(parsePage(info), 'a[target="_blank"]').filter((a) => !/\bnoopener\b/.test(attr(a, 'rel') ?? ''));
    expect(bad.map(show)).toEqual([]);
  });
});

describe('navigation targets', () => {
  it.each(NAV_LINKS.map((l) => [l.label, l.href] as const))('%s (%s) is a built page', (_label, href) => {
    expect(resolveSitePath(href)).toBe(`${href.slice(1)}index.html`);
  });

  it('every page links home and to the four pages from its header', () => {
    for (const info of PAGES) {
      const nav = all(parsePage(info), 'nav[aria-label="Main"] a').map((a) => attr(a, 'href'));
      expect(nav, info.label).toEqual(['/', ...NAV_LINKS.map((l) => l.href)]);
    }
  });
});
