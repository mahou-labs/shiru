import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { hasContent, previewState } from "@/lib/preview-state";
import { orpc } from "@/utils/orpc";

import { DRAFT } from "../../../api/src/docs/names";

const POLL_MS = 2000;

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
