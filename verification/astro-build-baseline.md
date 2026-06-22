---
project: TLAC
status: passed
target: Astro static site baseline
command: npm run check && npm run build
related_modules: [codebase]
related_changes: [astro-static-site-foundation]
---
# Astro Build Baseline

The baseline is valid when the Astro check and static build pass locally.

## Result

Passed on 2026-06-22.

Commands run:

- `npm audit --audit-level=moderate` -> 0 vulnerabilities
- `npm run check` -> 0 errors, 0 warnings, 0 hints
- `npm run build` -> 1 static page built
- `create-vivary doctor . --json` -> 16 nodes, 52 edges, 0 broken
- `tropo check --root .` -> 16 documents, 0 errors, 0 warnings
- `git diff --check` -> clean

Visual proof:

- `npx playwright screenshot --viewport-size=1440,1000 http://127.0.0.1:4321/ tmp-tlac-home-desktop.png`
- `npx playwright screenshot --viewport-size=390,900 http://127.0.0.1:4321/ tmp-tlac-home-mobile.png`

Screenshots were inspected for layout overflow and removed after verification.
