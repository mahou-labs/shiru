import { readFileSync } from "node:fs";

import { getSchema, type JSONContent } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { markdownToMdast, mdxToMdast } from "satteri";
import { describe, expect, test } from "vite-plus/test";

import {
  createMarked,
  flavorOf,
  getProp,
  getStringProp,
  markdownExtensions,
  parseBody,
  setProp,
  type Flavor,
  type JsxProp,
} from "./markdown";

function codec(flavor: Flavor) {
  const manager = new MarkdownManager({
    marked: createMarked(),
    extensions: markdownExtensions(flavor),
  });
  const schema = getSchema(markdownExtensions(flavor));
  return {
    parse: (body: string) => parseBody(manager, body),
    serialize: (doc: JSONContent) => manager.serialize(doc),
    check: (doc: JSONContent) => schema.nodeFromJSON(doc).check(),
  };
}

const codecs = { md: codec("md"), mdx: codec("mdx") };

/** The mdast Nimbus builds from a body, without positions, to compare meaning across rewrites. */
function nimbusTree(flavor: Flavor, body: string): unknown {
  const features = {
    gfm: true,
    smartPunctuation: true,
    headingAttributes: true,
    directive: flavor === "mdx",
  };
  const compile = flavor === "mdx" ? mdxToMdast : markdownToMdast;
  const strip = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(strip);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "position")
        .map(([key, child]) => [key, strip(child)]),
    );
  };
  return strip(compile(body, { features }));
}

function roundTrip(flavor: Flavor, body: string) {
  const { parse, serialize, check } = codecs[flavor];
  const doc = parse(body);
  check(doc);
  return { doc, out: serialize(doc) };
}

const nimbusPage = [
  "",
  'import { Icon } from "./_components/Icon.tsx";',
  "",
  "Shiru turns a **Git repository** into a docs site. Read the [quick start](./start.mdx) first.",
  "",
  ":::tip[Before you start]",
  "You need a GitHub account and `git` 2.40 or later.",
  ":::",
  "",
  "## Install {#install}",
  "",
  '<Tabs syncKey="pkg">',
  '  <TabItem label="npm">',
  '    ```sh title="Terminal"',
  "    npm install shiru",
  "    ```",
  "  </TabItem>",
  '  <TabItem label="pnpm">',
  '    ```sh title="Terminal"',
  "    pnpm add shiru",
  "    ```",
  "  </TabItem>",
  "</Tabs>",
  "",
  '<PackageManagers pkg="shiru" dev />',
  "",
  "## Configure",
  "",
  "<Steps>",
  "  1. Create `docs.config.json`:",
  "",
  "     ```json {2}",
  "     {",
  '       "title": "Acme"',
  "     }",
  "     ```",
  "",
  "  2. Commit the file.",
  "",
  '     <Aside type="caution">Pushes to `main` publish the site.</Aside>',
  "",
  "  3. Open the dashboard.",
  "</Steps>",
  "",
  "| Option | Default | Notes |",
  "| :--- | :---: | --- |",
  '| `title` | `"Docs"` | Shown in the header |',
  "| `base` | `/` | Use `{base}/docs` for subpaths |",
  "",
  "<CardGrid>",
  '  <Card title="Fast" icon="rocket">',
  "    Builds finish in seconds[^1].",
  "  </Card>",
  '  <Card title="Simple" icon="star">',
  '    One file, no plugins. <Icon name="check" />',
  "  </Card>",
  "</CardGrid>",
  "",
  "{/* TODO: add a video */}",
  "",
  "- [x] Markdown",
  "- [ ] Search",
  "",
  "[^1]: Measured on a 200-page site.",
  "",
].join("\n");

const fixtures = new URL("../../../builder/fixtures/", import.meta.url);

function fixtureBody(path: string): string {
  const source = readFileSync(new URL(path, fixtures), "utf8");
  return source.replace(/^---\n[\s\S]*?\n---\n/, "");
}

describe("flavorOf", () => {
  test("maps page extensions to flavors", () => {
    expect(flavorOf("docs/content/index.mdx")).toBe("mdx");
    expect(flavorOf("docs/content/guide.md")).toBe("md");
    expect(flavorOf("docs/content/data.json")).toBe(null);
  });
});

