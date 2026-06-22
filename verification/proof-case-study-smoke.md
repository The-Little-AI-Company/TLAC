---
project: TLAC
status: passed
target: Proof case-study smoke
command: npm run build
related_modules: [codebase]
related_changes: [proof-case-study-template]
---
# Proof Case-Study Smoke

The proof smoke is valid when proof entries render from structured content, link
back to related projects, and include honest caveats beside the outcome claim.

Evidence captured during issue #24:

- RED: `npm run smoke:proofs` failed while the proof docs, template, content,
  routes, and project-detail integration were missing.
- `src/content/proofs/vivary-project-memory.md` is the first published proof
  entry and references the existing `vivary` project.
- `/proof/` renders the proof index, and `/proof/vivary-project-memory/` renders
  the full case-study pattern.
- The Vivary project detail page links back to the related proof note.
- `npm run build` includes `npm run smoke:proofs` before `astro build`.
- Visual check: desktop and mobile Playwright screenshots were captured for
  `/proof/` and `/proof/vivary-project-memory/`. The proof index card, detail
  hero, project/date facts, and structured proof panels render without overlap or
  truncated text at 1440px and 390px widths.
