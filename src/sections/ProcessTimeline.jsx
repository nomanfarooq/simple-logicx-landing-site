import { useRef } from "react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Reveal from "../components/motion/Reveal";
import { gsap, useGSAP } from "../lib/gsap";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { processSteps } from "../content/process";

/**
 * Process timeline with a scroll-drawn spine.
 *
 * This is the page's one signature scroll effect (§5.5 caps it at one per
 * page): the vertical line scales from 0 to 1 as the section passes, scrubbed
 * against scroll. GSAP rather than Framer because it is scroll-LINKED.
 *
 * The line is decorative. Under reduced motion it renders fully drawn rather
 * than animating, so the visual structure survives without the movement.
 */
export default function ProcessTimeline({ showHeader = true }) {
  const scope = useRef(null);
  const line = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  // Phase heading level follows the section header — see the same note in
  // ServicesGrid. On /process the header is suppressed, so a fixed h3 would
  // skip a level down from the page h1.
  const PhaseHeading = showHeader ? "h3" : "h2";

  useGSAP(
    () => {
      if (reduceMotion || !line.current) return;
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 65%",
            end: "bottom 75%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope, dependencies: [reduceMotion] },
  );

  return (
    <Section>
      {/* Suppressed on /process, where the page header already says this —
          the section is shared, so the heading has to be optional. */}
      {showHeader && (
        <SectionHeader
          eyebrow="Process"
          title="Five phases, no surprises"
          lead="Every engagement runs the same shape. You always know what happens next and what it costs."
        />
      )}

      <div ref={scope} className={showHeader ? "relative mt-16 md:mt-20" : "relative"}>
        {/* Spine — sits behind the steps, hidden from assistive tech. */}
        <div
          aria-hidden="true"
          className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-line md:block"
        >
          <div
            ref={line}
            className="grad-primary h-full w-full origin-top"
            style={{ transform: reduceMotion ? "scaleY(1)" : "scaleY(0)" }}
          />
        </div>

        <ol className="flex flex-col gap-10">
          {processSteps.map((step) => (
            <li key={step.n}>
              <Reveal direction="up" amount={0.3}>
                <div className="grid gap-5 md:grid-cols-[40px_1fr] md:gap-8">
                  <span className="relative z-10 grid size-10 place-items-center rounded-full border border-line bg-base font-mono text-xs font-semibold text-accent">
                    {step.n}
                  </span>

                  <div className="rounded-(--radius-card) border border-line bg-surface p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <PhaseHeading className="font-display text-xl font-semibold text-ink">
                        {step.title}
                      </PhaseHeading>
                      <span className="font-mono text-xs text-ink-muted">
                        {step.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-ink-muted">{step.body}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {step.deliverables.map((d) => (
                        <li
                          key={d}
                          className="rounded-(--radius-pill) border border-line bg-base px-3 py-1 text-xs text-ink-soft"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
