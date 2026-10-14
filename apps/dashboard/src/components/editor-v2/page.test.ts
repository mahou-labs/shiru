import { describe, expect, test } from "vite-plus/test";

import { joinPage, readFields, splitPage, writeFields } from "./page";

describe("splitPage", () => {
  test("separates YAML frontmatter from the body", () => {
    expect(splitPage("---\ntitle: Hello\n---\n\n# Hello\n")).toEqual({
      frontmatter: "---\ntitle: Hello\n---\n",
      body: "\n# Hello\n",
    });
  });

  test("keeps CRLF line endings in both parts", () => {
    expect(splitPage("---\r\ntitle: Hello\r\n---\r\nText\r\n")).toEqual({
      frontmatter: "---\r\ntitle: Hello\r\n---\r\n",
      body: "Text\r\n",
    });
  });

  test("returns the whole source as body without frontmatter", () => {
    expect(splitPage("# Hello\n\n---\n\nmore\n")).toEqual({
      frontmatter: null,
      body: "# Hello\n\n---\n\nmore\n",
    });
  });

  test("handles an empty body with and without a final newline", () => {
    expect(splitPage("---\ntitle: A\n---")).toEqual({
      frontmatter: "---\ntitle: A\n---",
      body: "",
    });
    expect(splitPage("---\ntitle: A\n---\n")).toEqual({
      frontmatter: "---\ntitle: A\n---\n",
      body: "",
    });
  });

  test("reads TOML frontmatter fenced with +++", () => {
    expect(splitPage('+++\ntitle = "A"\n+++\nBody\n')).toEqual({
      frontmatter: '+++\ntitle = "A"\n+++\n',
      body: "Body\n",
    });
  });

  test("ignores an unclosed fence and a fence that does not start the file", () => {
    expect(splitPage("---\ntitle: A\n")).toEqual({ frontmatter: null, body: "---\ntitle: A\n" });
    expect(splitPage("\n---\ntitle: A\n---\n")).toEqual({
      frontmatter: null,
      body: "\n---\ntitle: A\n---\n",
    });
  });

  test("stops at the first closing fence", () => {
    expect(splitPage("---\na: 1\n---\nText\n---\nMore\n")).toEqual({
      frontmatter: "---\na: 1\n---\n",
      body: "Text\n---\nMore\n",
    });
  });

  test("accepts empty frontmatter", () => {
    expect(splitPage("---\n---\nBody")).toEqual({ frontmatter: "---\n---\n", body: "Body" });
  });

  test.each([
    "",
    "---",
    "---\n",
    "---\n---",
    "---\r\n---\r\n",
    "---\ntitle: A\n---",
    "---\r\ntitle: A\r\n---\r\n\r\nBody\r\n",
    "+++\ntitle = 'A'\n+++\nBody",
    "# No frontmatter\r\n",
    "--- \ntitle: A\n---  \nBody",
    "---\ntitle: [unclosed\n---\nBody\n",
  ])("joinPage restores %j", (source) => {
    expect(joinPage(splitPage(source))).toBe(source);
  });
});

describe("readFields", () => {
  test("reads title and description", () => {
    expect(readFields("---\ntitle: Setup\ndescription: Install the CLI\n---\n")).toEqual({
      title: "Setup",
      description: "Install the CLI",
    });
  });

  test("defaults missing keys and missing frontmatter to empty strings", () => {
    expect(readFields("---\nsidebar:\n  order: 2\n---\n")).toEqual({ title: "", description: "" });
    expect(readFields(null)).toEqual({ title: "", description: "" });
    expect(readFields("---\n---\n")).toEqual({ title: "", description: "" });
  });

  test("reads CRLF frontmatter", () => {
    expect(readFields("---\r\ntitle: Setup\r\n---\r\n")).toEqual({
      title: "Setup",
      description: "",
    });
  });

  test("returns null when the fields cannot edit the frontmatter", () => {
    expect(readFields('+++\ntitle = "A"\n+++\n')).toBe(null);
    expect(readFields("---\ntitle: [unclosed\n---\n")).toBe(null);
    expect(readFields("---\n- a list\n---\n")).toBe(null);
    expect(readFields("---\ntitle:\n  en: Hello\n---\n")).toBe(null);
  });
});

