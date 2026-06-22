---
project: TLAC
status: passed
target: Image optimization and performance budget smoke
command: npm run build
related_modules: [codebase]
related_changes: [image-performance-budget]
---
# Image Performance Budget Smoke

The performance smoke is valid when the built site ships only intentional
production raster assets, project detail images emit responsive markup, and
mobile-oriented image byte budgets stay below the documented caps.

Evidence captured during issue #15:

- Current RED baseline failed with 21.9 MB of raster assets in `dist/_astro`,
  unused site mockups and exploration PNGs in production output, and missing
  project-detail `srcset`/`sizes` markup.
- `src/site/project-images.ts` now imports only the six intentional project
  visuals used by content entries.
- Project detail pages now use Astro's `Image` component with WebP output,
  responsive widths, and explicit `sizes`.
- `npm run build` runs `smoke:routes`, `smoke:accessibility`, and
  `smoke:performance`.
- Performance smoke passed with 30 optimized WebP image variants, 598876 total
  emitted raster bytes, and a largest emitted raster of 135188 bytes.
