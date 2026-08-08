import { cn } from "../../lib/cn";
import Container from "./Container";

/**
 * Section — vertical rhythm + decorative containment (§3.3).
 *
 * The section contract, all four parts load-bearing:
 *
 *   1. relative + overflow-hidden. v1 left FOUR sections unclipped while they
 *      each contained a 400-600px blur orb (Services, Testimonials, Pricing,
 *      ProcessTimeline). Below ~1200px those orbs bleed past the viewport,
 *      the document grows wider than the window, and every `mx-auto` on the
 *      page then centres against that wider box — content shifts left. Every
 *      section clips its own decoration, no exceptions.
 *
 *   2. Rhythm from --spacing-section, never ad-hoc py-32.
 *
 *   3. Decoration renders INSIDE the clipped box, aria-hidden.
 *
 *   4. Children go through <Container>.
 */

const SURFACES = {
  base: "bg-base",
  raised: "bg-raised",
  sunken: "bg-sunken",
  none: "",
};

export default function Section({
  as: Tag = "section",
  surface = "base",
  size = "default",
  decoration = null,
  containerClassName,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        // (1) containment — the non-negotiable part
        "relative overflow-hidden",
        // (2) rhythm
        "py-(--spacing-section)",
        SURFACES[surface] ?? SURFACES.base,
        className,
      )}
      {...props}
    >
      {/* (3) decoration, clipped by this section and hidden from AT */}
      {decoration ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {decoration}
        </div>
      ) : null}

      {/* (4) content, centred by the one container implementation */}
      <Container size={size} className={cn("relative", containerClassName)}>
        {children}
      </Container>
    </Tag>
  );
}
