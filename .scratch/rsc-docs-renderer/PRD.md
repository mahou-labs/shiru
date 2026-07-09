# RSC Documentation Renderer

Status: ready-for-agent

## Problem Statement

Shiru can publish repository-authored MDX source into shared Cloudflare storage, but it has no application that renders that source as a public documentation site. An organization cannot yet visit a Site Subdomain such as `shiru.shiru.sh/getting-started` and read its published content. The existing docs application is a TanStack Start project with React Server Components enabled, but it still serves starter content.

## Solution

Turn the docs application into a hostname-aware Documentation Delivery renderer. The Worker will resolve a Site Subdomain to its Active Revision through the existing site registry, retrieve the matching Content-only MDX document from the shared source bucket, parse and render it on the server as a Server-rendered Document, and return a minimal readable content page.

The initial renderer will support Documentation Markdown, Document Metadata, Heading Anchors, and Internal Document Links without evaluating authored code on the Worker or in a visitor's browser. It will establish the safe Document Component registry seam without shipping custom components. Organization slugs will become valid Site Subdomains by enforcing DNS-label and Reserved Subdomain rules at the public API boundary.

## User Stories

1. As a documentation visitor, I want to open `shiru.shiru.sh/getting-started`, so that I can read Shiru's published getting-started guide.
2. As a documentation visitor, I want the root of a Site Subdomain to load its `index.mdx` document, so that every site has a natural landing page.
3. As a documentation visitor, I want nested paths such as `/guides/install` to load the matching nested document, so that documentation can be organized by topic.
4. As a documentation visitor, I want document pages to arrive already rendered, so that reading documentation does not depend on evaluating authored MDX or rendering the document in my device.
5. As a documentation visitor, I want readable semantic document content, so that I can consume a focused documentation page before navigation and product chrome are introduced.
6. As a documentation visitor, I want a document's title to appear in my browser title, so that tabs and history clearly identify the page.
7. As a documentation visitor, I want a document description to be exposed as SEO metadata, so that shared links and search engines receive useful page context.
8. As a documentation visitor, I want headings to have stable fragment targets, so that links such as `/getting-started#install` take me directly to the relevant section.
9. As a documentation visitor, I want duplicate headings to receive distinct fragment targets, so that every heading can be linked reliably.
10. As a documentation visitor, I want links to related documents to work from repository-style relative `.mdx` links, so that authors can maintain content relationships naturally in their repository.
11. As a documentation visitor, I want trailing-slash document URLs to canonicalize to slashless Document Paths, so that each document has one public URL.
12. As a documentation visitor, I want an unknown Site Subdomain, unpublished site, or missing document to return a simple 404, so that unavailable content is clear without revealing internal storage details.
13. As a documentation visitor, I want malformed documents and storage failures to return a safe generic error page, so that internal metadata, R2 keys, and parser details are never exposed.
14. As a documentation author, I want to write CommonMark and GitHub-Flavored Markdown in `.mdx` files, so that familiar tables, task lists, strikethrough, and autolinks render correctly.
15. As a documentation author, I want YAML frontmatter to define a required title and optional description without appearing in the document body, so that metadata and content remain separate.
16. As a documentation author, I want authored MDX to reject raw HTML, executable expressions, imports, exports, and unknown JSX, so that the supported content contract is predictable and safe.
17. As a future documentation author, I want an explicit Document Component allowlist seam, so that Shiru can safely introduce supported components later without allowing repository-authored React code.
18. As a local developer, I want to visit `shiru.localhost:3000/getting-started`, so that I can verify hostname-based rendering without changing my hosts file.
19. As a local developer, I want the docs app to share the API's persisted local Cloudflare state, so that a locally published Active Revision and its source objects can be rendered offline.
20. As an organization creator, I want the availability check to reject invalid or Shiru-owned subdomains before creation, so that I can choose a usable public documentation hostname.
21. As an organization creator, I want organization creation to enforce the same slug policy as availability checking, so that invalid Site Subdomains cannot bypass the user interface.
22. As an organization administrator, I want organization renaming to enforce the same slug policy, so that an existing documentation site cannot be renamed to an invalid or Reserved Subdomain.
23. As a platform operator, I want `app`, `api`, `docs`, `t`, and `www` protected from organization claims, so that established Shiru services keep their hostnames.
24. As a platform operator, I want public Document Paths and published MDX filenames to use lowercase kebab-case segments, so that public URLs are stable and case ambiguity is avoided.

## Implementation Decisions

