import { describe, expect, it } from "vite-plus/test";

import {
  applyBuildEvent,
  type BuildEvent,
  initialBuilds,
  type InstanceStatus,
  isCurrentBuild,
  lookupFailure,
  parseInstanceStatus,
} from "./build-state";
import { LIVE, TargetLabel } from "./names";

const PR = TargetLabel.parse("pr-12");

const requested = (sha: string, target = LIVE): BuildEvent => ({ type: "requested", target, sha });
const rebuild: BuildEvent = { type: "rebuild", target: LIVE };
const succeeded = (workflowId: string, templateVersion = "v1", target = LIVE): BuildEvent => ({
  type: "finished",
  target,
  workflowId,
  result: { ok: true, templateVersion },
});
const failed = (workflowId: string, error = "astro build failed"): BuildEvent => ({
  type: "finished",
  target: LIVE,
  workflowId,
  result: { ok: false, error },
});
const reconciled = (workflowId: string, instance: InstanceStatus): BuildEvent => ({
  type: "reconciled",
  target: LIVE,
  workflowId,
  instance,
});

function run(events: BuildEvent[]) {
  let state = initialBuilds("doc-1");
  const effects = [];
  for (const event of events) {
    const transition = applyBuildEvent(state, event);
    state = transition.state;
    effects.push(transition.effects);
  }
  return { state, effects };
}

const start = (workflowId: string, sha: string, target = "live") => [
  { type: "startWorkflow", workflowId, target, sha },
  { type: "setAlarm" },
];
const CLEAR = [{ type: "clearAlarm" }];

