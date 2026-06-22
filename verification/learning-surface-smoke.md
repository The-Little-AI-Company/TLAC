---
project: TLAC
status: passed
target: Learning-surface landing page smoke
command: npm run build
related_modules: [codebase]
related_changes: [learning-surface-landing]
---
# Learning-Surface Smoke

The learning-surface smoke is valid when `/learn/` builds from the structured
project collection, links only to selected TLAC learning/reference projects, and
stays plain-spoken for AI-curious visitors.

Evidence captured during issue #20:

- RED: route smoke failed with `learn: missing learn/index.html`.
- `/learn/` renders Zo 101, DesignDojo, Cookbook, and The Token Repository from
  project content.
- Primary navigation, footer navigation, `sitemap.xml`, and `llms.txt` include
  the learning route.
- The About page now uses affirmative product language for how TLAC keeps work
  useful.
- Desktop and mobile viewport screenshots were captured through Playwright using
  the local Edge channel; the page rendered without visible overlap or
  truncation.
- Route smoke and accessibility smoke include `/learn/` and pass as part of
  `npm run build`.
