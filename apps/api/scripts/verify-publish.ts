// Publishes a doc end to end on this machine: the real HTTP API, the Doc, a commit to the
// shiru-staging Artifacts namespace, the PublishWorkflow and the Builder container, then reads the
// built pages back through /dev/docs and through the dispatch Worker. Needs Docker, the cf CLI
// signed in, git, and apps/api/.env.
//
// Usage: node scripts/verify-publish.ts [--port 3010] [--dispatch-port 3013] [--state <dir>]
// It starts its own `cf dev` on --port with state in --state (a new temp dir by default) and its
// own dispatch Worker on --dispatch-port, so the usual dev servers and their database are left
// alone. It deletes the repos it created and stops the servers and the containers it started.
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    port: { type: "string", default: "3010" },
    "dispatch-port": { type: "string", default: "3013" },
    state: { type: "string" },
  },
});
const api = path.resolve(import.meta.dirname, "..");
const base = `http://localhost:${args.port}`;
const state = args.state ?? mkdtempSync(path.join(tmpdir(), "verify-publish-"));
const NAMESPACE = "shiru-staging";
const DASHBOARD = "http://localhost:3001";
const BUILD_TIMEOUT_MS = 3 * 60 * 1000;
const run = Date.now().toString(36);

let passed = 0;
let failed = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`PASS ${label}`);
    passed++;
  } else {
    console.log(`FAIL ${label}\n  expected: ${e}\n  actual:   ${a}`);
    failed++;
  }
}

const cf = (...argv: string[]) =>
  JSON.parse(execFileSync("npx", ["cf", ...argv], { cwd: api, encoding: "utf8" }));
const containers = () =>
  new Set(
    execFileSync("docker", ["ps", "-q", "--filter", "name=workerd-shiru-api"], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean),
  );

// The server's output, for the verification email and the Doc's stale-ref log line.
let log = "";
const containersBefore = containers();
const server = spawn("npx", ["varlock", "run", "--", "npx", "cf", "dev", "--persist-to", state], {
  cwd: api,
  env: { ...process.env, API_PORT: args.port },
  detached: true,
});
server.stdout.on("data", (chunk) => (log += chunk));
server.stderr.on("data", (chunk) => (log += chunk));
const repos: string[] = [];
let dispatch: ReturnType<typeof spawn> | undefined;

async function waitFor<T>(what: string, timeoutMs: number, probe: () => Promise<T | undefined>) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await probe().catch(() => undefined);
    if (value !== undefined) return value;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`timed out waiting for ${what}`);
}

const cookies = new Map<string, string>();
async function request(route: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("origin", DASHBOARD);
  headers.set("content-type", "application/json");
  headers.set("cookie", [...cookies].map(([name, value]) => `${name}=${value}`).join("; "));
  const response = await fetch(`${base}${route}`, { ...init, headers, redirect: "manual" });
  for (const cookie of response.headers.getSetCookie()) {
    const [pair = ""] = cookie.split(";");
    const [name = "", value = ""] = pair.split("=");
    if (value) cookies.set(name, value);
  }
  return response;
}
const post = (route: string, body: unknown) =>
  request(route, { method: "POST", body: JSON.stringify(body) });
async function rpc<T>(procedure: string, input: unknown): Promise<T> {
  const response = await post(`/rpc/${procedure}`, { json: input });
  const body = (await response.json()) as { json: T };
  if (!response.ok) throw new Error(`${procedure}: ${response.status} ${JSON.stringify(body)}`);
  return body.json;
}

type Status = {
  headSha: string | null;
  targets: { live?: { kind: string; deployed: { sha: string } | null; error?: string } };
  runs: {
    live?: {
      sha: string;
      steps: { queued?: number; preparing?: number; building?: number };
      ended: { at: number; ok: boolean } | null;
    };
  };
  drafts: { path: string; op: string; conflict: boolean; updatedAt: number; updatedBy: string }[];
};

