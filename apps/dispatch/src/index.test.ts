import { createServer, type IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import dispatch, { route } from "./index";

const domains = { docs: "docs.localhost", preview: "preview.docs.localhost" } as const;

describe("route", () => {
  it("dispatches a site hostname to the site's live Worker", () => {
    expect(route("acme.docs.localhost", domains)).toEqual({
      kind: "dispatch",
      slug: "acme",
      workerName: "acme",
    });
    expect(route("Acme.Docs.Localhost.", domains)).toEqual({
      kind: "dispatch",
      slug: "acme",
      workerName: "acme",
    });
  });

  it("does not serve previews, custom hostnames, reserved or malformed names", () => {
    expect(route("draft--acme.preview.docs.localhost", domains)).toEqual({ kind: "notFound" });
    expect(route("docs.acme.com", domains)).toEqual({ kind: "notFound" });
    expect(route("app.docs.localhost", domains)).toEqual({ kind: "notFound" });
    expect(route("a--b.docs.localhost", domains)).toEqual({ kind: "notFound" });
    expect(route("docs.localhost", domains)).toEqual({ kind: "notFound" });
    expect(route("a.b.docs.localhost", domains)).toEqual({ kind: "notFound" });
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

  const env: Env = { DISPATCHER, DOCS_DOMAIN: domains.docs, PREVIEW_DOMAIN: domains.preview };
  const get = async (url: string) => read(await dispatch.fetch(new Request(url), env));

  it("passes a site's response through unchanged", async () => {
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

  it("returns 404 for custom and invalid hostnames", async () => {
    expect((await get("https://docs.acme.com/")).status).toBe(404);
    expect((await get("https://api.docs.localhost/")).status).toBe(404);
  });

  it("does not hide other user Worker failures as a missing site", async () => {
    await expect(
      dispatch.fetch(new Request("https://broken.docs.localhost/"), env),
    ).rejects.toThrow("boom");
  });
});

describe("fetch in development", () => {
  const received: { method?: string; url?: string; host?: string; accept?: string }[] = [];

  // Stands in for the API Worker's dev route, GET /dev/sites/:slug/*.
  const origin = createServer((request: IncomingMessage, response) => {
    received.push({
      method: request.method,
      url: request.url,
      host: request.headers.host,
      accept: request.headers.accept,
    });
    if (request.url === "/dev/sites/acme/guides") {
      response.writeHead(301, { location: "guides/" }).end();
    } else if (request.url === "/dev/sites/acme/guides/setup/index.md?ref=nav") {
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
      DEV_SITES_ORIGIN: `http://127.0.0.1:${port}`,
      DOCS_DOMAIN: domains.docs,
      PREVIEW_DOMAIN: domains.preview,
    } as unknown as Env;
  });
  afterAll(() => new Promise<void>((resolve) => origin.close(() => resolve())));

  const get = async (url: string) =>
    read(await dispatch.fetch(new Request(url, { headers: { accept: "text/markdown" } }), env));

  it("forwards a site request to the API's dev route and passes the response through", async () => {
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
        url: "/dev/sites/acme/guides/setup/index.md?ref=nav",
        host: env.DEV_SITES_ORIGIN?.replace("http://", ""),
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
