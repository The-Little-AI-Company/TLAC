# Update Authoring Workflow

Status: active v0.1  
Owner: Jeff Kazzee  
Created: 2026-06-22

TLAC updates are small product-lane notes stored as Markdown files in
`src/content/updates/`. No CMS, backend, accounts, comments, or publishing app is
part of this workflow.

## Lane Check

An update should be about useful AI tools, small apps, learning surfaces,
project proof, or studio progress. Keep it specific to TLAC work and useful for
a visitor who wants to understand what changed.

Good update material:

- A project surface ships, changes shape, or gains clearer proof.
- The site gains a route, asset, validation gate, or release-readiness step.
- A learning surface becomes clearer, safer, or easier to try.
- A public project link, package, doc, or demo becomes stable enough to mention.

## Create The Entry

1. Copy `templates/update-entry.md`.
2. Save it as `src/content/updates/<kebab-case-slug>.md`.
3. Fill in the frontmatter:
   - `title`: short plain-English title.
   - `status`: use `draft` while shaping; use `published` when it should render.
   - `date`: use `YYYY-MM-DD`.
   - `summary`: 30-220 characters, specific enough to stand alone on `/updates/`.
   - `links`: keep as `[]` or add label/href pairs.
4. Write one or two short body paragraphs under the frontmatter.

## Publish Rules

- `draft` entries stay out of `/updates/`.
- `published` entries appear on `/updates/` and must not use a future date.
- Links must be absolute URLs or root-relative site paths.
- Summaries should name the concrete change, not tease a vague announcement.
- Do not add a heavy CMS, backend, account system, comments, or database for
  update authoring.

## Verify

Run these before opening a PR:

```bash
npm run smoke:content
npm run smoke:update-workflow
npm run build
```

`npm run build` also verifies `/updates/` route output through route and
accessibility smoke checks.
