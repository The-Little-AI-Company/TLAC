---
project: TLAC
status: done
slice: SEO and crawler surfaces
branch: feat/10-seo-crawler-surfaces
related_modules: [codebase]
verification: [seo-crawler-smoke]
gates: [human-gates]
---
# SEO And Crawler Surfaces

Issue #10 adds canonical metadata, JSON-LD entity data, project structured data,
and crawler outputs for `sitemap.xml`, `robots.txt`, and `llms.txt`.

Result: public pages now emit canonical links and JSON-LD, project detail pages
emit project-level structured data, `sitemap.xml` and `llms.txt` are generated,
and `robots.txt` points crawlers to the generated sitemap.
