export interface CachedPage {
  html: string;
  version: number;
  renderedAt: number;
}

export class ISRCache {
  constructor(private kv: KVNamespace) {}

  /** Retrieves a cached HTML page from KV by hostname + path. Returns null on miss or if metadata is missing. */
  async get(hostname: string, path: string): Promise<CachedPage | null> {
    try {
      const key = `html:${hostname}:${path}`;
      const result = await this.kv.getWithMetadata<{
        version: number;
        renderedAt: number;
      }>(key);
      if (!result.value || !result.metadata) return null;
      return {
        html: result.value,
        version: result.metadata.version,
        renderedAt: result.metadata.renderedAt,
      };
    } catch {
      return null;
    }
  }

  /** Stores a rendered HTML page in KV with version and timestamp metadata. Expires after 7 days. */
  async set(hostname: string, path: string, html: string, version: number): Promise<void> {
    const key = `html:${hostname}:${path}`;
    await this.kv.put(key, html, {
      metadata: { version, renderedAt: Date.now() },
      expirationTtl: 604800, // 7 days
    });
  }
}