describe("round trip", () => {
  test.each([
    "good/content/index.mdx",
    "good/content/guides/faq.mdx",
    "good/content/guides/setup.mdx",
    "mdx-features/content/index.mdx",
    "mdx-features/content/_note.mdx",
  ])("keeps the builder fixture %s byte for byte", (path) => {
    const body = fixtureBody(path);
    expect(body.startsWith("\n")).toBe(true);
    expect(roundTrip("mdx", body).out).toBe(body);
  });

  const canonical: [string, Flavor, string][] = [
    ["headings with attributes", "mdx", "# Title {#install}\n\n## Plain heading\n"],
    [
      "inline marks",
      "mdx",
      'Some *em*, **strong**, ~~gone~~, `code {x} <b>` and [a link](./page.mdx "Title").\n',
    ],
    ["MDX escapes", "mdx", "Escaped \\{braces\\}, \\<tags> and 6 * 7 with snake_case.\n"],
    [
      "block openers in text",
      "mdx",
      "\\# not a heading\n\n\\- not a list\n\n1\\. not a list\n\n\\:::note\n",
    ],
    ["hard break", "mdx", "First line\\\nsecond line\n"],
    ["soft break", "mdx", "First line\nsecond line\n"],
    ["lists", "mdx", "- a\n- b\n  - nested\n\n1. one\n2. two\n"],
    ["loose list with code", "mdx", "1. Install\n\n   ```sh\n   npm i\n   ```\n\n2. Run\n"],
    ["ordered list start", "mdx", "3. three\n4. four\n"],
    ["list markers", "mdx", "* star\n* bullets\n\n1) paren\n2) delimiters\n"],
    ["loose list with hugging nested list", "mdx", "- a\n  - nested\n\n- b\n"],
    ["spread item in a tight list", "mdx", "- a\n- b\n\n  ```json\n  {}\n  ```\n"],
    ["code spans under different marks", "mdx", "**`fromA`**`: number` and `static ` and (` `)\n"],
    ["task list", "mdx", "- [ ] todo\n- [x] done\n"],
    ["table", "mdx", "| Name | Value |\n| :--- | ---: |\n| `a` | 1 \\| 2 |\n"],
    [
      "images",
      "mdx",
      '![Logo](/logo.svg "The logo")\n\nInline ![icon](/i.png) and [![badge](/b.svg)](https://x.com).\n',
    ],
    ["code meta", "mdx", '```ts title="a.ts" {1,3-5} ins={2} wrap\nconst a = 1;\n```\n'],
    ["empty code block", "mdx", "```sh\n```\n"],
    ["blockquote", "mdx", "> Quoted\n>\n> > nested\n"],
    ["footnotes", "mdx", "Text with a note[^1].\n\n[^1]: The note.\n\n    A second paragraph.\n"],
    ["thematic break", "mdx", "Above\n\n---\n\nBelow\n"],
    [
      "imports, exports and expressions",
      "mdx",
      'import Note from "./_note.mdx";\nexport const answer = 6 * 7;\n\nThe answer is {answer}.\n\n{/* a comment */}\n',
    ],
    ["admonitions", "mdx", ":::note\nPlain.\n:::\n\n:::caution[Heads up]\nCareful.\n:::\n"],
    ["nested admonitions", "mdx", "::::tip\nOuter.\n\n:::danger\nInner.\n:::\n::::\n"],
    ["Aside on one line", "mdx", '<Aside type="note">One line.</Aside>\n'],
    [
      "Aside as a block",
      "mdx",
      '<Aside type="caution" title="Careful">\n  First.\n\n  - a\n  - b\n</Aside>\n',
    ],
    [
      "Tabs",
      "mdx",
      '<Tabs syncKey="pm">\n  <TabItem label="npm">\n    ```sh\n    npm i shiru\n    ```\n  </TabItem>\n  <TabItem label="pnpm">\n    <Aside type="tip">Nested.</Aside>\n  </TabItem>\n</Tabs>\n',
    ],
    [
      "CardGrid",
      "mdx",
      '<CardGrid>\n  <Card title="Fast" icon="rocket">\n    Builds in seconds.\n  </Card>\n  <Card title="Simple">\n    One file.\n  </Card>\n</CardGrid>\n',
    ],
    ["Steps around a list", "mdx", "<Steps>\n  1. Install\n  2. Run\n</Steps>\n"],
    [
      "Steps with Step children",
      "mdx",
      '<Steps start={3}>\n  <Step title="One">\n    Do it.\n  </Step>\n  <Step>\n    Done.\n  </Step>\n</Steps>\n',
    ],
    ["PackageManagers", "mdx", '<PackageManagers pkg="shiru" type="add" dev />\n'],
    [
      "inline JSX and expressions",
      "mdx",
      'Status <Badge text="new" /> and **<Badge text="bold" />** with {props.count} items.\n',
    ],
    ["unknown component", "mdx", "<Callout label={`Computed ${answer}`}>\n  Body.\n</Callout>\n"],
    [
      "components that do not fit the registry",
      "mdx",
      '<TabItem label="orphan">\n  Alone.\n</TabItem>\n\n<Tabs>\n  Not an item.\n</Tabs>\n\n<Aside {...props}>\n  Spread.\n</Aside>\n',
    ],
    ["named entities", "mdx", "Copyright &copy; 2026 and&nbsp;more.\n"],
    ["no trailing newline", "mdx", "Last line"],
    ["CRLF line endings", "mdx", "\r\n# Title\r\n\r\n- a\r\n- b\r\n"],
    [
      "raw HTML in Markdown",
      "md",
      '# Title {#id}\n\nSome <kbd>Ctrl</kbd> and {braces} stay.\n\n<div align="center">\n  html\n</div>\n\n<!-- comment -->\n',
    ],
    ["autolinks", "md", "<https://x.com> and https://y.com/a_b~c\n"],
    ["directives are text in Markdown", "md", "\\# not a heading\n\n:::note\n"],
  ];

  test.each(canonical)("keeps %s byte for byte", (_, flavor, body) => {
    expect(roundTrip(flavor, body).out).toBe(body);
    expect(() => nimbusTree(flavor, body)).not.toThrow();
  });

  const rewritten: [string, Flavor, string, string][] = [
    ["underscore emphasis", "mdx", "_em_ and __strong__\n", "*em* and **strong**\n"],
    ["setext heading", "mdx", "Setext\n======\n", "# Setext\n"],
    ["closing hashes", "mdx", "# Closed #\n", "# Closed\n"],
    ["two-space hard break", "mdx", "one  \ntwo\n", "one\\\ntwo\n"],
    [
      "single-quoted prop",
      "mdx",
      "<Aside type='note'>Quoted.</Aside>\n",
      '<Aside type="note">Quoted.</Aside>\n',
    ],
    [
      "JSX interrupting a paragraph",
      "mdx",
      "text\n<Aside>\n  Next.\n</Aside>\n",
      "text\n\n<Aside>\n  Next.\n</Aside>\n",
    ],
    ["character references", "mdx", "x &lt; y &amp; z\n", "x < y & z\n"],
    ["tilde fence", "mdx", "~~~js\ncode\n~~~\n", "```js\ncode\n```\n"],
    ["extra blank lines", "mdx", "One\n\n\n\nTwo\n", "One\n\nTwo\n"],
    ["long admonition fence", "mdx", "::::note\nOnly.\n::::\n", ":::note\nOnly.\n:::\n"],
    [
      "flush component children",
      "mdx",
      '<Tabs>\n<TabItem label="a">\nFlush.\n</TabItem>\n</Tabs>\n',
      '<Tabs>\n  <TabItem label="a">\n    Flush.\n  </TabItem>\n</Tabs>\n',
    ],
    [
      "padded table",
      "mdx",
      "| a | b |\n|---|:-:|\n| 1 | 2 |\n",
      "| a | b |\n| --- | :---: |\n| 1 | 2 |\n",
    ],
    ["intraword asterisk", "mdx", "2*3\n", "2\\*3\n"],
  ];

  test.each(rewritten)(
    "rewrites %s to the canonical form with the same meaning",
    (_, flavor, input, expected) => {
      const { doc, out } = roundTrip(flavor, input);
      expect(out).toBe(expected);
      expect(codecs[flavor].parse(out)).toEqual(doc);
      expect(nimbusTree(flavor, out)).toEqual(nimbusTree(flavor, input));
    },
  );
});

