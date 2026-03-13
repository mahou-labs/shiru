import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import type { Context } from "hono";

import { Env } from "..";
import { auth } from "./auth";

export async function createContext(c: Context<Env>) {
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
