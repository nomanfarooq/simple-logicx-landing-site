import { motion, useScroll, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Reading-progress bar under the navbar.
 *
 * useScroll reads the native scroll position, which stays correct under Lenis
 * because Lenis drives real document scroll rather than transforming a wrapper.
 * (This is also why `position: sticky` still works throughout the site.)
 *
 * Hidden from assistive tech: it is a redundant visual affordance, and a
 * progress bar that announces itself on every scroll tick is actively hostile.
 */
export default function ScrollProgress() {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 34,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="grad-primary fixed inset-x-0 top-0 z-[60] h-0.5 origin-left"
      style={{ scaleX: reduceMotion ? scrollYProgress : scaleX }}
    />
  );
}
