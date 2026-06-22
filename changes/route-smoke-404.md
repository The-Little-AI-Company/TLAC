---
project: TLAC
status: done
slice: 404 page and route smoke coverage
branch: feat/11-route-smoke-404
related_modules: [codebase]
verification: [route-smoke]
gates: [human-gates]
---
# Route Smoke And 404

Issue #11 adds a branded 404 page and a build-time route smoke script for the
core public routes.

Result: `/404.html` builds as a recovery page, and `npm run build` now runs the
core route smoke script after Astro build.
