import {
  Node,
  mergeAttributes,
  createBlockMarkdownSpec,
  type ReactNodeViewRendererOptions,
} from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutView } from "./callout-view";

export type CalloutType = "info" | "warning" | "danger" | "tip";

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { type?: CalloutType }) => ReturnType;
      toggleCallout: (attrs?: { type?: CalloutType }) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

const calloutMarkdownSpec = createBlockMarkdownSpec({
  nodeName: "callout",
  defaultAttributes: { type: "info" },
  allowedAttributes: ["type"],
  content: "block",
});

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info" satisfies CalloutType,
        parseHTML: (element) => element.getAttribute("data-callout-type") || "info",
        renderHTML: (attributes) => ({
          "data-callout-type": attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout" }), 0];
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) =>
          commands.wrapIn(this.name, attrs),
      toggleCallout:
        (attrs) =>
        ({ commands }) =>
          commands.toggleWrap(this.name, attrs),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { $anchor } = editor.state.selection;
        const isAtStart = $anchor.parentOffset === 0;

        if (!isAtStart || !editor.isActive(this.name)) {
          return false;
        }

        return editor.commands.unsetCallout();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView, {
      contentDOMElementTag: "div",
    } as Partial<ReactNodeViewRendererOptions>);
  },

  // Markdown serialization (:::callout{type="info"} syntax)
  parseMarkdown: calloutMarkdownSpec.parseMarkdown,
  renderMarkdown: calloutMarkdownSpec.renderMarkdown,
  markdownTokenizer: calloutMarkdownSpec.markdownTokenizer,
});
