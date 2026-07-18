# The Little AI Company website

The public company website for [The Little AI Company](https://littleaicompany.com).
It teaches practical AI through useful things people can build, while helping
them develop the judgment to know when AI should and should not be trusted.

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
