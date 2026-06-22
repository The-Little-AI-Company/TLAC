---
project: TLAC
status: done
slice: Astro static site foundation
branch: feat/2-astro-static-site
related_modules: [codebase]
related_changes: [local-ci-baseline]
verification: [astro-build-baseline, local-checks]
gates: [human-gates]
---
# Astro Static Site Foundation

Issue #2 establishes the first runnable Astro static site and native verification
baseline for future TLAC implementation slices.

## Result

- Added the Astro static site scaffold, npm scripts, TypeScript config, first page, and
  `public/robots.txt`.
- Used the generated abstract TLAC mark as the first visual identity signal while keeping
  the full logo replacement for issue #12.
- Updated `README.md` with the new local development commands and next issue pointer.
- Verified the first page at desktop and mobile viewport sizes with Playwright screenshots.
