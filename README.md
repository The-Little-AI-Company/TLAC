# littleaicompany.com

The public website for [The Little AI Company](https://littleaicompany.com).
Five pages: home, Callout, Vivary, about, contact. Static, no JavaScript, no
third-party requests.

## Stack

- Astro 7, static output
- Vitest against the built `dist/`
- GitHub Pages, custom domain in `public/CNAME`

## Work on it

```sh
pnpm install
pnpm dev
```

The dev server runs at `http://127.0.0.1:4399`.

```sh
pnpm verify
```

Runs `astro check`, the production build, and the tests. The tests read
`dist/`, so run the build first if you run them alone.

## Where things live

| Path | What |
| --- | --- |
| `src/data/tools.ts` | The tools: copy, status, links, and where the version comes from. Edit here first. |
| `src/pages/` | One file per page. |
| `src/components/` | `Mark` (the skull bunny), `Plate` (a tool on the home page), `ToolHero` (a tool page header). |
| `src/styles/global.css` | Tokens, fonts, and the shared layout classes. |
| `public/fonts/` | Big Shoulders Stencil and Archivo, self-hosted under the OFL. |
| `astro.config.mjs` | Redirects for URLs from the old education-era site. |

A tool with a `version` entry in `tools.ts` gets its stamp at build time
from that source (Callout reads the latest GitHub release). If the lookup
fails, the build uses the entry's fallback, so update the fallback when you
cut a release. A tool without a `version` entry shows its `status` instead
(Vivary, until it has a public release).

## Deploy

Every push to `dev` runs `.github/workflows/deploy.yml` and publishes to
GitHub Pages. Merging a pull request into `dev` is the deploy step.

## Brand

The mark, palette, and type rules are in the organization repository at
[`The-Little-AI-Company/.github`](https://github.com/The-Little-AI-Company/.github)
under `brand/BRAND.md`. The copies here under `public/` are exports.
