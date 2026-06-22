---
project: TLAC
status: passed
target: SEO and crawler route smoke
command: npm run build
related_modules: [codebase]
related_changes: [seo-crawler-surfaces]
---
# SEO Crawler Smoke

The crawler smoke is valid when `robots.txt`, `sitemap.xml`, and `llms.txt` build
with canonical TLAC URLs, and JSON-LD on public pages parses with Organization,
Person, and project-level structured data.

## Evidence

- `npm run check`: passed with 0 errors, 0 warnings, 0 hints.
- `npm run build`: passed and generated `llms.txt` and `sitemap.xml`; `robots.txt`
  copied from `public/` and points to `https://littleaicompany.com/sitemap.xml`.
- Crawler smoke: `sitemap.xml` parsed as XML and included home, Obscura, and updates
  canonical URLs; `llms.txt` included TLAC definition and route map.
- Structured-data smoke: home JSON-LD included Organization, about JSON-LD included
  Person, Obscura JSON-LD included SoftwareApplication, and Obscura canonical link
  matched `https://littleaicompany.com/projects/obscura/`.
