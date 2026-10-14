# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Shiru serves three groups that all publish public documentation:

- Engineers and DevRel at developer-tools, API and SDK companies. They own public docs that people and coding agents read to integrate the product.
- Teams already on a hosted docs platform such as Mintlify. They want open source, self-hosting, or an end to per-seat pricing.
- Indie developers and open-source maintainers. They want good docs from a repository without paying per seat.

The shared job is to publish documentation that reads well to people and that coding agents can consume reliably.

## Product Purpose

Shiru is an open-source alternative to Mintlify. It turns MDX files in a team's repository into a published documentation site. It serves every page both as HTML for people and as Markdown for agents. Success means a team's docs are pleasant to read and are what agents actually use when they write code against the team's product.

## Positioning

Shiru stands apart from hosted docs platforms on three points:

- **Agents are first-class readers.** Every page is available as Markdown at its own URL, and an `llms.txt` file indexes the whole site. Agents read the source instead of scraping HTML.
- **Open source and self-hostable.** Teams can run Shiru themselves, and their content stays as files they own.
- **Priced per organization, not per seat.** The whole team can edit without seat math.

Publishing from Git is a capability, not a differentiator. Competitors offer it too.

## Operating Context

- Authors write MDX in their own Git repository. Pushing publishes, and each published version is identified by a Git commit, the "active revision".
- Readers browse pages at `<site-slug>.<docs domain>`. The docs domain is separate from `shiru.sh`, because client pages can run scripts and must not share cookies with the dashboard. The domain is not bought yet. The labels `app`, `api`, `docs`, `preview`, `t` and `www` are reserved.
- Agents fetch `/<path>/index.md` (the Nimbus default) or start from `/llms.txt`. Every HTML page links to its Markdown version with `<link rel="alternate" type="text/markdown">`.
- The dashboard is at `app.shiru.sh` and the API at `api.shiru.sh`.

## Capabilities and Constraints

- **Documentation MDX.** CommonMark plus GitHub-flavored Markdown (tables, task lists, strikethrough, autolinks), React components, imports, exports and expressions. Whatever Nimbus accepts builds.
- **Frontmatter.** YAML with a required `title` and an optional `description`, used for the browser title and SEO.
- **Links and anchors.** Links use site routes such as `/guides/setup/`, as in Nimbus. Shiru does not rewrite content, links or built files. Nimbus's own lint fails a publish on a link to a missing page. Headings get GitHub-style anchors.
- **Accounts and billing.** Email and password sign-in, organizations, and Polar billing with Starter and Growth plans, monthly or yearly. Each new organization gets a 30-day trial with no checkout required.
- **Launch state: pre-launch.** Marketing collects waitlist sign-ups. It does not offer self-serve trials yet.
- **Engine status.** The publishing pipeline is being built in this repository on Nimbus (`docs/plans/publishing-pipeline.md`). It does not publish sites yet.
- **Undecided.**
  - Prices. Do not publish any.
  - Custom domains, search, analytics and integrations. Do not claim them.
- **Waitlist.** The API's public `waitlist.join` procedure stores sign-ups in D1. The site posts to it.
- **GitHub.** The site links to the GitHub repository. The docs engine joins that repository before launch, so copy must not imply it is already there.

## Brand Commitments

- The name is "Shiru". The company is Mahou Labs.
- The logo is an open-book mark: `apps/site/public/favicon.svg`, with an inline variant in `apps/site/src/components/Logo.astro`.
- The source is at https://github.com/mahou-labs/shiru. The founder is on X at https://x.com/nchartiot.
- Voice is plain, specific and developer-to-developer, with no hype words.
- Marketing surfaces follow the category standard at top craft, alongside UserJot, Linear and Mintlify. Clarity and a product-first hero beat conceptual or metaphor-led layouts. The user chose this after rejecting a man-page concept as unmarketable.

## Evidence on Hand

- Product behavior and terminology live in `../shiru-old/CONTEXT.md` and the `shiru-old` docs and docs-builder apps.
- There are no customers, testimonials, logos, usage numbers, benchmarks or published prices. Never fabricate any of these.

## Product Principles

1. Both readers matter equally. Every capability should serve the person reading and the agent parsing.
2. The team owns its content. Docs stay as files in its repository, and leaving costs a `git clone`.
3. Claim only what ships. Unbuilt features, prices and social proof stay off every surface until they exist.
4. Don't charge for collaboration. Pricing never makes a team choose who gets to fix a typo.
