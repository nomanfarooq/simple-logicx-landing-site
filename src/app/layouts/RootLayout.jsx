import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ScrollProgress from "../../components/layout/ScrollProgress";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import { useScrollTo } from "../../hooks/useLenisInstance";
import { ScrollTrigger } from "../../lib/gsap";

/**
 * Application shell (§4.2, §4.3).
 *
 * Owns the three things that are easy to get wrong across a route change:
 * scroll position, focus, and the transition between pages.
 */

function RouteFallback() {
  // Deliberately minimal and non-animated. A spinner that appears for 80ms on
  // a fast connection is worse than nothing; this just reserves height so the
  // footer does not jump up during a lazy chunk fetch.
  return <div className="min-h-[60vh]" aria-hidden="true" />;
}

export default function RootLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  const reduceMotion = usePrefersReducedMotion();
  const scrollTo = useScrollTo();
  const mainRef = useRef(null);
  // Each effect owns its own mount flag. Sharing one ref is a trap: effects run
  // in declaration order, so whichever ran first would clear the flag and the
  // second would wrongly believe it was a navigation.
  const scrollMounted = useRef(false);
  const focusMounted = useRef(false);
  const announceMounted = useRef(false);
  const focusSentinel = useRef(null);
  const [announcement, setAnnouncement] = useState("");

  // Scroll to top on navigation, and re-measure scroll triggers.
  //
  // Routed through useScrollTo rather than window.scrollTo: Lenis holds its own
  // target position, so calling the native API behind its back makes it animate
  // straight back to where it was. That mismatch was a v1 bug (§0.3).
  //
  // ScrollTrigger.refresh() matters just as much. Every route has a different
  // document height, and triggers cache their start/end pixel offsets on
  // creation — without a refresh after the new page commits, every scroll
  // animation on the incoming route fires at the previous page's positions.
  useEffect(() => {
    if (!scrollMounted.current) {
      scrollMounted.current = true;
      return;
    }
    scrollTo(0, { immediate: true });

    // Two frames: one for React to commit the new route, one for layout to
    // settle (fonts, images, fluid clamps) before measuring.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [location.pathname, scrollTo]);

  // Move focus to the page heading on navigation, so screen-reader and
  // keyboard users land at the top of the new page rather than wherever focus
  // happened to be. Without this an SPA route change is silent to assistive
  // tech.
  //
  // Route focus + announcement.
  //
  // Focus deliberately goes to a STABLE sentinel rather than the page <h1>.
  // Focusing the heading was tried and measured, and it does not hold: the
  // heading gets focus correctly, then loses it a few hundred ms later when
  // the page subtree is torn down and re-inserted. Three things overlap to
  // cause that — the lazy chunk resolving out of Suspense, AnimatePresence
  // swapping the keyed page wrapper, and React 19 hoisting the <Seo> metadata
  // — and any element inside that subtree is liable to be replaced after we
  // focus it, dropping focus to <body>.
  //
  // The sentinel lives inside <main> but outside AnimatePresence, so it is
  // never unmounted and focus sticks. Paired with the live region below, this
  // is the same pattern Next.js and Gatsby use: move focus to the top of the
  // new page, and announce which page it is.
  useEffect(() => {
    if (!focusMounted.current) {
      focusMounted.current = true;
      return;
    }
    focusSentinel.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  // Announce the new page. document.title is read a frame late so React 19 has
  // committed the route's <Seo> title before we copy it.
  useEffect(() => {
    if (!announceMounted.current) {
      announceMounted.current = true;
      return;
    }
    const id = setTimeout(() => setAnnouncement(document.title), 350);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <div aria-hidden="true" className="noise-overlay" />
      <ScrollProgress />

      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[200] focus-visible:rounded-(--radius-pill) focus-visible:bg-accent focus-visible:px-5 focus-visible:py-3 focus-visible:text-accent-ink"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" ref={mainRef} className="flex-1">
        {/* Stable focus target for route changes. Outside AnimatePresence so
            it is never unmounted — see the focus effect above. */}
        <div
          ref={focusSentinel}
          tabIndex={-1}
          id="route-focus"
          className="sr-only outline-none"
        />

        {/* Route announcement for screen readers. */}
        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </p>

        {/* aria-busy announces that a lazy route chunk is still loading. */}
        <div aria-busy={navigation.state === "loading"}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{
                duration: reduceMotion ? 0 : 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
