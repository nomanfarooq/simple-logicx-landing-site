import PageHeader from "../components/ui/PageHeader";
import ProcessTimeline from "../sections/ProcessTimeline";
import CTA from "../sections/CTA";
import Seo from "../lib/seo";

/**
 * The timeline section is shared with the home page rather than duplicated,
 * so the process described in both places is the same process.
 */
export default function Process() {
  return (
    <>
      <Seo
        title="Process"
        description="Discovery, architecture, build, harden, operate — how a SimpleLogicX engagement runs."
        path="/process"
      />

      <PageHeader
        eyebrow="Process"
        title="Five phases, no surprises"
        lead="Every engagement runs the same shape. You always know what happens next and what it costs."
      />

      <ProcessTimeline showHeader={false} />
      <CTA />
    </>
  );
}
