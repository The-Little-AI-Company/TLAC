/**
 * URL construction for the SEO module.
 *
 * This is the seam that keeps GitHub Pages base-path handling out of every
 * page file. Nothing outside this file should concatenate a base path or a
 * site origin by hand.
 */

/** Split a segment into its non-empty parts, dropping any leading, trailing,
 * or repeated slashes. */
function segments(value: string | undefined): string[] {
  if (!value) return [];
  return value.split('/').filter(Boolean);
}

/**
 * Join a base path and a route path into exactly one absolute path, with
 * exactly one slash between segments.
 *
 * The result keeps a trailing slash only when `path` had one (or was empty,
 * which is treated as the site root). This preserves the difference between
 * a directory-style route (`/tokens/`) and a file route (`/robots.txt`)
 * regardless of what `trailingSlash` the Astro config uses.
 *
 * `base` may be `undefined`, `''`, `'/'`, `'/web-system'`, or
 * `'/web-system/'` — all of these normalize the same way.
 */
export function joinBase(base: string | undefined, path: string): string {
  const wantsTrailingSlash = path === '' || path.endsWith('/');
  const parts = [...segments(base), ...segments(path)];

  if (parts.length === 0) return '/';

  const joined = `/${parts.join('/')}`;
  return wantsTrailingSlash ? `${joined}/` : joined;
}

/**
 * Build a full canonical URL from a site origin, a base path, and a route
 * path. Never produces a double slash except after the `https:` scheme.
 *
 * `site` may carry a trailing slash (as `Astro.site.href` always does) —
 * that trailing slash is stripped before the base and path are appended.
 */
export function absoluteUrl(site: string, base: string | undefined, path: string): string {
  const origin = site.replace(/\/+$/, '');
  return origin + joinBase(base, path);
}
