---
project: TLAC
status: passed
target: Projects index route smoke
command: npm run build
related_modules: [codebase]
related_changes: [projects-index]
---
# Projects Index Smoke

The route smoke is valid when `/projects/` returns HTTP 200, renders all six seeded
projects from structured content, and desktop/mobile screenshots show no layout overlap.

## Result

Passed on 2026-06-22.

Commands run:

- `npm audit --audit-level=moderate` -> 0 vulnerabilities
- `npm run check` -> 0 errors, 0 warnings, 0 hints
- `npm run build` -> 2 static pages built
- `/` and `/projects/` route smoke -> 200, 200
- `/projects/` HTML smoke -> six project cards, one H1, primary nav present, all seeded names present
- Desktop/mobile Playwright screenshots inspected for layout overlap
- Copy scan for rejected negative/internal public language in `src` and `README.md` -> clean
- `create-vivary doctor . --json` -> 24 nodes, 76 edges, 0 broken
- `tropo check --root .` -> 24 documents, 0 errors, 0 warnings
- `git diff --check` -> clean
