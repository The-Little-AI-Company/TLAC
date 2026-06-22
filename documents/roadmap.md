# TLAC Roadmap

This is the implementation roadmap for The Little AI Company website. GitHub issues
are the source of truth for active work:

https://github.com/The-Little-AI-Company/TLAC/issues

## Branch Model

- `dev` is active development.
- `prod` is finished-product state only.
- Every implementation issue uses a short-lived `feat/<issue-number>-<short-slug>`
  branch opened from `dev`.
- PRs merge back into `dev`.
- `dev` only merges into `prod` after the MVP is considered SOLID and Jeff approves.

## Required Issue Loop

Every issue follows this workflow:

1. Plan: read the issue and write the implementation plan and test plan before coding.
2. Code: implement only that issue's scope.
3. Test: run the local/native verification gate and any issue-specific checks.
4. Review: open a PR to `dev`; run CI/CD and code review.
5. Fix: resolve every CI, test, and review finding.
6. Merge: merge only after the PR is clean.

Do one issue at a time. Do not batch unrelated issues into one branch.

## Milestones

### M0 Project Brain And Backlog

- [#1 Publish backlog and roadmap docs](https://github.com/The-Little-AI-Company/TLAC/issues/1)

### M1 Static Site Foundation

- [#2 Scaffold Astro static site with verification baseline](https://github.com/The-Little-AI-Company/TLAC/issues/2)
- [#3 Build homepage tracer bullet with one project card](https://github.com/The-Little-AI-Company/TLAC/issues/3)
- [#4 Add project content collection and seed projects](https://github.com/The-Little-AI-Company/TLAC/issues/4)
- [#5 Add base layout, navigation, and responsive shell](https://github.com/The-Little-AI-Company/TLAC/issues/5)

### M2 MVP Public Site

- [#6 Build projects index with filters and status scanning](https://github.com/The-Little-AI-Company/TLAC/issues/6)
- [#7 Build first real project detail page](https://github.com/The-Little-AI-Company/TLAC/issues/7)
- [#8 Build about page defining TLAC boundary](https://github.com/The-Little-AI-Company/TLAC/issues/8)
- [#9 Build updates index and first update entry](https://github.com/The-Little-AI-Company/TLAC/issues/9)
- [#10 Add SEO, sitemap, robots, llms.txt, and structured data](https://github.com/The-Little-AI-Company/TLAC/issues/10)
- [#11 Add 404 and route smoke coverage](https://github.com/The-Little-AI-Company/TLAC/issues/11)

### M3 Polish, Trust, And Launch Readiness

- [#12 Replace four-dot mark with selected abstract TLAC logo system](https://github.com/The-Little-AI-Company/TLAC/issues/12)
- [#13 Refine homepage from selected mockup direction](https://github.com/The-Little-AI-Company/TLAC/issues/13)
- [#14 Add accessibility and keyboard/focus pass](https://github.com/The-Little-AI-Company/TLAC/issues/14)
- [#15 Add image optimization and performance budget](https://github.com/The-Little-AI-Company/TLAC/issues/15)
- [#16 Add content validation for project and update entries](https://github.com/The-Little-AI-Company/TLAC/issues/16)
- [#17 Cloudflare Pages deploy readiness check](https://github.com/The-Little-AI-Company/TLAC/issues/17)

### M4 Roadmap Features

- [#18 Add optional uses page](https://github.com/The-Little-AI-Company/TLAC/issues/18)
- [#19 Add project roadmap and status timeline](https://github.com/The-Little-AI-Company/TLAC/issues/19)
- [#20 Add learning-surface landing page for AI-curious visitors](https://github.com/The-Little-AI-Company/TLAC/issues/20)
- [#21 Add reusable project badge and embeds for child projects](https://github.com/The-Little-AI-Company/TLAC/issues/21)
- [#22 Add richer project comparison and gallery view](https://github.com/The-Little-AI-Company/TLAC/issues/22)

### M5 Growth Surfaces

- [#23 Add blog and update authoring workflow](https://github.com/The-Little-AI-Company/TLAC/issues/23)
- [#24 Add public proof and case-study template](https://github.com/The-Little-AI-Company/TLAC/issues/24)
- [#25 Add analytics and privacy-light launch instrumentation](https://github.com/The-Little-AI-Company/TLAC/issues/25)
