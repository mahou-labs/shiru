globalThis.process ??= {};
globalThis.process.env ??= {};
import {
  A as NoClientOnlyHint,
  F as OnlyResponseCanBeReturned,
  K as UnavailableAstroGlobal,
  M as NoMatchingImport,
  N as NoMatchingRenderer,
  V as ResponseSentError,
  X as AstroError,
  k as MissingMediaQueryDirective,
  s as EndpointDidNotReturnAResponse,
  t as shorthash,
  y as InvalidComponentArgs,
} from "./shorthash_DX7y3U4-.mjs";
const ASTRO_GENERATOR = `Astro v6.1.1`;
const REROUTE_DIRECTIVE_HEADER = "X-Astro-Reroute";
const REWRITE_DIRECTIVE_HEADER_KEY = "X-Astro-Rewrite";
const NOOP_MIDDLEWARE_HEADER = "X-Astro-Noop";
const ROUTE_TYPE_HEADER = "X-Astro-Route-Type";
const DEFAULT_404_COMPONENT = "astro-default-404.astro";
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308, 300, 304];
const REROUTABLE_STATUS_CODES = [404, 500];
const clientAddressSymbol = /* @__PURE__ */ Symbol.for("astro.clientAddress");
const originPathnameSymbol = /* @__PURE__ */ Symbol.for("astro.originPathname");
const pipelineSymbol = /* @__PURE__ */ Symbol.for("astro.pipeline");
const responseSentSymbol = /* @__PURE__ */ Symbol.for("astro.responseSent");
//#endregion
//#region ../../node_modules/.bun/piccolore@0.1.3/node_modules/piccolore/dist/index.js
const e = globalThis.process || {},
  t = e.argv || [],
  n = e.env || {},
  r$1 =
    !(n.NO_COLOR || t.includes(`--no-color`)) &&
    (!!n.FORCE_COLOR ||
      t.includes(`--color`) ||
      e.platform === `win32` ||
      ((e.stdout || {}).isTTY && n.TERM !== `dumb`) ||
      !!n.CI),
  i =
    (e, t, n = e) =>
    (r) => {
      let i = `` + r,
        o = i.indexOf(t, e.length);
      return ~o ? e + a(i, t, n, o) + t : e + i + t;
    },
  a = (e, t, n, r) => {
    let i = ``,
      a = 0;
    do ((i += e.substring(a, r) + n), (a = r + t.length), (r = e.indexOf(t, a)));
    while (~r);
    return i + e.substring(a);
  },
  o = (e = r$1) => {
    let t = e ? i : () => String;
    return {
      isColorSupported: e,
      reset: t(`\x1B[0m`, `\x1B[0m`),
      bold: t(`\x1B[1m`, `\x1B[22m`, `\x1B[22m\x1B[1m`),
      dim: t(`\x1B[2m`, `\x1B[22m`, `\x1B[22m\x1B[2m`),
      italic: t(`\x1B[3m`, `\x1B[23m`),
      underline: t(`\x1B[4m`, `\x1B[24m`),
      inverse: t(`\x1B[7m`, `\x1B[27m`),
      hidden: t(`\x1B[8m`, `\x1B[28m`),
      strikethrough: t(`\x1B[9m`, `\x1B[29m`),
      black: t(`\x1B[30m`, `\x1B[39m`),
      red: t(`\x1B[31m`, `\x1B[39m`),
      green: t(`\x1B[32m`, `\x1B[39m`),
      yellow: t(`\x1B[33m`, `\x1B[39m`),
      blue: t(`\x1B[34m`, `\x1B[39m`),
      magenta: t(`\x1B[35m`, `\x1B[39m`),
      cyan: t(`\x1B[36m`, `\x1B[39m`),
      white: t(`\x1B[37m`, `\x1B[39m`),
      gray: t(`\x1B[90m`, `\x1B[39m`),
      bgBlack: t(`\x1B[40m`, `\x1B[49m`),
      bgRed: t(`\x1B[41m`, `\x1B[49m`),
      bgGreen: t(`\x1B[42m`, `\x1B[49m`),
      bgYellow: t(`\x1B[43m`, `\x1B[49m`),
      bgBlue: t(`\x1B[44m`, `\x1B[49m`),
      bgMagenta: t(`\x1B[45m`, `\x1B[49m`),
      bgCyan: t(`\x1B[46m`, `\x1B[49m`),
      bgWhite: t(`\x1B[47m`, `\x1B[49m`),
      blackBright: t(`\x1B[90m`, `\x1B[39m`),
      redBright: t(`\x1B[91m`, `\x1B[39m`),
      greenBright: t(`\x1B[92m`, `\x1B[39m`),
      yellowBright: t(`\x1B[93m`, `\x1B[39m`),
      blueBright: t(`\x1B[94m`, `\x1B[39m`),
      magentaBright: t(`\x1B[95m`, `\x1B[39m`),
      cyanBright: t(`\x1B[96m`, `\x1B[39m`),
      whiteBright: t(`\x1B[97m`, `\x1B[39m`),
      bgBlackBright: t(`\x1B[100m`, `\x1B[49m`),
      bgRedBright: t(`\x1B[101m`, `\x1B[49m`),
      bgGreenBright: t(`\x1B[102m`, `\x1B[49m`),
      bgYellowBright: t(`\x1B[103m`, `\x1B[49m`),
      bgBlueBright: t(`\x1B[104m`, `\x1B[49m`),
      bgMagentaBright: t(`\x1B[105m`, `\x1B[49m`),
      bgCyanBright: t(`\x1B[106m`, `\x1B[49m`),
      bgWhiteBright: t(`\x1B[107m`, `\x1B[49m`),
    };
  };
