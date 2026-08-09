import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { searchSite, siteIndex } from "../../content/siteIndex";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/cn";

/**
 * ⌘K command palette (§4.3).
 *
 * Route search over the derived site index — the same data and the same
 * matcher the 404 page uses, so the two can never disagree about what exists.
 *
 * This one IS a combobox, where the 404 search deliberately is not. The
 * difference is the layout: there, results sit permanently below the field in
 * page flow and the only interaction is clicking a link. Here they are a
 * transient popup that has to be operable with the arrow keys while focus
 * stays in the input, which is exactly the problem the combobox pattern and
 * aria-activedescendant exist to solve. Focus never leaves the input; the
 * "selected" row is communicated to assistive tech by id.
 *
 * Discoverability: a shortcut nobody can see is a shortcut nobody uses, so the
 * navbar carries a real button that opens the same dialog and displays the
 * binding. The button is the primary control; the key is the accelerator.
 */

/** Ten most likely destinations, shown before anything is typed. */
const DEFAULT_ORDER = [
  "/",
  "/services",
  "/work",
  "/pricing",
  "/process",
  "/about",
  "/insights",
  "/contact",
];

const defaultResults = DEFAULT_ORDER.map((path) =>
  siteIndex.find((e) => e.path === path),
).filter(Boolean);

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const reduceMotion = usePrefersReducedMotion();
  const id = useId();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim();
    // searchSite requires two characters and returns [] below that, which is
    // right for a page-level search but wrong here — a palette that empties
    // itself after one keystroke reads as broken. Fall back to the defaults.
    if (q.length < 2) return defaultResults;
    return searchSite(q, 8);
  }, [query]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Reset on every open rather than on close: resetting on close would be
  // visible as the list re-populating during the exit animation.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    restoreRef.current = document.activeElement;
    // The input mounts with the panel, so focus on the next frame.
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Return focus to whatever opened it. Runs on close, not on unmount, because
  // the panel stays mounted through the exit animation.
  useEffect(() => {
    if (open) return;
    const el = restoreRef.current;
    if (el && document.contains(el)) el.focus?.();
  }, [open]);

  // Escape closes, bound at the document.
  //
  // The panel has an onKeyDown handler too, but React delivers events by
  // bubbling from the target — so a keypress only reaches it while focus is
  // genuinely inside the panel. That is not guaranteed: focus moves in on a
  // rAF after mount, and if anything lands focus on <body> instead, Escape hits
  // nothing and the dialog cannot be dismissed from the keyboard at all.
  // Reproduced in WebKit, where the cross-browser suite caught it. MobileMenu
  // already binds Escape this way for the same reason.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Lock body scroll, compensating for the scrollbar so the page behind does
  // not shift horizontally when it disappears. Same treatment as MobileMenu.
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

  // Clamp the active row whenever the result set shrinks under it.
  useEffect(() => {
    setActive((i) => (i > results.length - 1 ? Math.max(results.length - 1, 0) : i));
  }, [results.length]);

  // Keep the active row in view when arrowing past the scroll edge.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(`${id}-opt-${active}`)}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);

  const go = useCallback(
    (entry) => {
      if (!entry) return;
      close();
      navigate(entry.path);
    },
    [close, navigate],
  );

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    // Contain Tab. There are only three stops (input, close button, and the
    // dialog itself is the boundary), but without this Tab walks into the page
    // behind the overlay, which is unreachable by pointer and invisible.
    if (e.key === "Tab") {
      const focusables = panelRef.current?.querySelectorAll(
        'input, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      return;
    }

    if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + results.length) % results.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(results.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        go(results[active]);
        break;
      default:
        break;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center px-(--spacing-gutter) pt-[12vh]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
        >
          {/* Backdrop. A sibling rather than a parent so a click on a result
              cannot be swallowed by the dismiss handler. aria-hidden because
              the dialog below already blocks the rest of the page. */}
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-sunken/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            onKeyDown={onKeyDown}
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-(--radius-card) border border-line-strong bg-raised shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
              <label htmlFor={`${id}-input`} className="sr-only">
                Search pages, services, case studies and articles
              </label>
              <input
                ref={inputRef}
                id={`${id}-input`}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-list`}
                aria-activedescendant={
                  results.length ? `${id}-opt-${active}` : undefined
                }
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck="false"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search pages, services, case studies…"
                className="w-full bg-transparent py-4 text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-(--radius-pill) border border-line px-2.5 py-1 font-mono text-[11px] text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              >
                Esc
              </button>
            </div>

            {/* The count is announced, not the rows — reading eight titles on
                every keystroke is unusable. aria-activedescendant handles the
                per-row announcement as the user arrows through them. */}
            <p aria-live="polite" aria-atomic="true" className="sr-only">
              {query.trim().length >= 2
                ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                : ""}
            </p>

            {results.length > 0 ? (
              <ul
                ref={listRef}
                id={`${id}-list`}
                role="listbox"
                aria-label="Results"
                className="max-h-[min(60vh,26rem)] overflow-y-auto p-2"
              >
                {/*
                  role="option" sits on the <li> itself, with no wrapper.
                  A listbox may only contain options, so an intermediate
                  element breaks the structure in both directions — axe
                  reported aria-required-children on the list, aria-required-
                  parent on every row, and `listitem` on the <li>s, which is
                  three symptoms of one mistake.

                  Rows are options rather than links on purpose: an <a> inside
                  a listbox carries two conflicting roles, and it is the option
                  role that makes aria-activedescendant work. Every destination
                  here is also in the nav and the footer, so no navigation
                  depends on this being a link.
                */}
                {results.map((entry, i) => (
                  <li
                    key={entry.path}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onClick={() => go(entry)}
                    onMouseMove={() => setActive(i)}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 transition-colors",
                      i === active ? "bg-surface-hover" : "hover:bg-surface",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">
                        {entry.title}
                      </span>
                      <span className="block truncate font-mono text-xs text-ink-muted">
                        {entry.kind} · {entry.path}
                      </span>
                    </span>
                    {i === active ? (
                      <CornerDownLeft
                        aria-hidden="true"
                        className="size-4 shrink-0 text-accent"
                      />
                    ) : (
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-ink-muted"
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-ink-muted">
                Nothing matched “{query.trim()}”. Try a service, a client name or
                a topic.
              </p>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-2.5 font-mono text-[11px] text-ink-muted">
              <span>
                {query.trim().length >= 2 ? "Results" : "Jump to"} ·{" "}
                {results.length}
              </span>
              <span className="hidden sm:inline">↑↓ navigate · ⏎ open · esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
