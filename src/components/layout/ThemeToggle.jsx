import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/cn";

/**
 * Theme toggle (§9.4).
 *
 * Two-state control over a three-state model: it commits "system" to whichever
 * theme is the opposite of what is currently rendered. Users who want to go
 * back to following the OS can do so from the command palette; a three-way
 * cycle in the navbar is a worse everyday interaction for a rarely-used state.
 *
 * aria-pressed communicates the binary state; the label states the action.
 */
export default function ThemeToggle({ className }) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={cn(
        "relative grid size-10 place-items-center rounded-(--radius-pill)",
        "border border-line text-ink-soft",
        "transition-colors hover:bg-surface hover:text-ink",
        className,
      )}
    >
      {/* Both icons are always mounted and cross-faded, so the control never
          reflows and the transition cannot be interrupted mid-swap. */}
      <motion.span
        className="absolute grid place-items-center"
        initial={false}
        animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? -90 : 0, scale: isDark ? 0.6 : 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <Sun className="size-[18px]" aria-hidden="true" />
      </motion.span>
      <motion.span
        className="absolute grid place-items-center"
        initial={false}
        animate={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : 90, scale: isDark ? 1 : 0.6 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <Moon className="size-[18px]" aria-hidden="true" />
      </motion.span>
    </button>
  );
}
