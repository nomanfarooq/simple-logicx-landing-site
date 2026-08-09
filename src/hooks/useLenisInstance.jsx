import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Lenis smooth scroll, as a singleton provider (§5.2).
 *
 * Three things here that v1 got wrong (§0.3):
 *
 *   1. `lenis/dist/lenis.css` is imported. It is required in Lenis 1.x — it
 *      sets `html.lenis, html.lenis body { height: auto }` and the
 *      data-lenis-prevent escape hatches. v1 imported the JS only.
 *
 *   2. Lenis and ScrollTrigger share ONE clock. v1 ran Lenis on its own
 *      requestAnimationFrame loop while ScrollTrigger listened to native
 *      scroll events, so the two drifted and every scroll-triggered animation
 *      fired at the wrong position. Here Lenis reports scroll to ScrollTrigger
 *      and GSAP's ticker drives Lenis's rAF.
 *
 *   3. The instance is exposed through context and state, not a ref. v1's hook
 *      returned `ref.current`, which is null on first render and never
 *      triggers a re-render, so consumers could never actually get it.
 */

const LenisContext = createContext(null);

export function LenisProvider({ children }) {
  const [lenis, setLenis] = useState(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Honour the OS setting by not running Lenis at all. Smoothing is the one
    // thing that cannot be made "reduced" — it either interpolates scroll or
    // it does not — so the correct reduced-motion behaviour is native scroll.
    if (reduceMotion) {
      setLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      // Touch devices already have momentum scrolling in the compositor.
      // Intercepting it costs responsiveness and gains nothing.
      syncTouch: false,
    });

    // --- the wiring ---
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time) => instance.raf(time * 1000); // GSAP ticker is seconds
    gsap.ticker.add(tick);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduceMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/**
 * The live Lenis instance, or null when reduced motion is on / before mount.
 * Always null-check: callers must work without it.
 */
export function useLenisInstance() {
  return useContext(LenisContext);
}

/**
 * Scroll helper that works with or without Lenis.
 *
 * Every in-page scroll must go through this. Calling window.scrollTo while
 * Lenis is running fights it — Lenis holds its own target position and
 * animates back to where it was. v1 called window.scrollTo from every anchor
 * handler, which is why smooth scrolling never actually applied to nav links.
 */
export function useScrollTo() {
  const lenis = useLenisInstance();

  return useCallback(
    (target, { offset = -80, immediate = false } = {}) => {
      // Resolve an element target to an absolute document position OURSELVES
      // rather than handing the element to Lenis.
      //
      // Lenis resolves an element by walking offsetTop up the offsetParent
      // chain. That chain is only stable while nothing between the element and
      // the document is transformed — and on this site things frequently are:
      // `Reveal` applies a transform for the duration of its entry animation,
      // and a transformed element becomes the offsetParent of everything
      // inside it. Click a contents link while any ancestor reveal is still
      // in flight and offsetTop is suddenly measured from that ancestor
      // instead of the page, so the scroll lands hundreds of pixels away.
      //
      // Measured on /insights/evaluating-rag-honestly, same link, same start
      // position: the heading settled 668px above the viewport top one way and
      // 192px below it the other, against an intended 80px. It looked like
      // "smooth scroll is a bit off" rather than a bug, which is how it
      // survived to step 10 — verify-insights only asserted that the page
      // moved at all.
      //
      // getBoundingClientRect is transform-aware and viewport-relative, so
      // adding scrollY gives the true document position regardless of what is
      // mid-animation. It also means both branches below compute the target
      // identically instead of relying on two different resolvers agreeing.
      const el =
        typeof target === "string" ? document.querySelector(target) : target;

      let top;
      if (typeof target === "number") {
        top = target;
      } else if (el) {
        top = el.getBoundingClientRect().top + window.scrollY + offset;
      } else {
        return;
      }

      if (lenis) {
        lenis.scrollTo(top, { immediate });
        return;
      }
      // Reduced motion, or Lenis not mounted yet.
      window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
    },
    [lenis],
  );
}
