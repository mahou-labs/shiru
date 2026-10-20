// Drives the Builder Durable Object end to end through the dev-only route.
// Needs `cf dev` running (default http://localhost:3000) with Docker available.
// Usage: node scripts/verify-builder.ts [baseUrl]
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const fixtures = path.resolve(import.meta.dirname, "../../builder/fixtures");
const docUrl = "https://acme.shiru.sh";
const template = path.resolve(import.meta.dirname, "../../../packages/site-template");
const { version } = JSON.parse(await readFile(path.join(template, "package.json"), "utf8"));
const name = `verify-${Date.now()}`;
let passed = 0;
let failed = 0;

type Result = {
  ok: boolean;
  templateVersion?: string;
  manifest?: { path: string }[];
  errors?: string[];
};

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

/**
 * A fixture's files as a repository would hold them, under docs/: the site template's tracked
 * files with the fixture on top, base64-encoded for the dev route.
 */
async function fixture(dir: string, skip: string[] = []) {
  const files = new Map<string, Buffer>();
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: template, encoding: "utf8" });
  for (const rel of tracked.split("\0").filter(Boolean)) {
    files.set(rel, await readFile(path.join(template, rel)));
  }
  const root = path.join(fixtures, dir);
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const rel = path.relative(root, path.join(entry.parentPath, entry.name));
    files.set(rel, await readFile(path.join(root, rel)));
  }
  return [...files]
    .filter(([rel]) => !skip.includes(rel))
    .map(([rel, content]) => ({ path: `docs/${rel}`, base64: content.toString("base64") }));
}

async function post(route: string, body: unknown) {
  const response = await fetch(`${base}/dev/builder/${name}/${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json().catch(() => null)) as Result };
}

const build = () => post("build", { docUrl, docsRoot: "docs" });
const paths = (result: Result) => new Set(result.manifest?.map((entry) => entry.path));
const timed = async <T>(work: () => Promise<T>) => {
  const start = performance.now();
  const value = await work();
  return { value, seconds: ((performance.now() - start) / 1000).toFixed(2) };
};

const early = await post("build", { docUrl, docsRoot: "docs" });
check("build before any reset is refused", early.status, 500);

check(
  "reset refuses a path outside /work/src",
  (await post("reset", [{ path: "../x", base64: "" }])).body,
  {
    ok: false,
    errors: ["../x has an empty, . or .. segment"],
  },
);

const coldReset = await timed(async () => post("reset", await fixture("good")));
const coldBuild = await timed(build);
check("good: reset", coldReset.value.body, { ok: true });
check(
  "good: build ok with the template version",
  [coldBuild.value.body.ok, coldBuild.value.body.templateVersion],
  [true, version],
);
const good = paths(coldBuild.value.body);
check(
  "good: manifest lists the pages and llms.txt",
  ["/index.html", "/guides/setup/index.html", "/guides/faq/index.html", "/llms.txt"].map((p) =>
    good.has(p),
  ),
  [true, true, true, true],
);

const llms = await fetch(`${base}/dev/builder/${name}/asset?path=/llms.txt`);
const llmsText = await llms.text();
check(
  "good: readAsset returns llms.txt under SITE_URL",
  llmsText.includes("- [Acme Docs](https://acme.shiru.sh/index.md)"),
  true,
);
const llmsEntry = coldBuild.value.body.manifest?.find((entry) => entry.path === "/llms.txt") as
  | { size: number }
  | undefined;
check(
  "good: manifest size matches the bytes read back",
  llmsEntry?.size,
  new TextEncoder().encode(llmsText).length,
);
check(
  "readAsset refuses a path outside dist",
  (await fetch(`${base}/dev/builder/${name}/asset?path=/../etc/passwd`)).status,
  500,
);

const warmReset = await timed(async () =>
  post("reset", await fixture("good", ["src/content/docs/guides/faq.mdx"])),
);
const warmBuild = await timed(build);
check("rebuild: reset without faq.mdx", warmReset.value.body, { ok: true });
const rebuilt = paths(warmBuild.value.body);
check(
  "rebuild: faq page is gone, setup remains",
  [rebuilt.has("/guides/faq/index.html"), rebuilt.has("/guides/setup/index.html")],
  [false, true],
);

await post("reset", await fixture("bad-import"));
const bad = await build();
const badErrors = (bad.body as { errors?: string[] }).errors ?? [];
check(
  "bad-import: errors come back as data, naming the package and the page",
  [
    bad.status,
    (bad.body as { ok?: boolean }).ok,
    badErrors.some(
      (e) => e.includes("canvas-confetti") && e.includes('from "src/content/docs/index.mdx"'),
    ),
  ],
  [200, false, true],
);
check(
  "bad-import: the last good build is still served",
  (await fetch(`${base}/dev/builder/${name}/asset?path=/guides/setup/index.html`)).status,
  200,
);

console.log();
console.log(`manifest entries for good: ${good.size}`);
console.log(
  `first, in a fresh container: reset ${coldReset.seconds}s, build ${coldBuild.seconds}s`,
);
console.log(
  `second, in the same container: reset ${warmReset.seconds}s, build ${warmBuild.seconds}s`,
);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
