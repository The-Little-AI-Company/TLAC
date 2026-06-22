# TLAC

The public website workspace for **The Little AI Company**.

The Little AI Company is a one-person AI studio by Jeff Kazzee. It exists to showcase
useful AI tools, small apps, and AI-literacy projects with a clear public home.

## Start here

- Product direction: `documents/website-prd.md`
- Brand assets: `documents/brand-assets.md`
- Content validation: `documents/content-validation.md`
- Proof pattern: `documents/proof-case-study.md`
- Analytics and privacy: `documents/analytics-privacy.md`
- Deploy readiness: `documents/deploy-readiness.md`
- Performance budget: `documents/performance-budget.md`
- Update authoring: `documents/update-authoring.md`
- Roadmap and backlog: `documents/roadmap.md`
- Setup checklist: `documents/setup-checklist.md`
- Generated images: `assets/brand/generated/2026-06-21/`
- Site mockup concepts: `assets/brand/generated/2026-06-22/site-mockups/`
- Exact SVG marks: `assets/brand/svg/`
- Vivary project brain: `STATE.md` and `modules/index.md`

## Current state

- Starter docs and brand assets are in place.
- Astro static site scaffolding is in place with npm scripts for local development,
  checks, and builds.
- Project content is modeled through Astro content collections and seeded with the
  approved candidate projects from the PRD.
- Shared layout, header, navigation data, skip link, and footer shell are in place.
- `/projects/` renders the seeded project set with status grouping and category summaries.
- `/projects/gallery/` renders an optional comparison and media gallery view.
- `/projects/[slug]/` renders reusable project detail pages from structured content.
- `/learn/` renders a focused landing page for AI-curious visitors.
- `/project-badge/` renders reusable child-project badge assets and embed guidance.
- `/proof/` renders structured proof notes and case-study detail pages.
- `/roadmap/` renders a public project status and trajectory view.
- `/privacy/` documents launch measurement and the default no-analytics posture.
- `/about/` defines the studio lane and keeps the TLAC site focused on useful AI work.
- `/updates/` renders the first structured update entry as a compact trajectory log.
- `/uses/` renders a restrained TLAC working-kit page without changing primary navigation.
- `robots.txt`, `sitemap.xml`, `llms.txt`, canonical links, and JSON-LD entity data are in place.
- `/404.html` renders a branded recovery page, and `npm run build` includes core route smoke checks.
- The primary logo system uses exact folded-spark SVG marks for header, favicon, and lockups.
- Homepage now follows the Product Proofroom direction with a compact proof board.
- `npm run build` includes accessibility smoke for headings, skip links, alt text, link names, focus hooks, contrast, and wrapping.
- Project detail images use optimized responsive WebP output, and `npm run build` enforces the image performance budget.
- Project/update content has a source validation smoke for slugs, statuses, dates, links, and project image references.
- Update authoring has a lightweight Markdown workflow, template, and smoke gate.
- Proof notes have a structured content collection, template, and smoke gate.
- Launch measurement is documented and configurable, with analytics disabled in the default build.
- Cloudflare Pages readiness is documented and locally gated, with publishing blocked until Jeff approves it.
- Vivary `0.2.3` coding scaffold is installed for project memory and verification.
- GitHub roadmap milestones and issues are published.
- Active development branch is `dev`.
- Finished-product branch is `prod`.
- Remote target: `The-Little-AI-Company/TLAC`.

## Local development

```bash
npm install
npm run check
npm run build
npm run dev
```

## Next implementation slice

Work the GitHub backlog one issue at a time. After the analytics/privacy-light
measurement slice, review the open GitHub issues before starting the next implementation
issue:

- https://github.com/The-Little-AI-Company/TLAC/issues

Every issue follows the same loop: plan, code, test, review, fix, merge.
