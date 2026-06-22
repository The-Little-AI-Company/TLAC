---
project: TLAC
status: passed
target: Project content schema
command: npm run check
related_modules: [codebase]
related_changes: [project-content-collection]
---
# Project Content Schema

The content schema is valid when complete project entries pass Astro checks and a
temporary incomplete project entry fails the local content check.

## Result

Passed on 2026-06-22.

Commands run:

- `npm audit --audit-level=moderate` -> 0 vulnerabilities
- `npm run check` -> 0 errors, 0 warnings, 0 hints with six valid project entries
- Temporary invalid entry `_invalid-schema-smoke.md` -> `npm run check` failed with required field errors
- `npm run build` -> 1 static page built with content collection synced
- `(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4321/).StatusCode` -> 200
- Desktop/mobile Playwright screenshots inspected for homepage overflow
- `create-vivary doctor . --json` -> 20 nodes, 64 edges, 0 broken
- `tropo check --root .` -> 20 documents, 0 errors, 0 warnings
- `git diff --check` -> clean
- Copy scan for negative/internal public language in `src` and `README.md` -> clean

The invalid smoke file was removed after confirming the failure.
