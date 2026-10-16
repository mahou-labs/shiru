import { describe, expect, test } from "vite-plus/test";

import type { TargetState } from "../../../api/src/docs/build-state";
import type { DocStatus } from "../../../api/src/docs/doc";
import { DRAFT, LIVE } from "../../../api/src/docs/names";
import { hasContent, previewState } from "./preview-state";

const deployed = { sha: "b2", templateVersion: "t1" };
const build = { sha: "c3", workflowId: "w1" };

const status = (draft?: TargetState, rest: Partial<DocStatus> = {}): DocStatus => ({
  headSha: "a1",
  targets: draft ? { [LIVE]: { kind: "idle", deployed: null }, [DRAFT]: draft } : {},
  runs: {},
  drafts: [],
  ...rest,
});

describe("previewState", () => {
  test("a doc never previewed has no preview", () => {
    expect(previewState(status())).toEqual({ kind: "none" });
    expect(previewState(status({ kind: "idle", deployed: null }))).toEqual({ kind: "none" });
  });

  test("a deployed draft target is ready at its sha", () => {
    expect(previewState(status({ kind: "idle", deployed }))).toEqual({
      kind: "ready",
      deployed: "b2",
    });
  });

  test("a rebuild keeps serving the last preview", () => {
    expect(previewState(status({ kind: "building", build, pendingSha: null, deployed }))).toEqual({
      kind: "building",
      deployed: "b2",
    });
    expect(
      previewState(status({ kind: "building", build, pendingSha: "d4", deployed: null })),
    ).toEqual({ kind: "building", deployed: null });
  });

  test("a failed build carries its error and the last preview", () => {
    expect(previewState(status({ kind: "failed", error: "boom", deployed }))).toEqual({
      kind: "failed",
      error: "boom",
      deployed: "b2",
    });
  });

  test("ignores the live target", () => {
    const live = status(undefined, {
      targets: { [LIVE]: { kind: "failed", error: "live broke", deployed } },
    });
    expect(previewState(live)).toEqual({ kind: "none" });
  });
});

describe("hasContent", () => {
  const draft = {
    path: "index.md",
    op: "put" as const,
    conflict: false,
    updatedAt: 1,
    updatedBy: "u",
  };

  test.each([
    ["a commit", { headSha: "a1", drafts: [] }, true],
    ["only drafts", { headSha: null, drafts: [draft] }, true],
    ["nothing", { headSha: null, drafts: [] }, false],
  ])("a doc with %s", (_, rest, expected) => {
    expect(hasContent(status(undefined, rest))).toBe(expected);
  });
});
