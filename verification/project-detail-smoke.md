---
project: TLAC
status: passed
target: Project detail route smoke
command: npm run build
related_modules: [codebase]
related_changes: [project-detail-page]
---
# Project Detail Smoke

The detail route smoke is valid when `/projects/obscura/` returns HTTP 200,
renders structured status, why, caveats, media, and body content, and desktop/mobile
screenshots show no layout overlap.

## Evidence

- `npm run check`: passed with 0 errors, 0 warnings, 0 hints.
- `npm run build`: passed and generated `/projects/obscura/` plus the other seeded
  project detail routes.
- Static route smoke: passed for one H1, Obscura content, why/caveats/status/links sections,
  media image, back link, and projects-index detail link.
- Browser check against built `dist/`: desktop 1440x1100 and mobile 390x844 both returned
  HTTP 200, rendered the image, had no horizontal overflow, and had no rejected copy.
