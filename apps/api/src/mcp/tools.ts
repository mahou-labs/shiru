import { McpServer, requireScopes, type CallToolResult } from "@modelcontextprotocol/server";
import { env } from "cloudflare:workers";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { DocPath } from "../docs/drafts";
import { LIVE } from "../docs/names";
import {
  deleteFile,
  docUrl,
  DraftContent,
  openDoc,
  type OpenDoc,
  publish,
  readText,
  saveText,
} from "../docs/service";
import { members, organizations } from "../schema/auth";
import { docs } from "../schema/docs";
import type { McpScope } from "../utils/auth";
import { getOrganizationAccess } from "../utils/billing";
import { db } from "../utils/db";
import { captureException } from "../utils/posthog";

export type McpUser = { id: string; name: string; email: string };

/** A failure the agent can act on, returned as a tool error with this message. */
class ToolError extends Error {}

type Meta = {
  name: string;
  title: string;
  description: string;
  scope: McpScope;
  /** Needs paid access for the site's organization. */
  paid: boolean;
  readOnly: boolean;
};

type Tool = Meta &
  (
    | { site: false; input: z.ZodRawShape; run: (args: never, user: McpUser) => Promise<unknown> }
    | {
        site: true;
        input: z.ZodRawShape;
        run: (args: never, doc: OpenDoc, user: McpUser) => Promise<unknown>;
      }
  );

const docId = z.string().describe("The site's id, from list_sites.");
const path = DocPath.describe(
  "A path relative to the site's docs root, such as content/guides/setup.mdx.",
);

function userTool<S extends z.ZodRawShape>(
  tool: Meta & {
    input: S;
    run: (args: z.infer<z.ZodObject<S>>, user: McpUser) => Promise<unknown>;
  },
): Tool {
  return { ...tool, site: false };
}

function siteTool<S extends z.ZodRawShape>(
  tool: Meta & {
    input: S;
    run: (args: z.infer<z.ZodObject<S>>, doc: OpenDoc, user: McpUser) => Promise<unknown>;
  },
): Tool {
  return { ...tool, site: true, input: { docId, ...tool.input } };
}

const fileNotFound = (path: string) => new ToolError(`No file at ${path}.`);

export const tools: Tool[] = [
  userTool({
    name: "list_sites",
    title: "List sites",
    description: "List the docs sites of every organization you belong to.",
    scope: "docs:read",
    paid: false,
    readOnly: true,
    input: {},
    run: async (_, user) => {
      const rows = await db
        .select({
          id: docs.id,
          name: docs.name,
          slug: docs.slug,
          organization: organizations.name,
        })
        .from(docs)
        .innerJoin(organizations, eq(organizations.id, docs.organizationId))
        .innerJoin(
          members,
          and(eq(members.organizationId, docs.organizationId), eq(members.userId, user.id)),
        )
        .orderBy(asc(docs.createdAt), asc(docs.id));
      return { sites: rows.map((row) => ({ ...row, url: docUrl(row.slug) })) };
    },
  }),
  siteTool({
    name: "list_files",
    title: "List files",
    description:
      "List every file of a site with its draft status: unchanged, added, modified or deleted.",
    scope: "docs:read",
    paid: false,
    readOnly: true,
    input: {},
    run: async (_, doc) => ({ files: await doc.getTree() }),
  }),
  siteTool({
    name: "read_file",
    title: "Read file",
    description: "Read a file's text: its draft if it has one, otherwise the published version.",
    scope: "docs:read",
    paid: false,
    readOnly: true,
    input: { path },
    run: async ({ path }, doc) => {
      const file = await readText(doc, path);
      if (file.kind === "not_found") throw fileNotFound(path);
      if (file.kind === "not_text") throw new ToolError(`${path} is not a text file.`);
      return file.content;
    },
  }),
  siteTool({
    name: "write_file",
    title: "Write file",
    description:
      "Save a file's full text as a draft. Drafts go live only when you publish the site.",
    scope: "docs:write",
    paid: true,
    readOnly: false,
    input: { path, content: DraftContent },
    run: ({ path, content }, doc, user) => saveText(doc, path, content, user),
  }),
  siteTool({
    name: "delete_file",
    title: "Delete file",
    description: "Delete a file as a draft. The file stays live until you publish the site.",
    scope: "docs:write",
    paid: true,
    readOnly: false,
    input: { path },
    run: async ({ path }, doc, user) => {
      const outcome = await deleteFile(doc, path, user);
      if (outcome.kind === "not_found") throw fileNotFound(path);
      return { path, deleted: true };
    },
  }),
  siteTool({
    name: "discard_draft",
    title: "Discard draft",
    description: "Throw away a file's draft, back to its published version.",
    scope: "docs:write",
    paid: true,
    readOnly: false,
    input: { path },
    run: async ({ path }, doc) => {
      const outcome = await doc.discardDraft(path);
      if (outcome.kind === "not_found") throw new ToolError(`${path} has no draft.`);
      return { path, discarded: true };
    },
  }),
  siteTool({
    name: "publish",
    title: "Publish site",
    description:
      "Commit every draft and build the site. Drafts in conflict are left out and listed in `skipped`. Call get_status to follow the build.",
    scope: "docs:write",
    paid: true,
    readOnly: false,
    input: {},
    run: async (_, doc, user) => {
      const result = await publish(doc, user);
      if (result.kind === "conflict") {
        throw new ToolError("The site kept changing while publishing. Try again.");
      }
      return result;
    },
  }),
  siteTool({
    name: "get_status",
    title: "Get status",
    description:
      "The site's published commit, its live build (idle, building or failed, with the error), and its unpublished drafts.",
    scope: "docs:read",
    paid: false,
    readOnly: true,
    input: {},
    run: async (_, doc) => {
      const status = await doc.status();
      const live = status.targets[LIVE] ?? { kind: "idle", deployed: null };
      return {
        headSha: status.headSha,
        live: {
          state: live.kind,
          deployedSha: live.deployed?.sha ?? null,
          buildingSha: live.kind === "building" ? live.build.sha : null,
          error: live.kind === "failed" ? live.error : null,
        },
        drafts: status.drafts.map(({ path, op, conflict }) => ({ path, op, conflict })),
      };
    },
  }),
];

