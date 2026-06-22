---
project: TLAC
status: done
slice: Analytics and privacy-light launch measurement
branch: feat/25-privacy-light-analytics
related_modules: [codebase]
verification: [analytics-privacy-smoke]
gates: [human-gates]
---

# Analytics And Privacy-Light Launch Measurement

TLAC now has a documented privacy posture and a disabled-by-default analytics
seam for launch measurement.

The default static build ships without an analytics beacon, tracking script,
provider token, cookie write, or localStorage tracking write. Optional Cloudflare
Web Analytics support can be enabled later with public build-time environment
variables, but no live provider or token is added without explicit approval.
