---
project: TLAC
status: done
slice: Content validation for projects and updates
branch: feat/16-content-validation
related_modules: [codebase]
verification: [content-validation-smoke]
gates: [human-gates]
---
# Content Validation

Issue #16 adds a source-content smoke gate for project and update entries.

Result: project and update source entries now have explicit validation for
slugs, statuses, dates, required text, links, project images, image registry
coverage, and palette values. Public update surfaces filter to published entries.
