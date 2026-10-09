# littleaicompany.com

The public website for [The Little AI Company](https://littleaicompany.com).
Plain static HTML in `site/`: one stylesheet, one small script, no framework,
no third-party requests, no cookies.

Design: Direction D ("Private Press") from the Little AI Company design
system. Instrument Serif headlines, Instrument Sans text, ivory and oxblood in
light mode, warm charcoal in dark mode. The page follows the visitor's system
setting, and the footer button switches it.

## Pages

| Path | What |
| --- | --- |
| `site/index.html` | Home: hero with the Vivary mascot, the two ways to work with me, Vivary and Callout, other projects |
| `site/work.html` | Vivary, Callout and the smaller projects, each with its status |
| `site/services.html` | Live coaching prices and booking, build jobs, questions |
| `site/callout.html` | Callout |
| `site/vivary.html` | Vivary |
| `site/about.html` | About |
| `site/start.html` | Project form. There is no server: it writes the email and opens the visitor's email app |
| `site/404.html` | Not found |

`site/css/site.css` holds the tokens, the three fonts (inlined), the
components and the page layout. `site/js/site.js` runs the phone menu, the
light and dark switch, and the project form.

## Edit

Edit the HTML in `site/` directly and open it in a browser. No build step.

When Callout ships a new release, update `v0.2.0` in `index.html`,
`work.html` and `callout.html`.

## Deploy

Every push to `dev` runs `.github/workflows/deploy.yml`, which adds
redirect pages for the old addresses and publishes `site/` to GitHub Pages.
Merging a pull request into `dev` is the deploy step.

## Leftovers

The Astro source from the previous site (`src/`, `public/`, `tests/`,
`astro.config.mjs`, `package.json`, the pnpm files, `tsconfig.json`,
`vitest.config.ts`) is no longer built or deployed. It can be deleted.
