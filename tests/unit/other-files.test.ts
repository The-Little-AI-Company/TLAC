/**
 * SPEC section 9: the web manifest, the social card, the README, and the generator script.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIST, PUBLIC, ROOT, listFiles, sha256 } from '../helpers/dist';
import { decodePng, pixelAt, readPngSize } from '../helpers/image';
import { HEAD } from '../helpers/spec';
import { contrast, parseHex } from '../helpers/color';

interface Manifest {
  name?: string;
  short_name?: string;
  theme_color?: string;
  background_color?: string;
  display?: string;
  icons?: { src: string; sizes: string; type: string }[];
}

/** sha256 of the old (education-era rebrand) public/og.png. The new card must be a different image. */
const OLD_OG_SHA256 = '10bde011fcdfed564f623c9d55a301ce9fd1a8490117168d045b5cef70e6bcce';

describe.each([
  ['public/site.webmanifest', join(PUBLIC, 'site.webmanifest')],
  ['dist/site.webmanifest', join(DIST, 'site.webmanifest')],
])('%s', (_name, path) => {
  const manifest = (): Manifest => JSON.parse(readFileSync(path, 'utf-8')) as Manifest;

  it('uses the ivory ground for theme_color and background_color', () => {
    expect(manifest().theme_color).toBe(HEAD.themeColorLight.content);
    expect(manifest().background_color).toBe(HEAD.themeColorLight.content);
  });

  it('keeps its name and standalone display', () => {
    expect(manifest().name).toBe('The Little AI Company');
    expect(manifest().short_name).toBe('Little AI Co');
    expect(manifest().display).toBe('standalone');
  });

  it('keeps the 192px and 512px icons, and they exist', () => {
    const icons = manifest().icons ?? [];
    expect(icons.map((i) => [i.src, i.sizes, i.type])).toEqual([
      ['/icon-192.png', '192x192', 'image/png'],
      ['/icon-512.png', '512x512', 'image/png'],
    ]);
    for (const icon of icons) {
      expect(existsSync(join(DIST, icon.src)), icon.src).toBe(true);
      const { width, height } = readPngSize(readFileSync(join(PUBLIC, icon.src)));
      expect(`${width}x${height}`).toBe(icon.sizes);
    }
  });
});

describe('the social card, public/og.png', () => {
  const file = join(PUBLIC, 'og.png');

  it('is a 1200x630 PNG, and the same file ships in dist/', () => {
    expect(readPngSize(readFileSync(file))).toEqual({ width: 1200, height: 630 });
    expect(sha256(readFileSync(join(DIST, 'og.png')))).toBe(sha256(readFileSync(file)));
  });

  it('is regenerated in the new design, not the old card', () => {
    expect(sha256(readFileSync(file))).not.toBe(OLD_OG_SHA256);
  });

  describe('pixels', () => {
    const png = () => decodePng(readFileSync(file));
    const hex = ([r, g, b]: readonly number[]): string => `#${[r, g, b].map((v) => (v ?? 0).toString(16).padStart(2, '0')).join('')}`;

    it('sits on the ivory ground: the corners and the middle of the margins are --ground', () => {
      const ground = parseHex(HEAD.themeColorLight.content);
      for (const [x, y] of [[2, 2], [1197, 2], [2, 627], [1197, 627], [600, 8]] as const) {
        const [r, g, b] = pixelAt(png(), x, y);
        expect(
          [Math.abs(r - ground.r), Math.abs(g - ground.g), Math.abs(b - ground.b)].every((d) => d <= 3),
          `pixel ${x},${y} is ${hex([r, g, b])}, expected ${HEAD.themeColorLight.content}`,
        ).toBe(true);
      }
    });

    it('carries ink: the title, the mark and a rule, a few percent of the card', () => {
      const image = png();
      let dark = 0;
      for (let i = 0; i < image.width * image.height; i++) {
        const o = i * 4;
        const colour = `#${[0, 1, 2].map((c) => (image.pixels[o + c] ?? 0).toString(16).padStart(2, '0')).join('')}`;
        if (contrast(colour, HEAD.themeColorLight.content) >= 7) dark++;
      }
      const share = dark / (image.width * image.height);
      expect(share, `${(share * 100).toFixed(2)}% of the card is ink`).toBeGreaterThan(0.01);
      expect(share).toBeLessThan(0.4);
    });
  });
});

describe('scripts/', () => {
  const files = () => listFiles(join(ROOT, 'scripts'));

  it('holds the script that renders the social card with Playwright', () => {
    expect(files().length, 'scripts/ is missing or empty').toBeGreaterThan(0);
    const generators = files().filter((f) => {
      const text = readFileSync(join(ROOT, 'scripts', f), 'utf-8');
      return /og\.png/.test(text) && /playwright/i.test(text);
    });
    expect(generators.length, 'no script under scripts/ mentions og.png and playwright').toBeGreaterThan(0);
  });
});

describe('README.md', () => {
  const readme = () => readFileSync(join(ROOT, 'README.md'), 'utf-8');

  it('no longer describes the retired faces', () => {
    expect(readme()).not.toMatch(/Big Shoulders|Archivo|Stencil/);
  });

  it('describes the new fonts, the tokens, and both test suites', () => {
    const text = readme();
    expect(text).toMatch(/Instrument Serif/);
    expect(text).toMatch(/Instrument Sans/);
    expect(text).toMatch(/tokens\.css/);
    expect(text).toMatch(/design\/tokens\.json/);
    expect(text).toMatch(/Playwright|test:e2e/);
    expect(text).toMatch(/pnpm test/);
  });

  it('keeps the dev server address', () => {
    expect(readme()).toContain('http://127.0.0.1:4399');
  });
});

describe('project files', () => {
  it('keeps the CNAME for the custom domain', () => {
    expect(readFileSync(join(PUBLIC, 'CNAME'), 'utf-8').trim()).toBe('littleaicompany.com');
  });

  it('ignores the test output directories', () => {
    const ignore = readFileSync(join(ROOT, '.gitignore'), 'utf-8').split('\n').map((l) => l.trim());
    for (const dir of ['test-results/', 'playwright-report/', 'blob-report/']) expect(ignore).toContain(dir);
  });

  it('has the scripts the team runs', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['test']).toBe('vitest run');
    expect(pkg.scripts['test:e2e']).toBe('playwright test');
    expect(pkg.scripts['verify']).toMatch(/astro check.*astro build.*vitest run.*playwright test/);
    for (const name of ['dev', 'build', 'preview', 'check']) expect(pkg.scripts[name], name).toBeDefined();
  });
});
