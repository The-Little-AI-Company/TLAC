# Site discoverability checklist

The primary header stays intentionally small. The footer and `/pages` directory
own complete public-route discovery.

## Completed 2026-07-18

- [x] Inventory every built public HTML route.
- [x] Add a build-output regression test proving every public page is reachable
  from `/` through visible internal links.
- [x] Restore a visible path to the previously orphaned `/club` page.
- [x] Add `/pages` as the complete human-readable site directory.
- [x] List every top-level page and every individual Starter Kit guide.
- [x] Link **All pages** from the footer rendered on every page.
- [x] Keep the primary header limited to Projects, Guides, and About.
- [x] Verify every internal link and asset resolves in the production build.
- [x] Verify desktop layout, footer navigation, console output, and horizontal
  overflow in a real browser.

## Maintenance contract

The built-site tests are the to-do alarm. A newly generated public HTML page must
be linked into the visible site graph and listed on `/pages`; otherwise
`tests/links.test.ts` or `tests/site-pages.test.ts` fails.
