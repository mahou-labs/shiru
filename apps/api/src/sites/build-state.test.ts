import { describe, expect, it } from "vite-plus/test";

import {
  applyBuildEvent,
  type BuildEvent,
  initialBuilds,
  type InstanceStatus,
  parseInstanceStatus,
} from "./build-state";
import { LIVE, TargetLabel } from "./names";

const PR = TargetLabel.parse("pr-12");

const requested = (sha: string, target = LIVE, rebuild?: boolean): BuildEvent =>
  rebuild === undefined
    ? { type: "requested", target, sha }
    : { type: "requested", target, sha, rebuild };
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
  let state = initialBuilds("site-1");
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
      effects: [start("site-1--live--1", "a")],
      seq: 1,
      targets: {
        live: {
          kind: "building",
          build: { sha: "a", workflowId: "site-1--live--1" },
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
        succeeded("site-1--live--1"),
      ],
      effects: [start("site-1--live--1", "a"), [], [], [], [], [], start("site-1--live--2", "c")],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "c", workflowId: "site-1--live--2" },
          pendingSha: null,
          deployed: { sha: "a", templateVersion: "v1" },
        },
      },
    },
    {
      name: "ignores the deployed sha unless asked to rebuild",
      events: [
        requested("a"),
        succeeded("site-1--live--1", "v1"),
        requested("a"),
        requested("a", LIVE, true),
        succeeded("site-1--live--2", "v2"),
      ],
      effects: [start("site-1--live--1", "a"), CLEAR, [], start("site-1--live--2", "a"), CLEAR],
      seq: 2,
      targets: { live: { kind: "idle", deployed: { sha: "a", templateVersion: "v2" } } },
    },
    {
      name: "keeps the deployed version when a build fails",
      events: [
        requested("a"),
        succeeded("site-1--live--1"),
        requested("b"),
        failed("site-1--live--2"),
      ],
      effects: [start("site-1--live--1", "a"), CLEAR, start("site-1--live--2", "b"), CLEAR],
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
      events: [requested("a"), failed("site-1--live--1"), requested("a")],
      effects: [start("site-1--live--1", "a"), CLEAR, start("site-1--live--2", "a")],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "a", workflowId: "site-1--live--2" },
          pendingSha: null,
          deployed: null,
        },
      },
    },
    {
      name: "builds the pending sha after a failure",
      events: [requested("a"), requested("b"), failed("site-1--live--1")],
      effects: [start("site-1--live--1", "a"), [], start("site-1--live--2", "b")],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "b", workflowId: "site-1--live--2" },
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
        succeeded("site-1--live--1"),
        succeeded("site-1--live--1", "v9"),
        failed("site-1--live--1"),
        succeeded("site-1--live--2", "v1", PR),
        reconciled("site-1--live--1", { status: "unknown" }),
        reconciled("site-1--live--1", { status: "running" }),
      ],
      effects: [
        start("site-1--live--1", "a"),
        [],
        start("site-1--live--2", "b"),
        [],
        [],
        [],
        [],
        [],
      ],
      seq: 2,
      targets: {
        live: {
          kind: "building",
          build: { sha: "b", workflowId: "site-1--live--2" },
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
        succeeded("site-1--live--1"),
        succeeded("site-1--pr-12--2", "v1", PR),
      ],
      effects: [start("site-1--live--1", "a"), start("site-1--pr-12--2", "b", "pr-12"), [], CLEAR],
      seq: 2,
      targets: {
        live: { kind: "idle", deployed: { sha: "a", templateVersion: "v1" } },
        "pr-12": { kind: "idle", deployed: { sha: "b", templateVersion: "v1" } },
      },
    },
  ])("$name", ({ events, effects, seq, targets }) => {
    expect(run(events)).toEqual({ state: { siteId: "site-1", seq, targets }, effects });
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
    expect(run([requested("a"), reconciled("site-1--live--1", instance)])).toEqual({
      state: {
        siteId: "site-1",
        seq: 1,
        targets: {
          live: {
            kind: "building",
            build: { sha: "a", workflowId: "site-1--live--1" },
            pendingSha: null,
            deployed: null,
          },
        },
      },
      effects: [start("site-1--live--1", "a"), [{ type: "setAlarm" }]],
    });
  });

  it("applies the output of a complete instance", () => {
    const complete = reconciled("site-1--live--1", {
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
      expect(
        run([requested("a"), requested("b"), reconciled("site-1--live--1", instance)]),
      ).toEqual({
        state: {
          siteId: "site-1",
          seq: 2,
          targets: {
            live: {
              kind: "building",
              build: { sha: "b", workflowId: "site-1--live--2" },
              pendingSha: null,
              deployed: null,
            },
          },
        },
        effects: [start("site-1--live--1", "a"), [], start("site-1--live--2", "b")],
      });
      expect(run([requested("a"), reconciled("site-1--live--1", instance)]).state.targets).toEqual({
        live: { kind: "failed", deployed: null, error },
      });
    },
  );

  it("restarts a build whose instance was never created, with the newest sha", () => {
    expect(run([requested("a"), reconciled("site-1--live--1", { status: "unknown" })])).toEqual({
      state: {
        siteId: "site-1",
        seq: 2,
        targets: {
          live: {
            kind: "building",
            build: { sha: "a", workflowId: "site-1--live--2" },
            pendingSha: null,
            deployed: null,
          },
        },
      },
      effects: [start("site-1--live--1", "a"), start("site-1--live--2", "a")],
    });
    expect(
      run([requested("a"), requested("b"), reconciled("site-1--live--1", { status: "unknown" })])
        .state.targets[LIVE],
    ).toEqual({
      kind: "building",
      build: { sha: "b", workflowId: "site-1--live--2" },
      pendingSha: null,
      deployed: null,
    });
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
