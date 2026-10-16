import { describe, expect, it } from "vite-plus/test";
import { z } from "zod";

import type { ManifestEntry } from "../builder/protocol";
import {
  contentType,
  deleteBuild,
  deleteDoc,
  deployBuild,
  deployDoc,
  type DispatchAccount,
  parseResponse,
  splitManifest,
  toBase64,
} from "./deploy";

const account: DispatchAccount = { id: "acct1", apiToken: "api-token", namespace: "staging" };
const API = "https://api.cloudflare.com/client/v4/accounts/acct1/workers";
const SCRIPT = `${API}/dispatch/namespaces/staging/scripts/acme`;

type Part = { name: string; filename?: string; type?: string; text: string };
type Recorded = {
  method: string;
  url: string;
  authorization: string | null;
  json?: unknown;
  parts?: Part[];
};

const envelope = (result: unknown) => ({ success: true, errors: [], messages: [], result });
const errorBody = (code: number, message: string) => ({
  success: false,
  errors: [{ code, message }],
  messages: [],
  result: null,
});

/**
 * An in-process stand-in for the four Cloudflare endpoints the deployer uses.
 * Like the real asset store, it remembers uploaded hashes across sessions, so
 * a later session only asks for files it has never seen.
 */
class FakeCloudflare {
  requests: Recorded[] = [];
  stored = new Map<string, { type: string; text: string }>();
  scripts = new Map<string, { metadata: unknown; parts: Part[] }>();
  bucketSize = 2;
  returnCompletionToken = true;
  extraBucketHash: string | undefined;
  private sessions = new Map<string, { pending: Set<string>; completion: string }>();
  private completions = new Set<string>();
  private overrides: { method: string; url: string; response: () => Response }[] = [];

  /** The next request with this method to a URL ending in `url` gets `response` instead. */
  failNext(method: string, url: string, status: number, body: unknown) {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    this.overrides.push({ method, url, response: () => new Response(text, { status }) });
  }

  fetch: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const recorded: Recorded = {
      method: request.method,
      url: request.url,
      authorization: request.headers.get("authorization"),
    };
    const type = request.headers.get("content-type") ?? "";
    if (type.startsWith("application/json")) recorded.json = await request.json();
    if (type.startsWith("multipart/form-data")) {
      recorded.parts = [];
      for (const [name, value] of await request.formData()) {
        recorded.parts.push(
          typeof value === "string"
            ? { name, text: value }
            : { name, filename: value.name, type: value.type, text: await value.text() },
        );
      }
    }
    this.requests.push(recorded);

