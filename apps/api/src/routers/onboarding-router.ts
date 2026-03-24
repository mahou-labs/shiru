import { ORPCError } from "@orpc/server";
import { and, eq, ne } from "drizzle-orm";
import * as z from "zod";
import { invitations, members, organizations } from "@/schema/auth";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { tryCatch } from "@/utils/try-catch";
import { authedProcedure, protectedProcedure } from "../utils/orpc";

async function extractWebsiteMetadata(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "ShiruBot/1.0" },
      redirect: "follow",
    });

    if (!response.ok) return null;

    const html = await response.text();

    const ogSiteName =
      html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:site_name["']/i)?.[1];
    const applicationName =
      html.match(/<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']application-name["']/i)?.[1];
    const ogTitle =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i)?.[1];
    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

    let name: string | null = ogSiteName ?? applicationName ?? null;

    if (!name) {
      const rawTitle = ogTitle ?? titleTag ?? null;
      if (rawTitle) {
        const firstSegment = rawTitle.split(/\s[-|—:]\s/)[0];
        name = (firstSegment ?? rawTitle)
          .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"');
      }
    }

    const ogDesc =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i)?.[1];
    const metaDesc =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)?.[1];
    const description = ogDesc ?? metaDesc ?? null;

    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    const appleTouchIcon = html.match(
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i,
    )?.[1];
    const favicon = html.match(
      /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
    )?.[1];
    const ogImage =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i)?.[1];

    const rawLogo = appleTouchIcon ?? favicon ?? ogImage ?? null;
    let logo: string | null = null;
    if (rawLogo) {
      try {
        logo = new URL(rawLogo, baseUrl).href;
      } catch {
        logo = null;
      }
    }

    const hostParts = parsedUrl.hostname.replace(/^www\./, "").split(".");
    const suggestedSlug = (hostParts[0] ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");

    return {
      name: name?.trim() ?? null,
      description: description?.trim() ?? null,
      logo,
      suggestedSlug: suggestedSlug.length >= 4 ? suggestedSlug : "",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const onboardingRouter = {
  scrapeWebsite: authedProcedure
    .input(z.object({ url: z.string().url() }))
    .handler(async ({ input }) => {
      const emptyResult = { name: null, description: null, logo: null, suggestedSlug: "" };

      let normalizedUrl = input.url;
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const parsed = new URL(normalizedUrl);
      if (parsed.protocol !== "https:") return emptyResult;
      if (parsed.hostname === "localhost" || parsed.hostname.endsWith(".local")) return emptyResult;
      if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.)/.test(parsed.hostname)) {
        return emptyResult;
      }

      const metadata = await extractWebsiteMetadata(normalizedUrl);

      if (!metadata) {
        return {
          name: null,
          description: null,
          logo: null,
          suggestedSlug: "",
        };
      }

      return metadata;
    }),

  getOnboardingStatus: protectedProcedure.handler(async ({ context: { session } }) => {
    const orgId = session.activeOrganizationId;
    if (!orgId) {
      throw new ORPCError("BAD_REQUEST", { message: "No active organization" });
    }

    const [orgResult, membersResult, invitesResult] = await Promise.all([
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

    if (orgResult.error || membersResult.error || invitesResult.error) {
      log.error(
        "onboarding.getOnboardingStatus_failed",
        orgResult.error ?? membersResult.error ?? invitesResult.error,
        {
          organizationId: orgId,
        },
      );
    }

    const profile = !!orgResult.data?.logo;
    const team = !!membersResult.data || !!invitesResult.data;

    return {
      profile,
      team,
      allComplete: profile && team,
    };
  }),
};
