# AGENTS.md - TLAC workspace contract

You are working in the TLAC website workspace for The Little AI Company.

## Branches

- `dev` is active development.
- `prod` is finished/release state only.
- Use short-lived `feat/*` branches only for larger task blocks.

## Before code

- Read `README.md`.
- Read `documents/website-prd.md`.
- Plan the verification gate before implementation.
- Use small slices that can be checked independently.

## Product boundary

The Little AI Company is a selective label and one-person AI studio. It is not Jeff's personal
resume site, not a catch-all portfolio, and not a generic education blog.

In-lane projects help people use AI well or are genuinely useful AI-powered tools/apps.
Games, unrelated experiments, and the full index of Jeff's work belong on `jeffkazzee.dev`.

## Verification

Until the app exists, use file-level verification:

- Confirm required docs exist.
- Confirm assets render and are present under `assets/brand/`.
- Confirm git branch and remote before commits or pushes.

After the app exists, use the native stack checks. Expected direction:

- `pnpm install`
- `pnpm check` or stack equivalent
- `pnpm build`
- browser/screenshot check for the primary pages

## Gates

Ask Jeff before publishing, deploying, moving repos, deleting source material, adding paid
services, or exposing private personal context.

Jeff has already approved initializing this repository, connecting it to the GitHub
organization, committing the starter state, and pushing the `dev` branch.
