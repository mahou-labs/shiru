import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";

import { auth } from "./auth";

export interface CreateContextInput {
  req: { raw: { headers: Headers } };
}

export async function createContext(c: CreateContextInput) {
  const authSession = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  return {
    headers: c.req.raw.headers,
    session: authSession?.session,
    user: authSession?.user,
  };
}

export type RpcContext = Awaited<ReturnType<typeof createContext>> & ResponseHeadersPluginContext;
