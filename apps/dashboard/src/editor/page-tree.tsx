import { Link } from "@tanstack/react-router";
import { IconFileOutlineDuo18, IconFolderOpenOutlineDuo18 } from "nucleo-ui-outline-duo-18";

import type { FileStatus } from "../../../api/src/sites/drafts";

export type TreeNode =
  | { kind: "folder"; name: string; children: TreeNode[] }
  | { kind: "page"; name: string; file: FileStatus };

const PAGES_ROOT = "content/";

/** Pages nested by folder, with `content/` left out because every page lives there. */
export function buildTree(files: FileStatus[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const shown = file.path.startsWith(PAGES_ROOT) ? file.path.slice(PAGES_ROOT.length) : file.path;
    const segments = shown.split("/");
    let level = root;
    for (const segment of segments.slice(0, -1)) {
      let folder = level.find((node) => node.kind === "folder" && node.name === segment);
      if (!folder) {
        folder = { kind: "folder", name: segment, children: [] };
        level.push(folder);
      }
      level = (folder as Extract<TreeNode, { kind: "folder" }>).children;
    }
    level.push({ kind: "page", name: segments.at(-1)!.replace(/\.mdx?$/, ""), file });
  }
  return sortTree(root);
}

/** The index page first, then pages, then folders, each alphabetical. */
function sortTree(nodes: TreeNode[]): TreeNode[] {
  const rank = (node: TreeNode) => (node.kind === "folder" ? 2 : node.name === "index" ? 0 : 1);
  return nodes
    .map((node) => (node.kind === "folder" ? { ...node, children: sortTree(node.children) } : node))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

export function PageTree({
  siteId,
  files,
  current,
}: {
  siteId: string;
  files: FileStatus[];
  current: string | undefined;
}) {
  return (
    <nav aria-label="Pages" className="text-sm">
      <TreeLevel nodes={buildTree(files)} siteId={siteId} current={current} depth={0} />
    </nav>
  );
}

function TreeLevel({
  nodes,
  siteId,
  current,
  depth,
}: {
  nodes: TreeNode[];
  siteId: string;
  current: string | undefined;
  depth: number;
}) {
  const indent = { paddingInlineStart: `${0.5 + depth * 1}rem` };
  return (
    <ul className="flex flex-col gap-px">
      {nodes.map((node) =>
        node.kind === "folder" ? (
          <li key={`folder:${node.name}`}>
            <div className="flex h-7 items-center gap-2 pe-2 text-muted-foreground" style={indent}>
              <IconFolderOpenOutlineDuo18 className="size-4 shrink-0" />
              <span className="truncate">{node.name}</span>
            </div>
            <TreeLevel nodes={node.children} siteId={siteId} current={current} depth={depth + 1} />
          </li>
        ) : (
          <li key={node.file.path}>
            <Link
              to="/sites/$siteId/editor"
              params={{ siteId }}
              search={{ path: node.file.path }}
              aria-current={node.file.path === current ? "page" : undefined}
              title={node.file.path}
              className="flex h-7 items-center gap-2 rounded-md pe-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium"
              style={indent}
            >
              <IconFileOutlineDuo18 className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{node.name}</span>
              <FileMark file={node.file} />
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

function FileMark({ file }: { file: FileStatus }) {
  if (file.conflict) {
    return (
      <span className="ms-auto shrink-0 font-medium text-warning-foreground text-xs">Conflict</span>
    );
  }
  if (file.status === "added" || file.status === "modified") {
    const label = file.status === "added" ? "New draft" : "Edited";
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={`ms-auto size-1.5 shrink-0 rounded-full ${file.status === "added" ? "bg-success" : "bg-info"}`}
      />
    );
  }
  return null;
}
