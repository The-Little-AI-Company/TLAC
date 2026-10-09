/**
 * SPEC section 2: three self-hosted Instrument faces and nothing else. The old Big Shoulders
 * and Archivo files are gone, the preloads point at real files, and the italic is its own family.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { declarations, normalizeValue, parseCss, type CssBlock } from '../helpers/css';
import { DIST, PAGE_CASES, PUBLIC, distPath, listFiles, pageStylesheets, parsePage, readDist, sha256, siteCss } from '../helpers/dist';
import { FONT_FACES, FONT_FILES, FONT_SHA256, HEAD, OFL_BODY_SHA256, OFL_FILES, RETIRED_FONT_FILES } from '../helpers/spec';

const FONT_URL = /\.(?:woff2?|ttf|otf|eot)(?:[?#]|$)/i;
const fontDir = join(PUBLIC, 'fonts');

const fontFaces = (): CssBlock[] => {
  const faces: CssBlock[] = [];
  const walk = (nodes: CssBlock[]): void => {
    for (const n of nodes) {
      if (n.kind === 'at' && n.name === 'font-face') faces.push(n);
      walk(n.children);
    }
  };
  walk(parseCss(siteCss()));
  return faces;
};
const prop = (face: CssBlock, name: string): string | undefined => face.declarations.find((d) => d.prop === name)?.value;
const unquote = (s: string | undefined): string => (s ?? '').trim().replace(/^["']|["']$/g, '');

describe('font files in public/fonts', () => {
  it('holds the three Instrument faces and their two license texts, and nothing else', () => {
    expect(listFiles(fontDir)).toEqual([...FONT_FILES, ...Object.keys(OFL_FILES)].sort());
  });

  it.each(RETIRED_FONT_FILES)('no longer has %s', (file) => {
    expect(existsSync(join(fontDir, file))).toBe(false);
    expect(existsSync(distPath(`fonts/${file}`))).toBe(false);
  });

  it('ships the same files in dist/fonts', () => {
    expect(listFiles(join(DIST, 'fonts'))).toEqual([...FONT_FILES, ...Object.keys(OFL_FILES)].sort());
  });

  describe.each(FONT_FILES)('%s', (file) => {
    it('is a woff2 file', () => {
      expect(readFileSync(join(fontDir, file)).toString('ascii', 0, 4)).toBe('wOF2');
    });

    it('is the staged file, byte for byte', () => {
      expect(sha256(readFileSync(join(fontDir, file)))).toBe(FONT_SHA256[file]);
    });
  });

  it('has three different font files', () => {
    const hashes = FONT_FILES.map((f) => sha256(readFileSync(join(fontDir, f))));
    expect(new Set(hashes).size).toBe(3);
  });
});

describe('license texts', () => {
  describe.each(Object.entries(OFL_FILES))('%s', (file, copyright) => {
    const text = (): string => readFileSync(join(fontDir, file), 'utf-8');

    it('opens with the project copyright line', () => {
      expect(text().split('\n')[0]).toBe(copyright);
    });

    it('says the font is licensed under the SIL Open Font License, Version 1.1', () => {
      expect(text()).toContain('This Font Software is licensed under the SIL Open Font License, Version 1.1.');
    });

    it('carries the OFL 1.1 text unchanged', () => {
      const t = text();
      const start = t.indexOf('-----------------------------------------------------------\nSIL OPEN FONT LICENSE');
      expect(start, 'the dashed rule before "SIL OPEN FONT LICENSE Version 1.1" is missing').toBeGreaterThan(0);
      expect(sha256(t.slice(start))).toBe(OFL_BODY_SHA256);
    });
  });
});

describe('@font-face rules in the built CSS', () => {
  it('declares exactly three faces', () => {
    expect(fontFaces()).toHaveLength(3);
  });

  describe.each(FONT_FACES)('$family', (expected) => {
    const face = (): CssBlock => {
      const found = fontFaces().find((f) => unquote(prop(f, 'font-family')) === expected.family);
      if (!found) throw new Error(`no @font-face for "${expected.family}"`);
      return found;
    };

    it(`is weight ${expected.weight}`, () => {
      expect(normalizeValue(prop(face(), 'font-weight') ?? '')).toBe(expected.weight);
    });

    it('is style normal (never declared italic)', () => {
      expect(normalizeValue(prop(face(), 'font-style') ?? 'normal')).toBe('normal');
    });

    it('uses font-display: swap', () => {
      expect(normalizeValue(prop(face(), 'font-display') ?? '')).toBe('swap');
    });

    it(`loads /fonts/${expected.file} as woff2`, () => {
      const src = prop(face(), 'src') ?? '';
      expect(src).toMatch(new RegExp(`url\\(["']?/fonts/${expected.file.replace(/\./g, '\\.')}["']?\\)`));
      expect(src).toMatch(/format\(["']?woff2["']?\)/);
    });
  });

  it('keeps the italic out of the upright family (its own family name, not font-style: italic)', () => {
    const families = fontFaces().map((f) => unquote(prop(f, 'font-family')));
    expect(families.sort()).toEqual(['Instrument Sans', 'Instrument Serif', 'Instrument Serif Italic']);
    expect(fontFaces().some((f) => /italic|oblique/i.test(prop(f, 'font-style') ?? ''))).toBe(false);
  });

  it('loads every face only from /fonts/', () => {
    for (const face of fontFaces()) {
      const urls = [...(prop(face, 'src') ?? '').matchAll(/url\(([^)]*)\)/g)].map((m) => unquote(m[1]));
      expect(urls.every((u) => u.startsWith('/fonts/')), `src of ${unquote(prop(face, 'font-family'))}`).toBe(true);
    }
  });
});

describe.each(PAGE_CASES)('fonts referenced by %s', (_label, info) => {
  const fontUrls = (): string[] => {
    const urls: string[] = [];
    for (const sheet of pageStylesheets(info)) {
      for (const m of sheet.css.matchAll(/url\(\s*(["']?)([^)"']+)\1\s*\)/g)) {
        if (FONT_URL.test(m[2] ?? '')) urls.push(m[2] ?? '');
      }
    }
    for (const link of parsePage(info).querySelectorAll('link[as="font"]')) urls.push(link.getAttribute('href') ?? '');
    return urls;
  };

  it('are only the three Instrument files', () => {
    const allowed = new Set(FONT_FILES.map((f) => `/fonts/${f}`));
    const stray = fontUrls().filter((u) => !allowed.has(u));
    expect(stray).toEqual([]);
    expect(new Set(fontUrls()).size, 'the page should reference all three faces').toBe(3);
  });

  it('all exist in dist/', () => {
    const missing = [...new Set(fontUrls())].filter((u) => !existsSync(distPath(u.replace(/^\//, ''))));
    expect(missing).toEqual([]);
  });

  it('preload the two upright faces, with crossorigin, and not the italic', () => {
    const preloads = parsePage(info).querySelectorAll('link[rel="preload"]');
    expect(preloads.map((l) => l.getAttribute('href'))).toEqual([...HEAD.preloads]);
    for (const link of preloads) {
      expect(link.getAttribute('as'), 'as').toBe('font');
      expect(link.getAttribute('type'), 'type').toBe('font/woff2');
      expect(link.hasAttribute('crossorigin'), 'crossorigin').toBe(true);
    }
  });

  it('never mention the retired faces', () => {
    const html = readDist(info.file) + pageStylesheets(info).map((s) => s.css).join('\n');
    expect(html).not.toMatch(/big shoulders|archivo|stencil/i);
  });
});

describe('declarations in the built CSS', () => {
  it('name the retired faces nowhere', () => {
    const names = declarations(parseCss(siteCss())).filter((c) => /big shoulders|archivo|stencil/i.test(c.declaration.value));
    expect(names.map((c) => `${c.declaration.prop}: ${c.declaration.value}`)).toEqual([]);
  });
});
