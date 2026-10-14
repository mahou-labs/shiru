import { describe, expect, test } from "vite-plus/test";

import type { JsxProp } from "../nodes/props";
import { readTitles, writeTitles } from "./code-group";

const titles = (source: string): JsxProp[] => [
  { name: "titles", value: { kind: "expression", source } },
];

describe("CodeGroup titles", () => {
  test("reads a literal list of strings", () => {
    expect(readTitles(titles('["npm", "pnpm"]'))).toEqual(["npm", "pnpm"]);
  });

  test("reads no titles as an empty list the editor can fill", () => {
    expect(readTitles([])).toEqual([]);
  });

  test("leaves any other expression alone", () => {
    expect(readTitles(titles("labels"))).toBeNull();
    expect(readTitles(titles("[1, 2]"))).toBeNull();
    expect(readTitles([{ name: "titles", value: { kind: "string", value: "npm" } }])).toBeNull();
  });

  test("writes titles as an array expression, and removes the prop when empty", () => {
    expect(writeTitles([], ["JavaScript", 'Say "hi"'])).toEqual(
      titles('["JavaScript","Say \\"hi\\""]'),
    );
    expect(writeTitles(titles('["a"]'), [])).toEqual([]);
  });
});
