/**
 * Scrolls to the top of the window, respecting the user's prefers-reduced-motion preference.
 * Uses 'auto' (instant) scrolling if reduced motion is requested, and 'smooth' scrolling otherwise.
 */
export function scrollToTop(): void {
  if (typeof window === "undefined") return;
  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
