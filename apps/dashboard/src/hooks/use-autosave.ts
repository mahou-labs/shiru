import { useEffect, useReducer, useRef, useState } from "react";

/**
 * Where a document's edits stand against the server. `dirty` holds edits not sent yet.
 * `saving.pending` counts requests in flight, and `saving.queued` records an edit made after the
 * last request read the document, which needs a save of its own.
 */
export type SaveState =
  | { kind: "idle" }
  | { kind: "dirty" }
  | { kind: "saving"; pending: number; queued: boolean }
  | { kind: "saved" }
  | { kind: "error"; error: unknown };

export type SaveEvent =
  | { type: "edit" }
  | { type: "send" }
  | { type: "sent" }
  | { type: "failed"; error: unknown };

export function saveReducer(state: SaveState, event: SaveEvent): SaveState {
  switch (event.type) {
    case "edit":
      // A fresh object on every edit restarts the debounce, which keys on the state's identity.
      return state.kind === "saving" ? { ...state, queued: true } : { kind: "dirty" };
    case "send":
      if (state.kind === "saving")
        return { kind: "saving", pending: state.pending + 1, queued: false };
      return hasUnsaved(state) ? { kind: "saving", pending: 1, queued: false } : state;
    case "sent":
      if (state.kind !== "saving") return state;
      if (state.pending > 1) return { ...state, pending: state.pending - 1 };
      return state.queued ? { kind: "dirty" } : { kind: "saved" };
    case "failed":
      return state.kind === "saving" ? { kind: "error", error: event.error } : state;
  }
}

/** Whether some edit has not been sent, so leaving now would lose it. */
export function hasUnsaved(state: SaveState) {
  return (
    state.kind === "dirty" || state.kind === "error" || (state.kind === "saving" && state.queued)
  );
}

/**
 * Runs writes one at a time, in order, so an older value can never land after a newer one. A failed
 * write does not stop the next, but `last()` rejects with it until another write takes its place.
 */
export function writeQueue() {
  let last: Promise<unknown> = Promise.resolve();
  return {
    push(write: () => Promise<unknown>) {
      last = last.catch(() => {}).then(write);
      return last;
    },
    last: () => last,
  };
}

/**
 * Writes what `read()` returns `delay` ms after the last `edit()`, one request at a time.
 * Unmounting with unsaved edits writes them right away, and closing the tab asks first.
 */
export function useAutosave<T>(read: () => T, write: (value: T) => Promise<unknown>, delay = 1000) {
  const [state, dispatch] = useReducer(saveReducer, { kind: "idle" });
  const latest = useRef({ state, read, write });
  const [queue] = useState(writeQueue);

  useEffect(() => {
    latest.current = { state, read, write };
  });

  /** Reads now, so the value is captured even if its source is torn down before the write. */
  function enqueue() {
    const { read, write } = latest.current;
    const value = read();
    return queue.push(() => write(value));
  }

  function send() {
    dispatch({ type: "send" });
    const request = enqueue();
    request.then(
      () => dispatch({ type: "sent" }),
      (error: unknown) => dispatch({ type: "failed", error }),
    );
    return request;
  }

  useEffect(() => {
    if (state.kind !== "dirty") return;
    const timer = setTimeout(send, delay);
    return () => clearTimeout(timer);
  }, [state]);

  const busy = state.kind !== "idle" && state.kind !== "saved";
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  useEffect(
    () => () => {
      // Failures are already reported by the write itself.
      if (hasUnsaved(latest.current.state)) enqueue().catch(() => {});
    },
    [],
  );

  return {
    state,
    edit: () => dispatch({ type: "edit" }),
    /** Sends unsaved edits now. Resolves once every edit so far is written, rejects if that fails. */
    flush: () => (hasUnsaved(state) ? send() : queue.last()),
  };
}
