import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { v7 as uuidv7 } from "uuid";

import { members } from "./schema/auth";
import { docsSites } from "./schema/docs";
import { auth } from "./utils/auth";
import { db } from "./utils/db";
import { log } from "./utils/logger";
import { verifyWebhookSignature } from "./utils/oktokit";
import { getInstallationOctokit } from "./utils/oktokit";

type Env = { Bindings: CloudflareBindings };
const github = new Hono<Env>();

github.post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-hub-signature-256") ?? "";

  if (!signature || !(await verifyWebhookSignature(rawBody, signature))) {
    return c.text("Invalid signature", 401);
  }

  const event = c.req.header("x-github-event");
  const payload = JSON.parse(rawBody);

  if (event === "installation" && payload.action === "deleted") {
    const installationId = Number(payload.installation?.id);
    if (!installationId || Number.isNaN(installationId)) return c.json({ ok: true });

    await db
      .update(docsSites)
      .set({
        githubInstallationId: null,
        githubOwner: null,
        githubRepository: null,
        sourceMode: "managed",
      })
      .where(eq(docsSites.githubInstallationId, installationId));

    log.info("github.installation_deleted", { installationId });
  }

  if (event === "push") {
    const installationId = Number(payload.installation?.id);
    const branch = payload.ref?.replace("refs/heads/", "");
    if (!installationId || Number.isNaN(installationId) || !branch) return c.json({ ok: true });

    const [site] = await db
      .select()
      .from(docsSites)
      .where(eq(docsSites.githubInstallationId, installationId));

    if (site && site.publishableBranch === branch) {
      log.info("github.push_matched", {
        installationId,
        branch,
        docsSiteId: site.id,
      });
      // TODO: trigger rebuild via BUILD_QUEUE
    }
  }

  return c.json({ ok: true });
});

github.get("/setup", async (c) => {
  const installationId = c.req.query("installation_id");
  const orgId = c.req.query("state");

  if (!installationId || !orgId) {
    return c.text("Missing installation_id or state", 400);
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.redirect(`${env.DASHBOARD_URL}/login`);
  }

  const [membership] = await db
    .select()
    .from(members)
    .where(and(eq(members.organizationId, orgId), eq(members.userId, session.user.id)));

  if (!membership) {
    return c.text("Not a member of this organization", 403);
  }

  const octokit = getInstallationOctokit(Number(installationId));
  const { data: installation } = await octokit.rest.apps.getInstallation({
    installation_id: Number(installationId),
  });

  const account = installation.account;
  const githubOwner = account && "login" in account ? account.login : null;
  const rawType = account && "type" in account ? account.type : null;
  const githubOwnerType = rawType === "User" || rawType === "Organization" ? rawType : null;

  await db
    .insert(docsSites)
    .values({
      id: uuidv7(),
      organizationId: orgId,
      githubInstallationId: Number(installationId),
      githubOwner: githubOwner,
      githubOwnerType: githubOwnerType,
      sourceMode: "github",
    })
    .onConflictDoUpdate({
      target: docsSites.organizationId,
      set: {
        githubInstallationId: Number(installationId),
        githubOwner: githubOwner,
        githubOwnerType: githubOwnerType,
        sourceMode: "github",
      },
    });

  log.info("github.setup_complete", {
    installationId,
    orgId,
    githubOwner,
  });

  return c.redirect(`${env.DASHBOARD_URL}/settings`);
});

export { github as githubRoutes };
