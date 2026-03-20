import Cloudflare from "cloudflare";
import { env } from "cloudflare:workers";

let _client: Cloudflare | null = null;

export function getCloudflareClient(): Cloudflare {
  if (!_client) {
    _client = new Cloudflare({ apiToken: env.CLOUDFLARE_API_TOKEN });
  }
  return _client;
}

export function getZoneId(): string {
  return env.CLOUDFLARE_ZONE_ID;
}
