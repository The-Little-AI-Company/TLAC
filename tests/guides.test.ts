import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Smoke + content + wiring checks for the Starter Kit guides, against built output.
// Run after `astro build` (the `verify`/`test` scripts handle ordering).
const read = (p: string) => readFileSync(resolve(p), 'utf-8');

const GUIDE_SLUGS = [
  'first-useful-thing',
  'is-ai-wrong',
  'prompt-anatomy',
  'use-case-menu',
  'make-it-better',
  'what-not-to-paste',
  'ai-good-and-bad',
];

describe('Starter Kit guides (built output)', () => {
  it('builds a page for every guide', () => {
    for (const slug of GUIDE_SLUGS) {
      expect(existsSync(resolve(`dist/guides/${slug}/index.html`)), slug).toBe(true);
    }
  });

  it('renders each guide title as on-page text', () => {
    const titles: Record<string, string> = {
      'first-useful-thing': 'Make Your First Useful Thing',
      'is-ai-wrong': 'Is AI Wrong?',
      'prompt-anatomy': 'The Prompt Anatomy',
      'use-case-menu': 'Your First Tasks to Try',
      'make-it-better': 'Make It Better',
      'what-not-to-paste': 'What Not to Paste into AI',
      'ai-good-and-bad': 'What AI Is Good and Bad At',
    };
    for (const [slug, title] of Object.entries(titles)) {
      expect(read(`dist/guides/${slug}/index.html`), slug).toContain(title);
    }
  });

  it('rewrites cross-links to site routes (no raw .md links survive)', () => {
    const html = read('dist/guides/prompt-anatomy/index.html');
    expect(html).toContain('/guides/is-ai-wrong'); // the "Next" cross-link
    expect(html).not.toMatch(/href="[^"]*\.md"/);
  });

  it('each guide is accessible/SEO-sound: lang, title, meta description', () => {
    const html = read('dist/guides/prompt-anatomy/index.html');
    expect(html).toMatch(/<html[^>]*lang=["']en["']/);
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta[^>]*name=["']description["'][^>]*content=/);
  });
});

describe('Guides hub (/guides)', () => {
  it('exists and is framed as the Starter Kit', () => {
    expect(read('dist/guides/index.html')).toMatch(/Starter Kit/i);
  });

  it('lists every guide', () => {
    const html = read('dist/guides/index.html');
    for (const slug of GUIDE_SLUGS) {
      expect(html, slug).toContain(`/guides/${slug}`);
    }
  });
});

describe('Start Here (/start-here)', () => {
  it('exists and routes into the first useful thing', () => {
    const html = read('dist/start-here/index.html');
    expect(html).toMatch(/first useful thing/i);
    expect(html).toContain('/guides/first-useful-thing');
  });
});

describe('Home wiring (built output)', () => {
  it('cards point to real guide routes, not placeholder slugs', () => {
    const html = read('dist/index.html');
    expect(html).toContain('/guides/is-ai-wrong');
    expect(html).toContain('/guides/prompt-anatomy');
    expect(html).not.toContain('/guides/judgment');
    expect(html).not.toContain('/guides/second-brain');
  });
});

describe('Footer Zo links (sitewide)', () => {
  it('links to Zo 101, the Zo Cookbook, and the Zo computer', () => {
    const html = read('dist/index.html');
    expect(html).toContain('zocomputer101.wiki');
    expect(html).toContain('zo-cookbook.space');
    expect(html).toContain('zo-computer.cello.so/X9jcdFXqh9Z');
  });
});
