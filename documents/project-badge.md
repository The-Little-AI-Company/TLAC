# Project Badge Guidance

Use the TLAC project badge when a child project should visibly carry the parent
label and link back to The Little AI Company.

## Assets

- Full badge: `/brand/tlac-project-badge.svg`
- Compact badge: `/brand/tlac-project-badge-compact.svg`

## Embed Snippet

```html
<a rel="author" href="https://littleaicompany.com/" aria-label="A Little AI Company project">
  <img
    src="https://littleaicompany.com/brand/tlac-project-badge.svg"
    width="560"
    height="120"
    alt="A Little AI Company project"
  />
</a>
```

Compact version:

```html
<a rel="author" href="https://littleaicompany.com/" aria-label="A Little AI Company project">
  <img
    src="https://littleaicompany.com/brand/tlac-project-badge-compact.svg"
    width="360"
    height="88"
    alt="A Little AI Company project"
  />
</a>
```

## Placement

- Use the full badge in a child project's footer, about page, README, or public
  docs page.
- Use the compact badge in small app chrome, docs sidebars, or launch notes.
- Keep the normal HTML link wrapper so crawlers can resolve the attribution.
- Do not recolor the mark, edit the text, rasterize the badge, move repositories,
  or imply a maintainer/ownership change.
