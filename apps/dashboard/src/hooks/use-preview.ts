import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

import { DRAFT } from "../../../api/src/docs/names";
import type { DocStatus } from "../../../api/src/docs/doc";

const POLL_MS = 2000;

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

/** The doc's preview state, polled while it builds, the mutation that builds it, and its address. */
export function usePreview(docId: string) {
  const queryClient = useQueryClient();
  const { data: status } = useQuery({
    ...orpc.docs.status.queryOptions({ input: { docId } }),
    refetchInterval: (query) =>
      query.state.data?.targets[DRAFT]?.kind === "building" ? POLL_MS : false,
  });
  const { data: listedUrl } = useQuery({
    ...orpc.docs.list.queryOptions(),
    select: (docs) => docs.find((doc) => doc.id === docId)?.previewUrl,
  });
  const preview = useMutation({
    ...orpc.docs.preview.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: orpc.docs.status.queryKey({ input: { docId } }) }),
  });
  const url = preview.data?.kind === "previewing" ? preview.data.url : listedUrl;
  return {
    state: status && previewState(status),
    empty: status ? !hasContent(status) : true,
    url,
    preview,
  };
}
