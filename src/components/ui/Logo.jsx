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
      {/*
        The monogram is drawn with CSS generated content rather than being a
        text node, because it is a graphic that happens to be made of letters.

        This is not cosmetic. WCAG 2.5.3 (Label in Name) requires a control's
        accessible name to contain its visible label, and axe computes "visible
        label" from rendered text nodes — including aria-hidden ones, since a
        speech-input user can still see them. With "SL" as a text node the
        logo link's visible label came out as "SLSimpleLogicX", which the name
        "SimpleLogicX — home" does not contain, so both logo links failed on
        every route. Generated content is not in the DOM tree, so the visible
        label is now the wordmark alone — which is what a user would actually
        say out loud.
      */}
      <span
        aria-hidden="true"
        className="grad-primary grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white shadow-sm before:content-['SL']"
      />
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Simple<span className="text-accent">LogicX</span>
        </span>
      )}
    </span>
  );
}
