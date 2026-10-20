# Docs Platform Architecture

An open-source docs platform, hosted as a SaaS on Cloudflare. Clients write documentation in a web
editor or in their own GitHub repo, and their docs site goes live within seconds of a publish or a
push. Each client site is a [Nimbus](https://nimbus-docs.com/) (Astro) static site, built in a
Cloudflare Sandbox and served by its own Worker in a Workers for Platforms dispatch namespace.

Everything runs on Cloudflare. There is no external CI. Built files live on the site Workers, and
uploaded images live in R2 only until they are committed.

The code is open source, and the hosted service is the main way to run it. Self-hosting needs a
Cloudflare account with Workers for Platforms, Containers, and Cloudflare for SaaS, plus your own
GitHub App for connected repos.

---

## 1. Overview

Every site has a Git repo as its source. A build takes a commit SHA and nothing else, so it does not
matter whether the commit came from the web editor, a `git push`, or a rollback.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                               WRITING                                       │
│                                                                            │
│  Editor UI ──autosave──▶ App Worker ──▶ Doc (drafts)                    │
│  Editor UI ──Publish───▶ App Worker ──▶ Doc ──commit──▶ site repo       │
│  git push / PR ─────────────────────────────────────────▶ site repo        │
└────────────────────────────────────────────────────────────────────────────┘
                                                                 │
              site repo = Artifacts repo (managed) or GitHub repo (connected)
                                                                 │
                           managed: Doc starts the build after its commit
                           connected: push / pull_request webhook → Doc
                                                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              BUILDING                                       │
│                                                                            │
│  Doc.build(target, sha) → PublishWorkflow                               │
│    step: fetch   → download the tarball for sha, write it into the sandbox │
│    step: build   → Sandbox: validate config → astro build → dist/          │
│    step: deploy  → Workflow uploads dist/ through the assets upload API    │
│    step: report  → Doc.buildFinished(...)  (success or failure)         │
└────────────────────────────────────────────────────────────────────────────┘
                                                                 │
                                                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                               SERVING                                       │
│                                                                            │
│  visitor ─▶ acme.docs.yoursaas.com / docs.acme.com / pr-12--acme.preview…  │
│               │                                                            │
│               ▼                                                            │
│        Dispatch Worker  ── hostname → Worker name ──▶ env.DISPATCHER.get() │
│                                                                            │
│        Dispatch namespace "shiru-docs"                                     │
│          [acme]  [acme--draft]  [acme--pr-12]  [globex]  ...               │
│          one user Worker per site and per preview, each with its assets    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Components

| Component       | Cloudflare product                        | Count                             | Responsibility                                                                           |
| --------------- | ----------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| Editor UI       | Static assets on the App Worker           | 1                                 | File tree, MDX editor, autosave indicator, Publish button, publish status, conflict view |
| App Worker      | Worker                                    | 1                                 | Auth, editor API, GitHub webhooks, routes requests to the right Doc                      |
| Doc             | Durable Object (SQLite storage)           | 1 per site                        | Drafts, tree cache, publish state, build lock and coalescing, reconciliation alarm       |
| Site repo       | Artifacts (managed) or GitHub (connected) | 1 per site                        | Source of truth for content and config; one commit per publish                           |
| Upload staging  | R2                                        | 1 bucket                          | Images uploaded in the editor, held until the next publish commits them                  |
| PublishWorkflow | Workflows                                 | 1 class                           | Durable, retried fetch, build, deploy, report                                            |
| Build sandbox   | Sandbox (Containers)                      | 1 per site and target (kept warm) | Runs `astro build` on untrusted content. Holds no credentials                            |
| Sandbox image   | Container image                           | 1 per template version            | Nimbus template + pre-installed `node_modules`                                           |
| Site Workers    | Workers for Platforms user Workers        | 1 per site, plus previews         | Serve the built static site                                                              |
| Dispatch Worker | Worker + dispatch namespace binding       | 1                                 | Maps hostname to Worker name, gates previews                                             |
| Platform DB     | D1                                        | 1                                 | Clients, sites, site sources, hostnames, users, memberships                              |
| Hostname cache  | KV                                        | 1                                 | Hostname to site lookup for the Dispatch Worker                                          |

---

## 3. Site sources

### The source of truth is a Git repo

A site's source is stored in D1 as a discriminated union:

```ts
type DocSource =
  | { kind: "managed"; artifactsRepo: string }
  | {
      kind: "github";
      installationId: number; // GitHub App installation
      repo: string; // "acme/acme"
      branch: string; // "main"
      docsRoot: string; // "docs/", for monorepos
      editorWrites: "direct" | "pull_request";
    };
```

- **Managed.** The platform owns the repo in Artifacts. The web editor is the usual writer. This suits
  teams with no developers in the loop. Artifacts also accepts `git push` from anyone holding a repo
  token, so a managed site reacts to the `cf.artifacts.repo.pushed` event (delivered through Queues)
  the same way a connected site reacts to a GitHub push. The Doc commits through isomorphic-git,
  because the Artifacts binding reads repos but cannot write them.
- **Connected.** The client owns the repo on GitHub. Developers push and review there, and the web
  editor commits to the same repo through the GitHub App.

Two kinds cover the product. Add a third kind (GitLab, for example) when someone asks for it, not
before.

### What a site repo contains

A site repo holds a complete Nimbus project under `docsRoot`, started from the template in
`packages/site-template`. Only the template's dependencies ship in the sandbox image:

```
docs/
  package.json, package-lock.json, astro.config.ts, nimbus.json
  docs.config.json      # site name, logo, navigation
  src/content/docs/**   # pages
  public/**             # images and files served from the site root
  src/components/**, src/layouts/**, src/pages/**, src/styles/**
```

`docs.config.json` has a published JSON Schema with a `version` field. It is the platform's public
API, so change it the way you change any public API. The build validates it before Astro runs, so a
bad config fails with `sidebar[2].href is not a valid path` and not with an Astro stack trace.

### Moving between modes

Both modes are plain Git, so a site keeps its full history when it moves.

- **Managed to connected.** Push the Artifacts history to the client's new GitHub repo, then switch
  `source.kind`. This is the "take your docs and leave" path an open-source product should have.
- **Connected to managed.** Import the GitHub repo into a new Artifacts repo, then switch
  `source.kind`.

---

## 4. Editing: drafts and autosave

### Doc, one Durable Object per site

A Durable Object has its own storage, and there is exactly one instance per name. It handles
requests one at a time. `Doc("acme")` is the single place where everything about Acme's site is
coordinated.

**Storage (SQLite inside the DO):**

```sql
-- unpublished edits
drafts(
  path TEXT PRIMARY KEY,
  op TEXT,              -- 'put' | 'delete'
  content TEXT,         -- NULL when op = 'delete'; R2 key for binary uploads
  base_blob_sha TEXT,   -- blob the edit started from; NULL for a new file
  conflict INTEGER,     -- 1 when the file changed upstream after the edit started
  updated_at INTEGER,
  updated_by TEXT
)

-- the repo at head_sha, so the editor never reads from Git on the hot path
tree(path TEXT PRIMARY KEY, blob_sha TEXT)
blobs(blob_sha TEXT PRIMARY KEY, content TEXT)   -- text files only

-- one row per build target: 'live', 'draft', 'pr-12', ...
targets(
  target TEXT PRIMARY KEY,
  state TEXT,           -- idle | building | failed
  building_sha TEXT,
  workflow_id TEXT,
  pending_sha TEXT,     -- set when a build is requested while one runs
  deployed_sha TEXT,
  template_version TEXT,
  last_error TEXT,
  updated_at INTEGER
)

meta(key TEXT PRIMARY KEY, value TEXT)
  -- head_sha, build_seq
```

`head_sha` and the `live` target's `deployed_sha` are separate on purpose:

- **`head_sha`** is the latest commit on the site's branch. The editor reads from it, and the next
  commit builds on it.
- **`deployed_sha`** is what visitors see. It trails `head_sha` while a build runs, and it stays
  behind when a build fails.

Blob SHAs are content hashes, so `blobs` rows never go stale. When `head_sha` moves, the DO updates
`tree` and fetches only the blobs it does not have.

**API (called from the App Worker):**

| Method                                      | What it does                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `getTree()` / `getFile(path)`               | Returns the draft if one exists, otherwise the file at `head_sha` from the tree cache |
| `saveDraft(path, content, user)`            | Upserts a `put` draft. Sets `base_blob_sha` on the first edit of a file               |
| `uploadAsset(path, bytes, user)`            | Writes the bytes to R2 staging and records a `put` draft pointing at the R2 key       |
| `deleteFile(path)` / `renameFile(from, to)` | Records a `delete` draft. A rename is a `delete` plus a `put`                         |
| `resolveConflict(path, choice)`             | Keeps the draft (rebasing `base_blob_sha` to the new blob) or discards it             |
| `publish(user)`                             | Commits drafts to the site repo. See section 5                                        |
| `onPush(ref)`                               | Called for a connected site's push webhook. See section 6                             |
| `build(target, sha)`                        | Starts or queues a build. See section 5                                               |
| `buildFinished(target, workflowId, result)` | Called by the Workflow on success and on failure                                      |
| `status()`                                  | Per-target state, `head_sha`, unpublished drafts, conflicts                           |

### Autosave

- The editor debounces input (about 1s) and calls `saveDraft`. Drafts are stored only in the DO.
- The site repo is written only on Publish. So:
  - Artifacts and GitHub usage do not depend on how much people type.
  - Git history is a clean list of published versions.
  - Autosave stays fast, with no Git round trip.
- Uploaded images stay in R2 staging until a publish commits them into `public/`. After that, they
  live in the repo like every other file, and the build reads them from there. A cron trigger deletes
  staging objects that no draft references.

### Conflicts

A connected repo can change under an open draft. When `head_sha` moves, the DO compares each
draft's `base_blob_sha` with the file's new blob SHA:

- **Same blob.** The push did not touch the file. Nothing changes.
- **Different blob.** The DO sets `conflict = 1`. The editor shows the upstream version next to the
  draft. Publish skips conflicted files until someone resolves them.

Managed sites have one writer, so they never see a conflict. They run the same code.

---

## 5. Publishing and building

Publishing has two halves:

1. **Commit.** Turn drafts into a commit on the site's branch. This depends on the source kind.
2. **Build.** Build and deploy a given SHA to a given target. This is the same for every source kind.

### Commit

`publish(user)` does the following:

1. Collect the non-conflicted drafts.
2. Create one commit whose parent is `head_sha`, with the user as author.
   - **Managed.** Commit to the Artifacts repo.
   - **Connected, `editorWrites: "direct"`.** Create the tree and commit through the GitHub API, then
     update the branch ref with `force: false`.
   - **Connected, `editorWrites: "pull_request"`.** Commit to a branch `docs-editor/<user>-<n>` and
     open or update a pull request. The site goes live when someone merges it.
3. If the ref update fails because the branch moved, run `onPush` to refresh `head_sha` and conflicts,
   then retry from step 1.
4. Set `head_sha` to the new commit. Clear each committed draft whose `updated_at` has not changed
   since step 1, so edits made during the commit are kept.
5. Start the build.
   - **Managed.** Call `build("live", sha)`.
   - **Connected.** Do nothing. The push webhook for the new commit starts the build (section 6), the
     same way it does for a developer's push. This gives one build path for connected sites, not two.

### Build

`build(target, sha)` keeps one build per target at a time:

```
build(target, sha):
  if targets[target].state == building:
    targets[target].pending_sha = sha          # latest request wins
    return "queued"
  seq = ++build_seq
  workflow_id = `${site}-${target}-${seq}`
  targets[target] = { state: building, building_sha: sha, workflow_id, ... }
  set alarm(now + 15 minutes)
  PublishWorkflow.create({ id: workflow_id, params: { site, target, sha, docUrl, docsRoot } })

buildFinished(target, workflow_id, result):
  if workflow_id != targets[target].workflow_id: return   # stale report
  if result.ok: deployed_sha = building_sha, template_version = result.templateVersion, state = idle
  else:         state = failed, last_error = result.error
  if pending_sha: sha = pending_sha, pending_sha = NULL, build(target, sha)
```

Rules:

- **One build at a time per target.** A publish during a build only sets `pending_sha`. Any number of
  clicks or pushes results in at most one extra build, and that build uses the latest SHA. A pending
  build also runs after a failure, because the new commit may fix it.
- **Workflow IDs include a sequence number.** `${site}-${target}-${seq}` never repeats. Rebuilding the
  same SHA is normal: a rollback, a template upgrade, a preview and a live build of one commit.
- **The DO records the workflow ID before it calls `create`.** If the DO is evicted between those two
  steps, the alarm finds a build with no running instance and starts it again.
- **The alarm reconciles stuck builds.** When it fires, the DO reads the workflow instance status. If
  the instance finished, the DO applies the result. If the instance is missing or errored, the DO
  marks the target `failed` and drains `pending_sha`. A crash anywhere in the sequence ends in
  `idle` or `failed`, never in `building` forever.
- **Stale reports are ignored.** `buildFinished` checks the workflow ID, so a late report from an old
  instance cannot overwrite a newer build's state.

### PublishWorkflow

```ts
type Params = { site: string; target: string; sha: string; docUrl: string; docsRoot: string };

export class PublishWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event, step) {
    const { site, target, sha, docUrl, docsRoot } = event.payload;
    const siteDO = this.env.DOCS.getByName(site);
    const builder = this.env.BUILDER.getByName(`build-${site}-${target}`);

    try {
      await step.do("fetch", async () => {
        // Artifacts or GitHub, by source kind. The files go in through RPC, so no token enters the container.
        const files = await readSourceFiles(this.env, site, sha, docsRoot);
        await builder.reset(files);
      });

      const result = await step.do("build", { retries: { limit: 2, delay: "5 seconds" } }, () =>
        builder.build({ docUrl }),
      );

      await step.do("deploy", { retries: { limit: 3, delay: "5 seconds" } }, async () => {
        await deployAssets(this.env, workerName(site, target), builder, result.manifest);
      });

      await step.do("report", async () => {
        await siteDO.buildFinished(target, event.instanceId, {
          ok: true,
          templateVersion: result.templateVersion,
        });
      });
    } catch (error) {
      await step.do("report-failure", async () => {
        await siteDO.buildFinished(target, event.instanceId, {
          ok: false,
          error: redactLog(error),
        });
      });
    }
  }
}
```

This is illustrative. `BUILDER` is our own Durable Object class with a container attached. Sandbox SDK
1.0 removed `getSandbox()` and string `exec()`, so the class starts the container through
`ctx.container`, runs commands as argv arrays, and moves files with the SDK's `Files` helper. The
Workflow only calls its RPC methods (`reset`, `build`, and reads of `dist/`).

- **The build always starts from a fresh `/work`.** `reset` empties `/work` and writes every file of
  one SHA, so a file deleted in the repo cannot survive in a warm sandbox. Fetching by SHA also works
  for any commit, including rollbacks and pull request heads.
- **Sources are read file by file.** Artifacts has no tarball endpoint, so the Workflow walks the
  commit's tree with `readTree` and `readBlob`, limited to `docsRoot`. GitHub has a tarball endpoint,
  and the Workflow unpacks it before calling `reset`.
- **`build-site` is a script in the image.** It validates `docs.config.json`, links the image's
  `node_modules` into the project, runs `astro build`, and prints the template version.
- **The sandbox holds no credentials.** The Workflow fetches the source and deploys the assets. The
  sandbox only turns files into other files. See section 9.

### Sandbox image

```Dockerfile
FROM node:24-trixie-slim
COPY --from=docker.io/cloudflare/sandbox:1.0.0 /usr/local/bin/sandbox-shim /usr/local/bin/sandbox-shim
COPY packages/site-template/package*.json /template/
RUN cd /template && npm ci         # deps baked in, so no install per build
COPY build-site /usr/local/bin/
```

The container starts with `enableInternet: false`, so the build has to work offline. The
`cloudflare/sandbox` tag must match the `@cloudflare/sandbox` npm version.

- Every site starts from your template, so dependencies are installed once, in the image.
- Each image has a template version. Each target records the `template_version` it was built with,
  so you can tell which sites still need a rebuild after an upgrade.
- **Upgrading the template.** Ship a new image, then call `build("live", deployed_sha)` for each site,
  in batches. The rebuild picks up new dependencies. Template files a site already holds change only
  when the site commits them.

### Site Worker configuration

Every site Worker is the same assets-only Worker:

```jsonc
{
  "compatibility_date": "2026-10-01",
  "assets": {
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page",
  },
  "cache_options": { "enabled": true },
}
```

Workers Cache sits in front of each site Worker, and each Worker gets its own cache. The Worker
version is part of the cache key, so every deploy starts with an empty cache and no purge is
needed. The template's `public/_headers` lets the edge cache keep every response for a year while
browsers revalidate pages on each visit and keep hashed `/_astro/` files forever.

---

## 6. Connected repos (GitHub)

### GitHub App

The platform is a GitHub App. A client installs it on one repo and picks the branch and `docsRoot`.
The App needs read access to contents and metadata, write access to contents and pull requests (for
editor commits), and write access to deployments or checks (for preview links).

Self-hosters register their own GitHub App and set its ID, private key, and webhook secret as
secrets on the App Worker.

### Webhooks

The App Worker receives GitHub webhooks.

1. **Verify `X-Hub-Signature-256`.** Reject anything that fails. Code past this point trusts the
   payload's shape.
2. **Find the site** from the installation ID and repo name in D1.
3. **Forward to the Doc.**

| Event                                           | Doc action                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `push` to the site's branch                     | `onPush(ref)`, then `build("live", head_sha)`                                 |
| `pull_request` opened, synchronize, or reopened | `build("pr-<n>", head.sha)`, then post the preview URL as a deployment status |
| `pull_request` closed                           | Delete the `acme--pr-<n>` Worker and its target row                           |
| `installation` removed                          | Mark the site disconnected. Keep serving the last deployed build              |

`onPush` does not trust the SHA in the payload. GitHub can redeliver an event or deliver two pushes
out of order. Instead, `onPush` reads the branch's current ref from the GitHub API, updates `head_sha`
and the tree cache, and recomputes conflicts. A duplicate or late webhook then leads to the same
state. `build` with a SHA that is already building, pending, or deployed on that target does nothing.
A template upgrade passes `rebuild: true`, which builds the deployed SHA again.

For a monorepo, skip a push that changes nothing under `docsRoot`.

### Reading files

The editor reads from the tree cache (section 4), never from the GitHub API directly. The DO calls
GitHub only when `head_sha` moves, and only for blobs it does not have. This keeps the editor inside
GitHub's API rate limits.

---

## 7. Serving: Workers for Platforms

### Concepts

- **Dispatch namespace (`production`).** It holds every client's Worker. There is no per-account
  script limit inside it. Use one namespace for all clients (Cloudflare advises against one per
  client), and optionally a separate `staging` namespace for testing the platform itself.
- **User Worker, one per site and per preview.** It serves only static assets. A deploy uploads
  `dist/` and attaches it to that Worker.
  - **Storage.** Cloudflare stores and caches the files at the edge. There is no R2 bucket and no
    "serve from storage" layer.
  - **Fast redeploys.** Files are matched by content hash, so only changed files are uploaded.
- **Dispatch Worker.** It is the single entry point for all docs traffic. It finds the Worker name from
  the hostname and forwards the request.

### Names

Site slugs and preview labels are both `[a-z0-9]+(-[a-z0-9]+)*`. Neither can contain `--`, so
`--` always separates a site from a label. A slug is at most 40 characters, and a label at most 20,
so `<label>--<site>` fits in one 63-character DNS label.

| Worker name   | Built from                       | URL                                      |
| ------------- | -------------------------------- | ---------------------------------------- |
| `acme`        | `head_sha` of the site's branch  | `acme.docs.yoursaas.com`, custom domains |
| `acme--draft` | a snapshot of the current drafts | `draft--acme.preview.yoursaas.com`       |
| `acme--pr-12` | the head of pull request #12     | `pr-12--acme.preview.yoursaas.com`       |

### Dispatch Worker

```ts
export default {
  async fetch(request, env) {
    const host = new URL(request.url).hostname;

    if (host.endsWith(".preview.yoursaas.com")) {
      const match = /^([a-z0-9-]+)--([a-z0-9-]+)$/.exec(host.split(".")[0]);
      if (!match) return new Response("Not found", { status: 404 });
      const [, label, site] = match;
      const session = await previewSession(request, env, site);
      if (session === "redirect") return startPreviewLogin(request, env, site);
      if (!session) return new Response("Unauthorized", { status: 401 });
      const res = await env.DISPATCHER.get(`${site}--${label}`).fetch(request);
      const out = new Response(res.body, res);
      out.headers.set("X-Robots-Tag", "noindex");
      return out;
    }

    const site = await resolveSite(env, host); // KV, falling back to D1
    if (!site) return new Response("Not found", { status: 404 });
    return env.DISPATCHER.get(site).fetch(request);
  },
};
```

### Preview access

Previews live on a different domain from the editor, so the editor's session cookie does not reach
them. Access works through a handoff:

1. A visitor without a preview cookie is redirected to the App Worker.
2. The App Worker checks the editor session and site membership in D1.
3. It redirects back with a short-lived signed token.
4. The Dispatch Worker verifies the token and sets a cookie scoped to that preview host.

A share link is the same signed token with a longer expiry, created by an editor.

### Domains

- **Docs live on their own registrable domain.** Client pages can run any script MDX allows, so a
  docs site must never share a cookie scope with the dashboard or the API. Platform subdomains and
  previews sit under a domain separate from the product's (`docs.yoursaas.com` here stands for that
  separate domain, the way GitHub serves Pages from `github.io` and not `github.com`). Add the domain
  to the Public Suffix List, so one client's site cannot set cookies for another's.
