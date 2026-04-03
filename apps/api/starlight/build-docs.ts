import { $ } from "bun";

const log = (msg: string) => console.error(`[starlight] ${msg}`);

async function build() {
  log("Starting build...");

  log("Installing dependencies...");
  await $`bun install`.cwd(import.meta.dir).quiet();
  log("Dependencies installed.");

  log("Running astro build...");
  await $`bun run build`.cwd(import.meta.dir).quiet();
  log("Build complete.");

  log("Collecting built files...");
  const glob = new Bun.Glob("**/*");
  const distDir = `${import.meta.dir}/dist`;
  const files: { path: string; content: string }[] = [];

  for await (const filePath of glob.scan({ cwd: distDir })) {
    const bytes = await Bun.file(`${distDir}/${filePath}`).arrayBuffer();
    files.push({
      path: filePath,
      content: Buffer.from(bytes).toString("base64"),
    });
  }

  log(`Collected ${files.length} files.`);

  // JSON manifest to stdout — worker parses this
  process.stdout.write(JSON.stringify({ files }));
}

build().catch((err) => {
  log(`Build failed: ${err}`);
  process.exit(1);
});
