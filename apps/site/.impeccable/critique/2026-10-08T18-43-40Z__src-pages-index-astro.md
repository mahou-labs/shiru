---
target: apps/site landing page
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:/home/nchartiot/Code/shiru/apps/site/src/pages/index.astro"
target_fingerprint: "sha256:2989c872d4a2bdda315fa900099e096571d024e091cb4078b151aa45f6eb2ccf"
target_path: /home/nchartiot/Code/shiru/apps/site/src/pages/index.astro
timestamp: 2026-10-08T18-43-40Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review, B: detector + CDP browser evidence)

Design Health 21/32 (n/a: 7, 10). Scores: 1=3, 2=3, 3=3, 4=2, 5=2, 6=3, 8=3, 9=2.

Specificity: mostly category-interchangeable. Authored: hero Reader/Agent toggle, curl llms.txt terminal, commit list with Active chip. Template tells: eyebrow over every h2 (6), pill badge with middle-dot meta, pixel 01/02/03, equal step cards with nested sunken cards, border-l-2 brand accent, dot-grid halo, rounded card around the Open source section, Geist/Geist Mono (detector: overused-font).

Detector: src 2 (overused-font x2). dist 38 (cramped-padding 30 mostly false positives on hairline dividers/grids, nested-cards 4 mostly mockups, em-dash-overuse 1, aphoristic-cadence 1). Browser overlay: 22 anti-patterns, 17 low-contrast (CTA white-on-brand 4.49:1, fg-subtle ~4.1:1 small text). Mobile: layout viewport 434px on a 390px device (code panes not wrapping).

Priority issues:
- P0 CTA contradicts launch state: "Start free trial" x4, "30 days free. No credit card." x2, trial FAQ, all link to /login; no waitlist capture.
- P1 Template scaffolding drowns the one authored idea.
- P1 Hero differentiator hidden behind default Reader state and an instant visibility flip.
- P2 Light-mode contrast below AA on small text and on the primary button (hover lightens further).
- P2 Demo semantics/mobile: fake h2/h3 in page outline, unfocusable scroll panes, clipped .md URLs, ~44px horizontal overflow on phones.

Personas: Jordan hits login dead end and inert demo links; Riley finds trial vs pre-launch, self-host claim vs missing engine, raw <Callout> under "plain Markdown", U+2011 hostname; Casey gets no mobile nav, 32px toggle targets, sideways code scroll.

Minor: no skip link, no og:image, decorative pixel font preloaded, no ::selection/scrollbar theming, color-scheme only declared for dark, reduced motion zeroes everything, "Shiru fixes all three." unearned, "and friends".