- **Platform subdomains.** A wildcard route `*.docs.yoursaas.com/*` sends traffic to the Dispatch
  Worker.
- **Client domains (`docs.acme.com`).** Use Cloudflare for SaaS custom hostnames. The client adds a
  CNAME, and Cloudflare issues the certificate. Store hostname to site in D1 and cache it in KV for
  `resolveSite`. KV is eventually consistent, so a removed domain can keep resolving for about a
  minute.

### Asset isolation

Static assets are deduplicated across the whole namespace by hash. That is harmless for public docs.
If private docs are ever supported, include the site ID in the hash, or use the raw upload API with
salted hashes.

---

## 8. Previews, rollback, and history

### Previews

A preview is another user Worker with a suffixed name, built through the same `build(target, sha)`.

- **The Preview button.** The Doc commits the current drafts to a `preview` branch in the site repo
  without clearing them. Then it calls `build("draft", sha)` with `docUrl` set to the preview URL.
- **Pull request previews.** Section 6 covers them.
- **Always rebuild for production. Never promote a preview's files.** Astro bakes `site` into
  canonical URLs, the sitemap, and `llms.txt`. The rebuild is still cheap, because unchanged files are
  not uploaded again.
- **Cleanup.** A cron trigger deletes `draft` preview Workers that nobody has rebuilt for 30 days,
  through the Workers for Platforms API. Pull request previews are deleted when the pull request
  closes.

