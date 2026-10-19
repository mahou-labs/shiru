import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

import { members } from "../schema/auth";
import { docs } from "../schema/docs";
import { auth } from "../utils/auth";
import { db } from "../utils/db";
import { parseHostname } from "./names";
import { HANDOFF_PATH, HANDOFF_TTL_MS, safePath, signGrant } from "./preview-access";
import { docsDomains, previewUrl } from "./urls";

/**
 * `/preview/authorize?host=&path=` is where the dispatch Worker sends a visitor with no preview
 * cookie. A member of the doc's organization goes back to the preview host with a handoff grant,
 * which dispatch trades for a cookie on that host. Anyone else signs in on the dashboard first,
 * whose `/preview` route sends them back here.
 */
export const previewRoute = new Hono();

previewRoute.get("/authorize", async (c) => {
  c.header("Cache-Control", "no-store");
  const host = c.req.query("host") ?? "";
  const path = safePath(c.req.query("path"));
  const parsed = parseHostname(host, docsDomains());
  if (parsed.kind !== "preview") return c.text("Not a preview address", 400);

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.redirect(
      `${env.DASHBOARD_URL}/preview?${new URLSearchParams({ host, path }).toString()}`,
    );
  }

  // A missing doc and a doc of another organization get the same answer, so neither leaks.
  const [doc] = await db
    .select({ id: docs.id })
    .from(docs)
    .innerJoin(members, eq(members.organizationId, docs.organizationId))
    .where(and(eq(docs.slug, parsed.slug), eq(members.userId, session.user.id)));
  if (!doc) return c.text("No preview here", 404);

  const url = previewUrl(parsed.slug, parsed.label);
  const token = await signGrant(
    { kind: "handoff", host: new URL(url).hostname, exp: Date.now() + HANDOFF_TTL_MS },
    env.PREVIEW_SECRET,
  );
  return c.redirect(`${url}${HANDOFF_PATH}?${new URLSearchParams({ token, path }).toString()}`);
});
