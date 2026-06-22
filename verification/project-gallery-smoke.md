---
project: TLAC
status: passed
target: Project gallery comparison smoke
command: npm run build
related_modules: [codebase]
related_changes: [project-gallery-comparison]
---
# Project Gallery Smoke

The project gallery smoke is valid when `/projects/gallery/` builds as an
optional comparison view, uses only approved project media, and keeps the
existing project index available as the primary scan surface.

Evidence captured during issue #22:

- RED: route smoke failed with `projects gallery: missing projects/gallery/index.html`.
- `/projects/gallery/` renders a comparison table for project, category, status,
  links, and detail routes.
- Gallery cards render approved project images from the shared project image
  registry and structured content entries.
- `/projects/`, `sitemap.xml`, and `llms.txt` link to the optional gallery.
- Performance smoke was updated to treat `/projects/gallery/` as a gallery route
  and still require responsive `srcset`/`sizes` on gallery images.
- Desktop and mobile viewport screenshots were captured through Playwright using
  the local Edge channel; the comparison table and gallery layout render without
  visible overlap or truncation.
- Route smoke, accessibility smoke, and performance smoke include the gallery
  and pass as part of `npm run build`.