### Rollback

A rollback is a revert commit followed by an ordinary publish:

1. The Doc creates a commit on the site's branch whose tree equals the tree at the old SHA.
2. The site builds that commit like any other.

Building an old SHA directly would make `deployed_sha` and `head_sha` disagree, and the next publish
would bring the newer content back. A revert commit keeps history linear and uses one code path. On a
connected site with `editorWrites: "pull_request"`, the rollback opens a pull request.

### History

Every publish is a commit. The editor lists the branch's commits as versions, with author and time.

---

## 9. Security

### Credentials never enter the sandbox

The build runs code that clients control, so treat the sandbox as hostile for its whole lifetime.

- **The Workflow fetches the source.** It holds the Artifacts credential or a short-lived GitHub
  installation token, downloads the tarball, and writes the files into the sandbox.
- **The Workflow deploys the assets.** It reads the built files out of the sandbox and uploads them
  through the assets upload API. The deploy token is scoped to the whole dispatch namespace, so a
  build that could read it could overwrite any client's site.
- **The sandbox environment holds only `SITE_URL`.**

### MDX runs inside the sandbox

Any MDX that Nimbus accepts builds, including `import`, `export`, and JavaScript expressions. That
code runs at build time inside the sandbox, which has no credentials and no network, and in the
visitor's browser on the docs domain, which shares nothing with the product's domain (section 7).
`build-site` only checks what Nimbus does not: `docs.config.json`, and links to pages or a logo that
do not exist.

