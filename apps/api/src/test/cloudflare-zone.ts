import type { CustomHostnameRecord } from "../domains/cloudflare";

export const ZONE_ID = "zone1";
export const ZONE_TOKEN = "zone-token";
export const HOSTNAMES = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/custom_hostnames`;

type Recorded = { method: string; url: string; authorization: string | null; json?: unknown };

const json = (status: number, body: unknown) => Response.json(body, { status });
const envelope = (result: unknown) => ({ success: true, errors: [], messages: [], result });
const errorBody = (code: number, message: string) => ({
  success: false,
  errors: [{ code, message }],
  messages: [],
  result: null,
});

/**
 * An in-process stand-in for a Cloudflare for SaaS zone's custom hostname endpoints. A new
 * hostname waits for its CNAME, as a real one does until the customer adds the record.
 */
export class FakeCloudflareZone {
  requests: Recorded[] = [];
  hostnames = new Map<string, CustomHostnameRecord>();
  private overrides: { method: string; url: string; response: () => Response }[] = [];
  private created = 0;

  /** The next request with this method to exactly `url` gets `response` instead. */
  failNext(method: string, url: string, status: number, body: unknown) {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    this.overrides.push({ method, url, response: () => new Response(text, { status }) });
  }

  activate(id: string) {
    this.update(id, { status: "active", ssl: { status: "active", validation_errors: [] } });
  }

  update(id: string, fields: Partial<CustomHostnameRecord>) {
    const record = this.hostnames.get(id)!;
    this.hostnames.set(id, { ...record, verification_errors: [], ...fields });
  }

  fetch: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const recorded: Recorded = {
      method: request.method,
      url: request.url,
      authorization: request.headers.get("authorization"),
    };
    if (request.headers.get("content-type")?.startsWith("application/json")) {
      recorded.json = await request.json();
    }
    this.requests.push(recorded);

    const override = this.overrides.findIndex(
      (o) => o.method === request.method && o.url === request.url,
    );
    if (override !== -1) return this.overrides.splice(override, 1)[0]!.response();
    if (recorded.authorization !== `Bearer ${ZONE_TOKEN}`) {
      return json(403, errorBody(10000, "Authentication error"));
    }
    return this.route(recorded);
  };

  private route({ method, url, json: body }: Recorded): Response {
    if (method === "POST" && url === HOSTNAMES) {
      const { hostname } = body as { hostname: string };
      if ([...this.hostnames.values()].some((record) => record.hostname === hostname)) {
        return json(409, errorBody(1406, "Duplicate custom hostname found."));
      }
      const record: CustomHostnameRecord = {
        id: `ch-${++this.created}`,
        hostname,
        status: "pending",
        verification_errors: ["custom hostname does not CNAME to this zone."],
        ssl: { status: "pending_validation", validation_errors: [] },
      };
      this.hostnames.set(record.id, record);
      return json(201, envelope(record));
    }

    const id = url.startsWith(`${HOSTNAMES}/`) ? url.slice(HOSTNAMES.length + 1) : null;
    const record = id === null ? undefined : this.hostnames.get(id);
    if (!record) return json(404, errorBody(1436, "The custom hostname was not found."));
    if (method === "GET") return json(200, envelope(record));
    if (method === "DELETE") {
      this.hostnames.delete(record.id);
      return json(200, envelope({ id: record.id }));
    }
    return json(405, errorBody(10405, "Method not allowed"));
  }
}
