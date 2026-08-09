import { Fragment } from "react";
import { cn } from "../../lib/cn";

/**
 * Renders an article body from structured blocks (see content/insights.js).
 *
 * Every block maps to markup this component owns, so an article cannot
 * introduce a heading level, a colour or a font the design system does not
 * have — and there is no `dangerouslySetInnerHTML` anywhere in the app.
 *
 * Headings render as `h2` with a generated id. Articles live under a
 * `PageHeader` that owns the page's only `h1`, so starting at `h2` keeps the
 * document outline correct without the content having to know about it (§6).
 */

/** Stable, deterministic anchor. Shared with the table of contents. */
export function headingId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Section headings, in order — what the table of contents is built from. */
export function headings(body) {
  return body
    .filter((b) => b.type === "h2")
    .map((b) => ({ text: b.text, id: headingId(b.text) }));
}

export default function ArticleBody({ body, className }) {
  return (
    <div className={cn("flex flex-col", className)}>
      {body.map((block, i) => (
        <Fragment key={i}>{renderBlock(block, i)}</Fragment>
      ))}
    </div>
  );
}

function renderBlock(block, i) {
  // The first block never needs top spacing; everything else is spaced by type
  // rather than by a uniform gap, because a heading after a paragraph needs
  // more room than a paragraph after a paragraph.
  const first = i === 0;

  switch (block.type) {
    case "h2":
      return (
        <h2
          id={headingId(block.text)}
          className={cn(
            "scroll-mt-28 font-display text-2xl font-semibold text-ink sm:text-3xl",
            first ? "" : "mt-14",
          )}
        >
          {block.text}
        </h2>
      );

    case "p":
      return (
        <p className={cn("text-lg leading-relaxed text-ink-soft", first ? "" : "mt-6")}>
          {inline(block.text)}
        </p>
      );

    case "list":
      return (
        <ul className={cn("flex flex-col gap-3", first ? "" : "mt-6")}>
          {block.items.map((item) => (
            <li key={item} className="flex gap-4 text-lg leading-relaxed text-ink-soft">
              <span
                aria-hidden="true"
                className="mt-3 size-1.5 shrink-0 rounded-full bg-accent"
              />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className={cn("flex flex-col gap-4", first ? "" : "mt-6")}>
          {block.items.map((item, n) => (
            <li key={item} className="flex gap-4 text-lg leading-relaxed text-ink-soft">
              <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-xs text-accent">
                {n + 1}
              </span>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ol>
      );

    case "code":
      return (
        // Long lines scroll inside the block. A code sample must never be the
        // reason the document itself scrolls sideways (§3.2).
        <figure className={cn("overflow-hidden rounded-(--radius-card) border border-line bg-sunken", first ? "" : "mt-8")}>
          <figcaption className="border-b border-line px-5 py-2 font-mono text-xs uppercase tracking-wider text-ink-muted">
            {block.lang}
          </figcaption>
          <pre className="overflow-x-auto p-5">
            <code className="font-mono text-sm leading-relaxed text-ink-soft">
              {block.code}
            </code>
          </pre>
        </figure>
      );

    case "callout":
      return (
        <aside
          className={cn(
            "rounded-(--radius-card) border border-accent/40 bg-surface-hover p-7",
            first ? "" : "mt-8",
          )}
        >
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            {block.title}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-ink">{inline(block.body)}</p>
        </aside>
      );

    case "quote":
      return (
        <figure className={cn("border-l-2 border-accent pl-6", first ? "" : "mt-8")}>
          <blockquote className="font-display text-xl leading-relaxed text-ink sm:text-2xl">
            {block.quote?.text ?? block.text}
          </blockquote>
          <figcaption className="mt-3 text-sm text-ink-muted">
            {block.quote?.cite ?? block.cite}
          </figcaption>
        </figure>
      );

    default:
      // An unknown block type is an authoring mistake. Rendering nothing is
      // right in production and useless in development, so say so there.
      if (import.meta.env.DEV) {
        console.warn(`ArticleBody: unknown block type "${block.type}"`);
      }
      return null;
  }
}

/**
 * Backtick spans become <code>. This is the only inline formatting articles
 * get, on purpose: it covers identifiers and CSS selectors, which is all the
 * bodies actually need, and it avoids shipping a Markdown parser to render
 * three articles.
 */
function inline(text) {
  if (typeof text !== "string" || !text.includes("`")) return text;

  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code
        key={i}
        className="rounded-md border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.9em] text-ink"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
