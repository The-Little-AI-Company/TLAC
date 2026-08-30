import { FOUNDER, ORGANIZATION_SAME_AS, SITE_NAME, SITE_SUMMARY } from './site';
import type { PageMeta } from './types';
import { absoluteUrl } from './url';

export interface HeadData {
  title: string;
  description: string;
  canonical: string;
  og: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type: 'website' | 'article';
    siteName: string;
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    image?: string;
  };
  /** A JS object, never pre-stringified. The caller decides how to render it. */
  jsonLd: Record<string, unknown>;
}

export interface HeadContext {
  /** The site origin, e.g. `Astro.site.href`. May carry a trailing slash. */
  site: string;
  /** The deployed base path, e.g. `import.meta.env.BASE_URL`. */
  base: string | undefined;
}

/** schema.org type for each page kind. */
const NODE_TYPE: Record<NonNullable<PageMeta['kind']>, string> = {
  home: 'WebSite',
  page: 'WebPage',
  article: 'Article',
  software: 'SoftwareApplication',
  collection: 'CollectionPage',
};

/**
 * Turn one page's metadata into everything its `<head>` needs: title,
 * description, canonical URL, Open Graph and Twitter tags, and a JSON-LD
 * graph. Pure, with no Astro globals, so it is unit-testable without a build.
 *
 * Three decisions here came out of auditing the live site, which had a
 * descriptive title and a social card but no canonical link and no structured
 * data on any template.
 *
 * 1. Every page carries a self-referencing canonical. A missing canonical
 *    leaves the engine to guess which URL is authoritative, and it guesses
 *    using signals you do not control.
 *
 * 2. The Organization node appears on EVERY page, not only the home page. An
 *    entity that is only declared once is only understood by whoever lands
 *    there, and search traffic mostly does not land on the home page. Every
 *    other node points at it by `@id`, so the graph resolves to one org.
 *
 * 3. The node type follows the page's kind. An article that describes itself
 *    as a generic WebPage has thrown away the one machine-readable signal that
 *    says it is a piece of writing with an author and a date.
 */
export function buildHead(meta: PageMeta, ctx: HeadContext): HeadData {
  const canonical = absoluteUrl(ctx.site, ctx.base, meta.path);
  const origin = absoluteUrl(ctx.site, ctx.base, '/');
  const image = meta.image ? absoluteUrl(ctx.site, ctx.base, meta.image) : undefined;
  const type = meta.type ?? 'website';

  const kind = meta.kind ?? (meta.path === '/' ? 'home' : 'page');
  const orgId = `${origin}#organization`;
  const founderId = `${origin}#founder`;

  /*
   * Only claim the founder relationship on routes that actually show it.
   * Structured data that asserts something the page never states is a claim
   * nobody can check, which is exactly the kind of signal this audit set out
   * to remove rather than add.
   */
  const showsFounder = (FOUNDER.visibleOn as readonly string[]).includes(meta.path);

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: SITE_NAME,
    url: origin,
    description: SITE_SUMMARY,
    ...(ORGANIZATION_SAME_AS.length > 0 ? { sameAs: [...ORGANIZATION_SAME_AS] } : {}),
    ...(showsFounder ? { founder: { '@id': founderId } } : {}),
  };

  const pageNode: Record<string, unknown> = {
    '@type': NODE_TYPE[kind],
    '@id': `${canonical}#${kind === 'home' ? 'website' : 'page'}`,
    url: canonical,
    name: meta.title,
    description: meta.description,
    isPartOf: { '@id': orgId },
    ...(meta.updated ? { dateModified: meta.updated } : {}),
    ...(image ? { image } : {}),
  };

  // An Article without an author and a date is missing the two fields that
  // make the type worth declaring at all.
  if (kind === 'article') {
    pageNode.headline = meta.title;
    pageNode.publisher = { '@id': orgId };
    if (meta.published) pageNode.datePublished = meta.published;
    if (meta.author) pageNode.author = { '@type': 'Person', name: meta.author };
  }

  if (kind === 'software') {
    pageNode.applicationCategory = 'DeveloperApplication';
    pageNode.publisher = { '@id': orgId };
  }

  const graph: Record<string, unknown>[] = [organization, pageNode];

  if (showsFounder) {
    graph.push({
      '@type': 'Person',
      '@id': founderId,
      name: FOUNDER.name,
      url: FOUNDER.url,
    });
  }

  return {
    title: meta.title,
    description: meta.description,
    canonical,
    og: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      image,
      type,
      siteName: SITE_NAME,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: meta.title,
      description: meta.description,
      image,
    },
    jsonLd: { '@context': 'https://schema.org', '@graph': graph },
  };
}
