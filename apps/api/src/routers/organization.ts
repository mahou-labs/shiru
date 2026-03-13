import * as z from "zod";
import { auth } from "../utils/auth";
import { authedProcedure, protectedProcedure } from "../utils/orpc";
import { log } from "@/utils/logger";
import { ORPCError } from "@orpc/server";
import { tryCatch } from "@/utils/try-catch";
import { subscriptions } from "@/schema/subscription";
import { eq } from "drizzle-orm";
import { db } from "@/utils/db";

export const organizationRouter = {
  createOrg: authedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
      }),
    )
    .handler(async ({ context: { headers, resHeaders }, input }) => {
      const data = await auth.api.createOrganization({
        headers,
        body: input,
      });

      const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
        headers,
        returnHeaders: true,
        body: {
          organizationId: data?.id,
        },
      });

      const cookies = sessionHeaders.getSetCookie();
      for (const cookie of cookies) {
        resHeaders?.append("set-cookie", cookie);
      }

      return data;
    }),

  checkSlugAvailability: authedProcedure
    .input(z.string().min(1))
    .output(z.boolean())
    .handler(async ({ input }) => {
      try {
        const { status } = await auth.api.checkOrganizationSlug({
          body: {
            slug: input,
          },
        });

        return status;
      } catch (e) {
        log.error("org.check_slug_failed", e, { slug: input });
        return false;
      }
    }),

  getFullOrg: protectedProcedure.handler(async ({ context: { headers } }) => {
    const org = await auth.api.getFullOrganization({ headers });
    return org;
  }),

  getOrgList: protectedProcedure.handler(async ({ context: { headers } }) => {
    return await auth.api.listOrganizations({ headers });
  }),

  getMembers: protectedProcedure.handler(async ({ context: { headers } }) => {
    return await auth.api.listMembers({ headers });
  }),

  setActive: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .handler(async ({ context: { headers, resHeaders }, input }) => {
      const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
        headers,
        returnHeaders: true,
        body: {
          organizationId: input.organizationId,
        },
      });

      const cookies = sessionHeaders.getSetCookie();
      for (const cookie of cookies) {
        resHeaders?.append("set-cookie", cookie);
      }
    }),

  getSubscription: protectedProcedure.handler(async ({ context: { session } }) => {
    if (!session?.activeOrganizationId) {
      return null;
    }

    const { data: subscription, error } = await tryCatch(
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.organizationId, session.activeOrganizationId)),
    );

    if (error) {
      log.error("org.get_subscription_failed", error, {
        organizationId: session.activeOrganizationId,
      });
      throw new ORPCError("Failed to fetch subscription");
    }

    return subscription[0] ?? null;
  }),

  updateOrg: protectedProcedure
    .input(
      z
        .object({
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
        })
        .refine((data) => data.name || data.slug, {
          message: "At least one of name or slug is required",
        }),
    )
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.updateOrganization({
        headers,
        body: {
          data: input,
        },
      });
    }),

  updateOrgLogo: protectedProcedure
    .input(z.object({ logo: z.union([z.url(), z.literal("")]) }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.updateOrganization({
        headers,
        body: {
          data: { logo: input.logo },
        },
      });
    }),

  deleteOrg: protectedProcedure.handler(async ({ context: { headers, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    return await auth.api.deleteOrganization({
      headers,
      body: {
        organizationId: session.activeOrganizationId,
      },
    });
  }),

  removeMember: protectedProcedure
    .input(z.object({ memberIdOrEmail: z.string() }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.removeMember({
        headers,
        body: {
          memberIdOrEmail: input.memberIdOrEmail,
        },
      });
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["admin", "member"]),
      }),
    )
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.updateMemberRole({
        headers,
        body: {
          memberId: input.memberId,
          role: input.role,
        },
      });
    }),

  leaveOrg: protectedProcedure.handler(async ({ context: { headers, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    return await auth.api.leaveOrganization({
      headers,
      body: {
        organizationId: session.activeOrganizationId,
      },
    });
  }),
};
