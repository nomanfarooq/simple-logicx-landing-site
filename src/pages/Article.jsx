import { Navigate, useParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Seo from "../lib/seo";
import { insightBySlug } from "../content/insights";

export default function Article() {
  const { slug } = useParams();
  const post = insightBySlug[slug];
  if (!post) return <Navigate to="/404" replace />;

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/insights/${post.slug}`}
        type="article"
      />

      <PageHeader eyebrow={post.tag} title={post.title} lead={post.excerpt} />

      {/* size="article" — 768px measure. Deliberately not `prose`, which is a
          Tailwind core utility fixed at 65ch (§2.6). */}
      <Section size="article">
        <p className="text-ink-soft">
          Article bodies are authored in step 9. This route, its metadata and its
          measure are in place and verified.
        </p>
      </Section>
    </>
  );
}
