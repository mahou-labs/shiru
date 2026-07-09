# Documentation Delivery

Documentation Delivery publishes and serves an organization's documentation site from its authored content.

## Language

**Site Subdomain**:
The public hostname label for a documentation site. It is the owning organization's lowercase DNS-label slug, such as `shiru` in `shiru.shiru.sh`.
_Avoid_: Tenant subdomain, customer subdomain

**Reserved Subdomain**:
A Shiru-owned hostname label that cannot be an organization's Site Subdomain. Known reserved labels are `app`, `api`, `docs`, `t`, and `www`.
_Avoid_: Organization slug, Site Subdomain

**Content-only MDX**:
An authored documentation document that may use Documentation Markdown, Document Metadata, and Shiru-provided Document Components. It cannot contain raw HTML, unknown JSX, imports, exports, or repository-authored React or JavaScript code.
_Avoid_: Executable MDX, custom MDX components

**Document Path**:
The lowercase kebab-case, extensionless path in a documentation URL that maps exactly to a Content-only MDX object. The root path maps to `index.mdx`; every other path maps to the same path with an `.mdx` suffix.
_Avoid_: Route slug, file path

**Active Revision**:
The currently published content revision for a Site Subdomain. Until the publishing model changes, it is identified by a Git commit SHA and determines the R2 source-object prefix read by the renderer.
_Avoid_: Live commit, active commit

**Server-rendered Document**:
A Content-only MDX document that is parsed and rendered on the documentation Worker. Visitors receive rendered content rather than authored MDX or executable document code.
_Avoid_: Client-rendered document, compiled document bundle

**Document Component**:
A Shiru-provided, allowlisted presentation component available in Content-only MDX. It may include narrowly scoped client interaction, but authors cannot provide component implementations or executable behavior.
_Avoid_: Custom MDX component, user component

**Documentation Markdown**:
The Markdown syntax accepted in a Content-only MDX document: CommonMark plus GitHub-Flavored Markdown extensions such as tables, task lists, strikethrough, and autolink literals.
_Avoid_: Plain Markdown, repository Markdown

**Document Metadata**:
YAML frontmatter attached to a Content-only MDX document and excluded from its visible body. Its `title` supplies the browser title and its `description` supplies SEO metadata.
_Avoid_: Page configuration, visible document content

**Valid Document Metadata**:
Document Metadata with a non-empty `title`; its `description` is optional. A document without valid metadata is not renderable.
_Avoid_: Untitled document, inferred document title

**Document Asset**:
A non-MDX file referenced by a Content-only MDX document, such as an image or downloadable file. It is distinct from a document and will have its own delivery contract.
_Avoid_: Document, content page

**Internal Document Link**:
A relative link from one Content-only MDX document to another. It is authored with a relative `.mdx` path and rendered as an extensionless public Document Path, preserving anchors and query strings.
_Avoid_: Asset link, external link

**Heading Anchor**:
A stable, GitHub-style lowercase identifier generated from a document heading. It supports fragment links to document sections and uses numeric suffixes for duplicate headings.
_Avoid_: Table-of-contents entry, document path
