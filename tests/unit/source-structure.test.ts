/**
 * SPEC sections 0 and 5: the source tree has the components the spec names, each with a typed
 * Props interface and the props and slots the spec lists, and no `any`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SRC, listFiles } from '../helpers/dist';

/** Props each component must accept (SPEC 5). Optional or required does not matter here. */
const COMPONENTS: Record<string, readonly string[]> = {
  Button: ['href', 'variant', 'size'],
  StatusBadge: ['tone', 'label'],
  NowLine: ['tone'],
  Plate: ['src', 'alt', 'width', 'height', 'caption', 'eager', 'sizes', 'srcset'],
  ProjectFeature: ['numeral', 'title', 'tone', 'status', 'href', 'linkLabel', 'reverse'],
  PlateFrame: ['tag', 'caption'],
  SpecPlate: ['rows', 'quote', 'caption'],
  ProjectEntry: ['image', 'imageAlt', 'title', 'line', 'tone', 'status', 'href', 'linkLabel'],
  Lane: ['term'],
  Dotted: ['text'],
  PageHead: ['title', 'lede', 'tagline', 'center'],
  SplitSection: ['heading', 'id'],
  ToolHero: ['tool'],
  SiteNav: ['current'],
  Mark: ['size', 'class'],
};

const read = (path: string): string => readFileSync(join(SRC, path), 'utf-8');

/** Text between the braces that follow `at`, or undefined. */
function braceBody(source: string, at: number): string | undefined {
  const open = source.indexOf('{', at);
  if (open === -1) return undefined;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i);
  }
  return undefined;
}

/** The file an `import type { Name } from '...'` brings `Name` from, as a path under src/, or undefined. */
function importedFrom(source: string, name: string, fromDir: string): string | undefined {
  const m = new RegExp(`import\\s+(?:type\\s+)?\\{[^}]*\\b${name}\\b[^}]*\\}\\s+from\\s+['"]([^'"]+)['"]`).exec(source);
  if (!m?.[1]) return undefined;
  const base = join(fromDir, m[1]);
  return [`${base}.ts`, `${base}.astro`, base].find((f) => existsSync(f));
}

/**
 * The text that declares a component's props: `interface Props { ... }`, or `type Props = Name`
 * with `Name` declared here or imported (a component may reuse a data type for its props).
 * Returns undefined when the component declares no Props at all.
 */
function propsDeclaration(source: string, dir: string): string | undefined {
  const iface = source.search(/\binterface\s+Props\b/);
  if (iface !== -1) {
    const head = source.slice(iface, source.indexOf('{', iface));
    const own = braceBody(source, iface) ?? '';
    const parent = /extends\s+([A-Za-z_]\w*)/.exec(head)?.[1];
    return parent ? `${own}\n${typeBody(parent, source, dir) ?? ''}` : own;
  }
  const alias = /\btype\s+Props\s*=\s*([A-Za-z_]\w*)\s*;?/.exec(source)?.[1];
  return alias ? typeBody(alias, source, dir) : undefined;
}

/** Body of `interface Name` declared in `source` or in a file it imports it from. */
function typeBody(name: string, source: string, dir: string): string | undefined {
  const here = source.search(new RegExp(`\\binterface\\s+${name}\\b`));
  if (here !== -1) return braceBody(source, here);
  const file = importedFrom(source, name, dir);
  if (!file) return undefined;
  const text = readFileSync(file, 'utf-8');
  const there = text.search(new RegExp(`\\binterface\\s+${name}\\b`));
  return there === -1 ? undefined : braceBody(text, there);
}

describe('the pages and layout exist', () => {
  it.each(['pages/index.astro', 'pages/callout.astro', 'pages/vivary.astro', 'pages/about.astro', 'pages/contact.astro', 'pages/404.astro', 'layouts/Base.astro', 'styles/tokens.css', 'data/tools.ts', 'data/projects.ts', 'components/ToolHero.astro', 'components/PageHead.astro', 'pages/sitemap.xml.ts'])(
    'src/%s',
    (path) => {
      expect(existsSync(join(SRC, path)), `src/${path} is missing`).toBe(true);
    },
  );
});