/** The organization of a site the user can see, or null, so other sites look missing. */
async function siteOrganization(userId: string, docId: string) {
  const [row] = await db
    .select({ id: docs.organizationId })
    .from(docs)
    .innerJoin(
      members,
      and(eq(members.organizationId, docs.organizationId), eq(members.userId, userId)),
    )
    .where(eq(docs.id, docId));
  return row?.id ?? null;
}

async function call(tool: Tool, args: Record<string, unknown>, user: McpUser) {
  if (!tool.site) return tool.run(args as never, user);

  const organizationId = await siteOrganization(user.id, args.docId as string);
  if (!organizationId) throw new ToolError("Site not found");
  if (tool.paid) {
    const access = await getOrganizationAccess(organizationId);
    if (access.kind === "denied") {
      throw new ToolError(
        `Payment required (${access.reason}). An active subscription is required to edit this site. Manage billing at ${env.DASHBOARD_URL}/settings/billing.`,
      );
    }
  }
  const doc = await openDoc(organizationId, args.docId as string);
  if (!doc) throw new ToolError("Site not found");
  return tool.run(args as never, doc, user);
}

const text = (value: unknown): CallToolResult =>
  typeof value === "string"
    ? { content: [{ type: "text", text: value }] }
    : {
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent: value as Record<string, unknown>,
      };

const toolError = (message: string): CallToolResult => ({
  isError: true,
  content: [{ type: "text", text: message }],
});

/** An MCP server whose tools act as `user`. Scope checks answer with an HTTP scope challenge. */
export function mcpServer(user: McpUser) {
  const server = new McpServer(
    { name: "Shiru", version: "1.0.0" },
    {
      instructions:
        "Edit Shiru docs sites. Call list_sites first. Edits are drafts until you call publish, and get_status reports the build.",
    },
  );
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: z.object(tool.input),
        annotations: { readOnlyHint: tool.readOnly },
        scopeChallenge: requireScopes(tool.scope),
      },
      async (args: Record<string, unknown>) => {
        try {
          return text(await call(tool, args, user));
        } catch (error) {
          if (error instanceof ToolError) return toolError(error.message);
          captureException(error, user.id);
          return toolError("Something went wrong. Try again.");
        }
      },
    );
  }
  return server;
}
