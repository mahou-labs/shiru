import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/components/editor/editor";
import { EditorSecondarySidebar } from "@/components/editor/editor-secondary-sidebar";
import { useSecondarySidebar } from "@/components/use-secondary-sidebar";
import { secondarySidebarDesktopWidth, type SecondarySidebarConfig } from "@/contexts/sidebar-context";

export const Route = createFileRoute("/_app/editor")({
  component: EditorRoute,
});

function EditorRoute() {
  const secondarySidebar: SecondarySidebarConfig = {
    id: "editor",
    title: "Workspace",
    kind: "workspace",
    desktopWidth: secondarySidebarDesktopWidth,
    mobileMode: "sheet",
    collapsePrimaryByDefault: true,
    content: <EditorSecondarySidebar />,
    mobileContent: <EditorSecondarySidebar />,
  };

  useSecondarySidebar(secondarySidebar);

  return <Editor />;
}
