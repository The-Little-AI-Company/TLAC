---
project: TLAC
status: passed
target: Updates index route smoke
command: npm run build
related_modules: [codebase]
related_changes: [updates-index]
---
# Updates Index Smoke

The updates route smoke is valid when `/updates/` builds from structured content,
renders one H1, shows the seeded update title, date, summary, and links, keeps
update slugs URL-safe, and links updates from the homepage or navigation without
overexpanding the surface.

## Evidence

- `npm run check`: passed with 0 errors, 0 warnings, 0 hints.
- `npm run build`: passed and generated `/updates/`.
- Static route smoke: passed for one H1, seeded title, summary, date, internal links,
  homepage link, nav link, URL-safe update slugs, and rejected-copy scan.
- Browser check against built `dist/`: desktop 1440x1000 and mobile 390x844 both
  returned HTTP 200, rendered the seeded update, had no horizontal overflow, and
  had no rejected copy.
