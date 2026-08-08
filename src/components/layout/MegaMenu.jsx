import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getIcon } from "../../lib/icons";
import { cn } from "../../lib/cn";

/**
 * Desktop mega-menu (§4.3).
 *
 * Interaction model:
 *   - pointer enter/leave opens and closes, with a close delay so a diagonal
 *     mouse path from the trigger to the panel does not dismiss it
 *   - keyboard focus on the trigger opens the panel, so Tab reaches the links
 *   - Escape closes and returns focus to the trigger
 *   - focus leaving the whole subtree closes it (Tab-out)
 *
 * The trigger is a Link to the section index, NOT a toggle button. It was a
 * <button> that toggled on click, which produced a genuinely confusing result
 * on pointer devices: hovering opened the panel, and the click that followed
 * immediately closed it again. Making the trigger navigate to /services means
 * hover and click never contradict each other, and it matches what a user
 * expects a top-level nav item to do. `aria-expanded` is valid on role=link.
 *
 * The panel is NOT a focus trap: it is a menu, not a dialog, and trapping
 * would prevent tabbing onward through the navbar.
 */
export default function MegaMenu({ item, isActive }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const closeTimer = useRef(null);
  // Set when the user dismisses with Escape. Without it, closing and then
  // restoring focus to the trigger immediately re-fires onFocus and reopens
  // the panel — so Escape appears to do nothing. Cleared once the pointer or
  // focus genuinely leaves the subtree.
  const dismissed = useRef(false);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => () => cancelClose(), []);

  // Escape closes and restores focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        dismissed.current = true;
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        if (!dismissed.current) setOpen(true);
      }}
      onMouseLeave={() => {
        // Pointer left: the dismissal has served its purpose, so a later
        // hover opens the panel again as normal.
        dismissed.current = false;
        scheduleClose();
      }}
      onFocus={() => {
        cancelClose();
        if (!dismissed.current) setOpen(true);
      }}
      onBlur={(e) => {
        // Only close when focus actually left the subtree.
        if (!e.currentTarget.contains(e.relatedTarget)) {
          dismissed.current = false;
          setOpen(false);
        }
      }}
    >
      <Link
        ref={triggerRef}
        to={item.href}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(false)}
        className={cn(
          "inline-flex items-center gap-1 rounded-(--radius-pill) px-3 py-2 text-sm font-medium transition-colors",
          isActive || open ? "text-ink" : "text-ink-soft hover:text-ink",
        )}
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute left-1/2 top-[calc(100%+0.5rem)] z-50 w-[min(56rem,calc(100vw-3rem))] -translate-x-1/2",
              "rounded-(--radius-card) border border-line bg-raised/95 p-3 shadow-2xl backdrop-blur-xl",
            )}
          >
            <div className="grid gap-1 sm:grid-cols-2">
              {item.mega.map((entry) => {
                const Icon = getIcon(entry.icon);
                return (
                  <Link
                    key={entry.href}
                    to={entry.href}
                    onClick={() => setOpen(false)}
                    className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-surface-hover"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface text-accent">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {entry.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-muted">
                        {entry.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 border-t border-line pt-2">
              <Link
                to={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-xl p-3 text-sm font-medium text-accent transition-colors hover:bg-surface-hover"
              >
                View all services
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
