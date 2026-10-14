import { BUILD_STEPS, type BuildStep, type Run } from "../../../api/src/docs/runs";

export type TimelineStep = {
  key: BuildStep | "live";
  label: string;
  detail: string;
  state: "done" | "active" | "failed" | "pending";
  /** Milliseconds spent in the step, so far for the active one. */
  duration: number | null;
};

export type Timeline = {
  outcome: "running" | "live" | "failed";
  steps: TimelineStep[];
  /** 1-based position of the step the run is in, or stopped at. */
  current: number;
  elapsed: number;
};

const STEPS: Record<TimelineStep["key"], { label: string; detail: string }> = {
  queued: { label: "Queued", detail: "Waiting for a builder" },
  preparing: { label: "Preparing", detail: "Copying your files into the builder" },
  building: { label: "Building", detail: "Checking links and rendering every page" },
  live: { label: "Live", detail: "Readers see the new version" },
};

/** Where a run stands, step by step. `now` ends the active step's clock while it runs. */
export function timeline(run: Run, now: number): Timeline {
  const starts = BUILD_STEPS.map((step) => run.steps[step] ?? null);
  const reached = starts.findLastIndex((start) => start !== null);
  const end = run.ended?.at ?? now;
  const outcome = run.ended ? (run.ended.ok ? "live" : "failed") : "running";

  const steps: TimelineStep[] = BUILD_STEPS.map((key, i) => {
    const start = starts[i];
    const next = starts.slice(i + 1).find((at) => at !== null) ?? end;
    const state =
      i < reached || outcome === "live"
        ? "done"
        : i > reached
          ? "pending"
          : outcome === "failed"
            ? "failed"
            : "active";
    const duration = start === null || state === "pending" ? null : Math.max(0, next - start);
    return { key, ...STEPS[key], state, duration };
  });
  steps.push({
    key: "live",
    ...STEPS.live,
    state: outcome === "live" ? "done" : "pending",
    duration: null,
  });

  return {
    outcome,
    steps,
    current: outcome === "live" ? steps.length : reached + 1,
    elapsed: Math.max(0, end - (starts[0] ?? end)),
  };
}

export function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 1) return "<1s";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}
