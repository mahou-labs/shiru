import { createFileRoute } from "@tanstack/react-router";

import { DocsLayout } from "@/components/docs-layout";
import { MdxContent } from "@/components/mdx-content";
import { loadDocsPage } from "@/lib/docs/load-page";

export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    const slug = params._splat || "index";
    return loadDocsPage({ data: slug });
  },
  component: DocsPageRoute,
});

function DocsPageRoute() {
  const { manifest, artifact } = Route.useLoaderData();

  return (
    <DocsLayout manifest={manifest}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-sm font-medium text-cyan-700">Documentation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{artifact.frontmatter.title}</h1>
          {artifact.frontmatter.description ? (
            <p className="mt-4 text-lg leading-8 text-slate-600">{artifact.frontmatter.description}</p>
          ) : null}
        </header>
        <MdxContent artifact={artifact} />
      </div>
    </DocsLayout>
  );
}