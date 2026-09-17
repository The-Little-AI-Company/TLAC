import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Runs against dist/. `pnpm verify` builds first.
const page = (path: string) => readFileSync(resolve('dist', path, 'index.html'), 'utf-8');
const pages = ['', 'callout', 'vivary', 'about', 'contact'];

describe('pages', () => {
  it('builds every page in the nav', () => {
    for (const p of pages) expect(existsSync(resolve('dist', p, 'index.html')), p).toBe(true);
  });

  it('gives every page a title, description, and canonical URL', () => {
    for (const p of pages) {
      const html = page(p);
      expect(html, p).toMatch(/<title>[^<]{5,}<\/title>/);
      expect(html, p).toMatch(/<meta name="description" content="[^"]{40,}"/);
      expect(html, p).toContain(`<link rel="canonical" href="https://littleaicompany.com/${p}${p ? '/' : ''}"`);
    }
  });

  it('keeps a space between prose and inline links', () => {
    // Astro drops the whitespace when a line breaks right before an inline element.
    for (const p of pages) {
      const html = page(p);
      expect(html, p).not.toMatch(/[A-Za-z,:]<a\b/);
      expect(html, p).not.toMatch(/<\/a>[A-Za-z]/);
    }
  });

  it('stamps Callout with a version and Vivary with its status on the home page', () => {
    const stamps = page('').match(/class="stamp"[^>]*>([^<]+)</g) ?? [];
    expect(stamps).toHaveLength(2);
    expect(stamps[0]).toMatch(/>v\d+\.\d+\.\d+</);
    expect(stamps[1]).toMatch(/>In development</);
  });
});

describe('retired names', () => {
  const banned = ['Wazoo', 'Hoolio', 'Bellamente', 'HarnessMax', 'Agent Relay', 'Starter Kit', 'beta', 'Beta', 'Two tools'];
  it('do not appear on any page', () => {
    for (const p of pages) {
      const html = page(p);
      for (const word of banned) expect(html, `${p}: ${word}`).not.toContain(word);
    }
  });
});

describe('redirects', () => {
  const to = (path: string) => page(path).match(/url=([^"]+)"/)?.[1];
  it('send the old guides to Jeff’s account', () => {
    expect(to('guides')).toBe('https://github.com/Jeff-Kazzee');
    expect(to('guides/prompt-anatomy')).toBe('https://github.com/Jeff-Kazzee');
  });
  it('send the retired pages home', () => {
    for (const p of ['services', 'club', 'start-here', 'projects', 'brand', 'pages']) {
      expect(to(p), p).toBe('/');
    }
  });
});

describe('third parties', () => {
  it('loads no script, style, font, or image from another origin', () => {
    for (const p of pages) {
      const html = page(p);
      const tags = html.match(/<(?:script|link|img)\b[^>]*>/g) ?? [];
      for (const tag of tags) {
        const url = tag.match(/(?:src|href)="([^"]+)"/)?.[1] ?? '';
        if (/^(?:https?:)?\/\//.test(url)) {
          expect(url, `${p}: ${tag}`).toMatch(/^https:\/\/littleaicompany\.com\//);
        }
      }
    }
  });
});
