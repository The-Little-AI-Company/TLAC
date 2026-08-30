/**
 * Scroll reveal.
 *
 * Three rules, in order of importance:
 *
 *   1. Never hide content unless this script is definitely running. The
 *      `js-reveal` class goes on <html> first, and the CSS scopes the hidden
 *      state to it. A failed bundle leaves a readable page instead of a blank
 *      one.
 *
 *   2. Do nothing at all under reduced motion. Not a shorter animation, not a
 *      fade. The reader asked for stillness.
 *
 *   3. Reveal once, then stop observing. An element that re-hides on scroll-up
 *      is a distraction, and an observer that never disconnects is a leak.
 */
export function initReveal(root: ParentNode = document): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (reduced || targets.length === 0 || !('IntersectionObserver' in window)) {
    return () => {};
  }

  document.documentElement.classList.add('js-reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  for (const target of targets) observer.observe(target);

  return () => {
    observer.disconnect();
    document.documentElement.classList.remove('js-reveal');
  };
}