describe("structure", () => {
  const { parse } = codecs.mdx;

  test("a full Nimbus page keeps every block structured and byte for byte", () => {
    const { doc, out } = roundTrip("mdx", nimbusPage);
    expect(out).toBe(nimbusPage);
    expect(doc.content!.map((node) => node.type)).toEqual([
      "mdxBlock",
      "paragraph",
      "admonition",
      "heading",
      "tabs",
      "packageManagers",
      "heading",
      "steps",
      "table",
      "cardGrid",
      "mdxBlock",
      "taskList",
      "footnoteDefinition",
    ]);
    const step = doc.content![7].content![0].content![1];
    expect(step.content!.map((node) => node.type)).toEqual(["paragraph", "aside"]);
    expect(() => nimbusTree("mdx", nimbusPage)).not.toThrow();
  });

  test("Tabs hold TabItems whose props keep their kind and order", () => {
    const doc = parse(
      '<Tabs syncKey="pm">\n  <TabItem label="npm" icon={icons.npm} default>\n    Run it.\n  </TabItem>\n</Tabs>\n',
    );
    expect(doc.content).toEqual([
      {
        type: "tabs",
        attrs: {
          props: [{ name: "syncKey", value: { kind: "string", value: "pm" } }],
          layout: "block",
        },
        content: [
          {
            type: "tabItem",
            attrs: {
              props: [
                { name: "label", value: { kind: "string", value: "npm" } },
                { name: "icon", value: { kind: "expression", source: "icons.npm" } },
                { name: "default", value: { kind: "flag" } },
              ],
              layout: "block",
            },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Run it." }] }],
          },
        ],
      },
    ]);
  });

  test("an Aside written on one line keeps its inline layout", () => {
    expect(parse('<Aside type="note">Acme needs Node 24.</Aside>\n').content).toEqual([
      {
        type: "aside",
        attrs: {
          props: [{ name: "type", value: { kind: "string", value: "note" } }],
          layout: "inline",
        },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Acme needs Node 24." }] }],
      },
    ]);
  });

  test("admonitions keep the keyword and the title", () => {
    expect(parse(":::caution[Heads up]\nCareful.\n:::\n\n:::note\nPlain.\n:::\n").content).toEqual([
      {
        type: "admonition",
        attrs: { keyword: "caution", title: "Heads up" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Careful." }] }],
      },
      {
        type: "admonition",
        attrs: { keyword: "note", title: null },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Plain." }] }],
      },
    ]);
  });

  test("markup the schema cannot hold stays verbatim in mdxBlock", () => {
    const doc = parse(
      'import X from "./x";\n\n<TabItem label="orphan">\n  Alone.\n</TabItem>\n\n<Tabs>\n  Not an item.\n</Tabs>\n\n:::custom\nUnknown.\n:::\n\n<Aside />\n',
    );
    expect(doc.content).toEqual([
      { type: "mdxBlock", attrs: { source: 'import X from "./x";' } },
      { type: "mdxBlock", attrs: { source: '<TabItem label="orphan">\n  Alone.\n</TabItem>' } },
      { type: "mdxBlock", attrs: { source: "<Tabs>\n  Not an item.\n</Tabs>" } },
      { type: "mdxBlock", attrs: { source: ":::custom\nUnknown.\n:::" } },
      { type: "mdxBlock", attrs: { source: "<Aside />" } },
    ]);
  });

  test("inline JSX and expressions become mdxInline atoms that keep their marks", () => {
    expect(parse('A **<Badge text="x" />** and {count}.\n').content).toEqual([
      {
        type: "paragraph",
        content: [
          { type: "text", text: "A " },
          { type: "mdxInline", attrs: { source: '<Badge text="x" />' }, marks: [{ type: "bold" }] },
          { type: "text", text: " and " },
          { type: "mdxInline", attrs: { source: "{count}" } },
          { type: "text", text: "." },
        ],
      },
    ]);
  });

  test("code blocks split the language from the meta", () => {
    expect(parse('```ts title="a.ts" {1}\nx\n```\n').content).toEqual([
      {
        type: "codeBlock",
        attrs: { language: "ts", meta: 'title="a.ts" {1}' },
        content: [{ type: "text", text: "x" }],
      },
    ]);
  });

  test("headings keep their attribute block apart from the text", () => {
    expect(parse("## Install {#setup}\n").content).toEqual([
      {
        type: "heading",
        attrs: { level: 2, attributes: "#setup" },
        content: [{ type: "text", text: "Install" }],
      },
    ]);
  });

  test("the body's surrounding whitespace lives on the document", () => {
    expect(parse("\nText\n").attrs).toEqual({ leading: "\n", trailing: "\n", lineEnding: "\n" });
    expect(parse("Text\r\n\r\n").attrs).toEqual({
      leading: "",
      trailing: "\n\n",
      lineEnding: "\r\n",
    });
  });

  test("Markdown pages have no MDX nodes and keep HTML raw", () => {
    const nodes = Object.keys(getSchema(markdownExtensions("md")).nodes);
    for (const name of ["mdxBlock", "mdxInline", "admonition", "aside", "tabs", "tabItem"]) {
      expect(nodes).not.toContain(name);
    }
    expect(
      codecs.md.parse('<div align="center">\n  x\n</div>\n\nPress <kbd>K</kbd>.\n').content,
    ).toEqual([
      { type: "htmlBlock", attrs: { source: '<div align="center">\n  x\n</div>' } },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Press " },
          { type: "htmlInline", attrs: { source: "<kbd>K</kbd>" } },
          { type: "text", text: "." },
        ],
      },
    ]);
  });
});

