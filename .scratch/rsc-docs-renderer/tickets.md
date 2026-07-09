# Tickets: RSC Documentation Renderer

Status: ready-for-agent

Tracer-bullet implementation tickets for the [RSC Documentation Renderer PRD](./PRD.md).

Work the **frontier**: any ticket whose blockers are all done. The initial frontier contains "Reserve valid Site Subdomains" and "Serve a basic published document locally".

## Reserve valid Site Subdomains

**What to build:** Organization creation and renaming accept only usable Site Subdomains, and availability feedback rejects the same invalid or Reserved Subdomain values before users can claim them.

**Blocked by:** None — can start immediately.

- [ ] Availability checking rejects non-DNS-label slugs and the reserved labels `app`, `api`, `docs`, `t`, and `www`.
- [ ] Organization creation and rename enforce the same policy before delegating to authentication, while valid slugs retain existing Documentation Delivery synchronization.
- [ ] API router-level behavior tests cover valid, invalid, and reserved Site Subdomains.

## Serve a basic published document locally

**What to build:** A local visitor can open `shiru.localhost:3000/getting-started` and receive a minimal Server-rendered Document from the Site Subdomain's Active Revision stored in shared local Cloudflare state.

**Blocked by:** None — can start immediately.

- [ ] The docs Worker uses the shared persisted local Cloudflare state and resolves the Site Subdomain through the site registry before reading source content.
- [ ] A minimal readable document is rendered by React Server Components without sending authored document code to the visitor.
- [ ] Unknown Site Subdomains, sites without an Active Revision, and missing documents return a non-disclosing 404; bare `localhost` is not a Site Subdomain.
- [ ] An HTTP-level docs Worker test proves the complete local hostname-to-document path.

## Enforce canonical Document Paths

**What to build:** Visitors receive stable canonical URLs for root and nested documents, while authors can publish only `.mdx` filenames that correspond to valid lowercase kebab-case Document Paths.

**Blocked by:** Serve a basic published document locally.

- [ ] The root resolves to `index.mdx`, nested Document Paths resolve to their matching source documents, and trailing slashes redirect to the canonical slashless URL.
- [ ] Publishing rejects `.mdx` filenames that cannot produce valid public Document Paths without weakening existing source-path safety checks.
- [ ] Request-level and publishing behavior tests cover root, nested, trailing-slash, and invalid-filename cases.

## Complete the safe Content-only MDX contract

**What to build:** A visitor receives rich, metadata-aware Documentation Markdown while authored content remains safe: no raw HTML, executable MDX, or unapproved Document Components can enter the page.

**Blocked by:** Serve a basic published document locally.

- [ ] Required Document Metadata sets the browser title, optional description sets SEO metadata, and metadata is absent from the visible body.
- [ ] CommonMark and GitHub-Flavored Markdown render on the Worker with stable Heading Anchors, including unique anchors for duplicate headings.
- [ ] Raw HTML, unknown JSX, imports, exports, expressions, and other executable MDX constructs fail with a generic public error; details remain server-side.
- [ ] An explicit empty Document Component registry seam exists for future Shiru-provided components.
- [ ] HTTP-level tests cover rendered content, metadata, heading anchors, and the safe failure boundary.

## Enable safe Internal Document Links

**What to build:** Documentation authors can link between Content-only MDX documents using repository-style relative links, and visitors receive safe canonical public navigation.

**Blocked by:** Enforce canonical Document Paths; Complete the safe Content-only MDX contract.

- [ ] Relative `.mdx` Internal Document Links render as extensionless public Document Paths while preserving query strings and fragment links.
- [ ] External links allow only `https:`, `http:`, `mailto:`, and `tel:`; relative and fragment-only links remain valid; unsafe protocols are rejected.
- [ ] Request-level tests cover nested relative links, anchors, query strings, allowed external URLs, and rejected unsafe URLs.
