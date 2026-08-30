import type { Sink } from './types';

/**
 * Outbound and referral click tracking.
 *
 * This exists because of where it sits on the measurement ladder. Technical
 * eligibility and platform impressions are diagnostic. A click onto a product,
 * a repository, or a referral link is a qualified outcome, and it is the only
 * rung this site can observe on its own without an account anywhere.
 *
 * It records the destination, not the person. There is no identifier, no
 * cookie, no fingerprint, and no cross-site state. The default sink still
 * writes to the console and sends nothing, so switching on a real sink stays a
 * deliberate decision rather than a side effect of adding this file.
 *
 * The anti-metric rule applies to what comes out of here. A raw click count is
 * not success. A click is only interesting next to what it led to, and this
 * module cannot see that.
 */

export interface OutboundEvent {
  kind: 'outbound';
  /** Destination host. Kept separate so grouping needs no URL parsing later. */
  host: string;
  /** Full destination, minus any query string. */
  url: string;
  /** Route the click happened on. */
  from: string;
  /** Set when the link is a referral or affiliate link. */
  referral?: boolean;
  /** Visible text of the link, which is what the reader actually chose. */
  label: string;
  at: number;
}

export interface OutboundOptions {
  sink?: (event: OutboundEvent) => void;
  /** Hosts treated as internal. Defaults to the current host. */
  internalHosts?: string[];
  /** Cap per page load. Default 30. */
  maxEvents?: number;
}

const defaultSink = (event: OutboundEvent): void => {
  // Console only. No request leaves the page until somebody chooses a sink.
  console.info('[outbound]', event);
};

/**
 * Watches for clicks on links leaving the site. Returns a teardown function.
 *
 * Uses one delegated listener on the document rather than a listener per link,
 * so links added after load are covered and teardown is a single removal.
 */
export function trackOutbound(options: OutboundOptions = {}): () => void {
  const sink = options.sink ?? defaultSink;
  const maxEvents = options.maxEvents ?? 30;
  const internal = new Set(
    options.internalHosts ?? [typeof location !== 'undefined' ? location.host : ''],
  );

  let sent = 0;
  let stopped = false;

  function onClick(event: Event): void {
    if (stopped || sent >= maxEvents) return;

    const target = event.target as Element | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href') ?? '';
    // Ignore in-page and non-navigational protocols. A mailto is a real
    // outcome, so it is deliberately NOT ignored.
    if (href.startsWith('#') || href.startsWith('javascript:')) return;

    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    const isMail = url.protocol === 'mailto:';
    if (!isMail && internal.has(url.host)) return;

    const isReferral = anchor.dataset.referral === 'true';

    try {
      sink({
        kind: 'outbound',
        host: isMail ? 'mailto' : url.host,
        // Query strings can carry identifiers, so they are dropped rather than
        // recorded. A referral link's own parameters are the destination's
        // business, not this site's analytics.
        url: isMail ? 'mailto' : `${url.origin}${url.pathname}`,
        from: typeof location !== 'undefined' ? location.pathname : '',
        // Spread rather than assign `undefined`. A key that is always present
        // and usually empty makes the event shape a lie about what was
        // recorded, and this module's whole claim is that it records little.
        ...(isReferral ? { referral: true as const } : {}),
        label: (anchor.textContent ?? '').trim().slice(0, 80),
        at: Date.now(),
      });
      sent += 1;
    } catch {
      // A failing sink must never break a link the reader just clicked.
    }
  }

  document.addEventListener('click', onClick, { capture: true });

  return () => {
    if (stopped) return;
    stopped = true;
    document.removeEventListener('click', onClick, { capture: true });
  };
}
