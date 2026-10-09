/**
 * SPEC section 9 and 10 "Data invariants": src/data/tools.ts and src/data/projects.ts.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { tool, tools, latestVersion } from '../../src/data/tools';
import { PUBLIC, SRC, listFiles } from '../helpers/dist';
import { PROJECTS, TOOLS_EXPECTED, VERSION_PATTERN } from '../helpers/spec';

/** Every string anywhere inside a value, depth first. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

/** Every number anywhere inside a value. */
function numbers(value: unknown): number[] {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value)) return value.flatMap(numbers);
  if (value && typeof value === 'object') return Object.values(value).flatMap(numbers);
  return [];
}

const urls = (value: unknown): string[] => strings(value).filter((s) => /^[a-z][a-z0-9+.-]*:\/\//i.test(s));
const imagePaths = (value: unknown): string[] => strings(value).filter((s) => s.startsWith('/images/'));

describe('tools.ts', () => {
  it('registers Callout then Vivary', () => {
    expect(tools.map((t) => t.slug)).toEqual(['callout', 'vivary']);
    expect(tool('callout').name).toBe('Callout');
    expect(tool('vivary').name).toBe('Vivary');
  });

  it.each(['callout', 'vivary'] as const)('%s has non-empty copy and https URLs', (slug) => {
    const t = tool(slug);
    for (const field of ['name', 'tagline', 'summary', 'platform', 'status'] as const) {
      expect(t[field].trim(), `${slug}.${field}`).not.toBe('');
    }
    expect(t.primary.label.trim()).not.toBe('');
    for (const url of urls(t)) expect(url, `${slug}: ${url}`).toMatch(/^https:\/\/[^\s]+$/);
    for (const url of [t.primary.href, t.repo]) expect(url).toMatch(/^https:\/\//);
  });

  describe('Callout is unchanged', () => {
    const c = TOOLS_EXPECTED.callout;

    it('keeps its summary, repository, installer link and version fallback', () => {
      expect(tool('callout').summary).toBe(c.summary);
      expect(tool('callout').repo).toBe(c.repo);
      expect(tool('callout').primary).toEqual(c.primary);
      expect(tool('callout').tagline).toBe('Press a key. Get the receipts.');
      expect(tool('callout').platform).toBe('Windows 10 and 11');
      expect(tool('callout').version?.fallback).toBe(c.fallback);
      expect(tool('callout').version?.fallback).toMatch(VERSION_PATTERN);
      expect(tool('callout').version?.source).toEqual({ kind: 'github-release', repo: 'The-Little-AI-Company/callout' });
    });
  });

  describe('Vivary points at its own site and the renamed repository', () => {
    const v = TOOLS_EXPECTED.vivary;

    it('has the unsigned Windows preview status', () => {
      expect(tool('vivary').status).toBe(v.status);
    });

    it('has Visit vivaryagent.xyz as its primary link', () => {
      expect(tool('vivary').primary).toEqual(v.primary);
    });

    it('has the vivary-dev/vivary repository', () => {
      expect(tool('vivary').repo).toBe(v.repo);
    });

    it('may carry site and queue links, and if it does they are the right ones', () => {
      const t = tool('vivary') as unknown as Record<string, unknown>;
      if ('queue' in t && t['queue'] !== undefined) expect(t['queue']).toBe(v.queue);
      if ('site' in t && t['site'] !== undefined) expect(t['site']).toBe(v.primary.href);
    });

    it('has no version to stamp, so the status shows instead', () => {
      expect(tool('vivary').version).toBeUndefined();
    });
  });

  it('never mentions the old Vivary-New repository name, in data or in source', () => {
    const found: string[] = [];
    for (const file of listFiles(SRC)) {
      if (/Vivary-New/i.test(readFileSync(join(SRC, file), 'utf-8'))) found.push(`src/${file}`);
    }
    expect(found).toEqual([]);
  });

  it('throws a clear error for an unknown tool', () => {
    expect(() => tool('nope' as 'callout')).toThrow(/no tool registered/);
  });

  describe('latestVersion', () => {
    it('is undefined for a tool without a version source', async () => {
      expect(await latestVersion(undefined)).toBeUndefined();
    });

    it('falls back to the registered version when the lookup cannot be made', async () => {
      const real = globalThis.fetch;
      globalThis.fetch = (() => Promise.reject(new Error('offline'))) as typeof fetch;
      try {
        expect(await latestVersion(tool('callout').version)).toBe('v0.2.0');
      } finally {
        globalThis.fetch = real;
      }
    });

    it('prefixes a bare version with v and keeps one that has it', async () => {
      const real = globalThis.fetch;
      const respond = (tag: string): typeof fetch => (() => Promise.resolve(new Response(JSON.stringify({ tag_name: tag })))) as typeof fetch;
      try {
        globalThis.fetch = respond('0.3.1');
        expect(await latestVersion(tool('callout').version)).toBe('v0.3.1');
        globalThis.fetch = respond('v0.4.0');
        expect(await latestVersion(tool('callout').version)).toBe('v0.4.0');
      } finally {
        globalThis.fetch = real;
      }
    });

    it('falls back when the release has no tag or the request fails', async () => {
      const real = globalThis.fetch;
      try {
        globalThis.fetch = (() => Promise.resolve(new Response('{}'))) as typeof fetch;
        expect(await latestVersion(tool('callout').version)).toBe('v0.2.0');
        globalThis.fetch = (() => Promise.resolve(new Response('nope', { status: 404 }))) as typeof fetch;
        expect(await latestVersion(tool('callout').version)).toBe('v0.2.0');
      } finally {
        globalThis.fetch = real;
      }
    });
  });
});

describe('projects.ts', () => {
  const file = join(SRC, 'data/projects.ts');
  const load = async (): Promise<readonly unknown[]> => {
    if (!existsSync(file)) throw new Error('src/data/projects.ts does not exist. It lists the four "other things I have made" (SPEC section 9).');
    const mod = (await import(/* @vite-ignore */ pathToFileURL(file).href)) as Record<string, unknown>;
    const list = mod['projects'];
    if (!Array.isArray(list)) throw new Error('src/data/projects.ts must export `projects`, an array (like `tools` in tools.ts).');
    return list as readonly unknown[];
  };

  it('exists and exports the array `projects` with four entries', async () => {
    expect(await load()).toHaveLength(4);
  });

  it('keeps the projects in the order of the page', async () => {
    const list = await load();
    expect(list.map((entry) => strings(entry).find((s) => PROJECTS.some((p) => p.title === s)))).toEqual(PROJECTS.map((p) => p.title));
  });

  it.each(PROJECTS.map((p, i) => [p.title, i] as const))('records %s completely (entry %s)', async (_title, i) => {
    const entry = (await load())[i];
    const p = PROJECTS[i]!;
    const all = strings(entry);
    for (const [what, expected] of [
      ['title', p.title],
      ['line', p.line],
      ['status label', p.status],
      ['tone', p.tone],
      ['address', p.href],
      ['address label', p.linkLabel],
      ['image path', p.image.src],
    ] as const) {
      expect(all, `${p.title}: ${what} "${expected}"`).toContain(expected);
    }
    expect(numbers(entry), `${p.title}: image width`).toContain(p.image.width);
    expect(numbers(entry), `${p.title}: image height`).toContain(p.image.height);
  });

  it('has only non-empty strings and https URLs', async () => {
    const list = await load();
    for (const s of strings(list)) expect(s.trim(), 'empty string in projects.ts').not.toBe('');
    for (const url of urls(list)) expect(url).toMatch(/^https:\/\/[^\s/]+\.[^\s/]+/);
  });

  it('points every image at a file in public/images', async () => {
    const list = await load();
    const paths = imagePaths(list);
    expect(paths).toHaveLength(4);
    for (const path of paths) expect(existsSync(join(PUBLIC, path)), path).toBe(true);
  });
});
