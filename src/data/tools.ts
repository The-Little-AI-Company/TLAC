export type VersionSource =
  | { kind: 'github-release'; repo: string }
  | { kind: 'npm'; pkg: string };

export interface Link {
  label: string;
  href: string;
}

export interface Tool {
  slug: 'callout' | 'vivary';
  name: string;
  tagline: string;
  summary: string;
  platform: string;
  status: string;
  version: { fallback: string; source: VersionSource };
  primary: Link;
  repo: string;
  docs?: string;
}

export const tools: Tool[] = [
  {
    slug: 'callout',
    name: 'Callout',
    tagline: 'Press a key. Get the receipts.',
    summary:
      'Press a hotkey over anything you are reading. A small popover tells you whether the text is trying to manipulate you, and whether its claims hold up against sources it fetched.',
    platform: 'Windows 10 and 11',
    status: 'Private beta',
    version: {
      fallback: 'v0.2.0',
      source: { kind: 'github-release', repo: 'The-Little-AI-Company/callout' },
    },
    primary: { label: 'Request beta access', href: 'https://the-little-ai-company.github.io/callout/' },
    repo: 'https://github.com/The-Little-AI-Company/callout',
  },
  {
    slug: 'vivary',
    name: 'Vivary',
    tagline: 'Memory your agents keep in files you can read.',
    summary:
      'Typed memory, search, and human gates for AI-agent workspaces, kept as plain Markdown files you can open and diff. One command scaffolds a workspace.',
    platform: 'Node 22 or Python 3.11 and later',
    status: 'In development',
    version: {
      fallback: 'v0.4.2',
      source: { kind: 'npm', pkg: '@vivary/create' },
    },
    primary: { label: 'Read the docs', href: 'https://vivary.vercel.app/' },
    repo: 'https://github.com/vivary-dev/vivary',
    docs: 'https://vivary.vercel.app/',
  },
];

export function tool(slug: Tool['slug']): Tool {
  const found = tools.find((t) => t.slug === slug);
  if (!found) throw new Error(`no tool registered for ${slug}`);
  return found;
}

// Resolved at build time so the plates show the shipped version without a
// hand edit per release. Any failure falls back to the registered value.
export async function latestVersion({ fallback, source }: Tool['version']): Promise<string> {
  const url =
    source.kind === 'npm'
      ? `https://registry.npmjs.org/${source.pkg}/latest`
      : `https://api.github.com/repos/${source.repo}/releases/latest`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return fallback;
    const body = (await res.json()) as { version?: string; tag_name?: string };
    const raw = source.kind === 'npm' ? body.version : body.tag_name;
    if (!raw) return fallback;
    return raw.startsWith('v') ? raw : `v${raw}`;
  } catch {
    return fallback;
  }
}