describe("escaping text typed in the editor", () => {
  const paragraph = (text: string): JSONContent => ({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });

  const nimbusText = (flavor: Flavor, body: string) => {
    const tree = nimbusTree(flavor, body) as { children: { children: { value: string }[] }[] };
    return tree.children[0].children.map((child) => child.value).join("");
  };

  test.each([
    ["mdx", "use {x} and <b>", "use \\{x\\} and \\<b>\n"],
    ["md", "use {x} and <b>", "use {x} and \\<b>\n"],
    ["mdx", "a < b and 6 * 7 and snake_case", "a < b and 6 * 7 and snake_case\n"],
    [
      "mdx",
      "2*3 and _private and ~/home and `tick`",
      "2\\*3 and \\_private and \\~/home and \\`tick\\`\n",
    ],
    [
      "mdx",
      "[not a link](x) and &amp; and C:\\path\\",
      "\\[not a link\\](x) and \\&amp; and C:\\path\\\\\n",
    ],
    ["mdx", "# not a heading", "\\# not a heading\n"],
    ["mdx", "- not a list", "\\- not a list\n"],
    ["mdx", "1. not a list", "1\\. not a list\n"],
    ["mdx", ":::note not a directive", "\\:::note not a directive\n"],
    ["mdx", "import is a word here", "&#105;mport is a word here\n"],
    ["md", "import is a word here", "import is a word here\n"],
  ] as [Flavor, string, string][])("%s text %j serializes to %j", (flavor, text, expected) => {
    const { parse, serialize } = codecs[flavor];
    const body = serialize(paragraph(text));
    expect(body).toBe(expected);
    expect(parse(body).content).toEqual(paragraph(text).content);
    expect(nimbusText(flavor, body)).toBe(text);
  });

  test("a pipe in a table cell is escaped", () => {
    const cell = (type: string, text: string) => ({
      type,
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    });
    const doc = {
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            { type: "tableRow", content: [cell("tableHeader", "a|b")] },
            { type: "tableRow", content: [cell("tableCell", "c")] },
          ],
        },
      ],
    };
    expect(codecs.mdx.serialize(doc)).toBe("| a\\|b |\n| --- |\n| c |\n");
  });

  test("empty paragraphs from the editor leave no blank lines behind", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "One" }] },
        { type: "paragraph" },
        { type: "paragraph" },
        { type: "paragraph", content: [{ type: "text", text: "Two" }] },
        { type: "paragraph" },
      ],
    };
    expect(codecs.mdx.serialize(doc)).toBe("One\n\nTwo\n");
  });
});

