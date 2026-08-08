import { useEffect, useState } from "react";

/**
 * Subscribe to a media query.
 *
 * Initialised from a function so the first render already has the correct
 * value — reading it in an effect would cause a desktop user to briefly render
 * the mobile tree (and vice versa), which is visible as a layout flash.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when the user has asked the OS to minimise motion (§5.4). */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
