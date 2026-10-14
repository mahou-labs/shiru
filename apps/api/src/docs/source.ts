import { z } from "zod";

export const DocSource = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("managed"), artifactsRepo: z.string() }),
  z.object({
    kind: z.literal("github"),
    installationId: z.number().int(),
    repo: z.string(),
    branch: z.string(),
    docsRoot: z.string(),
    editorWrites: z.enum(["direct", "pull_request"]),
  }),
]);
export type DocSource = z.infer<typeof DocSource>;
