---
project: TLAC
status: passed
target: Project and update content validation smoke
command: npm run build
related_modules: [codebase]
related_changes: [content-validation]
---
# Content Validation Smoke

The content validation smoke is valid when source project and update entries fail
early on invalid slugs, statuses, dates, links, required text, media references,
or image registry coverage.

Evidence captured during issue #16:

- RED: `node scripts/smoke-content.mjs` failed because the existing update entry
  had no constrained status.
- The update schema now requires `draft` or `published`, and the current update
  is marked `published`.
- Home and updates pages filter update entries to `published`.
- `npm run build` now runs `smoke:content` after `astro check` and before
  `astro build`.
- GREEN: content smoke passed with 6 project entries and 1 update entry.
