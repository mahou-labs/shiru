# Domain Docs

How engineering skills should consume this repo's multi-context domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT-MAP.md` at the repo root, if it exists. It points to the `CONTEXT.md` files relevant to each context.
- The relevant context's `CONTEXT.md`, such as one under `apps/<context>/` or `packages/<context>/`.
- `docs/adr/` for system-wide decisions and the relevant context's `docs/adr/` for scoped decisions.

If any of these files do not exist, proceed silently. The `domain-modeling` skill creates them when domain terms or decisions are actually resolved.

## File structure

```text
/
├── CONTEXT-MAP.md
├── docs/adr/                         ← system-wide decisions
├── apps/
│   └── <context>/
│       ├── CONTEXT.md
│       └── docs/adr/                 ← context-specific decisions
└── packages/
    └── <context>/
        ├── CONTEXT.md
        └── docs/adr/                 ← context-specific decisions
```

## Use the glossary's vocabulary

When naming a domain concept in an issue, refactor proposal, hypothesis, or test, use the term defined in the relevant `CONTEXT.md`. If a needed concept is absent, reconsider whether it is an existing concept or note the gap for `domain-modeling`.

## Flag ADR conflicts

Explicitly surface contradictions with existing ADRs rather than silently overriding them.
