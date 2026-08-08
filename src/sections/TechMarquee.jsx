import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Marquee from "../components/motion/Marquee";
import Reveal from "../components/motion/Reveal";
import { techRows } from "../content/technologies";

/**
 * Technology marquee. Two rows running in opposite directions — the
 * counter-motion is what makes it read as a texture rather than a list.
 */
export default function TechMarquee() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Stack"
        title="Technologies we actually run"
        lead="Battle-tested tools. We pick the right technology for your problem, not the trendiest one."
      />

      <Reveal className="mt-16 flex flex-col gap-4">
        {techRows.map((row, i) => (
          <Marquee key={i} speed={i === 0 ? 52 : 62} direction={i === 0 ? "left" : "right"}>
            {row.map((tech) => (
              <span
                key={tech}
                className="whitespace-nowrap rounded-(--radius-pill) border border-line bg-surface px-6 py-3 font-mono text-sm text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
              >
                {tech}
              </span>
            ))}
          </Marquee>
        ))}
      </Reveal>
    </Section>
  );
}
