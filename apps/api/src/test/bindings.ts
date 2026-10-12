import { DatabaseSync } from "node:sqlite";

import { generateDrizzleJson, generateMigration } from "drizzle-kit/payload/sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";

import * as schema from "../schema";

type SentEmail = { from: string; to: string; subject: string; html: string; text: string };
type PolarCustomer = {
  id: string;
  type: "individual";
  email: string;
  name: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
};

export const sentEmails: SentEmail[] = [];
export const polarCustomers: PolarCustomer[] = [];
export const polarCheckouts: Record<string, unknown>[] = [];
const pendingWork: Promise<unknown>[] = [];

// Counts requests per key for the whole test file; the limits match cloudflare.config.ts.
export const rateLimitCounts = new Map<string, number>();
function rateLimiter(name: string, limit: number) {
  return {
    limit: async ({ key }: { key: string }) => {
      const count = (rateLimitCounts.get(`${name}:${key}`) ?? 0) + 1;
      rateLimitCounts.set(`${name}:${key}`, count);
      return { success: count <= limit };
    },
  };
}

const client = new DatabaseSync(":memory:");
const statements = await generateMigration(
  await generateDrizzleJson({}),
  await generateDrizzleJson(schema),
);
for (const statement of statements) client.exec(statement);

export const db = drizzle({ client });

/** A Durable Object's SQL storage over node:sqlite, with BLOBs as ArrayBuffers like the runtime's. */
function sqlStorage(database: DatabaseSync) {
  return {
    exec(query: string, ...bindings: unknown[]) {
      const statement = database.prepare(query);
      const args = bindings.map((value) =>
        value instanceof ArrayBuffer ? new Uint8Array(value) : value,
      ) as (string | number | null | Uint8Array)[];
      const rows = statement
        .all(...args)
        .map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key,
              value instanceof Uint8Array ? value.slice().buffer : value,
            ]),
          ),
        );
      const rowsWritten = Number(
        (database.prepare("SELECT changes() AS n").get() as { n: number }).n,
      );
      return { toArray: () => rows, rowsWritten };
    },
  };
}

/**
 * Runs the real SiteDO class, one instance per name, on node:sqlite. Calls go through a proxy that
 * awaits and structured-clones like an RPC stub. Alarms are recorded, not fired.
 */
export const siteObjects = {
  instances: new Map<string, unknown>(),
  alarms: new Map<string, number | null>(),
  getByName(name: string) {
    const instance = async () => {
      if (!this.instances.has(name)) {
        const { SiteDO } = await import("../sites/site-do");
        const database = new DatabaseSync(":memory:");
        const ctx = {
          id: { name },
          storage: {
            sql: sqlStorage(database),
            transactionSync<T>(work: () => T) {
              database.exec("BEGIN");
              try {
                const result = work();
                database.exec("COMMIT");
                return result;
              } catch (error) {
                database.exec("ROLLBACK");
                throw error;
              }
            },
            setAlarm: async (time: number) => void siteObjects.alarms.set(name, time),
            deleteAlarm: async () => void siteObjects.alarms.set(name, null),
          },
        };
        this.instances.set(name, new SiteDO(ctx as never, env as never));
      }
      return this.instances.get(name) as Record<string, (...args: unknown[]) => unknown>;
    };
    return new Proxy(
      {},
      {
        // Not thenable, so an async function can return the stub, as it can a runtime stub.
        get: (_, method: string) =>
          method === "then"
            ? undefined
            : async (...args: unknown[]) =>
                structuredClone(await (await instance())[method]!(...structuredClone(args))),
      },
    );
  },
};

type StoredObject = { type: "blob" | "tree" | "commit"; body: Uint8Array };
type Repo = { objects: Map<string, StoredObject>; head: string | null };

function artifactsError(code: string, message: string) {
  return Object.assign(new Error(message), { name: "ArtifactsError", code });
}

/**
 * An in-memory Artifacts namespace with the binding's read API. Pushes go over HTTP, which tests
 * cannot reach; `receive` stands in for a push the server accepted.
 */
export const artifacts = {
  repos: new Map<string, Repo>(),
  async create(name: string) {
    if (this.repos.has(name)) throw artifactsError("ALREADY_EXISTS", `${name} exists`);
    this.repos.set(name, { objects: new Map(), head: null });
    return { id: name, name, remote: `https://artifacts.test/${name}.git`, token: "token" };
  },
  async get(name: string) {
    const repo = this.repos.get(name);
    if (!repo) throw artifactsError("NOT_FOUND", `${name} not found`);
    // Only the read API the site code calls; anything else is missing at runtime.
    return repoHandle(name, repo) as unknown as ArtifactsRepo;
  },
  receive(name: string, objects: (StoredObject & { sha: string })[], head?: string) {
    const repo = this.repos.get(name)!;
    for (const { sha, type, body } of objects) repo.objects.set(sha, { type, body });
    if (head) repo.head = head;
  },
};

