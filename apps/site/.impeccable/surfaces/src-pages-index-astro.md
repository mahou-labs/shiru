---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# shiru.sh landing page

Scope: `apps/site/src/pages/index.astro` and its content. The site also serves `/index.md` and `/llms.txt`. Visitor mode: Persuade.

Audience: engineers and DevRel at API and SDK companies, teams leaving Mintlify, indie and open-source maintainers.
Job: decide in seconds whether Shiru is worth joining the waitlist for.
Action: join the waitlist with an email. The form posts to the API's `waitlist.join`.
Proof on hand: the mechanism, demonstrated in product mocks. No customers, prices or metrics exist.

Constraints:
- Pre-launch. No trial claims.
- Keep the open-book logo.
- No fabricated proof. Synthetic demo content is labeled.
- GitHub is linked, but copy must not imply the engine is already in the repo.

Memorable moment: the hero shows a coding agent fetching a docs site's `llms.txt`, then a `.md` page, then answering correctly from it.

## Direction contract

THESIS: The category standard at top craft, alongside UserJot, Linear and Mintlify. A product-first landing page that makes "docs your users' AI agents can actually read" obvious in one viewport. It refuses metaphor-led layouts, text-only pages, template filler like eyebrows and pill badges, and fake social proof.

OWN-WORLD: The ground is a light neutral. The ink is deep slate. The brand is Shiru teal, carried by primary actions, focus and highlights. Product mocks are dark editor windows with real UI detail. Display and body are set in Schibsted Grotesk and code in JetBrains Mono. Corners are rounded at 10–16px on windows, with soft layered shadows. Dark mode is supported.

STORY: The visitor gets the promise from the headline. The hero mock shows an agent using Shiru docs. The Agents section shows the same page for people and as Markdown. "How it works" shows MDX in Git publishing on push. Features show the depth. Open source and per-team pricing remove the objections, and the FAQ answers the rest. The visitor joins the waitlist in the hero or at the close.

FIRST VIEWPORT: A sticky nav with the logo, anchors, GitHub and "Join waitlist". A centered H1 at clamp(2.75rem, 6vw, 4.75rem). The subhead sits at 60ch or less. The waitlist email form is inline, in working form. Under it, a large dark editor mock spans about 1100px: code on the left, an agent panel on the right that plays the fetch-and-answer sequence once. It is labeled as an illustrative example.

FORM: The category standard, taken as the standing exit at the user's request. No concept roll ran for this round, so there is no seed key.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: the hero agent sequence plays once on load, about 4s in total, using staggered tool-call rows and an answer fade on cubic-bezier(0.23,1,0.32,1). Under reduced motion it shows the final state immediately.

## Unresolved

- og:image does not exist yet.
- GitHub links stay, decided by the agent and not yet confirmed by the user. Copy says the engine moves into the public repo before launch.
