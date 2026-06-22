---
project: TLAC
status: done
slice: Projects index
branch: feat/6-projects-index
related_modules: [codebase]
verification: [projects-index-smoke, project-content-schema]
gates: [human-gates]
---
# Projects Index

Issue #6 adds a scan-friendly `/projects/` route that renders all seeded project
content with status grouping, category summaries, and purpose text.

## Result

- Added `/projects/` with all six seeded project entries from the Astro content collection.
- Added status counts and category chips for quick scanning.
- Grouped project cards by status without client-side complexity.
- Updated shared navigation and homepage project CTA to point to the real projects route.
- Kept placeholder/future-route copy out of the public card UI.