describe("applyBuildEvent", () => {
  it.each([
    {
      name: "starts the first build",
      events: [requested("a")],
      effects: [start("doc-1--live--1", "a")],
      seq: 1,
      targets: {
        live: {
          kind: "building",
          build: { sha: "a", workflowId: "doc-1--live--1" },
          pendingSha: null,
          deployed: null,
        },
      },
    },
    {
      name: "queues only the latest sha while building, then builds it with the next id",
      events: [
        requested("a"),
        requested("a"),
        requested("b"),
        requested("b"),
        requested("c"),
        requested("a"),
        succeeded("doc-1--live--1"),
      ],
      effects: [start("doc-1--live--1", "a"), [], [], [], [], [], start("doc-1--live--2", "c")],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "c", workflowId: "doc-1--live--2" },
          pendingSha: null,
          deployed: { sha: "a", templateVersion: "v1" },
        },
      },
    },
    {
      name: "ignores the deployed sha unless asked to rebuild",
      events: [
        requested("a"),
        succeeded("doc-1--live--1", "v1"),
        requested("a"),
        rebuild,
        succeeded("doc-1--live--2", "v2"),
      ],
      effects: [start("doc-1--live--1", "a"), CLEAR, [], start("doc-1--live--2", "a"), CLEAR],
      seq: 2,
      targets: { live: { kind: "idle", deployed: { sha: "a", templateVersion: "v2" } } },
    },
    {
      name: "rebuilds a running build's sha once it ends",
      events: [requested("a"), rebuild, succeeded("doc-1--live--1"), succeeded("doc-1--live--2")],
      effects: [start("doc-1--live--1", "a"), [], start("doc-1--live--2", "a"), CLEAR],
      seq: 2,
      targets: { live: { kind: "idle", deployed: { sha: "a", templateVersion: "v1" } } },
    },
    {
      name: "keeps a newer pending sha over the running one when rebuilding",
      events: [
        requested("a"),
        succeeded("doc-1--live--1"),
        requested("b"),
        requested("c"),
        rebuild,
        succeeded("doc-1--live--2"),
      ],
      effects: [
        start("doc-1--live--1", "a"),
        CLEAR,
        start("doc-1--live--2", "b"),
        [],
        [],
        start("doc-1--live--3", "c"),
      ],
      seq: 3,
      targets: {
        live: {
          kind: "building",
          build: { sha: "c", workflowId: "doc-1--live--3" },
          pendingSha: null,
          deployed: { sha: "b", templateVersion: "v1" },
        },
      },
    },
    {
      name: "rebuilds the deployed sha after a failed build",
      events: [
        requested("a"),
        succeeded("doc-1--live--1"),
        requested("b"),
        failed("doc-1--live--2"),
        rebuild,
      ],
      effects: [
        start("doc-1--live--1", "a"),
        CLEAR,
        start("doc-1--live--2", "b"),
        CLEAR,
        start("doc-1--live--3", "a"),
      ],
      seq: 3,
      targets: {
        live: {
          kind: "building",
          build: { sha: "a", workflowId: "doc-1--live--3" },
          pendingSha: null,
          deployed: { sha: "a", templateVersion: "v1" },
        },
      },
    },
    {
      name: "has nothing to rebuild before anything is deployed",
      events: [rebuild, requested("a"), failed("doc-1--live--1"), rebuild],
      effects: [[], start("doc-1--live--1", "a"), CLEAR, []],
      seq: 1,
      targets: { live: { kind: "failed", deployed: null, error: "astro build failed" } },
    },
    {
      name: "keeps the deployed version when a build fails",
      events: [
        requested("a"),
        succeeded("doc-1--live--1"),
        requested("b"),
        failed("doc-1--live--2"),
      ],
      effects: [start("doc-1--live--1", "a"), CLEAR, start("doc-1--live--2", "b"), CLEAR],
      seq: 2,
      targets: {
        live: {
          kind: "failed",
          deployed: { sha: "a", templateVersion: "v1" },
          error: "astro build failed",
        },
      },
    },
    {
      name: "retries a failed sha when asked again",
      events: [requested("a"), failed("doc-1--live--1"), requested("a")],
      effects: [start("doc-1--live--1", "a"), CLEAR, start("doc-1--live--2", "a")],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "a", workflowId: "doc-1--live--2" },
          pendingSha: null,
          deployed: null,
        },
      },
    },
    {
      name: "builds the pending sha after a failure",
      events: [requested("a"), requested("b"), failed("doc-1--live--1")],
      effects: [start("doc-1--live--1", "a"), [], start("doc-1--live--2", "b")],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "b", workflowId: "doc-1--live--2" },
          pendingSha: null,
          deployed: null,
        },
      },
    },
    {
      name: "ignores stale and unknown reports",
      events: [
        requested("a"),
        requested("b"),
        succeeded("doc-1--live--1"),
        succeeded("doc-1--live--1", "v9"),
        failed("doc-1--live--1"),
        succeeded("doc-1--live--2", "v1", PR),
        reconciled("doc-1--live--1", { status: "unknown" }),
        reconciled("doc-1--live--1", { status: "running" }),
      ],
      effects: [start("doc-1--live--1", "a"), [], start("doc-1--live--2", "b"), [], [], [], [], []],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "b", workflowId: "doc-1--live--2" },
          pendingSha: null,
          deployed: { sha: "a", templateVersion: "v1" },
        },
      },
    },
    {
      name: "keeps the alarm while another target builds, sharing one id sequence",
      events: [
        requested("a"),
        requested("b", PR),
        succeeded("doc-1--live--1"),
        succeeded("doc-1--pr-12--2", "v1", PR),
      ],
      effects: [start("doc-1--live--1", "a"), start("doc-1--pr-12--2", "b", "pr-12"), [], CLEAR],
      seq: 2,
      targets: {
        live: { kind: "idle", deployed: { sha: "a", templateVersion: "v1" } },
        "pr-12": { kind: "idle", deployed: { sha: "b", templateVersion: "v1" } },
      },
    },
  ])("$name", ({ events, effects, seq, targets }) => {
    expect(run(events)).toEqual({ state: { prefix: "doc-1", seq, targets }, effects });
  });
});

