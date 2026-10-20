import { describe, expect, it } from "vite-plus/test";

import { starterDrafts } from "./starter";

describe("starterDrafts", () => {
  it("writes the doc's name into docs.config.json as a JSON string", () => {
    const config = starterDrafts('Acme {docs} <"beta">', "ada", 3).find(
      (draft) => draft.path === "docs/docs.config.json",
    );
    expect(config?.op === "put" && new TextDecoder().decode(config.content)).toBe(
      '{\n  "version": 1,\n  "name": "Acme {docs} <\\"beta\\">"\n}\n',
    );
  });
});
