# Performance Budget

Status: active v0.1  
Owner: Jeff Kazzee  
Created: 2026-06-22

## Mobile Budget

The TLAC MVP should stay fast on mobile by keeping production image output small:

- No emitted raster image in `dist/_astro` should exceed 450 KB.
- Total emitted raster image bytes in `dist/_astro` should stay under 2.5 MB.
- Project detail images must ship responsive `srcset` and `sizes` markup.
- Source exploration images may remain under `assets/brand/generated/`, but they must not be
  imported into rendered routes unless intentionally used.

## Current Gate

`npm run build` runs:

- `npm run smoke:routes`
- `npm run smoke:accessibility`
- `npm run smoke:performance`

The performance smoke checks the built artifact, not the source folder. This keeps the source
asset archive available while preventing unused mockups and exploratory PNGs from shipping.

Issue #15 baseline: 30 optimized WebP project-image variants, 598876 total raster bytes, and
largest emitted raster at 135188 bytes.
