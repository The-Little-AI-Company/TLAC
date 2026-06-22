---
project: TLAC
status: passed
target: Folded-spark logo asset smoke
command: npm run build
related_modules: [codebase]
related_changes: [folded-spark-logo-system]
---
# Folded-Spark Logo Smoke

The logo smoke is valid when exact folded-spark SVG assets exist, primary site
surfaces use the SVG mark for header/home/favicon rendering, and active brand
docs no longer instruct agents to use the legacy mark as the primary logo.

## Evidence

- `npm run check`: passed with 0 errors, 0 warnings, 0 hints.
- `npm run build`: passed and ran route smoke.
- Static logo smoke: built homepage contained folded-spark SVG data for header/home/favicon,
  avoided the generated folded-spark raster for exact logo rendering, and exact SVG mark,
  lockup, and wordmark assets contained no circle elements.
- Browser check against built `dist/`: desktop 1440x1000 and mobile 390x844 rendered the
  header mark, used an SVG favicon, had no horizontal overflow, and had no old mark wording.
