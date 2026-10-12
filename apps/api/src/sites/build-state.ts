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

// One coordinator per site, not per target: a Durable Object has a single alarm, and workflow ids
// come from one sequence so a deleted and recreated target never reuses an old instance id.
export type SiteBuilds = {
  siteId: string;
  seq: number;
  targets: Partial<Record<TargetLabel, TargetState>>;
};

export type BuildResult = { ok: true; templateVersion: string } | { ok: false; error: string };

export type InstanceStatus =
  | { status: "queued" | "running" | "waiting" | "paused" | "waitingForPause" }
  | { status: "complete"; output: BuildResult }
  | { status: "errored"; error: string }
  | { status: "terminated" }
  // Also what the caller passes when the instance does not exist.
  | { status: "unknown" };

export type BuildEvent =
  | { type: "requested"; target: TargetLabel; sha: string; rebuild?: boolean }
  | { type: "finished"; target: TargetLabel; workflowId: string; result: BuildResult }
  | { type: "reconciled"; target: TargetLabel; workflowId: string; instance: InstanceStatus };

export type BuildEffect =
  | { type: "startWorkflow"; workflowId: string; target: TargetLabel; sha: string }
  | { type: "setAlarm" }
  | { type: "clearAlarm" };

type Transition = { state: SiteBuilds; effects: BuildEffect[] };

export function initialBuilds(siteId: string): SiteBuilds {
  return { siteId, seq: 0, targets: {} };
}

export function applyBuildEvent(state: SiteBuilds, event: BuildEvent): Transition {
  switch (event.type) {
    case "requested":
      return request(state, event.target, event.sha, event.rebuild ?? false);
    case "finished":
      return finish(state, event.target, event.workflowId, event.result);
    case "reconciled":
      return reconcile(state, event.target, event.workflowId, event.instance);
  }
}

function targetState(state: SiteBuilds, target: TargetLabel): TargetState {
  return state.targets[target] ?? { kind: "idle", deployed: null };
}

function withTarget(state: SiteBuilds, target: TargetLabel, next: TargetState): SiteBuilds {
  return { ...state, targets: { ...state.targets, [target]: next } };
}

function request(state: SiteBuilds, target: TargetLabel, sha: string, rebuild: boolean) {
  const current = targetState(state, target);
  const unchanged: Transition = { state, effects: [] };

  if (current.kind === "building") {
    if (sha === current.build.sha) return unchanged;
    return { state: withTarget(state, target, { ...current, pendingSha: sha }), effects: [] };
  }
  if (current.kind === "idle" && current.deployed?.sha === sha && !rebuild) return unchanged;

  const seq = state.seq + 1;
  const workflowId = `${state.siteId}--${target}--${seq}`;
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

function finish(
  state: SiteBuilds,
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
  // A pending build runs after a failure too, because the newer commit may fix it.
  const drained =
    current.pendingSha === null
      ? { state: next, effects: [] }
      : request(next, target, current.pendingSha, false);

  const stillBuilding = Object.values(drained.state.targets).some((t) => t?.kind === "building");
  return stillBuilding
    ? drained
    : { ...drained, effects: [...drained.effects, { type: "clearAlarm" }] };
}

function reconcile(
  state: SiteBuilds,
  target: TargetLabel,
  workflowId: string,
  instance: InstanceStatus,
): Transition {
  switch (instance.status) {
    case "queued":
    case "running":
    case "waiting":
    case "paused":
    case "waitingForPause": {
      const current = targetState(state, target);
      const live = current.kind === "building" && current.build.workflowId === workflowId;
      return { state, effects: live ? [{ type: "setAlarm" }] : [] };
    }
    case "complete":
      return finish(state, target, workflowId, instance.output);
    case "errored":
      return finish(state, target, workflowId, { ok: false, error: instance.error });
    case "terminated":
      return finish(state, target, workflowId, { ok: false, error: "The build was stopped" });
    case "unknown":
      return restart(state, target, workflowId);
  }
}

// The DO records the workflow id before it calls `create`, so a missing instance means `create`
// never ran. Start again, with the newest requested sha, rather than fail a build nobody ran.
function restart(state: SiteBuilds, target: TargetLabel, workflowId: string): Transition {
  const current = targetState(state, target);
  if (current.kind !== "building" || current.build.workflowId !== workflowId) {
    return { state, effects: [] };
  }
  const idle = withTarget(state, target, { kind: "idle", deployed: current.deployed });
  return request(idle, target, current.pendingSha ?? current.build.sha, true);
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
