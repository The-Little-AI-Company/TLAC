/**
 * No third-party request of any kind. The footer promises "loads nothing from third parties", so no
 * script, style, font, image, frame or connection hint may leave the site.
 * (The end-to-end suite watches the network for the same thing in a real browser.)
 */
import { describe, expect, it } from 'vitest';
import { all, attr, show } from '../helpers/dom';
import { PAGE_CASES, SITE, pageStylesheets, parsePage, readDist, srcsetUrls } from '../helpers/dist';

/** Elements that make the browser fetch something, and the attributes holding the URL. */
const LOADERS: readonly (readonly [selector: string, attribute: string])[] = [
  ['script[src]', 'src'],
  ['link[href]', 'href'],
  ['img[src]', 'src'],
  ['source[src]', 'src'],
  ['iframe[src]', 'src'],
  ['video[src]', 'src'],
  ['video[poster]', 'poster'],
  ['audio[src]', 'src'],
  ['embed[src]', 'src'],
  ['object[data]', 'data'],
  ['track[src]', 'src'],
  ['meta[property="og:image"]', 'content'],
];

const TRACKERS = [
  'google-analytics', 'googletagmanager', 'gtag(', 'doubleclick', 'plausible.io', 'fathom', 'matomo', 'hotjar', 'segment.com', 'mixpanel',
  'clarity.ms', 'cloudflareinsights', 'fonts.googleapis', 'fonts.gstatic', 'unpkg.com', 'jsdelivr', 'cdnjs', 'bootstrapcdn', 'gravatar',
  'facebook.net', 'twitter.com/widgets', 'platform.twitter', 'sentry.io', 'vercel-insights', '_vercel/insights',
];

const isForeign = (url: string): boolean => /^(?:https?:)?\/\//i.test(url) && !(url === SITE || url.startsWith(`${SITE}/`));

describe.each(PAGE_CASES)('third parties on %s', (_label, info) => {
  it('loads no script, style, font, image, frame or media from another origin', () => {
    const doc = parsePage(info);
    const foreign: string[] = [];
    for (const [selector, attribute] of LOADERS) {
      for (const el of all(doc, selector)) {
        const url = attr(el, attribute) ?? '';
        if (isForeign(url)) foreign.push(`${show(el)} -> ${url}`);
      }
    }
    for (const source of all(doc, 'source[srcset], img[srcset]')) {
      for (const url of srcsetUrls(attr(source, 'srcset') ?? '')) if (isForeign(url)) foreign.push(`${show(source)} -> ${url}`);
    }
    expect(foreign).toEqual([]);
  });

  it('hints at no connection to another origin (no preconnect, dns-prefetch or prefetch)', () => {
    const hints = all(parsePage(info), 'link[rel~="preconnect"], link[rel~="dns-prefetch"], link[rel~="prefetch"], link[rel~="prerender"]');
    expect(hints.map(show)).toEqual([]);
  });

  it('pulls nothing from another origin in its CSS (no @import, no url() to another host)', () => {
    const foreign: string[] = [];
    for (const sheet of pageStylesheets(info)) {
      if (/@import/i.test(sheet.css)) foreign.push(`${sheet.source}: @import`);
      for (const m of sheet.css.matchAll(/url\(\s*["']?([^)"']+)["']?\s*\)/g)) if (isForeign(m[1] ?? '')) foreign.push(`${sheet.source}: ${m[1]}`);
    }
    expect(foreign).toEqual([]);
  });

  it('names no known tracker, CDN or font host', () => {
    const body = (readDist(info.file) + pageStylesheets(info).map((s) => s.css).join('\n')).toLowerCase();
    expect(TRACKERS.filter((t) => body.includes(t))).toEqual([]);
  });

  it('sets no cookie and keeps no storage (there is no script to do it)', () => {
    expect(readDist(info.file)).not.toMatch(/document\.cookie|localStorage|sessionStorage|navigator\.sendBeacon/);
  });
});