### Other controls

- **Webhooks.** The App Worker verifies every GitHub signature before acting.
- **Logs.** Build logs can contain anything the build printed. `redactLog` filters them before the
  editor shows them.
- **User Workers.** They run in untrusted mode (no shared cache, no `request.cf`).
- **Editor auth.** The App Worker checks site membership in D1 before forwarding to a Doc.
- **Uploads.** The App Worker checks content type and size before writing to R2.

---

## 10. Publish latency

| Phase                           | Cost                            | Mitigation                                                                                   |
| ------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| Container cold start            | Largest one-time cost           | Reuse the `build-${site}-${target}` sandbox so it stays warm between builds (cost trade-off) |
| Dependency install              | Would be the slowest            | Eliminated: `node_modules` is baked into the image                                           |
| Source fetch                    | Small (content and images only) | One tarball per SHA                                                                          |
| Config check and `astro build`  | Grows with page count           | Keep heavy work (OG images, for example) optional                                            |
| Asset upload and deploy         | Small                           | Hash dedup means only changed files are uploaded                                             |
| Webhook delay (connected sites) | Usually under a few seconds     | None needed                                                                                  |

Get it correct with a pre-baked image first. Then measure, then add warm sandboxes.

---

## 11. Data ownership

| Data                                                 | Lives in                                        | Notes                                        |
| ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| Clients, users, memberships, hostnames, site sources | D1                                              | Cross-site queries                           |
| Hostname to site lookup cache                        | KV                                              | Read on every request by the Dispatch Worker |
| Drafts, tree cache, per-target build state           | Doc (SQLite)                                    | One per site, single writer                  |
| Uploaded images before publish                       | R2 staging                                      | Deleted after commit or when orphaned        |
| Content, config, images, history                     | Site repo (Artifacts or GitHub)                 | One commit per publish                       |
| Template, layouts, components                        | Sandbox image                                   | Versioned with the platform                  |
| Built site                                           | Workers static assets on the site's user Worker | Served from the edge                         |

