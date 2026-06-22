---
project: TLAC
status: passed
target: Project badge and embed smoke
command: npm run build
related_modules: [codebase]
related_changes: [project-badge-embeds]
---
# Project Badge Smoke

The project badge smoke is valid when the badge SVGs are exact vector/text
assets, the public guidance page builds, and the embed snippets use a normal
crawler-readable attribution link.

Evidence captured during issue #21:

- RED: `npm run smoke:badges` failed while the badge SVGs, guidance page, and
  docs were missing.
- `/brand/tlac-project-badge.svg` and `/brand/tlac-project-badge-compact.svg`
  are public exact SVG badge assets.
- `/project-badge/` renders badge previews, asset links, usage snippets, and
  placement guidance.
- The snippet guidance uses `rel="author"` and links to `https://littleaicompany.com/`.
- The badge smoke rejects embedded raster image data and generated raster asset
  dependencies.
- Desktop and mobile viewport screenshots were captured through Playwright using
  the local Edge channel; the corrected compact badge and snippet blocks render
  without visible overlap or truncation.
- Route smoke, accessibility smoke, badge smoke, and deploy-readiness smoke pass
  as part of `npm run build`.
