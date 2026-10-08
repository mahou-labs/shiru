import type { Context as HonoContext } from "hono";

import { auth } from "./auth";

export async function createContext({ context }: { context: HonoContext }) {
  const headers = context.req.raw.headers;
  return { headers, auth: await auth.api.getSession({ headers }) };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
