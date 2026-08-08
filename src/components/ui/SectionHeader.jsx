import Reveal from "../motion/Reveal";
import { cn } from "../../lib/cn";

/**
 * Shared section masthead: eyebrow, heading, lead.
 *
 * Headings are `h2` by default — every page already has exactly one `h1`
 * (the PageHeader or hero), and sections must not introduce a second or skip
 * a level (§6 Accessibility).
 */
export default function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  as = "h2",
  className,
}) {
  const Heading = as;
  const centered = align === "center";

  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        centered && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center rounded-(--radius-pill) border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
          {eyebrow}
        </span>
      )}
      <Heading className="mt-5 text-h2 text-ink">{title}</Heading>
      {lead && <p className="mt-5 text-lg text-ink-soft">{lead}</p>}
    </Reveal>
  );
}
