---
project: TLAC
status: passed
target: Optional uses page smoke
command: npm run build
related_modules: [codebase]
related_changes: [uses-page]
---
# Uses Page Smoke

The uses page smoke is valid when `/uses/` builds, keeps the page TLAC-specific,
and remains restrained in navigation placement.

Evidence captured during issue #18:

- RED: route smoke failed with `uses: missing uses/index.html`.
- `/uses/` now renders a compact working-kit page for project memory, build
  surface, verification, and AI-assisted making.
- Primary navigation remains unchanged.
- Footer and About provide restrained, reversible links to `/uses/`.
- Route smoke and accessibility smoke now include `/uses/` and pass as part of
  `npm run build`.
