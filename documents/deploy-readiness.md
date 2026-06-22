# Cloudflare Pages Deploy Readiness

Status: ready-for-approval v0.1  
Owner: Jeff Kazzee  
Created: 2026-06-22

## Cloudflare Pages Settings

- Framework preset: Astro or None/static.
- Root directory: repository root.
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `prod`
- Development branch: `dev`
- Node version: local verification uses Node `v24.14.0`; set `NODE_VERSION=24` if the
  Cloudflare Pages project needs an explicit runtime.

## Environment Assumptions

- No secrets are required for the static build.
- No private local paths, API keys, or machine-specific context should appear in `dist/`.
- `astro.config.mjs` must keep `output: "static"` and `site: "https://littleaicompany.com"`.
- `npm run build` is the local production artifact gate and must pass before any deploy review.

## Publishing Gate

Publishing gate: explicit Jeff approval required.

Do not connect production, publish, change DNS, or promote `dev` to `prod` without approval.

Until Jeff approves publishing, Cloudflare Pages work is limited to local readiness checks,
documentation, and PR-reviewed configuration changes.

## Local Readiness Gate

`npm run build` must produce a static `dist/` artifact containing the core routes and crawler
surfaces:

- `/`
- `/projects/`
- at least one project detail page
- `/learn/`
- `/project-badge/`
- `/about/`
- `/updates/`
- `/roadmap/`
- `/uses/`
- `/404.html`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/brand/tlac-project-badge.svg`
- `/brand/tlac-project-badge-compact.svg`

`npm run smoke:deploy-readiness` verifies the local artifact and checks that private/deploy
markers are not present in generated public files.
