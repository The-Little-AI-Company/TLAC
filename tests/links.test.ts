import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { describe, it, expect } from 'vitest';

// Whole-site link integrity, against built output: every internal link and asset
// must resolve to a real file, and every same-page #anchor must have a target id.
// External (http/https), mailto, and tel links are out of scope here.
const DIST = resolve('dist');

function htmlFiles(): string[] {
  return readdirSync(DIST, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(DIST, f));
}

function matchAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

// Resolve an internal absolute path ("/foo", "/foo/", "/x.png") to a built file.
function resolvesInDist(path: string): boolean {
  const clean = path.split('?')[0];
  if (clean === '/' || clean === '') return existsSync(join(DIST, 'index.html'));
  const rel = clean.replace(/^\//, '').replace(/\/$/, '');
  if (/\.[a-z0-9]+$/i.test(rel)) return existsSync(join(DIST, rel)); // asset with extension
  return existsSync(join(DIST, rel, 'index.html')) || existsSync(join(DIST, `${rel}.html`));
}

function routeForHtmlFile(file: string): string {
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  if (rel === '/index.html') return '/';
  return rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

function linkedPageRoutes(html: string, knownRoutes: Set<string>): string[] {
  return matchAll(html, /\bhref=["']([^"']+)["']/g)
    .filter((ref) => ref.startsWith('/'))
    .map((ref) => ref.split(/[?#]/)[0].replace(/\/$/, '') || '/')
    .filter((route) => knownRoutes.has(route));
}

describe('Link integrity (built output)', () => {
  const files = htmlFiles();

  it('built a meaningful number of pages', () => {
    expect(files.length).toBeGreaterThan(8);
  });

  it('has no broken internal links, missing assets, or dangling anchors', () => {
    const broken: string[] = [];
    for (const file of files) {
      const html = readFileSync(file, 'utf-8');
      const ids = new Set(matchAll(html, /\bid=["']([^"']+)["']/g));
      const refs = [
        ...matchAll(html, /\bhref=["']([^"']+)["']/g),
        ...matchAll(html, /\bsrc=["']([^"']+)["']/g),
      ];
      const page = file.slice(DIST.length).replace(/\\/g, '/');
      for (const ref of refs) {
        if (/^(https?:|mailto:|tel:|data:)/i.test(ref)) continue;
        if (ref.startsWith('#')) {
          if (ref.length > 1 && !ids.has(ref.slice(1))) broken.push(`${page}  →  ${ref}  (no matching id)`);
          continue;
        }
        if (ref.startsWith('/')) {
          const path = ref.split('#')[0];
          if (path && !resolvesInDist(path)) broken.push(`${page}  →  ${ref}  (no target)`);
          continue;
        }
        broken.push(`${page}  →  ${ref}  (unexpected relative/other link)`);
      }
    }
    expect(broken, `\nBroken links found:\n${broken.join('\n')}\n`).toEqual([]);
  });

  it('makes every public HTML page reachable from home through visible internal links', () => {
    const routeFiles = new Map(files.map((file) => [routeForHtmlFile(file), file]));
    const knownRoutes = new Set(routeFiles.keys());
    const visited = new Set<string>();
    const queue = ['/'];

    while (queue.length > 0) {
      const route = queue.shift()!;
      if (visited.has(route)) continue;
      visited.add(route);
      const file = routeFiles.get(route);
      if (!file) continue;
      const html = readFileSync(file, 'utf-8');
      for (const linkedRoute of linkedPageRoutes(html, knownRoutes)) {
        if (!visited.has(linkedRoute)) queue.push(linkedRoute);
      }
    }

    const unreachable = [...knownRoutes].filter((route) => !visited.has(route)).sort();
    expect(
      unreachable,
      `\nPublic pages with no visible path from home:\n${unreachable.join('\n')}\n`,
    ).toEqual([]);
  });
});
