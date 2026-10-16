import { z } from "zod";

import type { TargetLabel } from "./names";

export type Deployed = { sha: string; templateVersion: string } | null;

export type TargetState =
  | { kind: "idle"; deployed: Deployed }
  | {
      kind: "building";
      build: { sha: string; workflowId: string };
      pendingSha: string | null;
      deployed: Deployed;
    }
  | { kind: "failed"; deployed: Deployed; error: string };

// One coordinator per doc, not per target: a Durable Object has a single alarm, and workflow ids
// come from one sequence so a deleted and recreated target never reuses an old instance id. The
// prefix is random per state, so state lost while the Workflow instances remain cannot reuse one.
export type DocBuilds = {
  prefix: string;
  seq: number;
  targets: Partial<Record<TargetLabel, TargetState>>;
};

export type BuildResult = { ok: true; templateVersion: string } | { ok: false; error: string };

export type InstanceStatus =
  | { status: "queued" | "running" | "waiting" | "paused" | "waitingForPause" }
  | { status: "complete"; output: BuildResult }
  | { status: "errored"; error: string }
  | { status: "terminated" }
  // `create` never ran, so nothing is building this target.
  | { status: "missing" }
  // The lookup failed or returned a status this code does not know. The instance may still run.
  | { status: "unknown" };

export type BuildEvent =
  | { type: "requested"; target: TargetLabel; sha: string }
  // Build what the target serves again, so the build picks up changed doc info such as its URL.
  | { type: "rebuild"; target: TargetLabel }
  | { type: "finished"; target: TargetLabel; workflowId: string; result: BuildResult }
  | { type: "reconciled"; target: TargetLabel; workflowId: string; instance: InstanceStatus };

export type BuildEffect =
  | { type: "startWorkflow"; workflowId: string; target: TargetLabel; sha: string }
  | { type: "setAlarm" }
  | { type: "clearAlarm" };

type Transition = { state: DocBuilds; effects: BuildEffect[] };

export function initialBuilds(prefix: string): DocBuilds {
  return { prefix, seq: 0, targets: {} };
}

export function applyBuildEvent(state: DocBuilds, event: BuildEvent): Transition {
  switch (event.type) {
    case "requested":
      return request(state, event.target, event.sha, false);
    case "rebuild":
      return rebuild(state, event.target);
    case "finished":
      return finish(state, event.target, event.workflowId, event.result);
    case "reconciled":
      return reconcile(state, event.target, event.workflowId, event.instance);
  }
}

function targetState(state: DocBuilds, target: TargetLabel): TargetState {
  return state.targets[target] ?? { kind: "idle", deployed: null };
}

function withTarget(state: DocBuilds, target: TargetLabel, next: TargetState): DocBuilds {
  return { ...state, targets: { ...state.targets, [target]: next } };
}

function request(state: DocBuilds, target: TargetLabel, sha: string, rebuild: boolean) {
  const current = targetState(state, target);
  const unchanged: Transition = { state, effects: [] };

  if (current.kind === "building") {
    if (sha === current.build.sha && !rebuild) return unchanged;
    return { state: withTarget(state, target, { ...current, pendingSha: sha }), effects: [] };
  }
  if (current.kind === "idle" && current.deployed?.sha === sha && !rebuild) return unchanged;

  const seq = state.seq + 1;
  const workflowId = `${state.prefix}--${target}--${seq}`;
  return {
    state: withTarget({ ...state, seq }, target, {
      kind: "building",
      build: { sha, workflowId },
      pendingSha: null,
      deployed: current.deployed,
    }),
    effects: [{ type: "startWorkflow", workflowId, target, sha }, { type: "setAlarm" }],
  } satisfies Transition;
}

// A running build captured the old doc info, so it builds again once it ends. A newer pending sha
// is built then anyway, and rebuilding the deployed sha instead would put older content live.
function rebuild(state: DocBuilds, target: TargetLabel): Transition {
  const current = targetState(state, target);
  if (current.kind === "building") {
    return request(state, target, current.pendingSha ?? current.build.sha, true);
  }
  if (!current.deployed) return { state, effects: [] };
  return request(state, target, current.deployed.sha, true);
}

