import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import Logo from "../ui/Logo";
import { footerNav, offices, socials } from "../../content/navigation";
import { getIcon } from "../../lib/icons";

/**
 * Site footer (§4.3).
 *
 * The newsletter form posts nowhere yet — v2 ships the validated UI with a
 * pluggable handler (see "non-goals", §1). It is a real <form> with a real
 * <label> so wiring a backend later is a one-line change and the accessibility
 * work is already done.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-raised">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grad-primary-wide absolute -bottom-40 left-1/2 h-[400px] w-[900px] -translate-x-1/2 rounded-full opacity-(--orb-opacity) blur-[160px]" />
      </div>

      <Container size="wide" className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link to="/" aria-label="SimpleLogicX — home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-sm text-ink-muted">
              We design and build software that holds up — under load, under
              audit, and under the weight of everything you ship next.
            </p>

            <form
              className="mt-6 max-w-sm"
              onSubmit={(e) => e.preventDefault()}
            >
              <label
                htmlFor="footer-email"
                className="block text-sm font-medium text-ink"
              >
                Engineering notes, monthly
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="footer-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 rounded-(--radius-pill) border border-line bg-base px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="grad-cta grid size-11 shrink-0 place-items-center rounded-(--radius-pill) text-accent-ink transition-[filter] hover:brightness-110"
                >
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                No marketing drip. Unsubscribe in one click.
              </p>
            </form>
          </div>

          {footerNav.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
                {col.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {offices.map((o) => (
              <li key={o.city} className="text-sm text-ink-muted">
                <span className="font-medium text-ink">{o.city}</span>{" "}
                <span className="font-mono text-xs">{o.timezone}</span>
              </li>
            ))}
          </ul>

          <ul className="flex gap-2">
            {socials.map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-(--radius-pill) border border-line text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <Icon aria-hidden="true" className="size-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} SimpleLogicX. All rights reserved.</p>
          <p className="flex items-center gap-2">
            {/* One of the two permitted lime elements on this page (§2.3). */}
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-success"
            />
            All systems operational
          </p>
        </div>
      </Container>
    </footer>
  );
}
