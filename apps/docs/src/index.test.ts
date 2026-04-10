import { describe, expect, it, vi } from "vite-plus/test";

import {
  getDocsSiteKvKey,
  getSlugFromHostname,
  handleDocsRequest,
  type DocsEdgeEnv,
} from "./index";

function createObject(
  body: string,
  metadata?: { cacheControl?: string; contentType?: string },
) {
  return {
    body: new Response(body).body,
    httpEtag: '"etag"',
    writeHttpMetadata(headers: Headers) {
      if (metadata?.contentType) {
        headers.set("content-type", metadata.contentType);
      }
      if (metadata?.cacheControl) {
        headers.set("cache-control", metadata.cacheControl);
      }
    },
  } as unknown as R2ObjectBody;
}

function createEnv(options?: {
  dbRows?: Record<string, { activeCommitSha: string | null; storagePrefix: string }>;
  kvEntries?: Record<string, { activeCommitSha: string; storagePrefix: string }>;
  objects?: Record<string, ReturnType<typeof createObject>>;
}) {
  const kv = new Map(Object.entries(options?.kvEntries ?? {}));
  const put = vi.fn(async (key: string, value: string) => {
    kv.set(key, JSON.parse(value) as { activeCommitSha: string; storagePrefix: string });
  });
  const get = vi.fn(async (key: string) => kv.get(key) ?? null);
  const rows = options?.dbRows ?? {};
  const first = vi.fn(async (slug: string) => rows[slug] ?? null);
  const objects = options?.objects ?? {};
  const r2Get = vi.fn(async (key: string) => objects[key] ?? null);

  const env = {
    DB: {
      prepare() {
        return {
          bind(slug: unknown) {
            return {
              first: <T>() => first(slug as string) as Promise<T | null>,
            };
          },
        };
      },
    },
    DOCS_DIST: {
      get: r2Get,
    },
    DOCS_KV: {
      get: get as unknown as DocsEdgeEnv["DOCS_KV"]["get"],
      put,
    },
    DOCS_ROOT_DOMAIN: "shiru.sh",
    RESERVED_SUBDOMAINS: "api,app,www",
  } as unknown as DocsEdgeEnv;

  return { env, first, get, kv, put, r2Get };
}

describe("getSlugFromHostname", () => {
  it("extracts the subdomain and rejects reserved names", () => {
    const reserved = new Set(["api", "app", "www"]);

    expect(getSlugFromHostname("acme.shiru.sh", "shiru.sh", reserved)).toBe("acme");
    expect(getSlugFromHostname("app.shiru.sh", "shiru.sh", reserved)).toBeNull();
    expect(getSlugFromHostname("shiru.sh", "shiru.sh", reserved)).toBeNull();
    expect(getSlugFromHostname("foo.bar.shiru.sh", "shiru.sh", reserved)).toBeNull();
  });
});

describe("handleDocsRequest", () => {
  it("serves the index document from KV", async () => {
    const { env, first, r2Get } = createEnv({
      kvEntries: {
        [getDocsSiteKvKey("acme")]: {
          activeCommitSha: "commit-1",
          storagePrefix: "docs-acme",
        },
      },
      objects: {
        "docs-acme/commit-1/index.html": createObject("<h1>hello</h1>", {
          cacheControl: "public, max-age=0, must-revalidate",
          contentType: "text/html; charset=utf-8",
        }),
      },
    });

    const response = await handleDocsRequest(
      new Request("http://localhost:3005/", {
        headers: { host: "acme.shiru.sh" },
      }),
      env,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("hello");
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(first).not.toHaveBeenCalled();
    expect(r2Get).toHaveBeenCalledWith("docs-acme/commit-1/index.html");
  });

  it("falls back to D1 and warms KV on a cache miss", async () => {
    const { env, first, kv, put } = createEnv({
      dbRows: {
        acme: {
          activeCommitSha: "commit-2",
          storagePrefix: "docs-acme",
        },
      },
      objects: {
        "docs-acme/commit-2/index.html": createObject("<h1>from d1</h1>"),
      },
    });

    const response = await handleDocsRequest(
      new Request("http://localhost:3005/", {
        headers: { host: "acme.shiru.sh" },
      }),
      env,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("from d1");
    expect(first).toHaveBeenCalledWith("acme");
    expect(put).toHaveBeenCalledWith(
      getDocsSiteKvKey("acme"),
      JSON.stringify({ activeCommitSha: "commit-2", storagePrefix: "docs-acme" }),
    );
    expect(kv.get(getDocsSiteKvKey("acme"))).toEqual({
      activeCommitSha: "commit-2",
      storagePrefix: "docs-acme",
    });
  });

  it("tries html fallbacks before returning not found", async () => {
    const { env, r2Get } = createEnv({
      kvEntries: {
        [getDocsSiteKvKey("acme")]: {
          activeCommitSha: "commit-3",
          storagePrefix: "docs-acme",
        },
      },
      objects: {
        "docs-acme/commit-3/guides/getting-started/index.html": createObject("<h1>guide</h1>"),
      },
    });

    const response = await handleDocsRequest(
      new Request("http://localhost:3005/guides/getting-started", {
        headers: { host: "acme.shiru.sh" },
      }),
      env,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("guide");
    expect(r2Get).toHaveBeenNthCalledWith(1, "docs-acme/commit-3/guides/getting-started");
    expect(r2Get).toHaveBeenNthCalledWith(2, "docs-acme/commit-3/guides/getting-started.html");
    expect(r2Get).toHaveBeenNthCalledWith(
      3,
      "docs-acme/commit-3/guides/getting-started/index.html",
    );
  });

  it("serves 404.html when the requested path is missing", async () => {
    const { env } = createEnv({
      kvEntries: {
        [getDocsSiteKvKey("acme")]: {
          activeCommitSha: "commit-4",
          storagePrefix: "docs-acme",
        },
      },
      objects: {
        "docs-acme/commit-4/404.html": createObject("<h1>missing</h1>"),
      },
    });

    const response = await handleDocsRequest(
      new Request("http://localhost:3005/missing", {
        headers: { host: "acme.shiru.sh" },
      }),
      env,
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toContain("missing");
  });
});
