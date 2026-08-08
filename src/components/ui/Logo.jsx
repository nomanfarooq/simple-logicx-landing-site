import { cn } from "../../lib/cn";

/**
 * Logo mark + wordmark.
 *
 * The mark uses grad-primary (deep blue -> cyan). In v1 this was
 * `from-cyan to-lime` — a green ramp on the single most brand-defining element
 * on the site, which is a large part of why the whole thing read green (§0.1).
 */
export default function Logo({ className, showWordmark = true }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grad-primary grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white shadow-sm"
      >
        SL
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Simple<span className="text-accent">LogicX</span>
        </span>
      )}
    </span>
  );
}
