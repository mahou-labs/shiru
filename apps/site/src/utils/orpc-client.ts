import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

import type { AppRouterClient } from "../../../api/src/routers/index";

const link = new RPCLink({
  url: `${import.meta.env.PUBLIC_API_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const orpc: AppRouterClient = createORPCClient(link);
