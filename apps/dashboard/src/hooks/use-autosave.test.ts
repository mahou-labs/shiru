import { describe, expect, test } from "vite-plus/test";

import { hasUnsaved, saveReducer, type SaveEvent, type SaveState } from "./use-autosave";

const run = (events: SaveEvent[], from: SaveState = { kind: "idle" }) =>
  events.reduce(saveReducer, from);

describe("saveReducer", () => {
  test("an edit, a send and a success end saved", () => {
    expect(run([{ type: "edit" }, { type: "send" }, { type: "sent" }])).toEqual({ kind: "saved" });
  });

  test("an edit while saving queues another save", () => {
    expect(run([{ type: "edit" }, { type: "send" }, { type: "edit" }])).toEqual({
      kind: "saving",
      pending: 1,
      queued: true,
    });
    expect(run([{ type: "edit" }, { type: "send" }, { type: "edit" }, { type: "sent" }])).toEqual({
      kind: "dirty",
    });
  });

  test("a send while saving covers the queued edit and waits for both requests", () => {
    const flushed = run([{ type: "edit" }, { type: "send" }, { type: "edit" }, { type: "send" }]);
    expect(flushed).toEqual({ kind: "saving", pending: 2, queued: false });
    expect(saveReducer(flushed, { type: "sent" })).toEqual({
      kind: "saving",
      pending: 1,
      queued: false,
    });
    expect(run([{ type: "sent" }, { type: "sent" }], flushed)).toEqual({ kind: "saved" });
  });

  test("a failed save keeps the error until a retry or the next edit", () => {
    const error = new Error("PAYMENT_REQUIRED");
    const failed = run([{ type: "edit" }, { type: "send" }, { type: "failed", error }]);
    expect(failed).toEqual({ kind: "error", error });
    expect(saveReducer(failed, { type: "send" })).toEqual({
      kind: "saving",
      pending: 1,
      queued: false,
    });
    expect(saveReducer(failed, { type: "edit" })).toEqual({ kind: "dirty" });
  });

  test("never sends without an edit", () => {
    expect(run([{ type: "send" }])).toEqual({ kind: "idle" });
    expect(run([{ type: "send" }], { kind: "saved" })).toEqual({ kind: "saved" });
  });

  test("every edit returns a new dirty state so the debounce restarts", () => {
    const dirty: SaveState = { kind: "dirty" };
    const next = saveReducer(dirty, { type: "edit" });
    expect(next).toEqual({ kind: "dirty" });
    expect(next).not.toBe(dirty);
  });

  test("ignores late results when nothing is saving", () => {
    expect(run([{ type: "sent" }], { kind: "dirty" })).toEqual({ kind: "dirty" });
    expect(run([{ type: "failed", error: 1 }], { kind: "idle" })).toEqual({ kind: "idle" });
  });
});

describe("hasUnsaved", () => {
  test.each<[SaveState, boolean]>([
    [{ kind: "idle" }, false],
    [{ kind: "dirty" }, true],
    [{ kind: "saving", pending: 1, queued: false }, false],
    [{ kind: "saving", pending: 1, queued: true }, true],
    [{ kind: "saved" }, false],
    [{ kind: "error", error: null }, true],
  ])("%j is %s", (state, expected) => {
    expect(hasUnsaved(state)).toBe(expected);
  });
});