    const override = this.overrides.findIndex(
      (o) => o.method === request.method && request.url.endsWith(o.url),
    );
    if (override !== -1) return this.overrides.splice(override, 1)[0]!.response();
    return this.route(recorded);
  };

  private route(request: Recorded): Response {
    const url = new URL(request.url);
    const bearer = request.authorization?.replace(/^Bearer /, "") ?? "";
    const script =
      /\/dispatch\/namespaces\/staging\/scripts\/([^/]+)(\/assets-upload-session)?$/.exec(
        url.pathname,
      );

    if (script && request.method === "POST" && script[2]) {
      if (bearer !== account.apiToken) return json(403, errorBody(10000, "Authentication error"));
      const { manifest } = request.json as { manifest: Record<string, { hash: string }> };
      const missing = [...new Set(Object.values(manifest).map(({ hash }) => hash))].filter(
        (hash) => !this.stored.has(hash),
      );
      if (this.extraBucketHash) missing.push(this.extraBucketHash);
      const n = this.sessions.size + 1;
      const completion = `completion-${n}`;
      if (missing.length === 0) {
        this.completions.add(completion);
        return json(200, envelope({ jwt: completion, buckets: [] }));
      }
      this.sessions.set(`upload-${n}`, { pending: new Set(missing), completion });
      const buckets = [];
      for (let i = 0; i < missing.length; i += this.bucketSize) {
        buckets.push(missing.slice(i, i + this.bucketSize));
      }
      return json(200, envelope({ jwt: `upload-${n}`, buckets }));
    }

    if (url.pathname.endsWith("/workers/assets/upload") && request.method === "POST") {
      const session = this.sessions.get(bearer);
      if (!session || url.searchParams.get("base64") !== "true") {
        return json(401, errorBody(10000, "Authentication error"));
      }
      for (const part of request.parts ?? []) {
        if (!session.pending.delete(part.name)) {
          return json(400, errorBody(10100, `unexpected hash ${part.name}`));
        }
        this.stored.set(part.name, { type: part.type!, text: atob(part.text) });
      }
      if (session.pending.size > 0) return json(202, envelope({ jwt: null }));
      if (!this.returnCompletionToken) return json(201, envelope(null));
      this.completions.add(session.completion);
      return json(201, envelope({ jwt: session.completion }));
    }

    if (script && request.method === "PUT") {
      if (bearer !== account.apiToken) return json(403, errorBody(10000, "Authentication error"));
      const metadata = JSON.parse(request.parts!.find((p) => p.name === "metadata")!.text);
      if (!this.completions.has(metadata.assets.jwt)) {
        return json(400, errorBody(10200, "Invalid assets upload token"));
      }
      this.scripts.set(script[1]!, { metadata, parts: request.parts! });
      return json(200, envelope({ id: script[1] }));
    }

    if (script && request.method === "DELETE") {
      if (!this.scripts.delete(script[1]!)) {
        return json(404, errorBody(10007, "This Worker does not exist on your account."));
      }
      return json(200, envelope(null));
    }

    return json(404, errorBody(7003, "Could not route to this path"));
  }
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const HASH = {
  index: "0123456789abcdef0123456789abcd01",
  guide: "0123456789abcdef0123456789abcd02",
  css: "0123456789abcdef0123456789abcd03",
  logo: "0123456789abcdef0123456789abcd04",
  headers: "0123456789abcdef0123456789abcd05",
  redirects: "0123456789abcdef0123456789abcd06",
};

function doc(files: Record<string, string>) {
  const encoder = new TextEncoder();
  const reads: string[] = [];
  return {
    reads,
    readAsset: async (path: string) => {
      reads.push(path);
      const text = files[path];
      if (text === undefined) throw new Error(`no ${path}`);
      return encoder.encode(text);
    },
  };
}

const files = {
  "/index.html": "<h1>Home</h1>",
  "/guide/index.html": "<h1>Guide</h1>",
  "/styles.css": "body{}",
  "/logo.svg": "<svg/>",
  "/_headers": "/*\n  X-Frame-Options: DENY\n",
  "/_redirects": "/old /new 301\n",
};

const manifest: ManifestEntry[] = [
  { path: "/_headers", size: 28, hash: HASH.headers },
  { path: "/_redirects", size: 14, hash: HASH.redirects },
  { path: "/guide/index.html", size: 14, hash: HASH.guide },
  { path: "/index.html", size: 13, hash: HASH.index },
  { path: "/logo.svg", size: 6, hash: HASH.logo },
  { path: "/styles.css", size: 6, hash: HASH.css },
];

const assetsManifest = {
  "/guide/index.html": { hash: HASH.guide, size: 14 },
  "/index.html": { hash: HASH.index, size: 13 },
  "/logo.svg": { hash: HASH.logo, size: 6 },
  "/styles.css": { hash: HASH.css, size: 6 },
};

const assetsOnlyMetadata = (jwt: string) => ({
  name: "metadata",
  text: JSON.stringify({
    assets: {
      jwt,
      config: {
        html_handling: "auto-trailing-slash",
        not_found_handling: "404-page",
        _headers: "/*\n  X-Frame-Options: DENY\n",
        _redirects: "/old /new 301\n",
      },
    },
    compatibility_date: "2026-10-01",
  }),
});