const s = o();
Object.freeze({ status: "aborted" });
function $constructor(name, initializer, params) {
  function init(inst, def) {
    if (!inst._zod)
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set(),
        },
        enumerable: false,
      });
    if (inst._zod.traits.has(name)) return;
    inst._zod.traits.add(name);
    initializer(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) inst[k] = proto[k].bind(inst);
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {}
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    let _a;
    const inst = params?.Parent ? new Definition() : this;
    init(inst, def);
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    for (const fn of inst._zod.deferred) fn();
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent) return true;
      return inst?._zod?.traits?.has(name);
    },
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
const $ZodAsyncError = class extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
};
const $ZodEncodeError = class extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
};
const globalConfig = {};
function config(newConfig) {
  if (newConfig) Object.assign(globalConfig, newConfig);
  return globalConfig;
}
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  return Object.entries(entries)
    .filter(([k, _]) => numericValues.indexOf(+k) === -1)
    .map(([_, v]) => v);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint") return value.toString();
  return value;
}
function cached(getter) {
  return {
    get value() {
      {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    },
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
const EVALUATING = Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = void 0;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) return;
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, { value: v });
    },
    configurable: true,
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
  return Object.defineProperties({}, mergedDescriptors);
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
cached(() => {
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare"))
    return false;
  try {
    new Function("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false) return false;
  const ctor = o.constructor;
  if (ctor === void 0) return true;
  if (typeof ctor !== "function") return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o)) return { ...o };
  if (Array.isArray(o)) return [...o];
  return o;
}
const propertyKeyTypes = new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent) cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params) return {};
  if (typeof params === "string") return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return {
      ...params,
      error: () => params.error,
    };
  return params;
}
(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, -Number.MAX_VALUE, Number.MAX_VALUE);
function aborted(x, startIndex = 0) {
  if (x.aborted === true) return true;
  for (let i = startIndex; i < x.issues.length; i++)
    if (x.issues[i]?.continue !== true) return true;
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    let _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
  const full = {
    ...iss,
    path: iss.path ?? [],
  };
  if (!iss.message)
    full.message =
      unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
      unwrapMessage(ctx?.error?.(iss)) ??
      unwrapMessage(config.customError?.(iss)) ??
      unwrapMessage(config.localeError?.(iss)) ??
      "Invalid input";
  delete full.inst;
  delete full.continue;
  if (!ctx?.reportInput) delete full.input;
  return full;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input)) return "array";
  if (typeof input === "string") return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string")
    return {
      message: iss,
      code: "custom",
      input,
      inst,
    };
  return { ...iss };
}
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/errors.js
const initializer$1 = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false,
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false,
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false,
  });
};
const $ZodError = $constructor("$ZodError", initializer$1);
const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues)
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else formErrors.push(mapper(sub));
  return {
    formErrors,
    fieldErrors,
  };
}
function formatError(error, mapper = (issue) => issue.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error) => {
    for (const issue of error.issues)
      if (issue.code === "invalid_union" && issue.errors.length)
        issue.errors.map((issues) => processError({ issues }));
      else if (issue.code === "invalid_key") processError({ issues: issue.issues });
      else if (issue.code === "invalid_element") processError({ issues: issue.issues });
      else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
      else {
        let curr = fieldErrors;
        let i = 0;
        while (i < issue.path.length) {
          const el = issue.path[i];
          if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
          else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue));
          }
          curr = curr[el];
          i++;
        }
      }
  };
  processError(error);
  return fieldErrors;
}
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/parse.js
const _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
  const result = schema._zod.run(
    {
      value,
      issues: [],
    },
    ctx,
  );
  if (result instanceof Promise) throw new $ZodAsyncError();
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(
      result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
    );
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run(
    {
      value,
      issues: [],
    },
    ctx,
  );
  if (result instanceof Promise) result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(
      result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
    );
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx
    ? {
        ..._ctx,
        async: false,
      }
    : { async: false };
  const result = schema._zod.run(
    {
      value,
      issues: [],
    },
    ctx,
  );
  if (result instanceof Promise) throw new $ZodAsyncError();
  return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? $ZodError)(
          result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
        ),
      }
    : {
        success: true,
        data: result.value,
      };
};
const safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError);
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run(
    {
      value,
      issues: [],
    },
    ctx,
  );
  if (result instanceof Promise) result = await result;
  return result.issues.length
    ? {
        success: false,
        error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
      }
    : {
        success: true,
        data: result.value,
      };
};
const safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError);
const _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
const _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/checks.js
const $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a = inst._zod).onattach ?? (_a.onattach = []);
});
const $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ??
    (_a.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.length !== void 0;
    });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (input.length <= def.maximum) return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort,
    });
  };
});
const $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ??
    (_a.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.length !== void 0;
    });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (input.length >= def.minimum) return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort,
    });
  };
});
const $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ??
    (_a.when = (payload) => {
      const val = payload.value;
      return !nullish(val) && val.length !== void 0;
    });
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length) return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...(tooBig
        ? {
            code: "too_big",
            maximum: def.length,
          }
        : {
            code: "too_small",
            minimum: def.length,
          }),
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort,
    });
  };
});
const $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/versions.js
const version = {
  major: 4,
  minor: 3,
  patch: 6,
};
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/schemas.js
const $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...(inst._zod.def.checks ?? [])];
  if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
  for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
  if (checks.length === 0) {
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks) {
        if (ch._zod.def.when) {
          if (!ch._zod.def.when(payload)) continue;
        } else if (isAborted) continue;
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
        if (asyncResult || _ instanceof Promise)
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            if (payload.issues.length === currLen) return;
            if (!isAborted) isAborted = aborted(payload, currLen);
          });
        else {
          if (payload.issues.length === currLen) continue;
          if (!isAborted) isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult)
        return asyncResult.then(() => {
          return payload;
        });
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false) throw new $ZodAsyncError();
        return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse(
          {
            value: payload.value,
            issues: [],
          },
          {
            ...ctx,
            skipChecks: true,
          },
        );
        if (canary instanceof Promise)
          return canary.then((canary) => {
            return handleCanaryResult(canary, payload, ctx);
          });
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false) throw new $ZodAsyncError();
        return result.then((result) => runChecks(result, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse$1(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync$1(inst, value).then((r) =>
          r.success ? { value: r.data } : { issues: r.error?.issues },
        );
      }
    },
    vendor: "zod",
    version: 1,
  }));
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
  final.value[index] = result.value;
}
const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst,
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run(
        {
          value: item,
          issues: [],
        },
        ctx,
      );
      if (result instanceof Promise)
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      else handleArrayResult(result, payload, i);
    }
    if (proms.length) return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results)
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
  });
  return final;
}
const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () =>
    def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0,
  );
  defineLazy(inst._zod, "optout", () =>
    def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0,
  );
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values))
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
  });
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) return first(payload, ctx);
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run(
        {
          value: payload.value,
          issues: [],
        },
        ctx,
      );
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0) return result;
        results.push(result);
      }
    }
    if (!async) return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx);
    });
  };
});
const $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run(
      {
        value: input,
        issues: [],
      },
      ctx,
    );
    const right = def.right._zod.run(
      {
        value: input,
        issues: [],
      },
      ctx,
    );
    if (left instanceof Promise || right instanceof Promise)
      return Promise.all([left, right]).then(([left, right]) => {
        return handleIntersectionResults(payload, left, right);
      });
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b)
    return {
      valid: true,
      data: a,
    };
  if (a instanceof Date && b instanceof Date && +a === +b)
    return {
      valid: true,
      data: a,
    };
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = {
      ...a,
      ...b,
    };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid)
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
        };
      newObj[key] = sharedValue.data;
    }
    return {
      valid: true,
      data: newObj,
    };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return {
        valid: false,
        mergeErrorPath: [],
      };
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid)
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
        };
      newArray.push(sharedValue.data);
    }
    return {
      valid: true,
      data: newArray,
    };
  }
  return {
    valid: false,
    mergeErrorPath: [],
  };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = /* @__PURE__ */ new Map();
  let unrecIssue;
  for (const iss of left.issues)
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k)) unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else result.issues.push(iss);
  for (const iss of right.issues)
    if (iss.code === "unrecognized_keys")
      for (const k of iss.keys) {
        if (!unrecKeys.has(k)) unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    else result.issues.push(iss);
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue)
    result.issues.push({
      ...unrecIssue,
      keys: bothKeys,
    });
  if (aborted(result)) return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid)
    throw new Error(
      `Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`,
    );
  result.value = merged.data;
  return result;
}
const $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(
    `^(${values
      .filter((k) => propertyKeyTypes.has(typeof k))
      .map((o) => (typeof o === "string" ? escapeRegex(o) : o.toString()))
      .join("|")})$`,
  );
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) return payload;
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst,
    });
    return payload;
  };
});
const $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
    const _out = def.transform(payload.value, payload);
    if (ctx.async)
      return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
        payload.value = output;
        return payload;
      });
    if (_out instanceof Promise) throw new $ZodAsyncError();
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (result.issues.length && input === void 0)
    return {
      issues: [],
      value: void 0,
    };
  return result;
}
const $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, payload.value));
      return handleOptionalResult(result, payload.value);
    }
    if (payload.value === void 0) return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null) return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      /**
       * $ZodDefault returns the default value immediately in forward direction.
       * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) payload.value = def.defaultValue;
  return payload;
}
const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
    if (payload.value === void 0) payload.value = def.defaultValue;
    return def.innerType._zod.run(payload, ctx);
  };
});
const $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise)
      return result.then((result) => handleNonOptionalResult(result, inst));
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0)
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst,
    });
  return payload;
}
const $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise)
      return result.then((result) => {
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
            input: payload.value,
          });
          payload.issues = [];
        }
        return payload;
      });
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
        input: payload.value,
      });
      payload.issues = [];
    }
    return payload;
  };
});
const $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise)
        return right.then((right) => handlePipeResult(right, def.in, ctx));
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run(
    {
      value: left.value,
      issues: left.issues,
    },
    ctx,
  );
}
const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) return result.then(handleReadonlyResult);
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
    handleRefineResult(r, payload, input, inst);
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...(inst._zod.def.path ?? [])],
      continue: !inst._zod.def.abort,
    };
    if (inst._zod.def.params) _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/registries.js
let _a;
const $ZodRegistry = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...(this.get(p) ?? {}) };
      delete pm.id;
      const f = {
        ...pm,
        ...this._map.get(schema),
      };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
};
function registry() {
  return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/api.js
/* @__NO_SIDE_EFFECTS__ */
function _maxLength(maximum, params) {
  return new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum,
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum,
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length,
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx,
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    ...normalizeParams(params),
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _custom(Class, fn, _params) {
  const norm = normalizeParams(_params);
  norm.abort ?? (norm.abort = true);
  return new Class({
    type: "custom",
    check: "custom",
    fn,
    ...norm,
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _refine(Class, fn, _params) {
  return new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params),
  });
}
/* @__NO_SIDE_EFFECTS__ */
function _superRefine(fn) {
  const ch = /* @__PURE__ */ _check((payload) => {
    payload.addIssue = (issue$2) => {
      if (typeof issue$2 === "string")
        payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
      else {
        const _issue = issue$2;
        if (_issue.fatal) _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  });
  return ch;
}
/* @__NO_SIDE_EFFECTS__ */
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params),
  });
  ch._zod.check = fn;
  return ch;
}
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4") target = "draft-04";
  if (target === "draft-7") target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0,
  };
}
function process$1(
  schema,
  ctx,
  _params = {
    path: [],
    schemaPath: [],
  },
) {
  let _a;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
    return seen.schema;
  }
  const result = {
    schema: {},
    count: 1,
    cycle: void 0,
    path: _params.path,
  };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) result.schema = overrideSchema;
  else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path,
    };
    if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
    else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref) result.ref = parent;
      process$1(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta) Object.assign(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && result.schema._prefault)
    (_a = result.schema).default ?? (_a.default = result.schema._prefault);
  delete result.schema._prefault;
  return ctx.seen.get(schema).schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = /* @__PURE__ */ new Map();
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0])
        throw new Error(
          `Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) return { ref: uriGenerator(externalId) };
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return {
        defId: id,
        ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`,
      };
    }
    if (entry[1] === root) return { ref: "#" };
    const defUriPrefix = `#/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return {
      defId,
      ref: defUriPrefix + defId,
    };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) return;
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId) seen.defId = defId;
    const schema = seen.schema;
    for (const key in schema) delete schema[key];
    schema.$ref = ref;
  };
  if (ctx.cycles === "throw")
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle)
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    if (ctx.metadataRegistry.get(entry[0])?.id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null) return;
    const schema = seen.def ?? seen.schema;
    const _cached = { ...schema };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (
        refSchema.$ref &&
        (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")
      ) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else Object.assign(schema, refSchema);
      Object.assign(schema, _cached);
      if (zodSchema._zod.parent === ref)
        for (const key in schema) {
          if (key === "$ref" || key === "allOf") continue;
          if (!(key in _cached)) delete schema[key];
        }
      if (refSchema.$ref && refSeen.def)
        for (const key in schema) {
          if (key === "$ref" || key === "allOf") continue;
          if (
            key in refSeen.def &&
            JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])
          )
            delete schema[key];
        }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema.$ref = parentSeen.schema.$ref;
        if (parentSeen.def)
          for (const key in schema) {
            if (key === "$ref" || key === "allOf") continue;
            if (
              key in parentSeen.def &&
              JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])
            )
              delete schema[key];
          }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema,
      path: seen.path ?? [],
    });
  };
  for (const entry of [...ctx.seen.entries()].toReversed()) flattenRef(entry[0]);
  const result = {};
  if (ctx.target === "draft-2020-12")
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
  else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
  else if (ctx.target === "openapi-3.0") {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id) throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) defs[seen.defId] = seen.def;
  }
  if (ctx.external) {
  } else if (Object.keys(defs).length > 0)
    if (ctx.target === "draft-2020-12") result.$defs = defs;
    else result.definitions = defs;
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors),
        },
      },
      enumerable: false,
      writable: false,
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.", { cause: _err });
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema)) return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform") return true;
  if (def.type === "array") return isTransforming(def.element, ctx);
  if (def.type === "set") return isTransforming(def.valueType, ctx);
  if (def.type === "lazy") return isTransforming(def.getter(), ctx);
  if (
    def.type === "promise" ||
    def.type === "optional" ||
    def.type === "nonoptional" ||
    def.type === "nullable" ||
    def.type === "readonly" ||
    def.type === "default" ||
    def.type === "prefault"
  )
    return isTransforming(def.innerType, ctx);
  if (def.type === "intersection")
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  if (def.type === "record" || def.type === "map")
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  if (def.type === "pipe") return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  if (def.type === "object") {
    for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) if (isTransforming(option, ctx)) return true;
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) if (isTransforming(item, ctx)) return true;
    if (def.rest && isTransforming(def.rest, ctx)) return true;
    return false;
  }
  return false;
}
/**
 * Creates a toJSONSchema method for a schema instance.
 * This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
 */
const createToJSONSchemaMethod =
  (schema, processors = {}) =>
  (params) => {
    const ctx = initializeContext({
      ...params,
      processors,
    });
    process$1(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
  };
const createStandardJSONSchemaMethod =
  (schema, io, processors = {}) =>
  (params) => {
    const { libraryOptions, target } = params ?? {};
    const ctx = initializeContext({
      ...(libraryOptions ?? {}),
      target,
      io,
      processors,
    });
    process$1(schema, ctx);
    extractDefs(ctx, schema);
    return finalize(ctx, schema);
  };
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/core/json-schema-processors.js
const enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number")) json.type = "number";
  if (values.every((v) => typeof v === "string")) json.type = "string";
  json.enum = values;
};
const customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
};
const transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
};
const arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number") json.minItems = minimum;
  if (typeof maximum === "number") json.maxItems = maximum;
  json.type = "array";
  json.items = process$1(def.element, ctx, {
    ...params,
    path: [...params.path, "items"],
  });
};
const unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) =>
    process$1(x, ctx, {
      ...params,
      path: [...params.path, isExclusive ? "oneOf" : "anyOf", i],
    }),
  );
  if (isExclusive) json.oneOf = options;
  else json.anyOf = options;
};
const intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process$1(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0],
  });
  const b = process$1(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1],
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  json.allOf = [
    ...(isSimpleIntersection(a) ? a.allOf : [a]),
    ...(isSimpleIntersection(b) ? b.allOf : [b]),
  ];
};
const nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else json.anyOf = [inner, { type: "null" }];
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
const defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
const prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
const catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const innerType =
    ctx.io === "input" ? (def.in._zod.def.type === "transform" ? def.out : def.in) : def.out;
  process$1(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process$1(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/endpoint.js
async function renderEndpoint(mod, context, isPrerendered, logger) {
  const { request, url } = context;
  const method = request.method.toUpperCase();
  let handler = mod[method] ?? mod["ALL"];
  if (!handler && method === "HEAD" && mod["GET"]) handler = mod["GET"];
  if (isPrerendered && !["GET", "HEAD"].includes(method))
    logger.warn(
      "router",
      `${url.pathname} ${s.bold(method)} requests are not available in static endpoints. Mark this page as server-rendered (\`export const prerender = false;\`) or update your config to \`output: 'server'\` to make all your pages server-rendered by default.`,
    );
  if (handler === void 0) {
    logger.warn(
      "router",
      `No API Route handler exists for the method "${method}" for the route "${url.pathname}".
Found handlers: ${Object.keys(mod)
        .map((exp) => JSON.stringify(exp))
        .join(", ")}
` +
        ("all" in mod
          ? `One of the exported handlers is "all" (lowercase), did you mean to export 'ALL'?
`
          : ""),
    );
    return new Response(null, { status: 404 });
  }
  if (typeof handler !== "function") {
    logger.error(
      "router",
      `The route "${url.pathname}" exports a value for the method "${method}", but it is of the type ${typeof handler} instead of a function.`,
    );
    return new Response(null, { status: 500 });
  }
  let response = await handler.call(mod, context);
  if (!response || response instanceof Response === false)
    throw new AstroError(EndpointDidNotReturnAResponse);
  if (REROUTABLE_STATUS_CODES.includes(response.status))
    try {
      response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
    } catch (err) {
      if (err.message?.includes("immutable")) {
        response = new Response(response.body, response);
        response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
      } else throw err;
    }
  if (method === "HEAD") return new Response(null, response);
  return response;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/astro-component.js
