import { Star } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "../components/motion/Reveal";
import { testimonials } from "../content/testimonials";

/**
 * Testimonials.
 *
 * Markup is <figure>/<blockquote>/<figcaption>, which is the semantically
 * correct pairing for a quote with an attribution — a div with a paragraph
 * underneath gives assistive tech no way to connect the two.
 */
export default function Testimonials() {
  return (
    <Section surface="raised">
      <SectionHeader
        eyebrow="Clients"
        title="What they said afterwards"
        lead="Quotes from the people who had to live with the software once we left."
      />

      <RevealGroup as="ul" className="mt-16 grid gap-5 lg:grid-cols-3" stagger={0.1}>
        {testimonials.map((t) => (
          <RevealItem as="li" key={t.name} className="h-full">
            <figure className="flex h-full flex-col rounded-(--radius-card) border border-line bg-surface p-7">
              <div aria-label="Five out of five" className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className="size-4 fill-[color:var(--color-gold)] text-[color:var(--color-gold)]"
                  />
                ))}
              </div>

              <blockquote className="mt-5 flex-1 text-ink-soft">
                <p>“{t.quote}”</p>
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span
                  aria-hidden="true"
                  className="grad-primary grid size-10 shrink-0 place-items-center rounded-full font-mono text-xs font-bold text-white"
                >
                  {t.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{t.name}</span>
                  <span className="block truncate text-sm text-ink-muted">
                    {t.role}, {t.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
