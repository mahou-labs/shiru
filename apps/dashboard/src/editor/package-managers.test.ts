import { describe, expect, test } from "vite-plus/test";

import type { JsxProp } from "./nodes/props";
import { packageManagerTabs } from "./package-managers";

const string = (name: string, value: string): JsxProp => ({
  name,
  value: { kind: "string", value },
});

describe("packageManagerTabs", () => {
  test("adds a dev dependency with arguments the way Nimbus's getTabs does", () => {
    expect(
      packageManagerTabs([
        string("pkg", "@acme/cli@2"),
        { name: "dev", value: { kind: "flag" } },
        string("args", "--force"),
      ]),
    ).toEqual([
      { manager: "npm", command: "npm i -D @acme/cli@2 -- --force" },
      { manager: "yarn", command: "yarn add -D @acme/cli@2 --force" },
      { manager: "pnpm", command: "pnpm add -D @acme/cli@2 --force" },
      { manager: "bun", command: "bun add -d @acme/cli@2 --force" },
    ]);
  });

  test("runs a scoped package's bin by its own name under pnpm and yarn", () => {
    expect(
      packageManagerTabs([
        string("pkg", "@cloudflare/nimbus-docs"),
        string("type", "exec"),
        string("args", "add badge"),
      ]),
    ).toEqual([
      { manager: "npm", command: "npx @cloudflare/nimbus-docs add badge" },
      { manager: "yarn", command: "yarn nimbus-docs add badge" },
      { manager: "pnpm", command: "pnpm nimbus-docs add badge" },
      { manager: "bun", command: "bunx @cloudflare/nimbus-docs add badge" },
    ]);
  });

  test("puts the comment above the command and drops the version for yarn create", () => {
    expect(
      packageManagerTabs([
        string("pkg", "astro@latest"),
        string("type", "create"),
        string("comment", "new site"),
      ]),
    ).toEqual([
      { manager: "npm", command: "# new site\nnpm create astro@latest" },
      { manager: "yarn", command: "# new site\nyarn create astro" },
      { manager: "pnpm", command: "# new site\npnpm create astro@latest" },
      { manager: "bun", command: "# new site\nbun create astro@latest" },
    ]);
  });

  test("shows no tabs for a command type Nimbus does not know", () => {
    expect(packageManagerTabs([string("pkg", "x"), string("type", "upgrade")])).toEqual([]);
  });
});
