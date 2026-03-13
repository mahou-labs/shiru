import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { AppRouterClient } from "../../../api/src/routers/index";

const getIncomingHeaders = createIsomorphicFn()
  .client(() => ({}))
  .server(() => getRequestHeaders());

const link = new RPCLink({
  url: `${import.meta.env.VITE_API_URL}/rpc`,
  headers: getIncomingHeaders,
  async fetch(url, options) {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = `/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
    }

    return response;
  },
});

const client: AppRouterClient = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
