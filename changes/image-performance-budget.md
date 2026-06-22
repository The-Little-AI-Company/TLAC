---
project: TLAC
status: done
slice: Image optimization and performance budget
branch: feat/15-image-performance-budget
related_modules: [codebase]
verification: [image-performance-budget-smoke]
gates: [human-gates]
---
# Image Performance Budget

Issue #15 replaces broad generated-image imports with an explicit project image
registry and renders project detail visuals through Astro's optimized image
pipeline.

Result: production output no longer ships unused site mockups or exploration
PNGs, project detail images include responsive `srcset`/`sizes` markup, and the
build enforces the image budget through `npm run smoke:performance`.
