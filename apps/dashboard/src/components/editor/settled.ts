import type { MutationCache, MutationFilters } from "@tanstack/react-query";

const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Resolves once no mutation matching `filters` is pending. Autosave chains its writes, starting the
 * next one a few microtasks after the previous one settles, so an empty cache is only trusted after
 * a whole task has passed.
 */
export async function settled(cache: MutationCache, filters: MutationFilters) {
  const pending = () => cache.findAll({ ...filters, status: "pending" }).length > 0;
  for (;;) {
    await nextTask();
    if (!pending()) return;
    await new Promise<void>((resolve) => {
      const unsubscribe = cache.subscribe(() => {
        if (pending()) return;
        unsubscribe();
        resolve();
      });
    });
  }
}
