import type { TargetState } from "./build-state";

/** The steps a build passes through, in order. Reaching the last one is not a step: it is `ended`. */
export const BUILD_STEPS = ["queued", "preparing", "building"] as const;
export type BuildStep = (typeof BUILD_STEPS)[number];

/**
 * When the latest build of a target entered each step, and how it ended. The build state in
 * build-state.ts decides what runs; this only records when, for the dashboard's timeline.
 */
export type Run = {
  workflowId: string;
  sha: string;
  steps: Partial<Record<BuildStep, number>>;
  ended: { at: number; ok: boolean } | null;
};

export function startRun(workflowId: string, sha: string, at: number): Run {
  return { workflowId, sha, steps: { queued: at }, ended: null };
}

/**
 * Marks `step` entered. A step entered again by a retry keeps its first time, so the timeline
 * shows how long the step took overall, retries included.
 */
export function enterStep(run: Run, workflowId: string, step: BuildStep, at: number): Run {
  if (run.workflowId !== workflowId || run.ended || run.steps[step] !== undefined) return run;
  return { ...run, steps: { ...run.steps, [step]: at } };
}

/** Ends the run once its target stops building it, as a success unless the target failed. */
export function endRun(run: Run, target: TargetState | undefined, at: number): Run {
  if (run.ended) return run;
  if (target?.kind === "building" && target.build.workflowId === run.workflowId) return run;
  return { ...run, ended: { at, ok: target?.kind !== "failed" } };
}
