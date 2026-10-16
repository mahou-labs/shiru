import { createServer, type IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { signGrant, verifyGrant } from "../../api/src/docs/preview-access";
import dispatch, { route } from "./index";

const domains = { docs: "docs.localhost", preview: "preview.docs.localhost" } as const;

/** A DOMAINS namespace holding these keys, read the way the Worker reads it. */
function kv(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  const reads: { key: string; options: unknown }[] = [];
  const namespace = {
    reads,
    get: async (key: string, options: unknown) => {
      reads.push({ key, options });
      return map.get(key) ?? null;
    },
  };
  return namespace as typeof namespace & KVNamespace;
}

const domainsKv = kv({
  "redirect:moved": "docs.moved.com",
  "host:docs.acme.com": "acme",
  "host:docs.moved.com": "moved",
  "host:docs.broken.com": "Not A Slug",
});
const lookup = (key: string) => domainsKv.get(key, {});
const routeOf = (url: string) => route(new URL(url), domains, lookup);

describe("route", () => {
  it("dispatches a doc hostname to the doc's live Worker", async () => {
    expect(await routeOf("https://acme.docs.localhost/")).toEqual({
      kind: "dispatch",
      slug: "acme",
      workerName: "acme",
    });
    expect(await routeOf("https://Acme.Docs.Localhost./")).toEqual({
      kind: "dispatch",
      slug: "acme",
      workerName: "acme",
    });
  });

  it("redirects a doc hostname to the doc's custom domain, keeping the path and query", async () => {
    expect(await routeOf("https://moved.docs.localhost/guides/setup/?ref=nav#top")).toEqual({
      kind: "redirect",
      location: "https://docs.moved.com/guides/setup/?ref=nav",
    });
  });

  it("dispatches a custom hostname to its doc's live Worker", async () => {
    expect(await routeOf("https://docs.acme.com/guides/")).toEqual({
      kind: "dispatch",
      slug: "acme",
      workerName: "acme",
    });
  });

  it("routes a preview hostname to the target's Worker", async () => {
    expect(await routeOf("https://draft--acme.preview.docs.localhost/")).toEqual({
      kind: "preview",
      slug: "acme",
      label: "draft",
      workerName: "acme--draft",
    });
  });

  it("does not serve unknown custom hostnames, reserved or malformed names", async () => {
    const urls = [
      "https://live--acme.preview.docs.localhost/",
      "https://docs.unknown.com/",
      "https://docs.broken.com/",
      "https://app.docs.localhost/",
      "https://a--b.docs.localhost/",
      "https://docs.localhost/",
      "https://a.b.docs.localhost/",
    ];
    expect(await Promise.all(urls.map(routeOf))).toEqual(urls.map(() => ({ kind: "notFound" })));
  });
});

const SECRET = "preview-secret";
const PREVIEW = "draft--acme.preview.docs.localhost";

const grant = (kind: "handoff" | "session", exp = Date.now() + 60_000, host = PREVIEW) =>
  signGrant({ kind, host, exp }, SECRET);

async function read(response: Response) {
  return {
    status: response.status,
    body: await response.text(),
    contentType: response.headers.get("content-type"),
    location: response.headers.get("location"),
  };
}

describe("fetch in production", () => {
  type UserWorker = (request: Request) => Response | Promise<Response>;

  const workers = new Map<string, UserWorker>([
    [
      "acme",
      (request) =>
        new Response(`acme served ${new URL(request.url).pathname}`, {
          headers: { "content-type": "text/markdown; charset=utf-8" },
        }),
    ],
    ["acme--draft", () => new Response("draft content")],
    ["broken", () => Promise.reject(new Error("boom"))],
  ]);

  // Behaves like a dispatch namespace binding: an unknown script fails with "Worker not found".
  const DISPATCHER = {
    get: (name: string) => ({
      async fetch(request: Request) {
        const worker = workers.get(name);
        if (!worker) throw new Error(`Worker not found: ${name}`);
        return worker(request);
      },
    }),
  } as unknown as DispatchNamespace;

  const env: Env = {
    DISPATCHER,
    DOMAINS: domainsKv,
    DOCS_DOMAIN: domains.docs,
    PREVIEW_DOMAIN: domains.preview,
    API_ORIGIN: "https://api.test",
    PREVIEW_SECRET: SECRET,
  };
  const get = async (url: string) => read(await dispatch.fetch(new Request(url), env));

  it("passes a doc's response through unchanged", async () => {
    expect(await get("https://acme.docs.localhost/guides/setup/index.md")).toEqual({
      status: 200,
      body: "acme served /guides/setup/index.md",
      contentType: "text/markdown; charset=utf-8",
      location: null,
    });
  });

  it("returns 404 for a slug with no deployed Worker", async () => {
    expect(await get("https://ghost.docs.localhost/")).toMatchObject({
      status: 404,
      body: "No docs site here",
    });
  });

  it("serves a custom hostname from its doc's Worker", async () => {
    expect(await get("https://docs.acme.com/guides/setup/index.md")).toEqual({
      status: 200,
      body: "acme served /guides/setup/index.md",
      contentType: "text/markdown; charset=utf-8",
      location: null,
    });
  });

  it("redirects a doc with an active custom domain there, for an hour", async () => {
    const response = await dispatch.fetch(
      new Request("https://moved.docs.localhost/guides/?ref=nav"),
      env,
    );
    expect({
      ...(await read(response)),
      cacheControl: response.headers.get("cache-control"),
    }).toEqual({
      status: 301,
      body: "",
      contentType: null,
      location: "https://docs.moved.com/guides/?ref=nav",
      cacheControl: "max-age=3600",
    });
  });

  it("reads DOMAINS with a one minute edge cache", async () => {
    domainsKv.reads.length = 0;
    await get("https://docs.acme.com/");
    expect(domainsKv.reads).toEqual([{ key: "host:docs.acme.com", options: { cacheTtl: 60 } }]);
  });

  it("returns 404 for unknown custom and invalid hostnames", async () => {
    expect(await get("https://docs.unknown.com/")).toMatchObject({
      status: 404,
      body: "No docs site here",
    });
    expect((await get("https://api.docs.localhost/")).status).toBe(404);
  });

  it("does not hide other user Worker failures as a missing doc", async () => {
    await expect(
      dispatch.fetch(new Request("https://broken.docs.localhost/"), env),
    ).rejects.toThrow("boom");
  });
});

describe("fetch of a preview in production", () => {
  const DISPATCHER = {
    get: (name: string) => ({
      async fetch(request: Request) {
        if (name !== "acme--draft") throw new Error(`Worker not found: ${name}`);
        return new Response(`draft served ${new URL(request.url).pathname}`, {
          headers: {
            "x-cookie": request.headers.get("cookie") ?? "none",
            "cache-control": "max-age=60",
          },
        });
      },
    }),
  } as unknown as DispatchNamespace;
  const env: Env = {
    DISPATCHER,
    DOMAINS: kv(),
    DOCS_DOMAIN: domains.docs,
    PREVIEW_DOMAIN: domains.preview,
    API_ORIGIN: "https://api.test",
    PREVIEW_SECRET: SECRET,
  };
  const send = (path: string, init: RequestInit = {}) =>
    dispatch.fetch(new Request(`https://${PREVIEW}${path}`, init), env);

  it("trades a handoff grant for a session cookie on this host", async () => {
    const token = await grant("handoff");
    const response = await send(
      `/__shiru/preview-auth?${new URLSearchParams({ token, path: "/guides/?tab=npm" }).toString()}`,
    );

    expect([response.status, response.headers.get("location")]).toEqual([302, "/guides/?tab=npm"]);
    const cookie = response.headers.get("set-cookie")!;
    const [, session, attributes] = /^__Host-shiru-preview=([^;]+); (.*)$/.exec(cookie)!;
    expect(attributes).toBe("Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600");
    const expected = { kind: "session", host: PREVIEW, now: Date.now(), secret: SECRET } as const;
    expect(await verifyGrant(session!, expected)).toBe(true);
    expect(await verifyGrant(session!, { ...expected, now: Date.now() + 3_600_000 })).toBe(false);
  });

  it("refuses a handoff grant that expired, was for another host or is a session", async () => {
    const tokens = [
      await grant("handoff", Date.now() - 1),
      await grant("handoff", Date.now() + 60_000, "draft--other.preview.docs.localhost"),
      await grant("session"),
      "",
    ];
    for (const token of tokens) {
      const response = await send(`/__shiru/preview-auth?token=${token}&path=/`);
      expect([response.status, response.headers.get("set-cookie")]).toEqual([403, null]);
    }
  });

  it("serves the preview to a valid session, without its cookie, uncached and unindexed", async () => {
    const session = await grant("session");
    const response = await send("/guides/", {
      headers: { cookie: `theme=dark; __Host-shiru-preview=${session}; lang=en` },
    });

    expect({
      ...(await read(response)),
      cookie: response.headers.get("x-cookie"),
      robots: response.headers.get("x-robots-tag"),
      cache: response.headers.get("cache-control"),
    }).toEqual({
      status: 200,
      body: "draft served /guides/",
      contentType: "text/plain;charset=UTF-8",
      location: null,
      cookie: "theme=dark; lang=en",
      robots: "noindex",
      cache: "private, no-store",
    });
    const alone = await send("/", { headers: { cookie: `__Host-shiru-preview=${session}` } });
    expect(alone.headers.get("x-cookie")).toBe("none");
  });

  it("sends a visitor without a valid session to the API to authorize", async () => {
    const authorize =
      "https://api.test/preview/authorize?host=draft--acme.preview.docs.localhost&path=%2Fguides%2F%3Ftab%3Dnpm";
    const sessions = [
      undefined,
      await grant("session", Date.now() - 1),
      await grant("handoff"),
      await grant("session", Date.now() + 60_000, "draft--other.preview.docs.localhost"),
    ];
    for (const session of sessions) {
      const headers = session ? { cookie: `__Host-shiru-preview=${session}` } : undefined;
      const response = await send("/guides/?tab=npm", { headers });
      expect([response.status, response.headers.get("location")]).toEqual([302, authorize]);
    }
    const head = await send("/", { method: "HEAD" });
    expect(head.status).toBe(302);
  });

  it("refuses other methods without a session instead of redirecting them", async () => {
    expect(await read(await send("/api/search", { method: "POST", body: "{}" }))).toEqual({
      status: 401,
      body: "Sign in to see this preview",
      contentType: "text/plain;charset=UTF-8",
      location: null,
    });
  });

  it("returns 404 for a preview with no deployed Worker", async () => {
    const session = await grant(
      "session",
      Date.now() + 60_000,
      "draft--ghost.preview.docs.localhost",
    );
    const response = await dispatch.fetch(
      new Request("https://draft--ghost.preview.docs.localhost/", {
        headers: { cookie: `__Host-shiru-preview=${session}` },
      }),
      env,
    );
    expect(await read(response)).toMatchObject({ status: 404, body: "No docs site here" });
  });
});

describe("fetch in development", () => {
  const received: { method?: string; url?: string; host?: string; accept?: string }[] = [];

  // Stands in for the API Worker's dev route, GET /dev/docs/:name/*.
  const origin = createServer((request: IncomingMessage, response) => {
    received.push({
      method: request.method,
      url: request.url,
      host: request.headers.host,
      accept: request.headers.accept,
    });
    if (request.url === "/dev/docs/acme/guides") {
      response.writeHead(301, { location: "guides/" }).end();
    } else if (
      request.url === "/dev/docs/acme/guides/setup/index.md?ref=nav" ||
      request.url === "/dev/docs/acme--draft/guides/setup/index.md?ref=nav"
    ) {
      response.writeHead(200, { "content-type": "text/markdown" }).end("# Setup");
    } else {
      response.writeHead(404, { "content-type": "text/plain" }).end("No live build");
    }
  });

  let env: Env;
  beforeAll(async () => {
    await new Promise<void>((resolve) => origin.listen(0, "127.0.0.1", resolve));
    const { port } = origin.address() as AddressInfo;
    // A free port, not the config's localhost:3000, which the real dev API may be using.
    env = {
      API_ORIGIN: `http://127.0.0.1:${port}`,
      DOMAINS: kv(),
      DOCS_DOMAIN: domains.docs,
      PREVIEW_DOMAIN: domains.preview,
      PREVIEW_SECRET: SECRET,
    } as unknown as Env;
  });
  afterAll(() => new Promise<void>((resolve) => origin.close(() => resolve())));

  const get = async (url: string) =>
    read(await dispatch.fetch(new Request(url, { headers: { accept: "text/markdown" } }), env));

  it("forwards a doc request to the API's dev route and passes the response through", async () => {
    received.length = 0;
    expect(await get("http://acme.docs.localhost:3003/guides/setup/index.md?ref=nav")).toEqual({
      status: 200,
      body: "# Setup",
      contentType: "text/markdown",
      location: null,
    });
    expect(received).toEqual([
      {
        method: "GET",
        url: "/dev/docs/acme/guides/setup/index.md?ref=nav",
        host: env.API_ORIGIN.replace("http://", ""),
        accept: "text/markdown",
      },
    ]);
  });

  it("passes redirects and upstream errors through without following them", async () => {
    expect(await get("http://acme.docs.localhost:3003/guides")).toEqual({
      status: 301,
      body: "",
      contentType: null,
      location: "guides/",
    });
    expect(await get("http://ghost.docs.localhost:3003/")).toEqual({
      status: 404,
      body: "No live build",
      contentType: "text/plain",
      location: null,
    });
  });

  it("forwards a preview with a session to the dev route under its worker name", async () => {
    received.length = 0;
    const session = await grant("session");
    const response = await dispatch.fetch(
      new Request("http://draft--acme.preview.docs.localhost:3003/guides/setup/index.md?ref=nav", {
        headers: { accept: "text/markdown", cookie: `__Host-shiru-preview=${session}` },
      }),
      env,
    );
    expect(await read(response)).toEqual({
      status: 200,
      body: "# Setup",
      contentType: "text/markdown",
      location: null,
    });
    expect(received).toEqual([
      {
        method: "GET",
        url: "/dev/docs/acme--draft/guides/setup/index.md?ref=nav",
        host: env.API_ORIGIN.replace("http://", ""),
        accept: "text/markdown",
      },
    ]);
  });

  it("sends a preview visitor without a session to the dev API to authorize", async () => {
    received.length = 0;
    expect(await get("http://draft--acme.preview.docs.localhost:3003/")).toMatchObject({
      status: 302,
      location: `${env.API_ORIGIN}/preview/authorize?host=draft--acme.preview.docs.localhost&path=%2F`,
    });
    expect(received).toHaveLength(0);
  });
});