function validateArgs(args) {
  if (args.length !== 3) return false;
  if (!args[0] || typeof args[0] !== "object") return false;
  return true;
}
function baseCreateComponent(cb, moduleId, propagation) {
  const name = moduleId?.split("/").pop()?.replace(".astro", "") ?? "";
  const fn = (...args) => {
    if (!validateArgs(args))
      throw new AstroError({
        ...InvalidComponentArgs,
        message: InvalidComponentArgs.message(name),
      });
    return cb(...args);
  };
  Object.defineProperty(fn, "name", {
    value: name,
    writable: false,
  });
  fn.isAstroComponentFactory = true;
  fn.moduleId = moduleId;
  fn.propagation = propagation;
  return fn;
}
function createComponentWithOptions(opts) {
  return baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
}
function createComponent(arg1, moduleId, propagation) {
  if (typeof arg1 === "function") return baseCreateComponent(arg1, moduleId, propagation);
  else return createComponentWithOptions(arg1);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/astro-global.js
function createError(name) {
  return new AstroError({
    ...UnavailableAstroGlobal,
    message: UnavailableAstroGlobal.message(name),
  });
}
function createAstro(site) {
  return {
    get site() {
      console.warn(
        `Astro.site inside getStaticPaths is deprecated and will be removed in a future major version of Astro. Use import.meta.env.SITE instead`,
      );
      return site ? new URL(site) : void 0;
    },
    get generator() {
      console.warn(
        `Astro.generator inside getStaticPaths is deprecated and will be removed in a future major version of Astro.`,
      );
      return ASTRO_GENERATOR;
    },
    get callAction() {
      throw createError("callAction");
    },
    get clientAddress() {
      throw createError("clientAddress");
    },
    get cookies() {
      throw createError("cookies");
    },
    get csp() {
      throw createError("csp");
    },
    get currentLocale() {
      throw createError("currentLocale");
    },
    get getActionResult() {
      throw createError("getActionResult");
    },
    get isPrerendered() {
      throw createError("isPrerendered");
    },
    get locals() {
      throw createError("locals");
    },
    get originPathname() {
      throw createError("originPathname");
    },
    get params() {
      throw createError("params");
    },
    get preferredLocale() {
      throw createError("preferredLocale");
    },
    get preferredLocaleList() {
      throw createError("preferredLocaleList");
    },
    get props() {
      throw createError("props");
    },
    get redirect() {
      throw createError("redirect");
    },
    get request() {
      throw createError("request");
    },
    get response() {
      throw createError("response");
    },
    get rewrite() {
      throw createError("rewrite");
    },
    get routePattern() {
      throw createError("routePattern");
    },
    get self() {
      throw createError("self");
    },
    get slots() {
      throw createError("slots");
    },
    get url() {
      throw createError("url");
    },
    get session() {
      throw createError("session");
    },
    get cache() {
      throw createError("cache");
    },
  };
}
//#endregion
//#region ../../node_modules/.bun/html-escaper@3.0.3/node_modules/html-escaper/esm/index.js
/**
 * Copyright (C) 2017-present by Andrea Giammarchi - @WebReflection
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
const { replace } = "";
const ca = /[&<>'"]/g;
const esca = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
};
const pe = (m) => esca[m];
/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string} es the input to safely escape
 * @returns {string} the escaped input, and it **throws** an error if
 *  the input type is unexpected, except for boolean and numbers,
 *  converted as string.
 */
const escape = (es) => replace.call(es, ca, pe);
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/util.js
function isPromise(value) {
  return (
    !!value && typeof value === "object" && "then" in value && typeof value.then === "function"
  );
}
async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/escape.js
const escapeHTML = escape;
const HTMLBytes = class extends Uint8Array {};
Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
  get() {
    return "HTMLBytes";
  },
});
const HTMLString = class extends String {
  get [Symbol.toStringTag]() {
    return "HTMLString";
  }
};
const markHTMLString = (value) => {
  if (value instanceof HTMLString) return value;
  if (typeof value === "string") return new HTMLString(value);
  return value;
};
function isHTMLString(value) {
  return value instanceof HTMLString;
}
function markHTMLBytes(bytes) {
  return new HTMLBytes(bytes);
}
function hasGetReader(obj) {
  return typeof obj.getReader === "function";
}
async function* unescapeChunksAsync(iterable) {
  if (hasGetReader(iterable))
    for await (const chunk of streamAsyncIterator(iterable)) yield unescapeHTML(chunk);
  else for await (const chunk of iterable) yield unescapeHTML(chunk);
}
function* unescapeChunks(iterable) {
  for (const chunk of iterable) yield unescapeHTML(chunk);
}
function unescapeHTML(str) {
  if (!!str && typeof str === "object") {
    if (str instanceof Uint8Array) return markHTMLBytes(str);
    else if (str instanceof Response && str.body) {
      const body = str.body;
      return unescapeChunksAsync(body);
    } else if (typeof str.then === "function")
      return Promise.resolve(str).then((value) => {
        return unescapeHTML(value);
      });
    else if (str[/* @__PURE__ */ Symbol.for("astro:slot-string")]) return str;
    else if (Symbol.iterator in str) return unescapeChunks(str);
    else if (Symbol.asyncIterator in str || hasGetReader(str)) return unescapeChunksAsync(str);
  }
  return markHTMLString(str);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/jsx-runtime/index.js
const AstroJSX = "astro:jsx";
const Empty = /* @__PURE__ */ Symbol("empty");
const toSlotName = (slotAttr) => slotAttr;
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode["astro:jsx"];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string") return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child)) return;
    if (!("slot" in child.props)) return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  } else if (Array.isArray(vnode.props.children))
    vnode.props.children = vnode.props.children
      .map((child) => {
        if (!isVNode(child)) return child;
        if (!("slot" in child.props)) return child;
        const name = toSlotName(child.props.slot);
        if (Array.isArray(slots[name])) slots[name].push(child);
        else {
          slots[name] = [child];
          slots[name]["$$slot"] = true;
        }
        delete child.props.slot;
        return Empty;
      })
      .filter((v) => v !== Empty);
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string") return markHTMLString(child);
  if (Array.isArray(child)) return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props)) return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props = {}, key) {
  if (key) props.key = key;
  const vnode = {
    [Renderer]: "astro:jsx",
    [AstroJSX]: true,
    type,
    props,
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/head-propagation/resolver.js
function resolvePropagationHint(input) {
  const explicitHint = input.factoryHint ?? "none";
  if (explicitHint !== "none") return explicitHint;
  if (!input.moduleId) return "none";
  return input.metadataLookup(input.moduleId) ?? "none";
}
function isPropagatingHint(hint) {
  return hint === "self" || hint === "in-tree";
}
function getPropagationHint$1(result, factory) {
  return resolvePropagationHint({
    factoryHint: factory.propagation,
    moduleId: factory.moduleId,
    metadataLookup: (moduleId) => result.componentMetadata.get(moduleId)?.propagation,
  });
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/astro/factory.js
function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
function isAPropagatingComponent(result, factory) {
  return isPropagatingHint(getPropagationHint(result, factory));
}
function getPropagationHint(result, factory) {
  return getPropagationHint$1(result, factory);
}
//#endregion
//#region ../../node_modules/.bun/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
  let t,
    f,
    n = "";
  if ("string" === typeof e || "number" === typeof e) n += e;
  else if ("object" === typeof e)
    if (Array.isArray(e)) {
      const o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), (n += f));
    } else for (f in e) e[f] && (n && (n += " "), (n += f));
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++)
    (e = arguments[f]) && (t = r(e)) && (n && (n += " "), (n += t));
  return n;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/serialize.js
