import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";

/**
 * Route-level error boundary.
 *
 * Catches both thrown responses (404s from loaders) and render-time crashes,
 * so a single broken page degrades to a usable screen instead of a blank
 * document. Rendered inside RootLayout, so navbar and footer survive.
 */
export default function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <Section size="narrow" className="min-h-[70vh] grid place-items-center">
      <div className="text-center">
        <p className="grad-primary text-grad font-display text-6xl font-bold">
          {isRouteErrorResponse(error) ? error.status : "Error"}
        </p>
        <h1 className="mt-6 text-h2 text-ink">
          {is404 ? "This page does not exist" : "Something went wrong"}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ink-soft">
          {is404
            ? "The link may be out of date, or the page may have moved."
            : "An unexpected error occurred while rendering this page. Reloading usually clears it."}
        </p>

        {/* Detail is developer-facing only — never surface a stack trace to
            users in production. */}
        {import.meta.env.DEV && error?.message && (
          <pre className="mx-auto mt-6 max-w-full overflow-x-auto rounded-(--radius-card) border border-line bg-surface p-4 text-left font-mono text-xs text-ink-muted">
            {error.message}
          </pre>
        )}

        <div className="mt-10 flex justify-center gap-3">
          <Button to="/">Back to home</Button>
          <Button as="button" variant="secondary" onClick={() => location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </Section>
  );
}
