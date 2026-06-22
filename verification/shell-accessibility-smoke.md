---
project: TLAC
status: passed
target: Base shell accessibility smoke
command: npm run build
related_modules: [codebase]
related_changes: [base-layout-shell]
---
# Shell Accessibility Smoke

The shell smoke is valid when the homepage has one H1, a primary navigation
landmark, a skip link that targets the main landmark, and desktop/mobile layouts
show no header, nav, or footer overlap.

## Result

Passed on 2026-06-22.

Commands run:

- `npm audit --audit-level=moderate` -> 0 vulnerabilities
- `npm run check` -> 0 errors, 0 warnings, 0 hints
- `npm run build` -> 1 static page built
- `(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4321/).StatusCode` -> 200
- HTML smoke -> one H1, primary nav present, skip link targets `#main-content`, footer present
- Desktop/mobile/full-page mobile Playwright screenshots inspected for layout overlap
- Copy scan for rejected negative/internal public language in `src` and `README.md` -> clean
- `create-vivary doctor . --json` -> 22 nodes, 70 edges, 0 broken
- `tropo check --root .` -> 22 documents, 0 errors, 0 warnings
- `git diff --check` -> clean
