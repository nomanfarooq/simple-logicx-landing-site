import Section from "../components/ui/Section";
import Marquee from "../components/motion/Marquee";
import Reveal from "../components/motion/Reveal";
import { trustedBy } from "../content/technologies";

/**
 * Social proof strip. Deliberately understated — it sits directly under the
 * hero, and a loud treatment here competes with the headline.
 */
export default function TrustedBy() {
  return (
    <Section surface="raised" className="border-y border-line py-16!">
      <Reveal>
        <p className="text-center font-mono text-xs uppercase tracking-wider text-ink-muted">
          Trusted by engineering teams at
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <Marquee speed={45}>
          {trustedBy.map((name) => (
            <span
              key={name}
              className="whitespace-nowrap font-display text-xl font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </Reveal>
    </Section>
  );
}