function finish(
  state: DocBuilds,
  target: TargetLabel,
  workflowId: string,
  result: BuildResult,
): Transition {
  const current = targetState(state, target);
  if (current.kind !== "building" || current.build.workflowId !== workflowId) {
    return { state, effects: [] };
  }

  const settled: TargetState = result.ok
    ? {
        kind: "idle",
        deployed: { sha: current.build.sha, templateVersion: result.templateVersion },
      }
    : { kind: "failed", deployed: current.deployed, error: result.error };
  const next = withTarget(state, target, settled);
  // A pending build runs after a failure too, because the newer commit may fix it. It runs even
  // when it is the sha just deployed, which only a rebuild queues.
  const drained =
    current.pendingSha === null
      ? { state: next, effects: [] }
      : request(next, target, current.pendingSha, true);

  const stillBuilding = Object.values(drained.state.targets).some((t) => t?.kind === "building");
  return stillBuilding
    ? drained
    : { ...drained, effects: [...drained.effects, { type: "clearAlarm" }] };
}

function reconcile(
  state: DocBuilds,
  target: TargetLabel,
  workflowId: string,
  instance: InstanceStatus,
): Transition {
  switch (instance.status) {
    case "queued":
    case "running":
    case "waiting":
    case "paused":
    case "waitingForPause":
    // Starting another build now could leave two deploying to the same Worker.
    case "unknown":
      return {
        state,
        effects: isCurrentBuild(state, target, workflowId) ? [{ type: "setAlarm" }] : [],
      };
    case "complete":
      return finish(state, target, workflowId, instance.output);
    case "errored":
      return finish(state, target, workflowId, { ok: false, error: instance.error });
    case "terminated":
      return finish(state, target, workflowId, { ok: false, error: "The build was stopped" });
    case "missing":
      return restart(state, target, workflowId);
  }
}

// The DO records the workflow id before it calls `create`, so a missing instance means `create`
// never ran. Start again, with the newest requested sha, rather than fail a build nobody ran.
function restart(state: DocBuilds, target: TargetLabel, workflowId: string): Transition {
  const current = targetState(state, target);
  if (current.kind !== "building" || current.build.workflowId !== workflowId) {
    return { state, effects: [] };
  }
  const idle = withTarget(state, target, { kind: "idle", deployed: current.deployed });
  return request(idle, target, current.pendingSha ?? current.build.sha, true);
}

/** Whether `workflowId` is the build `target` is waiting on. Only that build may deploy. */
export function isCurrentBuild(state: DocBuilds, target: TargetLabel, workflowId: string): boolean {
  const current = targetState(state, target);
  return current.kind === "building" && current.build.workflowId === workflowId;
}

/** Reads why the Workflow binding could not return an instance. */
export function lookupFailure(error: unknown): InstanceStatus {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("instance.not_found") ? { status: "missing" } : { status: "unknown" };
}

const buildResult = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), templateVersion: z.string() }),
  z.object({ ok: z.literal(false), error: z.string() }),
]);

/** Reads a Workflow instance's status from the binding. Its output is the run's return value. */
export function parseInstanceStatus(raw: {
  status: string;
  error?: { message: string };
  output?: unknown;
}): InstanceStatus {
  switch (raw.status) {
    case "queued":
    case "running":
    case "waiting":
    case "paused":
    case "waitingForPause":
      return { status: raw.status };
    // Rollback handlers are running; the instance then settles as errored or terminated.
    case "rollingBack":
      return { status: "running" };
    case "complete": {
      const output = buildResult.safeParse(raw.output);
      return output.success
        ? { status: "complete", output: output.data }
        : { status: "errored", error: "The build finished without a result" };
    }
    case "errored":
      return { status: "errored", error: raw.error?.message ?? "The build failed" };
    case "terminated":
      return { status: "terminated" };
    default:
      return { status: "unknown" };
  }
}
