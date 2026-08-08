import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Scroll-linked parallax. GSAP rather than Framer, because this is scrubbed
 * against scroll position rather than played on entry (§5, library split).
 *
 * useGSAP scopes the animation to this element and reverts it — including its
 * ScrollTriggers — on unmount. That cleanup is not optional in a routed app:
 * without it every navigation leaks triggers that keep measuring detached
 * nodes, and they accumulate until scroll performance visibly degrades. v1
 * created ScrollTriggers in a central effect and never reverted them (§0.3).
 *
 * Only `y` is animated (a transform), never `top` — see §5.1.
 */
export default function ParallaxLayer({
  children,
  speed = 0.2,
  className,
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;
      const el = ref.current;
      if (!el) return;

      const distance = () => window.innerHeight * speed;

      gsap.fromTo(
        el,
        { y: () => -distance() },
        {
          y: () => distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            // Recompute on resize so the distance tracks viewport height
            // instead of being frozen at first paint.
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [speed, reduceMotion] },
  );

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
}
