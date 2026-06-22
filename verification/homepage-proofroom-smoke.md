---
project: TLAC
status: passed
target: Homepage proofroom browser smoke
command: npm run build
related_modules: [codebase]
related_changes: [homepage-proofroom-refine]
---
# Homepage Proofroom Smoke

The homepage proofroom smoke is valid when the built homepage identifies TLAC in
the first viewport, exposes a scan-first proof board with real project and update
content, hints at the next section on desktop and mobile, and passes browser
layout checks without decorative clutter.

Evidence captured during issue #13:

- `npm run check` passed with 0 errors, 0 warnings, and 0 hints.
- `npm run build` passed and route smoke reported `Route smoke passed: 6 core routes`.
- Static homepage smoke confirmed one H1, TLAC identity, proof board copy, the
  featured project link, the latest update link, the folded-spark mark, and no
  rejected internal boundary copy.
- Browser smoke passed at desktop 1440x1000 and mobile 390x844: page returned
  HTTP 200, title matched The Little AI Company, the proof board entered the
  first viewport, the featured card appeared early, and no horizontal overflow
  was detected.
- Screenshots captured: `tlac-home-proofroom-desktop.png` and
  `tlac-home-proofroom-mobile.png`.
