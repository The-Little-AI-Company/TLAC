---
project: TLAC
status: passed
target: Homepage tracer bullet route smoke
command: npm run build
related_modules: [codebase]
related_changes: [homepage-tracer-bullet]
---
# Homepage Route Smoke

The route smoke is valid when the built homepage exists, the local homepage responds
with HTTP 200, and desktop/mobile screenshots show no layout overflow.

## Result

Passed on 2026-06-22.

Commands run:

- `npm audit --audit-level=moderate` -> 0 vulnerabilities
- `npm run check` -> 0 errors, 0 warnings, 0 hints
- `npm run build` -> 1 static page built
- `Test-Path .\dist\index.html` -> true
- `(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4321/).StatusCode` -> 200
- `npx playwright screenshot --viewport-size=1440,1000 http://127.0.0.1:4321/ tmp-tlac-issue3-desktop.png`
- `npx playwright screenshot --viewport-size=390,900 http://127.0.0.1:4321/ tmp-tlac-issue3-mobile.png`
- `create-vivary doctor . --json` -> 18 nodes, 58 edges, 0 broken
- `tropo check --root .` -> 18 documents, 0 errors, 0 warnings
- `git diff --check` -> clean

Screenshots were inspected for desktop and mobile overflow and removed after verification.
