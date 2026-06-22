# PRD - The Little AI Company website

Status: draft v0.2  
Owner: Jeff Kazzee  
Created: 2026-06-21

## Problem Statement

Jeff has multiple AI-related projects and a growing practical AI-builder lane, but the public
identity is split across personal sites, project sites, Zo surfaces, YouTube planning, and
local workspace notes. A visitor, hiring manager, collaborator, or AI answer engine should be
able to resolve one clear entity:

**The Little AI Company is a one-person AI studio by Jeff Kazzee that makes useful AI tools,
apps, and learning surfaces.**

The site must not become a catch-all portfolio, a resume site, or a generic AI education blog.
Those jobs belong elsewhere. TLAC needs to make the label feel real, selective, warm, and
memorable, while giving each in-lane project a credible place to point back to.

## Solution

Build a fast static website for `littleaicompany.com` that acts as the label's public home.
The site introduces TLAC in one breath, showcases curated in-lane projects, gives each project
a clean canonical page, publishes lightweight updates, and provides crawler-friendly entity
facts through structured data, `llms.txt`, sitemap, and consistent naming.

The first usable site should be small: home, projects index, project detail pages, about,
updates, and optional uses. It should use the TLAC brand system: warm cream background,
near-black linework/type, the four-dot mark, and Bit the little robot mascot. Generated art is
text-free; exact logos and wordmarks are SVG.

## User Stories

1. As a first-time visitor, I want to understand what The Little AI Company is in five seconds,
   so that I know whether I am in the right place.
2. As a hiring manager, I want to see a focused set of AI-related projects, so that I can judge
   Jeff's practical building ability quickly.
3. As a collaborator, I want to understand the studio's lane, so that I know what kind of
   projects belong under the label.
4. As an AI-curious beginner, I want to find learning tools that are safe and plain-spoken, so
   that I can try AI without feeling sold to.
5. As a developer, I want to find tools like Vivary and Obscura, so that I can inspect the live
   product, docs, repo, or package.
6. As Jeff, I want to separate TLAC from `jeffkazzee.dev`, so that the company label stays
   curated while the personal site holds the full body of work.
7. As Jeff, I want each project to carry a short "a Little AI Company project" identity, so
   that every project strengthens the parent label.
8. As Jeff, I want to add a new project by editing structured content, so that the site can
   stay current without a heavy CMS.
9. As a visitor, I want the project list to show a visible trajectory over time, so that I can
   see Jeff improving and shipping.
10. As a crawler or AI answer engine, I want clean definitions and canonical links, so that I
    can answer "what is The Little AI Company?" accurately.

## Implementation Decisions

- TLAC is a curated label and one-person AI studio, not Jeff's personal portfolio, not a
  resume site, and not a generic education hub.
- A project belongs on TLAC if it is a useful AI web tool/app or helps people use AI well.
- Initial project candidates: Obscura, Vivary, DesignDojo, The Token Repository, and Zo 101
  plus Cookbook.
- Site map: home, projects index, project detail pages, about, updates, and optional uses.
- Home page job: define the label, feature the strongest projects, show the four-dot/Bit
  identity, include a latest-updates strip, and link out to Jeff's personal site.
- Projects are structured content with title, year, status, one-line purpose, category, links,
  screenshot or art, and a short "what leveled up here" line.
- Each project detail page gives the plain definition, why it exists, current status,
  screenshots/assets, stack notes, live/repo links, and honest caveats.
- Exact dot mark and wordmark are SVG. Generated images should not contain readable words or
  fake letterforms.
- Tech direction: Astro static output, content collections for projects and updates, minimal
  client JavaScript, responsive images, and Cloudflare Pages.
- SEO/AEO/GEO: sitemap, robots, `llms.txt`, Organization structured data, Person structured
  data where relevant, SoftwareApplication or CreativeWork structured data on project pages,
  and consistent `The Little AI Company` naming everywhere.
- No backend in v0: no auth, database, accounts, comments, store, checkout, or custom CMS.

## Testing Decisions

- Highest test seam: the built static site as a public artifact.
- Pre-code gate: confirm the current PRD, content model, and in-lane project set are still the
  intended direction.
- Build gate: once the Astro app exists, every implementation slice should pass native
  install/build/type/content checks.
- Route smoke tests: verify home, projects index, at least one project detail page, about,
  updates, and 404 render without console errors.
- Content schema tests: validate required project/update fields, unique slugs, valid statuses,
  valid dates, valid outbound links where feasible, and no missing required images.
- Accessibility checks: verify semantic landmarks, one H1 per page, heading order, focus
  states, keyboard navigation, alt text, and color contrast.
- Performance checks: run Lighthouse or equivalent on the built site, with special attention
  to mobile LCP and image weight.
- Structured-data checks: validate Organization, Person, BreadcrumbList, and project-level
  structured data.
- Visual asset checks: confirm generated raster assets render and are not used where exact
  text should be SVG or HTML.

## Out of Scope

- Building `jeffkazzee.dev` or merging Jeff's personal site into TLAC.
- Publishing, sending, scheduling, or announcing anything externally.
- Moving existing product repos into the GitHub org.
- Creating the full AI-literacy guide library in v0.
- Adding payments, tip jar, paid memberships, store, or checkout.
- Adding user accounts, comments, community features, or user-generated content.
- Adding a heavy CMS or database.
- Transferring Obscura or Vivary ownership.
- Making TLAC the home for games, experiments, or unrelated personal projects.

## Further Notes

- Clearest homepage tagline candidate: "A one-person AI studio."
- Backup options: "Small company. Big leverage." and "Useful things, made by hand and
  machine."
- Open decisions before implementation: final tagline, exact font pair, whether Obscura
  transfers into the org, and whether `/uses` ships in v0.
- First implementation slice: static homepage plus project content model stub, then projects
  index, then one real project detail page, then metadata/structured-data hardening.
