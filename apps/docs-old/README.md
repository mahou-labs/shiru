# Shiru Runtime Docs

This TanStack Start app serves documentation from runtime storage. Raw MDX is written to R2, document metadata is stored in D1, hot manifests are stored in KV, compiled artifacts are stored in R2 by content hash, and SSR HTML is cached at Cloudflare with versioned keys.

## Local development

```bash
cp .env.example .env.local
pnpm run cf-typegen
pnpm run dev
```

The app runs at http://localhost:3003.

## Publish a document

```bash
curl -X POST http://localhost:3003/api/content/publish \
  -H "Authorization: Bearer replace-with-local-token" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"local","slug":"index","mdx":"---\ntitle: Welcome\ndescription: Runtime docs from R2\norder: 1\n---\n\n## Start here\n\nShiru renders this page without a content build."}'
```

Expected response:

```json
{
  "siteId": "local",
  "slug": "index",
  "docId": "local:index",
  "siteVersion": "...",
  "contentHash": "..."
}
```

## Read the manifest

```bash
curl http://localhost:3003/api/content/manifest?siteId=local
```

Expected: JSON with `items` and `pages.index`.

## View the page

Open http://localhost:3003/docs in a browser. The rendered page should show the generated sidebar and the `Welcome` page content.
