---
project: TLAC
status: done
slice: Update authoring workflow
branch: feat/23-update-authoring-workflow
related_modules: [codebase]
verification: [update-authoring-smoke]
gates: [human-gates]
---
# Update Authoring Workflow

Issue #23 adds a lightweight authoring workflow for ongoing TLAC updates.

Result: updates remain Markdown content entries, backed by a reusable template
and a smoke gate for slugs, statuses, dates, summaries, links, and route output
coverage. No CMS or backend was added.