function repoHandle(name: string, repo: Repo) {
  const decoder = new TextDecoder();
  const object = (sha: string, type: StoredObject["type"]) => {
    const found = repo.objects.get(sha);
    return found?.type === type ? found.body : null;
  };
  const readCommit = async (hash: string) => {
    const body = object(hash, "commit");
    if (!body) return null;
    const lines = decoder.decode(body).split("\n");
    const field = (key: string) =>
      lines.filter((line) => line.startsWith(`${key} `)).map((line) => line.slice(key.length + 1));
    return { hash, treeHash: field("tree")[0]!, parents: field("parent") };
  };
  return {
    [Symbol.dispose]() {},
    async info() {
      return { name, remote: `https://artifacts.test/${name}.git` };
    },
    async createToken(scope: "read" | "write", ttl: number) {
      return { id: "token", plaintext: `${scope}-${ttl}`, scope };
    },
    async log({ limit = 50 }: { limit?: number } = {}) {
      const commits = [];
      for (let sha = repo.head; sha && commits.length < limit;) {
        const commit = (await readCommit(sha))!;
        commits.push(commit);
        sha = commit.parents[0] ?? null;
      }
      return commits;
    },
    readCommit,
    async readTree(hash: string) {
      const body = object(hash, "tree");
      if (!body) return null;
      const entries = [];
      for (let at = 0; at < body.length;) {
        const nul = body.indexOf(0, at);
        const [mode = "", entryName = ""] = decoder.decode(body.slice(at, nul)).split(" ");
        const sha = Array.from(body.slice(nul + 1, nul + 21), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
        const type = mode === "40000" ? "tree" : mode === "100755" ? "exec" : "blob";
        entries.push({ name: entryName, mode, hash: sha, type });
        at = nul + 21;
      }
      return entries;
    },
    async readBlob(hash: string) {
      const body = object(hash, "blob");
      return body ? new Blob([body]) : null;
    },
  };
}

export const env = {
  DB: undefined,
  DASHBOARD_URL: "http://localhost:3001",
  SITE_URL: "http://localhost:3002",
  DOCS_DOMAIN: "docs.localhost",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters",
  POLAR_ACCESS_TOKEN: "polar_test_token",
  POLAR_WEBHOOK_SECRET: "polar_test_webhook_secret",
  POLAR_MONTHLY_PRODUCT_ID: "prod_test_monthly",
  POLAR_YEARLY_PRODUCT_ID: "prod_test_yearly",
  ENVIRONMENT: "development",
  API_RATE_LIMITER: rateLimiter("api", 300),
  PUBLIC_WRITE_RATE_LIMITER: rateLimiter("public-write", 10),
  POSTHOG_KEY: "",
  POSTHOG_HOST: "https://us.i.posthog.com",
  ARTIFACTS: artifacts,
  SITE_DO: siteObjects,
  EMAIL: {
    send: async (message: SentEmail) => {
      sentEmails.push(message);
      return { messageId: `test-${sentEmails.length}` };
    },
  },
};

export function waitUntil(promise: Promise<unknown>) {
  pendingWork.push(promise);
}

export async function flushWaitUntil() {
  while (pendingWork.length > 0) await Promise.all(pendingWork.splice(0));
}

const notFound = () => Response.json({ error: "ResourceNotFound" }, { status: 404 });

// Polar's HTTP API for the routes the Better Auth plugin calls, in wire (snake_case) shape.
export async function polarApi(request: Request): Promise<Response> {
  const { pathname, searchParams } = new URL(request.url);
  const body = request.body ? ((await request.json()) as Record<string, unknown>) : {};
  const [, external] = pathname.match(/^\/v1\/customers\/external\/([^/]+)$/) ?? [];
  const [, id] = pathname.match(/^\/v1\/customers\/([^/]+)$/) ?? [];
  const route = `${request.method} ${external ? "/v1/customers/external/{id}" : id ? "/v1/customers/{id}" : pathname}`;

  switch (route) {
    case "GET /v1/customers/": {
      const items = polarCustomers.filter((customer) => customer.email === searchParams.get("email"));
      return Response.json({ items, pagination: { total_count: items.length, max_page: 1 } });
    }
    case "POST /v1/customers/": {
      const customer: PolarCustomer = {
        id: `cus_${polarCustomers.length + 1}`,
        type: "individual",
        email: body.email as string,
        name: (body.name as string | undefined) ?? null,
        external_id: (body.external_id as string | undefined) ?? null,
        metadata: (body.metadata as Record<string, unknown> | undefined) ?? {},
      };
      polarCustomers.push(customer);
      return Response.json(customer, { status: 201 });
    }
    case "PATCH /v1/customers/{id}":
    case "PATCH /v1/customers/external/{id}": {
      const customer = polarCustomers.find((candidate) =>
        external ? candidate.external_id === external : candidate.id === id,
      );
      if (!customer) return notFound();
      Object.assign(customer, body);
      return Response.json(customer);
    }
    case "DELETE /v1/customers/external/{id}": {
      const index = polarCustomers.findIndex((customer) => customer.external_id === external);
      if (index === -1) return notFound();
      polarCustomers.splice(index, 1);
      return new Response(null, { status: 204 });
    }
    case "POST /v1/checkouts/": {
      polarCheckouts.push(body);
      const number = polarCheckouts.length;
      return Response.json(
        {
          id: `checkout_${number}`,
          status: "open",
          url: `https://sandbox.polar.sh/checkout/${number}`,
          client_secret: `polar_c_${number}`,
          metadata: body.metadata ?? {},
        },
        { status: 201 },
      );
    }
    default:
      return Response.json({ error: `${route} is not in the test fake` }, { status: 501 });
  }
}
