export const siteUrl = "https://littleaicompany.com";
export const siteName = "The Little AI Company";
export const siteDescription =
  "The Little AI Company is a one-person AI studio by Jeff Kazzee that makes useful AI tools, small apps, and learning surfaces.";
export const founderName = "Jeff Kazzee";
export const founderUrl = "https://jeffkazzee.dev";

export function canonicalUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": canonicalUrl("/#organization"),
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    founder: { "@id": canonicalUrl("/#jeff-kazzee") },
    sameAs: [founderUrl],
  };
}

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": canonicalUrl("/#jeff-kazzee"),
    name: founderName,
    url: founderUrl,
    worksFor: { "@id": canonicalUrl("/#organization") },
  };
}
