import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import { RevealGroup, RevealItem } from "../components/motion/Reveal";
import { services } from "../content/services";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/cn";

/**
 * Services grid.
 *
 * There are seven services and three columns, which leaves the seventh card
 * stranded alone in a half-empty row. Rather than pad the list or drop to a
 * two-column layout, the last card spans the full width and switches to a
 * horizontal layout — the orphan reads as a deliberate feature row instead of
 * an accident.
 */

function ServiceCard({ service, wide, headingLevel: Heading }) {
  const Icon = getIcon(service.icon);

  return (
    <Link
      to={`/services/${service.slug}`}
      className={cn(
        "group flex h-full rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover",
        wide ? "flex-col gap-6 sm:flex-row sm:items-center" : "flex-col",
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-base text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
        <Icon aria-hidden="true" className="size-6" />
      </span>

      <div className={cn("min-w-0", wide ? "flex-1" : "mt-5 flex flex-1 flex-col")}>
        <Heading className="font-display text-xl font-semibold text-ink">
          {service.title}
        </Heading>
        <p className={cn("text-ink-muted", wide ? "mt-2" : "mt-3 flex-1")}>
          {service.tagline}
        </p>
      </div>

      <span
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium text-accent",
          wide ? "shrink-0" : "mt-6",
        )}
      >
        Explore
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

export default function ServicesGrid({ showHeader = true, showCta = true }) {
  const lastIndex = services.length - 1;
  // Only worth spanning when the final row would otherwise be short.
  const orphaned = services.length % 3 === 1;

  // Card heading level follows the section header rather than being fixed.
  // With the header, the cards sit under its h2 and are h3. On /services the
  // header is suppressed because the page masthead already says the same
  // thing — so a hardcoded h3 would jump straight from the h1 and break the
  // document outline. Deriving it means the two cannot drift apart.
  const headingLevel = showHeader ? "h3" : "h2";

  return (
    <Section id="services">
      {/* Suppressed on /services, where the page header already says this. */}
      {showHeader && (
        <SectionHeader
          eyebrow="Services"
          title="Seven ways we ship"
          lead="Every engagement is staffed by engineers who have run the thing they are building."
        />
      )}

      <RevealGroup
        as="ul"
        className={cn(
          "grid gap-5 md:grid-cols-2 lg:grid-cols-3",
          showHeader && "mt-16",
        )}
        stagger={0.06}
      >
        {services.map((s, i) => {
          const wide = orphaned && i === lastIndex;
          return (
            <RevealItem
              as="li"
              key={s.slug}
              className={cn(wide && "md:col-span-2 lg:col-span-3")}
            >
              <ServiceCard service={s} wide={wide} headingLevel={headingLevel} />
            </RevealItem>
          );
        })}
      </RevealGroup>

      {showCta && (
        <div className="mt-12 text-center">
          <Button to="/services" variant="secondary" size="lg">
            View all services
          </Button>
        </div>
      )}
    </Section>
  );
}
