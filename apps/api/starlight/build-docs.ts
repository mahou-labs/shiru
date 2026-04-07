import { join } from "node:path";

import { $ } from "bun";

const log = (msg: string) => console.error(`[starlight] ${msg}`);

async function build() {
  log("Installing dependencies...");
  await $`bun install`.cwd(import.meta.dir).quiet();
  log("Dependencies installed.");

  log("Running astro build...");
  const buildResult = await $`bun run build`.cwd(import.meta.dir).quiet().nothrow();
  if (buildResult.exitCode !== 0) {
    log(`Astro build stderr: ${buildResult.stderr.toString()}`);
    log(`Astro build stdout: ${buildResult.stdout.toString()}`);
    throw new Error(`Astro build failed with exit code ${buildResult.exitCode}`);
  }
  log("Build complete.");

  log("Collecting built files...");
  const glob = new Bun.Glob("**/*");
  const distDir = join(import.meta.dir, "dist");
  const files: { path: string; content: string }[] = [];

  for await (const filePath of glob.scan({ cwd: distDir })) {
    const bytes = await Bun.file(join(distDir, filePath)).arrayBuffer();
    files.push({
      path: filePath,
      content: Buffer.from(bytes).toString("base64"),
    });
  }

  log(`Collected ${files.length} dist files.`);
  process.stdout.write(JSON.stringify({ files }));
}

build().catch((err) => {
  log(`Build failed: ${err}`);
  process.exit(1);
});
