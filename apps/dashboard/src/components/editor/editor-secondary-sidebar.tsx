const starterOutline = [
  "Welcome to the Editor",
  "Getting started",
  "Formatting",
  "Lists",
  "Code blocks",
  "Blockquotes",
  "Asides",
];

const workspaceFiles = [
  { label: "docs/index.mdx", state: "Editing now" },
  { label: "docs/getting-started.mdx", state: "Suggested next" },
  { label: "snippets/asides.mdx", state: "Reusable block" },
];

const writingAids = [
  {
    detail: "Type / on a new line to insert headings, lists, code blocks, and asides.",
    label: "Slash commands",
  },
  {
    detail: "Select text to open the formatting bubble menu for quick inline edits.",
    label: "Inline formatting",
  },
  {
    detail: "Keep this panel for structure, references, or future AI-assisted writing flows.",
    label: "Writing workspace",
  },
];

export function EditorSecondarySidebar() {
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div>
          <p className="font-medium text-sm text-foreground">Document outline</p>
          <p className="text-muted-foreground text-xs">Keep the page structure visible while you write.</p>
        </div>

        <div className="space-y-1">
          {starterOutline.map((section, index) => (
            <div
              key={section}
              className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
            >
              <span className="truncate font-medium text-sm text-foreground">{section}</span>
              <span className="ml-3 shrink-0 text-muted-foreground text-xs tabular-nums">
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div>
          <p className="font-medium text-sm text-foreground">Workspace files</p>
          <p className="text-muted-foreground text-xs">A second sidebar can switch from navigation to a lightweight file tree.</p>
        </div>

        <div className="space-y-1">
          {workspaceFiles.map((file) => (
            <div
              key={file.label}
              className="rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <p className="truncate font-medium text-sm text-foreground">{file.label}</p>
              <p className="mt-0.5 text-muted-foreground text-xs">{file.state}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div>
          <p className="font-medium text-sm text-foreground">Writing aids</p>
          <p className="text-muted-foreground text-xs">Use this zone for quick guidance, AI actions, or reusable workflow shortcuts.</p>
        </div>

        <div className="space-y-1">
          {writingAids.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2.5"
            >
              <p className="font-medium text-foreground text-sm">{item.label}</p>
              <p className="mt-0.5 text-muted-foreground text-xs">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
