import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vite-plus/test";

import { settled } from "./settled";

type Save = { path: string; content: string };

/** Saves the way useAutosave does: each write chained behind the one before it. */
function autosaver(client: QueryClient, log: string[]) {
  const gates: (() => void)[] = [];
  let inflight: Promise<unknown> = Promise.resolve();
  const observer = new MutationObserver<unknown, Error, Save>(client, {
    mutationKey: ["save"],
    mutationFn: async (save) => {
      await new Promise<void>((resolve) => gates.push(resolve));
      log.push(`save ${save.path} ${save.content}`);
    },
  });
  return {
    enqueue(save: Save) {
      inflight = inflight.then(() => observer.mutate(save)).catch(() => {});
    },
    /** Lets the oldest waiting request reach the server. */
    release: () => gates.shift()?.(),
  };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const savesOf = (path: string) => ({
  mutationKey: ["save"],
  predicate: (mutation: { state: { variables: unknown } }) =>
    (mutation.state.variables as Save | undefined)?.path === path,
});

describe("settled", () => {
  test("waits for a save queued behind one in flight before letting the delete go", async () => {
    const client = new QueryClient();
    const log: string[] = [];
    const saves = autosaver(client, log);
    saves.enqueue({ path: "src/content/docs/a.mdx", content: "typed" });
    // The editor unmounts with one more edit, flushed behind the save in flight.
    saves.enqueue({ path: "src/content/docs/a.mdx", content: "flushed" });
    const deleted = settled(client.getMutationCache(), savesOf("src/content/docs/a.mdx")).then(() =>
      log.push("delete src/content/docs/a.mdx"),
    );

    await tick();
    saves.release();
    await tick();
    expect(log).toEqual(["save src/content/docs/a.mdx typed"]);
    saves.release();
    await deleted;
    expect(log).toEqual([
      "save src/content/docs/a.mdx typed",
      "save src/content/docs/a.mdx flushed",
      "delete src/content/docs/a.mdx",
    ]);
  });

  test("waits for another page's queued save before letting a publish go", async () => {
    const client = new QueryClient();
    const log: string[] = [];
    const saves = autosaver(client, log);
    saves.enqueue({ path: "src/content/docs/a.mdx", content: "typed" });
    // Page A unmounts with one more edit as page B opens, and B publishes right away.
    saves.enqueue({ path: "src/content/docs/a.mdx", content: "flushed" });
    const published = settled(client.getMutationCache(), { mutationKey: ["save"] }).then(() =>
      log.push("publish"),
    );

    await tick();
    saves.release();
    await tick();
    expect(log).toEqual(["save src/content/docs/a.mdx typed"]);
    saves.release();
    await published;
    expect(log).toEqual([
      "save src/content/docs/a.mdx typed",
      "save src/content/docs/a.mdx flushed",
      "publish",
    ]);
  });

  test("ignores saves of other pages", async () => {
    const client = new QueryClient();
    const log: string[] = [];
    const saves = autosaver(client, log);
    saves.enqueue({ path: "src/content/docs/b.mdx", content: "typed" });
    await tick();

    await settled(client.getMutationCache(), savesOf("src/content/docs/a.mdx"));
    log.push("delete src/content/docs/a.mdx");
    saves.release();
    await tick();
    expect(log).toEqual(["delete src/content/docs/a.mdx", "save src/content/docs/b.mdx typed"]);
  });

  test("resolves when nothing is saving", async () => {
    const client = new QueryClient();
    await expect(
      settled(client.getMutationCache(), savesOf("src/content/docs/a.mdx")),
    ).resolves.toBeUndefined();
  });
});
