import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Counter from "../components/motion/Counter";
import Magnetic from "../components/motion/Magnetic";
import AuroraBackdrop from "../components/motion/AuroraBackdrop";
import Seo, { organizationJsonLd, faqJsonLd } from "../lib/seo";

import TrustedBy from "../sections/TrustedBy";
import ServicesGrid from "../sections/ServicesGrid";
import WhyChooseUs from "../sections/WhyChooseUs";
import ProcessTimeline from "../sections/ProcessTimeline";
import FeaturedWork from "../sections/FeaturedWork";
import TechMarquee from "../sections/TechMarquee";
import Testimonials from "../sections/Testimonials";
import PricingPreview from "../sections/PricingPreview";
import FAQ from "../sections/FAQ";
import CTA from "../sections/CTA";

/**
 * Home. Eagerly bundled (not lazy) because it owns the LCP (§4.2).
 *
 * The hero is inline rather than a section component: it is the one bespoke
 * treatment on the site (§4.4) and is not reused anywhere else. Everything
 * below is a composable section from src/sections.
 */

const stats = [
  { value: "150+", label: "Projects delivered" },
  { value: "98%", label: "Client retention" },
  { value: "40+", label: "Engineers" },
  { value: "12", label: "Years shipping" },
];

export default function Home() {
  return (
    <>
      <Seo
        title="Engineering Digital Excellence"
        description="SimpleLogicX builds SaaS platforms, applied AI, mobile apps and enterprise cloud infrastructure that hold up under load, under audit, and under everything you ship next."
        path="/"
        jsonLd={[organizationJsonLd, faqJsonLd]}
      />

      <Section
        size="wide"
        className="pt-(--spacing-section)"
        decoration={<AuroraBackdrop count={2} />}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-line bg-surface px-4 py-1.5 text-sm text-ink-soft"
          >
            {/* Permitted lime instance #1 of 2 on this page (§2.3). */}
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-success"
            />
            Taking on new engagements for Q3
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 text-hero text-ink"
          >
            Software that
            {/* grad-primary, not a multi-hue spectrum: cyan cannot reach the
                warm end of the palette without passing through green or grey.
                See the note in styles/theme.css for the measurements. */}
            <span className="grad-ink text-grad block">holds up</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-7 max-w-2xl text-lg text-ink-soft"
          >
            We are a product engineering studio. We build SaaS platforms,
            applied AI, mobile apps and cloud infrastructure — and we stay long
            enough to see them survive real traffic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Magnetic>
              <Button to="/contact" size="lg" className="group">
                Start a project
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Magnetic>
            <Button to="/work" variant="secondary" size="lg">
              See our work
            </Button>
          </motion.div>
        </div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.36 }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <Counter
                  value={s.value}
                  className="grad-ink text-grad block font-display text-3xl font-bold sm:text-4xl"
                />
                <span className="mt-2 block text-sm text-ink-muted">{s.label}</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </Section>

      <TrustedBy />
      <ServicesGrid />
      <WhyChooseUs />
      <ProcessTimeline />
      <FeaturedWork />
      <TechMarquee />
      <Testimonials />
      <PricingPreview />
      <FAQ />
      <CTA />
    </>
  );
}
