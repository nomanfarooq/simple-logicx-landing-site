import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "../components/motion/Reveal";
import { processSteps } from "../content/process";

/**
 * Condensed process strip for service and case-study pages.
 *
 * Same data as the full ProcessTimeline, without the scroll-drawn spine — a
 * service page already has its own signature moment, and §5.5 caps a page at
 * one pinned or scrubbed effect.
 */
export default function ProcessMini({ surface = "raised" }) {
  return (
    <Section surface={surface}>
      <SectionHeader
        eyebrow="How it runs"
        title="The same five phases, every time"
        lead="However specialised the work, the engagement shape does not change."
      />

      <RevealGroup as="ol" className="mt-14 grid gap-4 md:grid-cols-5" stagger={0.07}>
        {processSteps.map((step) => (
          <RevealItem
            as="li"
            key={step.n}
            className="rounded-(--radius-card) border border-line bg-surface p-6"
          >
            <span className="font-mono text-xs font-semibold text-accent">{step.n}</span>
            <h3 className="mt-3 font-display font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{step.duration}</p>
          </RevealItem>
        ))}
      </RevealGroup>

      <div className="mt-10 text-center">
        <Link
          to="/process"
          className="group inline-flex min-h-6 items-center gap-2 text-sm font-medium text-accent"
        >
          Read the full process
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </Section>
  );
}
