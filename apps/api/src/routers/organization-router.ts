import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import * as z from "zod";

import { organizations } from "@/schema/auth";
import { docsSites } from "@/schema/docs";
import { subscriptions } from "@/schema/subscription";
import { db } from "@/utils/db";
import { resolveDocsSiteStoragePrefix, syncDocsSiteKv } from "@/utils/docs-site-kv";
import { log } from "@/utils/logger";
import { tryCatch } from "@/utils/try-catch";

import { auth } from "../utils/auth";
import { protectedProcedure, resolveActiveOrganization } from "../utils/orpc";

export const organizationRouter = {
  createOrg: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        logo: z.url().optional(),
      }),
    )
    .handler(async ({ context: { headers, resHeaders }, input }) => {
      const organization = await auth.api.createOrganization({
        headers,
        body: { name: input.name, slug: input.slug, logo: input.logo },
      });

      const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
        headers,
        returnHeaders: true,
        body: {
          organizationId: organization?.id,
        },
      });

      const cookies = sessionHeaders.getSetCookie();
      for (const cookie of cookies) {
        resHeaders?.append("set-cookie", cookie);
      }

      if (organization?.id) {
        const { error } = await tryCatch(
          db.insert(docsSites).values({
            id: uuidv7(),
            organizationId: organization.id,
            storagePrefix: input.slug,
            sourceMode: "managed",
          }),
        );

        if (error) {
          log.error("org.bootstrap_docs_site_failed", error, {
            organizationId: organization.id,
          });
        }
      }

      return organization;
    }),

  checkSlugAvailability: protectedProcedure
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

    return subscription?.[0] ?? null;
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
    .handler(async ({ context: { headers, session }, input }) => {
      const activeOrganizationId = session.activeOrganizationId;
      const shouldSyncSlug = !!input.slug && !!activeOrganizationId;

      let currentSlug: string | null = null;
      let docsSite:
        | {
            activeCommitSha: string | null;
            storagePrefix: string;
          }
        | undefined;

      if (shouldSyncSlug && activeOrganizationId) {
        const [org] = await db
          .select({ slug: organizations.slug })
          .from(organizations)
          .where(eq(organizations.id, activeOrganizationId));

        currentSlug = org?.slug ?? null;

        [docsSite] = await db
          .select({
            activeCommitSha: docsSites.activeCommitSha,
            storagePrefix: docsSites.storagePrefix,
          })
          .from(docsSites)
          .where(eq(docsSites.organizationId, activeOrganizationId));
      }

      const updatedOrganization = await auth.api.updateOrganization({
        headers,
        body: {
          data: input,
        },
      });

      if (input.slug && currentSlug && input.slug !== currentSlug) {
        await syncDocsSiteKv(currentSlug, null);

        if (docsSite) {
          const storagePrefix = resolveDocsSiteStoragePrefix(docsSite.storagePrefix, currentSlug);

          if (storagePrefix !== docsSite.storagePrefix) {
            await db
              .update(docsSites)
              .set({ storagePrefix })
              .where(eq(docsSites.organizationId, activeOrganizationId!));
          }

          if (docsSite.activeCommitSha) {
            await syncDocsSiteKv(input.slug, {
              activeCommitSha: docsSite.activeCommitSha,
              storagePrefix,
            });
          }
        }
      }

      return updatedOrganization;
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

  deleteOrg: protectedProcedure.handler(async ({ context: { headers, resHeaders, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, session.activeOrganizationId));

    await auth.api.deleteOrganization({
      headers,
      body: {
        organizationId: session.activeOrganizationId,
      },
    });

    if (org?.slug) {
      await syncDocsSiteKv(org.slug, null);
    }

    const nextOrgId = await resolveActiveOrganization(headers, resHeaders);

    return { hasRemainingOrgs: !!nextOrgId };
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

  listInvites: protectedProcedure.handler(async ({ context: { headers, session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    return await auth.api.listInvitations({ headers });
  }),

  createInvite: protectedProcedure
    .input(
      z.object({
        email: z.email(),
        role: z.enum(["admin", "member", "owner"]),
      }),
    )
    .handler(async ({ context: { headers, session }, input }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      return await auth.api.createInvitation({
        headers,
        body: {
          email: input.email,
          role: input.role,
          organizationId: session.activeOrganizationId,
        },
      });
    }),

  deleteInvite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context: { headers, session }, input }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      return await auth.api.cancelInvitation({
        headers,
        body: { invitationId: input.id },
      });
    }),

  acceptInvite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context: { headers }, input }) => {
      return await auth.api.acceptInvitation({
        headers,
        body: { invitationId: input.id },
      });
    }),
};
