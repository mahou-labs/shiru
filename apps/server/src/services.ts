import { createAuth as createConfiguredAuth } from "@shiru/auth";
import { type Database, createDb } from "@shiru/db";

import { ENV } from "./env.server";

export function getDb(): Database {
  return createDb(ENV);
}
export async function createAuth(database?: Database) {
  return createConfiguredAuth(ENV, database ?? (await getDb()));
}
