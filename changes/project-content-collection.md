---
project: TLAC
status: done
slice: Project content collection
branch: feat/4-project-content-collection
related_modules: [codebase]
verification: [project-content-schema, astro-build-baseline]
gates: [human-gates]
---
# Project Content Collection

Issue #4 introduces the Astro project content collection and seeds the approved
candidate project set from the PRD.

## Result

- Added `src/content.config.ts` with a project schema and Astro glob loader.
- Seeded Obscura, Vivary, DesignDojo, The Token Repository, Zo 101, and Cookbook.
- Updated the homepage to read its featured project from the `projects` collection.
- Removed the temporary issue #3 project data module.
- Excluded `src/content` from Tropo so Astro content files do not get parsed as Vivary graph documents.
- Removed negative/internal positioning language from homepage copy and seeded project content.
