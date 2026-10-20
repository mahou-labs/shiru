import { describe, expect, it } from "vite-plus/test";

import { starterDrafts } from "./starter";

describe("starterDrafts", () => {
  it("names the config and the home page after the doc", () => {
    const named = starterDrafts('Acme {docs} <"beta">', "ada", 3)
      .filter((draft) =>
        ["docs/docs.config.json", "docs/src/content/docs/index.mdx"].includes(draft.path),
      )
      .map((draft) => [
        draft.path,
        draft.op === "put" ? new TextDecoder().decode(draft.content) : null,
      ]);
    expect(named).toEqual([
      ["docs/docs.config.json", '{\n  "version": 1,\n  "name": "Acme {docs} <\\"beta\\">"\n}\n'],
      [
        "docs/src/content/docs/index.mdx",
        '---\ntitle: "Acme {docs} <\\"beta\\">"\n---\n\nStart writing here.\n',
      ],
    ]);
  });
});
