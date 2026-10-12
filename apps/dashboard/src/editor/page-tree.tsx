import { Button } from "@shiru/ui/components/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@shiru/ui/components/menu";
import { Link } from "@tanstack/react-router";
import {
  IconDotsOutlineDuo18,
  IconFileOutlineDuo18,
  IconFolderOpenOutlineDuo18,
  IconPlusOutlineDuo18,
  IconTrashOutlineDuo18,
} from "nucleo-ui-outline-duo-18";

import type { FileStatus } from "../../../api/src/sites/drafts";
import { isHome, PAGES_ROOT } from "./pages";

export type TreeNode =
  | { kind: "folder"; name: string; children: TreeNode[] }
  | { kind: "page"; name: string; file: FileStatus };

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

type TreeActions = {
  siteId: string;
  current: string | undefined;
  /** Opens the new page dialog for a folder, a path ending in `/`. */
  onCreate: (folder: string) => void;
  onDelete: (file: FileStatus) => void;
};

export function PageTree({ files, ...actions }: TreeActions & { files: FileStatus[] }) {
  return (
    <nav aria-label="Pages" className="text-sm">
      <TreeLevel nodes={buildTree(files)} folder={PAGES_ROOT} depth={0} {...actions} />
    </nav>
  );
}

/** Row controls that show while the row is hovered, focused, or has its menu open. */
const ROW_ACTIONS =
  "absolute inset-y-0 end-1 flex items-center opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 has-data-popup-open:opacity-100";

function TreeLevel({
  nodes,
  folder,
  depth,
  ...actions
}: TreeActions & { nodes: TreeNode[]; folder: string; depth: number }) {
  const { siteId, current, onCreate, onDelete } = actions;
  const indent = { paddingInlineStart: `${0.5 + depth * 1}rem` };
  return (
    <ul className="flex flex-col gap-px">
      {nodes.map((node) =>
        node.kind === "folder" ? (
          <li key={`folder:${node.name}`}>
            <div className="group/row relative">
              <div
                className="flex h-7 items-center gap-2 pe-8 text-muted-foreground"
                style={indent}
              >
                <IconFolderOpenOutlineDuo18 className="size-4 shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
              <div className={ROW_ACTIONS}>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`New page in ${node.name}`}
                  onClick={() => onCreate(`${folder}${node.name}/`)}
                >
                  <IconPlusOutlineDuo18 />
                </Button>
              </div>
            </div>
            <TreeLevel
              nodes={node.children}
              folder={`${folder}${node.name}/`}
              depth={depth + 1}
              {...actions}
            />
          </li>
        ) : (
          <li key={node.file.path} className="group/row relative">
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
            <div className={ROW_ACTIONS}>
              <PageMenu file={node.file} name={node.name} onDelete={onDelete} />
            </div>
          </li>
        ),
      )}
    </ul>
  );
}

function PageMenu({
  file,
  name,
  onDelete,
}: {
  file: FileStatus;
  name: string;
  onDelete: (file: FileStatus) => void;
}) {
  const home = isHome(file.path);
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Actions for ${name}`}
            className="bg-accent"
          />
        }
      >
        <IconDotsOutlineDuo18 />
      </MenuTrigger>
      <MenuPopup align="start" className="max-w-64">
        <MenuItem variant="destructive" disabled={home} onClick={() => onDelete(file)}>
          <IconTrashOutlineDuo18 />
          Delete
        </MenuItem>
        {home && (
          <p className="px-2 pt-0.5 pb-1.5 text-muted-foreground text-xs">
            This is the home page. The site cannot build without it.
          </p>
        )}
      </MenuPopup>
    </Menu>
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
