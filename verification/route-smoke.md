---
project: TLAC
status: passed
target: Core route smoke
command: npm run build
related_modules: [codebase]
related_changes: [route-smoke-404]
---
# Core Route Smoke

The route smoke is valid when `npm run build` fails clearly if home, projects,
one project detail page, about, updates, or 404 output is missing or missing
expected page content.

## Evidence

- `npm run check`: passed with 0 errors, 0 warnings, 0 hints.
- `npm run build`: passed, generated `/404.html`, and ran `npm run smoke:routes`.
- `npm run smoke:routes`: passed with 6 core routes.
- Browser check against built `dist/`: desktop 1440x900 and mobile 390x844 loaded
  the 404 page, rendered one H1, exposed home/projects/updates/about recovery
  links, had no horizontal overflow, and had no rejected copy.
