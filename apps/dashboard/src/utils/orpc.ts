import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { toastManager } from "@shiru/ui/components/toast";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { errorMessage } from "@/lib/errors";

import type { AppRouterClient } from "../../../api/src/routers";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { silent?: boolean };
    mutationMeta: { silent?: boolean };
  }
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent) return;
      toastManager.add({
        type: "error",
        title: errorMessage(error),
        actionProps: { children: "Retry", onClick: () => void query.fetch() },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent) return;
      toastManager.add({ type: "error", title: errorMessage(error) });
    },
  }),
});

const link = new RPCLink({
  url: `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/rpc`,
  fetch(url, options) {
    return fetch(url, { ...options, credentials: "include" });
  },
});

const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
