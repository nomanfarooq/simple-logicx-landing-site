import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import { cn } from "../../lib/cn";

/**
 * Full-screen mobile navigation (§4.3).
 *
 * This one IS a dialog, so unlike the mega-menu it does trap focus: while it
 * is open nothing behind it is reachable by keyboard or screen reader
 * (aria-modal + inert-by-overlay). It also locks body scroll, restores focus
 * to the trigger on close, and closes on Escape.
 */
export default function MobileMenu({ open, onClose, nav, triggerRef }) {
  const panelRef = useRef(null);
  const [expanded, setExpanded] = useState(null);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll, compensating for the scrollbar so the page behind does
  // not shift horizontally when it disappears.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open]);

  // Move focus in on open, and back to the trigger on close.
  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    } else {
      triggerRef?.current?.focus?.();
    }
    // triggerRef is a stable ref object; focusing it is the intent on close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Contain Tab within the panel.
  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          ref={panelRef}
          onKeyDown={onKeyDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-base lg:hidden"
        >
          <div className="flex items-center justify-between border-b border-line px-(--spacing-gutter) py-4">
            <Link to="/" onClick={onClose}>
              <Logo />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="grid size-10 place-items-center rounded-(--radius-pill) border border-line text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-(--spacing-gutter) py-6">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  {item.mega ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={expanded === item.href}
                        onClick={() =>
                          setExpanded((v) => (v === item.href ? null : item.href))
                        }
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-display text-xl font-semibold text-ink transition-colors hover:bg-surface"
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 transition-transform",
                            expanded === item.href && "rotate-180",
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === item.href && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden ps-3"
                          >
                            {item.mega.map((entry) => (
                              <li key={entry.href}>
                                <Link
                                  to={entry.href}
                                  onClick={onClose}
                                  className="block rounded-lg px-3 py-2.5 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                                >
                                  {entry.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="block rounded-xl px-3 py-3 font-display text-xl font-semibold text-ink transition-colors hover:bg-surface"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-line px-(--spacing-gutter) py-5">
            <Button to="/contact" size="lg" className="w-full" onClick={onClose}>
              Start a project
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
