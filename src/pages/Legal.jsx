import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Seo from "../lib/seo";

const DOCS = {
  privacy: {
    title: "Privacy Policy",
    description: "How SimpleLogicX collects, uses and retains personal data.",
    updated: "2026-01-15",
  },
  terms: {
    title: "Terms of Service",
    description: "The terms governing use of SimpleLogicX services and this website.",
    updated: "2026-01-15",
  },
};

/**
 * Legal pages share one component, selected by an explicit `doc` prop from the
 * route config rather than a URL param — the set is closed and known, so an
 * unknown legal slug should not be reachable in the first place.
 */
export default function Legal({ doc }) {
  const meta = DOCS[doc] ?? DOCS.privacy;

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={`/legal/${doc}`}
      />

      <PageHeader
        eyebrow="Legal"
        title={meta.title}
        lead={`Last updated ${new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(meta.updated))}.`}
      />

      <Section size="article">
        <p className="text-ink-soft">
          Full legal copy is supplied by counsel before launch. The route,
          metadata and reading measure are in place.
        </p>
      </Section>
    </>
  );
}
