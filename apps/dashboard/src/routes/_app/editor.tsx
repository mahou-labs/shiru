import { createFileRoute } from "@tanstack/react-router";

import { AppShellLayout } from "@/components/app-shell-layout";
import { Editor } from "@/components/editor/editor";
import { EditorSecondarySidebar } from "@/components/editor/editor-secondary-sidebar";
import { secondarySidebarDesktopWidth } from "@/contexts/sidebar-context";

export const Route = createFileRoute("/_app/editor")({
  component: EditorRoute,
});

function EditorRoute() {
  return (
    <AppShellLayout
      secondarySidebar={{
        title: "Workspace",
        kind: "workspace",
        desktopWidth: secondarySidebarDesktopWidth,
        mobileMode: "sheet",
        content: <EditorSecondarySidebar />,
        mobileContent: <EditorSecondarySidebar />,
      }}
    >
      <Editor />
    </AppShellLayout>
  );
}
