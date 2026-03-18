import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/components/editor/editor";

export const Route = createFileRoute("/_app/editor")({
  component: EditorRoute,
});

function EditorRoute() {
  return <Editor />;
}