describe("prop helpers", () => {
  const props: JsxProp[] = [
    { name: "label", value: { kind: "string", value: "npm" } },
    { name: "icon", value: { kind: "expression", source: "icons.npm" } },
  ];

  test("read a prop by name", () => {
    expect(getProp(props, "icon")).toEqual({ kind: "expression", source: "icons.npm" });
    expect(getProp(props, "missing")).toBe(undefined);
    expect(getStringProp(props, "label")).toBe("npm");
    expect(getStringProp(props, "icon")).toBe(null);
  });

  test("set a prop in place, append a new one and remove one", () => {
    expect(setProp(props, "label", { kind: "string", value: "pnpm" })).toEqual([
      { name: "label", value: { kind: "string", value: "pnpm" } },
      props[1],
    ]);
    expect(setProp(props, "default", { kind: "flag" })).toEqual([
      ...props,
      { name: "default", value: { kind: "flag" } },
    ]);
    expect(setProp(props, "label", null)).toEqual([props[1]]);
  });

  test("an edited prop serializes in place", () => {
    const { parse, serialize } = codecs.mdx;
    const doc = parse('<Aside type="note" title="Old">Text.</Aside>\n');
    const aside = doc.content![0];
    aside.attrs = {
      ...aside.attrs,
      props: setProp(aside.attrs!.props, "title", { kind: "string", value: 'Say "hi"' }),
    };
    expect(serialize(doc)).toBe('<Aside type="note" title=\'Say "hi"\'>Text.</Aside>\n');
  });
});
