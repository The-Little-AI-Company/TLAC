---
project: TLAC
status: done
slice: Base layout and navigation shell
branch: feat/5-base-layout-shell
related_modules: [codebase]
verification: [shell-accessibility-smoke, astro-build-baseline]
gates: [human-gates]
---
# Base Layout And Navigation Shell

Issue #5 creates a reusable Astro site shell for shared metadata, navigation,
landmarks, skip-link behavior, and footer structure.

## Result

- Added reusable `BaseLayout`, `SiteHeader`, and `SiteFooter` components.
- Moved primary navigation into `src/site/navigation.ts`.
- Added a skip link and stable `main` landmark.
- Kept current navigation to working homepage anchors until future routes exist.
- Preserved cleaned public copy and positive TLAC positioning.
