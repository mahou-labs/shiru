import {
  exports,
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";

import type { Builder } from "../builder/builder";
import type { BuildResult } from "./build-state";
import { readCommitFiles } from "./git";
import type { TargetLabel } from "./names";
import type { Doc } from "./doc";

export type PublishParams = {
  docId: string;
  repo: string;
  target: TargetLabel;
  sha: string;
  docUrl: string;
  docsRoot: string;
};

const MAX_ERROR_LENGTH = 8000;

/** Builds one commit of a doc for one target and reports the result to its Doc. */
export class PublishWorkflow extends WorkflowEntrypoint<Env, PublishParams> {
  override async run(
    event: WorkflowEvent<PublishParams>,
    step: WorkflowStep,
  ): Promise<BuildResult> {
    const { docId, repo, target, sha, docUrl, docsRoot } = event.payload;
    // Builder is reached through this Worker's own exports: a binding would carry a script_name,
    // and Wrangler refuses a container on a Durable Object bound that way. cf types each export as
    // any kind of loopback, and the DOCS binding by its Worker name, so both are cast.
    const builders = exports.Builder as unknown as DurableObjectNamespace<Builder>;
    const docs = this.env.DOCS as DurableObjectNamespace<Doc>;

    let result: BuildResult;
    try {
      // Reset and build share one step: a retry after the container stopped must write /work again.
      result = await step.do(
        "build",
        { retries: { limit: 2, delay: "5 seconds", backoff: "constant" }, timeout: "10 minutes" },
        async (): Promise<BuildResult> => {
          const files = await readCommitFiles(await this.env.ARTIFACTS.get(repo), sha, docsRoot);
          const builder = builders.getByName(`build-${docId}-${target}`);
          const reset = await builder.reset(files);
          if (!reset.ok) return failure(reset.errors);
          const built = await builder.build({ docUrl, docsRoot });
          return built.ok
            ? { ok: true, templateVersion: built.templateVersion }
            : failure(built.errors);
        },
      );
    } catch (error) {
      result = failure([error instanceof Error ? error.message : String(error)]);
    }

    // Workers for Platforms deploy lands with the deployer module.

    await step.do("report", () =>
      docs.getByName(docId).buildFinished(target, event.instanceId, result),
    );
    return result;
  }
}

function failure(errors: string[]): BuildResult {
  return { ok: false, error: errors.join("\n").slice(0, MAX_ERROR_LENGTH) };
}
