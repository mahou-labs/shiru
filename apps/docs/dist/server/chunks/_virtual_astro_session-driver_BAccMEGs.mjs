globalThis.process ??= {};
globalThis.process.env ??= {};
//#region ../../node_modules/.bun/unstorage@1.17.5+b14ae147aab4d897/node_modules/unstorage/drivers/utils/index.mjs
function defineDriver(factory) {
  return factory;
}
function normalizeKey(key, sep = ":") {
  if (!key) return "";
  return key.replace(/[:/\\]/g, sep).replace(/^[:/\\]|[:/\\]$/g, "");
}
function joinKeys(...keys) {
  return keys
    .map((key) => normalizeKey(key))
    .filter(Boolean)
    .join(":");
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) Error.captureStackTrace(err, createError);
  return err;
}
//#endregion
//#region ../../node_modules/.bun/unstorage@1.17.5+b14ae147aab4d897/node_modules/unstorage/drivers/utils/cloudflare.mjs
function getBinding(binding) {
  let bindingName = "[binding]";
  if (typeof binding === "string") {
    bindingName = binding;
    binding = globalThis[bindingName] || globalThis.__env__?.[bindingName];
  }
  if (!binding)
    throw createError("cloudflare", `Invalid binding \`${bindingName}\`: \`${binding}\``);
  for (const key of ["get", "put", "delete"])
    if (!(key in binding))
      throw createError(
        "cloudflare",
        `Invalid binding \`${bindingName}\`: \`${key}\` key is missing`,
      );
  return binding;
}
function getKVBinding(binding = "STORAGE") {
  return getBinding(binding);
}
//#endregion
//#region ../../node_modules/.bun/unstorage@1.17.5+b14ae147aab4d897/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs
const DRIVER_NAME = "cloudflare-kv-binding";
//#endregion
//#region \0virtual:astro:session-driver
const _virtual_astro_session_driver_default = defineDriver((opts) => {
  const r = (key = "") => (opts.base ? joinKeys(opts.base, key) : key);
  async function getKeys(base = "") {
    base = r(base);
    const binding = getKVBinding(opts.binding);
    const keys = [];
    let cursor = void 0;
    do {
      const kvList = await binding.list({
        prefix: base || void 0,
        cursor,
      });
      keys.push(...kvList.keys);
      cursor = kvList.list_complete ? void 0 : kvList.cursor;
    } while (cursor);
    return keys.map((key) => key.name);
  }
  return {
    name: DRIVER_NAME,
    options: opts,
    getInstance: () => getKVBinding(opts.binding),
    async hasItem(key) {
      key = r(key);
      return (await getKVBinding(opts.binding).get(key)) !== null;
    },
    getItem(key) {
      key = r(key);
      return getKVBinding(opts.binding).get(key);
    },
    setItem(key, value, topts) {
      key = r(key);
      return getKVBinding(opts.binding).put(
        key,
        value,
        topts
          ? {
              expirationTtl: topts?.ttl ? Math.max(topts.ttl, opts.minTTL ?? 60) : void 0,
              ...topts,
            }
          : void 0,
      );
    },
    removeItem(key) {
      key = r(key);
      return getKVBinding(opts.binding).delete(key);
    },
    getKeys(base) {
      return getKeys(base).then((keys) =>
        keys.map((key) => (opts.base ? key.slice(opts.base.length) : key)),
      );
    },
    async clear(base) {
      const binding = getKVBinding(opts.binding);
      const keys = await getKeys(base);
      await Promise.all(keys.map((key) => binding.delete(key)));
    },
  };
});
//#endregion
export { _virtual_astro_session_driver_default as default };
