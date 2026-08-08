import { Navigate, useParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { caseStudyBySlug } from "../content/caseStudies";

export default function CaseStudy() {
  const { slug } = useParams();
  const study = caseStudyBySlug[slug];
  if (!study) return <Navigate to="/404" replace />;

  return (
    <>
      <Seo
        title={study.title}
        description={study.summary}
        path={`/work/${study.slug}`}
        type="article"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: study.client, path: `/work/${study.slug}` },
        ])}
      />

      <PageHeader
        eyebrow={`${study.client} · ${study.sector}`}
        title={study.title}
        lead={study.summary}
      />

      <Section>
        <dl className="grid gap-6 sm:grid-cols-3">
          {study.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-(--radius-card) border border-line bg-surface p-7 text-center"
            >
              <dd className="grad-primary text-grad font-display text-4xl font-bold">
                {m.value}
              </dd>
              <dt className="mt-2 text-sm text-ink-muted">{m.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-14 max-w-2xl">
          <h2 className="text-h3 text-ink">Full narrative coming in step 7</h2>
          <p className="mt-4 text-ink-soft">
            Challenge, approach, architecture diagram, results and the closing
            testimonial are authored in the case-study build phase.
          </p>
          <div className="mt-8">
            <Button to="/contact">Talk about a similar problem</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