- Replace the docs starter routes with a single document-rendering route shape that handles the root and every catch-all Document Path. The root resolves to `index.mdx`; non-root paths resolve to the same path with an `.mdx` suffix. Trailing slashes redirect to the slashless canonical URL.
- Resolve the Site Subdomain from the request host. In local development, the convention is `{site-subdomain}.localhost:3000`; bare `localhost` does not identify a documentation site. Production host parsing will support `{site-subdomain}.shiru.sh`, but this work does not configure the production wildcard route.
- Use the existing site KV record to resolve the Site Subdomain's Active Revision and storage prefix, then read the document source from the shared source R2 bucket using the published object-key convention.
- Add the docs Worker's KV and R2 bindings and configure its Cloudflare Vite integration to share the API's persisted local Cloudflare state. Local development must remain offline and use local resource simulations, not remote bindings.
- Render Content-only MDX on the Worker for each request. Parse the source into a controlled content tree and render it as React Server Components; do not compile or evaluate generated MDX JavaScript, use runtime evaluation, or send authored document code to visitors.
- Recognize CommonMark plus GitHub-Flavored Markdown. Generate GitHub-style lowercase Heading Anchors, adding numeric suffixes where headings repeat.
- Parse YAML Document Metadata, remove it from the visible document body, require a non-empty `title`, and accept an optional `description`. Use the metadata for the browser title and SEO metadata.
- Rewrite Internal Document Links that use relative `.mdx` paths to extensionless public Document Paths while retaining their query strings and fragments. Preserve external URLs. Accept only `https:`, `http:`, `mailto:`, and `tel:` external protocols, plus relative and fragment-only links.
- Reject raw HTML, unknown JSX, imports, exports, JavaScript expressions, and all non-allowlisted Document Components. Introduce an empty explicit component registry/harness only; no custom Document Components are included in this slice.
- Render only a minimal semantic main/article content shell with readable typography and constrained width. The visible document heading remains authored content rather than an injected metadata title.
- Treat Document Assets as a separate delivery concern. Relative images, downloads, and other local non-MDX files are not served by this renderer slice; absolute external image URLs may render normally.
- Return a generic 404 for an unknown Site Subdomain, a site with no Active Revision, or a missing document. Return a generic 500 for invalid content or storage failures while retaining detailed diagnostics server-side only.
- Define a shared organization-slug policy for Site Subdomains: lowercase letters and digits with internal hyphens only, no leading or trailing hyphen, no dots, whitespace, or uppercase. Reserve `app`, `api`, `docs`, `t`, and `www`.
- Apply the organization-slug policy consistently to availability checking, creation, and rename inputs before delegating to the authentication provider. There are no existing users, so no migration or grandfathering behavior is needed.
- Validate published `.mdx` filenames against the lowercase kebab-case Document Path contract during publishing. Existing storage-path safety validation continues to protect all source objects.
- Regenerate the file-based route tree and Worker binding types as part of the feature so the new routes and Cloudflare bindings remain type-safe.

## Testing Decisions

- Test externally observable behavior rather than parser implementation details, internal React component structure, or individual R2 method calls.
- Add one highest-level docs application request seam that runs the Worker with local KV/R2 state and exercises requests with concrete hostnames and paths. It should prove Site Subdomain resolution, Active Revision lookup, source retrieval, metadata in the response, canonical redirects, rendered Markdown/GFM, Heading Anchors, Internal Document Link rewriting, and 404/500 outcomes.
- The docs request seam should also prove that forbidden Content-only MDX constructs fail safely and that authored source or raw parser errors do not appear in public responses.
- Cover local-host behavior through `shiru.localhost` and verify that bare `localhost` does not resolve a Site Subdomain.
- Keep organization-slug policy coverage at the existing API router-client seam. Verify availability, creation, and rename reject invalid DNS labels and Reserved Subdomains while valid slugs continue to reach the authentication provider and preserve current site-registry synchronization behavior.
- Follow the existing API router test style, which constructs an oRPC router client with mocked authentication and database dependencies. The docs app has no current test seam, so add only the Worker request-level harness needed to test public rendering behavior.
- Include regression cases for nested Document Paths, the root `index.mdx`, duplicate heading anchors, required metadata, unsafe URL schemes, raw HTML, unknown JSX, executable MDX syntax, and case-invalid published MDX filenames.

## Out of Scope

- Production wildcard DNS, Worker routing, and Cloudflare zone configuration for `*.shiru.sh`.
- A second dedicated domain for customer documentation.
- Persistent document, parser, R2, CDN, or edge caching.
- Replacing the Active Revision Git-commit model.
- Static distribution output or changes to the existing publishing workflow beyond Document Path filename validation.
- Document Assets, including local images, downloads, and their URL/path contract.
- Navigation, sidebars, table-of-contents UI, search, version selectors, branding, analytics, or other documentation chrome.
- Shipped custom Document Components, including interactive copy buttons; only the safe registry seam is introduced.
- User-authored React components, executable MDX, raw HTML, runtime MDX evaluation, and client-side document rendering.
- Data migration or compatibility behavior for pre-existing invalid organization slugs; there are no existing users.

## Further Notes

- This PRD uses the Documentation Delivery vocabulary in `CONTEXT.md`, especially Site Subdomain, Active Revision, Content-only MDX, Document Path, Server-rendered Document, and Document Component.
- The docs project already has React Server Components enabled and the API already publishes source objects plus an Active Revision record. The renderer consumes those existing publication boundaries rather than introducing a new database lookup path.
- Before enabling public production traffic, wildcard routing must be audited against the existing `app.shiru.sh`, `api.shiru.sh`, `docs.shiru.sh`, `t.shiru.sh`, and `www.shiru.sh` hostnames.
