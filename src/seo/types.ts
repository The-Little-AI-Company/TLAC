/**
 * What a page kind means for structured data.
 *
 * The live site declared no type on any template, which throws away the one
 * machine-readable signal that distinguishes a guide from a product page. The
 * kind drives the schema.org node type in `head.ts`.
 */
export type PageKind =
  /** The site root. Emits `WebSite`. */
  | 'home'
  /** An ordinary page. Emits `WebPage`. */
  | 'page'
  /** A piece of writing with an author and a date. Emits `Article`. */
  | 'article'
  /** A product or tool. Emits `SoftwareApplication`. */
  | 'software'
  /** An index that lists other pages. Emits `CollectionPage`. */
  | 'collection';

export interface PageMeta {
  /** Route path, e.g. '/', '/guides/prompt-anatomy/'. Always trailing-slashed. */
  path: string;
  title: string;
  description: string;
  /**
   * Drives the schema.org node type. Defaults to `home` for '/' and `page`
   * otherwise, so an unclassified page still emits something valid.
   */
  kind?: PageKind;
  /** Optional OG image path relative to the site. */
  image?: string;
  /** Excluded from the sitemap and llms.txt when true. */
  noindex?: boolean;
  /** One-line summary for llms.txt. Falls back to description. */
  summary?: string;
  /** Open Graph object type. Separate from `kind`, which drives schema.org. */
  type?: 'website' | 'article';
  /** ISO date. Emitted as `dateModified`. */
  updated?: string;
  /** ISO date. Emitted as `datePublished` on an article. */
  published?: string;
  /** Article author. Emitted as a `Person`. */
  author?: string;
}
