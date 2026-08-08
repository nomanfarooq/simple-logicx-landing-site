import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { gsap } from "../../lib/gsap";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Count-up number.
 *
 * Parses its own display string, so callers pass "150+", "98%", "40×" or
 * "£12k" and get the prefix/suffix preserved automatically. v1 required the
 * value and suffix to be passed as separate props and then hardcoded "0" as
 * the initial text, which meant a user with JS disabled or a failed trigger
 * saw a literal 0 — worse than showing nothing.
 *
 * The real value is always in the DOM as text: the element renders the final
 * string and animation only overwrites it once it is safe to do so. Under
 * reduced motion, or if the trigger never fires, the correct number is what
 * was there all along.
 */
export default function Counter({
  value,
  duration = 1.8,
  className,
  as: Tag = "span",
  ...props
}) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [done, setDone] = useState(false);

  // Split "£12k" -> prefix "£", number 12, suffix "k"
  const match = String(value).match(/^([^\d-]*)(-?[\d.,]+)(.*)$/);

  useEffect(() => {
    if (reduceMotion || done || !inView || !match || !ref.current) return;

    const [, prefix, rawNum, suffix] = match;
    const target = parseFloat(rawNum.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const decimals = (rawNum.split(".")[1] ?? "").length;
    const useGrouping = rawNum.includes(",");
    const el = ref.current;
    const obj = { n: 0 };

    const tween = gsap.to(obj, {
      n: target,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        const shown = obj.n.toLocaleString("en-GB", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          useGrouping,
        });
        el.textContent = `${prefix}${shown}${suffix}`;
      },
      onComplete: () => {
        // Restore the exact authored string — never a rounding artefact.
        el.textContent = String(value);
        setDone(true);
      },
    });

    return () => tween.kill();
  }, [inView, reduceMotion, done, match, value, duration]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {value}
    </Tag>
  );
}
