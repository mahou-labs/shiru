import GithubSlugger from "github-slugger";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

type DocsSiteRecord = {
  activeCommitSha: string;
  storagePrefix: string;
};

type DocumentObject = {
  size: number;
  text(): Promise<string>;
};

export type DocsBindings = {
  DOCS_KV: {
    get(key: string): Promise<string | null>;
  };
  DOCS_SOURCE: {
    get(key: string): Promise<DocumentObject | null>;
  };
};

export type RenderedDocument = {
  content: React.ReactNode;
  description?: string;
  title: string;
};

export const documentComponents = {};

const siteSubdomain = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const documentPathSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const maximumDocumentBytes = 1024 * 1024;
const unsafeMdxNodeTypes = new Set([
  "html",
  "mdxFlowExpression",
  "mdxTextExpression",
  "mdxjsEsm",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
]);
const externalProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

export class NotFoundError extends Error {}
export class InvalidDocumentError extends Error {}

export class CanonicalRedirect extends Error {
  constructor(readonly location: string) {
    super(location);
  }
}

export async function loadDocument(
  request: Request,
  bindings: DocsBindings,
  documentPath?: string,
): Promise<RenderedDocument> {
  const url = new URL(request.url);
  const subdomain = getSiteSubdomain(url.hostname);
  if (!subdomain) {
    throw new NotFoundError();
  }

  const sourcePath =
    documentPath === undefined ? getSourcePath(url) : getSourcePathForDocumentPath(documentPath);
  const site = await getSiteRecord(bindings, subdomain);
  const object = await bindings.DOCS_SOURCE.get(
    `${site.storagePrefix}/${site.activeCommitSha}/${sourcePath}`,
  );
  if (!object) {
    throw new NotFoundError();
  }
  if (object.size > maximumDocumentBytes) {
    throw new InvalidDocumentError("Document source exceeds the supported size");
  }

  return renderDocument(await object.text(), sourcePath);
}

function getSiteSubdomain(hostname: string) {
  const localSuffix = ".localhost";
  const productionSuffix = ".shiru.sh";
  const suffix = hostname.endsWith(localSuffix)
    ? localSuffix
    : hostname.endsWith(productionSuffix)
      ? productionSuffix
      : null;
  if (!suffix) {
    return null;
  }

  const subdomain = hostname.slice(0, -suffix.length);
  return siteSubdomain.test(subdomain) ? subdomain : null;
}

function getSourcePath(url: URL) {
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    throw new CanonicalRedirect(`${url.pathname.slice(0, -1)}${url.search}`);
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    throw new NotFoundError();
  }

  return getSourcePathForDocumentPath(pathname.slice(1));
}

function getSourcePathForDocumentPath(path: string) {
  if (path === "") {
    return "index.mdx";
  }

  if (!isDocumentPath(path)) {
    throw new NotFoundError();
  }

  return `${path}.mdx`;
}

function isDocumentPath(path: string) {
  return path.split("/").every((segment) => documentPathSegment.test(segment));
}

async function getSiteRecord(bindings: DocsBindings, subdomain: string): Promise<DocsSiteRecord> {
  const value = await bindings.DOCS_KV.get(`docs:site:${subdomain}`);
  if (!value) {
    throw new NotFoundError();
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("activeCommitSha" in parsed) ||
      !("storagePrefix" in parsed) ||
      typeof parsed.activeCommitSha !== "string" ||
      typeof parsed.storagePrefix !== "string" ||
      !parsed.storagePrefix
    ) {
      throw new InvalidDocumentError("Invalid site registry record");
    }
    if (!parsed.activeCommitSha) {
      throw new NotFoundError();
    }
    return {
      activeCommitSha: parsed.activeCommitSha,
      storagePrefix: parsed.storagePrefix,
    };
  } catch (error) {
    if (error instanceof InvalidDocumentError || error instanceof NotFoundError) {
      throw error;
    }
    throw new InvalidDocumentError("Invalid site registry record");
  }
}

function renderDocument(source: string, sourcePath: string): RenderedDocument {
  const { content, metadata } = parseDocumentMetadata(source);
  const processor = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).use(remarkRehype);
  const markdownTree = processor.parse(content);

  visit(markdownTree, (node) => {
    if (unsafeMdxNodeTypes.has(node.type)) {
      throw new InvalidDocumentError("Unsupported Content-only MDX syntax");
    }
  });

  const hastTree = processor.runSync(markdownTree);
  const slugger = new GithubSlugger();

  visit(hastTree, "element", (node) => {
    if (/^h[1-6]$/.test(node.tagName)) {
      node.properties.id = slugger.slug(getTextContent(node));
    }
    if (node.tagName === "a" && typeof node.properties.href === "string") {
      node.properties.href = rewriteDocumentLink(node.properties.href, sourcePath);
    }
  });

  return {
    content: toJsxRuntime(hastTree, { Fragment, components: documentComponents, jsx, jsxs }),
    description: metadata.description,
    title: metadata.title,
  };
}

function parseDocumentMetadata(source: string) {
  const match = /^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(source);
  if (!match) {
    throw new InvalidDocumentError("Missing Document Metadata");
  }

  const parsed: unknown = parseYaml(match[1]);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !("title" in parsed)) {
    throw new InvalidDocumentError("Invalid Document Metadata");
  }

  const title = parsed.title;
  const description = "description" in parsed ? parsed.description : undefined;
  if (typeof title !== "string" || !title.trim()) {
    throw new InvalidDocumentError("Invalid Document Metadata title");
  }
  if (description !== undefined && typeof description !== "string") {
    throw new InvalidDocumentError("Invalid Document Metadata description");
  }

  return {
    content: source.slice(match[0].length),
    metadata: { description, title },
  };
}

function getTextContent(node: unknown): string {
  if (!node || typeof node !== "object" || !("children" in node) || !Array.isArray(node.children)) {
    return "";
  }

  return node.children
    .map((child) => {
      if (!child || typeof child !== "object") {
        return "";
      }
      if ("value" in child && typeof child.value === "string") {
        return child.value;
      }
      return getTextContent(child);
    })
    .join("");
}

function rewriteDocumentLink(href: string, sourcePath: string) {
  if (href.startsWith("#") || href.startsWith("?")) {
    return href;
  }
  if (href.startsWith("//")) {
    throw new InvalidDocumentError("Unsupported link protocol");
  }

  const protocolMatch = /^[a-z][a-z0-9+.-]*:/i.exec(href);
  if (protocolMatch) {
    const protocol = protocolMatch[0].toLowerCase();
    if (!externalProtocols.has(protocol)) {
      throw new InvalidDocumentError("Unsupported link protocol");
    }
    return href;
  }

  const resolved = new URL(href, `https://docs.invalid/${sourcePath}`);
  if (!resolved.pathname.endsWith(".mdx")) {
    return href;
  }

  const documentPath = resolved.pathname.slice(1, -".mdx".length);
  if (!isDocumentPath(documentPath)) {
    throw new InvalidDocumentError("Invalid Internal Document Link");
  }

  const publicPath = documentPath === "index" ? "/" : `/${documentPath}`;
  return `${publicPath}${resolved.search}${resolved.hash}`;
}

export function DocumentArticle({ document }: { document: RenderedDocument }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="prose prose-slate max-w-none">{document.content}</article>
    </main>
  );
}
