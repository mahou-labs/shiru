export interface DocHeading {
  id: string;
  depth: 2 | 3;
  text: string;
}

export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
}

export interface DocMetadata {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  description?: string;
  order: number;
  contentHash: string;
  updatedAt: string;
}

export interface CompiledDocArtifact {
  siteId: string;
  slug: string;
  contentHash: string;
  frontmatter: DocFrontmatter;
  html: string;
  headings: DocHeading[];
}

export interface SidebarItem {
  title: string;
  href: string;
  order: number;
  children: SidebarItem[];
}

export interface DocsManifest {
  siteId: string;
  siteVersion: string;
  generatedAt: string;
  items: SidebarItem[];
  pages: Record<string, DocMetadata>;
}

export interface PublishDocumentInput {
  siteId: string;
  slug: string;
  mdx: string;
}

export interface PublishDocumentResult {
  siteId: string;
  slug: string;
  docId: string;
  siteVersion: string;
  contentHash: string;
}
