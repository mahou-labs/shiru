import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

import { LIVE } from "../../../api/src/sites/names";
import type { SiteStatus } from "../../../api/src/sites/site-do";

const POLL_MS = 2000;

/** What the live site serves, plus the draft files a publish would commit. */
export type PublishState = { changes: number; conflicts: number } & (
  | { kind: "unpublished" }
  | { kind: "building"; live: string | null }
  | { kind: "live"; sha: string; atHead: boolean }
  | { kind: "failed"; error: string; live: string | null }
);

export function publishState(status: SiteStatus): PublishState {
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

/** The site's publish state, polled while it builds, and the mutation that publishes it. */
export function usePublish(siteId: string, meta?: { silent?: boolean }) {
  const queryClient = useQueryClient();
  const { data: status } = useQuery({
    ...orpc.sites.status.queryOptions({ input: { siteId } }),
    refetchInterval: (query) =>
      query.state.data?.targets[LIVE]?.kind === "building" ? POLL_MS : false,
  });
  const publish = useMutation({
    ...orpc.sites.publish.mutationOptions(),
    meta,
    // Publishing commits drafts, so the file tree's statuses change along with the site status.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.sites.key() }),
  });
  return { state: status && publishState(status), publish };
}
