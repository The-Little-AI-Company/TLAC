# TLAC living-type prototype

This throwaway prototype tests two selected landing-page systems across a full page.

- ?variant=3 shows the revised Night Ledger. It is the preferred direction.
- ?variant=1 shows the Signal Workshop companion.

Both variants use the canonical Hoolio assets. The moving dither field uses frames from the existing Fal-generated clip. Browser code renders those frames as ordered dots. CSS and JavaScript animate live text and page transitions.

## Run the prototype

From the TLAC repository, run pnpm prototype:motion.

Open http://127.0.0.1:4404/prototype-motion-study/?variant=3.

Use the bottom controls or the left and right arrow keys to switch variants. Use the motion control to pause or play the Fal frame loop. Page motion also respects the operating system's reduced-motion setting.

## What to review

1. Check whether the Night Ledger palette feels like TLAC without the green-on-green cast.
2. Check whether Archivo gives the headlines enough character without reducing clarity.
3. Scroll through the chapters. Judge the text reveals, moving statements, and section rhythm.
4. Compare option 1 with option 3. Decide which parts belong in a production design system.

## Boundaries

- This folder is a prototype. It is not part of the Astro site.
- The new sections use draft copy and links.
- The browser does not generate new imagery or video.
- The current Fal source still contains exploratory marks. It is not a canonical brand asset.
- A production build must replace this throwaway code and pass the TLAC release checks.
