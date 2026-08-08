import Section from "./Section";
import { cn } from "../../lib/cn";

/**
 * Standard page masthead.
 *
 * Every route above the fold looks the same shape, which is deliberate: the
 * home hero is the only page allowed a bespoke treatment.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  children,
  className,
}) {
  return (
    <Section
      surface="raised"
      className={cn("border-b border-line", className)}
      decoration={
        <div className="grad-primary-wide absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-(--orb-opacity) blur-[150px]" />
      }
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <span className="inline-flex items-center rounded-(--radius-pill) border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 text-h1 text-ink">{title}</h1>
        {lead && <p className="mt-6 text-lg text-ink-soft">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </Section>
  );
}
