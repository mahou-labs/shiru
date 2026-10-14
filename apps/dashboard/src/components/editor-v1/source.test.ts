import { getSchema } from "@tiptap/core";
import { describe, expect, test } from "vite-plus/test";

import { sourceDoc, sourceExtensions } from "./source";

const schema = getSchema(sourceExtensions);
const roundTrip = (source: string) => schema.nodeFromJSON(sourceDoc(source)).textContent;

describe("sourceDoc", () => {
  test("keeps a page's source byte for byte", () => {
    const source =
      '---\r\ntitle: Hi\r\n---\n\nimport X from "./x";\n\n<Tabs>\n\t<TabItem label="a">*b*</TabItem>\n</Tabs>\n\n\n';
    expect(roundTrip(source)).toBe(source);
  });

  test("holds an empty page as an empty block", () => {
    expect(sourceDoc("")).toEqual({ type: "doc", content: [{ type: "codeBlock", content: [] }] });
    expect(roundTrip("")).toBe("");
  });
});
