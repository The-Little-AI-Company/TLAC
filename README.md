# TLAC

The public website workspace for **The Little AI Company**.

The Little AI Company is a one-person AI studio by Jeff Kazzee. It exists to showcase
useful AI tools, small apps, and AI-literacy projects with a clear public home.

## Start here

- Product direction: `documents/website-prd.md`
- Brand assets: `documents/brand-assets.md`
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
- `/projects/[slug]/` renders reusable project detail pages from structured content.
- `/about/` defines the studio lane and points broader personal work to Jeff's site.
- `/updates/` renders the first structured update entry as a compact trajectory log.
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

Work the GitHub backlog one issue at a time. After the updates index, the next
implementation issue is:

- https://github.com/The-Little-AI-Company/TLAC/issues/10

Every issue follows the same loop: plan, code, test, review, fix, merge.
