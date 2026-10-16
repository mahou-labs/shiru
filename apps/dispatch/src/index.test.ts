import { createServer, type IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
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

  it("does not serve previews, unknown custom hostnames, reserved or malformed names", async () => {
    const urls = [
      "https://draft--acme.preview.docs.localhost/",
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

  it("returns 404 for previews even when the preview Worker exists", async () => {
    expect(await get("https://draft--acme.preview.docs.localhost/")).toMatchObject({
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

describe("fetch in development", () => {
  const received: { method?: string; url?: string; host?: string; accept?: string }[] = [];

  // Stands in for the API Worker's dev route, GET /dev/docs/:slug/*.
  const origin = createServer((request: IncomingMessage, response) => {
    received.push({
      method: request.method,
      url: request.url,
      host: request.headers.host,
      accept: request.headers.accept,
    });
    if (request.url === "/dev/docs/acme/guides") {
      response.writeHead(301, { location: "guides/" }).end();
    } else if (request.url === "/dev/docs/acme/guides/setup/index.md?ref=nav") {
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
      DEV_DOCS_ORIGIN: `http://127.0.0.1:${port}`,
      DOMAINS: kv(),
      DOCS_DOMAIN: domains.docs,
      PREVIEW_DOMAIN: domains.preview,
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
        host: env.DEV_DOCS_ORIGIN?.replace("http://", ""),
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

  it("does not forward previews", async () => {
    received.length = 0;
    expect(await get("http://draft--acme.preview.docs.localhost:3003/")).toMatchObject({
      status: 404,
      body: "No docs site here",
    });
    expect(received).toHaveLength(0);
  });
});
