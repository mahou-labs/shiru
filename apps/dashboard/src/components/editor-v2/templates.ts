import type { JSONContent } from "@tiptap/core";

import type { Flavor } from "@/components/editor/pages";

/**
 * A block the slash menu inserts. `content` is plain ProseMirror JSON, so the menu inserts it and
 * the tests serialize it from this one table. Placeholder text is selected on insert, so typing
 * replaces it. Blocks that would serialize to an empty item, such as `- `, carry placeholder text
 * so they read back as the same block.
 */
export type Template = {
  id: string;
  label: string;
  description: string;
  /** More words the menu matches when filtering. */
  keywords: string[];
  /** Nimbus components and raw MDX have no form in a `.md` page. */
  mdxOnly: boolean;
  /** Asks for the image's URL and alt text, which replace the template's own. */
  asksForImage?: true;
  content: JSONContent;
};

const text = (value: string): JSONContent => ({
  type: "paragraph",
  content: [{ type: "text", text: value }],
});

const prop = (name: string, value: string) => ({ name, value: { kind: "string", value } });

const component = (type: string, props: object[], content?: JSONContent[]): JSONContent => ({
  type,
  attrs: { props, layout: "block" },
  ...(content && { content }),
});

const item = (value: string, nested?: JSONContent[]): JSONContent => ({
  type: "listItem",
  content: [text(value), ...(nested ? [{ type: "bulletList", content: nested }] : [])],
});

const accordion = (trigger: string, body: string): JSONContent => ({
  type: "accordion",
  attrs: { props: [], layout: "block" },
  content: [
    { type: "accordionTrigger", attrs: { props: [], layout: "inline" }, content: [text(trigger)] },
    component("accordionContent", [], [text(body)]),
  ],
});

const code = (language: string, value: string): JSONContent => ({
  type: "codeBlock",
  attrs: { language, meta: null },
  content: [{ type: "text", text: value }],
});

const admonition = (
  keyword: string,
  label: string,
  description: string,
  body: string,
): Template => ({
  id: keyword,
  label,
  description,
  keywords: ["admonition", "callout", "aside", keyword],
  mdxOnly: true,
  content: { type: "admonition", attrs: { keyword, title: null }, content: [text(body)] },
});

const cell = (type: "tableHeader" | "tableCell", value?: string): JSONContent => ({
  type,
  content: [value ? text(value) : { type: "paragraph" }],
});

