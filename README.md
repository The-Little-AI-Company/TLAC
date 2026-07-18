# The Little AI Company website

The public company website for [The Little AI Company](https://littleaicompany.com).
It is the front door for the software, open-source projects, and practical
resources the company makes. Education supports the products; it is not the
company's primary identity.

## Stack

- Astro static site
- TypeScript
- Vitest
- GitHub Pages

## Local development

```sh
pnpm install
pnpm dev
```

The local site runs at `http://127.0.0.1:4399`.

## Verification

```sh
pnpm verify
```

This runs Astro checks, the production build, and the test suite.

## Deployment

Pushes to `dev` deploy through `.github/workflows/deploy.yml` to GitHub Pages.
The custom domain is recorded in `public/CNAME`.

## Brand assets

Reviewed website copies live under `public/brand/`. Canonical organization assets
and export tooling live in the `The-Little-AI-Company/.github` repository under
`brand/`.

The public `/brand` page introduces Hollis and presents the mark, illustration
library, downloads, visual-system specification, and character contract without
turning the company profile into asset documentation.