describe("deployDoc", () => {
  it("uploads every file on a first deploy and attaches them to the Worker", async () => {
    const cf = new FakeCloudflare();
    const { readAsset } = doc(files);

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      readAsset,
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true, uploaded: 4, reused: 0 });
    expect(cf.requests).toEqual([
      {
        method: "POST",
        url: `${SCRIPT}/assets-upload-session`,
        authorization: "Bearer api-token",
        json: { manifest: assetsManifest },
      },
      {
        method: "POST",
        url: `${API}/assets/upload?base64=true`,
        authorization: "Bearer upload-1",
        parts: [
          {
            name: HASH.guide,
            filename: HASH.guide,
            type: "text/html; charset=utf-8",
            text: btoa("<h1>Guide</h1>"),
          },
          {
            name: HASH.index,
            filename: HASH.index,
            type: "text/html; charset=utf-8",
            text: btoa("<h1>Home</h1>"),
          },
        ],
      },
      {
        method: "POST",
        url: `${API}/assets/upload?base64=true`,
        authorization: "Bearer upload-1",
        parts: [
          { name: HASH.logo, filename: HASH.logo, type: "image/svg+xml", text: btoa("<svg/>") },
          {
            name: HASH.css,
            filename: HASH.css,
            type: "text/css; charset=utf-8",
            text: btoa("body{}"),
          },
        ],
      },
      {
        method: "PUT",
        url: SCRIPT,
        authorization: "Bearer api-token",
        parts: [assetsOnlyMetadata("completion-1")],
      },
    ]);
    expect(Object.fromEntries(cf.stored)).toEqual({
      [HASH.guide]: { type: "text/html; charset=utf-8", text: "<h1>Guide</h1>" },
      [HASH.index]: { type: "text/html; charset=utf-8", text: "<h1>Home</h1>" },
      [HASH.logo]: { type: "image/svg+xml", text: "<svg/>" },
      [HASH.css]: { type: "text/css; charset=utf-8", text: "body{}" },
    });
  });

  it("uploads nothing when the same build is deployed again", async () => {
    const cf = new FakeCloudflare();
    await deployDoc({ account, scriptName: "acme", manifest, ...doc(files), fetch: cf.fetch });
    cf.requests = [];
    const second = doc(files);

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      readAsset: second.readAsset,
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true, uploaded: 0, reused: 4 });
    expect(
      cf.requests.map(({ method, url, authorization }) => [method, url, authorization]),
    ).toEqual([
      ["POST", `${SCRIPT}/assets-upload-session`, "Bearer api-token"],
      ["PUT", SCRIPT, "Bearer api-token"],
    ]);
    expect(cf.requests[1]!.parts).toEqual([assetsOnlyMetadata("completion-2")]);
    expect(second.reads).toEqual(["/_headers", "/_redirects"]);
  });

  it("uploads only the changed file, and reuses files another Worker uploaded", async () => {
    const cf = new FakeCloudflare();
    await deployDoc({ account, scriptName: "acme", manifest, ...doc(files), fetch: cf.fetch });
    cf.requests = [];
    const changedHash = "0123456789abcdef0123456789abcd99";
    const preview = doc({ ...files, "/index.html": "<h1>New</h1>" });

    const result = await deployDoc({
      account,
      scriptName: "acme--draft",
      manifest: manifest.map((entry) =>
        entry.path === "/index.html" ? { ...entry, size: 12, hash: changedHash } : entry,
      ),
      readAsset: preview.readAsset,
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true, uploaded: 1, reused: 3 });
    expect(cf.requests[1]).toEqual({
      method: "POST",
      url: `${API}/assets/upload?base64=true`,
      authorization: "Bearer upload-2",
      parts: [
        {
          name: changedHash,
          filename: changedHash,
          type: "text/html; charset=utf-8",
          text: btoa("<h1>New</h1>"),
        },
      ],
    });
    expect(cf.requests[2]!.url).toBe(`${API}/dispatch/namespaces/staging/scripts/acme--draft`);
    expect([...cf.scripts.keys()]).toEqual(["acme", "acme--draft"]);
    expect(preview.reads).toEqual(["/index.html", "/_headers", "/_redirects"]);
  });

  it("omits _headers and _redirects from the config when the build has none", async () => {
    const cf = new FakeCloudflare();
    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest: [{ path: "/index.html", size: 13, hash: HASH.index }],
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true, uploaded: 1, reused: 0 });
    expect(cf.scripts.get("acme")!.metadata).toEqual({
      assets: {
        jwt: "completion-1",
        config: { html_handling: "auto-trailing-slash", not_found_handling: "404-page" },
      },
      compatibility_date: "2026-10-01",
    });
  });

  it("adds a main module that forwards to the assets binding when asked", async () => {
    const cf = new FakeCloudflare();
    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest: [{ path: "/index.html", size: 13, hash: HASH.index }],
      ...doc(files),
      shape: "assets-with-module",
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true, uploaded: 1, reused: 0 });
    expect(cf.scripts.get("acme")!.parts).toEqual([
      {
        name: "metadata",
        text: JSON.stringify({
          assets: {
            jwt: "completion-1",
            config: { html_handling: "auto-trailing-slash", not_found_handling: "404-page" },
          },
          compatibility_date: "2026-10-01",
          main_module: "worker.js",
          bindings: [{ type: "assets", name: "ASSETS" }],
        }),
      },
      {
        name: "worker.js",
        filename: "worker.js",
        type: "application/javascript+module",
        text: "export default { fetch: (request, env) => env.ASSETS.fetch(request) };\n",
      },
    ]);
  });

  it("returns Cloudflare's error when the upload session is refused", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("POST", "/assets-upload-session", 403, {
      success: false,
      errors: [
        { code: 10121, message: "Workers for Platforms is not enabled" },
        { code: 10000, message: "Authentication error" },
      ],
      messages: [],
      result: null,
    });

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({
      ok: false,
      step: "upload-session",
      status: 403,
      message: "Workers for Platforms is not enabled (10121); Authentication error (10000)",
      errors: [
        { code: 10121, message: "Workers for Platforms is not enabled" },
        { code: 10000, message: "Authentication error" },
      ],
    });
    expect(cf.requests).toHaveLength(1);
  });

  it("stops before the script upload when a bucket upload fails", async () => {
    const cf = new FakeCloudflare();
    cf.bucketSize = 1;
    cf.failNext("POST", "/assets/upload?base64=true", 502, "<html>Bad gateway</html>");

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({
      ok: false,
      step: "upload",
      status: 502,
      message: "HTTP 502: <html>Bad gateway</html>",
      errors: [],
    });
    expect(cf.requests.map((r) => r.method)).not.toContain("PUT");
    expect(cf.scripts.size).toBe(0);
  });

  it("converges on a retry after a failed upload", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("POST", "/assets/upload?base64=true", 500, errorBody(10013, "internal error"));
    const failed = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    const retried = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(failed).toEqual({
      ok: false,
      step: "upload",
      status: 500,
      message: "internal error (10013)",
      errors: [{ code: 10013, message: "internal error" }],
    });
    expect(retried).toEqual({ ok: true, uploaded: 2, reused: 2 });
    expect(cf.scripts.get("acme")!.metadata).toEqual(
      JSON.parse(assetsOnlyMetadata("completion-2").text),
    );
  });

  it("fails when no upload returns a completion token", async () => {
    const cf = new FakeCloudflare();
    cf.returnCompletionToken = false;

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({
      ok: false,
      step: "upload",
      status: 201,
      message: "no upload returned a completion token",
      errors: [],
    });
  });

  it("fails when Cloudflare asks for a hash the manifest does not have", async () => {
    const cf = new FakeCloudflare();
    cf.extraBucketHash = "ffffffffffffffffffffffffffffffff";

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({
      ok: false,
      step: "upload-session",
      status: 200,
      message:
        "Cloudflare asked for ffffffffffffffffffffffffffffffff, which is not in the manifest",
      errors: [],
    });
  });

  it("returns Cloudflare's error when the script upload is refused", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("PUT", "/scripts/acme", 400, errorBody(10021, "Uncaught SyntaxError"));

    const result = await deployDoc({
      account,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({
      ok: false,
      step: "script",
      status: 400,
      message: "Uncaught SyntaxError (10021)",
      errors: [{ code: 10021, message: "Uncaught SyntaxError" }],
    });
  });

  it("throws when a file cannot be read, so the Workflow step retries", async () => {
    const cf = new FakeCloudflare();
    await expect(
      deployDoc({ account, scriptName: "acme", manifest, ...doc({}), fetch: cf.fetch }),
    ).rejects.toThrow("no /guide/index.html");
  });
});

