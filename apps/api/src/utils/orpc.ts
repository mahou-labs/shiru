import { os } from "@orpc/server";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { members } from "../schema/auth";
import { auth } from "./auth";
import { ACCESS_DENIED_REASONS, getOrganizationAccess } from "./billing";
import type { Context } from "./context";
import { db } from "./db";

const o = os.$context<Context & ResponseHeadersPluginContext>();

export const publicProcedure = o;

export const authedProcedure = o
  .errors({ UNAUTHORIZED: { status: 401, message: "Sign in to continue" } })
  .use(({ context, errors, next }) => {
    if (!context.auth) throw errors.UNAUTHORIZED();
    return next({ context: { user: context.auth.user, session: context.auth.session } });
  });

export const organizationProcedure = authedProcedure
  .errors({ NO_ORGANIZATION: { status: 403, message: "Create or join an organization first" } })
  .use(async ({ context, errors, next }) => {
    const organizationId = await resolveOrganization(
      context.user.id,
      context.session.activeOrganizationId ?? null,
      context.headers,
      context.resHeaders,
    );
    if (!organizationId) throw errors.NO_ORGANIZATION();
    return next({ context: { organizationId } });
  });

export const paidProcedure = organizationProcedure
  .errors({
    PAYMENT_REQUIRED: {
      status: 402,
      message: "An active subscription is required",
      data: z.object({ reason: z.enum(ACCESS_DENIED_REASONS) }),
    },
  })
  .use(async ({ context, errors, next }) => {
    const access = await getOrganizationAccess(context.organizationId);
    if (access.kind === "denied") {
      throw errors.PAYMENT_REQUIRED({ data: { reason: access.reason } });
    }
    return next({ context: { access } });
  });

async function resolveOrganization(
  userId: string,
  activeOrganizationId: string | null,
  headers: Headers,
  resHeaders: Headers | undefined,
) {
  const [membership] = await db
    .select({ organizationId: members.organizationId })
    .from(members)
    .where(eq(members.userId, userId))
    .orderBy(desc(sql`${members.organizationId} = ${activeOrganizationId}`))
    .limit(1);
  if (!membership) return null;
  if (membership.organizationId !== activeOrganizationId) {
    const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
      headers,
      body: { organizationId: membership.organizationId },
      returnHeaders: true,
    });
    for (const cookie of sessionHeaders.getSetCookie()) resHeaders?.append("set-cookie", cookie);
  }
  return membership.organizationId;
}
