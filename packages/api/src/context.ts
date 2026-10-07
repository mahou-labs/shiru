import type { Session } from "@shiru/auth";
import type { Database } from "@shiru/db";

export type Context = {
  session: Session | null;
  db: Database;
};
