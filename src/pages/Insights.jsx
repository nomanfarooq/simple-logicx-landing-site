import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Seo from "../lib/seo";
import { insights } from "../content/insights";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Insights() {
  return (
    <>
      <Seo
        title="Insights"
        description="Engineering writing from the SimpleLogicX team on frontend, AI evaluation and migration strategy."
        path="/insights"
      />

      <PageHeader
        eyebrow="Insights"
        title="Notes from the build"
        lead="Written by the engineers doing the work, about problems we actually hit."
      />

      <Section>
        <ul className="flex flex-col gap-4">
          {insights.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/insights/${post.slug}`}
                className="group block rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover"
              >
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-ink-muted">
                  <span className="rounded-(--radius-pill) border border-line px-2.5 py-1 text-accent">
                    {post.tag}
                  </span>
                  <time dateTime={post.date}>
                    {dateFmt.format(new Date(post.date))}
                  </time>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-ink transition-colors group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-2 text-ink-muted">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