describe("deployBuild", () => {
  const production = {
    ENVIRONMENT: "production",
    DISPATCH_ACCOUNT_ID: "acct1",
    DISPATCH_API_TOKEN: "api-token",
    DISPATCH_NAMESPACE: "staging",
  };

  it("deploys the build to the doc's Worker in production", async () => {
    const cf = new FakeCloudflare();

    const result = await deployBuild({
      env: production,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true });
    expect([...cf.scripts.keys()]).toEqual(["acme"]);
    expect(cf.requests[0]!.url).toBe(`${SCRIPT}/assets-upload-session`);
    expect(cf.requests[0]!.authorization).toBe("Bearer api-token");
  });

  it("sends nothing in development", async () => {
    const cf = new FakeCloudflare();

    const result = await deployBuild({
      env: { ...production, ENVIRONMENT: "development" },
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({ ok: true });
    expect(cf.requests).toEqual([]);
  });

  it("fails without a request when production has no account or token", async () => {
    const cf = new FakeCloudflare();
    const deploy = (env: typeof production) =>
      deployBuild({ env, scriptName: "acme", manifest, ...doc(files), fetch: cf.fetch });

    expect(await deploy({ ...production, DISPATCH_ACCOUNT_ID: "" })).toEqual({
      ok: false,
      error: "Deploying is not configured: DISPATCH_ACCOUNT_ID is not set",
    });
    expect(await deploy({ ...production, DISPATCH_API_TOKEN: "" })).toEqual({
      ok: false,
      error: "Deploying is not configured: DISPATCH_API_TOKEN is not set",
    });
    expect(cf.requests).toEqual([]);
  });

  it("returns Cloudflare's refusal as an error for the dashboard", async () => {
    const cf = new FakeCloudflare();
    cf.failNext(
      "POST",
      "/assets-upload-session",
      403,
      errorBody(10121, "Workers for Platforms is not enabled"),
    );

    const result = await deployBuild({
      env: production,
      scriptName: "acme",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });

    expect(result).toEqual({
      ok: false,
      error:
        "Deploying failed at upload-session (HTTP 403): Workers for Platforms is not enabled (10121)",
    });
  });

  it("throws on a server error so the step retries, and the retry deploys", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("POST", "/assets/upload?base64=true", 502, "<html>Bad gateway</html>");
    const deploy = () =>
      deployBuild({
        env: production,
        scriptName: "acme",
        manifest,
        ...doc(files),
        fetch: cf.fetch,
      });

    await expect(deploy()).rejects.toThrow(
      "Deploying failed at upload (HTTP 502): HTTP 502: <html>Bad gateway</html>",
    );
    expect(cf.scripts.size).toBe(0);
    expect(await deploy()).toEqual({ ok: true });
    expect([...cf.scripts.keys()]).toEqual(["acme"]);
  });

  it("throws when Cloudflare rate limits the script upload", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("PUT", "/scripts/acme", 429, errorBody(10429, "Too many requests"));

    await expect(
      deployBuild({
        env: production,
        scriptName: "acme",
        manifest,
        ...doc(files),
        fetch: cf.fetch,
      }),
    ).rejects.toThrow("Deploying failed at script (HTTP 429): Too many requests (10429)");
  });
});

