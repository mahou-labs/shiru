import { describe, expect, test } from "vite-plus/test";

import { formatDuration, timeline } from "./publish-timeline";

const run = (
  steps: { queued?: number; preparing?: number; building?: number },
  ended: { at: number; ok: boolean } | null = null,
) => ({ workflowId: "w1", sha: "a", steps, ended });

const states = (steps: { state: string; duration: number | null }[]) =>
  steps.map(({ state, duration }) => [state, duration]);

describe("timeline", () => {
  test("a running build is active in its latest step, timed against now", () => {
    const result = timeline(run({ queued: 1000, preparing: 3000 }), 7500);
    expect(result.outcome).toBe("running");
    expect(result.current).toBe(2);
    expect(result.elapsed).toBe(6500);
    expect(states(result.steps)).toEqual([
      ["done", 2000],
      ["active", 4500],
      ["pending", null],
      ["pending", null],
    ]);
  });

  test("a failed build stops at the step it failed in", () => {
    const result = timeline(
      run({ queued: 0, preparing: 1000, building: 2000 }, { at: 9000, ok: false }),
      50_000,
    );
    expect([result.outcome, result.current, result.elapsed]).toEqual(["failed", 3, 9000]);
    expect(states(result.steps)).toEqual([
      ["done", 1000],
      ["done", 1000],
      ["failed", 7000],
      ["pending", null],
    ]);
  });

  test("a successful build has every step done and ends live", () => {
    const result = timeline(
      run({ queued: 0, preparing: 1000, building: 2000 }, { at: 30_000, ok: true }),
      50_000,
    );
    expect([result.outcome, result.current, result.elapsed]).toEqual(["live", 4, 30_000]);
    expect(result.steps.map((step) => step.label)).toEqual([
      "Queued",
      "Preparing",
      "Building",
      "Live",
    ]);
    expect(states(result.steps)).toEqual([
      ["done", 1000],
      ["done", 1000],
      ["done", 28_000],
      ["done", null],
    ]);
  });

  test("never shows a negative time when the browser clock is behind", () => {
    expect(timeline(run({ queued: 5000 }), 4000).steps[0].duration).toBe(0);
  });
});

describe("formatDuration", () => {
  test.each([
    [400, "<1s"],
    [12_900, "12s"],
    [65_000, "1m 05s"],
  ])("%d ms reads %s", (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});
