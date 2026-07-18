import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Smoke + content checks for the core nav pages, against built output.
const read = (p: string) => readFileSync(resolve(p), 'utf-8');
const PAGES = ['projects', 'about', 'services', 'club', 'contact', 'brand'];

describe('Core nav pages (built output)', () => {
  it('builds every page (no 404s)', () => {
    for (const p of PAGES) {
      expect(existsSync(resolve(`dist/${p}/index.html`)), p).toBe(true);
    }
  });

  it('about: states the software-first mission and keeps education secondary', () => {
    const html = read('dist/about/index.html');
    expect(html).toMatch(/independent software studio/i);
    expect(html).toMatch(/Software first\. Education alongside it/i);
  });

  it('projects: presents the current public products and their source', () => {
    const html = read('dist/projects/index.html');
    expect(html).toContain('Bellamente');
    expect(html).toContain('Agent Relay');
    expect(html).toContain('github.com/The-Little-AI-Company/bellamente');
    expect(html).toContain('github.com/The-Little-AI-Company/open-work-relay');
    expect(html).toMatch(/<h2[^>]*>Current projects<\/h2>/i);
  });

  it('services: supports the product company without invented prices', () => {
    const html = read('dist/services/index.html');
    expect(html).toMatch(/Workflow and tool design/i);
    expect(html).toMatch(/Product implementation/i);
    expect(html).toMatch(/AI Starter Kit/i);
    expect(html).not.toMatch(/\$\d/);
  });

  it('brand: publishes the complete SVG illustration library and design specification', () => {
    const html = read('dist/brand/index.html');
    expect(html).toMatch(/Meet Hollis/i);
    expect(html).toMatch(/He came for the light\. He stayed for the work\./i);
    expect(html).toContain('/brand/CHARACTER.md');
    expect(html).toMatch(/Eighteen scenes built for actual work/i);
    expect(html).toContain('/brand/DESIGN.md');
    const posePaths = new Set(html.match(/\/brand\/poses\/tlac-owl-[a-z-]+\.svg/g) ?? []);
    expect(posePaths.size).toBe(18);
    const poseImageTags = html.match(/<img[^>]*\/brand\/poses\/[^>]*>/gi) ?? [];
    expect(poseImageTags.length).toBeGreaterThanOrEqual(18);
    for (const imageTag of poseImageTags) {
      expect(imageTag).not.toMatch(/loading=["']lazy["']/i);
    }
    for (const posePath of posePaths) {
      expect(existsSync(resolve(`public${posePath}`)), posePath).toBe(true);
    }
    const downloadPaths = new Set(
      html.match(/\/brand\/[a-z0-9./-]+\.(?:md|png|svg)/gi) ?? [],
    );
    for (const downloadPath of downloadPaths) {
      expect(existsSync(resolve(`public${downloadPath}`)), downloadPath).toBe(true);
    }
    expect(existsSync(resolve('public/brand/DESIGN.md'))).toBe(true);
  });

  it('club: puts shipping software ahead of a speculative membership', () => {
    const html = read('dist/club/index.html');
    expect(html).toMatch(/Club/i);
    expect(html).toMatch(/The club can wait/i);
    expect(html).toMatch(/Bellamente/i);
    expect(html).not.toMatch(/\$\d/);
  });

  it('contact: offers a real way to reach out', () => {
    expect(read('dist/contact/index.html')).toMatch(/mailto:/i);
  });
});

describe('Navigation resolves (built output)', () => {
  it('every header nav target exists', () => {
    for (const route of ['projects', 'guides', 'about']) {
      expect(existsSync(resolve(`dist/${route}/index.html`)), route).toBe(true);
    }
  });

  it('footer routes include the public owl page', () => {
    expect(read('dist/index.html')).toContain('href="/brand"');
    expect(existsSync(resolve('dist/brand/index.html'))).toBe(true);
  });
});

describe('Email capture wired (Formspree)', () => {
  const pages: Record<string, string> = {
    home: 'dist/index.html',
    services: 'dist/services/index.html',
    club: 'dist/club/index.html',
  };
  for (const [name, file] of Object.entries(pages)) {
    it(`${name} posts signups to Formspree`, () => {
      const html = read(file);
      expect(html).toContain('https://formspree.io/f/mgvzzqek');
      expect(html).toMatch(/name=["']email["']/);
      expect(html).toMatch(/method=["']POST["']/i);
    });
  }
});
