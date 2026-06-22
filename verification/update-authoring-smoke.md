---
project: TLAC
status: passed
target: Update authoring workflow smoke
command: npm run build
related_modules: [codebase]
related_changes: [update-authoring-workflow]
---
# Update Authoring Smoke

The update authoring smoke is valid when TLAC has a documented Markdown
workflow, a reusable template, and validation for update slugs, dates, summaries,
links, page behavior, and route output.

Evidence captured during issue #23:

- RED: `npm run smoke:update-workflow` failed while
  `documents/update-authoring.md` and `templates/update-entry.md` were missing.
- `documents/update-authoring.md` explains how to create, publish, and verify an
  update entry without adding a CMS or backend.
- `templates/update-entry.md` provides the frontmatter and body shape for new
  update entries.
- `npm run build` includes `npm run smoke:update-workflow` before `astro build`.
- `/updates/` still renders published entries only, newest first, and remains
  covered by route and accessibility smoke.
