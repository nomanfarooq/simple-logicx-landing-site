import PageHeader from "../components/ui/PageHeader";
import ServicesGrid from "../sections/ServicesGrid";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd } from "../lib/seo";

/**
 * The grid is shared with the home page rather than duplicated, so the two
 * cannot drift apart as services are added.
 */
export default function Services() {
  return (
    <>
      <Seo
        title="Services"
        description="Seven engineering capabilities: SaaS platforms, applied AI, mobile, web, cloud, IoT and enterprise modernisation."
        path="/services"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />

      <PageHeader
        eyebrow="Services"
        title="Seven ways we ship"
        lead="Every engagement is staffed by engineers who have run the thing they are building. No handover to a junior team after the pitch."
      />

      <ServicesGrid showHeader={false} showCta={false} />
      <CTA />
    </>
  );
}
