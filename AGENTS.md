# AGENTS.md - TLAC workspace contract

You are working in the TLAC website workspace for The Little AI Company.

## Branches

- `dev` is active development.
- `prod` is finished/release state only.
- Use short-lived `feat/*` branches opened from `dev` for every implementation issue.
- Open PRs back into `dev`; do not merge directly into `prod`.
- Merge `dev` into `prod` only after the MVP is considered SOLID and Jeff explicitly approves.

## Issue workflow

- Work one GitHub issue at a time. Do not batch unrelated issues into one branch.
- Branch naming: `feat/<issue-number>-<short-slug>`.
- Required loop for every issue:
  1. Plan: read the issue, write the implementation plan and test plan before coding.
  2. Code: implement only the issue scope.
  3. Test: run the local/native verification gate and any issue-specific checks.
  4. Review: open a PR to `dev`; run CI/CD and code review.
  5. Fix: resolve every CI, test, and review finding.
  6. Merge: merge only after the PR is clean.
- If CI does not exist yet, local checks are still mandatory and the missing CI should be called out.
- Start with the roadmap backlog: https://github.com/The-Little-AI-Company/TLAC/issues

## Before code

- Read `README.md`.
- Read `documents/website-prd.md`.
- Read `documents/roadmap.md`.
- Read the active GitHub issue.
- Plan the verification gate before implementation.
- Use small slices that can be checked independently.

## Vivary project brain

- Vivary `0.2.3` coding scaffold is installed in this repo.
- After the required product docs above, use `STATE.md` and `modules/index.md` as the
  project-brain router.
- Open only the relevant `modules/<id>/index.md` before following deeper context.
- Keep `USER.md`, `MEMORY.md`, and `memory/*` private and uncommitted.

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
- Run `create-vivary doctor .` after changing Vivary graph files.
- Run `tropo check --root .` when typed graph files change.

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
