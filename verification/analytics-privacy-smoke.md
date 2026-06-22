---
project: TLAC
status: passed
target: Analytics and privacy-light launch instrumentation
command: npm run smoke:analytics
related_modules: [codebase]
related_changes: [analytics-privacy-light]
---
# Analytics Privacy Smoke

The analytics smoke is valid when launch measurement is documented, configurable,
and disabled in the default build.

Evidence captured during issue #25:

- RED: `npm run smoke:analytics` failed while the analytics/privacy decision doc,
  configurable analytics seam, privacy page, route coverage, deploy coverage,
  crawler coverage, and verification note were missing.
- `documents/analytics-privacy.md` documents `Default provider: none`, explicit
  approval gates, optional Cloudflare Web Analytics support, and No private
  personal context.
- `/privacy/` explains the default build, No ads, No retargeting, and No private
  personal context.
- `npm run build` includes `npm run smoke:analytics` after `astro build`, so the
  default build contains no analytics beacon before route/deploy checks continue.
- Optional config check: a temporary build with
  `PUBLIC_TLAC_ANALYTICS_PROVIDER=cloudflare` and a fake
  `PUBLIC_TLAC_CLOUDFLARE_ANALYTICS_TOKEN` rendered the Cloudflare beacon and
  fake token, then the default build was rerun to restore the no-analytics
  artifact.
- Visual check: desktop and mobile Playwright screenshots were captured for
  `/privacy/`. The privacy panels, mobile footer, and footer link wrapping render
  without overlap or broken link labels.
