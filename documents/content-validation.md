# Content Validation

Status: active v0.1  
Owner: Jeff Kazzee  
Created: 2026-06-22

## Contract

TLAC content should fail early when source entries drift out of the public site contract.

Project entries must keep:

- Kebab-case, unique slugs.
- Approved statuses: `planned`, `in-progress`, `live`, `paused`, `research`.
- Required plain-text fields for title, category, purpose, why, and leveled-up copy.
- Valid link labels and URL/root-relative hrefs.
- Existing image files with non-empty alt text.
- Image references registered in `src/site/project-images.ts`.
- Approved palette colors: `blue`, `amber`, `green`, `red`.

Update entries must keep:

- Kebab-case, unique slugs.
- Approved statuses: `draft`, `published`.
- Valid `YYYY-MM-DD` dates.
- Required title and summary copy; summaries stay between 30 and 220 characters.
- Valid link labels and URL/root-relative hrefs.
- Published updates must not use future dates.

## Gate

`npm run build` runs `npm run smoke:content` and
`npm run smoke:update-workflow` after `astro check` and before `astro build`, so
content problems fail before the static artifact is produced.
