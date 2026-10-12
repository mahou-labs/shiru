import { Files } from "@cloudflare/sandbox";
import { DurableObject } from "cloudflare:workers";

import {
  BUILD_TIMEOUT_SECONDS,
  type BuildResult,
  isAssetPath,
  manifestResult,
  parseBuildSiteOutput,
  sourceDir,
  sourcePathError,
  type SourceFile,
} from "./protocol";

// Long enough to survive the gap between the Workflow's reset and build steps.
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * One build sandbox, driven over RPC by the PublishWorkflow. The container
 * runs client content, so it holds no credentials: files go in through
 * `reset` and come out through `readAsset`.
 */
export class Builder extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // A restarted object starts without an inactivity timeout, even when its container survived.
    if (ctx.container?.running) {
      void ctx.blockConcurrencyWhile(() =>
        ctx.container!.setInactivityTimeout(INACTIVITY_TIMEOUT_MS),
      );
    }
  }

  /** Starts the container if needed and replaces /work/src with exactly these files. */
  async reset(files: SourceFile[]): Promise<{ ok: true } | { ok: false; errors: string[] }> {
    const errors = files.flatMap(({ path }) => sourcePathError(path) ?? []);
    if (errors.length > 0) return { ok: false, errors };

    const container = this.ctx.container!;
    if (!container.running) {
      container.start({
        image: container.images.builder!,
        entrypoint: ["sleep", "infinity"],
        enableInternet: false,
      });
      await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);
    }

    const dirs = new Set(["/work/src"]);
    for (const { path } of files) {
      const slash = path.lastIndexOf("/");
      if (slash > 0) dirs.add(`/work/src/${path.slice(0, slash)}`);
    }
    await run(container, ["rm", "-rf", "/work"]);
    await run(container, ["mkdir", "-p", ...dirs]);
    const fs = new Files(container);
    for (const { path, content } of files) await fs.writeFile(`/work/src/${path}`, content);
    return { ok: true };
  }

  /** Builds /work/src/<docsRoot> into /work/dist and lists what it wrote. */
  async build({ docUrl, docsRoot }: { docUrl: string; docsRoot: string }): Promise<BuildResult> {
    const src = sourceDir(docsRoot);
    if (typeof src !== "string") return { ok: false, errors: [src.error] };
    const container = this.running();

    const build = await output(
      container,
      [
        "timeout",
        "--kill-after=10",
        String(BUILD_TIMEOUT_SECONDS),
        "build-site",
        src,
        "/work/dist",
      ],
      { SITE_URL: docUrl },
    );
    const doc = parseBuildSiteOutput(build.exitCode, build.stdout, build.stderr);
    if (!doc.ok) return doc;

    const manifest = await output(container, ["dist-manifest", "/work/dist"]);
    return manifestResult(doc.templateVersion, manifest.exitCode, manifest.stdout);
  }

  /** The bytes of one built file, by its manifest path. */
  async readAsset(path: string): Promise<Uint8Array> {
    if (!isAssetPath(path)) throw new Error(`not an asset path: ${path}`);
    // Not Files.readFile: under cf dev (workerd 1.20260930.2) about one call in six never
    // resolved. cat through exec did not hang once in 100 calls.
    const process = await this.running().exec(["cat", `/work/dist${path}`], { stderr: "ignore" });
    const { exitCode, stdout } = await process.output();
    if (exitCode !== 0) throw new Error(`cannot read ${path}: cat exited with code ${exitCode}`);
    return new Uint8Array(stdout);
  }

  private running(): Container {
    const container = this.ctx.container!;
    // A stopped container lost /work; starting a fresh one would build nothing.
    if (!container.running) throw new Error("the build container is not running; call reset first");
    return container;
  }
}

async function output(container: Container, argv: string[], env: Record<string, string> = {}) {
  const process = await container.exec(argv, { env, stdout: "pipe", stderr: "pipe" });
  const { exitCode, stdout, stderr } = await process.output();
  const decoder = new TextDecoder();
  return { exitCode, stdout: decoder.decode(stdout), stderr: decoder.decode(stderr) };
}

async function run(container: Container, argv: string[]) {
  const { exitCode, stderr } = await output(container, argv);
  if (exitCode !== 0) throw new Error(`${argv[0]} exited with code ${exitCode}: ${stderr}`);
}
