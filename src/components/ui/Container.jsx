import { cn } from "../../lib/cn";

/**
 * Container — the single source of truth for horizontal centring (§3.1).
 *
 * Spec rule: NOTHING in this codebase may hand-write `max-w-* mx-auto px-*`.
 * v1 retyped that string in 12 places; one typo in one section is invisible in
 * review and produces exactly the off-centre bug this rebuild exists to fix.
 *
 * Why these specific declarations:
 *   w-full           — a flex/grid parent can otherwise size this to its
 *                      content, at which point `margin-inline: auto` has no
 *                      free space to distribute and centring silently no-ops.
 *   mx-auto          — `margin-inline: auto`, symmetric by construction.
 *   px-(--spacing-gutter) — one fluid gutter token, never per-breakpoint
 *                      padding that can be set on one side only.
 *
 * Sizes are written as literal class strings so Tailwind's static extractor
 * can see them. Do not template these.
 */

const SIZES = {
  narrow: "max-w-narrow", // 672px  — FAQ, legal, forms
  article: "max-w-article", // 768px  — article body (NOT "prose", see theme.css)
  default: "max-w-default", // 1280px — standard sections
  wide: "max-w-wide", // 1536px — hero, portfolio grids
  full: "max-w-none", // opt out, for genuinely full-bleed rows
};

export default function Container({
  size = "default",
  as: Tag = "div",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "w-full mx-auto px-(--spacing-gutter)",
        SIZES[size] ?? SIZES.default,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
