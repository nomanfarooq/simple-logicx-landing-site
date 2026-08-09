import { ArrowRight } from "lucide-react";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Reveal from "../components/motion/Reveal";
import Magnetic from "../components/motion/Magnetic";
import AuroraBackdrop from "../components/motion/AuroraBackdrop";

export default function CTA() {
  return (
    <Section decoration={<AuroraBackdrop count={3} />}>
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-h2 text-ink">
          Tell us what you are{" "}
          <span className="grad-ink text-grad">building</span>
        </h2>
        <p className="mt-6 text-lg text-ink-soft">
          Every enquiry is read by an engineer, not a sales desk. We reply within
          one working day — including the ones where the answer is “you do not
          need us for this”.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Magnetic>
            <Button to="/contact" size="lg" className="group">
              Start a project
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </Magnetic>
          <Button to="/process" variant="secondary" size="lg">
            How we work
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
