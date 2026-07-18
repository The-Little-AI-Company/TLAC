# Design QA

## Reference and implementation

- Source direction: approved private HQ direction board
- Final desktop capture: `artifacts/design-qa/home-desktop-1440x1000-v2.png`
- Final tablet capture: `artifacts/design-qa/home-tablet-768x900.png`
- Final mobile capture: `artifacts/design-qa/home-mobile-390x844-v2.png`
- Side-by-side comparison: `artifacts/design-qa/source-vs-home-desktop.png`
- Route checked: `/` at 1440 × 1000, 768 × 900, and 390 × 844;
  `/start-here` at 1440 × 1000

## Comparison

- Identity: passed. The half-lidded owl face, rust cardigan, teal trousers,
  warm paper field, and dry editorial style match the approved direction.
- Hierarchy: passed. The existing headline remains the dominant element; the
  full mascot is a strong secondary anchor without competing with the primary
  call to action.
- Layout and spacing: passed. Desktop preserves the established editorial grid.
  Tablet and mobile keep the mascot, promise, and primary action visible without
  horizontal overflow.
- Typography: passed. The existing Fraunces and Inter pairing was intentionally
  retained as the site's product typography rather than copying type from the
  direction board.
- Color: passed. Ink on paper is 13.30:1 and teal on paper is 6.21:1. The
  interactive dark-rust hover uses 5.28:1 paper-on-rust contrast.
- Asset quality: passed. All visible brand images load at their intended source
  dimensions, with transparent edges and no missing assets.

## Iterations

1. Replaced the previous robot/owl mixture with one canonical owl family.
2. Tightened the phone header by collapsing the wordmark to the owl mark below
   520 px, preventing the company name from colliding with the Start Here action.
3. Replaced the old blue focus ring with the brand teal and darkened the
   interactive rust hover for accessible text contrast.

## Interaction and runtime checks

- The hero `Start Here →` action navigates to `/start-here`.
- `/start-here` renders the expected `Make your first useful thing.` heading.
- Homepage anchor navigation to `#make` works.
- Desktop, tablet, and mobile layouts have no horizontal overflow.
- The 768 px layout has no broken images.
- All images on `/start-here` report complete with nonzero natural width.
- Browser console: no warnings or errors; development-only Vite and Astro Grab
  connection messages only.
- Automated verification: `pnpm verify` passes Astro checks, a production build
  of 14 pages, and 28 tests.

## Final result

passed
