import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Smoke + content checks for the core nav pages, against built output.
const read = (p: string) => readFileSync(resolve(p), 'utf-8');
const PAGES = ['about', 'services', 'club', 'contact'];

describe('Core nav pages (built output)', () => {
  it('builds every page (no 404s)', () => {
    for (const p of PAGES) {
      expect(existsSync(resolve(`dist/${p}/index.html`)), p).toBe(true);
    }
  });

  it('about: states the mission and the judgment angle', () => {
    const html = read('dist/about/index.html');
    expect(html).toMatch(/Learn AI by making useful things/i);
    expect(html).toMatch(/when to trust/i);
  });

  it('services: shows the ladder incl. the free Starter Kit and the Club, no invented prices', () => {
    const html = read('dist/services/index.html');
    expect(html).toMatch(/Starter Kit/i);
    expect(html).toMatch(/Club/i);
    expect(html).not.toMatch(/\$\d/);
  });

  it('club: value + waitlist framing, no committed price', () => {
    const html = read('dist/club/index.html');
    expect(html).toMatch(/Club/i);
    expect(html).toMatch(/waitlist|founding/i);
    expect(html).not.toMatch(/\$\d/);
  });

  it('contact: offers a real way to reach out', () => {
    expect(read('dist/contact/index.html')).toMatch(/mailto:/i);
  });
});

describe('Navigation resolves (built output)', () => {
  it('every header nav target exists', () => {
    for (const route of ['start-here', 'guides', 'services', 'club', 'about']) {
      expect(existsSync(resolve(`dist/${route}/index.html`)), route).toBe(true);
    }
  });
});
