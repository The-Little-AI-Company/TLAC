/**
 * Site-level facts that do not belong to any single page.
 *
 * THE RULE FOR THIS FILE: structured data may only assert what the rendered
 * page also states. A schema graph is a machine-readable restatement of the
 * page, not a place to claim things the page does not.
 *
 * That rule is why `sameAs` below is short. A profile URL that nobody has
 * verified is a fabricated relationship, and it is worse than an absent one,
 * because it teaches a search engine something false about who owns what.
 * Unverified profiles belong in the audit's open actions, not in the graph.
 */

export const SITE_NAME = 'The Little AI Company';

export const SITE_SUMMARY =
  'The Little AI Company builds small, focused AI products. This site publishes the original design tokens, canvas interfaces, and UI system shared across its products.';

/**
 * The founder relationship.
 *
 * A prior presence audit found the company site never states who owns it, so
 * no engine can connect the person to the organization. Declaring it here only
 * helps if the page says it too, which is what `visibleOn` records: the routes
 * that must carry a visible, linked founder credit for this node to be honest.
 */
export const FOUNDER = {
  name: 'Jeff Kazzee',
  url: 'https://jeffkazzee.dev',
  /** Routes that must show a visible founder credit linking to `url`. */
  visibleOn: ['/'] as const,
} as const;

/**
 * Verified public properties only.
 *
 * Each entry has been resolved and confirmed to belong to this organization.
 * Adding a guess here would be a fabricated relationship.
 *
 * Known-unverified and therefore deliberately absent: LinkedIn, X, YouTube.
 * Verify the exact URLs, then add them.
 */
export const ORGANIZATION_SAME_AS: readonly string[] = [
  'https://github.com/The-Little-AI-Company',
];
