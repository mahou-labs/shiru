import type { DocMetadata, DocsManifest, SidebarItem } from "./types";

export function buildManifest(
  siteId: string,
  siteVersion: string,
  docs: DocMetadata[],
): DocsManifest {
  const pages = Object.fromEntries(docs.map((doc) => [doc.slug, doc]));
  const items: SidebarItem[] = [];

  for (const doc of [...docs].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))) {
    insertSidebarItem(items, doc);
  }

  return {
    siteId,
    siteVersion,
    generatedAt: new Date().toISOString(),
    items,
    pages,
  };
}

function insertSidebarItem(items: SidebarItem[], doc: DocMetadata) {
  const segments = doc.slug === "index" ? ["index"] : doc.slug.split("/");
  let siblings = items;
  let href = "";

  for (const [index, segment] of segments.entries()) {
    const isLeaf = index === segments.length - 1;
    href = segment === "index" ? "/" : `${href}/${segment}`;
    const title = isLeaf ? doc.title : titleFromSegment(segment);
    let item = siblings.find((candidate) => candidate.href === href);

    if (!item) {
      item = { title, href, order: doc.order, children: [] };
      siblings.push(item);
      siblings.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    }

    if (isLeaf) {
      item.title = doc.title;
      item.order = doc.order;
    }

    siblings = item.children;
  }
}

function titleFromSegment(segment: string) {
  return segment
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
