import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vite-plus/test";
import dispatch from "./index";
import { parseLlmsFull, searchPages } from "./mcp";

// llms-full.txt from a real build of apps/builder/fixtures/good.
const llmsFull = readFileSync(join(import.meta.dirname, "fixtures/llms-full.txt"), "utf8");

const fenced = [
  "# Shell Docs",
  "",
  "Index: https://x.test/llms.txt",
  "",
  "# Shell",
  "",
  "Source: https://x.test/shell/ · Markdown: https://x.test/shell/index.md",
  "",
  "## Comments",
  "",
  "```sh",
  "# Not a page",
  "## Not a heading",
  "echo hi",
  "```",
  "",
  "After the fence.",
].join("\n");

const setup = {
  title: "Setup",
  description: "Install Acme and start it.",
  url: "https://acme.shiru.sh/guides/setup/",
  markdownUrl: "https://acme.shiru.sh/guides/setup/index.md",
  markdown:
    "## Install\n\nInstall the CLI, then go back to the [overview](/).\n\n> **Note**\n>\n> Acme needs Node 24 or later.\n\n![Acme logo](/assets/logo.svg)",
};

describe("parseLlmsFull", () => {
  it("reads the site header and every page in order", () => {
    expect(parseLlmsFull(llmsFull)).toEqual({
      title: "Acme Docs",
      pages: [
        {
          title: "Acme Docs",
          description: "Start here to install and run Acme.",
          url: "https://acme.shiru.sh/",
          markdownUrl: "https://acme.shiru.sh/index.md",
          markdown:
            "Acme turns a config file into a running service. Read the [setup guide](/guides/setup/) first.",
        },
        {
          title: "FAQ",
          description: null,
          url: "https://acme.shiru.sh/guides/faq/",
          markdownUrl: "https://acme.shiru.sh/guides/faq/index.md",
          markdown: "## Does Acme run offline?\n\nYes. See [setup](/guides/setup/#install).",
        },
        setup,
      ],
    });
  });

  it("does not start a page at a fenced line beginning with `# `", () => {
    expect(parseLlmsFull(fenced)).toEqual({
      title: "Shell Docs",
      pages: [
        {
          title: "Shell",
          description: null,
          url: "https://x.test/shell/",
          markdownUrl: "https://x.test/shell/index.md",
          markdown:
            "## Comments\n\n```sh\n# Not a page\n## Not a heading\necho hi\n```\n\nAfter the fence.",
        },
      ],
    });
  });
});

describe("searchPages", () => {
  const { pages } = parseLlmsFull(llmsFull);

  it("ranks matching sections and links to their heading anchors", () => {
    expect(searchPages(pages, "install offline", 5)).toEqual([
      {
        title: "Setup",
        heading: "Install",
        url: "https://acme.shiru.sh/guides/setup/#install",
        excerpt:
          "Install the CLI, then go back to the overview. Note Acme needs Node 24 or later. Acme logo",
      },
      {
        title: "FAQ",
        heading: "Does Acme run offline?",
        url: "https://acme.shiru.sh/guides/faq/#does-acme-run-offline",
        excerpt: "Yes. See setup.",
      },
    ]);
    expect(searchPages(pages, "install offline", 1).map((result) => result.heading)).toEqual([
      "Install",
    ]);
    expect(searchPages(pages, "kubernetes", 5)).toEqual([]);
  });

  it("ignores headings inside fenced code", () => {
    expect(searchPages(parseLlmsFull(fenced).pages, "heading", 5)).toEqual([
      {
        title: "Shell",
        heading: "Comments",
        url: "https://x.test/shell/#comments",
        excerpt: "Not a page Not a heading echo hi After the fence.",
      },
    ]);
  });

  it("numbers duplicate anchors and trims long excerpts around the match", () => {
    const filler = "word ".repeat(300);
    const page = {
      title: "Guide",
      description: null,
      url: "https://x.test/guide/",
      markdownUrl: "https://x.test/guide/index.md",
      markdown: `## What's \`new\`?\n\nNothing.\n\n## What's \`new\`?\n\n${filler}needle ${filler}`,
    };

    expect(searchPages([page], "what", 5).map((result) => result.url)).toEqual([
      "https://x.test/guide/#whats-new",
      "https://x.test/guide/#whats-new-1",
    ]);

    const [hit] = searchPages([page], "needle", 5);
    expect(hit?.excerpt.length).toBe(1000);
    expect(hit?.excerpt.slice(0, 12)).toBe("…word word w");
    expect(hit?.excerpt.slice(101, 107)).toBe("needle");
    expect(hit?.excerpt.at(-1)).toBe("…");
  });
});

