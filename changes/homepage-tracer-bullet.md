---
project: TLAC
status: done
slice: Homepage tracer bullet
branch: feat/3-homepage-tracer-bullet
related_modules: [codebase]
verification: [homepage-route-smoke, astro-build-baseline]
gates: [human-gates]
---
# Homepage Tracer Bullet

Issue #3 turns the initial page into a narrow homepage path: a plain TLAC definition,
one representative project card, and structured project data outside the page file.

## Result

- Moved the representative project card data into `src/data/projects.ts`.
- Updated the homepage to state TLAC's definition in the first viewport.
- Rendered one Obscura project card from structured data.
- Kept generated art text-free and used HTML for readable brand copy.