describe("writeFields", () => {
  const nimbus = [
    "---",
    "# Shown in the browser tab",
    "title: 'Old title'",
    "sidebar:",
    "  order: 2",
    "  badge: { text: New, variant: tip }",
    "description: Old description",
    "head:",
    "  - tag: meta",
    "    attrs: { name: robots, content: noindex }",
    "---",
    "",
  ].join("\n");

  test("changes only the title, keeping comments, quoting, order and other keys", () => {
    expect(writeFields(nimbus, { title: "New title" })).toBe(
      [
        "---",
        "# Shown in the browser tab",
        "title: 'New title'",
        "sidebar:",
        "  order: 2",
        "  badge: { text: New, variant: tip }",
        "description: Old description",
        "head:",
        "  - tag: meta",
        "    attrs: { name: robots, content: noindex }",
        "---",
        "",
      ].join("\n"),
    );
  });

  test("removes the description when it is cleared", () => {
    expect(
      writeFields("---\ntitle: A\ndescription: B\nbanner: Hi\n---\n", { description: "" }),
    ).toBe("---\ntitle: A\nbanner: Hi\n---\n");
  });

  test("appends a missing key at the end", () => {
    expect(writeFields("---\ntitle: A\n---\n", { description: "About A" })).toBe(
      "---\ntitle: A\ndescription: About A\n---\n",
    );
  });

  test("creates frontmatter for a page without any", () => {
    expect(writeFields(null, { title: "Intro" })).toBe("---\ntitle: Intro\n---\n");
    expect(writeFields("---\n---\n", { title: "Intro" })).toBe("---\ntitle: Intro\n---\n");
    expect(writeFields("---\n---\n", { description: "" })).toBe("---\n---\n");
  });

  test("quotes values YAML would misread and does not fold long ones", () => {
    const long = "word ".repeat(30).trim();
    expect(writeFields("---\ntitle: A\n---\n", { title: "Yes: no #1", description: long })).toBe(
      `---\ntitle: "Yes: no #1"\ndescription: ${long}\n---\n`,
    );
  });

  test("keeps typed text a string that reads back the same", () => {
    expect(writeFields("---\ntitle: A\n---\n", { title: "Hello " })).toBe(
      '---\ntitle: "Hello "\n---\n',
    );
    expect(writeFields("---\ntitle: A\n---\n", { title: "123" })).toBe('---\ntitle: "123"\n---\n');
    expect(writeFields("---\ntitle: A\n---\n", { title: "" })).toBe('---\ntitle: ""\n---\n');
    expect(readFields('---\ntitle: "Hello "\n---\n')).toEqual({ title: "Hello ", description: "" });
  });

  test("keeps CRLF line endings", () => {
    expect(
      writeFields("---\r\ntitle: A\r\nsidebar:\r\n  order: 1\r\n---\r\n", { title: "B" }),
    ).toBe("---\r\ntitle: B\r\nsidebar:\r\n  order: 1\r\n---\r\n");
  });

  test("keeps a closing fence without a newline", () => {
    expect(writeFields("---\ntitle: A\n---", { title: "B" })).toBe("---\ntitle: B\n---");
  });

  test("leaves frontmatter it cannot edit unchanged", () => {
    expect(writeFields('+++\ntitle = "A"\n+++\n', { title: "B" })).toBe('+++\ntitle = "A"\n+++\n');
    expect(writeFields("---\ntitle: [\n---\n", { title: "B" })).toBe("---\ntitle: [\n---\n");
  });

  test("round-trips through splitPage and joinPage", () => {
    const page = splitPage("---\ntitle: A\n---\n\nBody text\n");
    const next = { ...page, frontmatter: writeFields(page.frontmatter, { title: "B" }) };
    expect(joinPage(next)).toBe("---\ntitle: B\n---\n\nBody text\n");
  });
});
