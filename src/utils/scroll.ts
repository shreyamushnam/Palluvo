/**
 * Returns whether the user has requested reduced motion via system preferences.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Returns the appropriate scroll behavior respecting user motion preferences.
 * Returns 'auto' if reduced motion is requested, and 'smooth' otherwise.
 */
export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

/**
 * Scrolls to the top of the window, respecting the user's prefers-reduced-motion preference.
 * Uses 'auto' (instant) scrolling if reduced motion is requested, and 'smooth' scrolling otherwise.
 */
export function scrollToTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo({
    top: 0,
    behavior: getScrollBehavior(),
  });
}

/**
 * Scrolls an element into view, respecting the user's prefers-reduced-motion preference.
 * Defaults to 'smooth' scrolling unless prefers-reduced-motion: reduce is active or 'auto' is specified.
 */
export function scrollIntoView(
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions
): void {
  if (!element || typeof element.scrollIntoView !== "function") return;
  const isReduced = prefersReducedMotion();
  element.scrollIntoView({
    ...options,
    behavior: isReduced ? "auto" : (options?.behavior ?? "smooth"),
  });
}
