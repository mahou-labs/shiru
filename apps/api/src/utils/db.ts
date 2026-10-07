import { env } from "cloudflare:workers";
import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../schema";

const relations = {
  ...defineRelations(schema),
  ...schema.authRelations,
};

export function createDb() {
  return drizzle({ client: postgres(env.DATABASE_URL, { max: 1 }), relations });
}

export type Database = ReturnType<typeof createDb>;
