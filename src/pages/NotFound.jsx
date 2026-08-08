import { Link } from "react-router-dom";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Seo from "../lib/seo";
import { mainNav } from "../content/navigation";

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you were looking for does not exist."
        path="/404"
      />

      <Section
        size="narrow"
        className="min-h-[70vh] grid place-items-center"
        decoration={
          <div className="grad-primary-wide absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-(--orb-opacity) blur-[150px]" />
        }
      >
        <div className="text-center">
          <p className="grad-primary text-grad font-display text-7xl font-bold">404</p>
          <h1 className="mt-6 text-h2 text-ink">This page does not exist</h1>
          <p className="mx-auto mt-5 max-w-md text-ink-soft">
            The link may be out of date, or the page may have moved. Here is
            where everything lives.
          </p>

          <nav aria-label="Suggested pages" className="mt-8">
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