const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10,
  Infinity: 11,
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value))
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value))
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    }),
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  switch (Object.prototype.toString.call(value)) {
    case "[object Date]":
      return [PROP_TYPE.Date, value.toISOString()];
    case "[object RegExp]":
      return [PROP_TYPE.RegExp, value.source];
    case "[object Map]":
      return [PROP_TYPE.Map, serializeArray(Array.from(value), metadata, parents)];
    case "[object Set]":
      return [PROP_TYPE.Set, serializeArray(Array.from(value), metadata, parents)];
    case "[object BigInt]":
      return [PROP_TYPE.BigInt, value.toString()];
    case "[object URL]":
      return [PROP_TYPE.URL, value.toString()];
    case "[object Array]":
      return [PROP_TYPE.JSON, serializeArray(value, metadata, parents)];
    case "[object Uint8Array]":
      return [PROP_TYPE.Uint8Array, Array.from(value)];
    case "[object Uint16Array]":
      return [PROP_TYPE.Uint16Array, Array.from(value)];
    case "[object Uint32Array]":
      return [PROP_TYPE.Uint32Array, Array.from(value)];
    default:
      if (value !== null && typeof value === "object")
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      if (value === Number.POSITIVE_INFINITY) return [PROP_TYPE.Infinity, 1];
      if (value === Number.NEGATIVE_INFINITY) return [PROP_TYPE.Infinity, -1];
      if (value === void 0) return [PROP_TYPE.Value];
      return [PROP_TYPE.Value, value];
  }
}
function serializeProps(props, metadata) {
  return JSON.stringify(serializeObject(props, metadata));
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/hydration.js
const transitionDirectivesToCopyOnIsland = Object.freeze([
  "data-astro-transition-scope",
  "data-astro-transition-persist",
  "data-astro-transition-persist-props",
]);
function extractDirectives(inputProps, clientDirectives) {
  const extracted = {
    isPage: false,
    hydration: null,
    props: {},
    propsWithoutTransitionAttributes: {},
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") extracted.isPage = true;
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration)
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" },
        };
      switch (key) {
        case "client:component-path":
          extracted.hydration.componentUrl = value;
          break;
        case "client:component-export":
          extracted.hydration.componentExport.value = value;
          break;
        case "client:component-hydration":
          break;
        case "client:display-name":
          break;
        default:
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!clientDirectives.has(extracted.hydration.directive)) {
            const hydrationMethods = Array.from(clientDirectives.keys())
              .map((d) => `client:${d}`)
              .join(", ");
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${hydrationMethods}`,
            );
          }
          if (
            extracted.hydration.directive === "media" &&
            typeof extracted.hydration.value !== "string"
          )
            throw new AstroError(MissingMediaQueryDirective);
          break;
      }
    } else {
      extracted.props[key] = value;
      if (!transitionDirectivesToCopyOnIsland.includes(key))
        extracted.propsWithoutTransitionAttributes[key] = value;
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
    extracted.propsWithoutTransitionAttributes[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value)
    throw new AstroError({
      ...NoMatchingImport,
      message: NoMatchingImport.message(metadata.displayName),
    });
  const island = {
    children: "",
    props: { uid: astroId },
  };
  if (attrs)
    for (const [key, value] of Object.entries(attrs)) island.props[key] = escapeHTML(value);
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(
      decodeURI(renderer.clientEntrypoint.toString()),
    );
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  const beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) island.props["before-hydration-url"] = beforeHydrationUrl;
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || "",
    }),
  );
  transitionDirectivesToCopyOnIsland.forEach((name) => {
    if (typeof props[name] !== "undefined") island.props[name] = props[name];
  });
  return island;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/astro/head-and-content.js
const headAndContentSym = /* @__PURE__ */ Symbol.for("astro.headAndContent");
function isHeadAndContent(obj) {
  return typeof obj === "object" && obj !== null && !!obj[headAndContentSym];
}
function createThinHead() {
  return { [headAndContentSym]: true };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/astro-island.prebuilt.js
const astro_island_prebuilt_default = `(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i[o]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>Number.POSITIVE_INFINITY*t},o=t=>{let[l,e]=t;return l in i?i[l](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map(([l,e])=>[l,o(e)]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island[ssr]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template[data-astro-template]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n[r.getAttribute("name")||"default"]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export \${v})\`),console.error(\`[hydrate] Error parsing props for component \${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro[c]===void 0){window.addEventListener(\`astro:\${c}\`,()=>this.start(),{once:!0});return}try{await Astro[c](async()=>{let n=this.getAttribute("renderer-url"),[h,{default:p}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h[u];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component[f]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`[astro-island] Error hydrating \${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",["props"]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();`;
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/astro-island-styles.js
const ISLAND_STYLES = "astro-island,astro-slot,astro-static-slot{display:contents}";
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/scripts.js
function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) return false;
  return (result._metadata.hasHydrationScript = true);
}
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) return false;
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(result, directive) {
  const clientDirective = result.clientDirectives.get(directive);
  if (!clientDirective) throw new Error(`Unknown directive: ${directive}`);
  return clientDirective;
}
function getPrescripts(result, type, directive) {
  switch (type) {
    case "both":
      return `<style>${ISLAND_STYLES}</style><script>${getDirectiveScriptText(result, directive)}</script><script>${astro_island_prebuilt_default}</script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(result, directive)}</script>`;
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/head-propagation/buffer.js
async function collectPropagatedHeadParts(input) {
  const collectedHeadParts = [];
  const iterator = input.propagators.values();
  while (true) {
    const { value, done } = iterator.next();
    if (done) break;
    const returnValue = await value.init(input.result);
    if (input.isHeadAndContent(returnValue) && returnValue.head)
      collectedHeadParts.push(returnValue.head);
  }
  return collectedHeadParts;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/head-propagation/policy.js
function shouldRenderHeadInstruction(state) {
  return !state.hasRenderedHead && !state.partial;
}
function shouldRenderMaybeHeadInstruction(state) {
  return !state.hasRenderedHead && !state.headInTree && !state.partial;
}
function shouldRenderInstruction$1(type, state) {
  return type === "head"
    ? shouldRenderHeadInstruction(state)
    : shouldRenderMaybeHeadInstruction(state);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/head-propagation/runtime.js
function registerIfPropagating(result, factory, instance) {
  if (factory.propagation === "self" || factory.propagation === "in-tree") {
    result._metadata.propagators.add(instance);
    return;
  }
  if (factory.moduleId) {
    const hint = result.componentMetadata.get(factory.moduleId)?.propagation;
    if (isPropagatingHint(hint ?? "none")) result._metadata.propagators.add(instance);
  }
}
async function bufferPropagatedHead(result) {
  const collected = await collectPropagatedHeadParts({
    propagators: result._metadata.propagators,
    result,
    isHeadAndContent,
  });
  result._metadata.extraHead.push(...collected);
}
function shouldRenderInstruction(type, state) {
  return shouldRenderInstruction$1(type, state);
}
function getInstructionRenderState(result) {
  return {
    hasRenderedHead: result._metadata.hasRenderedHead,
    headInTree: result._metadata.headInTree,
    partial: result.partial,
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/csp.js
function renderCspContent(result) {
  const finalScriptHashes = /* @__PURE__ */ new Set();
  const finalStyleHashes = /* @__PURE__ */ new Set();
  for (const scriptHash of result.scriptHashes) finalScriptHashes.add(`'${scriptHash}'`);
  for (const styleHash of result.styleHashes) finalStyleHashes.add(`'${styleHash}'`);
  for (const styleHash of result._metadata.extraStyleHashes) finalStyleHashes.add(`'${styleHash}'`);
  for (const scriptHash of result._metadata.extraScriptHashes)
    finalScriptHashes.add(`'${scriptHash}'`);
  let directives;
  if (result.directives.length > 0) directives = result.directives.join(";") + ";";
  let scriptResources = "'self'";
  if (result.scriptResources.length > 0)
    scriptResources = result.scriptResources.map((r) => `${r}`).join(" ");
  let styleResources = "'self'";
  if (result.styleResources.length > 0)
    styleResources = result.styleResources.map((r) => `${r}`).join(" ");
  const strictDynamic = result.isStrictDynamic ? ` 'strict-dynamic'` : "";
  const scriptSrc = `script-src ${scriptResources} ${Array.from(finalScriptHashes).join(" ")}${strictDynamic};`;
  const styleSrc = `style-src ${styleResources} ${Array.from(finalStyleHashes).join(" ")};`;
  return [directives, scriptSrc, styleSrc].filter(Boolean).join(" ");
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/instruction.js
const RenderInstructionSymbol = /* @__PURE__ */ Symbol.for("astro:render");
function createRenderInstruction(instruction) {
  return Object.defineProperty(instruction, RenderInstructionSymbol, { value: true });
}
function isRenderInstruction(chunk) {
  return chunk && typeof chunk === "object" && chunk[RenderInstructionSymbol];
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/util.js
const voidElementNames =
  /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes =
  /^(?:allowfullscreen|async|autofocus|autoplay|checked|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|inert|loop|muted|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|selected|itemscope)$/i;
const AMPERSAND_REGEX = /&/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) =>
  k.trim().replace(/(?!^)\b\w|\s+|\W+/g, (match, index) => {
    if (/\W/.test(match)) return "";
    return index === 0 ? match : match.toUpperCase();
  });
const toAttributeString = (value, shouldEscape = true) =>
  shouldEscape
    ? String(value).replace(AMPERSAND_REGEX, "&#38;").replace(DOUBLE_QUOTE_REGEX, "&#34;")
    : value;
const kebab = (k) =>
  k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) =>
  Object.entries(obj)
    .filter(([_, v]) => (typeof v === "string" && v.trim()) || typeof v === "number")
    .map(([k, v]) => {
      if (k[0] !== "-" && k[1] !== "-") return `${kebab(k)}:${v}`;
      return `${k}:${v}`;
    })
    .join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars))
    output += `const ${toIdent(key)} = ${JSON.stringify(value)?.replace(/<\/script>/g, "\\x3C/script>")};
`;
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function isCustomElement(tagName) {
  return tagName.includes("-");
}
function handleBooleanAttribute(key, value, shouldEscape, tagName) {
  if (tagName && isCustomElement(tagName))
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  return markHTMLString(value ? ` ${key}` : "");
}
function addAttribute(value, key, shouldEscape = true, tagName = "") {
  if (value == null) return "";
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(clsx(value), shouldEscape);
    if (listValue === "") return "";
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString)) {
    if (Array.isArray(value) && value.length === 2)
      return markHTMLString(
        ` ${key}="${toAttributeString(`${toStyleString(value[0])};${value[1]}`, shouldEscape)}"`,
      );
    if (typeof value === "object")
      return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
  }
  if (key === "className")
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  if (htmlBooleanAttributes.test(key))
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  if (value === "") return markHTMLString(` ${key}`);
  if (key === "popover" && typeof value === "boolean")
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  if (key === "download" && typeof value === "boolean")
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  if (key === "hidden" && typeof value === "boolean")
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
}
function internalSpreadAttributes(values, shouldEscape = true, tagName) {
  let output = "";
  for (const [key, value] of Object.entries(values))
    output += addAttribute(value, key, shouldEscape, tagName);
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children === "") && voidElementNames.test(name))
    return `<${name}${internalSpreadAttributes(props, shouldEscape, name)}>`;
  return `<${name}${internalSpreadAttributes(props, shouldEscape, name)}>${children}</${name}>`;
}
const noop = () => {};
const BufferedRenderer = class {
  chunks = [];
  renderPromise;
  destination;
  /**
   * Determines whether buffer has been flushed
   * to the final destination.
   */
  flushed = false;
  constructor(destination, renderFunction) {
    this.destination = destination;
    this.renderPromise = renderFunction(this);
    if (isPromise(this.renderPromise)) Promise.resolve(this.renderPromise).catch(noop);
  }
  write(chunk) {
    if (this.flushed) this.destination.write(chunk);
    else this.chunks.push(chunk);
  }
  flush() {
    if (this.flushed) throw new Error("The render buffer has already been flushed.");
    this.flushed = true;
    for (const chunk of this.chunks) this.destination.write(chunk);
    return this.renderPromise;
  }
};
function createBufferedRenderer(destination, renderFunction) {
  return new BufferedRenderer(destination, renderFunction);
}
const isNode =
  typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]";
const isDeno = typeof Deno !== "undefined";
function promiseWithResolvers() {
  let resolve, reject;
  return {
    promise: new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    }),
    resolve,
    reject,
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/head.js
function stablePropsKey(props) {
  const keys = Object.keys(props).toSorted();
  let result = "{";
  for (let i = 0; i < keys.length; i++) {
    if (i > 0) result += ",";
    result += JSON.stringify(keys[i]) + ":" + JSON.stringify(props[keys[i]]);
  }
  result += "}";
  return result;
}
function deduplicateElements(elements) {
  if (elements.length <= 1) return elements;
  const seen = /* @__PURE__ */ new Set();
  return elements.filter((item) => {
    const key = stablePropsKey(item.props) + item.children;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function renderAllHeadContent(result) {
  result._metadata.hasRenderedHead = true;
  let content = "";
  if (result.shouldInjectCspMetaTags && result.cspDestination === "meta")
    content += renderElement$1(
      "meta",
      {
        props: {
          "http-equiv": "content-security-policy",
          content: renderCspContent(result),
        },
        children: "",
      },
      false,
    );
  const styles = deduplicateElements(Array.from(result.styles)).map((style) =>
    style.props.rel === "stylesheet"
      ? renderElement$1("link", style)
      : renderElement$1("style", style),
  );
  result.styles.clear();
  const scripts = deduplicateElements(Array.from(result.scripts)).map((script) => {
    if (result.userAssetsBase)
      script.props.src =
        (result.base === "/" ? "" : result.base) + result.userAssetsBase + script.props.src;
    return renderElement$1("script", script, false);
  });
  const links = deduplicateElements(Array.from(result.links)).map((link) =>
    renderElement$1("link", link, false),
  );
  content += styles.join("\n") + links.join("\n") + scripts.join("\n");
  if (result._metadata.extraHead.length > 0)
    for (const part of result._metadata.extraHead) content += part;
  return markHTMLString(content);
}
function renderHead() {
  return createRenderInstruction({ type: "head" });
}
function maybeRenderHead() {
  return createRenderInstruction({ type: "maybe-head" });
}
//#endregion
//#region ../../node_modules/.bun/@oslojs+encoding@1.1.0/node_modules/@oslojs/encoding/dist/hex.js
function encodeHexUpperCase(data) {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += alphabetUpperCase[data[i] >> 4];
    result += alphabetUpperCase[data[i] & 15];
  }
  return result;
}
function decodeHex(data) {
  if (data.length % 2 !== 0) throw new Error("Invalid hex string");
  const result = new Uint8Array(data.length / 2);
  for (let i = 0; i < data.length; i += 2) {
    if (!(data[i] in decodeMap)) throw new Error("Invalid character");
    if (!(data[i + 1] in decodeMap)) throw new Error("Invalid character");
    result[i / 2] |= decodeMap[data[i]] << 4;
    result[i / 2] |= decodeMap[data[i + 1]];
  }
  return result;
}
const alphabetUpperCase = "0123456789ABCDEF";
const decodeMap = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15,
};
//#endregion
//#region ../../node_modules/.bun/@oslojs+encoding@1.1.0/node_modules/@oslojs/encoding/dist/base32.js
let EncodingPadding$1;
(function (EncodingPadding) {
  EncodingPadding[(EncodingPadding["Include"] = 0)] = "Include";
  EncodingPadding[(EncodingPadding["None"] = 1)] = "None";
})(EncodingPadding$1 || (EncodingPadding$1 = {}));
let DecodingPadding$1;
(function (DecodingPadding) {
  DecodingPadding[(DecodingPadding["Required"] = 0)] = "Required";
  DecodingPadding[(DecodingPadding["Ignore"] = 1)] = "Ignore";
})(DecodingPadding$1 || (DecodingPadding$1 = {}));
//#endregion
//#region ../../node_modules/.bun/@oslojs+encoding@1.1.0/node_modules/@oslojs/encoding/dist/base64.js
function encodeBase64(bytes) {
  return encodeBase64_internal(bytes, base64Alphabet, EncodingPadding.Include);
}
function encodeBase64_internal(bytes, alphabet, padding) {
  let result = "";
  for (let i = 0; i < bytes.byteLength; i += 3) {
    let buffer = 0;
    let bufferBitSize = 0;
    for (let j = 0; j < 3 && i + j < bytes.byteLength; j++) {
      buffer = (buffer << 8) | bytes[i + j];
      bufferBitSize += 8;
    }
    for (let j = 0; j < 4; j++)
      if (bufferBitSize >= 6) {
        result += alphabet[(buffer >> (bufferBitSize - 6)) & 63];
        bufferBitSize -= 6;
      } else if (bufferBitSize > 0) {
        result += alphabet[(buffer << (6 - bufferBitSize)) & 63];
        bufferBitSize = 0;
      } else if (padding === EncodingPadding.Include) result += "=";
  }
  return result;
}
const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function decodeBase64(encoded) {
  return decodeBase64_internal(encoded, base64DecodeMap, DecodingPadding.Required);
}
function decodeBase64_internal(encoded, decodeMap, padding) {
  const result = new Uint8Array(Math.ceil(encoded.length / 4) * 3);
  let totalBytes = 0;
  for (let i = 0; i < encoded.length; i += 4) {
    let chunk = 0;
    let bitsRead = 0;
    for (let j = 0; j < 4; j++) {
      if (padding === DecodingPadding.Required && encoded[i + j] === "=") continue;
      if (padding === DecodingPadding.Ignore && (i + j >= encoded.length || encoded[i + j] === "="))
        continue;
      if (j > 0 && encoded[i + j - 1] === "=") throw new Error("Invalid padding");
      if (!(encoded[i + j] in decodeMap)) throw new Error("Invalid character");
      chunk |= decodeMap[encoded[i + j]] << ((3 - j) * 6);
      bitsRead += 6;
    }
    if (bitsRead < 24) {
      let unused;
      if (bitsRead === 12) unused = chunk & 65535;
      else if (bitsRead === 18) unused = chunk & 255;
      else throw new Error("Invalid padding");
      if (unused !== 0) throw new Error("Invalid padding");
    }
    const byteLength = Math.floor(bitsRead / 8);
    for (let i = 0; i < byteLength; i++) {
      result[totalBytes] = (chunk >> (16 - i * 8)) & 255;
      totalBytes++;
    }
  }
  return result.slice(0, totalBytes);
}
let EncodingPadding;
(function (EncodingPadding) {
  EncodingPadding[(EncodingPadding["Include"] = 0)] = "Include";
  EncodingPadding[(EncodingPadding["None"] = 1)] = "None";
})(EncodingPadding || (EncodingPadding = {}));
let DecodingPadding;
(function (DecodingPadding) {
  DecodingPadding[(DecodingPadding["Required"] = 0)] = "Required";
  DecodingPadding[(DecodingPadding["Ignore"] = 1)] = "Ignore";
})(DecodingPadding || (DecodingPadding = {}));
const base64DecodeMap = {
  0: 52,
  1: 53,
  2: 54,
  3: 55,
  4: 56,
  5: 57,
  6: 58,
  7: 59,
  8: 60,
  9: 61,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
  a: 26,
  b: 27,
  c: 28,
  d: 29,
  e: 30,
  f: 31,
  g: 32,
  h: 33,
  i: 34,
  j: 35,
  k: 36,
  l: 37,
  m: 38,
  n: 39,
  o: 40,
  p: 41,
  q: 42,
  r: 43,
  s: 44,
  t: 45,
  u: 46,
  v: 47,
  w: 48,
  x: 49,
  y: 50,
  z: 51,
  "+": 62,
  "/": 63,
};
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/classic/errors.js
const initializer = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: { value: (mapper) => formatError(inst, mapper) },
    flatten: { value: (mapper) => flattenError(inst, mapper) },
    addIssue: {
      value: (issue) => {
        inst.issues.push(issue);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      },
    },
    addIssues: {
      value: (issues) => {
        inst.issues.push(...issues);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      },
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      },
    },
  });
};
$constructor("ZodError", initializer);
const ZodRealError = $constructor("ZodError", initializer, { Parent: Error });
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/classic/parse.js
const parse = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region ../../node_modules/.bun/zod@4.3.6/node_modules/zod/v4/classic/schemas.js
const ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output"),
    },
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.check = (...checks) => {
    return inst.clone(
      mergeDefs(def, {
        checks: [
          ...(def.checks ?? []),
          ...checks.map((ch) =>
            typeof ch === "function"
              ? {
                  _zod: {
                    check: ch,
                    def: { check: "custom" },
                    onattach: [],
                  },
                }
              : ch,
          ),
        ],
      }),
      { parent: true },
    );
  };
  inst.with = inst.check;
  inst.clone = (def, params) => clone(inst, def, params);
  inst.brand = () => inst;
  inst.register = (reg, meta) => {
    reg.add(inst, meta);
    return inst;
  };
  inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse(inst, data, params);
  inst.parseAsync = async (data, params) =>
    parseAsync(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  inst.refine = (check, params) => inst.check(refine(check, params));
  inst.superRefine = (refinement) => inst.check(superRefine(refinement));
  inst.overwrite = (fn) => inst.check(/* @__PURE__ */ _overwrite(fn));
  inst.optional = () => optional(inst);
  inst.exactOptional = () => exactOptional(inst);
  inst.nullable = () => nullable(inst);
  inst.nullish = () => optional(nullable(inst));
  inst.nonoptional = (params) => nonoptional(inst, params);
  inst.array = () => array(inst);
  inst.or = (arg) => union([inst, arg]);
  inst.and = (arg) => intersection(inst, arg);
  inst.transform = (tx) => pipe(inst, transform(tx));
  inst.default = (def) => _default(inst, def);
  inst.prefault = (def) => prefault(inst, def);
  inst.catch = (params) => _catch(inst, params);
  inst.pipe = (target) => pipe(inst, target);
  inst.readonly = () => readonly(inst);
  inst.describe = (description) => {
    const cl = inst.clone();
    globalRegistry.add(cl, { description });
    return cl;
  };
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true,
  });
  inst.meta = (...args) => {
    if (args.length === 0) return globalRegistry.get(inst);
    const cl = inst.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  };
  inst.isOptional = () => inst.safeParse(void 0).success;
  inst.isNullable = () => inst.safeParse(null).success;
  inst.apply = (fn) => fn(inst);
  return inst;
});
const ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  inst.min = (minLength, params) => inst.check(/* @__PURE__ */ _minLength(minLength, params));
  inst.nonempty = (params) => inst.check(/* @__PURE__ */ _minLength(1, params));
  inst.max = (maxLength, params) => inst.check(/* @__PURE__ */ _maxLength(maxLength, params));
  inst.length = (len, params) => inst.check(/* @__PURE__ */ _length(len, params));
  inst.unwrap = () => inst.element;
});
function array(element, params) {
  return /* @__PURE__ */ _array(ZodArray, element, params);
}
const ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params),
  });
}
const ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) =>
    intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right,
  });
}
const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values)
      if (keys.has(value)) newEntries[value] = def.entries[value];
      else throw new Error(`Key ${value} not found in enum`);
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries,
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values)
      if (keys.has(value)) delete newEntries[value];
      else throw new Error(`Key ${value} not found in enum`);
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries,
    });
  };
});
function _enum(values, params) {
  return new ZodEnum({
    type: "enum",
    entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
    ...normalizeParams(params),
  });
}
const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
    payload.addIssue = (issue$1) => {
      if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
      else {
        const _issue = issue$1;
        if (_issue.fatal) _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise)
      return output.then((output) => {
        payload.value = output;
        return payload;
      });
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn,
  });
}
const ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType,
  });
}
const ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType,
  });
}
const ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType,
  });
}
const ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    },
  });
}
const ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    },
  });
}
const ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) =>
    nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params),
  });
}
const ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue,
  });
}
const ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out,
  });
}
const ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType,
  });
}
const ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function custom(fn, _params) {
  return /* @__PURE__ */ _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
  return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
  return /* @__PURE__ */ _superRefine(fn);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/csp/config.js
const ALGORITHMS = {
  "SHA-256": "sha256-",
  "SHA-384": "sha384-",
  "SHA-512": "sha512-",
};
const ALGORITHM_VALUES = Object.values(ALGORITHMS);
_enum(Object.keys(ALGORITHMS)).optional().default("SHA-256");
custom((value) => {
  if (typeof value !== "string") return false;
  return ALGORITHM_VALUES.some((allowedValue) => {
    return value.startsWith(allowedValue);
  });
});
const ALLOWED_DIRECTIVES = [
  "base-uri",
  "child-src",
  "connect-src",
  "default-src",
  "fenced-frame-src",
  "font-src",
  "form-action",
  "frame-ancestors",
  "frame-src",
  "img-src",
  "manifest-src",
  "media-src",
  "object-src",
  "referrer",
  "report-to",
  "report-uri",
  "require-trusted-types-for",
  "sandbox",
  "trusted-types",
  "upgrade-insecure-requests",
  "worker-src",
];
custom((value) => {
  if (typeof value !== "string") return false;
  return ALLOWED_DIRECTIVES.some((allowedValue) => {
    return value.startsWith(allowedValue);
  });
});
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/encryption.js
const ALGORITHM = "AES-GCM";
async function decodeKey(encoded) {
  const bytes = decodeBase64(encoded);
  return crypto.subtle.importKey("raw", bytes.buffer, ALGORITHM, true, ["encrypt", "decrypt"]);
}
const encoder$1 = new TextEncoder();
const decoder$1 = new TextDecoder();
const IV_LENGTH = 24;
async function encryptString(key, raw) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH / 2));
  const data = encoder$1.encode(raw);
  const buffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    data,
  );
  return encodeHexUpperCase(iv) + encodeBase64(new Uint8Array(buffer));
}
async function decryptString(key, encoded) {
  const iv = decodeHex(encoded.slice(0, IV_LENGTH));
  const dataArray = decodeBase64(encoded.slice(IV_LENGTH));
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    dataArray,
  );
  return decoder$1.decode(decryptedBuffer);
}
async function generateCspDigest(data, algorithm) {
  const hashBuffer = await crypto.subtle.digest(algorithm, encoder$1.encode(data));
  const hash = encodeBase64(new Uint8Array(hashBuffer));
  return `${ALGORITHMS[algorithm]}${hash}`;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/astro/render-template.js
const renderTemplateResultSym = /* @__PURE__ */ Symbol.for("astro.renderTemplateResult");
const RenderTemplateResult = class {
  [renderTemplateResultSym] = true;
  htmlParts;
  expressions;
  error;
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.error = void 0;
    this.expressions = expressions.map((expression) => {
      if (isPromise(expression))
        return Promise.resolve(expression).catch((err) => {
          if (!this.error) {
            this.error = err;
            throw err;
          }
        });
      return expression;
    });
  }
  render(destination) {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      if (html) destination.write(markHTMLString(html));
      if (i >= expressions.length) break;
      const exp = expressions[i];
      if (!(exp || exp === 0)) continue;
      const result = renderChild(destination, exp);
      if (isPromise(result)) {
        const startIdx = i + 1;
        const remaining = expressions.length - startIdx;
        const flushers = new Array(remaining);
        for (let j = 0; j < remaining; j++) {
          const rExp = expressions[startIdx + j];
          flushers[j] = createBufferedRenderer(destination, (bufferDestination) => {
            if (rExp || rExp === 0) return renderChild(bufferDestination, rExp);
          });
        }
        return result.then(() => {
          let k = 0;
          const iterate = () => {
            while (k < flushers.length) {
              const rHtml = htmlParts[startIdx + k];
              if (rHtml) destination.write(markHTMLString(rHtml));
              const flushResult = flushers[k++].flush();
              if (isPromise(flushResult)) return flushResult.then(iterate);
            }
            const lastHtml = htmlParts[htmlParts.length - 1];
            if (lastHtml) destination.write(markHTMLString(lastHtml));
          };
          return iterate();
        });
      }
    }
  }
};
function isRenderTemplateResult(obj) {
  return typeof obj === "object" && obj !== null && !!obj[renderTemplateResultSym];
}
function renderTemplate(htmlParts, ...expressions) {
  return new RenderTemplateResult(htmlParts, expressions);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/slot.js
const slotString = /* @__PURE__ */ Symbol.for("astro:slot-string");
const SlotString = class extends HTMLString {
  instructions;
  [slotString];
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
    this[slotString] = true;
  }
};
function isSlotString(str) {
  return !!str[slotString];
}
function mergeSlotInstructions(target, source) {
  if (source.instructions?.length) {
    target ??= [];
    target.push(...source.instructions);
  }
  return target;
}
function renderSlot(result, slotted, fallback) {
  if (!slotted && fallback) return renderSlot(result, fallback);
  return {
    async render(destination) {
      await renderChild(destination, typeof slotted === "function" ? slotted(result) : slotted);
    },
  };
}
async function renderSlotToString(result, slotted, fallback) {
  let content = "";
  let instructions = null;
  await renderSlot(result, slotted, fallback).render({
    write(chunk) {
      if (chunk instanceof SlotString) {
        content += chunk;
        instructions = mergeSlotInstructions(instructions, chunk);
      } else if (chunk instanceof Response) return;
      else if (typeof chunk === "object" && "type" in chunk && typeof chunk.type === "string") {
        if (instructions === null) instructions = [];
        instructions.push(chunk);
      } else content += chunkToString(result, chunk);
    },
  });
  return markHTMLString(new SlotString(content, instructions));
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  const children = {};
  if (slots)
    await Promise.all(
      Object.entries(slots).map(([key, value]) =>
        renderSlotToString(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) slotInstructions = [];
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        }),
      ),
    );
  return {
    slotInstructions,
    children,
  };
}
function createSlotValueFromString(content) {
  return function () {
    return renderTemplate`${unescapeHTML(content)}`;
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/server-islands.js
const internalProps = /* @__PURE__ */ new Set([
  "server:component-path",
  "server:component-export",
  "server:component-directive",
  "server:defer",
]);
function containsServerDirective(props) {
  return "server:component-directive" in props;
}
const SCRIPT_RE = /<\/script/giu;
const COMMENT_RE = /<!--/gu;
const SCRIPT_REPLACER = "<\\/script";
const COMMENT_REPLACER = "\\u003C!--";
function safeJsonStringify(obj) {
  return JSON.stringify(obj)
    .replace(SCRIPT_RE, SCRIPT_REPLACER)
    .replace(COMMENT_RE, COMMENT_REPLACER);
}
function createSearchParams(encryptedComponentExport, encryptedProps, slots) {
  const params = new URLSearchParams();
  params.set("e", encryptedComponentExport);
  params.set("p", encryptedProps);
  params.set("s", slots);
  return params;
}
function isWithinURLLimit(pathname, params) {
  return (pathname + "?" + params.toString()).length < 2048;
}
const ServerIslandComponent = class {
  result;
  props;
  slots;
  displayName;
  hostId;
  islandContent;
  componentPath;
  componentExport;
  componentId;
  constructor(result, props, slots, displayName) {
    this.result = result;
    this.props = props;
    this.slots = slots;
    this.displayName = displayName;
  }
  async init() {
    const content = await this.getIslandContent();
    if (this.result.cspDestination) {
      this.result._metadata.extraScriptHashes.push(
        await generateCspDigest(SERVER_ISLAND_REPLACER, this.result.cspAlgorithm),
      );
      const contentDigest = await generateCspDigest(content, this.result.cspAlgorithm);
      this.result._metadata.extraScriptHashes.push(contentDigest);
    }
    return createThinHead();
  }
  async render(destination) {
    const hostId = await this.getHostId();
    const islandContent = await this.getIslandContent();
    destination.write(createRenderInstruction({ type: "server-island-runtime" }));
    destination.write("<!--[if astro]>server-island-start<![endif]-->");
    for (const name in this.slots)
      if (name === "fallback") await renderChild(destination, this.slots.fallback(this.result));
    destination.write(
      `<script type="module" data-astro-rerun data-island-id="${hostId}">${islandContent}<\/script>`,
    );
  }
  getComponentPath() {
    if (this.componentPath) return this.componentPath;
    const componentPath = this.props["server:component-path"];
    if (!componentPath) throw new Error(`Could not find server component path`);
    this.componentPath = componentPath;
    return componentPath;
  }
  getComponentExport() {
    if (this.componentExport) return this.componentExport;
    const componentExport = this.props["server:component-export"];
    if (!componentExport) throw new Error(`Could not find server component export`);
    this.componentExport = componentExport;
    return componentExport;
  }
  async getHostId() {
    if (!this.hostId) this.hostId = await crypto.randomUUID();
    return this.hostId;
  }
  async getIslandContent() {
    if (this.islandContent) return this.islandContent;
    const componentPath = this.getComponentPath();
    const componentExport = this.getComponentExport();
    let componentId = this.result.serverIslandNameMap.get(componentPath);
    if (!componentId) throw new Error(`Could not find server component name ${componentPath}`);
    for (const key2 of Object.keys(this.props))
      if (internalProps.has(key2)) delete this.props[key2];
    const renderedSlots = {};
    for (const name in this.slots)
      if (name !== "fallback") {
        const content = await renderSlotToString(this.result, this.slots[name]);
        let slotHtml = content.toString();
        const slotContent = content;
        if (Array.isArray(slotContent.instructions)) {
          for (const instruction of slotContent.instructions)
            if (instruction.type === "script") slotHtml += instruction.content;
        }
        renderedSlots[name] = slotHtml;
      }
    const key = await this.result.key;
    const componentExportEncrypted = await encryptString(key, componentExport);
    const propsEncrypted =
      Object.keys(this.props).length === 0
        ? ""
        : await encryptString(key, JSON.stringify(this.props));
    const slotsEncrypted =
      Object.keys(renderedSlots).length === 0
        ? ""
        : await encryptString(key, JSON.stringify(renderedSlots));
    const hostId = await this.getHostId();
    const slash = this.result.base.endsWith("/") ? "" : "/";
    let serverIslandUrl = `${this.result.base}${slash}_server-islands/${componentId}${this.result.trailingSlash === "always" ? "/" : ""}`;
    const potentialSearchParams = createSearchParams(
      componentExportEncrypted,
      propsEncrypted,
      slotsEncrypted,
    );
    const useGETRequest = isWithinURLLimit(serverIslandUrl, potentialSearchParams);
    if (useGETRequest) {
      serverIslandUrl += "?" + potentialSearchParams.toString();
      this.result._metadata.extraHead.push(
        markHTMLString(
          `<link rel="preload" as="fetch" href="${serverIslandUrl}" crossorigin="anonymous">`,
        ),
      );
    }
    const headersJson = safeJsonStringify(this.result.internalFetchHeaders || {});
    this.islandContent = `${
      useGETRequest
        ? `const headers = new Headers(${headersJson});
let response = await fetch('${serverIslandUrl}', { headers });`
        : `let data = {
	encryptedComponentExport: ${safeJsonStringify(componentExportEncrypted)},
	encryptedProps: ${safeJsonStringify(propsEncrypted)},
	encryptedSlots: ${safeJsonStringify(slotsEncrypted)},
};
const headers = new Headers({ 'Content-Type': 'application/json', ...${headersJson} });
let response = await fetch('${serverIslandUrl}', {
	method: 'POST',
	body: JSON.stringify(data),
	headers,
});`
    }replaceServerIsland('${hostId}', response);`;
    return this.islandContent;
  }
};
const renderServerIslandRuntime = () => {
  return `<script>${SERVER_ISLAND_REPLACER}<\/script>`;
};
const SERVER_ISLAND_REPLACER = markHTMLString(
  `async function replaceServerIsland(id, r) {
	let s = document.querySelector(\`script[data-island-id="\${id}"]\`);
	// If there's no matching script, or the request fails then return
	if (!s || r.status !== 200 || r.headers.get('content-type')?.split(';')[0].trim() !== 'text/html') return;
	// Load the HTML before modifying the DOM in case of errors
	let html = await r.text();
	// Remove any placeholder content before the island script
	while (s.previousSibling && s.previousSibling.nodeType !== 8 && s.previousSibling.data !== '[if astro]>server-island-start<![endif]')
		s.previousSibling.remove();
	s.previousSibling?.remove();
	// Insert the new HTML
	s.before(document.createRange().createContextualFragment(html));
	// Remove the script. Prior to v5.4.2, this was the trick to force rerun of scripts.  Keeping it to minimize change to the existing behavior.
	s.remove();
}`
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .join(" "),
);
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/common.js
const Fragment = /* @__PURE__ */ Symbol.for("astro:fragment");
const Renderer = /* @__PURE__ */ Symbol.for("astro:renderer");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function stringifyChunk(result, chunk) {
  if (isRenderInstruction(chunk)) {
    const instruction = chunk;
    switch (instruction.type) {
      case "directive": {
        const { hydration } = instruction;
        const needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
        const needsDirectiveScript =
          hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
        if (needsHydrationScript)
          return markHTMLString(getPrescripts(result, "both", hydration.directive));
        else if (needsDirectiveScript)
          return markHTMLString(getPrescripts(result, "directive", hydration.directive));
        else return "";
      }
      case "head":
        if (!shouldRenderInstruction("head", getInstructionRenderState(result))) return "";
        return renderAllHeadContent(result);
      case "maybe-head":
        if (!shouldRenderInstruction("maybe-head", getInstructionRenderState(result))) return "";
        return renderAllHeadContent(result);
      case "renderer-hydration-script": {
        const { rendererSpecificHydrationScripts } = result._metadata;
        const { rendererName } = instruction;
        if (!rendererSpecificHydrationScripts.has(rendererName)) {
          rendererSpecificHydrationScripts.add(rendererName);
          return instruction.render();
        }
        return "";
      }
      case "server-island-runtime":
        if (result._metadata.hasRenderedServerIslandRuntime) return "";
        result._metadata.hasRenderedServerIslandRuntime = true;
        return renderServerIslandRuntime();
      case "script": {
        const { id, content } = instruction;
        if (result._metadata.renderedScripts.has(id)) return "";
        result._metadata.renderedScripts.add(id);
        return content;
      }
      default:
        throw new Error(`Unknown chunk type: ${chunk.type}`);
    }
  } else if (chunk instanceof Response) return "";
  else if (isSlotString(chunk)) {
    let out = "";
    const c = chunk;
    if (c.instructions) for (const instr of c.instructions) out += stringifyChunk(result, instr);
    out += chunk.toString();
    return out;
  }
  return chunk.toString();
}
function chunkToString(result, chunk) {
  if (ArrayBuffer.isView(chunk)) return decoder.decode(chunk);
  else return stringifyChunk(result, chunk);
}
function chunkToByteArray(result, chunk) {
  if (ArrayBuffer.isView(chunk)) return chunk;
  else {
    const stringified = stringifyChunk(result, chunk);
    return encoder.encode(stringified.toString());
  }
}
function chunkToByteArrayOrString(result, chunk) {
  if (ArrayBuffer.isView(chunk)) return chunk;
  else return stringifyChunk(result, chunk).toString();
}
function isRenderInstance(obj) {
  return !!obj && typeof obj === "object" && "render" in obj && typeof obj.render === "function";
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/any.js
function renderChild(destination, child) {
  if (typeof child === "string") {
    destination.write(markHTMLString(escapeHTML(child)));
    return;
  }
  if (isPromise(child)) return child.then((x) => renderChild(destination, x));
  if (child instanceof SlotString) {
    destination.write(child);
    return;
  }
  if (isHTMLString(child)) {
    destination.write(child);
    return;
  }
  if (!child && child !== 0) return;
  if (Array.isArray(child)) return renderArray(destination, child);
  if (typeof child === "function") return renderChild(destination, child());
  if (isRenderInstance(child)) return child.render(destination);
  if (isRenderTemplateResult(child)) return child.render(destination);
  if (isAstroComponentInstance(child)) return child.render(destination);
  if (ArrayBuffer.isView(child)) {
    destination.write(child);
    return;
  }
  if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    if (Symbol.asyncIterator in child) return renderAsyncIterable(destination, child);
    return renderIterable(destination, child);
  }
  destination.write(child);
}
function renderArray(destination, children) {
  for (let i = 0; i < children.length; i++) {
    const result = renderChild(destination, children[i]);
    if (isPromise(result)) {
      if (i + 1 >= children.length) return result;
      const remaining = children.length - i - 1;
      const flushers = new Array(remaining);
      for (let j = 0; j < remaining; j++)
        flushers[j] = createBufferedRenderer(destination, (bufferDestination) => {
          return renderChild(bufferDestination, children[i + 1 + j]);
        });
      return result.then(() => {
        let k = 0;
        const iterate = () => {
          while (k < flushers.length) {
            const flushResult = flushers[k++].flush();
            if (isPromise(flushResult)) return flushResult.then(iterate);
          }
        };
        return iterate();
      });
    }
  }
}
function renderIterable(destination, children) {
  const iterator = children[Symbol.iterator]();
  const iterate = () => {
    for (;;) {
      const { value, done } = iterator.next();
      if (done) break;
      const result = renderChild(destination, value);
      if (isPromise(result)) return result.then(iterate);
    }
  };
  return iterate();
}
async function renderAsyncIterable(destination, children) {
  for await (const value of children) await renderChild(destination, value);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/astro/instance.js
const astroComponentInstanceSym = /* @__PURE__ */ Symbol.for("astro.componentInstance");
const AstroComponentInstance = class {
  [astroComponentInstanceSym] = true;
  result;
  props;
  slotValues;
  factory;
  returnValue;
  constructor(result, props, slots, factory) {
    this.result = result;
    this.props = props;
    this.factory = factory;
    this.slotValues = {};
    for (const name in slots) {
      let didRender = false;
      let value = slots[name](result);
      this.slotValues[name] = () => {
        if (!didRender) {
          didRender = true;
          return value;
        }
        return slots[name](result);
      };
    }
  }
  init(result) {
    if (this.returnValue !== void 0) return this.returnValue;
    this.returnValue = this.factory(result, this.props, this.slotValues);
    if (isPromise(this.returnValue))
      this.returnValue
        .then((resolved) => {
          this.returnValue = resolved;
        })
        .catch(() => {});
    return this.returnValue;
  }
  render(destination) {
    const returnValue = this.init(this.result);
    if (isPromise(returnValue)) return returnValue.then((x) => this.renderImpl(destination, x));
    return this.renderImpl(destination, returnValue);
  }
  renderImpl(destination, returnValue) {
    if (isHeadAndContent(returnValue)) return returnValue.content.render(destination);
    else return renderChild(destination, returnValue);
  }
};
function validateComponentProps(props, clientDirectives, displayName) {
  if (props != null) {
    const directives = [...clientDirectives.keys()].map((directive) => `client:${directive}`);
    for (const prop of Object.keys(props))
      if (directives.includes(prop))
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`,
        );
  }
}
function createAstroComponentInstance(result, displayName, factory, props, slots = {}) {
  validateComponentProps(props, result.clientDirectives, displayName);
  const instance = new AstroComponentInstance(result, props, slots, factory);
  registerIfPropagating(result, factory, instance);
  return instance;
}
function isAstroComponentInstance(obj) {
  return typeof obj === "object" && obj !== null && !!obj[astroComponentInstanceSym];
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/astro/render.js
const DOCTYPE_EXP = /<!doctype html/i;
async function renderToString(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route,
  );
  if (templateResult instanceof Response) return templateResult;
  let str = "";
  let renderedFirstPageChunk = false;
  if (isPage) await bufferHeadContent(result);
  await templateResult.render({
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          str += doctype;
        }
      }
      if (chunk instanceof Response) return;
      str += chunkToString(result, chunk);
    },
  });
  return str;
}
async function renderToReadableStream(
  result,
  componentFactory,
  props,
  children,
  isPage = false,
  route,
) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route,
  );
  if (templateResult instanceof Response) return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) await bufferHeadContent(result);
  return new ReadableStream({
    start(controller) {
      const destination = {
        write(chunk) {
          if (isPage && !renderedFirstPageChunk) {
            renderedFirstPageChunk = true;
            if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              controller.enqueue(encoder.encode(doctype));
            }
          }
          if (chunk instanceof Response) throw new AstroError({ ...ResponseSentError });
          const bytes = chunkToByteArray(result, chunk);
          controller.enqueue(bytes);
        },
      };
      (async () => {
        try {
          await templateResult.render(destination);
          controller.close();
        } catch (e) {
          if (AstroError.is(e) && !e.loc) e.setLocation({ file: route?.component });
          setTimeout(() => controller.error(e), 0);
        }
      })();
    },
    cancel() {
      result.cancelled = true;
    },
  });
}
async function callComponentAsTemplateResultOrResponse(
  result,
  componentFactory,
  props,
  children,
  route,
) {
  const factoryResult = await componentFactory(result, props, children);
  if (factoryResult instanceof Response) return factoryResult;
  else if (isHeadAndContent(factoryResult)) {
    if (!isRenderTemplateResult(factoryResult.content))
      throw new AstroError({
        ...OnlyResponseCanBeReturned,
        message: OnlyResponseCanBeReturned.message(route?.route, typeof factoryResult),
        location: { file: route?.component },
      });
    return factoryResult.content;
  } else if (!isRenderTemplateResult(factoryResult))
    throw new AstroError({
      ...OnlyResponseCanBeReturned,
      message: OnlyResponseCanBeReturned.message(route?.route, typeof factoryResult),
      location: { file: route?.component },
    });
  return factoryResult;
}
async function bufferHeadContent(result) {
  await bufferPropagatedHead(result);
}
async function renderToAsyncIterable(
  result,
  componentFactory,
  props,
  children,
  isPage = false,
  route,
) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route,
  );
  if (templateResult instanceof Response) return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) await bufferHeadContent(result);
  let error = null;
  let next = null;
  const buffer = [];
  let renderingComplete = false;
  const iterator = {
    async next() {
      if (result.cancelled)
        return {
          done: true,
          value: void 0,
        };
      if (next !== null) await next.promise;
      else if (!renderingComplete && !buffer.length) {
        next = promiseWithResolvers();
        await next.promise;
      }
      if (!renderingComplete) next = promiseWithResolvers();
      if (error) throw error;
      let length = 0;
      let stringToEncode = "";
      for (let i = 0, len = buffer.length; i < len; i++) {
        const bufferEntry = buffer[i];
        if (typeof bufferEntry === "string") {
          const nextIsString = i + 1 < len && typeof buffer[i + 1] === "string";
          stringToEncode += bufferEntry;
          if (!nextIsString) {
            const encoded = encoder.encode(stringToEncode);
            length += encoded.length;
            stringToEncode = "";
            buffer[i] = encoded;
          } else buffer[i] = "";
        } else length += bufferEntry.length;
      }
      const mergedArray = new Uint8Array(length);
      let offset = 0;
      for (let i = 0, len = buffer.length; i < len; i++) {
        const item = buffer[i];
        if (item === "") continue;
        mergedArray.set(item, offset);
        offset += item.length;
      }
      buffer.length = 0;
      return {
        done: length === 0 && renderingComplete,
        value: mergedArray,
      };
    },
    async return() {
      result.cancelled = true;
      return {
        done: true,
        value: void 0,
      };
    },
  };
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          buffer.push(encoder.encode(doctype));
        }
      }
      if (chunk instanceof Response) throw new AstroError(ResponseSentError);
      const bytes = chunkToByteArrayOrString(result, chunk);
      if (bytes.length > 0) {
        buffer.push(bytes);
        next?.resolve();
      } else if (buffer.length > 0) next?.resolve();
    },
  };
  toPromise(() => templateResult.render(destination))
    .catch((err) => {
      error = err;
    })
    .finally(() => {
      renderingComplete = true;
      next?.resolve();
    });
  return {
    [Symbol.asyncIterator]() {
      return iterator;
    },
  };
}
function toPromise(fn) {
  try {
    const result = fn();
    return isPromise(result) ? result : Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/dom.js
function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement$1(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlotToString(result, slots?.default)}</${name}>`,
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName) return definedName;
  return constructor.name
    .replace(/^HTML|Element$/g, "")
    .replace(/[A-Z]/g, "-$&")
    .toLowerCase()
    .replace(/^-/, "html-");
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/component.js
const needsHeadRenderingSymbol = /* @__PURE__ */ Symbol.for("astro.needsHeadRendering");
const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
const clientOnlyValues = /* @__PURE__ */ new Set(["solid-js", "react", "preact", "vue", "svelte"]);
function guessRenderers(componentUrl) {
  switch (componentUrl?.split(".").pop()) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid-js", "@astrojs/vue (jsx)"];
    case void 0:
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid-js",
        "@astrojs/vue",
        "@astrojs/svelte",
      ];
  }
}
function isFragmentComponent(Component) {
  return Component === Fragment;
}
function isHTMLComponent(Component) {
  return Component && Component["astro:html"] === true;
}
const ASTRO_SLOT_EXP = /<\/?astro-slot\b[^>]*>/g;
const ASTRO_STATIC_SLOT_EXP = /<\/?astro-static-slot\b[^>]*>/g;
function removeStaticAstroSlot(html, supportsAstroStaticSlot = true) {
  const exp = supportsAstroStaticSlot ? ASTRO_STATIC_SLOT_EXP : ASTRO_SLOT_EXP;
  return html.replace(exp, "");
}
async function renderFrameworkComponent(result, displayName, Component, _props, slots = {}) {
  if (!Component && "client:only" in _props === false)
    throw new Error(`Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`);
  const { renderers, clientDirectives } = result;
  const metadata = {
    astroStaticSlot: true,
    displayName,
  };
  const { hydration, isPage, props, propsWithoutTransitionAttributes } = extractDirectives(
    _props,
    clientDirectives,
  );
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers.filter((r) => r.name !== "astro:jsx");
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {}
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers)
        try {
          if (await r.ssr.check.call({ result }, Component, props, children, metadata)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ??= e;
        }
      if (!renderer && error) throw error;
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = await renderHTMLElement$1(result, Component, _props, slots);
      return {
        render(destination) {
          destination.write(output);
        },
      };
    }
  } else {
    if (metadata.hydrateArgs) {
      const rendererName = rendererAliases.has(metadata.hydrateArgs)
        ? rendererAliases.get(metadata.hydrateArgs)
        : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName))
        renderer = renderers.find(
          ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName,
        );
    }
    if (!renderer && validRenderers.length === 1) renderer = validRenderers[0];
    if (!renderer) {
      const extname = metadata.componentUrl?.split(".").pop();
      renderer = renderers.find(({ name }) => name === `@astrojs/${extname}` || name === extname);
    }
    if (!renderer && metadata.hydrateArgs) {
      const rendererName = metadata.hydrateArgs;
      if (typeof rendererName === "string")
        renderer = renderers.find(({ name }) => name === rendererName);
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      const rendererName = rendererAliases.has(metadata.hydrateArgs)
        ? rendererAliases.get(metadata.hydrateArgs)
        : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        const plural = validRenderers.length > 1;
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length,
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`")),
          ),
        });
      } else
        throw new AstroError({
          ...NoClientOnlyHint,
          message: NoClientOnlyHint.message(metadata.displayName),
          hint: NoClientOnlyHint.hint(
            probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|"),
          ),
        });
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter((r) =>
        probableRendererNames.includes(r.name),
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0)
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length,
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`")),
          ),
        });
      else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          propsWithoutTransitionAttributes,
          children,
          metadata,
        ));
      } else
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.
3. If using multiple JSX frameworks at the same time (e.g. React + Preact), pass the correct \`include\`/\`exclude\` options to integrations.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
    }
  } else if (metadata.hydrate === "only") html = await renderSlotToString(result, slots?.fallback);
  else {
    performance.now();
    ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
      { result },
      Component,
      propsWithoutTransitionAttributes,
      children,
      metadata,
    ));
  }
  if (!html && typeof Component === "string") {
    const Tag = sanitizeElementName(Component);
    const childSlots = Object.values(children).join("");
    const renderTemplateResult = renderTemplate`<${Tag}${internalSpreadAttributes(props, true, Tag)}${markHTMLString(childSlots === "" && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`)}`;
    html = "";
    await renderTemplateResult.render({
      write(chunk) {
        if (chunk instanceof Response) return;
        html += chunkToString(result, chunk);
      },
    });
  }
  if (!hydration)
    return {
      render(destination) {
        if (slotInstructions)
          for (const instruction of slotInstructions) destination.write(instruction);
        if (isPage || renderer?.name === "astro:jsx") destination.write(html);
        else if (html && html.length > 0)
          destination.write(
            markHTMLString(removeStaticAstroSlot(html, renderer?.ssr?.supportsAstroStaticSlot)),
          );
      },
    };
  const astroId = shorthash(`<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(props, metadata)}`);
  const island = await generateHydrateScript(
    {
      renderer,
      result,
      astroId,
      props,
      attrs,
    },
    metadata,
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0)
      for (const key of Object.keys(children)) {
        const tagName = renderer?.ssr?.supportsAstroStaticSlot
          ? !!metadata.hydrate
            ? "astro-slot"
            : "astro-static-slot"
          : "astro-slot";
        const expectedHTML = key === "default" ? `<${tagName}>` : `<${tagName} name="${key}">`;
        if (!html.includes(expectedHTML)) unrenderedSlots.push(key);
      }
  } else unrenderedSlots = Object.keys(children);
  const template =
    unrenderedSlots.length > 0
      ? unrenderedSlots
          .map(
            (key) =>
              `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`,
          )
          .join("")
      : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
    island.children += `<!--astro:end-->`;
  }
  return {
    render(destination) {
      if (slotInstructions)
        for (const instruction of slotInstructions) destination.write(instruction);
      destination.write(
        createRenderInstruction({
          type: "directive",
          hydration,
        }),
      );
      if (hydration.directive !== "only" && renderer?.ssr.renderHydrationScript)
        destination.write(
          createRenderInstruction({
            type: "renderer-hydration-script",
            rendererName: renderer.name,
            render: renderer.ssr.renderHydrationScript,
          }),
        );
      const renderedElement = renderElement$1("astro-island", island, false);
      destination.write(markHTMLString(renderedElement));
    },
  };
}
function sanitizeElementName(tag) {
  const unsafe = /[&<>'"\s]+/;
  if (!unsafe.test(tag)) return tag;
  return tag.trim().split(unsafe)[0].trim();
}
async function renderFragmentComponent(result, slots = {}) {
  const children = await renderSlotToString(result, slots?.default);
  return {
    render(destination) {
      if (children == null) return;
      destination.write(children);
    },
  };
}
async function renderHTMLComponent(result, Component, _props, slots = {}) {
  const { slotInstructions, children } = await renderSlots(result, slots);
  const html = Component({ slots: children });
  const hydrationHtml = slotInstructions
    ? slotInstructions.map((instr) => chunkToString(result, instr)).join("")
    : "";
  return {
    render(destination) {
      destination.write(markHTMLString(hydrationHtml + html));
    },
  };
}
function renderAstroComponent(result, displayName, Component, props, slots = {}) {
  if (containsServerDirective(props)) {
    const serverIslandComponent = new ServerIslandComponent(result, props, slots, displayName);
    result._metadata.propagators.add(serverIslandComponent);
    return serverIslandComponent;
  }
  const instance = createAstroComponentInstance(result, displayName, Component, props, slots);
  return {
    render(destination) {
      return instance.render(destination);
    },
  };
}
function renderComponent(result, displayName, Component, props, slots = {}) {
  if (isPromise(Component))
    return Component.catch(handleCancellation).then((x) => {
      return renderComponent(result, displayName, x, props, slots);
    });
  if (isFragmentComponent(Component))
    return renderFragmentComponent(result, slots).catch(handleCancellation);
  props = normalizeProps(props);
  if (isHTMLComponent(Component))
    return renderHTMLComponent(result, Component, props, slots).catch(handleCancellation);
  if (isAstroComponentFactory(Component))
    return renderAstroComponent(result, displayName, Component, props, slots);
  return renderFrameworkComponent(result, displayName, Component, props, slots).catch(
    handleCancellation,
  );
  function handleCancellation(e) {
    if (result.cancelled) return { render() {} };
    throw e;
  }
}
function normalizeProps(props) {
  if (props["class:list"] !== void 0) {
    const value = props["class:list"];
    delete props["class:list"];
    props["class"] = clsx(props["class"], value);
    if (props["class"] === "") delete props["class"];
  }
  return props;
}
async function renderComponentToString(
  result,
  displayName,
  Component,
  props,
  slots = {},
  isPage = false,
  route,
) {
  let str = "";
  let renderedFirstPageChunk = false;
  let head = "";
  if (isPage && !result.partial && nonAstroPageNeedsHeadInjection(Component))
    head += chunkToString(result, maybeRenderHead());
  try {
    const destination = {
      write(chunk) {
        if (isPage && !result.partial && !renderedFirstPageChunk) {
          renderedFirstPageChunk = true;
          if (!/<!doctype html/i.test(String(chunk))) {
            const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
            str += doctype + head;
          }
        }
        if (chunk instanceof Response) return;
        str += chunkToString(result, chunk);
      },
    };
    const renderInstance = await renderComponent(result, displayName, Component, props, slots);
    if (containsServerDirective(props)) await bufferHeadContent(result);
    await renderInstance.render(destination);
  } catch (e) {
    if (AstroError.is(e) && !e.loc) e.setLocation({ file: route?.component });
    throw e;
  }
  return str;
}
function nonAstroPageNeedsHeadInjection(pageComponent) {
  return !!pageComponent?.[needsHeadRenderingSymbol];
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/jsx.js
const ClientOnlyPlaceholder$1 = "astro-client-only";
const hasTriedRenderComponentSymbol = /* @__PURE__ */ Symbol("hasTriedRenderComponent");
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") return "";
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case !vnode && vnode !== 0:
      return "";
    case Array.isArray(vnode): {
      const renderedItems = await Promise.all(vnode.map((v) => renderJSX(result, v)));
      let instructions = null;
      let content = "";
      for (const item of renderedItems)
        if (item instanceof SlotString) {
          content += item;
          instructions = mergeSlotInstructions(instructions, item);
        } else content += item;
      if (instructions) return markHTMLString(new SlotString(content, instructions));
      return markHTMLString(content);
    }
  }
  return renderJSXVNode(result, vnode);
}
async function renderJSXVNode(result, vnode) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type:
        throw new Error(`Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      case vnode.type === /* @__PURE__ */ Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case isAstroComponentFactory(vnode.type): {
        const props = {};
        const slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {}))
          if (key === "children" || (value && typeof value === "object" && value["$$slot"]))
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          else props[key] = value;
        return markHTMLString(
          await renderComponentToString(result, vnode.type.name, vnode.type, props, slots),
        );
      }
      case !vnode.type && vnode.type !== 0:
        return "";
      case typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder$1:
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      const extractSlots2 = function (child) {
        if (Array.isArray(child)) return child.map((c) => extractSlots2(c));
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [...(_slots[child.props.slot] ?? []), child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.props["server:root"])
        return await renderJSX(result, await vnode.type(vnode.props ?? {}));
      if (typeof vnode.type === "function")
        if (vnode.props[hasTriedRenderComponentSymbol]) {
          delete vnode.props[hasTriedRenderComponentSymbol];
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2?.["astro:jsx"] || !output2) return await renderJSXVNode(result, output2);
          else return;
        } else vnode.props[hasTriedRenderComponentSymbol] = true;
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = { default: [] };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props))
        if (value?.["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots))
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0) return;
            slots[key] = () => output2;
          }),
        );
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder$1 && vnode.props["client:only"])
        output = await renderComponentToString(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots,
        );
      else
        output = await renderComponentToString(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots,
        );
      return markHTMLString(output);
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString((children == null || children === "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, prerenderElementChildren$1(tag, children))}</${tag}>`)}`,
  );
}
function prerenderElementChildren$1(tag, children) {
  if (typeof children === "string" && (tag === "style" || tag === "script"))
    return markHTMLString(children);
  else return children;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/queue/jsx-builder.js
const ClientOnlyPlaceholder = "astro-client-only";
const jsxQueueStats = {
  vnodeCount: 0,
  elementCount: 0,
  componentCount: 0,
  hasLogged: false,
};
function renderJSXToQueue(vnode, result, queue, pool, stack, parent, metadata) {
  jsxQueueStats.vnodeCount = jsxQueueStats.vnodeCount + 1;
  if (vnode instanceof HTMLString) {
    const html = vnode.toString();
    if (html.trim() === "") return;
    const node = pool.acquire("html-string", html);
    node.html = html;
    queue.nodes.push(node);
    return;
  }
  if (typeof vnode === "string") {
    const node = pool.acquire("text", vnode);
    node.content = vnode;
    queue.nodes.push(node);
    return;
  }
  if (typeof vnode === "number" || typeof vnode === "boolean") {
    const str = String(vnode);
    const node = pool.acquire("text", str);
    node.content = str;
    queue.nodes.push(node);
    return;
  }
  if (vnode == null || vnode === false) return;
  if (Array.isArray(vnode)) {
    for (let i = vnode.length - 1; i >= 0; i = i - 1)
      stack.push({
        node: vnode[i],
        parent,
        metadata,
      });
    return;
  }
  if (!isVNode(vnode)) {
    const str = String(vnode);
    const node = pool.acquire("text", str);
    node.content = str;
    queue.nodes.push(node);
    return;
  }
  handleVNode(vnode, result, queue, pool, stack, parent, metadata);
}
function handleVNode(vnode, result, queue, pool, stack, parent, metadata) {
  if (!vnode.type)
    throw new Error(`Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
  if (vnode.type === /* @__PURE__ */ Symbol.for("astro:fragment")) {
    stack.push({
      node: vnode.props?.children,
      parent,
      metadata,
    });
    return;
  }
  if (isAstroComponentFactory(vnode.type)) {
    jsxQueueStats.componentCount = jsxQueueStats.componentCount + 1;
    const factory = vnode.type;
    const props = {};
    const slots = {};
    for (const [key, value] of Object.entries(vnode.props ?? {}))
      if (key === "children" || (value && typeof value === "object" && value["$$slot"]))
        slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
      else props[key] = value;
    const instance = createAstroComponentInstance(
      result,
      metadata?.displayName || factory.name || "Anonymous",
      factory,
      props,
      slots,
    );
    const queueNode = pool.acquire("component");
    queueNode.instance = instance;
    queue.nodes.push(queueNode);
    return;
  }
  if (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder) {
    jsxQueueStats.elementCount = jsxQueueStats.elementCount + 1;
    renderHTMLElement(vnode, result, queue, pool, stack, parent, metadata);
    return;
  }
  if (typeof vnode.type === "function") {
    if (vnode.props?.["server:root"]) {
      const output3 = vnode.type(vnode.props ?? {});
      stack.push({
        node: output3,
        parent,
        metadata,
      });
      return;
    }
    const output2 = vnode.type(vnode.props ?? {});
    stack.push({
      node: output2,
      parent,
      metadata,
    });
    return;
  }
  const output = renderJSX(result, vnode);
  stack.push({
    node: output,
    parent,
    metadata,
  });
}
function renderHTMLElement(vnode, _result, queue, pool, stack, parent, metadata) {
  const tag = vnode.type;
  const { children, ...props } = vnode.props ?? {};
  const attrs = spreadAttributes(props);
  if ((children == null || children === "") && voidElementNames.test(tag)) {
    const html = `<${tag}${attrs}/>`;
    const node = pool.acquire("html-string", html);
    node.html = html;
    queue.nodes.push(node);
    return;
  }
  const openTag = `<${tag}${attrs}>`;
  const openTagHtml = queue.htmlStringCache
    ? queue.htmlStringCache.getOrCreate(openTag)
    : markHTMLString(openTag);
  stack.push({
    node: openTagHtml,
    parent,
    metadata,
  });
  if (children != null && children !== "") {
    const processedChildren = prerenderElementChildren(tag, children, queue.htmlStringCache);
    stack.push({
      node: processedChildren,
      parent,
      metadata,
    });
  }
  const closeTag = `</${tag}>`;
  const closeTagHtml = queue.htmlStringCache
    ? queue.htmlStringCache.getOrCreate(closeTag)
    : markHTMLString(closeTag);
  stack.push({
    node: closeTagHtml,
    parent,
    metadata,
  });
}
function prerenderElementChildren(tag, children, htmlStringCache) {
  if (typeof children === "string" && (tag === "style" || tag === "script"))
    return htmlStringCache ? htmlStringCache.getOrCreate(children) : markHTMLString(children);
  return children;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/queue/builder.js
async function buildRenderQueue(root, result, pool) {
  const queue = {
    nodes: [],
    result,
    pool,
    htmlStringCache: result._experimentalQueuedRendering?.htmlStringCache,
  };
  const stack = [
    {
      node: root,
      parent: null,
    },
  ];
  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) continue;
    const { node, parent } = item;
    if (isPromise(node)) {
      try {
        const resolved = await node;
        stack.push({
          node: resolved,
          parent,
          metadata: item.metadata,
        });
      } catch (error) {
        throw error;
      }
      continue;
    }
    if (node == null || node === false) continue;
    if (typeof node === "string") {
      const queueNode = pool.acquire("text", node);
      queueNode.content = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (typeof node === "number" || typeof node === "boolean") {
      const str = String(node);
      const queueNode = pool.acquire("text", str);
      queueNode.content = str;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isHTMLString(node)) {
      const html = node.toString();
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
      continue;
    }
    if (node instanceof SlotString) {
      const html = node.toString();
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isVNode(node)) {
      renderJSXToQueue(node, result, queue, pool, stack, parent, item.metadata);
      continue;
    }
    if (Array.isArray(node)) {
      for (const n of node)
        stack.push({
          node: n,
          parent,
          metadata: item.metadata,
        });
      continue;
    }
    if (isRenderInstruction(node)) {
      const queueNode = pool.acquire("instruction");
      queueNode.instruction = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isRenderTemplateResult(node)) {
      const htmlParts = node["htmlParts"];
      const expressions = node["expressions"];
      if (htmlParts[0]) {
        const htmlString = queue.htmlStringCache
          ? queue.htmlStringCache.getOrCreate(htmlParts[0])
          : markHTMLString(htmlParts[0]);
        stack.push({
          node: htmlString,
          parent,
          metadata: item.metadata,
        });
      }
      for (let i = 0; i < expressions.length; i = i + 1) {
        stack.push({
          node: expressions[i],
          parent,
          metadata: item.metadata,
        });
        if (htmlParts[i + 1]) {
          const htmlString = queue.htmlStringCache
            ? queue.htmlStringCache.getOrCreate(htmlParts[i + 1])
            : markHTMLString(htmlParts[i + 1]);
          stack.push({
            node: htmlString,
            parent,
            metadata: item.metadata,
          });
        }
      }
      continue;
    }
    if (isAstroComponentInstance(node)) {
      const queueNode = pool.acquire("component");
      queueNode.instance = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isAstroComponentFactory(node)) {
      const factory = node;
      const props = item.metadata?.props || {};
      const slots = item.metadata?.slots || {};
      const instance = createAstroComponentInstance(
        result,
        item.metadata?.displayName || factory.name || "Anonymous",
        factory,
        props,
        slots,
      );
      const queueNode = pool.acquire("component");
      queueNode.instance = instance;
      if (isAPropagatingComponent(result, factory))
        try {
          const returnValue = await instance.init(result);
          if (isHeadAndContent(returnValue) && returnValue.head)
            result._metadata.extraHead.push(returnValue.head);
        } catch (error) {
          throw error;
        }
      queue.nodes.push(queueNode);
      continue;
    }
    if (isRenderInstance(node)) {
      const queueNode = pool.acquire("component");
      queueNode.instance = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (typeof node === "object" && Symbol.iterator in node) {
      const items = Array.from(node);
      for (const iterItem of items)
        stack.push({
          node: iterItem,
          parent,
          metadata: item.metadata,
        });
      continue;
    }
    if (typeof node === "object" && Symbol.asyncIterator in node) {
      try {
        const items = [];
        for await (const asyncItem of node) items.push(asyncItem);
        for (const iterItem of items)
          stack.push({
            node: iterItem,
            parent,
            metadata: item.metadata,
          });
      } catch (error) {
        throw error;
      }
      continue;
    }
    if (node instanceof Response) {
      const queueNode = pool.acquire("html-string", "");
      queueNode.html = "";
      queue.nodes.push(queueNode);
      continue;
    }
    if (isHTMLString(node)) {
      const html = String(node);
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
    } else {
      const str = String(node);
      const queueNode = pool.acquire("text", str);
      queueNode.content = str;
      queue.nodes.push(queueNode);
    }
  }
  queue.nodes.reverse();
  return queue;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/queue/renderer.js
async function renderQueue(queue, destination) {
  const result = queue.result;
  const pool = queue.pool;
  const cache = queue.htmlStringCache;
  let batchBuffer = "";
  let i = 0;
  while (i < queue.nodes.length) {
    const node = queue.nodes[i];
    try {
      if (canBatch(node)) {
        const batchStart = i;
        while (i < queue.nodes.length && canBatch(queue.nodes[i])) {
          batchBuffer += renderNodeToString(queue.nodes[i]);
          i = i + 1;
        }
        if (batchBuffer) {
          const htmlString = cache ? cache.getOrCreate(batchBuffer) : markHTMLString(batchBuffer);
          destination.write(htmlString);
          batchBuffer = "";
        }
        if (pool) for (let j = batchStart; j < i; j++) pool.release(queue.nodes[j]);
      } else {
        await renderNode(node, destination, result);
        if (pool) pool.release(node);
        i = i + 1;
      }
    } catch (error) {
      throw error;
    }
  }
  if (batchBuffer) {
    const htmlString = cache ? cache.getOrCreate(batchBuffer) : markHTMLString(batchBuffer);
    destination.write(htmlString);
  }
}
function canBatch(node) {
  return node.type === "text" || node.type === "html-string";
}
function renderNodeToString(node) {
  switch (node.type) {
    case "text":
      return node.content ? escapeHTML(node.content) : "";
    case "html-string":
      return node.html || "";
    case "component":
    case "instruction":
      return "";
  }
}
async function renderNode(node, destination, result) {
  const cache = result._experimentalQueuedRendering?.htmlStringCache;
  switch (node.type) {
    case "text":
      if (node.content) {
        const escaped = escapeHTML(node.content);
        const htmlString = cache ? cache.getOrCreate(escaped) : markHTMLString(escaped);
        destination.write(htmlString);
      }
      break;
    case "html-string":
      if (node.html) {
        const htmlString = cache ? cache.getOrCreate(node.html) : markHTMLString(node.html);
        destination.write(htmlString);
      }
      break;
    case "instruction":
      if (node.instruction) destination.write(node.instruction);
      break;
    case "component":
      if (node.instance) {
        let componentHtml = "";
        await node.instance.render({
          write(chunk) {
            if (chunk instanceof Response) return;
            componentHtml += chunkToString(result, chunk);
          },
        });
        if (componentHtml) destination.write(componentHtml);
      }
      break;
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/page.js
async function renderPage(result, componentFactory, props, children, streaming, route) {
  if (!isAstroComponentFactory(componentFactory)) {
    result._metadata.headInTree =
      result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
    const pageProps = {
      ...props,
      "server:root": true,
    };
    let str;
    if (result._experimentalQueuedRendering && result._experimentalQueuedRendering.enabled) {
      let vnode = await componentFactory(pageProps);
      if (componentFactory["astro:html"] && typeof vnode === "string")
        vnode = markHTMLString(vnode);
      const queue = await buildRenderQueue(vnode, result, result._experimentalQueuedRendering.pool);
      let html = "";
      let renderedFirst = false;
      await renderQueue(queue, {
        write(chunk) {
          if (chunk instanceof Response) return;
          if (!renderedFirst && !result.partial) {
            renderedFirst = true;
            const chunkStr = String(chunk);
            if (!/<!doctype html/i.test(chunkStr)) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              html += doctype;
            }
          }
          html += chunkToString(result, chunk);
        },
      });
      str = html;
    } else
      str = await renderComponentToString(
        result,
        componentFactory.name,
        componentFactory,
        pageProps,
        {},
        true,
        route,
      );
    const bytes = encoder.encode(str);
    const headers2 = new Headers([
      ["Content-Type", "text/html"],
      ["Content-Length", bytes.byteLength.toString()],
    ]);
    if (
      result.shouldInjectCspMetaTags &&
      (result.cspDestination === "header" || result.cspDestination === "adapter")
    )
      headers2.set("content-security-policy", renderCspContent(result));
    return new Response(bytes, {
      headers: headers2,
      status: result.response.status,
    });
  }
  result._metadata.headInTree =
    result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
  let body;
  if (streaming)
    if (isNode && !isDeno)
      body = await renderToAsyncIterable(result, componentFactory, props, children, true, route);
    else
      body = await renderToReadableStream(result, componentFactory, props, children, true, route);
  else body = await renderToString(result, componentFactory, props, children, true, route);
  if (body instanceof Response) return body;
  const init = result.response;
  const headers = new Headers(init.headers);
  if (
    (result.shouldInjectCspMetaTags && result.cspDestination === "header") ||
    result.cspDestination === "adapter"
  )
    headers.set("content-security-policy", renderCspContent(result));
  if (!streaming && typeof body === "string") {
    body = encoder.encode(body);
    headers.set("Content-Length", body.byteLength.toString());
  }
  let status = init.status;
  let statusText = init.statusText;
  if (route?.route === "/404") {
    status = 404;
    if (statusText === "OK") statusText = "Not Found";
  } else if (route?.route === "/500") {
    status = 500;
    if (statusText === "OK") statusText = "Internal Server Error";
  }
  if (status)
    return new Response(body, {
      ...init,
      headers,
      status,
      statusText,
    });
  else
    return new Response(body, {
      ...init,
      headers,
    });
}
"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
  .split("")
  .reduce((v, c) => ((v[c.charCodeAt(0)] = c), v), []);
"-0123456789_".split("").reduce((v, c) => ((v[c.charCodeAt(0)] = c), v), []);
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/index.js
function spreadAttributes(values = {}, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName)
    if (typeof values.class !== "undefined") values.class += ` ${scopedClassName}`;
    else if (typeof values["class:list"] !== "undefined")
      values["class:list"] = [values["class:list"], scopedClassName];
    else values.class = scopedClassName;
  for (const [key, value] of Object.entries(values))
    output += addAttribute(value, key, true, _name);
  return markHTMLString(output);
}
//#endregion
export {
  NOOP_MIDDLEWARE_HEADER as A,
  escape as C,
  s as D,
  renderEndpoint as E,
  ROUTE_TYPE_HEADER as F,
  clientAddressSymbol as I,
  originPathnameSymbol as L,
  REROUTABLE_STATUS_CODES as M,
  REROUTE_DIRECTIVE_HEADER as N,
  ASTRO_GENERATOR as O,
  REWRITE_DIRECTIVE_HEADER_KEY as P,
  pipelineSymbol as R,
  unescapeHTML as S,
  createComponent as T,
  isRenderInstruction as _,
  Fragment as a,
  createVNode as b,
  renderSlot as c,
  decodeKey as d,
  decryptString as f,
  addAttribute as g,
  renderHead as h,
  renderComponent as i,
  REDIRECT_STATUS_CODES as j,
  DEFAULT_404_COMPONENT as k,
  renderSlotToString as l,
  maybeRenderHead as m,
  renderPage as n,
  chunkToString as o,
  generateCspDigest as p,
  renderJSX as r,
  createSlotValueFromString as s,
  spreadAttributes as t,
  renderTemplate as u,
  isAstroComponentFactory as v,
  createAstro as w,
  HTMLString as x,
  AstroJSX as y,
  responseSentSymbol as z,
};
