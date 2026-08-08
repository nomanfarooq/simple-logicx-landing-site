import { Navigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { serviceBySlug } from "../content/services";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = serviceBySlug[slug];

  // Unknown slug is a genuine 404, not an empty page.
  if (!service) return <Navigate to="/404" replace />;

  return (
    <>
      <Seo
        title={service.title}
        description={service.summary}
        path={`/services/${service.slug}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ])}
      />

      <PageHeader eyebrow="Service" title={service.title} lead={service.tagline} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-h3 text-ink">What this looks like</h2>
            <p className="mt-5 text-lg text-ink-soft">{service.summary}</p>
            <div className="mt-8">
              <Button to="/contact">Discuss a {service.title.toLowerCase()} project</Button>
            </div>
          </div>

          <div className="rounded-(--radius-card) border border-line bg-surface p-7">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
              Capabilities
            </h2>
            <ul className="mt-5 flex flex-col gap-3.5">
              {service.capabilities.map((c) => (
                <li key={c} className="flex gap-3 text-ink-soft">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-accent"
                  />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
