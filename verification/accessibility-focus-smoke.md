---
project: TLAC
status: passed
target: Accessibility and keyboard focus smoke
command: npm run build
related_modules: [codebase]
related_changes: [accessibility-focus-pass]
---
# Accessibility Focus Smoke

The accessibility smoke is valid when the built site preserves semantic page
structure and the browser keyboard path remains usable on the core routes.

Evidence captured during issue #14:

- `scripts/smoke-accessibility.mjs` was added and wired into `npm run build`.
- Accessibility smoke passed for 6 core routes: home, projects index, Obscura
  project detail, about, updates, and 404.
- The smoke checks one H1 per page, heading order, skip-link targets, image alt
  attributes, accessible link names, source focus hooks, contrast tokens, and
  long-text wrapping support.
- Browser keyboard smoke passed on the built site: the skip link moves focus to
  `main#main-content`, home and projects tab stops expose visible focus, project
  filter chips are keyboard reachable, and 390px mobile home/projects widths
  have no horizontal overflow.
