import { describe, expect, it } from "vite-plus/test";

import type { TargetState } from "./build-state";
import { endRun, enterStep, startRun } from "./runs";

const building = (workflowId: string): TargetState => ({
  kind: "building",
  build: { sha: "a", workflowId },
  pendingSha: null,
  deployed: null,
});

describe("runs", () => {
  it("records each step once, keeping the first entry across retries", () => {
    let run = startRun("w1", "a", 100);
    run = enterStep(run, "w1", "preparing", 110);
    run = enterStep(run, "w1", "building", 130);
    run = enterStep(run, "w1", "preparing", 150);
    expect(run).toEqual({
      workflowId: "w1",
      sha: "a",
      steps: { queued: 100, preparing: 110, building: 130 },
      ended: null,
    });
  });

  it("ignores steps from another build", () => {
    const run = startRun("w2", "b", 100);
    expect(enterStep(run, "w1", "building", 120)).toBe(run);
  });

  it("stays open while its build runs, then ends with the target's outcome", () => {
    const run = enterStep(startRun("w1", "a", 100), "w1", "building", 120);
    expect(endRun(run, building("w1"), 200)).toBe(run);
    expect(
      endRun(run, { kind: "idle", deployed: { sha: "a", templateVersion: "1" } }, 200).ended,
    ).toEqual({ at: 200, ok: true });
    expect(endRun(run, { kind: "failed", deployed: null, error: "lint" }, 200).ended).toEqual({
      at: 200,
      ok: false,
    });
  });

  it("keeps the first end and ignores steps after it", () => {
    const ended = endRun(
      startRun("w1", "a", 100),
      { kind: "failed", deployed: null, error: "x" },
      150,
    );
    expect(endRun(ended, undefined, 300)).toBe(ended);
    expect(enterStep(ended, "w1", "building", 400)).toBe(ended);
  });
});
