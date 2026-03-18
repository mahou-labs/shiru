import { and, eq, ne } from "drizzle-orm";
import { invitations, members, organizations } from "@/schema/auth";
import { customDomains } from "@/schema/custom-domain";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { tryCatch } from "@/utils/try-catch";
import { protectedProcedure } from "../utils/orpc";

export const onboardingRouter = {
  getOnboardingStatus: protectedProcedure.handler(async ({ context: { session } }) => {
    // protectedProcedure guarantees activeOrganizationId exists
    const orgId = session.activeOrganizationId ?? "";

    // Run all checks in parallel
    const [domainResult, orgResult, membersResult, invitesResult] = await Promise.all([
      tryCatch(
        db
          .select({ id: customDomains.id })
          .from(customDomains)
          .where(and(eq(customDomains.organizationId, orgId), eq(customDomains.status, "active")))
          .then((rows) => rows[0]),
      ),
      tryCatch(
        db
          .select({ logo: organizations.logo })
          .from(organizations)
          .where(eq(organizations.id, orgId))
          .then((rows) => rows[0]),
      ),
      tryCatch(
        db
          .select({ id: members.id })
          .from(members)
          .where(and(eq(members.organizationId, orgId), ne(members.userId, session.userId)))
          .limit(1)
          .then((rows) => rows[0]),
      ),
      tryCatch(
        db
          .select({ id: invitations.id })
          .from(invitations)
          .where(and(eq(invitations.organizationId, orgId), eq(invitations.status, "pending")))
          .limit(1)
          .then((rows) => rows[0]),
      ),
    ]);

    if (domainResult.error || orgResult.error || membersResult.error || invitesResult.error) {
      log.error(
        "onboarding.getOnboardingStatus_failed",
        domainResult.error ?? orgResult.error ?? membersResult.error ?? invitesResult.error,
        {
          organizationId: orgId,
        },
      );
    }

    const domain = !!domainResult.data;
    const profile = !!orgResult.data?.logo;
    const team = !!membersResult.data || !!invitesResult.data;

    return {
      domain,
      profile,
      team,
      allComplete: domain && profile && team,
    };
  }),
};
