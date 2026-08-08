import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Scroll-triggered entrance. The workhorse reveal used across the site.
 *
 * SAFETY CONTRACT (§5.4): this component must never leave content invisible.
 * An animation that fails is a cosmetic bug; content that never appears is a
 * broken page. Three independent guarantees:
 *
 *   1. Reduced motion  -> renders with no animation at all, fully visible.
 *   2. Trigger fires   -> normal animated reveal.
 *   3. Nothing fires   -> a 1.2s failsafe timer forces the visible state, so a
 *                         missed IntersectionObserver (element already past the
 *                         viewport, a display:none ancestor at mount, a resize
 *                         race) cannot strand content at opacity 0.
 *
 * `once: true` — reveals never replay on scroll-back (§5.1).
 */

const DIRECTIONS = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
};

export default function Reveal({
  children,
  as: Tag = "div",
  direction = "up",
  delay = 0,
  duration = 0.6,
  amount = 0.2,
  disabled = false,
  className,
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, amount });
  const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setFailsafe(true), 1200);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  const MotionTag = motion[Tag] ?? motion.div;

  // `disabled` renders content immediately, with no hidden initial state.
  //
  // Needed wherever a list re-renders in response to a user action rather than
  // to scrolling — a filter, a sort, a tab. Re-running an entrance animation
  // there means the results the user just asked for start invisible, and if
  // they sit below the fold the scroll trigger never fires, so the 1200ms
  // failsafe becomes the primary path. Measured on /work before this existed:
  // the list stayed blank for a full 1.2s after every filter click.
  //
  // Reduced motion: no animation, no initial hidden state, nothing to go wrong.
  if (reduceMotion || disabled) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  const offset = DIRECTIONS[direction] ?? DIRECTIONS.up;
  const show = inView || failsafe;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={show ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{
        duration,
        delay: failsafe && !inView ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered children. Each child animates in sequence.
 *
 * Implemented with variants rather than per-child delays so the stagger is
 * owned in one place and children stay plain markup.
 */
export function RevealGroup({
  children,
  as: Tag = "div",
  stagger = 0.08,
  amount = 0.15,
  className,
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, amount });
  const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setFailsafe(true), 1400);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView || failsafe ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

/** A child of RevealGroup. Inherits the parent's stagger timing. */
export function RevealItem({ children, as: Tag = "div", className, ...props }) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[Tag] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
