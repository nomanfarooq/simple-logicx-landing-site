import { ArrowRight } from "lucide-react";
import { RevealGroup, RevealItem } from "../motion/Reveal";
import { cn } from "../../lib/cn";

/**
 * Layered architecture diagram.
 *
 * Built from HTML and CSS grid rather than drawn as an SVG. That is a
 * deliberate trade, and the reasons are practical:
 *
 *   - The labels are real text: selectable, translatable, searchable, and
 *     resizable when a user zooms. Text inside an SVG viewBox scales with the
 *     drawing instead, so it becomes unreadable on a phone exactly when the
 *     user most needs to read it.
 *   - It reflows. Four columns on desktop become a vertical stack on mobile,
 *     which no fixed viewBox can do.
 *   - It is already accessible. The markup is an ordered list of stages, each
 *     containing its components, so a screen reader conveys the pipeline
 *     without needing a parallel text description of a picture.
 *
 * The arrows are decorative and hidden from assistive tech — the list order
 * already carries the direction of flow.
 */
export default function ArchitectureDiagram({ layers, caption, className }) {
  return (
    <figure className={cn("", className)}>
      <RevealGroup
        as="ol"
        stagger={0.09}
        className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
      >
        {layers.map((layer, i) => (
          <RevealItem as="li" key={layer.label} className="relative flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {layer.label}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </div>

            <ul className="flex flex-1 flex-col gap-3">
              {layer.nodes.map((node) => (
                <li
                  key={node.name}
                  className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40"
                >
                  <span className="block text-sm font-semibold text-ink">
                    {node.name}
                  </span>
                  {node.note && (
                    <span className="mt-1 block font-mono text-xs text-ink-muted">
                      {node.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Flow indicator. Decorative: the list order carries the meaning.
                Points right between columns, down between stacked rows. */}
            {i < layers.length - 1 && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 text-line-strong md:-right-3 md:bottom-auto md:left-auto md:top-1/2 md:translate-x-0"
              >
                <ArrowRight className="size-4 rotate-90 md:rotate-0" />
              </span>
            )}
          </RevealItem>
        ))}
      </RevealGroup>

      {caption && (
        <figcaption className="mt-8 text-sm text-ink-muted">{caption}</figcaption>
      )}
    </figure>
  );
}