/** Waits for live to serve head; `since` is when the publish request was sent. */
async function waitForLive(docId: string, since = performance.now()) {
  const status = await waitFor("the live build", BUILD_TIMEOUT_MS, async () => {
    const status = await rpc<Status>("docs/status", { docId });
    const live = status.targets.live;
    if (live?.kind === "failed") throw new Error(`build failed: ${live.error}`);
    return live?.kind === "idle" && live.deployed?.sha === status.headSha ? status : undefined;
  });
  return { status, seconds: (performance.now() - since) / 1000 };
}

async function page(docPath: string) {
  const response = await fetch(`${base}/dev/docs/${slug}${docPath}`, { redirect: "manual" });
  return {
    status: response.status,
    type: response.headers.get("content-type"),
    location: response.headers.get("location"),
    text: await response.text(),
  };
}

function remoteHead(repo: string, limit = 1) {
  return cf(
    "artifacts",
    "namespaces",
    "repos",
    "logs",
    "get",
    repo,
    "--namespace",
    NAMESPACE,
    "--limit",
    String(limit),
  ) as { hash: string; parents: string[] }[];
}

/** Commits with the git CLI straight to the repo, as a developer holding a repo token would. */
function pushOutOfBand(repo: string, files: Record<string, string>) {
  const { remote } = cf(
    "artifacts",
    "namespaces",
    "repos",
    "get",
    repo,
    "--namespace",
    NAMESPACE,
  ) as { remote: string };
  const { plaintext } = cf(
    "artifacts",
    "namespaces",
    "tokens",
    "create",
    NAMESPACE,
    "--repo",
    repo,
    "--scope",
    "write",
    "--ttl",
    "600",
  ) as { plaintext: string };
  const dir = mkdtempSync(path.join(tmpdir(), "verify-publish-git-"));
  const git = (...argv: string[]) =>
    execFileSync(
      "git",
      [
        "-c",
        `http.extraHeader=Authorization: Bearer ${plaintext}`,
        "-c",
        "protocol.version=1",
        ...argv,
      ],
      { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
  git("clone", "--quiet", remote, ".");
  for (const [file, content] of Object.entries(files)) writeFileSync(path.join(dir, file), content);
  git("add", "-A");
  git(
    "-c",
    "user.name=Out of band",
    "-c",
    "user.email=oob@mailinator.com",
    "commit",
    "--quiet",
    "-m",
    "edit outside the editor",
  );
  git("push", "--quiet", "origin", "HEAD:main");
  return git("rev-parse", "HEAD");
}

let slug = `verify-${run}`;
try {
  // The first start builds the builder image, which can take minutes.
  await waitFor("cf dev", 600_000, async () => ((await fetch(base)).ok ? true : undefined));

  const { result: databases } = (await (
    await fetch(`${base}/cdn-cgi/local/explorer/api/d1/database`)
  ).json()) as { result: { uuid: string }[] };
  const migrations = readdirSync(path.join(api, "drizzle")).sort();
  for (const migration of migrations) {
    const sql = readFileSync(path.join(api, "drizzle", migration, "migration.sql"), "utf8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      const response = await fetch(
        `${base}/cdn-cgi/local/explorer/api/d1/database/${databases[0]!.uuid}/raw`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sql: statement }),
        },
      );
      const result = await response.text();
      // A rerun against the same --state finds the tables already there.
      if (!response.ok && !/already exists|duplicate column/.test(result)) {
        throw new Error(`migration ${migration} failed: ${result}`);
      }
    }
  }

  const email = `verify-publish-${run}@mailinator.com`;
  await post("/auth/sign-up/email", {
    email,
    password: "password123",
    name: "Verify Publish",
    callbackURL: `${DASHBOARD}/dashboard`,
  });
  // The simulated EMAIL binding logs the path of each message's text body.
  const link = await waitFor("the verification email", 30_000, async () => {
    const file = log.match(/Text: (\S+)/)?.[1];
    return file && readFileSync(file, "utf8").match(/http:\/\/localhost:3000\/auth\/[^\s)]+/)?.[0];
  });
  const verify = new URL(link);
  await request(verify.pathname + verify.search);
  const organization = (await (
    await post("/auth/organization/create", { name: `Verify ${run}`, slug: `verify-${run}` })
  ).json()) as { id: string };
  await post("/auth/organization/set-active", { organizationId: organization.id });
  const doc = await rpc<{ id: string; slug: string }>("docs/create", {
    slug,
    name: "Verify Docs",
    visibility: "public",
  });
  slug = doc.slug;
  repos.push(doc.id);
  const docId = doc.id;

  const tree = await rpc<{ files: { path: string; status: string }[] }>("docs/files/tree", {
    docId,
  });
  check("a new doc starts with a config and a home page", tree.files, [
    { path: "content/index.mdx", status: "added", conflict: false },
    { path: "docs.config.json", status: "added", conflict: false },
  ]);

  await rpc("docs/files/save", {
    docId,
    path: "content/index.mdx",
    content: "---\ntitle: Verify Docs\n---\n\nThe home page says hello.\n",
  });
  await rpc("docs/files/save", {
    docId,
    path: "content/guides/setup.mdx",
    content: "---\ntitle: Setup\n---\n\nInstall the verify tool first.\n",
  });

  const firstStart = performance.now();
  const published = await rpc<{ kind: string; sha: string }>("docs/publish", { docId });
  check("first publish commits", published.kind, "published");
  const first = await waitForLive(docId, firstStart);
  console.log(`publish to live (measured here): ${first.seconds.toFixed(1)}s`);
  check("live is built from the head commit", first.status.headSha, published.sha);
  check("Artifacts head matches the Doc head", remoteHead(docId)[0]?.hash, published.sha);
  const liveRun = first.status.runs.live;
  const times = [
    liveRun?.steps.queued,
    liveRun?.steps.preparing,
    liveRun?.steps.building,
    liveRun?.ended?.at,
  ];
  check(
    "the run records every step in order and ends ok",
    [
      liveRun?.sha,
      liveRun?.ended?.ok,
      times.every((at, i) => typeof at === "number" && (i === 0 || at >= times[i - 1]!)),
    ],
    [published.sha, true, true],
  );

  const home = await page("/");
  check(
    "home page has the saved text",
    [home.status, home.type, home.text.includes("The home page says hello.")],
    [200, "text/html; charset=utf-8", true],
  );
  dispatch = spawn("npx", ["cf", "dev"], {
    cwd: path.resolve(api, "../dispatch"),
    env: { ...process.env, DISPATCH_PORT: args["dispatch-port"], DEV_DOCS_ORIGIN: base },
    detached: true,
    stdio: "ignore",
  });
  const docsHome = `http://${slug}.docs.localhost:${args["dispatch-port"]}/`;
  const viaDispatch = await waitFor("the dispatch Worker", 120_000, async () => {
    const response = await fetch(docsHome, { redirect: "manual" });
    return response.ok ? { status: response.status, text: await response.text() } : undefined;
  });
  check(
    "the dispatch Worker serves the home page on the doc's subdomain",
    [viaDispatch.status, viaDispatch.text.includes("The home page says hello.")],
    [200, true],
  );

  const setup = await page("/guides/setup/");
  check(
    "setup page has the saved text",
    [setup.status, setup.text.includes("Install the verify tool first.")],
    [200, true],
  );
  const markdown = await page("/guides/setup/index.md");
  check(
    "setup page as Markdown",
    [markdown.status, markdown.text.includes("Install the verify tool first.")],
    [200, true],
  );
  const bare = await page("/guides/setup");
  check(
    "a page without its trailing slash redirects relatively",
    [bare.status, bare.location],
    [307, "setup/"],
  );

  const outOfBand = pushOutOfBand(docId, {
    "docs/content/index.mdx": "---\ntitle: Verify Docs\n---\n\nChanged outside the editor.\n",
    "docs/content/extra.mdx": "---\ntitle: Extra\n---\n\nAdded outside the editor.\n",
  });
  await rpc("docs/files/save", {
    docId,
    path: "content/index.mdx",
    content: "---\ntitle: Verify Docs\n---\n\nEdited in the editor.\n",
  });
  await rpc("docs/files/save", {
    docId,
    path: "content/new.mdx",
    content: "---\ntitle: New\n---\n\nA new page.\n",
  });
  const logBefore = log.length;
  const afterStale = await rpc<{ kind: string; sha: string; skipped: string[] }>("docs/publish", {
    docId,
  });
  check(
    "a publish after an outside push commits what does not conflict",
    [afterStale.kind, afterStale.skipped],
    ["published", ["content/index.mdx"]],
  );
  check(
    "the publish saw the stale ref and retried",
    log.slice(logBefore).includes("(stale ref); refreshing"),
    true,
  );
  check("the retried commit sits on the outside commit", remoteHead(docId)[0]?.parents, [
    outOfBand,
  ]);
  const conflicted = await rpc<Status>("docs/status", { docId });
  check("the editor's edit of the changed page is a conflict", conflicted.drafts, [
    {
      path: "content/index.mdx",
      op: "put",
      conflict: true,
      updatedAt: conflicted.drafts[0]?.updatedAt,
      updatedBy: email,
    },
  ]);
  await waitForLive(docId);
  check(
    "the outside page is live",
    (await page("/extra/")).text.includes("Added outside the editor."),
    true,
  );
  check("the new page is live", (await page("/new/")).text.includes("A new page."), true);

  await rpc("docs/files/discard", { docId, path: "content/index.mdx" });
  await rpc("docs/files/save", {
    docId,
    path: "content/index.mdx",
    content: "---\ntitle: Verify Docs\n---\n\nThe second version.\n",
  });
  await rpc("docs/files/delete", { docId, path: "content/guides/setup.mdx" });
  const secondStart = performance.now();
  const second = await rpc<{ kind: string; sha: string }>("docs/publish", { docId });
  check("head moved", [second.kind, second.sha !== afterStale.sha], ["published", true]);
  const secondLive = await waitForLive(docId, secondStart);
  console.log(`second publish to live (measured here): ${secondLive.seconds.toFixed(1)}s`);
  check("Artifacts head matches after the second publish", remoteHead(docId)[0]?.hash, second.sha);
  check(
    "the edited home page is live",
    (await page("/")).text.includes("The second version."),
    true,
  );
  const gone = await page("/guides/setup/");
  check(
    "the deleted page is gone, answered by the built 404 page",
    [gone.status, gone.type, gone.text.includes("<html")],
    [404, "text/html; charset=utf-8", true],
  );
} catch (error) {
  console.log(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  failed++;
} finally {
  if (failed > 0) {
    const logs = await fetch(`${base}/cdn-cgi/local/explorer/api/local/observability/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sql: "SELECT level, message FROM logs WHERE level IN ('error', 'warn') ORDER BY rowid DESC LIMIT 5",
      }),
    })
      .then((response) => response.text())
      .catch(() => "unavailable");
    console.log(`server errors: ${logs}`);
  }
  for (const repo of repos) {
    try {
      execFileSync(
        "npx",
        [
          "cf",
          "artifacts",
          "namespaces",
          "repos",
          "delete",
          repo,
          "--namespace",
          NAMESPACE,
          "--force",
        ],
        { cwd: api, stdio: "ignore" },
      );
      console.log(`deleted repo ${repo} from ${NAMESPACE}`);
    } catch {
      console.log(`repo ${repo} was not in ${NAMESPACE}`);
    }
  }
  if (dispatch) process.kill(-dispatch.pid!, "SIGTERM");
  try {
    process.kill(-server.pid!, "SIGTERM");
  } catch {
    console.log(`cf dev had already exited; its last output:\n${log.slice(-3000)}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const started = [...containers()].filter((id) => !containersBefore.has(id));
  if (started.length > 0) execFileSync("docker", ["rm", "-f", ...started], { stdio: "ignore" });
  console.log(
    `stopped cf dev and ${started.length} container(s) it left running; state kept in ${state}`,
  );
}

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