describe("deleteBuild", () => {
  const production = {
    ENVIRONMENT: "production",
    DISPATCH_ACCOUNT_ID: "acct1",
    DISPATCH_API_TOKEN: "api-token",
    DISPATCH_NAMESPACE: "staging",
  };

  it("deletes the doc's Worker in production, and nothing in development", async () => {
    const cf = new FakeCloudflare();
    const remove = (env: typeof production) =>
      deleteBuild({ env, scriptName: "acme--draft", fetch: cf.fetch });

    expect(await remove({ ...production, ENVIRONMENT: "development" })).toEqual({ ok: true });
    expect(cf.requests).toEqual([]);
    expect(await remove(production)).toEqual({ ok: true });
    expect(cf.requests).toEqual([
      {
        method: "DELETE",
        url: `${API}/dispatch/namespaces/staging/scripts/acme--draft`,
        authorization: "Bearer api-token",
      },
    ]);
  });

  it("fails without a request when production has no account or token", async () => {
    const cf = new FakeCloudflare();
    const remove = (env: typeof production) =>
      deleteBuild({ env, scriptName: "acme--draft", fetch: cf.fetch });

    expect(await remove({ ...production, DISPATCH_ACCOUNT_ID: "" })).toEqual({
      ok: false,
      error: "Deleting is not configured: DISPATCH_ACCOUNT_ID is not set",
    });
    expect(await remove({ ...production, DISPATCH_API_TOKEN: "" })).toEqual({
      ok: false,
      error: "Deleting is not configured: DISPATCH_API_TOKEN is not set",
    });
    expect(cf.requests).toEqual([]);
  });

  it("returns Cloudflare's refusal as an error", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("DELETE", "/scripts/acme--draft", 403, errorBody(10000, "Authentication error"));

    expect(
      await deleteBuild({ env: production, scriptName: "acme--draft", fetch: cf.fetch }),
    ).toEqual({ ok: false, error: "Deleting failed (HTTP 403): Authentication error (10000)" });
  });
});

