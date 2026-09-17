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
  // Absent when the tool has no public release to stamp.
  version?: { fallback: string; source: VersionSource };
  primary: Link;
  repo: string;
}

export const tools: Tool[] = [
  {
    slug: 'callout',
    name: 'Callout',
    tagline: 'Press a key. Get the receipts.',
    summary:
      'Press a hotkey over anything you are reading. A small popover tells you whether the text is trying to manipulate you, and whether its claims hold up against sources it fetched.',
    platform: 'Windows 10 and 11',
    status: 'Released',
    version: {
      fallback: 'v0.2.0',
      source: { kind: 'github-release', repo: 'The-Little-AI-Company/callout' },
    },
    primary: { label: 'Download for Windows', href: 'https://github.com/The-Little-AI-Company/callout/releases/latest' },
    repo: 'https://github.com/The-Little-AI-Company/callout',
  },
  {
    slug: 'vivary',
    name: 'Vivary',
    tagline: 'Your projects. Your agents. Your machine.',
    summary:
      'A desktop workspace for working with AI agents on your own projects. Agent chat, project files, tools, and memory in one app, with your agents, credentials, files, and history kept on the host.',
    platform: 'Windows first. Web client for a self-hosted instance.',
    status: 'In development',
    primary: { label: 'Watch the release queue', href: 'https://github.com/vivary-dev/Vivary-New/milestone/1' },
    repo: 'https://github.com/vivary-dev/Vivary-New',
  },
];

export function tool(slug: Tool['slug']): Tool {
  const found = tools.find((t) => t.slug === slug);
  if (!found) throw new Error(`no tool registered for ${slug}`);
  return found;
}

// Resolved at build time so a plate shows the shipped version without a
// hand edit per release. Any failure falls back to the registered value.
export async function latestVersion(version: Tool['version']): Promise<string | undefined> {
  if (!version) return undefined;
  const { fallback, source } = version;
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
