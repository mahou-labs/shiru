import { execSync } from "node:child_process";

import { defineConfig } from "drizzle-kit";

const getSqlitePath = () => {
  try {
    return execSync(
      'find ../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject -type f -name "*.sqlite" -print -quit',
      { encoding: "utf-8" },
    ).trim();
  } catch (e) {
    // oxlint-disable-next-line no-console
    console.error("Failed to find SQLite database file", e);
    return "";
  }
};

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema/*",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: getSqlitePath(),
  },
});
