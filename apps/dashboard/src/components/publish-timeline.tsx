import { Spinner } from "@shiru/ui/components/spinner";
import { IconCheckOutlineDuo18, IconXmarkOutlineDuo18 } from "nucleo-ui-outline-duo-18";
import { useEffect, useState } from "react";

import { formatDuration, timeline, type TimelineStep } from "@/lib/publish-timeline";

import type { Run } from "../../../api/src/docs/runs";

const cn = (...classes: (string | false)[]) => classes.filter(Boolean).join(" ");

/** Ticks every second while `running`, so the active step's clock moves between polls. */
function useNow(running: boolean) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return now;
}

const SEGMENT: Record<TimelineStep["state"], string> = {
  done: "bg-success",
  active: "bg-info motion-safe:animate-pulse",
  failed: "bg-destructive",
  pending: "bg-border",
};

/** The latest publish of a doc, step by step. */
export function PublishTimeline({ run }: { run: Run }) {
  const now = useNow(run.ended === null);
  const { outcome, steps, current, elapsed } = timeline(run, now);
  const heading =
    outcome === "running"
      ? `Publishing · step ${current} of ${steps.length}`
      : outcome === "failed"
        ? `Failed while ${steps[current - 1].label.toLowerCase()}`
        : "Published";

  return (
    <section aria-label="Publish progress" className="rounded-xl border bg-muted/32 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={cn(
            "font-medium text-sm",
            outcome === "failed" && "text-destructive-foreground",
          )}
          aria-live="polite"
        >
          {heading}
        </p>
        <span className="font-mono text-muted-foreground text-xs tabular-nums">
          {formatDuration(elapsed)}
        </span>
      </div>
      <div className="mt-2.5 flex gap-1" aria-hidden="true">
        {steps.map((step) => (
          <span
            key={step.key}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-500",
              SEGMENT[step.state],
            )}
          />
        ))}
      </div>
      <ol className="mt-3.5 flex flex-col">
        {steps.map((step, i) => (
          <li
            key={step.key}
            aria-current={step.state === "active" ? "step" : undefined}
            className="relative flex gap-3 pb-3.5 last:pb-0"
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute start-2.5 top-6 bottom-1 w-px -translate-x-1/2 transition-colors duration-500",
                  step.state === "done" ? "bg-success/48" : "bg-border",
                )}
              />
            )}
            <StepNode state={step.state} />
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm leading-5",
                    step.state === "pending" && "text-muted-foreground",
                    step.state === "failed" && "text-destructive-foreground",
                  )}
                >
                  {step.label}
                </p>
                <p className="truncate text-muted-foreground text-xs">{step.detail}</p>
              </div>
              {step.duration !== null && (
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs tabular-nums",
                    step.state === "active" ? "text-info-foreground" : "text-muted-foreground",
                  )}
                >
                  {formatDuration(step.duration)}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepNode({ state }: { state: TimelineStep["state"] }) {
  const base = "relative flex size-5 shrink-0 items-center justify-center rounded-full";
  switch (state) {
    case "done":
      return (
        <span className={cn(base, "bg-success/16 text-success-foreground")}>
          <IconCheckOutlineDuo18 className="size-3" />
        </span>
      );
    case "active":
      return (
        <span className={cn(base, "bg-info/16 text-info-foreground")}>
          <span className="absolute inset-0 rounded-full bg-info/24 motion-safe:animate-ping" />
          <Spinner className="relative size-3" aria-hidden="true" />
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "bg-destructive/16 text-destructive-foreground")}>
          <IconXmarkOutlineDuo18 className="size-3" />
        </span>
      );
    case "pending":
      return <span className={cn(base, "border border-dashed bg-background")} />;
  }
}
