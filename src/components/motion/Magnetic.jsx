import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery, usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Magnetic hover — the element leans toward the cursor.
 *
 * Gated on `(hover: hover) and (pointer: fine)`. On a touch device there is no
 * cursor to lean toward, and binding pointer handlers there costs work for an
 * effect nobody can see. This is why the check is a media query rather than a
 * viewport width: a small window on a desktop still has a mouse.
 *
 * Spring-smoothed so the element eases back rather than snapping on exit.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  radius = 90,
  className,
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

  if (reduceMotion || !canHover) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // Clamp so a fast pointer near the edge cannot fling it far off-centre.
    x.set(Math.max(-radius, Math.min(radius, dx)) * strength);
    y.set(Math.max(-radius, Math.min(radius, dy)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
