import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Accordion from "../components/ui/Accordion";
import Reveal from "../components/motion/Reveal";
import { faqs } from "../content/faq";

export default function FAQ() {
  return (
    <Section surface="raised" size="article">
      <SectionHeader
        eyebrow="FAQ"
        title="Questions we get asked"
        lead="If yours is not here, ask us directly — an engineer will answer it."
      />

      <Reveal className="mt-14">
        <Accordion items={faqs} />
      </Reveal>
    </Section>
  );
}
