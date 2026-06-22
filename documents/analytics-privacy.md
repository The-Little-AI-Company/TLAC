# Analytics And Privacy-Light Measurement

Status: active v0.1  
Owner: Jeff Kazzee  
Created: 2026-06-22

TLAC should learn from launch traffic without turning the site into a tracking
surface. The default measurement posture is intentionally quiet.

## Decision

Default provider: `none`

The default build ships without an analytics beacon, tracking script, cookie
write, localStorage tracking write, or live provider token. Optional analytics
can be enabled later at build time, but only after Jeff explicitly approves the
provider and the live environment values.

## Optional Provider

Cloudflare Web Analytics is the preferred optional provider because it fits the
planned Cloudflare Pages hosting path. Cloudflare's docs describe it as
privacy-first analytics and currently list it as available on all plans.

Implementation support is present, but disabled by default:

- `PUBLIC_TLAC_ANALYTICS_PROVIDER=cloudflare`
- `PUBLIC_TLAC_CLOUDFLARE_ANALYTICS_TOKEN=<site-token>`

No paid service, external tracking script, production token, or publish/deploy
change should be added without explicit Jeff approval.

Reference:

- Cloudflare Web Analytics docs: `https://developers.cloudflare.com/web-analytics/`
- Cloudflare setup docs: `https://developers.cloudflare.com/web-analytics/get-started/`

## Privacy Commitments

- No ads.
- No retargeting.
- No private personal context.
- No user accounts, form submissions, or contact data.
- No secrets in the static build.
- No cross-site marketing pixels.
- No analytics provider in the default local build.

## Launch Measurement Shape

If Jeff approves enabling measurement, keep it to launch-scale questions:

- Which public pages are actually visited?
- Which project surfaces attract attention?
- Which routes deserve clearer copy, screenshots, or proof notes?
- Whether crawler-facing routes are discoverable.

Do not use analytics to identify individual visitors or infer private personal
context. The site should stay useful, readable, and trustable even with
measurement enabled.

## Verify

Run these before opening a PR:

```bash
npm run smoke:analytics
npm run build
```
