import { useId, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Seo from "../lib/seo";
import { mainNav } from "../content/navigation";
import { searchSite } from "../content/siteIndex";

/**
 * 404 (§4.1 — branded, with search and suggested routes).
 *
 * Search runs against a derived index of every route on the site (see
 * content/siteIndex.js), so it cannot go stale as content is added. It is a
 * plain filtered list rather than a combobox: there is no popup, results are
 * always visible below the field, and the count is announced. A combobox
 * pattern here would add roving focus and aria-activedescendant to solve a
 * problem this layout does not have.
 */
export default function NotFound() {
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const id = useId();

  const results = useMemo(() => searchSite(query), [query]);
  const searching = query.trim().length >= 2;

  return (
    <>
      <Seo
        title="Page not found"
        description="The page you were looking for does not exist. Search the site or jump to one of the main sections."
        path="/404"
      />

      <Section
        size="narrow"
        className="min-h-[70vh] grid place-items-center"
        decoration={
          <div className="grad-primary-wide absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-(--orb-opacity) blur-[150px]" />
        }
      >
        <div className="w-full text-center">
          <p className="grad-primary text-grad font-display text-7xl font-bold">404</p>
          <h1 className="mt-6 text-h2 text-ink">This page does not exist</h1>
          <p className="mx-auto mt-5 max-w-md text-ink-soft">
            The link may be out of date, or the page may have moved. Search for
            what you were after, or jump straight to a section.
          </p>

          {/* The path is genuinely useful when someone reports a broken link,
              and it is already public — it is in their address bar. */}
          {pathname !== "/404" && (
            <p className="mt-4 break-all font-mono text-xs text-ink-muted">
              Requested: {pathname}
            </p>
          )}

          {/* Search. A form so Enter does not reload the page, and so the
              field is a labelled search landmark for assistive tech. */}
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-10 max-w-md"
          >
            <label htmlFor={`${id}-q`} className="sr-only">
              Search the site
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              />
              <input
                id={`${id}-q`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, services, case studies…"
                autoComplete="off"
                className="w-full rounded-(--radius-pill) border border-line bg-surface py-3 pl-11 pr-4 text-ink placeholder:text-ink-muted"
              />
            </div>
          </form>

          <p aria-live="polite" className="sr-only">
            {searching
              ? `${results.length} ${results.length === 1 ? "result" : "results"} for ${query}`
              : ""}
          </p>

          {searching && (
            <div className="mx-auto mt-4 max-w-md text-left">
              {results.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {results.map((r) => (
                    <li key={r.path}>
                      <Link
                        to={r.path}
                        className="group flex items-center gap-4 rounded-(--radius-card) border border-line bg-surface px-5 py-3 transition-colors hover:border-accent/40 hover:bg-surface-hover"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">
                            {r.title}
                          </span>
                          <span className="block font-mono text-xs text-ink-muted">
                            {r.kind} · {r.path}
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                // Saying nothing matched is more useful than a fuzzy guess.
                <p className="rounded-(--radius-card) border border-line bg-surface px-5 py-4 text-sm text-ink-muted">
                  Nothing matched “{query}”. Try a service, a client name or a
                  topic — or use the sections below.
                </p>
              )}
            </div>
          )}

          <nav aria-label="Suggested pages" className="mt-10">
            <ul className="flex flex-wrap justify-center gap-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex rounded-(--radius-pill) border border-line bg-surface px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-10">
            <Button to="/" size="lg">
              Back to home
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
