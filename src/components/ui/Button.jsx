import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

/**
 * Button / link button.
 *
 * Renders <Link> for internal hrefs, <a> for external, <button> otherwise, so
 * callers never have to think about it and internal navigation always goes
 * through the router rather than triggering a full page load.
 */

const VARIANTS = {
  // Primary CTA. grad-cta, not grad-primary: the label sits ON the ramp, and
  // white on grad-primary's cyan end measures 1.95:1 against a 4.5:1
  // requirement — in BOTH themes, since that gradient is theme-invariant.
  // grad-cta is the same brand axis, cut short where it stops being legible,
  // and it pairs with --accent-contrast rather than a hardcoded white. See the
  // measurements in theme.css.
  primary:
    "grad-cta text-accent-ink shadow-sm hover:brightness-110 active:brightness-95",
  secondary:
    "border border-line-strong bg-surface text-ink hover:bg-surface-hover hover:border-accent/50",
  ghost: "text-ink-soft hover:text-ink hover:bg-surface",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  as,
  href,
  to,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-(--radius-pill) font-medium",
    "transition-[background,color,border-color,filter] duration-200",
    // Focus ring is inherited from the global :focus-visible rule; never remove it.
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  );

  const target = to ?? href;
  const isInternal = typeof target === "string" && target.startsWith("/");

  if (isInternal) {
    return (
      <Link to={target} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (target) {
    return (
      <a
        href={target}
        className={classes}
        rel="noopener noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </a>
    );
  }

  const Tag = as ?? "button";
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
