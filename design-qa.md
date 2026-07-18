# Design QA

## Reference and implementation

- Source direction: approved private HQ direction board
- Product-studio homepage capture:
  `artifacts/design-qa/home-product-studio-1280x720.png`
- Product-studio projects capture:
  `artifacts/design-qa/projects-product-studio-1280x720.png`
- Earlier responsive brand captures remain at
  `artifacts/design-qa/home-tablet-768x900.png` and
  `artifacts/design-qa/home-mobile-390x844-v2.png`.
- Side-by-side comparison: `artifacts/design-qa/source-vs-home-desktop.png`
- Routes checked in the current pass: `/` and `/projects` at 1280 × 720.

## Comparison

- Identity: passed. The half-lidded owl face, rust cardigan, teal trousers,
  warm paper field, and dry editorial style match the approved direction.
- Hierarchy: passed. The company now reads as a software studio first. Products
  occupy the primary homepage section; education is a clearly subordinate
  supporting section.
- Layout and spacing: passed. Desktop preserves the established editorial grid.
  Tablet and mobile keep the mascot, promise, and primary action visible without
  horizontal overflow.
- Typography: passed. The existing Fraunces and Inter pairing was intentionally
  retained as the site's product typography rather than copying type from the
  direction board.
- Color: passed. Ink on paper is 13.30:1 and teal on paper is 6.21:1. The
  interactive dark-rust hover uses 5.28:1 paper-on-rust contrast.
- Asset quality: passed. The site uses the canonical owl mark plus purpose-built
  building, filing, relay, teaching, and coffee poses. All visible images report
  complete with nonzero natural width. No legacy pose or standalone-logo paths
  remain.

## Iterations

1. Replaced the previous robot/owl mixture with one canonical owl family.
2. Expanded the family from five to nine reusable poses, adding building,
   filing, relay, and teaching scenes tied to real site content.
3. Removed twelve legacy pose files and the obsolete standalone logo, and
   replaced the root fallback favicon with the canonical owl.
4. Reframed the homepage, navigation, About, Services, Club, and Contact pages
   around software and current products.
5. Tightened the phone header by collapsing the wordmark to the owl mark below
   520 px, preventing the company name from colliding with the primary action.
6. Replaced the old blue focus ring with the brand teal and darkened the
   interactive rust hover for accessible text contrast.

## Interaction and runtime checks

- The hero and header actions route to `/projects`.
- `/projects` presents Bellamente and Agent Relay with current product and
  repository links.
- The homepage and Projects page have no horizontal overflow at the checked
  desktop viewport.
- Responsive breakpoints remain in place for the header, hero, project cards,
  field-notes panel, forms, and project principles. The current pass did not
  refresh a mobile screenshot because the local browser viewport override did
  not take effect.
- All current homepage and Projects-page images report complete with nonzero
  natural width.
- Browser console: no warnings or errors; development-only Vite and Astro Grab
  connection messages only.
- Automated verification: `pnpm verify` passes Astro checks, a production build
  of 15 pages, and 30 tests.

## Final result

passed
