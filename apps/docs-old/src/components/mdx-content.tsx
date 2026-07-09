import type { CompiledDocArtifact } from "@/lib/content/types";

export function MdxContent({ artifact }: { artifact: CompiledDocArtifact }) {
  return (
    <article className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-a:text-cyan-700">
      <div dangerouslySetInnerHTML={{ __html: artifact.html }} />
    </article>
  );
}