---

## 12. Later: multiplayer editing

The design already has the right shape for multiplayer editing:

- **DocDO, one per page.** A Durable Object holding a Yjs (CRDT) document. Browsers connect over
  WebSockets with hibernation, so idle tabs are not billed. Edits are relayed to everyone else and
  stored continuously.
- **Libraries to evaluate.** `partyserver` and `y-partyserver` (Cloudflare/PartyKit) on the server,
  CodeMirror and `y-codemirror` in the editor.
- **What changes.** Debounced autosave becomes live sync. Doc stays the publish coordinator. On
  Publish, it asks each changed DocDO for its current text and commits it. Conflict detection against
  `base_blob_sha` stays as it is.
- **Start with a raw-MDX editor and a rendered preview pane.** Round-tripping WYSIWYG and MDX
  (components like `<Tabs>` and `<Steps>`) is much harder to make collaborative.

---

## 13. Open questions

- **Assets-only user Workers.** A Workflow can upload assets to a dispatch namespace Worker directly
  through the upload session, bucket, and script `PUT` endpoints. Wrangler uploads assets-only Workers
  with no `main_module`, but the Workers for Platforms docs only show an example with one. Confirm it
  against a real namespace before relying on it.
- **Local development.** Dispatch namespaces and Artifacts have no local emulation. Containers and
  Workflows run under `cf dev`, and containers need Docker. Remote work needs a staging account.
- **Config surface.** What clients can change in `docs.config.json` (theme tokens, navigation, logo)
  and what stays locked in the template.
- **Template-owned features.** Search, an API reference generated from OpenAPI, `llms.txt`,
  analytics, and versioned docs. Search and the OpenAPI reference change the build output and what
  counts as a source file, so plan them before the config schema reaches 1.0.
- **Limits.** Maximum pages per site, maximum image size, builds per hour, and preview Workers per
  site.