describe("reconciling a building target", () => {
  it.each([
    { status: "queued" },
    { status: "running" },
    { status: "waiting" },
    { status: "paused" },
    { status: "waitingForPause" },
  ] satisfies InstanceStatus[])("re-arms the alarm while the instance is $status", (instance) => {
    expect(run([requested("a"), reconciled("doc-1--live--1", instance)])).toEqual({
      state: {
        prefix: "doc-1",
        seq: 1,
        targets: {
          live: {
            kind: "building",
            build: { sha: "a", workflowId: "doc-1--live--1" },
            pendingSha: null,
            deployed: null,
          },
        },
      },
      effects: [start("doc-1--live--1", "a"), [{ type: "setAlarm" }]],
    });
  });

  it("applies the output of a complete instance", () => {
    const complete = reconciled("doc-1--live--1", {
      status: "complete",
      output: { ok: true, templateVersion: "v3" },
    });
    expect(run([requested("a"), complete]).state.targets).toEqual({
      live: { kind: "idle", deployed: { sha: "a", templateVersion: "v3" } },
    });
  });

  it.each([
    [{ status: "errored", error: "step deploy failed" }, "step deploy failed"],
    [{ status: "terminated" }, "The build was stopped"],
    [{ status: "complete", output: { ok: false, error: "bad config" } }, "bad config"],
  ] satisfies [InstanceStatus, string][])(
    "fails on %j and drains the pending sha",
    (instance, error) => {
      expect(run([requested("a"), requested("b"), reconciled("doc-1--live--1", instance)])).toEqual(
        {
          state: {
            prefix: "doc-1",
            seq: 2,
            targets: {
              live: {
                kind: "building",
                build: { sha: "b", workflowId: "doc-1--live--2" },
                pendingSha: null,
                deployed: null,
              },
            },
          },
          effects: [start("doc-1--live--1", "a"), [], start("doc-1--live--2", "b")],
        },
      );
      expect(run([requested("a"), reconciled("doc-1--live--1", instance)]).state.targets).toEqual({
        live: { kind: "failed", deployed: null, error },
      });
    },
  );

  it("restarts a build whose instance was never created, with the newest sha", () => {
    expect(run([requested("a"), reconciled("doc-1--live--1", { status: "missing" })])).toEqual({
      state: {
        prefix: "doc-1",
        seq: 2,
        targets: {
          live: {
            kind: "building",
            build: { sha: "a", workflowId: "doc-1--live--2" },
            pendingSha: null,
            deployed: null,
          },
        },
      },
      effects: [start("doc-1--live--1", "a"), start("doc-1--live--2", "a")],
    });
    expect(
      run([requested("a"), requested("b"), reconciled("doc-1--live--1", { status: "missing" })])
        .state.targets[LIVE],
    ).toEqual({
      kind: "building",
      build: { sha: "b", workflowId: "doc-1--live--2" },
      pendingSha: null,
      deployed: null,
    });
  });

  it("keeps waiting on a build whose status could not be read, without starting another", () => {
    expect(
      run([requested("a"), requested("b"), reconciled("doc-1--live--1", { status: "unknown" })]),
    ).toEqual({
      state: {
        prefix: "doc-1",
        seq: 1,
        targets: {
          live: {
            kind: "building",
            build: { sha: "a", workflowId: "doc-1--live--1" },
            pendingSha: "b",
            deployed: null,
          },
        },
      },
      effects: [start("doc-1--live--1", "a"), [], [{ type: "setAlarm" }]],
    });
  });
});

describe("isCurrentBuild", () => {
  it("lets only the build a target waits on deploy", () => {
    const building = run([requested("a"), requested("b")]).state;
    expect(isCurrentBuild(building, LIVE, "doc-1--live--1")).toBe(true);
    expect(isCurrentBuild(building, PR, "doc-1--live--1")).toBe(false);

    const restarted = run([
      requested("a"),
      requested("b"),
      reconciled("doc-1--live--1", { status: "missing" }),
    ]).state;
    expect(isCurrentBuild(restarted, LIVE, "doc-1--live--1")).toBe(false);
    expect(isCurrentBuild(restarted, LIVE, "doc-1--live--2")).toBe(true);

    const finished = run([requested("a"), succeeded("doc-1--live--1")]).state;
    expect(isCurrentBuild(finished, LIVE, "doc-1--live--1")).toBe(false);
  });
});

describe("lookupFailure", () => {
  it.each([
    [new Error("(instance.not_found) Instance does not exist"), { status: "missing" }],
    [new Error("instance.not_found"), { status: "missing" }],
    [new Error("Network connection lost."), { status: "unknown" }],
    ["internal error", { status: "unknown" }],
  ])("reads %s", (error, expected) => {
    expect(lookupFailure(error)).toEqual(expected);
  });
});

describe("parseInstanceStatus", () => {
  it.each([
    [{ status: "running" }, { status: "running" }],
    [{ status: "rollingBack" }, { status: "running" }],
    [
      { status: "complete", output: { ok: true, templateVersion: "1.2.0" } },
      { status: "complete", output: { ok: true, templateVersion: "1.2.0" } },
    ],
    [
      { status: "complete", output: "nothing" },
      { status: "errored", error: "The build finished without a result" },
    ],
    [
      { status: "errored", error: { name: "Error", message: "boom" } },
      { status: "errored", error: "boom" },
    ],
    [{ status: "terminated" }, { status: "terminated" }],
    [{ status: "unknown" }, { status: "unknown" }],
  ])("reads %j", (raw, expected) => {
    expect(parseInstanceStatus(raw)).toEqual(expected);
  });
});
