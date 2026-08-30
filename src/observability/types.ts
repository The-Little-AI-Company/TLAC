export type ObservabilityEvent =
  | { kind: 'error'; message: string; source?: string; line?: number; column?: number; stack?: string; at: number }
  | { kind: 'unhandledrejection'; message: string; stack?: string; at: number }
  | { kind: 'vital'; name: 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP'; value: number; rating?: 'good' | 'needs-improvement' | 'poor'; at: number };

export interface Sink { (event: ObservabilityEvent): void }

export interface ObservabilityOptions {
  sink?: Sink;
  /** Cap on events forwarded per page load. Default 50. */
  maxEvents?: number;
  /** Collect Core Web Vitals. Default true. */
  vitals?: boolean;
}
