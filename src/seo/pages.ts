import type { PageMeta } from './types';

/**
 * The single source of truth for every routable page's metadata. The head
 * of each page, `sitemap.xml`, `robots.txt`, and `llms.txt` all read from
 * this array. A page that is not listed here must not appear in any of the
 * three: `BaseLayout` throws if a page asks for metadata that is missing.
 */
export const PAGES: PageMeta[] = [
  {
    path: '/',
    title: 'Web System Component Lab — The Little AI Company',
    description:
      'The original design tokens, canvas interfaces, and UI system behind The Little AI Company, shown as a living component lab rather than a static style guide.',
    summary:
      'A component lab: design tokens, canvas interfaces, and the shared UI system, rendered live rather than documented as static images.',
    type: 'website',
  },
  {
    path: '/canvas/',
    title: 'Canvas lab — The Little AI Company web system',
    description:
      'One canvas interface drives every visual effect: it caps device pixel ratio, pauses off-screen, honours reduced motion, and releases everything on teardown. Drive each of those from the page and watch the frame counter respond.',
    summary:
      'The shared canvas interface, with live controls for pause, off-screen behaviour, and reduced motion, plus a frame counter that shows when drawing actually stops.',
    type: 'article',
  },
  {
    path: '/updates/',
    title: 'Updates — The Little AI Company',
    description:
      'One entry per shipped thing, newest first, each linking to the thing itself. Subscribe by feed: it needs no account, no algorithm, and nobody else owns the channel.',
    summary: 'The shipping log. One entry per shipped thing, with a link to the proof, plus an RSS feed.',
    kind: 'collection',
    type: 'website',
  },
  {
    path: '/directions/',
    title: 'Three landing directions — The Little AI Company web system',
    description:
      'The same tokens and the same copy, arranged three ways. Each direction makes a different structural argument about what the company site is, so the comparison is about design rather than about which page got better CSS.',
    summary:
      'Three TLAC landing directions built from one token set and one copy set, so the comparison is structural.',
    type: 'article',
  },
  {
    path: '/directions/ledger/',
    title: 'Direction one: Night Ledger — The Little AI Company',
    description:
      'The selected direction, deepened. The site as a ledger: evidence in rows, a fixed rail that keeps your place, and a dither field that gives the page depth without taking the text with it.',
    summary: 'Direction one. The site as a ledger, with evidence in rows and a fixed rail.',
    type: 'article',
  },
  {
    path: '/directions/manifest/',
    title: 'Direction two: Manifest — The Little AI Company',
    description:
      'The site as a shipping manifest. Full-width bands, one claim and one receipt per band, and the ship metaphor carried in the structure rather than added as an illustration.',
    summary: 'Direction two. The site as a shipping manifest, one claim and one receipt per band.',
    type: 'article',
  },
  {
    path: '/directions/bench/',
    title: 'Direction three: Bench — The Little AI Company',
    description:
      'The site as a workbench, on paper rather than at night. Tools laid out in an asymmetric grid, quieter motion, and the craft argument carried by typography and spacing instead of contrast.',
    summary: 'Direction three. The site as a workbench, on paper, with the craft carried by typography.',
    type: 'article',
  },
];
