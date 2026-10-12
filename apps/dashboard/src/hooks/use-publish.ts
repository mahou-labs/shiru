import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

import { LIVE } from "../../../api/src/docs/names";
import type { DocStatus } from "../../../api/src/docs/doc";

const POLL_MS = 2000;

/** What the live doc serves, plus the draft files a publish would commit. */
export type PublishState = { changes: number; conflicts: number } & (
  | { kind: "unpublished" }
  | { kind: "building"; live: string | null }
  | { kind: "live"; sha: string; atHead: boolean }
  | { kind: "failed"; error: string; live: string | null }
);

export function publishState(status: DocStatus): PublishState {
  const conflicts = status.drafts.filter((draft) => draft.conflict).length;
  const counts = { changes: status.drafts.length - conflicts, conflicts };
  const target = status.targets[LIVE];
  const live = target?.deployed?.sha ?? null;
  switch (target?.kind) {
    case "building":
      return { ...counts, kind: "building", live };
    case "failed":
      return { ...counts, kind: "failed", error: target.error, live };
    default:
      return live
        ? { ...counts, kind: "live", sha: live, atHead: live === status.headSha }
        : { ...counts, kind: "unpublished" };
  }
}

/** Whether a publish would commit or build anything. A failed build can always be retried. */
export function canPublish(state: PublishState) {
  if (state.kind === "building") return false;
  if (state.kind === "live") return state.changes > 0 || !state.atHead;
  return state.kind === "failed" || state.changes > 0;
}

/** The doc's publish state, polled while it builds, and the mutation that publishes it. */
export function usePublish(docId: string, meta?: { silent?: boolean }) {
  const queryClient = useQueryClient();
  const { data: status } = useQuery({
    ...orpc.docs.status.queryOptions({ input: { docId } }),
    refetchInterval: (query) =>
      query.state.data?.targets[LIVE]?.kind === "building" ? POLL_MS : false,
  });
  const publish = useMutation({
    ...orpc.docs.publish.mutationOptions(),
    meta,
    // Publishing commits drafts, so the file tree's statuses change along with the doc status.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.docs.key() }),
  });
  return { state: status && publishState(status), publish };
}
