/**
 * The head, the landmarks, the navigation and the footer of every built page.
 */
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { all, attr, documentOrder, focusables, headingLevel, one } from '../helpers/dom';
import { NAV_LINKS, PAGES, PAGE_CASES, SITE_NAME, distPath, parsePage, readDist } from '../helpers/dist';
import { DESCRIPTIONS, FOOTER, HEAD, SKIP_LINK } from '../helpers/spec';
import { textOf } from '../helpers/text';

describe('the site builds every page', () => {
  it.each(PAGES.map((p) => [p.label, p.file] as const))('%s is dist/%s', (_label, file) => {
    expect(existsSync(distPath(file)), `dist/${file} is missing`).toBe(true);
  });
});

describe.each(PAGE_CASES)('%s', (_label, info) => {
  const doc = () => parsePage(info);
  const meta = (selector: string) => all(doc(), selector);
  /** A header or footer that belongs to the page, not to an article or section inside main. */
  const pageLandmarks = (tag: 'header' | 'footer') => all(doc(), tag).filter((el) => !el.closest('main'));
  const content = (selector: string): string => {
    const found = meta(selector);
    expect(found, `expected exactly one ${selector}`).toHaveLength(1);
    return attr(found[0]!, 'content') ?? '';
  };

  describe('head', () => {
    it('starts with a doctype and declares lang="en", charset and viewport', () => {
      expect(readDist(info.file).trimStart().toLowerCase().startsWith('<!doctype html>')).toBe(true);
      expect(attr(one(doc(), 'html'), 'lang')).toBe('en');
      expect(meta('meta[charset]')).toHaveLength(1);
      expect(attr(meta('meta[charset]')[0]!, 'charset')?.toLowerCase()).toBe('utf-8');
      expect(content('meta[name="viewport"]')).toBe('width=device-width, initial-scale=1');
    });

    it(`has the title "${info.title}"`, () => {
      const titles = all(doc(), 'head title');
      expect(titles).toHaveLength(1);
      expect(textOf(titles[0]!)).toBe(info.title);
    });

    it('has a description of at least 40 characters, trimmed', () => {
      const description = content('meta[name="description"]');
      expect(description.length).toBeGreaterThanOrEqual(40);
      expect(description).toBe(description.trim());
    });

    it('uses its own description, which is 120 to 160 characters so a search result shows all of it', () => {
      const description = content('meta[name="description"]');
      expect(description).toBe(DESCRIPTIONS[info.id]);
      expect(description.length).toBeGreaterThanOrEqual(120);
      expect(description.length).toBeLessThanOrEqual(160);
    });

    it(info.canonical ? `has one canonical URL (${info.canonical})` : 'has no canonical URL, because it is not an address anyone should be sent to', () => {
      const links = meta('link[rel="canonical"]');
      if (!info.canonical) {
        expect(links).toHaveLength(0);
        return;
      }
      expect(links).toHaveLength(1);
      expect(attr(links[0]!, 'href')).toBe(info.canonical);
    });

    describe('Open Graph and Twitter', () => {
      it('has og:type website and og:site_name', () => {
        expect(content('meta[property="og:type"]')).toBe('website');
        expect(content('meta[property="og:site_name"]')).toBe(SITE_NAME);
      });

      it('repeats the title and description', () => {
        expect(content('meta[property="og:title"]')).toBe(info.title);
        expect(content('meta[property="og:description"]')).toBe(content('meta[name="description"]'));
      });

      it(info.canonical ? 'repeats the canonical URL as og:url' : 'has no og:url', () => {
        if (info.canonical) expect(content('meta[property="og:url"]')).toBe(info.canonical);
        else expect(meta('meta[property="og:url"]')).toHaveLength(0);
      });

      it('has the 1200x630 social card with alt text', () => {
        expect(content('meta[property="og:image"]')).toBe(HEAD.ogImage);
        expect(content('meta[property="og:image:width"]')).toBe(HEAD.ogImageWidth);
        expect(content('meta[property="og:image:height"]')).toBe(HEAD.ogImageHeight);
        expect(content('meta[property="og:image:alt"]').length).toBeGreaterThanOrEqual(10);
      });

      it('asks for a large Twitter card with the same image', () => {
        expect(content('meta[name="twitter:card"]')).toBe(HEAD.twitterCard);
        expect(content('meta[name="twitter:image"]')).toBe(HEAD.ogImage);
      });
    });

    describe('color', () => {
      it(`declares color-scheme "${HEAD.colorScheme}"`, () => {
        expect(content('meta[name="color-scheme"]')).toBe(HEAD.colorScheme);
      });

      it('has the two theme-color metas, light and dark, with their media queries', () => {
        const metas = meta('meta[name="theme-color"]').map((m) => ({ content: attr(m, 'content'), media: attr(m, 'media') }));
        expect(metas).toEqual([HEAD.themeColorLight, HEAD.themeColorDark]);
      });
    });

    it('links the favicons and the manifest', () => {
      for (const icon of HEAD.favicons) {
        const found = meta(`link[rel="${icon.rel}"]`).filter((l) => attr(l, 'href') === icon.href);
        expect(found, `${icon.rel} ${icon.href}`).toHaveLength(1);
        if ('type' in icon) expect(attr(found[0]!, 'type')).toBe(icon.type);
        if ('sizes' in icon) expect(attr(found[0]!, 'sizes')).toBe(icon.sizes);
      }
    });

    it(info.id === 'not-found' ? 'asks search engines not to index it' : 'does not hide itself from search engines', () => {
      const robots = meta('meta[name="robots"]');
      if (info.id === 'not-found') {
        expect(robots).toHaveLength(1);
        expect(attr(robots[0]!, 'content')).toBe('noindex');
      } else {
        expect(robots.filter((m) => /noindex/i.test(attr(m, 'content') ?? ''))).toHaveLength(0);
      }
    });
  });

  describe('headings', () => {
    it('has exactly one h1, inside main', () => {
      expect(all(doc(), 'h1')).toHaveLength(1);
      expect(all(doc(), 'main h1')).toHaveLength(1);
    });

    it('has no empty headings', () => {
      for (const h of all(doc(), 'h1, h2, h3, h4, h5, h6')) expect(textOf(h), h.outerHTML).not.toBe('');
    });

    it('starts at h1 and never skips a level going down', () => {
      const levels = all(doc(), 'h1, h2, h3, h4, h5, h6').map(headingLevel);
      expect(levels[0]).toBe(1);
      levels.forEach((level, i) => {
        if (i > 0) expect(level, `heading ${i + 1} (h${level}) follows h${levels[i - 1]}`).toBeLessThanOrEqual((levels[i - 1] ?? 0) + 1);
      });
    });
  });

  describe('landmarks and skip link', () => {
    it('has a skip link to #main that is the first focusable element in the body', () => {
      const first = focusables(one(doc(), 'body'))[0];
      expect(first, 'no focusable element in the body').toBeDefined();
      expect(first?.rawTagName.toLowerCase()).toBe('a');
      expect(attr(first!, 'href')).toBe(SKIP_LINK.href);
      expect(textOf(first!)).toBe(SKIP_LINK.label);
    });

    it('has a single main#main for the skip link to point at, and it is not itself a tab stop or a click target', () => {
      const main = one(doc(), 'main');
      expect(attr(main, 'id')).toBe('main');
      // The skip link moves the browser's place in the page to main without main taking focus,
      // so the next Tab goes to the first thing inside it and a click in main does not reset the tab order.
      expect(attr(main, 'tabindex')).toBeUndefined();
      expect(all(doc(), '[id="main"]')).toHaveLength(1);
    });

    it('orders skip link, header, main and footer in the document', () => {
      const order = documentOrder(doc());
      const at = (el: ReturnType<typeof one> | undefined, what: string): number => {
        expect(el, `no ${what}`).toBeDefined();
        return order.get(el!) ?? -1;
      };
      const skip = at(all(doc(), 'a[href="#main"]')[0], 'skip link');
      const header = at(pageLandmarks('header')[0], 'page header');
      const main = at(one(doc(), 'main'), 'main');
      const footer = at(pageLandmarks('footer')[0], 'page footer');
      expect(skip).toBeLessThan(header);
      expect(header).toBeLessThan(main);
      expect(main).toBeLessThan(footer);
    });

    it('has one page header and one page footer, outside main', () => {
      expect(pageLandmarks('header')).toHaveLength(1);
      expect(pageLandmarks('footer')).toHaveLength(1);
    });
  });

  describe('main navigation', () => {
    const nav = () => one(doc(), 'nav[aria-label="Main"]');

    it('is the only nav and sits in the header', () => {
      expect(all(doc(), 'nav')).toHaveLength(1);
      expect(nav().closest('header'), 'nav[aria-label="Main"] should be inside <header>').not.toBeNull();
    });

    it('starts with the brand link to / holding the mark and the name', () => {
      const brand = all(nav(), 'a')[0]!;
      expect(attr(brand, 'href')).toBe('/');
      expect(textOf(brand)).toBe(SITE_NAME);
      const marks = all(brand, 'svg');
      expect(marks).toHaveLength(1);
      expect(attr(marks[0]!, 'aria-hidden')).toBe('true');
      expect(all(marks[0]!, 'path[fill="currentColor"]').length, 'the mark is drawn in currentColor').toBeGreaterThan(0);
      const label = attr(brand, 'aria-label');
      if (label !== undefined) expect(label, 'an aria-label must contain the visible text').toContain(SITE_NAME);
    });

    it('then links Callout, Vivary, About and Contact in that order', () => {
      const links = all(nav(), 'a').slice(1).map((a) => ({ label: textOf(a), href: attr(a, 'href') }));
      expect(links).toEqual(NAV_LINKS.map((l) => ({ label: l.label, href: l.href })));
    });

    it(info.navHref ? `marks only ${info.navHref} with aria-current="page"` : 'marks nothing with aria-current', () => {
      const current = all(nav(), '[aria-current]');
      if (!info.navHref) {
        expect(current).toHaveLength(0);
        return;
      }
      expect(current).toHaveLength(1);
      expect(attr(current[0]!, 'aria-current')).toBe('page');
      expect(attr(current[0]!, 'href')).toBe(info.navHref);
    });

    it(info.id === 'home' ? 'marks the brand link as the current page, since it links home' : 'does not mark the brand link as current', () => {
      expect(attr(all(nav(), 'a')[0]!, 'aria-current')).toBe(info.id === 'home' ? 'page' : undefined);
    });
  });

  describe('footer', () => {
    const footer = () => pageLandmarks('footer')[0]!;

    it(`says "${FOOTER.line}"`, () => {
      expect(textOf(footer())).toContain(FOOTER.line);
    });

    it('links the email, GitHub and JeffKazzee.dev, in that order', () => {
      const links = all(footer(), 'a').map((a) => ({ label: textOf(a), href: attr(a, 'href') }));
      expect(links).toEqual(FOOTER.links.map((l) => ({ label: l.label, href: l.href })));
    });

    it(`says "${FOOTER.note}"`, () => {
      expect(textOf(footer())).toContain(FOOTER.note);
    });

    it('puts the line before the links and the note last', () => {
      const text = textOf(footer());
      expect(text.indexOf(FOOTER.line)).toBeLessThan(text.indexOf(FOOTER.links[0].label));
      expect(text.indexOf(FOOTER.note)).toBeGreaterThan(text.indexOf(FOOTER.links[2].label));
    });
  });
});

describe('the pages that are not the 404 page', () => {
  it('are the only ones with a canonical URL, and each one is its own', () => {
    const canonicals = PAGES.flatMap((p) => all(parsePage(p), 'link[rel="canonical"]').map((l) => attr(l, 'href')));
    expect(canonicals).toEqual(PAGES.filter((p) => p.canonical).map((p) => p.canonical));
  });
});

describe('titles are unique across pages', () => {
  it('gives each page its own title and description', () => {
    const titles = PAGES.map((p) => textOf(one(parsePage(p), 'head title')));
    expect(new Set(titles).size).toBe(PAGES.length);
    const descriptions = PAGES.map((p) => attr(one(parsePage(p), 'meta[name="description"]'), 'content'));
    expect(new Set(descriptions).size).toBe(PAGES.length);
  });
});
