# Publishing pipeline plan

This plan builds the pipeline in `docs-platform-architecture.md`. When it is done, a published commit becomes a live docs site at `<slug>.shiru.sh`. Each unit below is one commit, or a short stack, and ends in a check that someone else can rerun. Units that need a real Cloudflare account are last, so the work that can be proven on one machine lands first.

The decision log is `.audit/publishing-pipeline.tsv`.

## Definition of done

The pipeline is done when one script does all of the following against a staging dispatch namespace:

1. It creates a managed site.
2. It saves a draft and publishes it.
3. It fetches `https://<slug>.<platform domain>/`.
4. It gets back the page it published, as HTML at the page URL and as Markdown at `/<path>.md`.

## What the research changed

Three facts from October 2026 change section 5 and section 13 of the architecture doc. The doc is updated in unit 0.

- **Sandbox SDK 1.0** (2026-09-30) removed `getSandbox()` and string `exec()`. The build sandbox is now our own Durable Object class that drives `ctx.container`. The Workflow calls an RPC method on it. The image is any base with `sandbox-shim` copied in from `cloudflare/sandbox:1.0.0`.
- **Artifacts** has no tarball endpoint and no commit method in its binding.
  - The Workflow reads a commit with `readTree` and `readBlob` and writes the files into the sandbox. The sandbox still holds no credentials.
  - The SiteDO commits with isomorphic-git, pushing to the repo remote with a short-lived token.
  - Clients can `git push` to a managed repo. Managed sites therefore need a push trigger, which is the `cf.artifacts.repo.pushed` event delivered through Queues.
- **Dispatch namespaces and Artifacts** only run against the real service. `cf dev` can't emulate them. Containers and Workflows do run locally, and containers need Docker.

## Units

| #   | Unit                                                                                                                                                                                                         | Needs a Cloudflare account | Check                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| 0   | Update the architecture doc with the research above                                                                                                                                                          | No                         | Review                                                                                               |
| 1   | Domain model: slugs, labels, Worker names, hostname parsing, `SiteSource`, D1 `sites` and `hostnames`, `sites.create` and `sites.list`, and the per-target build state machine as a pure transition function | No                         | `vp run test` with coverage thresholds                                                               |
| 2   | Builder image: Nimbus template, `docs.config.json` schema, `build-site`, MDX restrictions                                                                                                                    | No (Docker)                | `apps/builder/scripts/verify.sh` builds the image and runs fixtures that should pass and should fail |
| 3   | `BuilderSandbox` DO on Sandbox 1.0, plus the `PublishWorkflow` build step, run under `cf dev`                                                                                                                | No (Docker)                | A script triggers a build of a fixture under `cf dev` and reads the manifest back                    |
| 4   | Assets deployer: manifest hashing, the upload session, buckets, and the script PUT                                                                                                                           | Yes                        | Pure parts are unit tested. Live, upload a fixture `dist/` to a staging namespace and fetch it       |
| 5   | Dispatch Worker (`apps/dispatch`): hostname to Worker name, 404s, preview `noindex`                                                                                                                          | Yes for live               | Unit tests on routing. Live, fetch a staging site                                                    |
| 6   | SiteDO: drafts, tree cache, `publish` through isomorphic-git to Artifacts, build coordination using the state machine from unit 1, and the alarm                                                             | Yes                        | End-to-end script from the definition of done                                                        |
| 7   | Editor and site pages in the dashboard                                                                                                                                                                       | No                         | `verify-shiru` in the browser                                                                        |
| 8   | Connected GitHub sources: App, webhooks, `onPush`, PR previews                                                                                                                                               | Yes (GitHub App)           | Webhook signature tests plus a live push                                                             |
| 9   | Preview access handoff, custom hostnames, cron cleanup                                                                                                                                                       | Yes                        | Live                                                                                                 |

Units 1 and 2 touch disjoint files and run in parallel. Unit 3 needs both. Unit 4 can start as soon as an account is available.

## Gates that need the operator

- A Cloudflare API token with Workers Scripts Write, Artifacts, and Containers for the account, and the name of a staging dispatch namespace. Units 4 to 6 and 8 to 9 stop at their live check until this exists.
- Any deploy to production.
