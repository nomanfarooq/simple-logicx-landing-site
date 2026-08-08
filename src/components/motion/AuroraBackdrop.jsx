import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Floating aurora orbs — the decorative wash behind sections.
 *
 * Always rendered inside a Section's clipped `decoration` slot, never loose in
 * the document: these are far wider than their container by design, and an
 * unclipped orb is exactly what pushes the document past the viewport and
 * breaks centring (§3.3).
 *
 * Performance budget (§5.1): at most three animating blur orbs in view at
 * once. Each one is a large blurred layer, and they are the single most
 * expensive thing on the page to composite. `count` is capped for that reason.
 *
 * Colour comes only from grad-primary / grad-primary-wide — never a cyan→lime
 * ramp, which is what made v1's backgrounds read green (§0.1).
 */

const PRESETS = [
  { className: "grad-primary-wide -left-40 top-0 h-[600px] w-[600px]", drift: { x: 40, y: -30 }, duration: 18 },
  { className: "grad-primary -right-32 top-1/3 h-[500px] w-[500px]", drift: { x: -35, y: 30 }, duration: 22 },
  { className: "grad-primary-wide left-1/3 bottom-0 h-[520px] w-[700px]", drift: { x: 25, y: 20 }, duration: 26 },
];

export default function AuroraBackdrop({ count = 2, className }) {
  const reduceMotion = usePrefersReducedMotion();
  const orbs = PRESETS.slice(0, Math.max(0, Math.min(count, PRESETS.length)));

  return (
    <div aria-hidden="true" className={cn("absolute inset-0", className)}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full opacity-(--orb-opacity) blur-[150px]",
            orb.className,
          )}
          // Under reduced motion the orbs still render — they are static
          // colour, not motion — they simply stop drifting.
          animate={
            reduceMotion
              ? undefined
              : { x: [0, orb.drift.x, 0], y: [0, orb.drift.y, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: orb.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}
