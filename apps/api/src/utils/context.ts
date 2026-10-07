import type { Context as HonoContext } from "hono";

import { createAuth } from "./auth";
import { createDb } from "./db";

export async function createContext({ context }: { context: HonoContext }) {
  const db = createDb();
  const session = await createAuth(db).api.getSession({
    headers: context.req.raw.headers,
  });
  return { db, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
