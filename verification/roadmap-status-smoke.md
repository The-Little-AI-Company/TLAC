---
project: TLAC
status: passed
target: Roadmap status and timeline smoke
command: npm run build
related_modules: [codebase]
related_changes: [roadmap-status-timeline]
---
# Roadmap Status Smoke

The roadmap smoke is valid when `/roadmap/` builds from structured project and
update data, distinguishes shipped, active, planned, and research lanes, and
keeps unfinished work framed in clear current-stage language.

Evidence captured during issue #19:

- RED: route smoke failed with `roadmap: missing roadmap/index.html`.
- `research` is now an approved project status in schema, content smoke, labels,
  and content validation docs.
- DesignDojo and The Token Repository are marked `research`; Obscura and Vivary
  remain `in-progress`; Cookbook and Zo 101 remain `planned`; no project is
  marked shipped/live yet.
- `/roadmap/` renders structured project lanes and a recent public movement
  timeline from published updates.
- A desktop viewport screenshot was captured through Playwright using the local
  Edge channel; the first viewport rendered without visible overlap or truncation.
- Route smoke and accessibility smoke now include `/roadmap/` and pass as part
  of `npm run build`.