describe("deleteDoc", () => {
  it("deletes the Worker, and treats a Worker that is already gone as deleted", async () => {
    const cf = new FakeCloudflare();
    await deployDoc({
      account,
      scriptName: "acme--pr-12",
      manifest,
      ...doc(files),
      fetch: cf.fetch,
    });
    cf.requests = [];

    const first = await deleteDoc({ account, scriptName: "acme--pr-12", fetch: cf.fetch });
    const second = await deleteDoc({ account, scriptName: "acme--pr-12", fetch: cf.fetch });

    expect([first, second]).toEqual([{ ok: true }, { ok: true }]);
    expect(cf.requests).toEqual([
      {
        method: "DELETE",
        url: `${API}/dispatch/namespaces/staging/scripts/acme--pr-12`,
        authorization: "Bearer api-token",
      },
      {
        method: "DELETE",
        url: `${API}/dispatch/namespaces/staging/scripts/acme--pr-12`,
        authorization: "Bearer api-token",
      },
    ]);
    expect(cf.scripts.size).toBe(0);
  });

  it("returns Cloudflare's error when the delete is refused", async () => {
    const cf = new FakeCloudflare();
    cf.failNext("DELETE", "/scripts/acme", 403, errorBody(10000, "Authentication error"));

    expect(await deleteDoc({ account, scriptName: "acme", fetch: cf.fetch })).toEqual({
      ok: false,
      step: "delete",
      status: 403,
      message: "Authentication error (10000)",
      errors: [{ code: 10000, message: "Authentication error" }],
    });
  });
});

describe("splitManifest", () => {
  it("moves root _headers and _redirects to the config and keeps nested ones as assets", () => {
    expect(
      splitManifest([
        { path: "/_headers", size: 1, hash: HASH.headers },
        { path: "/_redirects", size: 2, hash: HASH.redirects },
        { path: "/docs/_headers", size: 3, hash: HASH.guide },
        { path: "/index.html", size: 4, hash: HASH.index },
      ]),
    ).toEqual({
      assets: {
        "/docs/_headers": { hash: HASH.guide, size: 3 },
        "/index.html": { hash: HASH.index, size: 4 },
      },
      configFiles: { _headers: "/_headers", _redirects: "/_redirects" },
    });
  });
});

describe("contentType", () => {
  it("maps extensions case-insensitively and falls back to octet-stream", () => {
    expect(
      [
        "/a/index.html",
        "/LOGO.PNG",
        "/x.md",
        "/font.woff2",
        "/.well-known/thing",
        "/Makefile",
        "/a.b/c",
      ].map(contentType),
    ).toEqual([
      "text/html; charset=utf-8",
      "image/png",
      "text/markdown; charset=utf-8",
      "font/woff2",
      "application/octet-stream",
      "application/octet-stream",
      "application/octet-stream",
    ]);
  });
});

describe("toBase64", () => {
  it("encodes binary bytes", () => {
    expect(toBase64(new Uint8Array([0, 255, 104, 105]))).toBe("AP9oaQ==");
  });

  it("encodes files larger than one chunk", () => {
    const bytes = new Uint8Array(100_000).map((_, i) => i % 256);
    const decoded = Uint8Array.from(atob(toBase64(bytes)), (c) => c.charCodeAt(0));
    expect(decoded).toEqual(bytes);
  });
});

describe("parseResponse", () => {
  it("rejects a 200 whose body is not a Cloudflare envelope", async () => {
    expect(
      await parseResponse("script", new Response("<html>ok</html>", { status: 200 }), z.unknown()),
    ).toEqual({
      ok: false,
      step: "script",
      status: 200,
      message: "unexpected response: <html>ok</html>",
      errors: [],
    });
  });
});
