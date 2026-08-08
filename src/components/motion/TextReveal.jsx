import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Word-by-word text reveal.
 *
 * Accessibility note, and the reason this is not just a .split(" ").map():
 * splitting text into per-word elements destroys it for screen readers, which
 * may announce each fragment separately or lose the sentence entirely. So the
 * real text is rendered once in a visually-hidden node for assistive tech, and
 * the animated word spans are marked aria-hidden. What is read and what is
 * seen stay in sync, and the animation costs nothing semantically.
 *
 * Falls back to plain text under reduced motion — no splitting at all.
 */
export default function TextReveal({
  text,
  as: Tag = "span",
  delay = 0,
  stagger = 0.045,
  className,
  wordClassName,
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [failsafe, setFailsafe] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setFailsafe(true), 1200);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <Tag className={className} {...props}>
        {text}
      </Tag>
    );
  }

  const words = text.split(" ");
  const show = inView || failsafe;

  return (
    <Tag ref={ref} className={className} {...props}>
      {/* What screen readers actually read. */}
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {words.map((word, i) => (
          // The outer span clips; the inner one slides up through it.
          <span
            key={`${word}-${i}`}
            className="inline-block overflow-hidden align-bottom"
          >
            <motion.span
              className={`inline-block ${wordClassName ?? ""}`}
              initial={{ y: "110%" }}
              animate={show ? { y: 0 } : undefined}
              transition={{
                duration: 0.7,
                delay: delay + i * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </Tag>
  );
}
