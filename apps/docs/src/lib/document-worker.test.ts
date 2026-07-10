import { env } from "cloudflare:workers";
import { describe, expect, it } from "vite-plus/test";

declare global {
  namespace Cloudflare {
    interface Env {
      DOCS_WORKER: Fetcher;
    }
  }
}

const activeRevision = {
  activeCommitSha: "commit-123",
  storagePrefix: "shiru",
};

async function publishDocument(documentPath: string, source: string) {
  await env.DOCS_KV.put("docs:site:shiru", JSON.stringify(activeRevision));
  await env.DOCS_SOURCE.put(
    `${activeRevision.storagePrefix}/${activeRevision.activeCommitSha}/${documentPath}.mdx`,
    source,
  );
}

describe("Documentation Delivery Worker", () => {
  it("serves safe Content-only MDX with Document Metadata and Heading Anchors", async () => {
    await publishDocument(
      "getting-started",
      [
        "---",
        "title: Metadata only title",
        "description: Metadata only description",
        "---",
        "",
        "# Install",
        "# Install",
        "",
        "| Name | Value |",
        "| --- | --- |",
        "| One | Two |",
      ].join("\n"),
    );

    const response = await env.DOCS_WORKER.fetch("http://shiru.localhost:3000/getting-started");
    const html = await response.text();
    const article = /<article[^>]*>[\s\S]*?<\/article>/.exec(html)?.[0] ?? "";

    expect(response.status).toBe(200);
    expect(html).toContain("<title>Metadata only title</title>");
    expect(html).toContain('content="Metadata only description" name="description"');
    expect(article).not.toContain("Metadata only title");
    expect(article).not.toContain("Metadata only description");
    expect(article).toContain('id="install"');
    expect(article).toContain('id="install-1"');
    expect(article).toContain("<table>");
  });

  it("sets SEO metadata whenever an optional description is supplied", async () => {
    await publishDocument(
      "empty-description",
      "---\ntitle: Empty description\ndescription: ''\n---\n\n# Visible heading",
    );

    const response = await env.DOCS_WORKER.fetch("http://shiru.localhost:3000/empty-description");
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('content="" name="description"');
  });

  it.each([
    ["raw HTML", "---\ntitle: Private title\n---\n\n<script>private-parser-detail</script>"],
    ["unknown JSX", "---\ntitle: Private title\n---\n\n<PrivateComponent />"],
    ["an import", "---\ntitle: Private title\n---\n\nimport value from './private-module'"],
    ["an export", "---\ntitle: Private title\n---\n\nexport const privateValue = 1"],
    ["an expression", "---\ntitle: Private title\n---\n\n{privateValue}"],
    ["an MDX fragment", "---\ntitle: Private title\n---\n\n<>private-parser-detail</>"],
    ["malformed metadata", "---\ntitle: [private-parser-detail\n---\n\n# Private"],
  ])("keeps %s behind a generic public error", async (_case, privateSource) => {
    await publishDocument("unsafe", privateSource);

    const response = await env.DOCS_WORKER.fetch("http://shiru.localhost:3000/unsafe");
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain("Unable to render document");
    expect(body).not.toContain(privateSource);
    expect(body).not.toContain("private-parser-detail");
    expect(body).not.toContain("Unsupported Content-only MDX syntax");
    expect(body).not.toContain("Unsupported Document Component");
  });
});
