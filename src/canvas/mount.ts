import type { CanvasEffect, CanvasHandle, CanvasSize, MountOptions } from './types';

const DEFAULT_MAX_DPR = 2;

/**
 * Returned when the canvas cannot run at all. Every method is a safe no-op, so
 * a caller never needs to null-check the handle or wrap `mount` in a try.
 */
function noopHandle(): CanvasHandle {
  return {
    resize() {},
    setActive() {},
    setReducedMotion() {},
    destroy() {},
  };
}

/**
 * Mounts a decorative `<canvas>` inside `target` and drives `effect` through its
 * lifecycle: sizing (ResizeObserver + DPR clamping), visibility (IntersectionObserver +
 * document `visibilitychange`), reduced motion (`matchMedia` + manual override), and
 * context loss — all without the effect ever touching a browser API directly.
 *
 * Frames are produced only when every one of these holds:
 * `active && onscreen && documentVisible && !reducedMotion && !contextLost`.
 */
export function mount(target: HTMLElement, effect: CanvasEffect, options: MountOptions = {}): CanvasHandle {
  const maxDpr = options.maxDpr ?? DEFAULT_MAX_DPR;
  const autoPauseOffscreen = options.autoPauseOffscreen ?? true;
  const respectReducedMotion = options.respectReducedMotion ?? true;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  target.appendChild(canvas);

  // A decorative canvas must never be able to break the page. If the browser
  // will not give us a context, remove the element and hand back a dead handle
  // rather than throwing into the caller's render path.
  let maybeCtx: CanvasRenderingContext2D | null = null;
  try {
    maybeCtx = canvas.getContext('2d');
  } catch {
    maybeCtx = null;
  }
  if (!maybeCtx) {
    canvas.remove();
    return noopHandle();
  }
  // Narrowed once, to a variable that is never reassigned, so every nested function
  // declared below can rely on its non-null type without re-checking.
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let destroyed = false;
  let active = true;
  let onscreen = true;
  let documentVisible = document.visibilityState !== 'hidden';
  let reducedMotion = false;
  let contextLost = false;

  let rafId: number | null = null;
  let loopStart: number | null = null;

  let size: CanvasSize = computeSize();
  applySize(size);

  // Guarded for the same reason as the frame call: an effect is third-party
  // code from the host's point of view, and it must not be able to crash mount.
  try {
    effect.setup(ctx, size);
  } catch {
    // The effect is broken. The host stays alive and the canvas stays blank.
  }

  // --- resize -------------------------------------------------------------

  function computeSize(): CanvasSize {
    const cssWidth = target.clientWidth;
    const cssHeight = target.clientHeight;
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(rawDpr, maxDpr);
    return { width: cssWidth, height: cssHeight, dpr };
  }

  function applySize(next: CanvasSize): void {
    canvas.width = Math.round(next.width * next.dpr);
    canvas.height = Math.round(next.height * next.dpr);
    canvas.style.width = `${next.width}px`;
    canvas.style.height = `${next.height}px`;
    ctx.setTransform(next.dpr, 0, 0, next.dpr, 0, 0);
  }

  function handleResize(): void {
    if (destroyed) return;
    size = computeSize();
    applySize(size);
    if (reducedMotion) {
      drawStaticFrame();
    }
  }

  const resizeObserver = new ResizeObserver(() => handleResize());
  resizeObserver.observe(target);

  // --- offscreen pause ------------------------------------------------------

  let intersectionObserver: IntersectionObserver | null = null;
  if (autoPauseOffscreen) {
    intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) {
        onscreen = entry.isIntersecting;
      }
      evaluate();
    });
    intersectionObserver.observe(target);
  }

  // --- reduced motion ---------------------------------------------------

  let mediaQueryList: MediaQueryList | null = null;
  let onMediaQueryChange: ((event: MediaQueryListEvent) => void) | null = null;
  if (respectReducedMotion) {
    mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQueryList.matches;
    onMediaQueryChange = (event: MediaQueryListEvent) => {
      applyReducedMotion(event.matches);
    };
    mediaQueryList.addEventListener('change', onMediaQueryChange);
  }

  function applyReducedMotion(next: boolean): void {
    if (destroyed) return;
    reducedMotion = next;
    if (reducedMotion) {
      stopLoop();
      drawStaticFrame();
    } else {
      evaluate();
    }
  }

  // --- document visibility -------------------------------------------------

  function onVisibilityChange(): void {
    documentVisible = document.visibilityState !== 'hidden';
    evaluate();
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // --- context loss ----------------------------------------------------------

  function onContextLost(event: Event): void {
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    contextLost = true;
    stopLoop();
    drawStaticFrame();
  }
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('contextlost', onContextLost);

  // --- render loop -------------------------------------------------------

  function shouldRun(): boolean {
    return !destroyed && active && onscreen && documentVisible && !reducedMotion && !contextLost;
  }

  function drawStaticFrame(): void {
    try {
      effect.staticFrame(ctx, size);
    } catch {
      // A rendering effect must never be able to crash the host.
    }
  }

  function startLoop(): void {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function tick(timestamp: number): void {
    rafId = null;
    if (loopStart === null) {
      loopStart = timestamp;
    }
    const elapsed = timestamp - loopStart;
    try {
      effect.frame(ctx, size, elapsed);
    } catch {
      // Never let a bad frame kill the host loop's bookkeeping.
    }
    if (shouldRun()) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function evaluate(): void {
    if (destroyed) return;
    if (shouldRun()) {
      startLoop();
    } else {
      stopLoop();
    }
  }

  // Kick off initial state: either a single static frame, or the loop.
  if (reducedMotion) {
    drawStaticFrame();
  } else {
    evaluate();
  }

  // --- public handle -------------------------------------------------------

  return {
    resize(): void {
      if (destroyed) return;
      handleResize();
    },
    setActive(nextActive: boolean): void {
      if (destroyed) return;
      active = nextActive;
      evaluate();
    },
    setReducedMotion(reduced: boolean): void {
      if (destroyed) return;
      applyReducedMotion(reduced);
    },
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      if (mediaQueryList && onMediaQueryChange) {
        mediaQueryList.removeEventListener('change', onMediaQueryChange);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('contextlost', onContextLost);
      // The effect gets a chance to clean up, but it does not get to stop the
      // host from finishing. A throwing teardown used to escape destroy() and
      // leave the canvas orphaned in the DOM.
      try {
        effect.teardown?.();
      } catch {
        // Nothing to do. The host teardown below still runs.
      }
      canvas.remove();
    },
  };
}