describe.each(Object.entries(COMPONENTS))('component %s', (name, props) => {
  const path = `components/${name}.astro`;

  it('exists', () => {
    expect(existsSync(join(SRC, path)), `src/${path} is missing`).toBe(true);
  });

  it('declares a typed Props (an interface, or an alias of one) with the props the spec lists', () => {
    const body = propsDeclaration(read(path), join(SRC, 'components'));
    expect(body, `src/${path} needs \`interface Props\``).toBeDefined();
    for (const prop of props) expect(body, `Props of ${name} should have "${prop}"`).toMatch(new RegExp(`\\b${prop}\\??\\s*:`));
  });

  it('reads its props from Astro.props', () => {
    expect(read(path)).toMatch(/Astro\.props/);
  });

  it('ships no client script', () => {
    expect(read(path)).not.toMatch(/<script\b/);
  });
});

describe('slots', () => {
  it('ProjectFeature takes the media in a named slot and the body in the default slot', () => {
    const source = read('components/ProjectFeature.astro');
    expect(source).toMatch(/<slot\s+name=["']media["']/);
    expect(source).toMatch(/<slot\s*\/>|<slot>\s*<\/slot>/);
  });

  it('Button takes its label in the default slot', () => {
    expect(read('components/Button.astro')).toMatch(/<slot\s*\/>|<slot>\s*<\/slot>/);
  });

  it('NowLine takes its sentence in the default slot', () => {
    expect(read('components/NowLine.astro')).toMatch(/<slot\s*\/>|<slot>\s*<\/slot>/);
  });

  it('Lanes takes its Lane children in the default slot, and has no props to pass the same thing twice', () => {
    const source = read('components/Lanes.astro');
    expect(source).toMatch(/<slot\s*\/>|<slot>\s*<\/slot>/);
    expect(source).not.toMatch(/Astro\.props/);
  });

  it('SplitSection takes the introduction in a named slot and the content in the default slot', () => {
    const source = read('components/SplitSection.astro');
    expect(source).toMatch(/<slot\s+name=["']intro["']/);
    expect(source).toMatch(/<slot\s*\/>|<slot>\s*<\/slot>/);
  });

  it('PageHead takes what follows the lede in the default slot, a badge in `before` and a picture in `media`', () => {
    const source = read('components/PageHead.astro');
    for (const name of ['before', 'media']) expect(source).toMatch(new RegExp(`<slot\\s+name=["']${name}["']`));
    expect(source).toMatch(/<slot\s*\/>|<slot>\s*<\/slot>/);
  });
});

describe('TypeScript in src/', () => {
  const sources = () => listFiles(SRC).filter((f) => /\.(?:astro|ts)$/.test(f));

  /** Code only: the frontmatter of an .astro file, or a whole .ts file. */
  const code = (file: string): string => {
    const text = read(file);
    if (!file.endsWith('.astro')) return text;
    return /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
  };

  it('has no `any` (annotations, assertions, generics, arrays)', () => {
    const found: string[] = [];
    for (const file of sources()) {
      const stripped = code(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '""');
      for (const m of stripped.matchAll(/(?::\s*any\b|\bas\s+any\b|<any\b|\bany\[\]|\bArray<any>|@ts-ignore|@ts-nocheck)/g)) found.push(`src/${file}: ${m[0]}`);
    }
    expect(found).toEqual([]);
  });

  it('has no @ts-expect-error without a reason', () => {
    const found = sources().filter((file) => /@ts-expect-error\s*$/m.test(code(file)));
    expect(found).toEqual([]);
  });
});

describe('set:html', () => {
  it('is used only with strings written in this repo (never props, fetches or requests)', () => {
    const found: string[] = [];
    for (const file of listFiles(SRC).filter((f) => f.endsWith('.astro'))) {
      for (const m of read(file).matchAll(/set:html=\{([^}]*)\}/g)) {
        if (/Astro\.(?:request|url|cookies)|fetch\(|await /.test(m[1] ?? '')) found.push(`src/${file}: ${m[0]}`);
      }
    }
    expect(found).toEqual([]);
  });
});
