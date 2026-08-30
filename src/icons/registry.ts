/**
 * Icon registry.
 *
 * Inline SVG, no runtime icon package. Every entry records where it came from
 * and under which licence, because the Iconify application's own licence does
 * not cover the icons it serves — each upstream collection keeps its own, and
 * a search service that hides that difference is how the wrong licence ships.
 *
 * Retrieved 2026-07-31 from the public Iconify API:
 *   https://api.iconify.design/{prefix}/{name}.svg?height=none
 *
 * The height=none parameter returns the viewBox with no width or height, ready
 * to size with CSS. Every collection below reports palette: false, which is
 * what makes currentColor work — a palette set carries fixed colours and would
 * ignore it.
 *
 * ATTRIBUTION RULE: attributionRequired is true whenever the SPDX id starts
 * with CC-BY. Those collections need a visible credit rather than a notice
 * file, and Font Awesome families are the common case. None of the collections
 * here need one, but the rule belongs beside the data rather than in someone's
 * memory.
 *
 * Generated once, then edited by hand. Nothing is fetched at build time.
 */

export interface IconLicence {
  title: string;
  spdx: string;
  url: string;
}

export interface IconEntry {
  /** Name used in markup. */
  local: string;
  /** Upstream collection prefix and icon name, so a change can be traced back. */
  prefix: string;
  name: string;
  description: string;
  viewBox: string;
  body: string;
  collection: { name: string; author: string; licence: IconLicence };
  retrieved: string;
  attributionRequired: boolean;
}

export const ICONS = {
  Ship: {
    local: 'Ship',
    prefix: 'lucide',
    name: 'ship',
    description: 'A ship. Used wherever the copy talks about shipping.',
    viewBox: '0 0 24 24',
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 10.189V14m0-12v3m7 8V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1c2.5 0 2.5-2 5-2c1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/></g>`,
    collection: {
      name: 'Lucide',
      author: 'Lucide Contributors',
      licence: {
        title: 'ISC',
        spdx: 'ISC',
        url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
      },
    },
    retrieved: '2026-07-31',
    attributionRequired: false,
  },
  Anchor: {
    local: 'Anchor',
    prefix: 'lucide',
    name: 'anchor',
    description: 'An anchor. Pairs with the ship for the harbour language.',
    viewBox: '0 0 24 24',
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 6v16m7-9l2-1a9 9 0 0 1-18 0l2 1m4-2h6"/><circle cx="12" cy="4" r="2"/></g>`,
    collection: {
      name: 'Lucide',
      author: 'Lucide Contributors',
      licence: {
        title: 'ISC',
        spdx: 'ISC',
        url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
      },
    },
    retrieved: '2026-07-31',
    attributionRequired: false,
  },
  Check: {
    local: 'Check',
    prefix: 'lucide',
    name: 'check',
    description: 'A check mark. Verification and passed checks.',
    viewBox: '0 0 24 24',
    body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/>`,
    collection: {
      name: 'Lucide',
      author: 'Lucide Contributors',
      licence: {
        title: 'ISC',
        spdx: 'ISC',
        url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
      },
    },
    retrieved: '2026-07-31',
    attributionRequired: false,
  },
  ArrowRight: {
    local: 'ArrowRight',
    prefix: 'lucide',
    name: 'arrow-right',
    description: 'Forward movement. Inline in calls to action.',
    viewBox: '0 0 24 24',
    body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7l-7 7"/>`,
    collection: {
      name: 'Lucide',
      author: 'Lucide Contributors',
      licence: {
        title: 'ISC',
        spdx: 'ISC',
        url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
      },
    },
    retrieved: '2026-07-31',
    attributionRequired: false,
  },
  Compass: {
    local: 'Compass',
    prefix: 'ph',
    name: 'compass',
    description: 'A compass. Direction and orientation.',
    viewBox: '0 0 256 256',
    body: `<path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m44.42-143.16l-64 32a8.05 8.05 0 0 0-3.58 3.58l-32 64A8 8 0 0 0 80 184a8.1 8.1 0 0 0 3.58-.84l64-32a8.05 8.05 0 0 0 3.58-3.58l32-64a8 8 0 0 0-10.74-10.74M138 138l-40.11 20.11L118 118l40.15-20.07Z"/>`,
    collection: {
      name: 'Phosphor',
      author: 'Phosphor Icons',
      licence: {
        title: 'MIT',
        spdx: 'MIT',
        url: 'https://github.com/phosphor-icons/core/blob/main/LICENSE',
      },
    },
    retrieved: '2026-07-31',
    attributionRequired: false,
  },
} satisfies Record<string, IconEntry>;

export type IconName = keyof typeof ICONS;

/** Collections in use, for the evidence record and the lab's provenance table. */
export const ICON_COLLECTIONS = Array.from(
  new Map(Object.values(ICONS).map((i) => [i.prefix, i.collection])).entries(),
).map(([prefix, collection]) => ({ prefix, ...collection }));
