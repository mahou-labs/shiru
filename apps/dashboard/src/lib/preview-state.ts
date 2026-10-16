import { DRAFT } from "../../../api/src/docs/names";
import type { DocStatus } from "../../../api/src/docs/doc";

/** What the draft target serves. `deployed` is the last preview that built, still served meanwhile. */
export type PreviewState =
  | { kind: "none" }
  | { kind: "building"; deployed: string | null }
  | { kind: "ready"; deployed: string }
  | { kind: "failed"; error: string; deployed: string | null };

export function previewState(status: DocStatus): PreviewState {
  const target = status.targets[DRAFT];
  const deployed = target?.deployed?.sha ?? null;
  switch (target?.kind) {
    case "building":
      return { kind: "building", deployed };
    case "failed":
      return { kind: "failed", error: target.error, deployed };
    default:
      return deployed ? { kind: "ready", deployed } : { kind: "none" };
  }
}

/** A doc with no commit and no drafts has nothing to build. */
export const hasContent = (status: DocStatus) =>
  status.headSha !== null || status.drafts.length > 0;
