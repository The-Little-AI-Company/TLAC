/**
 * Shared canvas module — public type contract.
 *
 * An effect is a pure renderer: it never touches an observer, a listener, or an
 * animation frame. All lifecycle concerns (resize, visibility, reduced motion,
 * context loss, teardown) belong to `mount()` in `./mount`, not to the effect.
 */

export interface CanvasSize {
  /** CSS pixel width of the canvas element. */
  width: number;
  /** CSS pixel height of the canvas element. */
  height: number;
  /** Device pixel ratio actually applied to the backing store (already clamped to `maxDpr`). */
  dpr: number;
}

/** An effect never touches an observer, a listener, or an animation frame. */
export interface CanvasEffect {
  /** Called once after the context exists, and again after a context restore. */
  setup(ctx: CanvasRenderingContext2D, size: CanvasSize): void;
  /** One animated frame. elapsed = ms since the loop started. */
  frame(ctx: CanvasRenderingContext2D, size: CanvasSize, elapsed: number): void;
  /** A single meaningful still image. REQUIRED. */
  staticFrame(ctx: CanvasRenderingContext2D, size: CanvasSize): void;
  teardown?(): void;
}

export interface CanvasHandle {
  resize(): void;
  setActive(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  destroy(): void;
}

export interface MountOptions {
  /** Clamp for device pixel ratio applied to the backing store. Default 2. */
  maxDpr?: number;
  /** Pause the render loop when the target scrolls offscreen. Default true. */
  autoPauseOffscreen?: boolean;
  /** Honor `prefers-reduced-motion` and fall back to a single static frame. Default true. */
  respectReducedMotion?: boolean;
}
