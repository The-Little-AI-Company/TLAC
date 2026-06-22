---
project: TLAC
status: passed
target: Cloudflare Pages local deploy readiness smoke
command: npm run build
related_modules: [codebase]
related_changes: [cloudflare-deploy-readiness]
---
# Cloudflare Deploy Readiness Smoke

The deploy readiness smoke is valid when the local `dist/` artifact contains the
required static pages and crawler surfaces, the Astro config remains static, and
publishing assumptions are documented without exposing secrets or private local
context.

Evidence captured during issue #17:

- RED: `node scripts/smoke-deploy-readiness.mjs` failed before the readiness doc
  and build wiring existed.
- `documents/deploy-readiness.md` now documents Cloudflare Pages settings,
  environment assumptions, branch assumptions, and the Jeff approval gate.
- `npm run build` now runs `smoke:content`, `smoke:routes`,
  `smoke:accessibility`, `smoke:performance`, and `smoke:deploy-readiness`.
- GREEN: deploy readiness smoke passed with 9 required `dist/` files.
- No deploy, DNS change, Cloudflare project connection, or `prod` promotion was
  performed.
