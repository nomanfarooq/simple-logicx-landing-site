import { cn } from "../../lib/cn";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

/**
 * Infinite marquee.
 *
 * CSS animation rather than JS: this runs continuously and forever, so keeping
 * it off the main thread matters more here than anywhere else on the site.
 *
 * SEAMLESS LOOP GEOMETRY — the fiddly part, and easy to get subtly wrong.
 * The track holds two identical halves and translates by exactly -50%, so the
 * second half lands precisely where the first started. For that to hold, each
 * half must be exactly half the track width. The trap is the gap: with a gap
 * on the flex track itself, total width becomes (half + gap + half), so -50%
 * lands half a gap short and the loop visibly stutters every cycle. So the
 * track has NO gap, and each half carries its own internal gap plus a trailing
 * pad of the same size. Both halves then measure exactly (content + gap).
 *
 * The duplicate is aria-hidden so screen readers do not read the list twice.
 *
 * Under reduced motion it becomes a normal horizontally-scrollable row: the
 * content stays reachable, it just does not move on its own.
 */
export default function Marquee({
  children,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
  fade = true,
  className,
}) {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    return (
      <div className={cn("flex gap-10 overflow-x-auto pb-2", className)}>
        {children}
      </div>
    );
  }

  // gap-10 (2.5rem) internally + pr-10 (2.5rem) trailing — see note above.
  const half = "flex shrink-0 items-center gap-10 pr-10";

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        // Soft edges so items enter and leave instead of being cut off.
        fade &&
          "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{
          animation: `slx-marquee ${speed}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        <div className={half}>{children}</div>
        <div className={half} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
