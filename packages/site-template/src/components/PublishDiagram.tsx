import { DiagramStage } from "@/components/react/diagram";
import { createScene } from "@/components/react/diagram/scene";

type Node = "edit" | "preview" | "publish" | "live";
type Edge = "edit-preview" | "preview-publish" | "publish-live";

const Scene = createScene<Node, Edge>({
  label: "From an edit to the live site",
  steps: [
    { id: "edit", hold: 1200 },
    { id: "edit-preview", hold: 600 },
    { id: "preview", hold: 1200 },
    { id: "preview-publish", hold: 600 },
    { id: "publish", hold: 1200 },
    { id: "publish-live", hold: 600 },
    { id: "live", hold: 1600 },
  ],
  active: {
    edit: { node: "edit" },
    "edit-preview": { edge: "edit-preview" },
    preview: { node: "preview" },
    "preview-publish": { edge: "preview-publish" },
    publish: { node: "publish" },
    "publish-live": { edge: "publish-live" },
    live: { node: "live" },
  },
  edges: [
    { id: "edit-preview", from: ["edit", "right"], to: ["preview", "left"] },
    { id: "preview-publish", from: ["preview", "right"], to: ["publish", "left"] },
    { id: "publish-live", from: ["publish", "right"], to: ["live", "left"] },
  ],
  layout: ({ node }) => (
    <div className="flex items-center justify-between gap-6">
      {node("edit", "Edit")}
      {node("preview", "Preview", { ghost: true })}
      {node("publish", "Publish")}
      {node("live", "Live site")}
    </div>
  ),
});

export default function PublishDiagram() {
  return (
    <DiagramStage className="my-6">
      <Scene />
    </DiagramStage>
  );
}
