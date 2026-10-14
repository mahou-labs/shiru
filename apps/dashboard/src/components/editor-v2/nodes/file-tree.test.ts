import { getSchema } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { describe, expect, test } from "vite-plus/test";

import { createMarked, markdownExtensions, parseBody } from "../markdown";
import { itemKind } from "./file-tree";

const extensions = markdownExtensions("mdx");
const schema = getSchema(extensions);
const manager = new MarkdownManager({ marked: createMarked(), extensions });

function kinds(body: string): [string, string][] {
  const doc = schema.nodeFromJSON(parseBody(manager, body));
  const rows: [string, string][] = [];
  doc.descendants((node) => {
    if (node.type.name === "listItem") rows.push([node.firstChild!.textContent, itemKind(node)]);
    return true;
  });
  return rows;
}

describe("itemKind", () => {
  test("reads FileTree items as Nimbus's script does", () => {
    expect(
      kinds(
        "<FileTree>\n  - src/\n    - **index.ts**\n    - lib\n      - a.ts\n  - ...\n  - …\n</FileTree>\n",
      ),
    ).toEqual([
      ["src/", "folder"],
      ["index.ts", "file"],
      ["lib", "folder"],
      ["a.ts", "file"],
      ["...", "placeholder"],
      ["…", "placeholder"],
    ]);
  });
});
