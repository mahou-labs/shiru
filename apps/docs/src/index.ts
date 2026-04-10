import { env } from "cloudflare:workers";

export type DocsEdgeEnv = typeof env;

export function getDocsSiteKvKey(slug: string) {
  return `docs:site:${slug}`;
}

function parseReservedSubdomains(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((segment) => segment.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getSlugFromHostname(
  hostname: string,
  rootDomain: string,
  reservedSubdomains: Set<string>,
) {
  const normalizedHost = hostname.toLowerCase();
  const normalizedRootDomain = rootDomain.toLowerCase();

  if (normalizedHost === normalizedRootDomain) {
    return null;
  }

  const suffix = `.${normalizedRootDomain}`;
  if (!normalizedHost.endsWith(suffix)) {
    return null;
  }

  const subdomain = normalizedHost.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes(".")) {
    return null;
  }

  if (reservedSubdomains.has(subdomain)) {
    return null;
  }

  return subdomain;
}

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return "";
  }

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  if (segments.some((segment) => segment === "." || segment === ".." || segment.includes("\\"))) {
    return null;
  }

  return segments.join("/");
}

function buildCandidateKeys(prefix: string, pathname: string) {
  if (!pathname) {
    return [`${prefix}/index.html`];
  }

  if (pathname.endsWith("/")) {
    return [`${prefix}/${pathname}index.html`];
  }

  return [
    `${prefix}/${pathname}`,
    `${prefix}/${pathname}.html`,
    `${prefix}/${pathname}/index.html`,
  ];
}

async function getObjectForPath(bucket: R2Bucket, prefix: string, pathname: string) {
  const objects = await Promise.all(
    buildCandidateKeys(prefix, pathname).map((key) => bucket.get(key)),
  );

  const object = objects.find((value) => value !== null);
  if (object) {
    return object;
  }

  return null;
}

async function readDocsSiteFromD1(
  slug: string,
): Promise<{ activeCommitSha: string; storagePrefix: string } | null> {
  const row = await env.DB.prepare(
    `select ds.active_commit_sha as activeCommitSha, ds.storage_prefix as storagePrefix
     from organizations o
     join docs_sites ds on ds.organization_id = o.id
     where o.slug = ?
     limit 1`,
  )
    .bind(slug)
    .first<{ activeCommitSha: string | null; storagePrefix: string }>();

  if (!row?.activeCommitSha) {
    return null;
  }

  return {
    activeCommitSha: row.activeCommitSha,
    storagePrefix: row.storagePrefix,
  };
}

async function getDocsSiteForSlug(slug: string) {
  const cached = await env.DOCS_KV.get<{ activeCommitSha: string; storagePrefix: string }>(
    getDocsSiteKvKey(slug),
    "json",
  );

  console.log({ slug, cached });

  if (cached?.activeCommitSha && cached.storagePrefix) {
    return cached;
  }

  const record = await readDocsSiteFromD1(slug);

  if (record) {
    void env.DOCS_KV.put(getDocsSiteKvKey(slug), JSON.stringify(record));
  }

  return record;
}

function buildResponse(method: string, object: R2ObjectBody, status: number) {
  const headers = new Headers();

  if (object.writeHttpMetadata) {
    object.writeHttpMetadata(headers);
  } else if (object.httpMetadata) {
    if (object.httpMetadata.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }
    if (object.httpMetadata.cacheControl) {
      headers.set("cache-control", object.httpMetadata.cacheControl);
    }
  }

  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  return new Response(method === "HEAD" ? null : object.body, {
    headers,
    status,
  });
}

export async function handleDocsRequest(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      headers: { allow: "GET, HEAD" },
      status: 405,
    });
  }

  const host = request.headers.get("host")?.split(":")[0];
  if (!host) {
    return new Response("Missing Host header", { status: 400 });
  }

  const slug = getSlugFromHostname(
    host,
    env.DOCS_ROOT_DOMAIN,
    parseReservedSubdomains(env.RESERVED_SUBDOMAINS),
  );

  if (!slug) {
    return new Response("Not Found", { status: 404 });
  }

  const site = await getDocsSiteForSlug(slug);
  if (!site) {
    return new Response("Not Found", { status: 404 });
  }

  const pathname = normalizePathname(new URL(request.url).pathname);
  if (pathname === null) {
    return new Response("Not Found", { status: 404 });
  }

  const prefix = `${site.storagePrefix}/${site.activeCommitSha}`;
  const object = await getObjectForPath(env.DOCS_DIST, prefix, pathname);

  if (object) {
    return buildResponse(request.method, object, 200);
  }

  const notFoundObject = await env.DOCS_DIST.get(`${prefix}/404.html`);
  if (notFoundObject) {
    return buildResponse(request.method, notFoundObject, 404);
  }

  return new Response("Not Found", { status: 404 });
}

export default {
  fetch(request: Request) {
    return handleDocsRequest(request);
  },
};