export const TEMPLATES: Template[] = [
  {
    id: "paragraph",
    label: "Text",
    description: "Plain text paragraph",
    keywords: ["paragraph", "plain"],
    mdxOnly: false,
    content: { type: "paragraph" },
  },
  {
    id: "heading1",
    label: "Heading 1",
    description: "Large section heading",
    keywords: ["h1", "title"],
    mdxOnly: false,
    content: { type: "heading", attrs: { level: 1 } },
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium section heading",
    keywords: ["h2", "subtitle"],
    mdxOnly: false,
    content: { type: "heading", attrs: { level: 2 } },
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small section heading",
    keywords: ["h3"],
    mdxOnly: false,
    content: { type: "heading", attrs: { level: 3 } },
  },
  {
    id: "bulletList",
    label: "Bulleted list",
    description: "Unordered list of items",
    keywords: ["ul", "unordered"],
    mdxOnly: false,
    content: {
      type: "bulletList",
      content: [{ type: "listItem", content: [text("List item")] }],
    },
  },
  {
    id: "orderedList",
    label: "Numbered list",
    description: "Ordered list of items",
    keywords: ["ol", "ordered"],
    mdxOnly: false,
    content: {
      type: "orderedList",
      content: [{ type: "listItem", content: [text("List item")] }],
    },
  },
  {
    id: "taskList",
    label: "Task list",
    description: "Checklist with to-dos",
    keywords: ["todo", "checkbox"],
    mdxOnly: false,
    content: {
      type: "taskList",
      content: [{ type: "taskItem", attrs: { checked: false }, content: [text("To do")] }],
    },
  },
  {
    id: "blockquote",
    label: "Quote",
    description: "Highlighted quote block",
    keywords: ["blockquote"],
    mdxOnly: false,
    content: { type: "blockquote", content: [text("Quote")] },
  },
  {
    id: "codeBlock",
    label: "Code block",
    description: "Code with a language and title",
    keywords: ["pre", "fence", "snippet"],
    mdxOnly: false,
    content: { type: "codeBlock" },
  },
  {
    id: "table",
    label: "Table",
    description: "Rows and columns",
    keywords: ["grid", "columns"],
    mdxOnly: false,
    content: {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [cell("tableHeader", "Column"), cell("tableHeader", "Column")],
        },
        { type: "tableRow", content: [cell("tableCell"), cell("tableCell")] },
      ],
    },
  },
  {
    id: "horizontalRule",
    label: "Divider",
    description: "Horizontal separator",
    keywords: ["hr", "rule", "separator"],
    mdxOnly: false,
    content: { type: "horizontalRule" },
  },
  {
    id: "image",
    label: "Image",
    description: "Image from a URL",
    keywords: ["picture", "img", "screenshot"],
    mdxOnly: false,
    asksForImage: true,
    content: {
      type: "paragraph",
      content: [{ type: "image", attrs: { src: "/image.png", alt: "Image" } }],
    },
  },
  admonition("note", "Note", "Callout for extra information", "Add a note."),
  admonition("tip", "Tip", "Callout for helpful advice", "Add a tip."),
  admonition("caution", "Caution", "Callout for possible problems", "Add a caution."),
  admonition("danger", "Danger", "Callout for critical warnings", "Add a warning."),
  {
    id: "tabs",
    label: "Tabs",
    description: "Content switched by tabs",
    keywords: ["tabitem", "switcher"],
    mdxOnly: true,
    content: component(
      "tabs",
      [],
      [
        component("tabItem", [prop("label", "First")], [text("First tab.")]),
        component("tabItem", [prop("label", "Second")], [text("Second tab.")]),
      ],
    ),
  },
  {
    id: "steps",
    label: "Steps",
    description: "Numbered procedure",
    keywords: ["procedure", "numbered", "guide"],
    mdxOnly: true,
    content: component(
      "steps",
      [],
      [
        {
          type: "orderedList",
          content: [
            { type: "listItem", content: [text("First step.")] },
            { type: "listItem", content: [text("Second step.")] },
          ],
        },
      ],
    ),
  },
  {
    id: "cardGrid",
    label: "Card grid",
    description: "Cards side by side",
    keywords: ["cards", "cardgrid", "features"],
    mdxOnly: true,
    content: component(
      "cardGrid",
      [],
      [
        component("card", [prop("title", "First card")], [text("Describe it.")]),
        component("card", [prop("title", "Second card")], [text("Describe it.")]),
      ],
    ),
  },
  {
    id: "packageManagers",
    label: "Package managers",
    description: "Install command for npm, pnpm, yarn and bun",
    keywords: ["npm", "pnpm", "yarn", "bun", "install"],
    mdxOnly: true,
    content: component("packageManagers", [prop("pkg", "package-name")]),
  },
  {
    id: "accordion",
    label: "Accordion",
    description: "A question that opens to its answer",
    keywords: ["collapsible", "disclosure", "details", "faq"],
    mdxOnly: true,
    content: accordion("Question", "Answer."),
  },
  {
    id: "accordionGroup",
    label: "Accordion group",
    description: "Accordions sharing one frame, as for a FAQ",
    keywords: ["faq", "collapsible", "disclosure"],
    mdxOnly: true,
    content: component(
      "accordionGroup",
      [],
      [accordion("First question", "Answer."), accordion("Second question", "Answer.")],
    ),
  },
  {
    id: "codeGroup",
    label: "Code group",
    description: "The same code in several languages, a tab each",
    keywords: ["codegroup", "languages", "tabs", "snippet"],
    mdxOnly: true,
    content: {
      type: "codeGroup",
      attrs: {
        props: [
          { name: "titles", value: { kind: "expression", source: '["JavaScript","Python"]' } },
        ],
        layout: "block",
      },
      content: [code("js", 'console.log("Hello");'), code("py", 'print("Hello")')],
    },
  },
  {
    id: "copyPrompt",
    label: "Copy prompt",
    description: "A prompt readers paste into an AI agent",
    keywords: ["copyprompt", "ai", "agent", "llm"],
    mdxOnly: true,
    content: component("copyPrompt", [prop("text", "Read this page, then help me get started.")]),
  },
  {
    id: "embed",
    label: "Embed",
    description: "A video, map or other page in a frame",
    keywords: ["iframe", "video", "youtube", "loom", "figma"],
    mdxOnly: true,
    content: component("embed", [prop("src", "https://"), prop("title", "Embedded content")]),
  },
  {
    id: "fileTree",
    label: "File tree",
    description: "Folders and files, from a nested list",
    keywords: ["filetree", "directory", "folders", "structure"],
    mdxOnly: true,
    content: component(
      "fileTree",
      [],
      [
        {
          type: "bulletList",
          content: [item("src/", [item("index.ts")]), item("package.json")],
        },
      ],
    ),
  },
  {
    id: "frame",
    label: "Frame",
    description: "A screenshot framed with a caption",
    keywords: ["screenshot", "image", "picture", "caption"],
    mdxOnly: true,
    asksForImage: true,
    content: component(
      "frame",
      [prop("caption", "Caption")],
      [
        {
          type: "paragraph",
          content: [{ type: "image", attrs: { src: "/image.png", alt: "Image" } }],
        },
      ],
    ),
  },
  {
    id: "linkButton",
    label: "Link button",
    description: "A link that looks like a button",
    keywords: ["linkbutton", "cta", "call to action"],
    mdxOnly: true,
    content: {
      type: "linkButton",
      attrs: { props: [prop("href", "/")], layout: "inline" },
      content: [text("Get started")],
    },
  },
  {
    id: "linkCard",
    label: "Link card",
    description: "A card linking to another page",
    keywords: ["linkcard", "next", "related"],
    mdxOnly: true,
    content: component("linkCard", [
      prop("title", "Title"),
      prop("description", "Description"),
      prop("href", "/"),
    ]),
  },
  {
    id: "badge",
    label: "Badge",
    description: "A small label inside the text",
    keywords: ["pill", "tag", "label", "status"],
    mdxOnly: true,
    content: { type: "badge", attrs: { props: [prop("text", "New")] } },
  },
  {
    id: "mdx",
    label: "Raw MDX",
    description: "JSX or an expression, as written",
    keywords: ["jsx", "component", "html", "source"],
    mdxOnly: true,
    content: { type: "mdxBlock", attrs: { source: "" } },
  },
];

/** The templates a page of this flavor offers, best match first. */
export function matchTemplates(flavor: Flavor, query: string): Template[] {
  const needle = query.trim().toLowerCase();
  const offered = TEMPLATES.filter((template) => flavor === "mdx" || !template.mdxOnly);
  if (!needle) return offered;
  const rank = (template: Template) => {
    const label = template.label.toLowerCase();
    if (label.startsWith(needle)) return 0;
    if (label.split(" ").some((word) => word.startsWith(needle))) return 1;
    if (template.keywords.some((word) => word.startsWith(needle))) return 2;
    return label.includes(needle) ? 3 : 4;
  };
  return (
    offered
      .map((template) => ({ template, rank: rank(template) }))
      .filter((entry) => entry.rank < 4)
      // Among labels the query starts, the one it covers most wins, so "tab" finds Tabs before Table.
      .sort(
        (a, b) =>
          a.rank - b.rank || (a.rank === 0 ? a.template.label.length - b.template.label.length : 0),
      )
      .map((entry) => entry.template)
  );
}
