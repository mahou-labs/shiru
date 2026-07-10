import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export default function buildTestWorker() {
  const environment = { ...process.env };
  delete environment.VITEST;

  execFileSync("vp", ["build"], {
    cwd: fileURLToPath(new URL(".", import.meta.url)),
    env: environment,
    stdio: "inherit",
  });
}
