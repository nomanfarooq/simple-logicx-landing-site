import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Accordion.
 *
 * Built on native <button> + aria-expanded + aria-controls rather than a
 * details/summary pair: <details> cannot be height-animated reliably across
 * browsers, and overriding its default toggle behaviour to do so tends to
 * break keyboard support in the process.
 *
 * The panel stays in the DOM only while open. That is deliberate — collapsed
 * answers should not be reachable by Tab, and `hidden`-but-present content is
 * a common source of phantom focus stops.
 *
 * `allowMultiple={false}` gives single-open behaviour; the previously open
 * item closes. Either way the control is a plain toggle, never a radio.
 */
export default function Accordion({ items, allowMultiple = false, className }) {
  const [open, setOpen] = useState(() => new Set());
  const baseId = useId();
  const reduceMotion = usePrefersReducedMotion();

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div key={item.q}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-accent"
              >
                <span className="font-display text-lg font-semibold text-ink">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-line text-accent transition-transform duration-300",
                    isOpen && "rotate-45",
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-12 text-ink-soft">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
