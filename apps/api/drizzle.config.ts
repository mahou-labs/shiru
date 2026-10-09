import { existsSync, readdirSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

const d1Dir = ".cloudflare/state/v3/d1/miniflare-D1DatabaseObject";

// `cf dev` keeps the local D1 database in a single hashed .sqlite file next to Miniflare's metadata.
// Only `push` needs it, so `generate` still works before the database exists.
function localD1Url() {
  const file = existsSync(d1Dir)
    ? readdirSync(d1Dir).find((name) => name.endsWith(".sqlite") && name !== "metadata.sqlite")
    : undefined;
  if (!file && process.argv.includes("push")) {
    throw new Error(`No local D1 database in ${d1Dir}. Run \`vp run dev\` once to create it.`);
  }
  return `file:${d1Dir}/${file}`;
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: localD1Url() },
});
