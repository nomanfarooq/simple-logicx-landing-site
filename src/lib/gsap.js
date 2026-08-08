import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Single GSAP registration point (§5).
 *
 * Plugins are registered here and nowhere else. Registering in each component
 * that happens to need ScrollTrigger works, but makes it impossible to tell at
 * a glance what the animation surface of the app actually is — and it is how
 * you end up with two modules disagreeing about configuration.
 *
 * ---------------------------------------------------------------------------
 * Which library for which job
 *
 *   Framer Motion  — enter animations, hover/tap, layout, page transitions.
 *                    Declarative, and MotionConfig reducedMotion="user" already
 *                    disables all of it globally (see app/providers.jsx).
 *
 *   GSAP + ScrollTrigger — anything genuinely scroll-LINKED: scrubbed parallax,
 *                    pinning, sticky storytelling, scroll progress.
 *
 * Do not use both for the same effect. v1 drove simple fade-ins through a
 * central GSAP useEffect that queried hardcoded DOM ids from App.jsx, which
 * broke the moment anything was lazy-loaded or reordered (§0.3).
 * ---------------------------------------------------------------------------
 */

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Never let GSAP swallow the first frame after a long task. lagSmoothing is
// designed for a rAF loop GSAP owns; with Lenis driving the ticker it causes
// the scroll position and the animation clock to disagree after any jank.
gsap.ticker.lagSmoothing(0);

// Dev-only handle so the motion test harness can assert that ScrollTriggers
// are actually reverted across route changes. Stripped from production builds.
if (import.meta.env.DEV && typeof window !== "undefined") {
  window.__SLX = { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger, useGSAP };
