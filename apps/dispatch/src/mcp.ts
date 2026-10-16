import { createMcpHandler, McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";

export type DocPage = {
  title: string;
  description: string | null;
  url: string;
  markdownUrl: string;
  markdown: string;
};

export type DocSite = { title: string; pages: DocPage[] };

export type SearchResult = { title: string; heading: string; url: string; excerpt: string };

// Fenced code can start a line with `# `, so a page starts only where this whole header matches.
const PAGE_HEADER = /^# (.+)\n\n(?:> (.+)\n\n)?Source: (\S+) · Markdown: (\S+)$/gm;
const SITE_TITLE = /^# (.+)\n/;

export function parseLlmsFull(text: string): DocSite {
  const headers = [...text.matchAll(PAGE_HEADER)];
  const pages = headers.map((match, i) => {
    const [header = "", title = "", description, url = "", markdownUrl = ""] = match;
    const end = headers[i + 1]?.index ?? text.length;
    return {
      title,
      description: description ?? null,
      url,
      markdownUrl,
      markdown: text.slice(match.index + header.length, end).trim(),
    };
  });
  return { title: SITE_TITLE.exec(text)?.[1] ?? "Documentation", pages };
}

type Section = { page: DocPage; heading: string; url: string; text: string };

const HEADING = /^(#{2,6})\s+(.+?)(?:\s+#+)?\s*$/;
const FENCE = /^\s*(`{3,}|~{3,})/;

function sections(page: DocPage): Section[] {
  const result: Section[] = [];
  const slugs = new Set<string>();
  const preamble = { heading: page.title, url: page.url, lines: [] as string[] };
  let current = preamble;
  let fence: string | null = null;

  // A heading stays searchable even when a sub-heading follows it directly.
  const flush = () => {
    const text = current.lines.join("\n").trim();
    if (text || current !== preamble) {
      result.push({ page, heading: current.heading, url: current.url, text });
    }
  };

  for (const line of page.markdown.split("\n")) {
    const marker = FENCE.exec(line)?.[1];
    if (marker && (fence === null || (marker[0] === fence[0] && marker.length >= fence.length))) {
      fence = fence === null ? marker : null;
    }
    const heading = fence === null ? HEADING.exec(line) : null;
    if (!heading) {
      current.lines.push(line);
      continue;
    }
    flush();
    const title = plainText(heading[2]!);
    current = { heading: title, url: `${page.url}#${slug(title, slugs)}`, lines: [] };
  }
  flush();
  return result;
}

// github-slugger's rules, which the site uses for heading ids.
// Numbered ids count as taken too, so `Install`, `Install-1`, `Install` get `install-2` last.
function slug(heading: string, taken: Set<string>) {
  const base = heading
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
  let id = base;
  for (let n = 1; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

function plainText(markdown: string) {
  return markdown
    .replace(/^\s*(`{3,}|~{3,}).*$/gm, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*`]/g, "")
    .replace(/\\([\\_[\]()#+.!>-])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const EXCERPT_LENGTH = 1000;

function excerpt(text: string, terms: string[]) {
  if (text.length <= EXCERPT_LENGTH) return text;
  const lower = text.toLowerCase();
  const first = Math.min(...terms.map((term) => lower.indexOf(term)).filter((at) => at >= 0));
  const start = Number.isFinite(first) ? Math.max(0, first - 100) : 0;
  const prefix = start > 0 ? "…" : "";
  const room = EXCERPT_LENGTH - prefix.length - 1;
  const body = text.slice(start, start + room);
  return `${prefix}${body}${start + room < text.length ? "…" : ""}`;
}

const WEIGHTS = { title: 3, heading: 2, body: 1 };

export function searchPages(pages: DocPage[], query: string, limit: number): SearchResult[] {
  const terms = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])];
  if (terms.length === 0) return [];

  return pages
    .flatMap(sections)
    .map((section) => {
      const text = plainText(section.text);
      const fields = {
        title: section.page.title.toLowerCase(),
        heading: section.heading.toLowerCase(),
        body: text.toLowerCase(),
      };
      let score = 0;
      for (const term of terms) {
        for (const field of ["title", "heading", "body"] as const) {
          if (fields[field].includes(term)) score += WEIGHTS[field];
        }
      }
      return { section, text, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (a.section.url < b.section.url ? -1 : 1))
    .slice(0, limit)
    .map(({ section, text }) => ({
      title: section.page.title,
      heading: section.heading,
      url: section.url,
      excerpt: excerpt(text, terms),
    }));
}

// `/guides/setup/`, `guides/setup`, `/guides/setup/index.md` and full URLs all name one page.
function pageKey(path: string) {
  const { pathname } = new URL(path, "https://site.invalid/");
  return pathname.replace(/index\.(md|html)$/, "").replace(/\/+$/, "");
}

const json = (value: object): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(value) }],
  structuredContent: value as Record<string, unknown>,
});

const toolError = (text: string): CallToolResult => ({
  isError: true,
  content: [{ type: "text", text }],
});

const NO_CONTENT = "This docs site has no published content right now.";

const PageSummary = z.object({
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  markdownUrl: z.string(),
});

// Same name, input and result as the search tool Nimbus registers in the browser via WebMCP.
const SearchInput = z.strictObject({
  query: z.string().min(1).max(500).regex(/\S/, "Query must not be blank"),
  limit: z.number().int().min(1).max(20).default(5),
});

const SearchOutput = z.object({
  results: z.array(
    z.object({ title: z.string(), heading: z.string(), url: z.string(), excerpt: z.string() }),
  ),
});

// `site` is null when the site's llms-full.txt could not be read.
export function mcpHandler(site: DocSite | null) {
  const name = site?.title ?? "Documentation";
  const readOnlyHint = { readOnlyHint: true };

  return createMcpHandler(
    () => {
      const server = new McpServer(
        { name, version: "1.0.0" },
        {
          instructions: `Read-only access to the ${name} documentation. Use search_documentation to find relevant sections, list_pages to browse every page, and read_page to read one page as markdown.`,
        },
      );

      server.registerTool(
        "list_pages",
        {
          title: "List pages",
          description: `List every page of the ${name} documentation with its URL and markdown URL.`,
          outputSchema: z.object({ pages: z.array(PageSummary) }),
          annotations: readOnlyHint,
        },
        () => {
          if (!site) return toolError(NO_CONTENT);
          return json({
            pages: site.pages.map(({ title, description, url, markdownUrl }) => ({
              title,
              description,
              url,
              markdownUrl,
            })),
          });
        },
      );

      server.registerTool(
        "read_page",
        {
          title: "Read page",
          description: `Read one page of the ${name} documentation as markdown. Pass a site path like /guides/setup/ or a page URL from list_pages or search_documentation.`,
          inputSchema: z.strictObject({ path: z.string() }),
          annotations: readOnlyHint,
        },
        ({ path }) => {
          if (!site) return toolError(NO_CONTENT);
          const key = pageKey(path);
          const page = site.pages.find((candidate) => pageKey(candidate.url) === key);
          if (!page) return toolError(`No page at ${path}. Call list_pages to see every page.`);
          return { content: [{ type: "text", text: `# ${page.title}\n\n${page.markdown}` }] };
        },
      );

      server.registerTool(
        "search_documentation",
        {
          title: "Search documentation",
          description: `Search the ${name} documentation for relevant sections.`,
          inputSchema: SearchInput,
          outputSchema: SearchOutput,
          annotations: readOnlyHint,
        },
        ({ query, limit }) => {
          if (!site) return toolError(NO_CONTENT);
          return json({ results: searchPages(site.pages, query, limit) });
        },
      );

      return server;
    },
    // The default response mode already answers in one JSON body, since no tool sends progress.
    // "json" would log a warning on every request, as this builds a handler per request.
    { legacy: "stateless" },
  );
}
