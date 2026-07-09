import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import {
  CanonicalRedirect,
  DocumentArticle,
  NotFoundError,
  loadDocument,
  type DocsBindings,
  type RenderedDocument,
} from "./document-request";

const activeRevision = {
  activeCommitSha: "commit-123",
  storagePrefix: "shiru",
};

function createBindings(
  documents: Record<string, string>,
  site: typeof activeRevision | null = activeRevision,
) {
  return {
    DOCS_KV: {
      get: async (key: string) => (key === "docs:site:shiru" && site ? JSON.stringify(site) : null),
    },
    DOCS_SOURCE: {
      get: async (key: string) => {
        const content = documents[key];
        return content === undefined
          ? null
          : {
              size: new TextEncoder().encode(content).byteLength,
              text: async () => content,
            };
      },
    },
  };
}

function documentKey(path: string) {
  return `${activeRevision.storagePrefix}/${activeRevision.activeCommitSha}/${path}`;
}

async function handleDocumentRequest(request: Request, bindings: DocsBindings) {
  try {
    const document = await loadDocument(request, bindings);
    const markup = renderToStaticMarkup(<DocumentHtml document={document} />);

    return new Response(`<!doctype html>${markup}`, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    if (error instanceof CanonicalRedirect) {
      return new Response(null, { headers: { location: error.location }, status: 308 });
    }
    if (error instanceof NotFoundError) {
      return new Response("Not found", { status: 404 });
    }

    return new Response("Unable to render document", { status: 500 });
  }
}

function DocumentHtml({ document }: { document: RenderedDocument }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>{document.title}</title>
        {document.description ? <meta content={document.description} name="description" /> : null}
      </head>
      <body>
        <DocumentArticle document={document} />
      </body>
    </html>
  );
}

describe("Documentation Delivery request handler", () => {
  it("renders a Site Subdomain's Active Revision as a server-rendered document", async () => {
    const response = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/getting-started"),
      createBindings({
        [documentKey("getting-started.mdx")]:
          "---\ntitle: Getting started\ndescription: Begin here\n---\n\n# Hello, Shiru\n\nWelcome.",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    await expect(response.text()).resolves.toContain('<h1 id="hello-shiru">Hello, Shiru</h1>');
  });

  it("returns generic 404 responses for unknown sites, unpublished sites, and missing documents", async () => {
    const missingSite = await handleDocumentRequest(
      new Request("http://unknown.localhost:3000/getting-started"),
      createBindings({}),
    );
    const missingDocument = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/getting-started"),
      createBindings({}),
    );
    const unpublishedSite = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/getting-started"),
      createBindings({}, null),
    );
    const inactiveSite = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/getting-started"),
      createBindings({}, { activeCommitSha: "", storagePrefix: "shiru" }),
    );
    const bareLocalhost = await handleDocumentRequest(
      new Request("http://localhost:3000/getting-started"),
      createBindings({}),
    );

    expect(missingSite.status).toBe(404);
    expect(missingDocument.status).toBe(404);
    expect(unpublishedSite.status).toBe(404);
    expect(inactiveSite.status).toBe(404);
    expect(bareLocalhost.status).toBe(404);
    await expect(missingDocument.text()).resolves.toBe("Not found");
  });

  it("canonicalizes document paths and renders root and nested documents", async () => {
    const bindings = createBindings({
      [documentKey("index.mdx")]: "---\ntitle: Home\n---\n\n# Home",
      [documentKey("guides/install.mdx")]: "---\ntitle: Install\n---\n\n# Install",
    });

    const root = await handleDocumentRequest(new Request("http://shiru.localhost:3000/"), bindings);
    const nested = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/guides/install"),
      bindings,
    );
    const trailingSlash = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/guides/install/"),
      bindings,
    );

    expect(root.status).toBe(200);
    expect(nested.status).toBe(200);
    expect(trailingSlash.status).toBe(308);
    expect(trailingSlash.headers.get("location")).toBe("/guides/install");
  });

  it("renders metadata, GFM, heading anchors, and safe internal links", async () => {
    const response = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/guides/start"),
      createBindings({
        [documentKey("guides/start.mdx")]: [
          "---",
          "title: Start",
          "description: Learn the basics",
          "---",
          "",
          "# Install",
          "# Install",
          "",
          "| Name | Value |",
          "| --- | --- |",
          "| One | Two |",
          "",
          "- [x] Done",
          "",
          "[Next](../next.mdx?mode=fast#details) [Site](https://example.com)",
        ].join("\n"),
      }),
    );

    const html = await response.text();
    expect(html).toContain("<title>Start</title>");
    expect(html).toContain('content="Learn the basics" name="description"');
    expect(html).toContain('id="install"');
    expect(html).toContain('id="install-1"');
    expect(html).toContain("<table>");
    expect(html).toContain('href="/next?mode=fast#details"');
    expect(html).toContain('href="https://example.com"');
  });

  it.each([
    "---\ntitle: Bad\n---\n\n# Bad\n\n<script>alert(1)</script>",
    "---\ntitle: Bad\n---\n\n# Bad\n\n<Component />",
    "---\ntitle: Bad\n---\n\nimport value from './value'\n\n# Bad",
    "---\ntitle: Bad\n---\n\n# Bad\n\n{value}",
    "---\ntitle: Bad\n---\n\n# Bad\n\n[Unsafe](javascript:alert(1))",
    "# Bad",
  ])("keeps invalid Content-only MDX behind a generic server error", async (source) => {
    const response = await handleDocumentRequest(
      new Request("http://shiru.localhost:3000/getting-started"),
      createBindings({ [documentKey("getting-started.mdx")]: source }),
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Unable to render document");
  });
});
