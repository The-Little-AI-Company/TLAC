# Proof And Case-Study Pattern

Status: active v0.1  
Owner: Jeff Kazzee  
Created: 2026-06-22

Proof entries live in `src/content/proofs/`. They are structured notes for
showing practical outcomes from TLAC projects and learning surfaces without
turning the site into claim-heavy marketing copy.

## Required Shape

Each proof entry captures:

- `problem`: the practical problem or friction.
- `build`: what TLAC made, changed, or tested.
- `proof`: what changed in observable terms.
- `lesson`: what became clearer.
- `nextStep`: what should happen next.
- `caveats`: honest caveats that limit the claim.

## Authoring Rules

- Start from `templates/proof-entry.md`.
- Save entries as `src/content/proofs/<kebab-case-slug>.md`.
- Reference an existing project slug in `project`.
- Keep `status: draft` until the note should appear on `/proof/`.
- Use links to connect the proof to project pages, updates, or docs instead of
  duplicating those pages.
- Do not turn caveats into footnotes; honest caveats are part of the proof.

## Verify

Run these before opening a PR:

```bash
npm run smoke:proofs
npm run build
```
