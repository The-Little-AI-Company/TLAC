import type { ObservabilityEvent, ObservabilityOptions, Sink } from './types';

const DEFAULT_MAX_EVENTS = 50;

/**
 * `layout-shift` entries are not part of TypeScript's shipped DOM lib (no
 * stable `LayoutShift` interface exists there yet), so the two fields this
 * module reads are declared locally rather than reached for with `any`.
 */
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

type VitalName = Extract<ObservabilityEvent, { kind: 'vital' }>['name'];

const VITAL_THRESHOLDS: Record<VitalName, { good: number; needsImprovement: number }> = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
  FCP: { good: 1800, needsImprovement: 3000 },
};

function rateVital(name: VitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = VITAL_THRESHOLDS[name];
  if (value <= t.good) return 'good';
  if (value <= t.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * The default sink. It writes to `console` only — no `fetch`, `sendBeacon`,
 * or any other network call leaves the page. Observability is opt-in to
 * telemetry, not opt-out: a caller who wants events shipped somewhere must
 * pass their own `sink` explicitly. This is a deliberate privacy decision,
 * not an oversight.
 */
const defaultSink: Sink = (event) => {
  // eslint-disable-next-line no-console
  console.log('[observability]', event);
};

/**
 * Start capturing client errors and Core Web Vitals. Returns a teardown
 * function that removes every listener and disconnects every observer;
 * calling it more than once is a no-op.
 */
export function observe(options: ObservabilityOptions = {}): () => void {
  const sink = options.sink ?? defaultSink;
  const maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS;
  const collectVitals = options.vitals ?? true;

  let forwardedCount = 0;
  let torndown = false;

  function forward(event: ObservabilityEvent): void {
    if (torndown) return;
    if (forwardedCount >= maxEvents) return;
    forwardedCount += 1;
    try {
      sink(event);
    } catch {
      // A failing sink must never break the page. Swallow and move on.
    }
  }

  function onError(event: ErrorEvent): void {
    try {
      forward({
        kind: 'error',
        message: event.message,
        source: event.filename || undefined,
        line: event.lineno || undefined,
        column: event.colno || undefined,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        at: Date.now(),
      });
    } catch {
      // Never throw out of the listener itself.
    }
  }

  function onUnhandledRejection(event: PromiseRejectionEvent): void {
    try {
      const reason: unknown = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      forward({ kind: 'unhandledrejection', message, stack, at: Date.now() });
    } catch {
      // Never throw out of the listener itself.
    }
  }

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  const observers: PerformanceObserver[] = [];

  if (collectVitals && typeof PerformanceObserver !== 'undefined') {
    let clsValue = 0;
    let inpValue = 0;

    /**
     * One `PerformanceObserver` per entry type, each wrapped in its own
     * try/catch. Some browsers (older Safari and Firefox in particular)
     * throw synchronously from `observe()` for an entry type they do not
     * support, and that throw would otherwise take out every other vital
     * this module collects along with it.
     */
    function tryObserve(type: string, callback: (list: PerformanceObserverEntryList) => void): void {
      try {
        const po = new PerformanceObserver((list) => {
          try {
            callback(list);
          } catch {
            // A misbehaving callback must not break the page either.
          }
        });
        po.observe({ type, buffered: true });
        observers.push(po);
      } catch {
        // Entry type unsupported in this browser. Skip it; the others
        // still register.
      }
    }

    tryObserve('largest-contentful-paint', (list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;
      forward({ kind: 'vital', name: 'LCP', value: last.startTime, rating: rateVital('LCP', last.startTime), at: Date.now() });
    });

    tryObserve('layout-shift', (list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      forward({ kind: 'vital', name: 'CLS', value: clsValue, rating: rateVital('CLS', clsValue), at: Date.now() });
    });

    tryObserve('event', (list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > inpValue) {
          inpValue = entry.duration;
          forward({ kind: 'vital', name: 'INP', value: inpValue, rating: rateVital('INP', inpValue), at: Date.now() });
        }
      }
    });

    tryObserve('paint', (list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          forward({ kind: 'vital', name: 'FCP', value: entry.startTime, rating: rateVital('FCP', entry.startTime), at: Date.now() });
        }
      }
    });

    tryObserve('navigation', (list) => {
      for (const entry of list.getEntries() as PerformanceNavigationTiming[]) {
        forward({
          kind: 'vital',
          name: 'TTFB',
          value: entry.responseStart,
          rating: rateVital('TTFB', entry.responseStart),
          at: Date.now(),
        });
      }
    });
  }

  return function teardown(): void {
    if (torndown) return;
    torndown = true;
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    for (const po of observers) {
      try {
        po.disconnect();
      } catch {
        // Already disconnected, or disconnect unsupported. Either way,
        // teardown must not throw.
      }
    }
  };
}
