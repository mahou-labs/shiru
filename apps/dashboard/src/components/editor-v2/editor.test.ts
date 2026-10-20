import { readFileSync } from "node:fs";

import { describe, expect, test } from "vite-plus/test";

/** The `--nb-*` declarations of the first rule `selector` opens in `css`. */
function tokens(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("\n}", start));
  const pairs = [...body.matchAll(/(--nb-[\w-]+):\s*([^;]+);/g)];
  // The formatter lowercases hex colors, which CSS reads the same either way.
  return Object.fromEntries(
    pairs.map(([, name, value]) => [name, value.split(/\s+/).join(" ").toLowerCase()]),
  );
}

const site = readFileSync(
  new URL("../../../../../packages/site-template/src/styles/globals.css", import.meta.url),
  "utf8",
);
const editor = readFileSync(new URL("./editor.css", import.meta.url), "utf8");

describe("editor.css", () => {
  test("uses the site template's light tokens", () => {
    const light = tokens(site, ":root");
    expect(Object.keys(light).length).toBeGreaterThan(40);
    expect(tokens(editor, ".docs-content")).toEqual(light);
  });

  test("uses the site template's dark tokens under the dashboard's dark class", () => {
    const dark = tokens(site, '[data-mode="dark"]');
    expect(Object.keys(dark).length).toBeGreaterThan(20);
    expect(tokens(editor, ".dark .docs-content")).toEqual(dark);
  });
});