describe("mcp endpoint", () => {
  type UserWorker = (request: Request) => Response;

  const workers = new Map<string, UserWorker>([
    [
      "acme",
      (request) => {
        const { pathname } = new URL(request.url);
        if (pathname === "/llms-full.txt") {
          return new Response(llmsFull, { headers: { "content-type": "text/plain" } });
        }
        return new Response(`acme served ${pathname}`);
      },
    ],
    ["down", () => new Response("Internal error", { status: 500 })],
  ]);

  const DISPATCHER = {
    get: (name: string) => ({
      async fetch(request: Request) {
        const worker = workers.get(name);
        if (!worker) throw new Error(`Worker not found: ${name}`);
        return worker(request);
      },
    }),
  } as unknown as DispatchNamespace;

  const env: Env = {
    DISPATCHER,
    DOCS_DOMAIN: "docs.localhost",
    PREVIEW_DOMAIN: "preview.docs.localhost",
  };

  async function connect(slug: string) {
    const client = new Client({ name: "test", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(
      new URL(`https://${slug}.docs.localhost/mcp`),
      { fetch: (input, init) => dispatch.fetch(new Request(input, init), env) },
    );
    await client.connect(transport);
    return client;
  }

  it("names the site and lists three read-only tools", async () => {
    const client = await connect("acme");
    expect(client.getServerVersion()).toEqual({ name: "Acme Docs", version: "1.0.0" });
    expect(client.getInstructions()).toBe(
      "Read-only access to the Acme Docs documentation. Use search_documentation to find relevant sections, list_pages to browse every page, and read_page to read one page as markdown.",
    );

    const { tools } = await client.listTools();
    expect(tools.map(({ name, annotations }) => ({ name, annotations }))).toEqual([
      { name: "list_pages", annotations: { readOnlyHint: true } },
      { name: "read_page", annotations: { readOnlyHint: true } },
      { name: "search_documentation", annotations: { readOnlyHint: true } },
    ]);
    // The same input Nimbus's in-browser search_documentation tool takes.
    expect(tools[2]?.inputSchema).toMatchObject({
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 1, maxLength: 500, pattern: "\\S" },
        limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
      },
    });
  });

  it("lists pages", async () => {
    const client = await connect("acme");
    const pages = [
      {
        title: "Acme Docs",
        description: "Start here to install and run Acme.",
        url: "https://acme.shiru.sh/",
        markdownUrl: "https://acme.shiru.sh/index.md",
      },
      {
        title: "FAQ",
        description: null,
        url: "https://acme.shiru.sh/guides/faq/",
        markdownUrl: "https://acme.shiru.sh/guides/faq/index.md",
      },
      {
        title: "Setup",
        description: "Install Acme and start it.",
        url: "https://acme.shiru.sh/guides/setup/",
        markdownUrl: "https://acme.shiru.sh/guides/setup/index.md",
      },
    ];
    expect(await client.callTool({ name: "list_pages", arguments: {} })).toEqual({
      content: [{ type: "text", text: JSON.stringify({ pages }) }],
      structuredContent: { pages },
    });
  });

  it("reads a page by path or URL", async () => {
    const client = await connect("acme");
    const expected = { content: [{ type: "text", text: `# Setup\n\n${setup.markdown}` }] };
    for (const path of [
      "/guides/setup/",
      "guides/setup",
      "https://acme.shiru.sh/guides/setup/index.md",
      "https://acme.docs.localhost/guides/setup/#install",
    ]) {
      expect(await client.callTool({ name: "read_page", arguments: { path } })).toEqual(expected);
    }
    expect(await client.callTool({ name: "read_page", arguments: { path: "/" } })).toEqual({
      content: [
        {
          type: "text",
          text: "# Acme Docs\n\nAcme turns a config file into a running service. Read the [setup guide](/guides/setup/) first.",
        },
      ],
    });
  });

  it("names list_pages when a page does not exist", async () => {
    const client = await connect("acme");
    expect(await client.callTool({ name: "read_page", arguments: { path: "/nope/" } })).toEqual({
      isError: true,
      content: [{ type: "text", text: "No page at /nope/. Call list_pages to see every page." }],
    });
  });

  it("searches the documentation", async () => {
    const client = await connect("acme");
    const results = [
      {
        title: "FAQ",
        heading: "Does Acme run offline?",
        url: "https://acme.shiru.sh/guides/faq/#does-acme-run-offline",
        excerpt: "Yes. See setup.",
      },
    ];
    expect(
      await client.callTool({ name: "search_documentation", arguments: { query: "offline" } }),
    ).toEqual({
      content: [{ type: "text", text: JSON.stringify({ results }) }],
      structuredContent: { results },
    });
  });

  it("answers tool calls with an error when the site's content cannot be read", async () => {
    const client = await connect("down");
    expect(await client.callTool({ name: "list_pages", arguments: {} })).toEqual({
      isError: true,
      content: [{ type: "text", text: "This docs site has no published content right now." }],
    });
  });

  it("serves 2025-era clients without a session", async () => {
    const response = await dispatch.fetch(
      new Request("https://acme.docs.localhost/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "old", version: "1.0.0" },
          },
        }),
      }),
      env,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("mcp-session-id")).toBe(null);
    const result = {
      protocolVersion: "2025-06-18",
      capabilities: { tools: { listChanged: true } },
      serverInfo: { name: "Acme Docs", version: "1.0.0" },
      instructions:
        "Read-only access to the Acme Docs documentation. Use search_documentation to find relevant sections, list_pages to browse every page, and read_page to read one page as markdown.",
    };
    expect(await response.text()).toBe(
      `event: message\ndata: ${JSON.stringify({ result, jsonrpc: "2.0", id: 1 })}\n\n`,
    );
  });

  it("returns 404 for a slug with no site and leaves /mcp/ to the site", async () => {
    const ghost = await dispatch.fetch(
      new Request("https://ghost.docs.localhost/mcp", { method: "POST" }),
      env,
    );
    expect({ status: ghost.status, body: await ghost.text() }).toEqual({
      status: 404,
      body: "No docs site here",
    });

    const nested = await dispatch.fetch(new Request("https://acme.docs.localhost/mcp/"), env);
    expect(await nested.text()).toBe("acme served /mcp/");
  });
});
