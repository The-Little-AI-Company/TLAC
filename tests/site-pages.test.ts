import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

  it('about: centers practical AI education and keeps software in service of it', () => {
    const html = read('dist/about/index.html');
    expect(html).toMatch(/help non-technical people/i);
    expect(html).toMatch(/Education first\. Software in service of the work/i);
    expect(html).not.toMatch(/Software first/i);
  });

  it('projects: presents the current public products and their source', () => {
    const html = read('dist/projects/index.html');
    expect(html).toContain('Vivary');
    expect(html).toContain('github.com/vivary-dev/vivary');
    expect(html).toContain('Bellamente');
    expect(html).toContain('Agent Relay');
    expect(html).toContain('github.com/The-Little-AI-Company/bellamente');
    expect(html).toContain('github.com/The-Little-AI-Company/open-work-relay');
    expect(html).toMatch(/<h2[^>]*>Current projects<\/h2>/i);
  });

  it('services: leads with education and reliable AI-agent workflows without invented prices', () => {
    const html = read('dist/services/index.html');
    expect(html).toMatch(/Practical AI workshops/i);
    expect(html).toMatch(/AI workflow and agent coaching/i);
    expect(html).toMatch(/AI Starter Kit/i);
    expect(html).not.toMatch(/\$\d/);
  });

  it('brand: publishes the complete SVG illustration library and design specification', () => {
    const html = read('dist/brand/index.html');
    expect(html).toMatch(/Meet Hoolio/i);
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

  it('club: frames community around learning and building in public', () => {
    const html = read('dist/club/index.html');
    expect(html).toMatch(/Club/i);
    expect(html).toMatch(/Learn in public with us/i);
    expect(html).toMatch(/practical AI skills/i);
    expect(html).not.toMatch(/\$\d/);
  });

  it('contact: offers a real way to reach out', () => {
    expect(read('dist/contact/index.html')).toMatch(/mailto:/i);
  });
});

describe('Navigation resolves (built output)', () => {
  it('every header nav target exists', () => {
    for (const route of ['start-here', 'guides', 'projects', 'about']) {
      expect(existsSync(resolve(`dist/${route}/index.html`)), route).toBe(true);
    }
  });

  it('footer routes include the public owl page', () => {
    expect(read('dist/index.html')).toContain('href="/brand"');
    expect(existsSync(resolve('dist/brand/index.html'))).toBe(true);
  });

  it('provides one visible directory linking every public page and guide', () => {
    const file = 'dist/pages/index.html';
    expect(existsSync(resolve(file))).toBe(true);
    const html = read(file);
    const routes = readdirSync(resolve('dist'), { recursive: true })
      .map(String)
      .filter((path) => path.endsWith('.html'))
      .map((path) => {
        const normalized = path.replace(/\\/g, '/');
        if (normalized === 'index.html') return '/';
        return `/${normalized.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
      });
    for (const route of routes) {
      expect(html, route).toContain(`href="${route}"`);
    }
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
