globalThis.process ??= {};
globalThis.process.env ??= {};
import { EventEmitter } from "node:events";
import { Writable } from "node:stream";

import { env } from "cloudflare:workers";

import { r as __toESM, t as __commonJSMin } from "./chunks/chunk_B-gkxaTK.mjs";
import "./chunks/utils_DdMENcZJ.mjs";
import {
  a as fileExtension,
  f as removeLeadingForwardSlash,
  h as slash,
  i as collapseDuplicateTrailingSlashes,
  l as joinPaths,
  m as removeTrailingForwardSlash,
  n as collapseDuplicateLeadingSlashes,
  o as hasFileExtension,
  r as collapseDuplicateSlashes,
  s as isInternalPath,
  t as appendForwardSlash,
  u as prependForwardSlash,
} from "./chunks/path_DI6zaT7z.mjs";
import { t as require_react } from "./chunks/react_hEShQL-y.mjs";
import { o as matchPattern } from "./chunks/remoteProbe_BM9BtsPs.mjs";
import {
  A as normalizeThePath,
  C as isRoute404,
  D as readBodyWithLimit,
  E as BodySizeLimitError,
  O as getAllCodes,
  S as setOriginPathname,
  T as DEFAULT_404_ROUTE,
  _ as RedirectSinglePageBuiltModule,
  a as getFallbackRoute,
  b as findRouteToRewrite,
  c as routeIsRedirect,
  f as deserializeRouteInfo,
  g as getRouteGenerator,
  h as getPattern,
  i as getProps,
  j as shouldAppendForwardSlash,
  k as normalizeTheLocale,
  l as Pipeline,
  m as SERVER_ISLAND_COMPONENT,
  n as Slots,
  o as routeHasHtmlExtension,
  r as getParams,
  s as routeIsFallback,
  t as sequence,
  u as deserializeManifest,
  w as isRoute500,
  x as getOriginPathname,
  y as copyRequest,
} from "./chunks/sequence_BBfB_bZB.mjs";
import {
  A as NOOP_MIDDLEWARE_HEADER,
  D as s,
  E as renderEndpoint,
  F as ROUTE_TYPE_HEADER,
  I as clientAddressSymbol,
  M as REROUTABLE_STATUS_CODES,
  N as REROUTE_DIRECTIVE_HEADER,
  O as ASTRO_GENERATOR,
  P as REWRITE_DIRECTIVE_HEADER_KEY,
  R as pipelineSymbol,
  b as createVNode,
  j as REDIRECT_STATUS_CODES,
  n as renderPage,
  p as generateCspDigest,
  r as renderJSX,
  y as AstroJSX,
  z as responseSentSymbol$1,
} from "./chunks/server_COv7-vJj.mjs";
import {
  D as MiddlewareNotAResponse,
  E as MiddlewareNoDataOrNextCalled,
  G as StaticClientAddressNotAvailable,
  L as PrerenderClientAddressNotAvailable,
  T as LocalsReassigned,
  U as SessionStorageInitError,
  V as ResponseSentError,
  W as SessionStorageSaveError,
  X as AstroError,
  Z as AstroUserError,
  a as CacheNotEnabled,
  i as AstroResponseHeadersReassigned,
  n as ActionNotFoundError,
  o as ClientAddressNotAvailable,
  p as ForbiddenRewrite,
  r as ActionsReturnedInvalidDataError,
  w as LocalsNotAnObject,
} from "./chunks/shorthash_DX7y3U4-.mjs";
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
const hrtime$1 = /* @__PURE__ */ Object.assign(
  function hrtime(startTime) {
    const now = Date.now();
    const seconds = Math.trunc(now / 1e3);
    const nanos = (now % 1e3) * 1e6;
    if (startTime) {
      let diffSeconds = seconds - startTime[0];
      let diffNanos = nanos - startTime[0];
      if (diffNanos < 0) {
        diffSeconds = diffSeconds - 1;
        diffNanos = 1e9 + diffNanos;
      }
      return [diffSeconds, diffNanos];
    }
    return [seconds, nanos];
  },
  {
    bigint: function bigint() {
      return BigInt(Date.now() * 1e6);
    },
  },
);
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
const ReadStream = class {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
const WriteStream = class {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env) {
    return 1;
  }
  hasColors(count, env) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) str = new TextDecoder().decode(str);
    try {
      console.log(str);
    } catch {}
    cb && typeof cb === "function" && cb();
    return false;
  }
};
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/_internal/utils.mjs
/* @__NO_SIDE_EFFECTS__ */
function createNotImplementedError(name) {
  return /* @__PURE__ */ new Error(`[unenv] ${name} is not implemented yet!`);
}
/* @__NO_SIDE_EFFECTS__ */
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
/* @__NO_SIDE_EFFECTS__ */
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
const NODE_VERSION = "22.14.0";
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
const Process = class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [
      ...Object.getOwnPropertyNames(Process.prototype),
      ...Object.getOwnPropertyNames(EventEmitter.prototype),
    ]) {
      const value = this[prop];
      if (typeof value === "function") this[prop] = value.bind(this);
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return (this.#stdin ??= new ReadStream(0));
  }
  get stdout() {
    return (this.#stdout ??= new WriteStream(1));
  }
  get stderr() {
    return (this.#stderr ??= new WriteStream(2));
  }
  #cwd = "/";
  chdir(cwd) {
    this.#cwd = cwd;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {}
  unref() {}
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {}
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport"),
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit"),
  };
  memoryUsage = Object.assign(
    () => ({
      arrayBuffers: 0,
      rss: 0,
      external: 0,
      heapTotal: 0,
      heapUsed: 0,
    }),
    { rss: () => 0 },
  );
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
//#endregion
//#region ../../node_modules/.bun/@cloudflare+unenv-preset@2.16.0+3f3a515241059cda/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const workerdProcess = getBuiltinModule("node:process");
const unenvProcess = new Process({
  env: globalProcess.env,
  hrtime: hrtime$1,
  nextTick: workerdProcess.nextTick,
});
const { exit, features, platform } = workerdProcess;
const {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert$1,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env: env$1,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions,
} = unenvProcess;
//#endregion
//#region \0virtual:cloudflare/nodejs-global-inject/@cloudflare/unenv-preset/node/process
globalThis.process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env: env$1,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert$1,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding,
};
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/mock/noop.mjs
const noop_default = Object.assign(() => {}, { __unenv__: true });
//#endregion
//#region ../../node_modules/.bun/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/console.mjs
const _console = globalThis.console;
const _stderr = new Writable();
const _stdout = new Writable();
_console?.log;
_console?.info;
_console?.trace;
_console?.debug;
_console?.table;
_console?.error;
_console?.warn;
_console?.createTask;
_console?.clear;
_console?.count;
_console?.countReset;
_console?.dir;
_console?.dirxml;
_console?.group;
_console?.groupEnd;
_console?.groupCollapsed;
_console?.profile;
_console?.profileEnd;
_console?.time;
_console?.timeEnd;
_console?.timeLog;
_console?.timeStamp;
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop_default;
const _stderrErrorHandler = noop_default;
//#endregion
//#region ../../node_modules/.bun/@cloudflare+unenv-preset@2.16.0+3f3a515241059cda/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
const workerdConsole = globalThis["console"];
const {
  assert,
  clear,
  context,
  count,
  countReset,
  createTask,
  debug: debug$1,
  dir,
  dirxml,
  error: error$1,
  group,
  groupCollapsed,
  groupEnd,
  info: info$1,
  log: log$1,
  profile,
  profileEnd,
  table,
  time,
  timeEnd,
  timeLog,
  timeStamp,
  trace,
  warn: warn$1,
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors: true,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times,
});
//#endregion
//#region \0virtual:cloudflare/nodejs-global-inject/@cloudflare/unenv-preset/node/console
globalThis.console = workerdConsole;
//#endregion
//#region \0virtual:astro-cloudflare:config
const sessionKVBindingName = "SESSION";
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/cookies/cookies.js
const import_dist = /* @__PURE__ */ __commonJSMin((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.parse = parseCookie;
  exports.stringifySetCookie = stringifySetCookie;
  exports.serialize = stringifySetCookie;
  exports.stringifySetCookie = stringifySetCookie;
  exports.serialize = stringifySetCookie;
  /**
   * RegExp to match cookie-name in RFC 6265 sec 4.1.1
   * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
   * which has been replaced by the token definition in RFC 7230 appendix B.
   *
   * cookie-name       = token
   * token             = 1*tchar
   * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
   *                     "*" / "+" / "-" / "." / "^" / "_" /
   *                     "`" / "|" / "~" / DIGIT / ALPHA
   *
   * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
   * Allow same range as cookie value, except `=`, which delimits end of name.
   */
  var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
  /**
   * RegExp to match cookie-value in RFC 6265 sec 4.1.1
   *
   * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
   * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
   *                     ; US-ASCII characters excluding CTLs,
   *                     ; whitespace DQUOTE, comma, semicolon,
   *                     ; and backslash
   *
   * Allowing more characters: https://github.com/jshttp/cookie/issues/191
   * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
   */
  var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
  /**
   * RegExp to match domain-value in RFC 6265 sec 4.1.1
   *
   * domain-value      = <subdomain>
   *                     ; defined in [RFC1034], Section 3.5, as
   *                     ; enhanced by [RFC1123], Section 2.1
   * <subdomain>       = <label> | <subdomain> "." <label>
   * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
   *                     Labels must be 63 characters or less.
   *                     'let-dig' not 'letter' in the first char, per RFC1123
   * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
   * <let-dig-hyp>     = <let-dig> | "-"
   * <let-dig>         = <letter> | <digit>
   * <letter>          = any one of the 52 alphabetic characters A through Z in
   *                     upper case and a through z in lower case
   * <digit>           = any one of the ten digits 0 through 9
   *
   * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
   *
   * > (Note that a leading %x2E ("."), if present, is ignored even though that
   * character is not permitted, but a trailing %x2E ("."), if present, will
   * cause the user agent to ignore the attribute.)
   */
  var domainValueRegExp =
    /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  /**
   * RegExp to match path-value in RFC 6265 sec 4.1.1
   *
   * path-value        = <any CHAR except CTLs or ";">
   * CHAR              = %x01-7F
   *                     ; defined in RFC 5234 appendix B.1
   */
  var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
  var __toString = Object.prototype.toString;
  var NullObject = /* @__PURE__ */ (() => {
    const C = function () {};
    C.prototype = Object.create(null);
    return C;
  })();
  /**
   * Parse a `Cookie` header.
   *
   * Parse the given cookie header string into an object
   * The object has the various cookies as keys(names) => values
   */
  function parseCookie(str, options) {
    const obj = new NullObject();
    const len = str.length;
    if (len < 2) return obj;
    const dec = options?.decode || decode;
    let index = 0;
    do {
      const eqIdx = eqIndex(str, index, len);
      if (eqIdx === -1) break;
      const endIdx = endIndex(str, index, len);
      if (eqIdx > endIdx) {
        index = str.lastIndexOf(";", eqIdx - 1) + 1;
        continue;
      }
      const key = valueSlice(str, index, eqIdx);
      if (obj[key] === void 0) obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
      index = endIdx + 1;
    } while (index < len);
    return obj;
  }
  function stringifySetCookie(_name, _val, _opts) {
    const cookie =
      typeof _name === "object"
        ? _name
        : {
            ..._opts,
            name: _name,
            value: String(_val),
          };
    const enc = (typeof _val === "object" ? _val : _opts)?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(cookie.name))
      throw new TypeError(`argument name is invalid: ${cookie.name}`);
    const value = cookie.value ? enc(cookie.value) : "";
    if (!cookieValueRegExp.test(value))
      throw new TypeError(`argument val is invalid: ${cookie.value}`);
    let str = cookie.name + "=" + value;
    if (cookie.maxAge !== void 0) {
      if (!Number.isInteger(cookie.maxAge))
        throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
      str += "; Max-Age=" + cookie.maxAge;
    }
    if (cookie.domain) {
      if (!domainValueRegExp.test(cookie.domain))
        throw new TypeError(`option domain is invalid: ${cookie.domain}`);
      str += "; Domain=" + cookie.domain;
    }
    if (cookie.path) {
      if (!pathValueRegExp.test(cookie.path))
        throw new TypeError(`option path is invalid: ${cookie.path}`);
      str += "; Path=" + cookie.path;
    }
    if (cookie.expires) {
      if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf()))
        throw new TypeError(`option expires is invalid: ${cookie.expires}`);
      str += "; Expires=" + cookie.expires.toUTCString();
    }
    if (cookie.httpOnly) str += "; HttpOnly";
    if (cookie.secure) str += "; Secure";
    if (cookie.partitioned) str += "; Partitioned";
    if (cookie.priority)
      switch (typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0) {
        case "low":
          str += "; Priority=Low";
          break;
        case "medium":
          str += "; Priority=Medium";
          break;
        case "high":
          str += "; Priority=High";
          break;
        default:
          throw new TypeError(`option priority is invalid: ${cookie.priority}`);
      }
    if (cookie.sameSite)
      switch (
        typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite
      ) {
        case true:
        case "strict":
          str += "; SameSite=Strict";
          break;
        case "lax":
          str += "; SameSite=Lax";
          break;
        case "none":
          str += "; SameSite=None";
          break;
        default:
          throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
      }
    return str;
  }
  /**
   * Find the `;` character between `min` and `len` in str.
   */
  function endIndex(str, min, len) {
    const index = str.indexOf(";", min);
    return index === -1 ? len : index;
  }
  /**
   * Find the `=` character between `min` and `max` in str.
   */
  function eqIndex(str, min, max) {
    const index = str.indexOf("=", min);
    return index < max ? index : -1;
  }
  /**
   * Slice out a value between startPod to max.
   */
  function valueSlice(str, min, max) {
    let start = min;
    let end = max;
    do {
      const code = str.charCodeAt(start);
      if (code !== 32 && code !== 9) break;
    } while (++start < end);
    while (end > start) {
      const code = str.charCodeAt(end - 1);
      if (code !== 32 && code !== 9) break;
      end--;
    }
    return str.slice(start, end);
  }
  /**
   * URL-decode string value. Optimized to skip native call when no %.
   */
  function decode(str) {
    if (str.indexOf("%") === -1) return str;
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  }
  /**
   * Determine if value is a Date.
   */
  function isDate(val) {
    return __toString.call(val) === "[object Date]";
  }
})();
const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = "deleted";
const responseSentSymbol = /* @__PURE__ */ Symbol.for("astro.responseSent");
const identity = (value) => value;
const AstroCookie = class {
  constructor(value) {
    this.value = value;
  }
  json() {
    if (this.value === void 0) throw new Error(`Cannot convert undefined to an object.`);
    return JSON.parse(this.value);
  }
  number() {
    return Number(this.value);
  }
  boolean() {
    if (this.value === "false") return false;
    if (this.value === "0") return false;
    return Boolean(this.value);
  }
};
const AstroCookies = class {
  #request;
  #requestValues;
  #outgoing;
  #consumed;
  constructor(request) {
    this.#request = request;
    this.#requestValues = null;
    this.#outgoing = null;
    this.#consumed = false;
  }
  /**
   * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
   * in a Set-Cookie header added to the response.
   * @param key The cookie to delete
   * @param options Options related to this deletion, such as the path of the cookie.
   */
  delete(key, options) {
    const { maxAge: _ignoredMaxAge, expires: _ignoredExpires, ...sanitizedOptions } = options || {};
    const serializeOptions = {
      expires: DELETED_EXPIRATION,
      ...sanitizedOptions,
    };
    this.#ensureOutgoingMap().set(key, [
      DELETED_VALUE,
      (0, import_dist.serialize)(key, DELETED_VALUE, serializeOptions),
      false,
    ]);
  }
  /**
   * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
   * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
   * from that set call, overriding any values already part of the request.
   * @param key The cookie to get.
   * @returns An object containing the cookie value as well as convenience methods for converting its value.
   */
  get(key, options = void 0) {
    if (this.#outgoing?.has(key)) {
      let [serializedValue, , isSetValue] = this.#outgoing.get(key);
      if (isSetValue) return new AstroCookie(serializedValue);
      else return;
    }
    const decode = options?.decode ?? decodeURIComponent;
    const values = this.#ensureParsed();
    if (key in values) {
      const value = values[key];
      if (value) {
        let decodedValue;
        try {
          decodedValue = decode(value);
        } catch (_error) {
          decodedValue = value;
        }
        return new AstroCookie(decodedValue);
      }
    }
  }
  /**
   * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
   * part of the initial request or set via Astro.cookies.set(key)
   * @param key The cookie to check for.
   * @param _options This parameter is no longer used.
   * @returns
   */
  has(key, _options) {
    if (this.#outgoing?.has(key)) {
      let [, , isSetValue] = this.#outgoing.get(key);
      return isSetValue;
    }
    return this.#ensureParsed()[key] !== void 0;
  }
  /**
   * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
   * an object it will be stringified via JSON.stringify(value). Additionally you
   * can provide options customizing how this cookie will be set, such as setting httpOnly
   * in order to prevent the cookie from being read in client-side JavaScript.
   * @param key The name of the cookie to set.
   * @param value A value, either a string or other primitive or an object.
   * @param options Options for the cookie, such as the path and security settings.
   */
  set(key, value, options) {
    if (this.#consumed) {
      const warning = /* @__PURE__ */ new Error(
        "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page.",
      );
      warning.name = "Warning";
      console.warn(warning);
    }
    let serializedValue;
    if (typeof value === "string") serializedValue = value;
    else {
      let toStringValue = value.toString();
      if (toStringValue === Object.prototype.toString.call(value))
        serializedValue = JSON.stringify(value);
      else serializedValue = toStringValue;
    }
    const serializeOptions = {};
    if (options) Object.assign(serializeOptions, options);
    this.#ensureOutgoingMap().set(key, [
      serializedValue,
      (0, import_dist.serialize)(key, serializedValue, serializeOptions),
      true,
    ]);
    if (this.#request[responseSentSymbol]) throw new AstroError({ ...ResponseSentError });
  }
  /**
   * Merges a new AstroCookies instance into the current instance. Any new cookies
   * will be added to the current instance, overwriting any existing cookies with the same name.
   */
  merge(cookies) {
    const outgoing = cookies.#outgoing;
    if (outgoing) for (const [key, value] of outgoing) this.#ensureOutgoingMap().set(key, value);
  }
  /**
   * Astro.cookies.header() returns an iterator for the cookies that have previously
   * been set by either Astro.cookies.set() or Astro.cookies.delete().
   * This method is primarily used by adapters to set the header on outgoing responses.
   * @returns
   */
  *headers() {
    if (this.#outgoing == null) return;
    for (const [, value] of this.#outgoing) yield value[1];
  }
  /**
   * Behaves the same as AstroCookies.prototype.headers(),
   * but allows a warning when cookies are set after the instance is consumed.
   */
  static consume(cookies) {
    cookies.#consumed = true;
    return cookies.headers();
  }
  #ensureParsed() {
    if (!this.#requestValues) this.#parse();
    if (!this.#requestValues) this.#requestValues = /* @__PURE__ */ Object.create(null);
    return this.#requestValues;
  }
  #ensureOutgoingMap() {
    if (!this.#outgoing) this.#outgoing = /* @__PURE__ */ new Map();
    return this.#outgoing;
  }
  #parse() {
    const raw = this.#request.headers.get("cookie");
    if (!raw) return;
    this.#requestValues = (0, import_dist.parse)(raw, { decode: identity });
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/cookies/response.js
const astroCookiesSymbol = /* @__PURE__ */ Symbol.for("astro.cookies");
function attachCookiesToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getCookiesFromResponse(response) {
  const cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) return cookies;
  else return;
}
function* getSetCookiesFromResponse(response) {
  const cookies = getCookiesFromResponse(response);
  if (!cookies) return [];
  for (const headerValue of AstroCookies.consume(cookies)) yield headerValue;
  return [];
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/logger/core.js
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90,
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine,
  };
  if (!isLogLevelEnabled(logLevel, level)) return;
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) globalThis._astroGlobalDebug(...args);
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(s.bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else prefix.push(timestamp);
  if (label) prefix.push(`[${label}]`);
  if (level === "error") return s.red(prefix.join(" "));
  if (level === "warn") return s.yellow(prefix.join(" "));
  if (prefix.length === 1) return s.dim(prefix[0]);
  return s.dim(prefix[0]) + " " + s.blue(prefix.splice(1).join(" "));
}
const Logger = class {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
};
const AstroIntegrationLogger = class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/logger/console.js
const consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) dest = console.info;
    if (event.label === "SKIP_FORMAT") dest(event.message);
    else dest(getEventPrefix(event) + " " + event.message);
    return true;
  },
};
//#endregion
//#region ../../node_modules/.bun/devalue@5.6.4/node_modules/devalue/src/utils.js
const DevalueError = class extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   * @param {any} [value] - The value that failed to be serialized
   * @param {any} [root] - The root value being serialized
   */
  constructor(message, keys, value, root) {
    super(message);
    this.name = "DevalueError";
    this.path = keys.join("");
    this.value = value;
    this.root = root;
  }
};
/** @param {any} thing */
function is_primitive(thing) {
  return Object(thing) !== thing;
}
const object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype)
  .sort()
  .join("\0");
/** @param {any} thing */
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return (
    proto === Object.prototype ||
    proto === null ||
    Object.getPrototypeOf(proto) === null ||
    Object.getOwnPropertyNames(proto).toSorted().join("\0") === object_proto_names
  );
}
/** @param {any} thing */
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
/** @param {string} char */
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"';
    case "<":
      return "\\u003C";
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "	":
      return "\\t";
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
  }
}
/** @param {string} str */
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}
/** @param {Record<string | symbol, any>} object */
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable,
  );
}
const is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
/** @param {string} key */
function stringify_key(key) {
  return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}
/** @param {string} s */
function is_valid_array_index(s) {
  if (s.length === 0) return false;
  if (s.length > 1 && s.charCodeAt(0) === 48) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  const n = +s;
  if (n >= 2 ** 32 - 1) return false;
  if (n < 0) return false;
  return true;
}
/**
 * Finds the populated indices of an array.
 * @param {unknown[]} array
 */
function valid_array_indices(array) {
  const keys = Object.keys(array);
  for (var i = keys.length - 1; i >= 0; i--) if (is_valid_array_index(keys[i])) break;
  keys.length = i + 1;
  return keys;
}
//#endregion
//#region ../../node_modules/.bun/devalue@5.6.4/node_modules/devalue/src/base64.js
/**
 * Base64 Encodes an arraybuffer
 * @param {ArrayBuffer} arraybuffer
 * @returns {string}
 */
function encode64(arraybuffer) {
  const dv = new DataView(arraybuffer);
  let binaryString = "";
  for (let i = 0; i < arraybuffer.byteLength; i++)
    binaryString += String.fromCharCode(dv.getUint8(i));
  return binaryToAscii(binaryString);
}
/**
 * Decodes a base64 string into an arraybuffer
 * @param {string} string
 * @returns {ArrayBuffer}
 */
function decode64(string) {
  const binaryString = asciiToBinary(string);
  const arraybuffer = new ArrayBuffer(binaryString.length);
  const dv = new DataView(arraybuffer);
  for (let i = 0; i < arraybuffer.byteLength; i++) dv.setUint8(i, binaryString.charCodeAt(i));
  return arraybuffer;
}
const KEY_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
/**
 * Substitute for atob since it's deprecated in node.
 * Does not do any input validation.
 *
 * @see https://github.com/jsdom/abab/blob/master/lib/atob.js
 *
 * @param {string} data
 * @returns {string}
 */
function asciiToBinary(data) {
  if (data.length % 4 === 0) data = data.replace(/==?$/, "");
  let output = "";
  let buffer = 0;
  let accumulatedBits = 0;
  for (let i = 0; i < data.length; i++) {
    buffer <<= 6;
    buffer |= KEY_STRING.indexOf(data[i]);
    accumulatedBits += 6;
    if (accumulatedBits === 24) {
      output += String.fromCharCode((buffer & 16711680) >> 16);
      output += String.fromCharCode((buffer & 65280) >> 8);
      output += String.fromCharCode(buffer & 255);
      buffer = accumulatedBits = 0;
    }
  }
  if (accumulatedBits === 12) {
    buffer >>= 4;
    output += String.fromCharCode(buffer);
  } else if (accumulatedBits === 18) {
    buffer >>= 2;
    output += String.fromCharCode((buffer & 65280) >> 8);
    output += String.fromCharCode(buffer & 255);
  }
  return output;
}
/**
 * Substitute for btoa since it's deprecated in node.
 * Does not do any input validation.
 *
 * @see https://github.com/jsdom/abab/blob/master/lib/btoa.js
 *
 * @param {string} str
 * @returns {string}
 */
function binaryToAscii(str) {
  let out = "";
  for (let i = 0; i < str.length; i += 3) {
    /** @type {[number, number, number, number]} */
    const groupsOfSix = [void 0, void 0, void 0, void 0];
    groupsOfSix[0] = str.charCodeAt(i) >> 2;
    groupsOfSix[1] = (str.charCodeAt(i) & 3) << 4;
    if (str.length > i + 1) {
      groupsOfSix[1] |= str.charCodeAt(i + 1) >> 4;
      groupsOfSix[2] = (str.charCodeAt(i + 1) & 15) << 2;
    }
    if (str.length > i + 2) {
      groupsOfSix[2] |= str.charCodeAt(i + 2) >> 6;
      groupsOfSix[3] = str.charCodeAt(i + 2) & 63;
    }
    for (let j = 0; j < groupsOfSix.length; j++)
      if (typeof groupsOfSix[j] === "undefined") out += "=";
      else out += KEY_STRING[groupsOfSix[j]];
  }
  return out;
}
//#endregion
//#region ../../node_modules/.bun/devalue@5.6.4/node_modules/devalue/src/parse.js
/**
 * Revive a value serialized with `devalue.stringify`
 * @param {string} serialized
 * @param {Record<string, (value: any) => any>} [revivers]
 */
function parse(serialized, revivers) {
  return unflatten$1(JSON.parse(serialized), revivers);
}
/**
 * Revive a value flattened with `devalue.stringify`
 * @param {number | any[]} parsed
 * @param {Record<string, (value: any) => any>} [revivers]
 */
function unflatten$1(parsed, revivers) {
  if (typeof parsed === "number") return hydrate(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid input");
  const values = parsed;
  const hydrated = Array(values.length);
  /**
   * A set of values currently being hydrated with custom revivers,
   * used to detect invalid cyclical dependencies
   * @type {Set<number> | null}
   */
  let hydrating = null;
  /**
   * @param {number} index
   * @returns {any}
   */
  function hydrate(index, standalone = false) {
    if (index === -1) return void 0;
    if (index === -3) return NaN;
    if (index === -4) return Infinity;
    if (index === -5) return -Infinity;
    if (index === -6) return -0;
    if (standalone || typeof index !== "number") throw new Error(`Invalid input`);
    if (index in hydrated) return hydrated[index];
    const value = values[index];
    if (!value || typeof value !== "object") hydrated[index] = value;
    else if (Array.isArray(value))
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
        if (reviver) {
          let i = value[1];
          if (typeof i !== "number") i = values.push(value[1]) - 1;
          hydrating ??= /* @__PURE__ */ new Set();
          if (hydrating.has(i)) throw new Error("Invalid circular reference");
          hydrating.add(i);
          hydrated[index] = reviver(hydrate(i));
          hydrating.delete(i);
          return hydrated[index];
        }
        switch (type) {
          case "Date":
            hydrated[index] = new Date(value[1]);
            break;
          case "Set":
            const set = /* @__PURE__ */ new Set();
            hydrated[index] = set;
            for (let i = 1; i < value.length; i += 1) set.add(hydrate(value[i]));
            break;
          case "Map":
            const map = /* @__PURE__ */ new Map();
            hydrated[index] = map;
            for (let i = 1; i < value.length; i += 2)
              map.set(hydrate(value[i]), hydrate(value[i + 1]));
            break;
          case "RegExp":
            hydrated[index] = new RegExp(value[1], value[2]);
            break;
          case "Object":
            const object = Object(value[1]);
            if (Object.hasOwn(object, "__proto__"))
              throw new Error("Cannot parse an object with a `__proto__` property");
            hydrated[index] = object;
            break;
          case "BigInt":
            hydrated[index] = BigInt(value[1]);
            break;
          case "null":
            const obj = Object.create(null);
            hydrated[index] = obj;
            for (let i = 1; i < value.length; i += 2) {
              if (value[i] === "__proto__")
                throw new Error("Cannot parse an object with a `__proto__` property");
              obj[value[i]] = hydrate(value[i + 1]);
            }
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array": {
            if (values[value[1]][0] !== "ArrayBuffer") throw new Error("Invalid data");
            const TypedArrayConstructor = globalThis[type];
            const typedArray = new TypedArrayConstructor(hydrate(value[1]));
            hydrated[index] =
              value[2] !== void 0 ? typedArray.subarray(value[2], value[3]) : typedArray;
            break;
          }
          case "ArrayBuffer": {
            const base64 = value[1];
            if (typeof base64 !== "string") throw new Error("Invalid ArrayBuffer encoding");
            hydrated[index] = decode64(base64);
            break;
          }
          case "Temporal.Duration":
          case "Temporal.Instant":
          case "Temporal.PlainDate":
          case "Temporal.PlainTime":
          case "Temporal.PlainDateTime":
          case "Temporal.PlainMonthDay":
          case "Temporal.PlainYearMonth":
          case "Temporal.ZonedDateTime": {
            const temporalName = type.slice(9);
            hydrated[index] = Temporal[temporalName].from(value[1]);
            break;
          }
          case "URL":
            hydrated[index] = new URL(value[1]);
            break;
          case "URLSearchParams":
            hydrated[index] = new URLSearchParams(value[1]);
            break;
          default:
            throw new Error(`Unknown type ${type}`);
        }
      } else if (value[0] === -7) {
        const len = value[1];
        if (!Number.isInteger(len) || len < 0) throw new Error("Invalid input");
        const array = new Array(len);
        hydrated[index] = array;
        for (let i = 2; i < value.length; i += 2) {
          const idx = value[i];
          if (!Number.isInteger(idx) || idx < 0 || idx >= len) throw new Error("Invalid input");
          array[idx] = hydrate(value[i + 1]);
        }
      } else {
        const array = new Array(value.length);
        hydrated[index] = array;
        for (let i = 0; i < value.length; i += 1) {
          const n = value[i];
          if (n === -2) continue;
          array[i] = hydrate(n);
        }
      }
    else {
      /** @type {Record<string, any>} */
      const object = {};
      hydrated[index] = object;
      for (const key of Object.keys(value)) {
        if (key === "__proto__")
          throw new Error("Cannot parse an object with a `__proto__` property");
        const n = value[key];
        object[key] = hydrate(n);
      }
    }
    return hydrated[index];
  }
  return hydrate(0);
}
//#endregion
//#region ../../node_modules/.bun/devalue@5.6.4/node_modules/devalue/src/stringify.js
/**
 * Turn a value into a JSON string that can be parsed with `devalue.parse`
 * @param {any} value
 * @param {Record<string, (value: any) => any>} [reducers]
 */
function stringify$2(value, reducers) {
  /** @type {any[]} */
  const stringified = [];
  /** @type {Map<any, number>} */
  const indexes = /* @__PURE__ */ new Map();
  /** @type {Array<{ key: string, fn: (value: any) => any }>} */
  const custom = [];
  if (reducers)
    for (const key of Object.getOwnPropertyNames(reducers))
      custom.push({
        key,
        fn: reducers[key],
      });
  /** @type {string[]} */
  const keys = [];
  let p = 0;
  /** @param {any} thing */
  function flatten(thing) {
    if (thing === void 0) return -1;
    if (Number.isNaN(thing)) return -3;
    if (thing === Infinity) return -4;
    if (thing === -Infinity) return -5;
    if (thing === 0 && 1 / thing < 0) return -6;
    if (indexes.has(thing)) return indexes.get(thing);
    const index = p++;
    indexes.set(thing, index);
    for (const { key, fn } of custom) {
      const value = fn(thing);
      if (value) {
        stringified[index] = `["${key}",${flatten(value)}]`;
        return index;
      }
    }
    if (typeof thing === "function")
      throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
    let str = "";
    if (is_primitive(thing)) str = stringify_primitive(thing);
    else {
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          str = `["Object",${stringify_primitive(thing)}]`;
          break;
        case "BigInt":
          str = `["BigInt",${thing}]`;
          break;
        case "Date":
          str = `["Date","${!isNaN(thing.getDate()) ? thing.toISOString() : ""}"]`;
          break;
        case "URL":
          str = `["URL",${stringify_string(thing.toString())}]`;
          break;
        case "URLSearchParams":
          str = `["URLSearchParams",${stringify_string(thing.toString())}]`;
          break;
        case "RegExp":
          const { source, flags } = thing;
          str = flags
            ? `["RegExp",${stringify_string(source)},"${flags}"]`
            : `["RegExp",${stringify_string(source)}]`;
          break;
        case "Array": {
          let mostly_dense = false;
          str = "[";
          for (let i = 0; i < thing.length; i += 1) {
            if (i > 0) str += ",";
            if (Object.hasOwn(thing, i)) {
              keys.push(`[${i}]`);
              str += flatten(thing[i]);
              keys.pop();
            } else if (mostly_dense) str += -2;
            else {
              const populated_keys = valid_array_indices(thing);
              const population = populated_keys.length;
              const d = String(thing.length).length;
              if ((thing.length - population) * 3 > 4 + d + population * (d + 1)) {
                str = "[-7," + thing.length;
                for (let j = 0; j < populated_keys.length; j++) {
                  const key = populated_keys[j];
                  keys.push(`[${key}]`);
                  str += "," + key + "," + flatten(thing[key]);
                  keys.pop();
                }
                break;
              } else {
                mostly_dense = true;
                str += -2;
              }
            }
          }
          str += "]";
          break;
        }
        case "Set":
          str = '["Set"';
          for (const value of thing) str += `,${flatten(value)}`;
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key, value] of thing) {
            keys.push(`.get(${is_primitive(key) ? stringify_primitive(key) : "..."})`);
            str += `,${flatten(key)},${flatten(value)}`;
            keys.pop();
          }
          str += "]";
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array": {
          /** @type {import("./types.js").TypedArray} */
          const typedArray = thing;
          str = '["' + type + '",' + flatten(typedArray.buffer);
          const a = thing.byteOffset;
          const b = a + thing.byteLength;
          if (a > 0 || b !== typedArray.buffer.byteLength) {
            const m = +/(\d+)/.exec(type)[1] / 8;
            str += `,${a / m},${b / m}`;
          }
          str += "]";
          break;
        }
        case "ArrayBuffer":
          str = `["ArrayBuffer","${encode64(thing)}"]`;
          break;
        case "Temporal.Duration":
        case "Temporal.Instant":
        case "Temporal.PlainDate":
        case "Temporal.PlainTime":
        case "Temporal.PlainDateTime":
        case "Temporal.PlainMonthDay":
        case "Temporal.PlainYearMonth":
        case "Temporal.ZonedDateTime":
          str = `["${type}",${stringify_string(thing.toString())}]`;
          break;
        default:
          if (!is_plain_object(thing))
            throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
          if (enumerable_symbols(thing).length > 0)
            throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
          if (Object.getPrototypeOf(thing) === null) {
            str = '["null"';
            for (const key of Object.keys(thing)) {
              if (key === "__proto__")
                throw new DevalueError(
                  `Cannot stringify objects with __proto__ keys`,
                  keys,
                  thing,
                  value,
                );
              keys.push(stringify_key(key));
              str += `,${stringify_string(key)},${flatten(thing[key])}`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key of Object.keys(thing)) {
              if (key === "__proto__")
                throw new DevalueError(
                  `Cannot stringify objects with __proto__ keys`,
                  keys,
                  thing,
                  value,
                );
              if (started) str += ",";
              started = true;
              keys.push(stringify_key(key));
              str += `${stringify_string(key)}:${flatten(thing[key])}`;
              keys.pop();
            }
            str += "}";
          }
      }
    }
    stringified[index] = str;
    return index;
  }
  const index = flatten(value);
  if (index < 0) return `${index}`;
  return `[${stringified.join(",")}]`;
}
/**
 * @param {any} thing
 * @returns {string}
 */
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing instanceof String) return stringify_string(thing.toString());
  if (thing === void 0) return (-1).toString();
  if (thing === 0 && 1 / thing < 0) return (-6).toString();
  if (type === "bigint") return `["BigInt","${thing}"]`;
  return String(thing);
}
const ACTION_QUERY_PARAMS = {
  actionName: "_action",
  actionPayload: "_astroActionPayload",
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/actions/runtime/client.js
const codeToStatusMap = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};
const statusToCodeMap = Object.fromEntries(
  Object.entries(codeToStatusMap).map(([key, value]) => [value, key]),
);
const ActionError = class ActionError extends Error {
  type = "AstroActionError";
  code = "INTERNAL_SERVER_ERROR";
  status = 500;
  constructor(params) {
    super(params.message);
    this.code = params.code;
    this.status = ActionError.codeToStatus(params.code);
    if (params.stack) this.stack = params.stack;
  }
  static codeToStatus(code) {
    return codeToStatusMap[code];
  }
  static statusToCode(status) {
    return statusToCodeMap[status] ?? "INTERNAL_SERVER_ERROR";
  }
  static fromJson(body) {
    if (isInputError(body)) return new ActionInputError(body.issues);
    if (isActionError(body)) return new ActionError(body);
    return new ActionError({ code: "INTERNAL_SERVER_ERROR" });
  }
};
function isActionError(error) {
  return (
    typeof error === "object" &&
    error != null &&
    "type" in error &&
    error.type === "AstroActionError"
  );
}
function isInputError(error) {
  return (
    typeof error === "object" &&
    error != null &&
    "type" in error &&
    error.type === "AstroActionInputError" &&
    "issues" in error &&
    Array.isArray(error.issues)
  );
}
const ActionInputError = class extends ActionError {
  type = "AstroActionInputError";
  issues;
  fields;
  constructor(issues) {
    super({
      message: `Failed to validate: ${JSON.stringify(issues, null, 2)}`,
      code: "BAD_REQUEST",
    });
    this.issues = issues;
    this.fields = {};
    for (const issue of issues)
      if (issue.path.length > 0) {
        const key = issue.path[0].toString();
        this.fields[key] ??= [];
        this.fields[key]?.push(issue.message);
      }
  }
};
function deserializeActionResult(res) {
  if (res.type === "error") {
    let json;
    try {
      json = JSON.parse(res.body);
    } catch {
      return {
        data: void 0,
        error: new ActionError({
          message: res.body,
          code: "INTERNAL_SERVER_ERROR",
        }),
      };
    }
    if (
      ({
        ASSETS_PREFIX: void 0,
          BASE_URL: "/",
          DEV: false,
          MODE: "production",
          PROD: true,
          SITE: void 0,
          SSR: true,
        _: "/home/nchartiot/Code/shiru/apps/docs/node_modules/.bin/astro",
      })?.PROD
    )
      return {
        error: ActionError.fromJson(json),
        data: void 0,
      };
    else {
      const error = ActionError.fromJson(json);
      error.stack = actionResultErrorStack.get();
      return {
        error,
        data: void 0,
      };
    }
  }
  if (res.type === "empty")
    return {
      data: void 0,
      error: void 0,
    };
  return {
    data: parse(res.body, { URL: (href) => new URL(href) }),
    error: void 0,
  };
}
const actionResultErrorStack = /* @__PURE__ */ (function actionResultErrorStackFn() {
  let errorStack;
  return {
    set(stack) {
      errorStack = stack;
    },
    get() {
      return errorStack;
    },
  };
})();
function getActionQueryString(name) {
  return `?${new URLSearchParams({ [ACTION_QUERY_PARAMS.actionName]: name }).toString()}`;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/actions/runtime/server.js
function getActionContext(context) {
  const callerInfo = getCallerInfo(context);
  const actionResultAlreadySet = Boolean(context.locals._actionPayload);
  let action = void 0;
  if (callerInfo && context.request.method === "POST" && !actionResultAlreadySet)
    action = {
      calledFrom: callerInfo.from,
      name: callerInfo.name,
      handler: async () => {
        const pipeline = Reflect.get(context, pipelineSymbol);
        const callerInfoName = shouldAppendForwardSlash(
          pipeline.manifest.trailingSlash,
          pipeline.manifest.buildFormat,
        )
          ? removeTrailingForwardSlash(callerInfo.name)
          : callerInfo.name;
        let baseAction;
        try {
          baseAction = await pipeline.getAction(callerInfoName);
        } catch (error) {
          if (
            error instanceof Error &&
            "name" in error &&
            typeof error.name === "string" &&
            error.name === ActionNotFoundError.name
          )
            return {
              data: void 0,
              error: new ActionError({ code: "NOT_FOUND" }),
            };
          throw error;
        }
        const bodySizeLimit = pipeline.manifest.actionBodySizeLimit;
        let input;
        try {
          input = await parseRequestBody(context.request, bodySizeLimit);
        } catch (e) {
          if (e instanceof ActionError)
            return {
              data: void 0,
              error: e,
            };
          if (e instanceof TypeError)
            return {
              data: void 0,
              error: new ActionError({ code: "UNSUPPORTED_MEDIA_TYPE" }),
            };
          throw e;
        }
        const omitKeys = ["props", "getActionResult", "callAction", "redirect"];
        const actionAPIContext = Object.create(
          Object.getPrototypeOf(context),
          Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(context)).filter(
              ([key]) => !omitKeys.includes(key),
            ),
          ),
        );
        Reflect.set(actionAPIContext, ACTION_API_CONTEXT_SYMBOL, true);
        return baseAction.bind(actionAPIContext)(input);
      },
    };
  function setActionResult(actionName, actionResult) {
    context.locals._actionPayload = {
      actionResult,
      actionName,
    };
  }
  return {
    action,
    setActionResult,
    serializeActionResult,
    deserializeActionResult,
  };
}
function getCallerInfo(ctx) {
  if (ctx.routePattern === "/_actions/[...path]")
    return {
      from: "rpc",
      name: ctx.url.pathname.replace(/^.*\/_actions\//, ""),
    };
  const queryParam = ctx.url.searchParams.get(ACTION_QUERY_PARAMS.actionName);
  if (queryParam)
    return {
      from: "form",
      name: queryParam,
    };
}
async function parseRequestBody(request, bodySizeLimit) {
  const contentType = request.headers.get("content-type");
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : void 0;
  const hasContentLength = typeof contentLength === "number" && Number.isFinite(contentLength);
  if (!contentType) return void 0;
  if (hasContentLength && contentLength > bodySizeLimit)
    throw new ActionError({
      code: "CONTENT_TOO_LARGE",
      message: `Request body exceeds ${bodySizeLimit} bytes`,
    });
  try {
    if (hasContentType(contentType, formContentTypes$1)) {
      if (!hasContentLength) {
        const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
        return await new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: toArrayBuffer(body),
        }).formData();
      }
      return await request.clone().formData();
    }
    if (hasContentType(contentType, ["application/json"])) {
      if (contentLength === 0) return void 0;
      if (!hasContentLength) {
        const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
        if (body.byteLength === 0) return void 0;
        return JSON.parse(new TextDecoder().decode(body));
      }
      return await request.clone().json();
    }
  } catch (e) {
    if (e instanceof BodySizeLimitError)
      throw new ActionError({
        code: "CONTENT_TOO_LARGE",
        message: `Request body exceeds ${bodySizeLimit} bytes`,
      });
    throw e;
  }
  throw new TypeError("Unsupported content type");
}
const ACTION_API_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("astro.actionAPIContext");
const formContentTypes$1 = ["application/x-www-form-urlencoded", "multipart/form-data"];
function hasContentType(contentType, expected) {
  const type = contentType.split(";")[0].toLowerCase();
  return expected.some((t) => type === t);
}
function serializeActionResult(res) {
  if (res.error) {
    if (
      ({
        ASSETS_PREFIX: void 0,
          BASE_URL: "/",
          DEV: false,
          MODE: "production",
          PROD: true,
          SITE: void 0,
          SSR: true,
        _: "/home/nchartiot/Code/shiru/apps/docs/node_modules/.bin/astro",
      })?.DEV
    )
      actionResultErrorStack.set(res.error.stack);
    let body2;
    if (res.error instanceof ActionInputError)
      body2 = {
        type: res.error.type,
        issues: res.error.issues,
        fields: res.error.fields,
      };
    else
      body2 = {
        ...res.error,
        message: res.error.message,
      };
    return {
      type: "error",
      status: res.error.status,
      contentType: "application/json",
      body: JSON.stringify(body2),
    };
  }
  if (res.data === void 0)
    return {
      type: "empty",
      status: 204,
    };
  let body;
  try {
    body = stringify$2(res.data, { URL: (value) => value instanceof URL && value.href });
  } catch (e) {
    let hint = ActionsReturnedInvalidDataError.hint;
    if (res.data instanceof Response)
      hint = REDIRECT_STATUS_CODES.includes(res.data.status)
        ? "If you need to redirect when the action succeeds, trigger a redirect where the action is called. See the Actions guide for server and client redirect examples: https://docs.astro.build/en/guides/actions."
        : "If you need to return a Response object, try using a server endpoint instead. See https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes";
    throw new AstroError({
      ...ActionsReturnedInvalidDataError,
      message: ActionsReturnedInvalidDataError.message(String(e)),
      hint,
    });
  }
  return {
    type: "data",
    status: 200,
    contentType: "application/json+devalue",
    body,
  };
}
function toArrayBuffer(buffer) {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}
//#endregion
//#region ../../node_modules/.bun/es-module-lexer@2.0.0/node_modules/es-module-lexer/dist/lexer.js
let ImportType;
(function (A) {
  ((A[(A.Static = 1)] = "Static"),
    (A[(A.Dynamic = 2)] = "Dynamic"),
    (A[(A.ImportMeta = 3)] = "ImportMeta"),
    (A[(A.StaticSourcePhase = 4)] = "StaticSourcePhase"),
    (A[(A.DynamicSourcePhase = 5)] = "DynamicSourcePhase"),
    (A[(A.StaticDeferPhase = 6)] = "StaticDeferPhase"),
    (A[(A.DynamicDeferPhase = 7)] = "DynamicDeferPhase"));
})(ImportType || (ImportType = {}));
new Uint8Array(new Uint16Array([1]).buffer)[0];
const E = () => {
  return (
    (A =
      "AGFzbQEAAAABKwhgAX8Bf2AEf39/fwBgAAF/YAAAYAF/AGADf39/AX9gAn9/AX9gA39/fwADNzYAAQECAgICAgICAgICAgICAgICAgICAgICAwIAAwMDBAQAAAUAAAAAAAMDAwAGAAAABwAGAgUEBQFwAQEBBQMBAAEGDwJ/AUGw8gALfwBBsPIACwedARsGbWVtb3J5AgACc2EAAAFlAAMCaXMABAJpZQAFAnNzAAYCc2UABwJpdAAIAmFpAAkCaWQACgJpcAALAmVzAAwCZWUADQNlbHMADgNlbGUADwJyaQAQAnJlABEBZgASAm1zABMCcmEAFANha3MAFQNha2UAFgNhdnMAFwNhdmUAGANyc2EAGQVwYXJzZQAaC19faGVhcF9iYXNlAwEKkkY2aAEBf0EAIAA2AvQJQQAoAtAJIgEgAEEBdGoiAEEAOwEAQQAgAEECaiIANgL4CUEAIAA2AvwJQQBBADYC1AlBAEEANgLkCUEAQQA2AtwJQQBBADYC2AlBAEEANgLsCUEAQQA2AuAJIAEL0wEBA39BACgC5AkhBEEAQQAoAvwJIgU2AuQJQQAgBDYC6AlBACAFQShqNgL8CSAEQSRqQdQJIAQbIAU2AgBBACgCyAkhBEEAKALECSEGIAUgATYCACAFIAA2AgggBSACIAJBAmpBACAGIANGIgAbIAQgA0YiBBs2AgwgBSADNgIUIAVBADYCECAFIAI2AgQgBUIANwIgIAVBA0EBQQIgABsgBBs2AhwgBUEAKALECSADRiICOgAYAkACQCACDQBBACgCyAkgA0cNAQtBAEEBOgCACgsLXgEBf0EAKALsCSIEQRBqQdgJIAQbQQAoAvwJIgQ2AgBBACAENgLsCUEAIARBFGo2AvwJQQBBAToAgAogBEEANgIQIAQgAzYCDCAEIAI2AgggBCABNgIEIAQgADYCAAsIAEEAKAKECgsVAEEAKALcCSgCAEEAKALQCWtBAXULHgEBf0EAKALcCSgCBCIAQQAoAtAJa0EBdUF/IAAbCxUAQQAoAtwJKAIIQQAoAtAJa0EBdQseAQF/QQAoAtwJKAIMIgBBACgC0AlrQQF1QX8gABsLCwBBACgC3AkoAhwLHgEBf0EAKALcCSgCECIAQQAoAtAJa0EBdUF/IAAbCzsBAX8CQEEAKALcCSgCFCIAQQAoAsQJRw0AQX8PCwJAIABBACgCyAlHDQBBfg8LIABBACgC0AlrQQF1CwsAQQAoAtwJLQAYCxUAQQAoAuAJKAIAQQAoAtAJa0EBdQsVAEEAKALgCSgCBEEAKALQCWtBAXULHgEBf0EAKALgCSgCCCIAQQAoAtAJa0EBdUF/IAAbCx4BAX9BACgC4AkoAgwiAEEAKALQCWtBAXVBfyAAGwslAQF/QQBBACgC3AkiAEEkakHUCSAAGygCACIANgLcCSAAQQBHCyUBAX9BAEEAKALgCSIAQRBqQdgJIAAbKAIAIgA2AuAJIABBAEcLCABBAC0AiAoLCABBAC0AgAoLKwEBf0EAQQAoAowKIgBBEGpBACgC3AlBIGogABsoAgAiADYCjAogAEEARwsVAEEAKAKMCigCAEEAKALQCWtBAXULFQBBACgCjAooAgRBACgC0AlrQQF1CxUAQQAoAowKKAIIQQAoAtAJa0EBdQsVAEEAKAKMCigCDEEAKALQCWtBAXULCgBBAEEANgKMCgvdDQEFfyMAQYDQAGsiACQAQQBBAToAiApBAEEAKALMCTYClApBAEEAKALQCUF+aiIBNgKoCkEAIAFBACgC9AlBAXRqIgI2AqwKQQBBADoAgApBAEEAOwGQCkEAQQA7AZIKQQBBADoAmApBAEEANgKECkEAQQA6APAJQQAgAEGAEGo2ApwKQQAgADYCoApBAEEAOgCkCgJAAkACQAJAA0BBACABQQJqIgM2AqgKIAEgAk8NAQJAIAMvAQAiAkF3akEFSQ0AAkACQAJAAkACQCACQZt/ag4FAQgICAIACyACQSBGDQQgAkEvRg0DIAJBO0YNAgwHC0EALwGSCg0BIAMQG0UNASABQQRqQYIIQQoQNQ0BEBxBAC0AiAoNAUEAQQAoAqgKIgE2ApQKDAcLIAMQG0UNACABQQRqQYwIQQoQNQ0AEB0LQQBBACgCqAo2ApQKDAELAkAgAS8BBCIDQSpGDQAgA0EvRw0EEB4MAQtBARAfC0EAKAKsCiECQQAoAqgKIQEMAAsLQQAhAiADIQFBAC0A8AkNAgwBC0EAIAE2AqgKQQBBADoAiAoLA0BBACABQQJqIgM2AqgKAkACQAJAAkACQAJAAkAgAUEAKAKsCk8NACADLwEAIgJBd2pBBUkNBgJAAkACQAJAAkACQAJAAkACQAJAIAJBYGoOChAPBg8PDw8FAQIACwJAAkACQAJAIAJBoH9qDgoLEhIDEgESEhICAAsgAkGFf2oOAwURBgkLQQAvAZIKDRAgAxAbRQ0QIAFBBGpBgghBChA1DRAQHAwQCyADEBtFDQ8gAUEEakGMCEEKEDUNDxAdDA8LIAMQG0UNDiABKQAEQuyAhIOwjsA5Ug0OIAEvAQwiA0F3aiIBQRdLDQxBASABdEGfgIAEcUUNDAwNC0EAQQAvAZIKIgFBAWo7AZIKQQAoApwKIAFBA3RqIgFBATYCACABQQAoApQKNgIEDA0LQQAvAZIKIgNFDQlBACADQX9qIgM7AZIKQQAvAZAKIgJFDQxBACgCnAogA0H//wNxQQN0aigCAEEFRw0MAkAgAkECdEEAKAKgCmpBfGooAgAiAygCBA0AIANBACgClApBAmo2AgQLQQAgAkF/ajsBkAogAyABQQRqNgIMDAwLAkBBACgClAoiAS8BAEEpRw0AQQAoAuQJIgNFDQAgAygCBCABRw0AQQBBACgC6AkiAzYC5AkCQCADRQ0AIANBADYCJAwBC0EAQQA2AtQJC0EAQQAvAZIKIgNBAWo7AZIKQQAoApwKIANBA3RqIgNBBkECQQAtAKQKGzYCACADIAE2AgRBAEEAOgCkCgwLC0EALwGSCiIBRQ0HQQAgAUF/aiIBOwGSCkEAKAKcCiABQf//A3FBA3RqKAIAQQRGDQQMCgtBJxAgDAkLQSIQIAwICyACQS9HDQcCQAJAIAEvAQQiAUEqRg0AIAFBL0cNARAeDAoLQQEQHwwJCwJAAkACQAJAQQAoApQKIgEvAQAiAxAhRQ0AAkACQCADQVVqDgQACQEDCQsgAUF+ai8BAEErRg0DDAgLIAFBfmovAQBBLUYNAgwHCyADQSlHDQFBACgCnApBAC8BkgoiAkEDdGooAgQQIkUNAgwGCyABQX5qLwEAQVBqQf//A3FBCk8NBQtBAC8BkgohAgsCQAJAIAJB//8DcSICRQ0AIANB5gBHDQBBACgCnAogAkF/akEDdGoiBCgCAEEBRw0AIAFBfmovAQBB7wBHDQEgBCgCBEGWCEEDECNFDQEMBQsgA0H9AEcNAEEAKAKcCiACQQN0aiICKAIEECQNBCACKAIAQQZGDQQLIAEQJQ0DIANFDQMgA0EvRkEALQCYCkEAR3ENAwJAQQAoAuwJIgJFDQAgASACKAIASQ0AIAEgAigCBE0NBAsgAUF+aiEBQQAoAtAJIQICQANAIAFBAmoiBCACTQ0BQQAgATYClAogAS8BACEDIAFBfmoiBCEBIAMQJkUNAAsgBEECaiEECwJAIANB//8DcRAnRQ0AIARBfmohAQJAA0AgAUECaiIDIAJNDQFBACABNgKUCiABLwEAIQMgAUF+aiIEIQEgAxAnDQALIARBAmohAwsgAxAoDQQLQQBBAToAmAoMBwtBACgCnApBAC8BkgoiAUEDdCIDakEAKAKUCjYCBEEAIAFBAWo7AZIKQQAoApwKIANqQQM2AgALECkMBQtBAC0A8AlBAC8BkApBAC8BkgpyckUhAgwHCxAqQQBBADoAmAoMAwsQK0EAIQIMBQsgA0GgAUcNAQtBAEEBOgCkCgtBAEEAKAKoCjYClAoLQQAoAqgKIQEMAAsLIABBgNAAaiQAIAILGgACQEEAKALQCSAARw0AQQEPCyAAQX5qECwL/goBBn9BAEEAKAKoCiIAQQxqIgE2AqgKQQAoAuwJIQJBARAvIQMCQAJAAkACQAJAAkACQAJAAkBBACgCqAoiBCABRw0AIAMQLkUNAQsCQAJAAkACQAJAAkACQCADQSpGDQAgA0H7AEcNAUEAIARBAmo2AqgKQQEQLyEDQQAoAqgKIQQDQAJAAkAgA0H//wNxIgNBIkYNACADQSdGDQAgAxAyGkEAKAKoCiEDDAELIAMQIEEAQQAoAqgKQQJqIgM2AqgKC0EBEC8aAkAgBCADEDMiA0EsRw0AQQBBACgCqApBAmo2AqgKQQEQLyEDCyADQf0ARg0DQQAoAqgKIgUgBEYNDyAFIQQgBUEAKAKsCk0NAAwPCwtBACAEQQJqNgKoCkEBEC8aQQAoAqgKIgMgAxAzGgwCC0EAQQA6AIgKAkACQAJAAkACQAJAIANBn39qDgwCCwQBCwMLCwsLCwUACyADQfYARg0EDAoLQQAgBEEOaiIDNgKoCgJAAkACQEEBEC9Bn39qDgYAEgISEgESC0EAKAKoCiIFKQACQvOA5IPgjcAxUg0RIAUvAQoQJ0UNEUEAIAVBCmo2AqgKQQAQLxoLQQAoAqgKIgVBAmpBsghBDhA1DRAgBS8BECICQXdqIgFBF0sNDUEBIAF0QZ+AgARxRQ0NDA4LQQAoAqgKIgUpAAJC7ICEg7COwDlSDQ8gBS8BCiICQXdqIgFBF00NBgwKC0EAIARBCmo2AqgKQQAQLxpBACgCqAohBAtBACAEQRBqNgKoCgJAQQEQLyIEQSpHDQBBAEEAKAKoCkECajYCqApBARAvIQQLQQAoAqgKIQMgBBAyGiADQQAoAqgKIgQgAyAEEAJBAEEAKAKoCkF+ajYCqAoPCwJAIAQpAAJC7ICEg7COwDlSDQAgBC8BChAmRQ0AQQAgBEEKajYCqApBARAvIQRBACgCqAohAyAEEDIaIANBACgCqAoiBCADIAQQAkEAQQAoAqgKQX5qNgKoCg8LQQAgBEEEaiIENgKoCgtBACAEQQZqNgKoCkEAQQA6AIgKQQEQLyEEQQAoAqgKIQMgBBAyIQRBACgCqAohAiAEQd//A3EiAUHbAEcNA0EAIAJBAmo2AqgKQQEQLyEFQQAoAqgKIQNBACEEDAQLQQBBAToAgApBAEEAKAKoCkECajYCqAoLQQEQLyEEQQAoAqgKIQMCQCAEQeYARw0AIANBAmpBrAhBBhA1DQBBACADQQhqNgKoCiAAQQEQL0EAEDEgAkEQakHYCSACGyEDA0AgAygCACIDRQ0FIANCADcCCCADQRBqIQMMAAsLQQAgA0F+ajYCqAoMAwtBASABdEGfgIAEcUUNAwwEC0EBIQQLA0ACQAJAIAQOAgABAQsgBUH//wNxEDIaQQEhBAwBCwJAAkBBACgCqAoiBCADRg0AIAMgBCADIAQQAkEBEC8hBAJAIAFB2wBHDQAgBEEgckH9AEYNBAtBACgCqAohAwJAIARBLEcNAEEAIANBAmo2AqgKQQEQLyEFQQAoAqgKIQMgBUEgckH7AEcNAgtBACADQX5qNgKoCgsgAUHbAEcNAkEAIAJBfmo2AqgKDwtBACEEDAALCw8LIAJBoAFGDQAgAkH7AEcNBAtBACAFQQpqNgKoCkEBEC8iBUH7AEYNAwwCCwJAIAJBWGoOAwEDAQALIAJBoAFHDQILQQAgBUEQajYCqAoCQEEBEC8iBUEqRw0AQQBBACgCqApBAmo2AqgKQQEQLyEFCyAFQShGDQELQQAoAqgKIQEgBRAyGkEAKAKoCiIFIAFNDQAgBCADIAEgBRACQQBBACgCqApBfmo2AqgKDwsgBCADQQBBABACQQAgBEEMajYCqAoPCxArC4UMAQp/QQBBACgCqAoiAEEMaiIBNgKoCkEBEC8hAkEAKAKoCiEDAkACQAJAAkACQAJAAkACQCACQS5HDQBBACADQQJqNgKoCgJAQQEQLyICQeQARg0AAkAgAkHzAEYNACACQe0ARw0HQQAoAqgKIgJBAmpBnAhBBhA1DQcCQEEAKAKUCiIDEDANACADLwEAQS5GDQgLIAAgACACQQhqQQAoAsgJEAEPC0EAKAKoCiICQQJqQaIIQQoQNQ0GAkBBACgClAoiAxAwDQAgAy8BAEEuRg0HC0EAIQRBACACQQxqNgKoCkEBIQVBBSEGQQEQLyECQQAhB0EBIQgMAgtBACgCqAoiAikAAkLlgJiD0IyAOVINBQJAQQAoApQKIgMQMA0AIAMvAQBBLkYNBgtBACEEQQAgAkEKajYCqApBAiEIQQchBkEBIQdBARAvIQJBASEFDAELAkACQAJAAkAgAkHzAEcNACADIAFNDQAgA0ECakGiCEEKEDUNAAJAIAMvAQwiBEF3aiIHQRdLDQBBASAHdEGfgIAEcQ0CCyAEQaABRg0BC0EAIQdBByEGQQEhBCACQeQARg0BDAILQQAhBEEAIANBDGoiAjYCqApBASEFQQEQLyEJAkBBACgCqAoiBiACRg0AQeYAIQICQCAJQeYARg0AQQUhBkEAIQdBASEIIAkhAgwEC0EAIQdBASEIIAZBAmpBrAhBBhA1DQQgBi8BCBAmRQ0EC0EAIQdBACADNgKoCkEHIQZBASEEQQAhBUEAIQggCSECDAILIAMgAEEKak0NAEEAIQhB5AAhAgJAIAMpAAJC5YCYg9CMgDlSDQACQAJAIAMvAQoiBEF3aiIHQRdLDQBBASAHdEGfgIAEcQ0BC0EAIQggBEGgAUcNAQtBACEFQQAgA0EKajYCqApBKiECQQEhB0ECIQhBARAvIglBKkYNBEEAIAM2AqgKQQEhBEEAIQdBACEIIAkhAgwCCyADIQZBACEHDAILQQAhBUEAIQgLAkAgAkEoRw0AQQAoApwKQQAvAZIKIgJBA3RqIgNBACgCqAo2AgRBACACQQFqOwGSCiADQQU2AgBBACgClAovAQBBLkYNBEEAQQAoAqgKIgNBAmo2AqgKQQEQLyECIABBACgCqApBACADEAECQAJAIAUNAEEAKALkCSEBDAELQQAoAuQJIgEgBjYCHAtBAEEALwGQCiIDQQFqOwGQCkEAKAKgCiADQQJ0aiABNgIAAkAgAkEiRg0AIAJBJ0YNAEEAQQAoAqgKQX5qNgKoCg8LIAIQIEEAQQAoAqgKQQJqIgI2AqgKAkACQAJAQQEQL0FXag4EAQICAAILQQBBACgCqApBAmo2AqgKQQEQLxpBACgC5AkiAyACNgIEIANBAToAGCADQQAoAqgKIgI2AhBBACACQX5qNgKoCg8LQQAoAuQJIgMgAjYCBCADQQE6ABhBAEEALwGSCkF/ajsBkgogA0EAKAKoCkECajYCDEEAQQAvAZAKQX9qOwGQCg8LQQBBACgCqApBfmo2AqgKDwsCQCAEQQFzIAJB+wBHcg0AQQAoAqgKIQJBAC8BkgoNBQNAAkACQAJAIAJBACgCrApPDQBBARAvIgJBIkYNASACQSdGDQEgAkH9AEcNAkEAQQAoAqgKQQJqNgKoCgtBARAvIQNBACgCqAohAgJAIANB5gBHDQAgAkECakGsCEEGEDUNBwtBACACQQhqNgKoCgJAQQEQLyICQSJGDQAgAkEnRw0HCyAAIAJBABAxDwsgAhAgC0EAQQAoAqgKQQJqIgI2AqgKDAALCwJAAkAgAkFZag4EAwEBAwALIAJBIkYNAgtBACgCqAohBgsgBiABRw0AQQAgAEEKajYCqAoPCyACQSpHIAdxDQNBAC8BkgpB//8DcQ0DQQAoAqgKIQJBACgCrAohAQNAIAIgAU8NAQJAAkAgAi8BACIDQSdGDQAgA0EiRw0BCyAAIAMgCBAxDwtBACACQQJqIgI2AqgKDAALCxArCw8LQQAgAkF+ajYCqAoPC0EAQQAoAqgKQX5qNgKoCgtHAQN/QQAoAqgKQQJqIQBBACgCrAohAQJAA0AgACICQX5qIAFPDQEgAkECaiEAIAIvAQBBdmoOBAEAAAEACwtBACACNgKoCguYAQEDf0EAQQAoAqgKIgFBAmo2AqgKIAFBBmohAUEAKAKsCiECA0ACQAJAAkAgAUF8aiACTw0AIAFBfmovAQAhAwJAAkAgAA0AIANBKkYNASADQXZqDgQCBAQCBAsgA0EqRw0DCyABLwEAQS9HDQJBACABQX5qNgKoCgwBCyABQX5qIQELQQAgATYCqAoPCyABQQJqIQEMAAsLiAEBBH9BACgCqAohAUEAKAKsCiECAkACQANAIAEiA0ECaiEBIAMgAk8NASABLwEAIgQgAEYNAgJAIARB3ABGDQAgBEF2ag4EAgEBAgELIANBBGohASADLwEEQQ1HDQAgA0EGaiABIAMvAQZBCkYbIQEMAAsLQQAgATYCqAoQKw8LQQAgATYCqAoLbAEBfwJAAkAgAEFfaiIBQQVLDQBBASABdEExcQ0BCyAAQUZqQf//A3FBBkkNACAAQSlHIABBWGpB//8DcUEHSXENAAJAIABBpX9qDgQBAAABAAsgAEH9AEcgAEGFf2pB//8DcUEESXEPC0EBCy4BAX9BASEBAkAgAEGcCUEFECMNACAAQZYIQQMQIw0AIABBpglBAhAjIQELIAELRgEDf0EAIQMCQCAAIAJBAXQiAmsiBEECaiIAQQAoAtAJIgVJDQAgACABIAIQNQ0AAkAgACAFRw0AQQEPCyAEECwhAwsgAwuDAQECf0EBIQECQAJAAkACQAJAAkAgAC8BACICQUVqDgQFBAQBAAsCQCACQZt/ag4EAwQEAgALIAJBKUYNBCACQfkARw0DIABBfmpBsglBBhAjDwsgAEF+ai8BAEE9Rg8LIABBfmpBqglBBBAjDwsgAEF+akG+CUEDECMPC0EAIQELIAELtAMBAn9BACEBAkACQAJAAkACQAJAAkACQAJAAkAgAC8BAEGcf2oOFAABAgkJCQkDCQkEBQkJBgkHCQkICQsCQAJAIABBfmovAQBBl39qDgQACgoBCgsgAEF8akHACEECECMPCyAAQXxqQcQIQQMQIw8LAkACQAJAIABBfmovAQBBjX9qDgMAAQIKCwJAIABBfGovAQAiAkHhAEYNACACQewARw0KIABBempB5QAQLQ8LIABBempB4wAQLQ8LIABBfGpByghBBBAjDwsgAEF8akHSCEEGECMPCyAAQX5qLwEAQe8ARw0GIABBfGovAQBB5QBHDQYCQCAAQXpqLwEAIgJB8ABGDQAgAkHjAEcNByAAQXhqQd4IQQYQIw8LIABBeGpB6ghBAhAjDwsgAEF+akHuCEEEECMPC0EBIQEgAEF+aiIAQekAEC0NBCAAQfYIQQUQIw8LIABBfmpB5AAQLQ8LIABBfmpBgAlBBxAjDwsgAEF+akGOCUEEECMPCwJAIABBfmovAQAiAkHvAEYNACACQeUARw0BIABBfGpB7gAQLQ8LIABBfGpBlglBAxAjIQELIAELNAEBf0EBIQECQCAAQXdqQf//A3FBBUkNACAAQYABckGgAUYNACAAQS5HIAAQLnEhAQsgAQswAQF/AkACQCAAQXdqIgFBF0sNAEEBIAF0QY2AgARxDQELIABBoAFGDQBBAA8LQQELTgECf0EAIQECQAJAIAAvAQAiAkHlAEYNACACQesARw0BIABBfmpB7ghBBBAjDwsgAEF+ai8BAEH1AEcNACAAQXxqQdIIQQYQIyEBCyABC94BAQR/QQAoAqgKIQBBACgCrAohAQJAAkACQANAIAAiAkECaiEAIAIgAU8NAQJAAkACQCAALwEAIgNBpH9qDgUCAwMDAQALIANBJEcNAiACLwEEQfsARw0CQQAgAkEEaiIANgKoCkEAQQAvAZIKIgJBAWo7AZIKQQAoApwKIAJBA3RqIgJBBDYCACACIAA2AgQPC0EAIAA2AqgKQQBBAC8BkgpBf2oiADsBkgpBACgCnAogAEH//wNxQQN0aigCAEEDRw0DDAQLIAJBBGohAAwACwtBACAANgKoCgsQKwsLcAECfwJAAkADQEEAQQAoAqgKIgBBAmoiATYCqAogAEEAKAKsCk8NAQJAAkACQCABLwEAIgFBpX9qDgIBAgALAkAgAUF2ag4EBAMDBAALIAFBL0cNAgwECxA0GgwBC0EAIABBBGo2AqgKDAALCxArCws1AQF/QQBBAToA8AlBACgCqAohAEEAQQAoAqwKQQJqNgKoCkEAIABBACgC0AlrQQF1NgKECgtDAQJ/QQEhAQJAIAAvAQAiAkF3akH//wNxQQVJDQAgAkGAAXJBoAFGDQBBACEBIAIQLkUNACACQS5HIAAQMHIPCyABCz0BAn9BACECAkBBACgC0AkiAyAASw0AIAAvAQAgAUcNAAJAIAMgAEcNAEEBDwsgAEF+ai8BABAmIQILIAILaAECf0EBIQECQAJAIABBX2oiAkEFSw0AQQEgAnRBMXENAQsgAEH4/wNxQShGDQAgAEFGakH//wNxQQZJDQACQCAAQaV/aiICQQNLDQAgAkEBRw0BCyAAQYV/akH//wNxQQRJIQELIAELnAEBA39BACgCqAohAQJAA0ACQAJAIAEvAQAiAkEvRw0AAkAgAS8BAiIBQSpGDQAgAUEvRw0EEB4MAgsgABAfDAELAkACQCAARQ0AIAJBd2oiAUEXSw0BQQEgAXRBn4CABHFFDQEMAgsgAhAnRQ0DDAELIAJBoAFHDQILQQBBACgCqAoiA0ECaiIBNgKoCiADQQAoAqwKSQ0ACwsgAgsxAQF/QQAhAQJAIAAvAQBBLkcNACAAQX5qLwEAQS5HDQAgAEF8ai8BAEEuRiEBCyABC9sEAQV/AkAgAUEiRg0AIAFBJ0YNABArDwtBACgCqAohAyABECAgACADQQJqQQAoAqgKQQAoAsQJEAECQCACQQFIDQBBACgC5AlBBEEGIAJBAUYbNgIcC0EAQQAoAqgKQQJqNgKoCkEAEC8hAkEAKAKoCiEBAkACQCACQfcARw0AIAEvAQJB6QBHDQAgAS8BBEH0AEcNACABLwEGQegARg0BC0EAIAFBfmo2AqgKDwtBACABQQhqNgKoCgJAQQEQL0H7AEYNAEEAIAE2AqgKDwtBACgCqAoiBCEDQQAhAANAQQAgA0ECajYCqAoCQAJAAkACQEEBEC8iAkEnRw0AQQAoAqgKIQVBJxAgQQAoAqgKQQJqIQMMAQtBACgCqAohBSACQSJHDQFBIhAgQQAoAqgKQQJqIQMLQQAgAzYCqApBARAvIQIMAQsgAhAyIQJBACgCqAohAwsCQCACQTpGDQBBACABNgKoCg8LQQBBACgCqApBAmo2AqgKAkBBARAvIgJBIkYNACACQSdGDQBBACABNgKoCg8LQQAoAqgKIQYgAhAgQQBBACgC/AkiAkEUajYC/AlBACgCqAohByACIAU2AgAgAkEANgIQIAIgBjYCCCACIAM2AgQgAiAHQQJqNgIMQQBBACgCqApBAmo2AqgKIABBEGpBACgC5AlBIGogABsgAjYCAAJAAkBBARAvIgBBLEYNACAAQf0ARg0BQQAgATYCqAoPC0EAQQAoAqgKQQJqIgM2AqgKIAIhAAwBCwtBACgC5AkiASAENgIQIAFBACgCqApBAmo2AgwLbQECfwJAAkADQAJAIABB//8DcSIBQXdqIgJBF0sNAEEBIAJ0QZ+AgARxDQILIAFBoAFGDQEgACECIAEQLg0CQQAhAkEAQQAoAqgKIgBBAmo2AqgKIAAvAQIiAA0ADAILCyAAIQILIAJB//8DcQurAQEEfwJAAkBBACgCqAoiAi8BACIDQeEARg0AIAEhBCAAIQUMAQtBACACQQRqNgKoCkEBEC8hAkEAKAKoCiEFAkACQCACQSJGDQAgAkEnRg0AIAIQMhpBACgCqAohBAwBCyACECBBAEEAKAKoCkECaiIENgKoCgtBARAvIQNBACgCqAohAgsCQCACIAVGDQAgBSAEQQAgACAAIAFGIgIbQQAgASACGxACCyADC3IBBH9BACgCqAohAEEAKAKsCiEBAkACQANAIABBAmohAiAAIAFPDQECQAJAIAIvAQAiA0Gkf2oOAgEEAAsgAiEAIANBdmoOBAIBAQIBCyAAQQRqIQAMAAsLQQAgAjYCqAoQK0EADwtBACACNgKoCkHdAAtJAQN/QQAhAwJAIAJFDQACQANAIAAtAAAiBCABLQAAIgVHDQEgAUEBaiEBIABBAWohACACQX9qIgINAAwCCwsgBCAFayEDCyADCwviAQIAQYAIC8QBAAB4AHAAbwByAHQAbQBwAG8AcgB0AGYAbwByAGUAdABhAG8AdQByAGMAZQByAG8AbQB1AG4AYwB0AGkAbwBuAHYAbwB5AGkAZQBkAGUAbABlAGMAbwBuAHQAaQBuAGkAbgBzAHQAYQBuAHQAeQBiAHIAZQBhAHIAZQB0AHUAcgBkAGUAYgB1AGcAZwBlAGEAdwBhAGkAdABoAHIAdwBoAGkAbABlAGkAZgBjAGEAdABjAGYAaQBuAGEAbABsAGUAbABzAABBxAkLEAEAAAACAAAAAAQAADA5AAA="),
    "undefined" != typeof Buffer
      ? Buffer.from(A, "base64")
      : Uint8Array.from(atob(A), (A) => A.charCodeAt(0))
  );
  var A;
};
WebAssembly.compile(E())
  .then(WebAssembly.instantiate)
  .then(({ exports: A }) => {});
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/actions/utils.js
function hasActionPayload(locals) {
  return "_actionPayload" in locals;
}
function createGetActionResult(locals) {
  return (actionFn) => {
    if (
      !hasActionPayload(locals) ||
      actionFn.toString() !== getActionQueryString(locals._actionPayload.actionName)
    )
      return;
    return deserializeActionResult(locals._actionPayload.actionResult);
  };
}
function createCallAction(context) {
  return (baseAction, input) => {
    Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
    return baseAction.bind(context)(input);
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/i18n/utils.js
function parseLocale(header) {
  if (header === "*")
    return [
      {
        locale: header,
        qualityValue: void 0,
      },
    ];
  const result = [];
  const localeValues = header.split(",").map((str) => str.trim());
  for (const localeValue of localeValues) {
    const split = localeValue.split(";").map((str) => str.trim());
    const localeName = split[0];
    const qualityValue = split[1];
    if (!split) continue;
    if (qualityValue && qualityValue.startsWith("q=")) {
      const qualityValueAsFloat = Number.parseFloat(qualityValue.slice(2));
      if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1)
        result.push({
          locale: localeName,
          qualityValue: void 0,
        });
      else
        result.push({
          locale: localeName,
          qualityValue: qualityValueAsFloat,
        });
    } else
      result.push({
        locale: localeName,
        qualityValue: void 0,
      });
  }
  return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
  const normalizedLocales = getAllCodes(locales).map(normalizeTheLocale);
  return browserLocaleList
    .filter((browserLocale) => {
      if (browserLocale.locale !== "*")
        return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
      return true;
    })
    .toSorted((a, b) => {
      if (a.qualityValue && b.qualityValue) return Math.sign(b.qualityValue - a.qualityValue);
      return 0;
    });
}
function computePreferredLocale(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = void 0;
  if (acceptHeader) {
    const firstResult = sortAndFilterLocales(parseLocale(acceptHeader), locales).at(0);
    if (firstResult && firstResult.locale !== "*") {
      for (const currentLocale of locales)
        if (typeof currentLocale === "string") {
          if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
            result = currentLocale;
            break;
          }
        } else
          for (const currentCode of currentLocale.codes)
            if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
              result = currentCode;
              break;
            }
    }
  }
  return result;
}
function computePreferredLocaleList(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  const result = [];
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    if (browserLocaleList.length === 1 && browserLocaleList.at(0).locale === "*")
      return getAllCodes(locales);
    else if (browserLocaleList.length > 0) {
      for (const browserLocale of browserLocaleList)
        for (const loopLocale of locales)
          if (typeof loopLocale === "string") {
            if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale))
              result.push(loopLocale);
          } else
            for (const code of loopLocale.codes)
              if (code === browserLocale.locale) result.push(code);
    }
  }
  return result;
}
function computeCurrentLocale(pathname, locales, defaultLocale) {
  for (const segment of pathname.split("/").map(normalizeThePath))
    for (const locale of locales)
      if (typeof locale === "string") {
        if (!segment.includes(locale)) continue;
        if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) return locale;
      } else if (locale.path === segment) return locale.codes.at(0);
      else
        for (const code of locale.codes)
          if (normalizeTheLocale(code) === normalizeTheLocale(segment)) return code;
  for (const locale of locales)
    if (typeof locale === "string") {
      if (locale === defaultLocale) return locale;
    } else if (locale.path === defaultLocale) return locale.codes.at(0);
}
function computeCurrentLocaleFromParams(params, locales) {
  const byNormalizedCode = /* @__PURE__ */ new Map();
  const byPath = /* @__PURE__ */ new Map();
  for (const locale of locales)
    if (typeof locale === "string") byNormalizedCode.set(normalizeTheLocale(locale), locale);
    else {
      byPath.set(locale.path, locale.codes[0]);
      for (const code of locale.codes) byNormalizedCode.set(normalizeTheLocale(code), code);
    }
  for (const value of Object.values(params)) {
    if (!value) continue;
    const pathMatch = byPath.get(value);
    if (pathMatch) return pathMatch;
    const codeMatch = byNormalizedCode.get(normalizeTheLocale(value));
    if (codeMatch) return codeMatch;
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/csp/runtime.js
function deduplicateDirectiveValues(existingDirective, newDirective) {
  const [directiveName, ...existingValues] = existingDirective.split(/\s+/).filter(Boolean);
  const [newDirectiveName, ...newValues] = newDirective.split(/\s+/).filter(Boolean);
  if (directiveName !== newDirectiveName) return;
  return `${directiveName} ${Array.from(/* @__PURE__ */ new Set([...existingValues, ...newValues])).join(" ")}`;
}
function pushDirective(directives, newDirective) {
  let deduplicated = false;
  if (directives.length === 0) return [newDirective];
  const finalDirectives = [];
  for (const directive of directives) {
    if (deduplicated) {
      finalDirectives.push(directive);
      continue;
    }
    const result = deduplicateDirectiveValues(directive, newDirective);
    if (result) {
      finalDirectives.push(result);
      deduplicated = true;
    } else {
      finalDirectives.push(directive);
      finalDirectives.push(newDirective);
    }
  }
  return finalDirectives;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/middleware/callMiddleware.js
async function callMiddleware(onRequest, apiContext, responseFunction) {
  let nextCalled = false;
  let responseFunctionPromise = void 0;
  const next = async (payload) => {
    nextCalled = true;
    responseFunctionPromise = responseFunction(apiContext, payload);
    return responseFunctionPromise;
  };
  const middlewarePromise = onRequest(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (nextCalled)
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) throw new AstroError(MiddlewareNotAResponse);
        return value;
      } else if (responseFunctionPromise) return responseFunctionPromise;
      else throw new AstroError(MiddlewareNotAResponse);
    else if (typeof value === "undefined") throw new AstroError(MiddlewareNoDataOrNextCalled);
    else if (value instanceof Response === false) throw new AstroError(MiddlewareNotAResponse);
    else return value;
  });
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/cache/runtime/noop.js
const EMPTY_OPTIONS = Object.freeze({ tags: [] });
const NoopAstroCache = class {
  enabled = false;
  set() {}
  get tags() {
    return [];
  }
  get options() {
    return EMPTY_OPTIONS;
  }
  async invalidate() {}
};
let hasWarned = false;
const DisabledAstroCache = class {
  enabled = false;
  #logger;
  constructor(logger) {
    this.#logger = logger;
  }
  #warn() {
    if (!hasWarned) {
      hasWarned = true;
      this.#logger?.warn(
        "cache",
        "`cache.set()` was called but caching is not enabled. Configure a cache provider in your Astro config under `experimental.cache` to enable caching.",
      );
    }
  }
  set() {
    this.#warn();
  }
  get tags() {
    return [];
  }
  get options() {
    return EMPTY_OPTIONS;
  }
  async invalidate() {
    throw new AstroError(CacheNotEnabled);
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/redirects/render.js
function isExternalURL(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}
function redirectIsExternal(redirect) {
  if (typeof redirect === "string") return isExternalURL(redirect);
  else return isExternalURL(redirect.destination);
}
function computeRedirectStatus(method, redirect, redirectRoute) {
  return redirectRoute && typeof redirect === "object"
    ? redirect.status
    : method === "GET"
      ? 301
      : 308;
}
function resolveRedirectTarget(params, redirect, redirectRoute, trailingSlash) {
  if (typeof redirectRoute !== "undefined")
    return (
      getRouteGenerator(redirectRoute.segments, trailingSlash)(params) ||
      redirectRoute?.pathname ||
      "/"
    );
  else if (typeof redirect === "string")
    if (redirectIsExternal(redirect)) return redirect;
    else {
      let target = redirect;
      for (const param of Object.keys(params)) {
        const paramValue = params[param];
        target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
      }
      return target;
    }
  else if (typeof redirect === "undefined") return "/";
  return redirect.destination;
}
async function renderRedirect(renderContext) {
  const {
    request: { method },
    routeData,
  } = renderContext;
  const { redirect, redirectRoute } = routeData;
  const status = computeRedirectStatus(method, redirect, redirectRoute);
  const headers = {
    location: encodeURI(
      resolveRedirectTarget(
        renderContext.params,
        redirect,
        redirectRoute,
        renderContext.pipeline.manifest.trailingSlash,
      ),
    ),
  };
  if (redirect && redirectIsExternal(redirect))
    if (typeof redirect === "string") return Response.redirect(redirect, status);
    else return Response.redirect(redirect.destination, status);
  return new Response(null, {
    status,
    headers,
  });
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/match.js
function matchRoute(pathname, manifest) {
  if (isRoute404(pathname)) {
    const errorRoute = manifest.routes.find((route) => isRoute404(route.route));
    if (errorRoute) return errorRoute;
  }
  if (isRoute500(pathname)) {
    const errorRoute = manifest.routes.find((route) => isRoute500(route.route));
    if (errorRoute) return errorRoute;
  }
  return manifest.routes.find((route) => {
    return (
      route.pattern.test(pathname) ||
      route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname))
    );
  });
}
function isRoute404or500(route) {
  return isRoute404(route.route) || isRoute500(route.route);
}
function isRouteServerIsland(route) {
  return route.component === SERVER_ISLAND_COMPONENT;
}
function isRouteExternalRedirect(route) {
  return !!(route.type === "redirect" && route.redirect && redirectIsExternal(route.redirect));
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/cache/runtime/utils.js
function defaultSetHeaders(options) {
  const headers = new Headers();
  const directives = [];
  if (options.maxAge !== void 0) directives.push(`max-age=${options.maxAge}`);
  if (options.swr !== void 0) directives.push(`stale-while-revalidate=${options.swr}`);
  if (directives.length > 0) headers.set("CDN-Cache-Control", directives.join(", "));
  if (options.tags && options.tags.length > 0) headers.set("Cache-Tag", options.tags.join(", "));
  if (options.lastModified) headers.set("Last-Modified", options.lastModified.toUTCString());
  if (options.etag) headers.set("ETag", options.etag);
  return headers;
}
function isLiveDataEntry(value) {
  return (
    value != null &&
    typeof value === "object" &&
    "id" in value &&
    "data" in value &&
    "cacheHint" in value
  );
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/cache/runtime/cache.js
const APPLY_HEADERS = /* @__PURE__ */ Symbol.for("astro:cache:apply");
const IS_ACTIVE = /* @__PURE__ */ Symbol.for("astro:cache:active");
const AstroCache = class {
  #options = {};
  #tags = /* @__PURE__ */ new Set();
  #disabled = false;
  #provider;
  enabled = true;
  constructor(provider) {
    this.#provider = provider;
  }
  set(input) {
    if (input === false) {
      this.#disabled = true;
      this.#tags.clear();
      this.#options = {};
      return;
    }
    this.#disabled = false;
    let options;
    if (isLiveDataEntry(input)) {
      if (!input.cacheHint) return;
      options = input.cacheHint;
    } else options = input;
    if ("maxAge" in options && options.maxAge !== void 0) this.#options.maxAge = options.maxAge;
    if ("swr" in options && options.swr !== void 0) this.#options.swr = options.swr;
    if ("etag" in options && options.etag !== void 0) this.#options.etag = options.etag;
    if (options.lastModified !== void 0) {
      if (!this.#options.lastModified || options.lastModified > this.#options.lastModified)
        this.#options.lastModified = options.lastModified;
    }
    if (options.tags) for (const tag of options.tags) this.#tags.add(tag);
  }
  get tags() {
    return [...this.#tags];
  }
  /**
   * Get the current cache options (read-only snapshot).
   * Includes all accumulated options: maxAge, swr, tags, etag, lastModified.
   */
  get options() {
    return {
      ...this.#options,
      tags: this.tags,
    };
  }
  async invalidate(input) {
    if (!this.#provider) throw new AstroError(CacheNotEnabled);
    let options;
    if (isLiveDataEntry(input)) options = { tags: input.cacheHint?.tags ?? [] };
    else options = input;
    return this.#provider.invalidate(options);
  }
  /** @internal */
  [APPLY_HEADERS](response) {
    if (this.#disabled) return;
    const finalOptions = {
      ...this.#options,
      tags: this.tags,
    };
    if (finalOptions.maxAge === void 0 && !finalOptions.tags?.length) return;
    const headers = this.#provider?.setHeaders?.(finalOptions) ?? defaultSetHeaders(finalOptions);
    for (const [key, value] of headers) response.headers.set(key, value);
  }
  /** @internal */
  get [IS_ACTIVE]() {
    return !this.#disabled && (this.#options.maxAge !== void 0 || this.#tags.size > 0);
  }
};
function applyCacheHeaders(cache, response) {
  if (APPLY_HEADERS in cache) cache[APPLY_HEADERS](response);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/parts.js
const ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
const ROUTE_SPREAD = /^\.{3}.+$/;
function getParts(part, file) {
  const result = [];
  part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
    if (!str) return;
    const dynamic = i % 2 === 1;
    const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];
    if (!content || (dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content)))
      throw new Error(`Invalid route ${file} \u2014 parameter name must match /^[a-zA-Z0-9_$]+$/`);
    result.push({
      content,
      dynamic,
      spread: dynamic && ROUTE_SPREAD.test(content),
    });
  });
  return result;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/priority.js
function routeComparator(a, b) {
  const commonLength = Math.min(a.segments.length, b.segments.length);
  for (let index = 0; index < commonLength; index++) {
    const aSegment = a.segments[index];
    const bSegment = b.segments[index];
    const aIsStatic = aSegment.every((part) => !part.dynamic && !part.spread);
    const bIsStatic = bSegment.every((part) => !part.dynamic && !part.spread);
    if (aIsStatic && bIsStatic) {
      const aContent = aSegment.map((part) => part.content).join("");
      const bContent = bSegment.map((part) => part.content).join("");
      if (aContent !== bContent) return aContent.localeCompare(bContent);
    }
    if (aIsStatic !== bIsStatic) return aIsStatic ? -1 : 1;
    const aAllDynamic = aSegment.every((part) => part.dynamic);
    if (aAllDynamic !== bSegment.every((part) => part.dynamic)) return aAllDynamic ? 1 : -1;
    const aHasSpread = aSegment.some((part) => part.spread);
    if (aHasSpread !== bSegment.some((part) => part.spread)) return aHasSpread ? 1 : -1;
  }
  const aLength = a.segments.length;
  const bLength = b.segments.length;
  if (aLength !== bLength) {
    const aEndsInRest = a.segments.at(-1)?.some((part) => part.spread);
    const bEndsInRest = b.segments.at(-1)?.some((part) => part.spread);
    if (aEndsInRest !== bEndsInRest && Math.abs(aLength - bLength) === 1) {
      if (aLength > bLength && aEndsInRest) return 1;
      if (bLength > aLength && bEndsInRest) return -1;
    }
    return aLength > bLength ? -1 : 1;
  }
  if ((a.type === "endpoint") !== (b.type === "endpoint")) return a.type === "endpoint" ? -1 : 1;
  return a.route.localeCompare(b.route);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/cache/runtime/route-matching.js
function compileCacheRoutes(routes, base, trailingSlash) {
  const compiled = Object.entries(routes).map(([path, options]) => {
    const segments = removeLeadingForwardSlash(path)
      .split("/")
      .filter(Boolean)
      .map((s) => getParts(s, path));
    return {
      pattern: getPattern(segments, base, trailingSlash),
      options,
      segments,
      route: path,
    };
  });
  compiled.sort((a, b) =>
    routeComparator(
      {
        segments: a.segments,
        route: a.route,
        type: "page",
      },
      {
        segments: b.segments,
        route: b.route,
        type: "page",
      },
    ),
  );
  return compiled;
}
function matchCacheRoute(pathname, compiledRoutes) {
  for (const route of compiledRoutes) if (route.pattern.test(pathname)) return route.options;
  return null;
}
//#endregion
//#region ../../node_modules/.bun/destr@2.0.5/node_modules/destr/dist/index.mjs
const suspectProtoRx =
  /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx =
  /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (
    key === "__proto__" ||
    (key === "constructor" && value && typeof value === "object" && "prototype" in value)
  ) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") return value;
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1)
    return value.slice(1, -1);
  const _value = value.trim();
  if (_value.length <= 9)
    switch (_value.toLowerCase()) {
      case "true":
        return true;
      case "false":
        return false;
      case "undefined":
        return;
      case "null":
        return null;
      case "nan":
        return NaN;
      case "infinity":
        return Number.POSITIVE_INFINITY;
      case "-infinity":
        return Number.NEGATIVE_INFINITY;
    }
  if (!JsonSigRx.test(value)) {
    if (options.strict) throw new SyntaxError("[destr] Invalid JSON");
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) throw new Error("[destr] Possible prototype pollution");
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) throw error;
    return value;
  }
}
//#endregion
//#region ../../node_modules/.bun/unstorage@1.17.5+b14ae147aab4d897/node_modules/unstorage/dist/shared/unstorage.zVDD2mZo.mjs
function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") return Promise.resolve(value);
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || (type !== "object" && type !== "function");
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify$1(value) {
  if (isPrimitive(value)) return String(value);
  if (isPureObject(value) || Array.isArray(value)) return JSON.stringify(value);
  if (typeof value.toJSON === "function") return stringify$1(value.toJSON());
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") return value;
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") return value;
  if (!value.startsWith(BASE64_PREFIX)) return value;
  return base64Decode(value.slice(7));
}
function base64Decode(input) {
  if (globalThis.Buffer) return Buffer.from(input, "base64");
  return Uint8Array.from(globalThis.atob(input), (c) => c.codePointAt(0));
}
function base64Encode(input) {
  if (globalThis.Buffer) return Buffer.from(input).toString("base64");
  return globalThis.btoa(String.fromCodePoint(...input));
}
function normalizeKey(key) {
  if (!key) return "";
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) return true;
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) return key.startsWith(base) && key[key.length - 1] !== "$";
  return key[key.length - 1] !== "$";
}
//#endregion
//#region ../../node_modules/.bun/unstorage@1.17.5+b14ae147aab4d897/node_modules/unstorage/dist/index.mjs
function defineDriver(factory) {
  return factory;
}
const DRIVER_NAME = "memory";
const memory = defineDriver(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    },
  };
});
function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {},
  };
  const getMount = (key) => {
    for (const base of context.mountpoints)
      if (key.startsWith(base))
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base],
        };
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""],
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints
      .filter(
        (mountpoint) =>
          mountpoint.startsWith(base) || (includeParent && base.startsWith(mountpoint)),
      )
      .map((mountpoint) => ({
        relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
        mountpoint,
        driver: context.mounts[mountpoint],
      }));
  };
  const onChange = (event, key) => {
    if (!context.watching) return;
    key = normalizeKey(key);
    for (const listener of context.watchListeners) listener(event, key);
  };
  const startWatch = async () => {
    if (context.watching) return;
    context.watching = true;
    for (const mountpoint in context.mounts)
      context.unwatch[mountpoint] = await watch(context.mounts[mountpoint], onChange, mountpoint);
  };
  const stopWatch = async () => {
    if (!context.watching) return;
    for (const mountpoint in context.unwatch) await context.unwatch[mountpoint]();
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: [],
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 =
        isStringItem || !item.options
          ? commonOptions
          : {
              ...commonOptions,
              ...item.options,
            };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2,
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then((r) => r.flat());
  };
  const storage = {
    hasItem(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then((value) => destr(value));
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems)
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options,
            })),
            commonOptions,
          ).then((r) =>
            r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value),
            })),
          );
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(batch.driver.getItem, item.relativeKey, item.options).then(
              (value) => ({
                key: item.key,
                value: destr(value),
              }),
            );
          }),
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) return asyncCall(driver.getItemRaw, relativeKey, opts);
      return asyncCall(driver.getItem, relativeKey, opts).then((value) => deserializeRaw(value));
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) return storage.removeItem(key);
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) return;
      await asyncCall(driver.setItem, relativeKey, stringify$1(value), opts);
      if (!driver.watch) onChange("update", key);
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems)
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify$1(item.value),
              options: item.options,
            })),
            commonOptions,
          );
        if (!batch.driver.setItem) return;
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify$1(item.value),
              item.options,
            );
          }),
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) return storage.removeItem(key, opts);
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      else if (driver.setItem)
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      else return;
      if (!driver.watch) onChange("update", key);
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") opts = { removeMeta: opts };
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) return;
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata)
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      if (!driver.watch) onChange("remove", key);
    },
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") opts = { nativeOnly: opts };
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      if (!opts.nativeOnly) {
        const value = await asyncCall(driver.getItem, relativeKey + "$", opts).then((value_) =>
          destr(value_),
        );
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") value.atime = new Date(value.atime);
          if (typeof value.mtime === "string") value.mtime = new Date(value.mtime);
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) allMountsSupportMaxDepth = false;
        const rawKeys = await asyncCall(mount.driver.getKeys, mount.relativeBase, opts);
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) allKeys.push(fullKey);
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint)),
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) =>
          (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) &&
          filterKeyByBase(key, base),
      );
    },
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) return asyncCall(m.driver.clear, m.relativeBase, opts);
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(keys.map((key) => m.driver.removeItem(key, opts)));
          }
        }),
      );
    },
    async dispose() {
      await Promise.all(Object.values(context.mounts).map((driver) => dispose(driver)));
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter((listener) => listener !== callback);
        if (context.watchListeners.length === 0) await stopWatch();
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) throw new Error(`already mounted at ${base}`);
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching)
        Promise.resolve(watch(driver, onChange, base))
          .then((unwatcher) => {
            context.unwatch[base] = unwatcher;
          })
          .catch(console.error);
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) return;
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) await dispose(context.mounts[base]);
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base,
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey(base);
      return getMounts(base, opts.parents).map((m) => ({
        driver: m.driver,
        base: m.mountpoint,
      }));
    },
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts),
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {};
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") await asyncCall(driver.dispose);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/session/runtime.js
const PERSIST_SYMBOL = /* @__PURE__ */ Symbol();
const DEFAULT_COOKIE_NAME = "astro-session";
const VALID_COOKIE_REGEX = /^[\w-]+$/;
const unflatten = (parsed, _) => {
  return unflatten$1(parsed, { URL: (href) => new URL(href) });
};
const stringify = (data, _) => {
  return stringify$2(data, { URL: (val) => val instanceof URL && val.href });
};
const AstroSession = class AstroSession {
  #cookies;
  #config;
  #cookieConfig;
  #cookieName;
  #storage;
  #data;
  #sessionID;
  #toDestroy = /* @__PURE__ */ new Set();
  #toDelete = /* @__PURE__ */ new Set();
  #dirty = false;
  #cookieSet = false;
  #sessionIDFromCookie = false;
  #partial = true;
  #driverFactory;
  static #sharedStorage = /* @__PURE__ */ new Map();
  constructor({ cookies, config, runtimeMode, driverFactory, mockStorage }) {
    if (!config)
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "No driver was defined in the session configuration and the adapter did not provide a default driver.",
        ),
      });
    this.#cookies = cookies;
    this.#driverFactory = driverFactory;
    const { cookie: cookieConfig = DEFAULT_COOKIE_NAME, ...configRest } = config;
    let cookieConfigObject;
    if (typeof cookieConfig === "object") {
      const { name = DEFAULT_COOKIE_NAME, ...rest } = cookieConfig;
      this.#cookieName = name;
      cookieConfigObject = rest;
    } else this.#cookieName = cookieConfig || DEFAULT_COOKIE_NAME;
    this.#cookieConfig = {
      sameSite: "lax",
      secure: runtimeMode === "production",
      path: "/",
      ...cookieConfigObject,
      httpOnly: true,
    };
    this.#config = configRest;
    if (mockStorage) this.#storage = mockStorage;
  }
  /**
   * Gets a session value. Returns `undefined` if the session or value does not exist.
   */
  async get(key) {
    return (await this.#ensureData()).get(key)?.data;
  }
  /**
   * Checks if a session value exists.
   */
  async has(key) {
    return (await this.#ensureData()).has(key);
  }
  /**
   * Gets all session values.
   */
  async keys() {
    return (await this.#ensureData()).keys();
  }
  /**
   * Gets all session values.
   */
  async values() {
    return [...(await this.#ensureData()).values()].map((entry) => entry.data);
  }
  /**
   * Gets all session entries.
   */
  async entries() {
    return [...(await this.#ensureData()).entries()].map(([key, entry]) => [key, entry.data]);
  }
  /**
   * Deletes a session value.
   */
  delete(key) {
    this.#data?.delete(key);
    if (this.#partial) this.#toDelete.add(key);
    this.#dirty = true;
  }
  /**
   * Sets a session value. The session is created if it does not exist.
   */
  set(key, value, { ttl } = {}) {
    if (!key)
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "The session key was not provided.",
      });
    let cloned;
    try {
      cloned = unflatten(JSON.parse(stringify(value)));
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageSaveError,
          message: `The session data for ${key} could not be serialized.`,
          hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue",
        },
        { cause: err },
      );
    }
    if (!this.#cookieSet) {
      this.#setCookie();
      this.#cookieSet = true;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    const lifetime = ttl ?? this.#config.ttl;
    const expires = typeof lifetime === "number" ? Date.now() + lifetime * 1e3 : lifetime;
    this.#data.set(key, {
      data: cloned,
      expires,
    });
    this.#dirty = true;
  }
  /**
   * Destroys the session, clearing the cookie and storage if it exists.
   */
  destroy() {
    const sessionId = this.#sessionID ?? this.#cookies.get(this.#cookieName)?.value;
    if (sessionId) this.#toDestroy.add(sessionId);
    this.#cookies.delete(this.#cookieName, this.#cookieConfig);
    this.#sessionID = void 0;
    this.#data = void 0;
    this.#dirty = true;
  }
  /**
   * Regenerates the session, creating a new session ID. The existing session data is preserved.
   */
  async regenerate() {
    let data = /* @__PURE__ */ new Map();
    try {
      data = await this.#ensureData();
    } catch (err) {
      console.error("Failed to load session data during regeneration:", err);
    }
    const oldSessionId = this.#sessionID;
    this.#sessionID = crypto.randomUUID();
    this.#sessionIDFromCookie = false;
    this.#data = data;
    this.#dirty = true;
    await this.#setCookie();
    if (oldSessionId && this.#storage)
      this.#storage.removeItem(oldSessionId).catch((err) => {
        console.error("Failed to remove old session data:", err);
      });
  }
  async [PERSIST_SYMBOL]() {
    if (!this.#dirty && !this.#toDestroy.size) return;
    const storage = await this.#ensureStorage();
    if (this.#dirty && this.#data) {
      const data = await this.#ensureData();
      this.#toDelete.forEach((key2) => data.delete(key2));
      const key = this.#ensureSessionID();
      let serialized;
      try {
        serialized = stringify(data);
      } catch (err) {
        throw new AstroError(
          {
            ...SessionStorageSaveError,
            message: SessionStorageSaveError.message(
              "The session data could not be serialized.",
              this.#config.driver,
            ),
          },
          { cause: err },
        );
      }
      await storage.setItem(key, serialized);
      this.#dirty = false;
    }
    if (this.#toDestroy.size > 0) {
      const cleanupPromises = [...this.#toDestroy].map((sessionId) =>
        storage.removeItem(sessionId).catch((err) => {
          console.error(`Failed to clean up session ${sessionId}:`, err);
        }),
      );
      await Promise.all(cleanupPromises);
      this.#toDestroy.clear();
    }
  }
  get sessionID() {
    return this.#sessionID;
  }
  /**
   * Loads a session from storage with the given ID, and replaces the current session.
   * Any changes made to the current session will be lost.
   * This is not normally needed, as the session is automatically loaded using the cookie.
   * However it can be used to restore a session where the ID has been recorded somewhere
   * else (e.g. in a database).
   */
  async load(sessionID) {
    this.#sessionID = sessionID;
    this.#data = void 0;
    await this.#setCookie();
    await this.#ensureData();
  }
  /**
   * Sets the session cookie.
   */
  async #setCookie() {
    if (!VALID_COOKIE_REGEX.test(this.#cookieName))
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "Invalid cookie name. Cookie names can only contain letters, numbers, and dashes.",
      });
    const value = this.#ensureSessionID();
    this.#cookies.set(this.#cookieName, value, this.#cookieConfig);
  }
  /**
   * Attempts to load the session data from storage, or creates a new data object if none exists.
   * If there is existing partial data, it will be merged into the new data object.
   */
  async #ensureData() {
    const storage = await this.#ensureStorage();
    if (this.#data && !this.#partial) return this.#data;
    this.#data ??= /* @__PURE__ */ new Map();
    const raw = await storage.get(this.#ensureSessionID());
    if (!raw) {
      if (this.#sessionIDFromCookie) {
        this.#sessionID = crypto.randomUUID();
        this.#sessionIDFromCookie = false;
        if (this.#cookieSet) await this.#setCookie();
      }
      return this.#data;
    }
    try {
      const storedMap = unflatten(raw);
      if (!(storedMap instanceof Map)) {
        await this.destroy();
        throw new AstroError({
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data was an invalid type.",
            this.#config.driver,
          ),
        });
      }
      const now = Date.now();
      for (const [key, value] of storedMap) {
        const expired = typeof value.expires === "number" && value.expires < now;
        if (!this.#data.has(key) && !this.#toDelete.has(key) && !expired)
          this.#data.set(key, value);
      }
      this.#partial = false;
      return this.#data;
    } catch (err) {
      await this.destroy();
      if (err instanceof AstroError) throw err;
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data could not be parsed.",
            this.#config.driver,
          ),
        },
        { cause: err },
      );
    }
  }
  /**
   * Returns the session ID, generating a new one if it does not exist.
   */
  #ensureSessionID() {
    if (!this.#sessionID) {
      const cookieValue = this.#cookies.get(this.#cookieName)?.value;
      if (cookieValue) {
        this.#sessionID = cookieValue;
        this.#sessionIDFromCookie = true;
      } else this.#sessionID = crypto.randomUUID();
    }
    return this.#sessionID;
  }
  /**
   * Ensures the storage is initialized.
   * This is called automatically when a storage operation is needed.
   */
  async #ensureStorage() {
    if (this.#storage) return this.#storage;
    if (AstroSession.#sharedStorage.has(this.#config.driver)) {
      this.#storage = AstroSession.#sharedStorage.get(this.#config.driver);
      return this.#storage;
    }
    if (!this.#driverFactory)
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "Astro could not load the driver correctly. Does it exist?",
          this.#config.driver,
        ),
      });
    const driver = this.#driverFactory;
    try {
      this.#storage = createStorage({
        driver: {
          ...driver(this.#config.options),
          hasItem() {
            return false;
          },
          getKeys() {
            return [];
          },
        },
      });
      AstroSession.#sharedStorage.set(this.#config.driver, this.#storage);
      return this.#storage;
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message("Unknown error", this.#config.driver),
        },
        { cause: err },
      );
    }
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/util/pathname.js
function validateAndDecodePathname(pathname) {
  let decoded;
  try {
    decoded = decodeURI(pathname);
  } catch (_e) {
    throw new Error("Invalid URL encoding", { cause: _e });
  }
  const hasDecoding = decoded !== pathname;
  const decodedStillHasEncoding = /%[0-9a-fA-F]{2}/.test(decoded);
  if (hasDecoding && decodedStillHasEncoding)
    throw new Error("Multi-level URL encoding is not allowed");
  return decoded;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/render-context.js
const RenderContext = class RenderContext {
  constructor(
    pipeline,
    locals,
    middleware,
    actions,
    serverIslands,
    pathname,
    request,
    routeData,
    status,
    clientAddress,
    cookies = new AstroCookies(request),
    params = getParams(routeData, pathname),
    url = RenderContext.#createNormalizedUrl(request.url),
    props = {},
    partial = void 0,
    shouldInjectCspMetaTags = pipeline.manifest.shouldInjectCspMetaTags,
    session = void 0,
    cache,
    skipMiddleware = false,
  ) {
    this.pipeline = pipeline;
    this.locals = locals;
    this.middleware = middleware;
    this.actions = actions;
    this.serverIslands = serverIslands;
    this.pathname = pathname;
    this.request = request;
    this.routeData = routeData;
    this.status = status;
    this.clientAddress = clientAddress;
    this.cookies = cookies;
    this.params = params;
    this.url = url;
    this.props = props;
    this.partial = partial;
    this.shouldInjectCspMetaTags = shouldInjectCspMetaTags;
    this.session = session;
    this.cache = cache;
    this.skipMiddleware = skipMiddleware;
  }
  static #createNormalizedUrl(requestUrl) {
    const url = new URL(requestUrl);
    try {
      url.pathname = validateAndDecodePathname(url.pathname);
    } catch {
      try {
        url.pathname = decodeURI(url.pathname);
      } catch {}
    }
    url.pathname = collapseDuplicateSlashes(url.pathname);
    return url;
  }
  /**
   * A flag that tells the render content if the rewriting was triggered
   */
  isRewriting = false;
  /**
   * A safety net in case of loops
   */
  counter = 0;
  result = void 0;
  static async create({
    locals = {},
    pathname,
    pipeline,
    request,
    routeData,
    clientAddress,
    status = 200,
    props,
    partial = void 0,
    shouldInjectCspMetaTags,
    skipMiddleware = false,
  }) {
    const pipelineMiddleware = await pipeline.getMiddleware();
    const pipelineActions = await pipeline.getActions();
    const pipelineSessionDriver = await pipeline.getSessionDriver();
    const serverIslands = await pipeline.getServerIslands();
    setOriginPathname(
      request,
      pathname,
      pipeline.manifest.trailingSlash,
      pipeline.manifest.buildFormat,
    );
    const cookies = new AstroCookies(request);
    const session =
      pipeline.manifest.sessionConfig && pipelineSessionDriver
        ? new AstroSession({
            cookies,
            config: pipeline.manifest.sessionConfig,
            runtimeMode: pipeline.runtimeMode,
            driverFactory: pipelineSessionDriver,
            mockStorage: null,
          })
        : void 0;
    let cache;
    if (!pipeline.cacheConfig) cache = new DisabledAstroCache(pipeline.logger);
    else if (pipeline.runtimeMode === "development") cache = new NoopAstroCache();
    else {
      cache = new AstroCache(await pipeline.getCacheProvider());
      if (pipeline.cacheConfig?.routes) {
        if (!pipeline.compiledCacheRoutes)
          pipeline.compiledCacheRoutes = compileCacheRoutes(
            pipeline.cacheConfig.routes,
            pipeline.manifest.base,
            pipeline.manifest.trailingSlash,
          );
        const matched = matchCacheRoute(pathname, pipeline.compiledCacheRoutes);
        if (matched) cache.set(matched);
      }
    }
    return new RenderContext(
      pipeline,
      locals,
      sequence(...pipeline.internalMiddleware, pipelineMiddleware),
      pipelineActions,
      serverIslands,
      pathname,
      request,
      routeData,
      status,
      clientAddress,
      cookies,
      void 0,
      void 0,
      props,
      partial,
      shouldInjectCspMetaTags ?? pipeline.manifest.shouldInjectCspMetaTags,
      session,
      cache,
      skipMiddleware,
    );
  }
  /**
   * The main function of the RenderContext.
   *
   * Use this function to render any route known to Astro.
   * It attempts to render a route. A route can be a:
   *
   * - page
   * - redirect
   * - endpoint
   * - fallback
   */
  async render(componentInstance, slots = {}) {
    const { middleware, pipeline } = this;
    const { logger, streaming, manifest } = pipeline;
    const props =
      Object.keys(this.props).length > 0
        ? this.props
        : await getProps({
            mod: componentInstance,
            routeData: this.routeData,
            routeCache: this.pipeline.routeCache,
            pathname: this.pathname,
            logger,
            serverLike: manifest.serverLike,
            base: manifest.base,
            trailingSlash: manifest.trailingSlash,
          });
    const actionApiContext = this.createActionAPIContext();
    const apiContext = this.createAPIContext(props, actionApiContext);
    this.counter++;
    if (this.counter === 4)
      return new Response("Loop Detected", {
        status: 508,
        statusText:
          "Astro detected a loop where you tried to call the rewriting logic more than four times.",
      });
    const lastNext = async (ctx, payload) => {
      if (payload) {
        const oldPathname = this.pathname;
        pipeline.logger.debug("router", "Called rewriting to:", payload);
        const {
          routeData,
          componentInstance: newComponent,
          pathname,
          newUrl,
        } = await pipeline.tryRewrite(payload, this.request);
        if (
          this.pipeline.manifest.serverLike === true &&
          this.routeData.prerender === false &&
          routeData.prerender === true
        )
          throw new AstroError({
            ...ForbiddenRewrite,
            message: ForbiddenRewrite.message(this.pathname, pathname, routeData.component),
            hint: ForbiddenRewrite.hint(routeData.component),
          });
        this.routeData = routeData;
        componentInstance = newComponent;
        if (payload instanceof Request) this.request = payload;
        else
          this.request = copyRequest(
            newUrl,
            this.request,
            routeData.prerender,
            this.pipeline.logger,
            this.routeData.route,
          );
        this.isRewriting = true;
        this.url = RenderContext.#createNormalizedUrl(this.request.url);
        this.params = getParams(routeData, pathname);
        this.pathname = pathname;
        this.status = 200;
        setOriginPathname(
          this.request,
          oldPathname,
          this.pipeline.manifest.trailingSlash,
          this.pipeline.manifest.buildFormat,
        );
      }
      let response2;
      if (!ctx.isPrerendered && !this.skipMiddleware) {
        const { action, setActionResult, serializeActionResult } = getActionContext(ctx);
        if (action?.calledFrom === "form") {
          const actionResult = await action.handler();
          setActionResult(action.name, serializeActionResult(actionResult));
        }
      }
      switch (this.routeData.type) {
        case "endpoint":
          response2 = await renderEndpoint(
            componentInstance,
            ctx,
            this.routeData.prerender,
            logger,
          );
          break;
        case "redirect":
          return renderRedirect(this);
        case "page":
          this.result = await this.createResult(componentInstance, actionApiContext);
          try {
            response2 = await renderPage(
              this.result,
              componentInstance?.default,
              props,
              slots,
              streaming,
              this.routeData,
            );
          } catch (e) {
            this.result.cancelled = true;
            throw e;
          }
          response2.headers.set(ROUTE_TYPE_HEADER, "page");
          if (this.routeData.route === "/404" || this.routeData.route === "/500")
            response2.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
          if (this.isRewriting) response2.headers.set(REWRITE_DIRECTIVE_HEADER_KEY, "yes");
          break;
        case "fallback":
          return new Response(null, {
            status: 500,
            headers: { [ROUTE_TYPE_HEADER]: "fallback" },
          });
      }
      const responseCookies = getCookiesFromResponse(response2);
      if (responseCookies) this.cookies.merge(responseCookies);
      return response2;
    };
    if (isRouteExternalRedirect(this.routeData)) return renderRedirect(this);
    const response = this.skipMiddleware
      ? await lastNext(apiContext)
      : await callMiddleware(middleware, apiContext, lastNext);
    if (response.headers.get("X-Astro-Route-Type")) response.headers.delete(ROUTE_TYPE_HEADER);
    attachCookiesToResponse(response, this.cookies);
    return response;
  }
  createAPIContext(props, context) {
    const redirect = (path, status = 302) =>
      new Response(null, {
        status,
        headers: { Location: path },
      });
    const rewrite = async (reroutePayload) => {
      return await this.#executeRewrite(reroutePayload);
    };
    Reflect.set(context, pipelineSymbol, this.pipeline);
    return Object.assign(context, {
      props,
      redirect,
      rewrite,
      getActionResult: createGetActionResult(context.locals),
      callAction: createCallAction(context),
    });
  }
  async #executeRewrite(reroutePayload) {
    this.pipeline.logger.debug("router", "Calling rewrite: ", reroutePayload);
    const oldPathname = this.pathname;
    const { routeData, componentInstance, newUrl, pathname } = await this.pipeline.tryRewrite(
      reroutePayload,
      this.request,
    );
    const isI18nFallback = routeData.fallbackRoutes && routeData.fallbackRoutes.length > 0;
    if (
      this.pipeline.manifest.serverLike &&
      !this.routeData.prerender &&
      routeData.prerender &&
      !isI18nFallback
    )
      throw new AstroError({
        ...ForbiddenRewrite,
        message: ForbiddenRewrite.message(this.pathname, pathname, routeData.component),
        hint: ForbiddenRewrite.hint(routeData.component),
      });
    this.routeData = routeData;
    if (reroutePayload instanceof Request) this.request = reroutePayload;
    else
      this.request = copyRequest(
        newUrl,
        this.request,
        routeData.prerender,
        this.pipeline.logger,
        this.routeData.route,
      );
    this.url = RenderContext.#createNormalizedUrl(this.request.url);
    const newCookies = new AstroCookies(this.request);
    if (this.cookies) newCookies.merge(this.cookies);
    this.cookies = newCookies;
    this.params = getParams(routeData, pathname);
    this.pathname = pathname;
    this.isRewriting = true;
    this.status = 200;
    setOriginPathname(
      this.request,
      oldPathname,
      this.pipeline.manifest.trailingSlash,
      this.pipeline.manifest.buildFormat,
    );
    return await this.render(componentInstance);
  }
  createActionAPIContext() {
    const renderContext = this;
    const { params, pipeline, url } = this;
    return {
      get cookies() {
        return renderContext.cookies;
      },
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      get clientAddress() {
        return renderContext.getClientAddress();
      },
      get currentLocale() {
        return renderContext.computeCurrentLocale();
      },
      generator: ASTRO_GENERATOR,
      get locals() {
        return renderContext.locals;
      },
      set locals(_) {
        throw new AstroError(LocalsReassigned);
      },
      params,
      get preferredLocale() {
        return renderContext.computePreferredLocale();
      },
      get preferredLocaleList() {
        return renderContext.computePreferredLocaleList();
      },
      request: this.request,
      site: pipeline.site,
      url,
      get originPathname() {
        return getOriginPathname(renderContext.request);
      },
      get session() {
        if (this.isPrerendered) {
          pipeline.logger.warn(
            "session",
            `context.session was used when rendering the route ${s.green(this.routePattern)}, but it is not available on prerendered routes. If you need access to sessions, make sure that the route is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your routes server-rendered by default. For more information, see https://docs.astro.build/en/guides/sessions/`,
          );
          return;
        }
        if (!renderContext.session) {
          pipeline.logger.warn(
            "session",
            `context.session was used when rendering the route ${s.green(this.routePattern)}, but no storage configuration was provided. Either configure the storage manually or use an adapter that provides session storage. For more information, see https://docs.astro.build/en/guides/sessions/`,
          );
          return;
        }
        return renderContext.session;
      },
      get cache() {
        return renderContext.cache;
      },
      get csp() {
        if (!pipeline.manifest.csp) {
          if (pipeline.runtimeMode === "production")
            pipeline.logger.warn(
              "csp",
              `context.csp was used when rendering the route ${s.green(this.routePattern)}, but CSP was not configured. For more information, see https://docs.astro.build/en/reference/experimental-flags/csp/`,
            );
          return;
        }
        return {
          insertDirective(payload) {
            if (renderContext?.result?.directives)
              renderContext.result.directives = pushDirective(
                renderContext.result.directives,
                payload,
              );
            else renderContext?.result?.directives.push(payload);
          },
          insertScriptResource(resource) {
            renderContext.result?.scriptResources.push(resource);
          },
          insertStyleResource(resource) {
            renderContext.result?.styleResources.push(resource);
          },
          insertStyleHash(hash) {
            renderContext.result?.styleHashes.push(hash);
          },
          insertScriptHash(hash) {
            renderContext.result?.scriptHashes.push(hash);
          },
        };
      },
    };
  }
  async createResult(mod, ctx) {
    const { cookies, pathname, pipeline, routeData, status } = this;
    const { clientDirectives, inlinedScripts, compressHTML, manifest, renderers, resolve } =
      pipeline;
    const { links, scripts, styles } = await pipeline.headElements(routeData);
    const extraStyleHashes = [];
    const extraScriptHashes = [];
    const shouldInjectCspMetaTags = this.shouldInjectCspMetaTags;
    const cspAlgorithm = manifest.csp?.algorithm ?? "SHA-256";
    if (shouldInjectCspMetaTags) {
      for (const style of styles)
        extraStyleHashes.push(await generateCspDigest(style.children, cspAlgorithm));
      for (const script of scripts)
        extraScriptHashes.push(await generateCspDigest(script.children, cspAlgorithm));
    }
    const componentMetadata =
      (await pipeline.componentMetadata(routeData)) ?? manifest.componentMetadata;
    const headers = new Headers({ "Content-Type": "text/html" });
    const partial = typeof this.partial === "boolean" ? this.partial : Boolean(mod.partial);
    const actionResult = hasActionPayload(this.locals)
      ? deserializeActionResult(this.locals._actionPayload.actionResult)
      : void 0;
    const response = {
      status: actionResult?.error ? actionResult?.error.status : status,
      statusText: actionResult?.error ? actionResult?.error.type : "OK",
      get headers() {
        return headers;
      },
      set headers(_) {
        throw new AstroError(AstroResponseHeadersReassigned);
      },
    };
    const result = {
      base: manifest.base,
      userAssetsBase: manifest.userAssetsBase,
      cancelled: false,
      clientDirectives,
      inlinedScripts,
      componentMetadata,
      compressHTML,
      cookies,
      createAstro: (props, slots) => this.createAstro(result, props, slots, ctx),
      links,
      params: this.params,
      partial,
      pathname,
      renderers,
      resolve,
      response,
      request: this.request,
      scripts,
      styles,
      actionResult,
      serverIslandNameMap: this.serverIslands.serverIslandNameMap ?? /* @__PURE__ */ new Map(),
      key: manifest.key,
      trailingSlash: manifest.trailingSlash,
      _experimentalQueuedRendering: {
        pool: pipeline.nodePool,
        htmlStringCache: pipeline.htmlStringCache,
        enabled: manifest.experimentalQueuedRendering?.enabled,
        poolSize: manifest.experimentalQueuedRendering?.poolSize,
        contentCache: manifest.experimentalQueuedRendering?.contentCache,
      },
      _metadata: {
        hasHydrationScript: false,
        rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
        hasRenderedHead: false,
        renderedScripts: /* @__PURE__ */ new Set(),
        hasDirectives: /* @__PURE__ */ new Set(),
        hasRenderedServerIslandRuntime: false,
        headInTree: false,
        extraHead: [],
        extraStyleHashes,
        extraScriptHashes,
        propagators: /* @__PURE__ */ new Set(),
      },
      cspDestination: manifest.csp?.cspDestination ?? (routeData.prerender ? "meta" : "header"),
      shouldInjectCspMetaTags,
      cspAlgorithm,
      scriptHashes: manifest.csp?.scriptHashes ? [...manifest.csp.scriptHashes] : [],
      scriptResources: manifest.csp?.scriptResources ? [...manifest.csp.scriptResources] : [],
      styleHashes: manifest.csp?.styleHashes ? [...manifest.csp.styleHashes] : [],
      styleResources: manifest.csp?.styleResources ? [...manifest.csp.styleResources] : [],
      directives: manifest.csp?.directives ? [...manifest.csp.directives] : [],
      isStrictDynamic: manifest.csp?.isStrictDynamic ?? false,
      internalFetchHeaders: manifest.internalFetchHeaders,
    };
    return result;
  }
  #astroPagePartial;
  /**
   * The Astro global is sourced in 3 different phases:
   * - **Static**: `.generator` and `.glob` is printed by the compiler, instantiated once per process per astro file
   * - **Page-level**: `.request`, `.cookies`, `.locals` etc. These remain the same for the duration of the request.
   * - **Component-level**: `.props`, `.slots`, and `.self` are unique to each _use_ of each component.
   *
   * The page level partial is used as the prototype of the user-visible `Astro` global object, which is instantiated once per use of a component.
   */
  createAstro(result, props, slotValues, apiContext) {
    let astroPagePartial;
    if (this.isRewriting)
      astroPagePartial = this.#astroPagePartial = this.createAstroPagePartial(result, apiContext);
    else
      astroPagePartial = this.#astroPagePartial ??= this.createAstroPagePartial(result, apiContext);
    const Astro = Object.assign(Object.create(astroPagePartial), {
      props,
      self: null,
    });
    let _slots;
    Object.defineProperty(Astro, "slots", {
      get: () => {
        if (!_slots) _slots = new Slots(result, slotValues, this.pipeline.logger);
        return _slots;
      },
    });
    return Astro;
  }
  createAstroPagePartial(result, apiContext) {
    const renderContext = this;
    const { cookies, locals, params, pipeline, url } = this;
    const { response } = result;
    const redirect = (path, status = 302) => {
      if (this.request[responseSentSymbol$1]) throw new AstroError({ ...ResponseSentError });
      return new Response(null, {
        status,
        headers: { Location: path },
      });
    };
    const rewrite = async (reroutePayload) => {
      return await this.#executeRewrite(reroutePayload);
    };
    const callAction = createCallAction(apiContext);
    return {
      generator: ASTRO_GENERATOR,
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      cookies,
      get session() {
        if (this.isPrerendered) {
          pipeline.logger.warn(
            "session",
            `Astro.session was used when rendering the route ${s.green(this.routePattern)}, but it is not available on prerendered pages. If you need access to sessions, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default. For more information, see https://docs.astro.build/en/guides/sessions/`,
          );
          return;
        }
        if (!renderContext.session) {
          pipeline.logger.warn(
            "session",
            `Astro.session was used when rendering the route ${s.green(this.routePattern)}, but no storage configuration was provided. Either configure the storage manually or use an adapter that provides session storage. For more information, see https://docs.astro.build/en/guides/sessions/`,
          );
          return;
        }
        return renderContext.session;
      },
      get cache() {
        return renderContext.cache;
      },
      get clientAddress() {
        return renderContext.getClientAddress();
      },
      get currentLocale() {
        return renderContext.computeCurrentLocale();
      },
      params,
      get preferredLocale() {
        return renderContext.computePreferredLocale();
      },
      get preferredLocaleList() {
        return renderContext.computePreferredLocaleList();
      },
      locals,
      redirect,
      rewrite,
      request: this.request,
      response,
      site: pipeline.site,
      getActionResult: createGetActionResult(locals),
      get callAction() {
        return callAction;
      },
      url,
      get originPathname() {
        return getOriginPathname(renderContext.request);
      },
      get csp() {
        if (!pipeline.manifest.csp) {
          if (pipeline.runtimeMode === "production")
            pipeline.logger.warn(
              "csp",
              `Astro.csp was used when rendering the route ${s.green(this.routePattern)}, but CSP was not configured. For more information, see https://docs.astro.build/en/reference/experimental-flags/csp/`,
            );
          return;
        }
        return {
          insertDirective(payload) {
            if (renderContext?.result?.directives)
              renderContext.result.directives = pushDirective(
                renderContext.result.directives,
                payload,
              );
            else renderContext?.result?.directives.push(payload);
          },
          insertScriptResource(resource) {
            renderContext.result?.scriptResources.push(resource);
          },
          insertStyleResource(resource) {
            renderContext.result?.styleResources.push(resource);
          },
          insertStyleHash(hash) {
            renderContext.result?.styleHashes.push(hash);
          },
          insertScriptHash(hash) {
            renderContext.result?.scriptHashes.push(hash);
          },
        };
      },
    };
  }
  getClientAddress() {
    const { pipeline, routeData, clientAddress } = this;
    if (routeData.prerender)
      throw new AstroError({
        ...PrerenderClientAddressNotAvailable,
        message: PrerenderClientAddressNotAvailable.message(routeData.component),
      });
    if (clientAddress) return clientAddress;
    if (pipeline.adapterName)
      throw new AstroError({
        ...ClientAddressNotAvailable,
        message: ClientAddressNotAvailable.message(pipeline.adapterName),
      });
    throw new AstroError(StaticClientAddressNotAvailable);
  }
  /**
   * API Context may be created multiple times per request, i18n data needs to be computed only once.
   * So, it is computed and saved here on creation of the first APIContext and reused for later ones.
   */
  #currentLocale;
  computeCurrentLocale() {
    const {
      url,
      pipeline: { i18n },
      routeData,
    } = this;
    if (!i18n) return;
    const { defaultLocale, locales, strategy } = i18n;
    const fallbackTo =
      strategy === "pathname-prefix-other-locales" || strategy === "domains-prefix-other-locales"
        ? defaultLocale
        : void 0;
    if (this.#currentLocale) return this.#currentLocale;
    let computedLocale;
    if (isRouteServerIsland(routeData)) {
      let referer = this.request.headers.get("referer");
      if (referer) {
        if (URL.canParse(referer)) referer = new URL(referer).pathname;
        computedLocale = computeCurrentLocale(referer, locales, defaultLocale);
      }
    } else {
      let pathname = routeData.pathname;
      if (!routeData.pattern.test(url.pathname)) {
        for (const fallbackRoute of routeData.fallbackRoutes)
          if (fallbackRoute.pattern.test(url.pathname)) {
            pathname = fallbackRoute.pathname;
            break;
          }
      }
      pathname = pathname && !isRoute404or500(routeData) ? pathname : url.pathname;
      computedLocale = computeCurrentLocale(pathname, locales, defaultLocale);
      if (routeData.params.length > 0) {
        const localeFromParams = computeCurrentLocaleFromParams(this.params, locales);
        if (localeFromParams) computedLocale = localeFromParams;
      }
    }
    this.#currentLocale = computedLocale ?? fallbackTo;
    return this.#currentLocale;
  }
  #preferredLocale;
  computePreferredLocale() {
    const {
      pipeline: { i18n },
      request,
    } = this;
    if (!i18n) return;
    return (this.#preferredLocale ??= computePreferredLocale(request, i18n.locales));
  }
  #preferredLocaleList;
  computePreferredLocaleList() {
    const {
      pipeline: { i18n },
      request,
    } = this;
    if (!i18n) return;
    return (this.#preferredLocaleList ??= computePreferredLocaleList(request, i18n.locales));
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/3xx.js
function redirectTemplate({ status, absoluteLocation, relativeLocation, from }) {
  return `<!doctype html>
<title>Redirecting to: ${relativeLocation}</title>
<meta http-equiv="refresh" content="${status === 302 ? 2 : 0};url=${relativeLocation}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${absoluteLocation}">
<body>
	<a href="${relativeLocation}">Redirecting ${from ? `from <code>${from}</code> ` : ""}to <code>${relativeLocation}</code></a>
</body>`;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/astro-designed-error-pages.js
function ensure404Route(manifest) {
  if (!manifest.routes.some((route) => route.route === "/404"))
    manifest.routes.push(DEFAULT_404_ROUTE);
  return manifest;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/router.js
const Router = class {
  #routes;
  #base;
  #baseWithoutTrailingSlash;
  #buildFormat;
  #trailingSlash;
  constructor(routes, options) {
    this.#routes = [...routes].sort(routeComparator);
    this.#base = normalizeBase(options.base);
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#base);
    this.#buildFormat = options.buildFormat;
    this.#trailingSlash = options.trailingSlash;
  }
  /**
   * Match an input pathname against the route list.
   * If allowWithoutBase is true, a non-base-prefixed path is still considered.
   */
  match(inputPathname, { allowWithoutBase = false } = {}) {
    const normalized = getRedirectForPathname(inputPathname);
    if (normalized.redirect)
      return {
        type: "redirect",
        location: normalized.redirect,
        status: 301,
      };
    if (this.#base !== "/") {
      const baseWithSlash = `${this.#baseWithoutTrailingSlash}/`;
      if (
        this.#trailingSlash === "always" &&
        (normalized.pathname === this.#baseWithoutTrailingSlash ||
          normalized.pathname === this.#base)
      )
        return {
          type: "redirect",
          location: baseWithSlash,
          status: 301,
        };
      if (this.#trailingSlash === "never" && normalized.pathname === baseWithSlash)
        return {
          type: "redirect",
          location: this.#baseWithoutTrailingSlash,
          status: 301,
        };
    }
    const baseResult = stripBase(
      normalized.pathname,
      this.#base,
      this.#baseWithoutTrailingSlash,
      this.#trailingSlash,
    );
    if (!baseResult) {
      if (!allowWithoutBase)
        return {
          type: "none",
          reason: "outside-base",
        };
    }
    let pathname = baseResult ?? normalized.pathname;
    if (this.#buildFormat === "file") pathname = normalizeFileFormatPathname(pathname);
    const route = this.#routes.find((candidate) => {
      if (candidate.pattern.test(pathname)) return true;
      return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
    });
    if (!route)
      return {
        type: "none",
        reason: "no-match",
      };
    return {
      type: "match",
      route,
      params: getParams(route, pathname),
      pathname,
    };
  }
};
function normalizeBase(base) {
  if (!base) return "/";
  if (base === "/") return base;
  return prependForwardSlash(base);
}
function getRedirectForPathname(pathname) {
  const value = prependForwardSlash(pathname);
  if (value.startsWith("//"))
    return {
      pathname: value,
      redirect: `/${value.replace(/^\/+/, "")}`,
    };
  return { pathname: value };
}
function stripBase(pathname, base, baseWithoutTrailingSlash, trailingSlash) {
  if (base === "/") return pathname;
  const baseWithSlash = `${baseWithoutTrailingSlash}/`;
  if (pathname === baseWithoutTrailingSlash || pathname === base)
    return trailingSlash === "always" ? null : "/";
  if (pathname === baseWithSlash) return trailingSlash === "never" ? null : "/";
  if (pathname.startsWith(baseWithSlash)) return pathname.slice(baseWithoutTrailingSlash.length);
  return null;
}
function normalizeFileFormatPathname(pathname) {
  if (pathname.endsWith("/index.html")) {
    const trimmed = pathname.slice(0, -11);
    return trimmed === "" ? "/" : trimmed;
  }
  if (pathname.endsWith(".html")) {
    const trimmed = pathname.slice(0, -5);
    return trimmed === "" ? "/" : trimmed;
  }
  return pathname;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/base.js
const BaseApp = class BaseApp {
  manifest;
  manifestData;
  pipeline;
  adapterLogger;
  baseWithoutTrailingSlash;
  logger;
  #router;
  constructor(manifest, streaming = true, ...args) {
    this.manifest = manifest;
    this.manifestData = { routes: manifest.routes.map((route) => route.routeData) };
    this.baseWithoutTrailingSlash = removeTrailingForwardSlash(manifest.base);
    this.pipeline = this.createPipeline(streaming, manifest, ...args);
    this.logger = new Logger({
      dest: consoleLogDestination,
      level: manifest.logLevel,
    });
    this.adapterLogger = new AstroIntegrationLogger(this.logger.options, manifest.adapterName);
    ensure404Route(this.manifestData);
    this.#router = this.createRouter(this.manifestData);
  }
  async createRenderContext(payload) {
    return RenderContext.create(payload);
  }
  getAdapterLogger() {
    return this.adapterLogger;
  }
  getAllowedDomains() {
    return this.manifest.allowedDomains;
  }
  matchesAllowedDomains(forwardedHost, protocol) {
    return BaseApp.validateForwardedHost(forwardedHost, this.manifest.allowedDomains, protocol);
  }
  static validateForwardedHost(forwardedHost, allowedDomains, protocol) {
    if (!allowedDomains || allowedDomains.length === 0) return false;
    try {
      const testUrl = new URL(`${protocol || "https"}://${forwardedHost}`);
      return allowedDomains.some((pattern) => {
        return matchPattern(testUrl, pattern);
      });
    } catch {
      return false;
    }
  }
  set setManifestData(newManifestData) {
    this.manifestData = newManifestData;
    this.#router = this.createRouter(this.manifestData);
  }
  removeBase(pathname) {
    pathname = collapseDuplicateLeadingSlashes(pathname);
    if (pathname.startsWith(this.manifest.base))
      return pathname.slice(this.baseWithoutTrailingSlash.length + 1);
    return pathname;
  }
  /**
   * It removes the base from the request URL, prepends it with a forward slash and attempts to decoded it.
   *
   * If the decoding fails, it logs the error and return the pathname as is.
   * @param request
   */
  getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    try {
      return decodeURI(pathname);
    } catch (e) {
      this.getAdapterLogger().error(e.toString());
      return pathname;
    }
  }
  /**
   * Given a `Request`, it returns the `RouteData` that matches its `pathname`. By default, prerendered
   * routes aren't returned, even if they are matched.
   *
   * When `allowPrerenderedRoutes` is `true`, the function returns matched prerendered routes too.
   * @param request
   * @param allowPrerenderedRoutes
   */
  match(request, allowPrerenderedRoutes = false) {
    const url = new URL(request.url);
    if (this.manifest.assets.has(url.pathname)) return void 0;
    let pathname = this.computePathnameFromDomain(request);
    if (!pathname) pathname = prependForwardSlash(this.removeBase(url.pathname));
    const match = this.#router.match(decodeURI(pathname), { allowWithoutBase: true });
    if (match.type !== "match") return void 0;
    const routeData = match.route;
    if (allowPrerenderedRoutes) return routeData;
    else if (routeData.prerender) return;
    return routeData;
  }
  createRouter(manifestData) {
    return new Router(manifestData.routes, {
      base: this.manifest.base,
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
    });
  }
  /**
   * A matching route function to use in the development server.
   * Contrary to the `.match` function, this function resolves props and params, returning the correct
   * route based on the priority, segments. It also returns the correct, resolved pathname.
   * @param pathname
   */
  devMatch(pathname) {}
  computePathnameFromDomain(request) {
    let pathname = void 0;
    const url = new URL(request.url);
    if (
      this.manifest.i18n &&
      (this.manifest.i18n.strategy === "domains-prefix-always" ||
        this.manifest.i18n.strategy === "domains-prefix-other-locales" ||
        this.manifest.i18n.strategy === "domains-prefix-always-no-redirect")
    ) {
      let host = request.headers.get("X-Forwarded-Host");
      let protocol = request.headers.get("X-Forwarded-Proto");
      if (protocol) protocol = protocol + ":";
      else protocol = url.protocol;
      if (!host) host = request.headers.get("Host");
      if (host && protocol) {
        host = host.split(":")[0];
        try {
          let locale;
          const hostAsUrl = new URL(`${protocol}//${host}`);
          for (const [domainKey, localeValue] of Object.entries(
            this.manifest.i18n.domainLookupTable,
          )) {
            const domainKeyAsUrl = new URL(domainKey);
            if (
              hostAsUrl.host === domainKeyAsUrl.host &&
              hostAsUrl.protocol === domainKeyAsUrl.protocol
            ) {
              locale = localeValue;
              break;
            }
          }
          if (locale) {
            pathname = prependForwardSlash(
              joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname)),
            );
            if (url.pathname.endsWith("/")) pathname = appendForwardSlash(pathname);
          }
        } catch (e) {
          this.logger.error(
            "router",
            `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`,
          );
          this.logger.error("router", `Error: ${e}`);
        }
      }
    }
    return pathname;
  }
  redirectTrailingSlash(pathname) {
    const { trailingSlash } = this.manifest;
    if (pathname === "/" || isInternalPath(pathname)) return pathname;
    const path = collapseDuplicateTrailingSlashes(pathname, trailingSlash !== "never");
    if (path !== pathname) return path;
    if (trailingSlash === "ignore") return pathname;
    if (trailingSlash === "always" && !hasFileExtension(pathname))
      return appendForwardSlash(pathname);
    if (trailingSlash === "never") return removeTrailingForwardSlash(pathname);
    return pathname;
  }
  async render(
    request,
    {
      addCookieHeader = false,
      clientAddress = Reflect.get(request, clientAddressSymbol),
      locals,
      prerenderedErrorPageFetch = fetch,
      routeData,
    } = {},
  ) {
    const timeStart = performance.now();
    const url = new URL(request.url);
    const redirect = this.redirectTrailingSlash(url.pathname);
    if (redirect !== url.pathname) {
      const status = request.method === "GET" ? 301 : 308;
      const response2 = new Response(
        redirectTemplate({
          status,
          relativeLocation: url.pathname,
          absoluteLocation: redirect,
          from: request.url,
        }),
        {
          status,
          headers: { location: redirect + url.search },
        },
      );
      this.#prepareResponse(response2, { addCookieHeader });
      return response2;
    }
    if (routeData) {
      this.logger.debug(
        "router",
        "The adapter " + this.manifest.adapterName + " provided a custom RouteData for ",
        request.url,
      );
      this.logger.debug("router", "RouteData");
      this.logger.debug("router", routeData);
    }
    const resolvedRenderOptions = {
      addCookieHeader,
      clientAddress,
      prerenderedErrorPageFetch,
      locals,
      routeData,
    };
    if (locals) {
      if (typeof locals !== "object") {
        const error = new AstroError(LocalsNotAnObject);
        this.logger.error(null, error.stack);
        return this.renderError(request, {
          ...resolvedRenderOptions,
          locals: void 0,
          status: 500,
          error,
        });
      }
    }
    if (!routeData) {
      if (this.isDev()) {
        const result = await this.devMatch(this.getPathnameFromRequest(request));
        if (result) routeData = result.routeData;
      } else routeData = this.match(request);
      this.logger.debug("router", "Astro matched the following route for " + request.url);
      this.logger.debug("router", "RouteData:\n" + routeData);
    }
    if (!routeData)
      routeData = this.manifestData.routes.find(
        (route) => route.component === "404.astro" || route.component === "astro-default-404.astro",
      );
    if (!routeData) {
      this.logger.debug("router", "Astro hasn't found routes that match " + request.url);
      this.logger.debug("router", "Here's the available routes:\n", this.manifestData);
      return this.renderError(request, {
        ...resolvedRenderOptions,
        status: 404,
      });
    }
    let pathname = this.getPathnameFromRequest(request);
    if (this.isDev() && !routeHasHtmlExtension(routeData))
      pathname = pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    const defaultStatus = this.getDefaultStatusCode(routeData, pathname);
    let response;
    let session;
    let cache;
    try {
      const componentInstance = await this.pipeline.getComponentByRoute(routeData);
      const renderContext = await this.createRenderContext({
        pipeline: this.pipeline,
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus,
        clientAddress,
      });
      session = renderContext.session;
      cache = renderContext.cache;
      if (this.pipeline.cacheProvider) {
        const cacheProvider = await this.pipeline.getCacheProvider();
        if (cacheProvider?.onRequest) {
          response = await cacheProvider.onRequest(
            {
              request,
              url: new URL(request.url),
            },
            async () => {
              const res = await renderContext.render(componentInstance);
              applyCacheHeaders(cache, res);
              return res;
            },
          );
          response.headers.delete("CDN-Cache-Control");
          response.headers.delete("Cache-Tag");
        } else {
          response = await renderContext.render(componentInstance);
          applyCacheHeaders(cache, response);
        }
      } else response = await renderContext.render(componentInstance);
      const isRewrite = response.headers.has(REWRITE_DIRECTIVE_HEADER_KEY);
      this.logThisRequest({
        pathname,
        method: request.method,
        statusCode: response.status,
        isRewrite,
        timeStart,
      });
    } catch (err) {
      this.logger.error(null, err.stack || err.message || String(err));
      return this.renderError(request, {
        ...resolvedRenderOptions,
        status: 500,
        error: err,
      });
    } finally {
      await session?.[PERSIST_SYMBOL]();
    }
    if (
      REROUTABLE_STATUS_CODES.includes(response.status) &&
      response.body === null &&
      response.headers.get("X-Astro-Reroute") !== "no"
    )
      return this.renderError(request, {
        ...resolvedRenderOptions,
        response,
        status: response.status,
        error: response.status === 500 ? null : void 0,
      });
    this.#prepareResponse(response, { addCookieHeader });
    return response;
  }
  #prepareResponse(response, { addCookieHeader }) {
    for (const headerName of [
      REROUTE_DIRECTIVE_HEADER,
      REWRITE_DIRECTIVE_HEADER_KEY,
      NOOP_MIDDLEWARE_HEADER,
      ROUTE_TYPE_HEADER,
    ])
      if (response.headers.has(headerName)) response.headers.delete(headerName);
    if (addCookieHeader)
      for (const setCookieHeaderValue of getSetCookiesFromResponse(response))
        response.headers.append("set-cookie", setCookieHeaderValue);
    Reflect.set(response, responseSentSymbol$1, true);
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
   * For example,
   * ```ts
   * for (const cookie_ of App.getSetCookieFromResponse(response)) {
   *     const cookie: string = cookie_
   * }
   * ```
   * @param response The response to read cookies from.
   * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
   */
  static getSetCookieFromResponse = getSetCookiesFromResponse;
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes
   */
  async renderError(
    request,
    { status, response: originalResponse, skipMiddleware = false, error, ...resolvedRenderOptions },
  ) {
    const errorRouteData = matchRoute(
      `/${status}${this.manifest.trailingSlash === "always" ? "/" : ""}`,
      this.manifestData,
    );
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
        const statusURL = new URL(`${this.baseWithoutTrailingSlash}/${status}${maybeDotHtml}`, url);
        if (
          statusURL.toString() !== request.url &&
          resolvedRenderOptions.prerenderedErrorPageFetch
        ) {
          const response2 = await resolvedRenderOptions.prerenderedErrorPageFetch(
            statusURL.toString(),
          );
          const override = {
            status,
            removeContentEncodingHeaders: true,
          };
          const newResponse = this.mergeResponses(response2, originalResponse, override);
          this.#prepareResponse(newResponse, resolvedRenderOptions);
          return newResponse;
        }
      }
      const mod = await this.pipeline.getComponentByRoute(errorRouteData);
      let session;
      try {
        const renderContext = await this.createRenderContext({
          locals: resolvedRenderOptions.locals,
          pipeline: this.pipeline,
          skipMiddleware,
          pathname: this.getPathnameFromRequest(request),
          request,
          routeData: errorRouteData,
          status,
          props: { error },
          clientAddress: resolvedRenderOptions.clientAddress,
        });
        session = renderContext.session;
        const response2 = await renderContext.render(mod);
        const newResponse = this.mergeResponses(response2, originalResponse);
        this.#prepareResponse(newResponse, resolvedRenderOptions);
        return newResponse;
      } catch {
        if (skipMiddleware === false)
          return this.renderError(request, {
            ...resolvedRenderOptions,
            status,
            response: originalResponse,
            skipMiddleware: true,
          });
      } finally {
        await session?.[PERSIST_SYMBOL]();
      }
    }
    const response = this.mergeResponses(new Response(null, { status }), originalResponse);
    this.#prepareResponse(response, resolvedRenderOptions);
    return response;
  }
  mergeResponses(newResponse, originalResponse, override) {
    let newResponseHeaders = newResponse.headers;
    if (override?.removeContentEncodingHeaders) {
      newResponseHeaders = new Headers(newResponseHeaders);
      newResponseHeaders.delete("Content-Encoding");
      newResponseHeaders.delete("Content-Length");
    }
    if (!originalResponse) {
      if (override !== void 0)
        return new Response(newResponse.body, {
          status: override.status,
          statusText: newResponse.statusText,
          headers: newResponseHeaders,
        });
      return newResponse;
    }
    const status = override?.status
      ? override.status
      : originalResponse.status === 200
        ? newResponse.status
        : originalResponse.status;
    try {
      originalResponse.headers.delete("Content-type");
      originalResponse.headers.delete("Content-Length");
      originalResponse.headers.delete("Transfer-Encoding");
    } catch {}
    const newHeaders = new Headers();
    const seen = /* @__PURE__ */ new Set();
    for (const [name, value] of originalResponse.headers) {
      newHeaders.append(name, value);
      seen.add(name.toLowerCase());
    }
    for (const [name, value] of newResponseHeaders)
      if (!seen.has(name.toLowerCase())) newHeaders.append(name, value);
    const mergedResponse = new Response(newResponse.body, {
      status,
      statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
      headers: newHeaders,
    });
    const originalCookies = getCookiesFromResponse(originalResponse);
    const newCookies = getCookiesFromResponse(newResponse);
    if (originalCookies) {
      if (newCookies)
        for (const cookieValue of AstroCookies.consume(newCookies))
          originalResponse.headers.append("set-cookie", cookieValue);
      attachCookiesToResponse(mergedResponse, originalCookies);
    } else if (newCookies) attachCookiesToResponse(mergedResponse, newCookies);
    return mergedResponse;
  }
  getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.test(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes)
        if (fallbackRoute.pattern.test(pathname)) return 302;
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404")) return 404;
    if (route.endsWith("/500")) return 500;
    return 200;
  }
  getManifest() {
    return this.pipeline.manifest;
  }
  logThisRequest({ pathname, method, statusCode, isRewrite, timeStart }) {
    const timeEnd = performance.now();
    this.logRequest({
      pathname,
      method,
      statusCode,
      isRewrite,
      reqTime: timeEnd - timeStart,
    });
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/utils/getAssetsPrefix.js
function getAssetsPrefix(fileExtension, assetsPrefix) {
  let prefix = "";
  if (!assetsPrefix) prefix = "";
  else if (typeof assetsPrefix === "string") prefix = assetsPrefix;
  else prefix = assetsPrefix[fileExtension.slice(1)] || assetsPrefix.fallback;
  return prefix;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/render/ssr-element.js
const URL_PARSE_BASE = "https://astro.build";
function splitAssetPath(path) {
  const parsed = new URL(path, URL_PARSE_BASE);
  return {
    pathname:
      !URL.canParse(path) && !path.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname,
    suffix: `${parsed.search}${parsed.hash}`,
  };
}
function appendQueryParams(path, queryParams) {
  const queryString = queryParams.toString();
  if (!queryString) return path;
  const hashIndex = path.indexOf("#");
  const basePath = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  return `${basePath}${basePath.includes("?") ? "&" : "?"}${queryString}${hash}`;
}
function createAssetLink(href, base, assetsPrefix, queryParams) {
  const { pathname, suffix } = splitAssetPath(href);
  let url = "";
  if (assetsPrefix)
    url =
      joinPaths(getAssetsPrefix(fileExtension(pathname), assetsPrefix), slash(pathname)) + suffix;
  else if (base) url = prependForwardSlash(joinPaths(base, slash(pathname))) + suffix;
  else url = href;
  if (queryParams) url = appendQueryParams(url, queryParams);
  return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
  if (stylesheet.type === "inline")
    return {
      props: {},
      children: stylesheet.content,
    };
  else
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix, queryParams),
      },
      children: "",
    };
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
  return new Set(
    stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix, queryParams)),
  );
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
  if (script.type === "external")
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix, queryParams);
  else
    return {
      props: { type: "module" },
      children: script.value,
    };
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix, queryParams),
    },
    children: "",
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/logging.js
function createConsoleLogger(level) {
  return new Logger({
    dest: consoleLogDestination,
    level: level ?? "info",
  });
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/pipeline.js
const AppPipeline = class AppPipeline extends Pipeline {
  getName() {
    return "AppPipeline";
  }
  static create({ manifest, streaming }) {
    return new AppPipeline(
      createConsoleLogger(manifest.logLevel),
      manifest,
      "production",
      manifest.renderers,
      async function resolve2(specifier) {
        if (!(specifier in manifest.entryModules))
          throw new Error(`Unable to resolve [${specifier}]`);
        const bundlePath = manifest.entryModules[specifier];
        if (bundlePath.startsWith("data:") || bundlePath.length === 0) return bundlePath;
        else return createAssetLink(bundlePath, manifest.base, manifest.assetsPrefix);
      },
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
    );
  }
  async headElements(routeData) {
    const { assetsPrefix, base } = this.manifest;
    const routeInfo = this.manifest.routes.find(
      (route) => route.routeData.route === routeData.route,
    );
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? [], base, assetsPrefix);
    for (const script of routeInfo?.scripts ?? [])
      if ("stage" in script) {
        if (script.stage === "head-inline")
          scripts.add({
            props: {},
            children: script.children,
          });
      } else scripts.add(createModuleScriptElement(script, base, assetsPrefix));
    return {
      links,
      styles,
      scripts,
    };
  }
  componentMetadata() {}
  async getComponentByRoute(routeData) {
    return (await this.getModuleForRoute(routeData)).page();
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes)
      if (route.component === defaultRoute.component)
        return { page: () => Promise.resolve(defaultRoute.instance) };
    let routeToProcess = route;
    if (routeIsRedirect(route))
      if (route.redirectRoute) routeToProcess = route.redirectRoute;
      else return RedirectSinglePageBuiltModule;
    else if (routeIsFallback(route)) routeToProcess = getFallbackRoute(route, this.manifest.routes);
    if (this.manifest.pageMap) {
      const importComponentInstance = this.manifest.pageMap.get(routeToProcess.component);
      if (!importComponentInstance)
        throw new Error(
          `Unexpectedly unable to find a component instance for route ${route.route}`,
        );
      return await importComponentInstance();
    } else if (this.manifest.pageModule) return this.manifest.pageModule;
    throw new Error(
      "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue.",
    );
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base,
      outDir: this.manifest?.serverLike ? this.manifest.buildClientDir : this.manifest.outDir,
    });
    return {
      newUrl,
      pathname,
      componentInstance: await this.getComponentByRoute(routeData),
      routeData,
    };
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/app.js
const App = class extends BaseApp {
  createPipeline(streaming) {
    return AppPipeline.create({
      manifest: this.manifest,
      streaming,
    });
  }
  isDev() {
    return false;
  }
  logRequest(_options) {}
};
//#endregion
//#region \0astro:react:opts
const _astro_react_opts_default = {
  include: void 0,
  exclude: void 0,
  experimentalReactChildren: false,
  experimentalDisableStreaming: false,
};
//#endregion
//#region ../../node_modules/.bun/react-dom@19.2.4+b1ab299f0a400331/node_modules/react-dom/cjs/react-dom.production.js
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const require_react_dom_production = /* @__PURE__ */ __commonJSMin((exports) => {
  var React = require_react();
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2; i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return (
      "Minified React error #" +
      code +
      "; visit " +
      url +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function noop() {}
  var Internals = {
      d: {
        f: noop,
        r: function () {
          throw Error(formatProdErrorMessage(522));
        },
        D: noop,
        C: noop,
        L: noop,
        m: noop,
        X: noop,
        S: noop,
        M: noop,
      },
      p: 0,
      findDOMNode: null,
    },
    REACT_PORTAL_TYPE = Symbol.for("react.portal");
  function createPortal$1(children, containerInfo, implementation) {
    var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    return {
      $$typeof: REACT_PORTAL_TYPE,
      key: null == key ? null : "" + key,
      children,
      containerInfo,
      implementation,
    };
  }
  var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function getCrossOriginStringAs(as, input) {
    if ("font" === as) return "";
    if ("string" === typeof input) return "use-credentials" === input ? input : "";
  }
  exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  exports.createPortal = function (children, container) {
    var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    if (
      !container ||
      (1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
    )
      throw Error(formatProdErrorMessage(299));
    return createPortal$1(children, container, null, key);
  };
  exports.flushSync = function (fn) {
    var previousTransition = ReactSharedInternals.T,
      previousUpdatePriority = Internals.p;
    try {
      if (((ReactSharedInternals.T = null), (Internals.p = 2), fn)) return fn();
    } finally {
      ((ReactSharedInternals.T = previousTransition),
        (Internals.p = previousUpdatePriority),
        Internals.d.f());
    }
  };
  exports.preconnect = function (href, options) {
    "string" === typeof href &&
      (options
        ? ((options = options.crossOrigin),
          (options =
            "string" === typeof options ? ("use-credentials" === options ? options : "") : void 0))
        : (options = null),
      Internals.d.C(href, options));
  };
  exports.prefetchDNS = function (href) {
    "string" === typeof href && Internals.d.D(href);
  };
  exports.preinit = function (href, options) {
    if ("string" === typeof href && options && "string" === typeof options.as) {
      var as = options.as,
        crossOrigin = getCrossOriginStringAs(as, options.crossOrigin),
        integrity = "string" === typeof options.integrity ? options.integrity : void 0,
        fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
      "style" === as
        ? Internals.d.S(
            href,
            "string" === typeof options.precedence ? options.precedence : void 0,
            {
              crossOrigin,
              integrity,
              fetchPriority,
            },
          )
        : "script" === as &&
          Internals.d.X(href, {
            crossOrigin,
            integrity,
            fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
          });
    }
  };
  exports.preinitModule = function (href, options) {
    if ("string" === typeof href)
      if ("object" === typeof options && null !== options) {
        if (null == options.as || "script" === options.as) {
          var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
          Internals.d.M(href, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
          });
        }
      } else options ?? Internals.d.M(href);
  };
  exports.preload = function (href, options) {
    if (
      "string" === typeof href &&
      "object" === typeof options &&
      null !== options &&
      "string" === typeof options.as
    ) {
      var as = options.as,
        crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      Internals.d.L(href, as, {
        crossOrigin,
        integrity: "string" === typeof options.integrity ? options.integrity : void 0,
        nonce: "string" === typeof options.nonce ? options.nonce : void 0,
        type: "string" === typeof options.type ? options.type : void 0,
        fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
        referrerPolicy:
          "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
        imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
        imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
        media: "string" === typeof options.media ? options.media : void 0,
      });
    }
  };
  exports.preloadModule = function (href, options) {
    if ("string" === typeof href)
      if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0,
        });
      } else Internals.d.m(href);
  };
  exports.requestFormReset = function (form) {
    Internals.d.r(form);
  };
  exports.unstable_batchedUpdates = function (fn, a) {
    return fn(a);
  };
  exports.useFormState = function (action, initialState, permalink) {
    return ReactSharedInternals.H.useFormState(action, initialState, permalink);
  };
  exports.useFormStatus = function () {
    return ReactSharedInternals.H.useHostTransitionStatus();
  };
  exports.version = "19.2.4";
});
//#endregion
//#region ../../node_modules/.bun/react-dom@19.2.4+b1ab299f0a400331/node_modules/react-dom/index.js
const require_react_dom = /* @__PURE__ */ __commonJSMin((exports, module) => {
  function checkDCE() {
    if (
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function"
    )
      return;
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  checkDCE();
  module.exports = require_react_dom_production();
});
//#endregion
//#region ../../node_modules/.bun/react-dom@19.2.4+b1ab299f0a400331/node_modules/react-dom/cjs/react-dom-server.edge.production.js
/**
 * @license React
 * react-dom-server.edge.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const require_react_dom_server_edge_production = /* @__PURE__ */ __commonJSMin((exports) => {
  var React = require_react(),
    ReactDOM = require_react_dom(),
    REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
    REACT_PORTAL_TYPE = Symbol.for("react.portal"),
    REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
    REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
    REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
    REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
    REACT_CONTEXT_TYPE = Symbol.for("react.context"),
    REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
    REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
    REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
    REACT_MEMO_TYPE = Symbol.for("react.memo"),
    REACT_LAZY_TYPE = Symbol.for("react.lazy"),
    REACT_SCOPE_TYPE = Symbol.for("react.scope"),
    REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
    REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden"),
    REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"),
    REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"),
    MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable =
      (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
      maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var isArrayImpl = Array.isArray;
  function murmurhash3_32_gc(key, seed) {
    var remainder = key.length & 3;
    var bytes = key.length - remainder;
    var h1 = seed;
    for (seed = 0; seed < bytes; ) {
      var k1 =
        (key.charCodeAt(seed) & 255) |
        ((key.charCodeAt(++seed) & 255) << 8) |
        ((key.charCodeAt(++seed) & 255) << 16) |
        ((key.charCodeAt(++seed) & 255) << 24);
      ++seed;
      k1 = (3432918353 * (k1 & 65535) + (((3432918353 * (k1 >>> 16)) & 65535) << 16)) & 4294967295;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = (461845907 * (k1 & 65535) + (((461845907 * (k1 >>> 16)) & 65535) << 16)) & 4294967295;
      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1 = (5 * (h1 & 65535) + (((5 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
      h1 = (h1 & 65535) + 27492 + ((((h1 >>> 16) + 58964) & 65535) << 16);
    }
    k1 = 0;
    switch (remainder) {
      case 3:
        k1 ^= (key.charCodeAt(seed + 2) & 255) << 16;
      case 2:
        k1 ^= (key.charCodeAt(seed + 1) & 255) << 8;
      case 1:
        ((k1 ^= key.charCodeAt(seed) & 255),
          (k1 =
            (3432918353 * (k1 & 65535) + (((3432918353 * (k1 >>> 16)) & 65535) << 16)) &
            4294967295),
          (k1 = (k1 << 15) | (k1 >>> 17)),
          (h1 ^=
            (461845907 * (k1 & 65535) + (((461845907 * (k1 >>> 16)) & 65535) << 16)) & 4294967295));
    }
    h1 ^= key.length;
    h1 ^= h1 >>> 16;
    h1 = (2246822507 * (h1 & 65535) + (((2246822507 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
    h1 ^= h1 >>> 13;
    h1 = (3266489909 * (h1 & 65535) + (((3266489909 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
    return (h1 ^ (h1 >>> 16)) >>> 0;
  }
  function handleErrorInNextTick(error) {
    setTimeout(function () {
      throw error;
    });
  }
  var LocalPromise = Promise,
    scheduleMicrotask =
      "function" === typeof queueMicrotask
        ? queueMicrotask
        : function (callback) {
            LocalPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
          },
    currentView = null,
    writtenBytes = 0;
  function writeChunk(destination, chunk) {
    if (0 !== chunk.byteLength)
      if (2048 < chunk.byteLength)
        (0 < writtenBytes &&
          (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)),
          (currentView = new Uint8Array(2048)),
          (writtenBytes = 0)),
          destination.enqueue(chunk));
      else {
        var allowableBytes = currentView.length - writtenBytes;
        allowableBytes < chunk.byteLength &&
          (0 === allowableBytes
            ? destination.enqueue(currentView)
            : (currentView.set(chunk.subarray(0, allowableBytes), writtenBytes),
              destination.enqueue(currentView),
              (chunk = chunk.subarray(allowableBytes))),
          (currentView = new Uint8Array(2048)),
          (writtenBytes = 0));
        currentView.set(chunk, writtenBytes);
        writtenBytes += chunk.byteLength;
      }
  }
  function writeChunkAndReturn(destination, chunk) {
    writeChunk(destination, chunk);
    return !0;
  }
  function completeWriting(destination) {
    currentView &&
      0 < writtenBytes &&
      (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)),
      (currentView = null),
      (writtenBytes = 0));
  }
  var textEncoder = new TextEncoder();
  function stringToChunk(content) {
    return textEncoder.encode(content);
  }
  function stringToPrecomputedChunk(content) {
    return textEncoder.encode(content);
  }
  function byteLengthOfChunk(chunk) {
    return chunk.byteLength;
  }
  function closeWithError(destination, error) {
    "function" === typeof destination.error ? destination.error(error) : destination.close();
  }
  var assign = Object.assign,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    VALID_ATTRIBUTE_NAME_REGEX = RegExp(
      "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
    ),
    illegalAttributeNameCache = {},
    validatedAttributeNameCache = {};
  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
      return (validatedAttributeNameCache[attributeName] = !0);
    illegalAttributeNameCache[attributeName] = !0;
    return !1;
  }
  var unitlessNumbers = new Set(
      "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
        " ",
      ),
    ),
    aliases = new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"],
    ]),
    matchHtmlRegExp = /["'&<>]/;
  function escapeTextForBrowser(text) {
    if ("boolean" === typeof text || "number" === typeof text || "bigint" === typeof text)
      return "" + text;
    text = "" + text;
    var match = matchHtmlRegExp.exec(text);
    if (match) {
      var html = "",
        index,
        lastIndex = 0;
      for (index = match.index; index < text.length; index++) {
        switch (text.charCodeAt(index)) {
          case 34:
            match = "&quot;";
            break;
          case 38:
            match = "&amp;";
            break;
          case 39:
            match = "&#x27;";
            break;
          case 60:
            match = "&lt;";
            break;
          case 62:
            match = "&gt;";
            break;
          default:
            continue;
        }
        lastIndex !== index && (html += text.slice(lastIndex, index));
        lastIndex = index + 1;
        html += match;
      }
      text = lastIndex !== index ? html + text.slice(lastIndex, index) : html;
    }
    return text;
  }
  var uppercasePattern = /([A-Z])/g,
    msPattern = /^ms-/,
    isJavaScriptProtocol =
      /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url)
      ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      : url;
  }
  var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    sharedNotPendingObject = {
      pending: !1,
      data: null,
      method: null,
      action: null,
    },
    previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: previousDispatcher.f,
    r: previousDispatcher.r,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript,
  };
  var PRELOAD_NO_CREDS = [],
    currentlyFlushingRenderState = null;
  stringToPrecomputedChunk('"></template>');
  var startInlineScript = stringToPrecomputedChunk("<script"),
    endInlineScript = stringToPrecomputedChunk("<\/script>"),
    startScriptSrc = stringToPrecomputedChunk('<script src="'),
    startModuleSrc = stringToPrecomputedChunk('<script type="module" src="'),
    scriptNonce = stringToPrecomputedChunk(' nonce="'),
    scriptIntegirty = stringToPrecomputedChunk(' integrity="'),
    scriptCrossOrigin = stringToPrecomputedChunk(' crossorigin="'),
    endAsyncScript = stringToPrecomputedChunk(' async=""><\/script>'),
    startInlineStyle = stringToPrecomputedChunk("<style"),
    scriptRegex = /(<\/|<)(s)(cript)/gi;
  function scriptReplacer(match, prefix, s, suffix) {
    return "" + prefix + ("s" === s ? "\\u0073" : "\\u0053") + suffix;
  }
  var importMapScriptStart = stringToPrecomputedChunk('<script type="importmap">'),
    importMapScriptEnd = stringToPrecomputedChunk("<\/script>");
  function createRenderState(
    resumableState,
    nonce,
    externalRuntimeConfig,
    importMap,
    onHeaders,
    maxHeadersLength,
  ) {
    externalRuntimeConfig = "string" === typeof nonce ? nonce : nonce && nonce.script;
    var inlineScriptWithNonce =
        void 0 === externalRuntimeConfig
          ? startInlineScript
          : stringToPrecomputedChunk(
              '<script nonce="' + escapeTextForBrowser(externalRuntimeConfig) + '"',
            ),
      nonceStyle = "string" === typeof nonce ? void 0 : nonce && nonce.style,
      inlineStyleWithNonce =
        void 0 === nonceStyle
          ? startInlineStyle
          : stringToPrecomputedChunk('<style nonce="' + escapeTextForBrowser(nonceStyle) + '"'),
      idPrefix = resumableState.idPrefix,
      bootstrapChunks = [],
      bootstrapScriptContent = resumableState.bootstrapScriptContent,
      bootstrapScripts = resumableState.bootstrapScripts,
      bootstrapModules = resumableState.bootstrapModules;
    void 0 !== bootstrapScriptContent &&
      (bootstrapChunks.push(inlineScriptWithNonce),
      pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
      bootstrapChunks.push(
        endOfStartTag,
        stringToChunk(("" + bootstrapScriptContent).replace(scriptRegex, scriptReplacer)),
        endInlineScript,
      ));
    bootstrapScriptContent = [];
    void 0 !== importMap &&
      (bootstrapScriptContent.push(importMapScriptStart),
      bootstrapScriptContent.push(
        stringToChunk(("" + JSON.stringify(importMap)).replace(scriptRegex, scriptReplacer)),
      ),
      bootstrapScriptContent.push(importMapScriptEnd));
    importMap = onHeaders
      ? {
          preconnects: "",
          fontPreloads: "",
          highImagePreloads: "",
          remainingCapacity: 2 + ("number" === typeof maxHeadersLength ? maxHeadersLength : 2e3),
        }
      : null;
    onHeaders = {
      placeholderPrefix: stringToPrecomputedChunk(idPrefix + "P:"),
      segmentPrefix: stringToPrecomputedChunk(idPrefix + "S:"),
      boundaryPrefix: stringToPrecomputedChunk(idPrefix + "B:"),
      startInlineScript: inlineScriptWithNonce,
      startInlineStyle: inlineStyleWithNonce,
      preamble: createPreambleState(),
      externalRuntimeScript: null,
      bootstrapChunks,
      importMapChunks: bootstrapScriptContent,
      onHeaders,
      headers: importMap,
      resets: {
        font: {},
        dns: {},
        connect: {
          default: {},
          anonymous: {},
          credentials: {},
        },
        image: {},
        style: {},
      },
      charsetChunks: [],
      viewportChunks: [],
      hoistableChunks: [],
      preconnects: /* @__PURE__ */ new Set(),
      fontPreloads: /* @__PURE__ */ new Set(),
      highImagePreloads: /* @__PURE__ */ new Set(),
      styles: /* @__PURE__ */ new Map(),
      bootstrapScripts: /* @__PURE__ */ new Set(),
      scripts: /* @__PURE__ */ new Set(),
      bulkPreloads: /* @__PURE__ */ new Set(),
      preloads: {
        images: /* @__PURE__ */ new Map(),
        stylesheets: /* @__PURE__ */ new Map(),
        scripts: /* @__PURE__ */ new Map(),
        moduleScripts: /* @__PURE__ */ new Map(),
      },
      nonce: {
        script: externalRuntimeConfig,
        style: nonceStyle,
      },
      hoistableState: null,
      stylesToHoist: !1,
    };
    if (void 0 !== bootstrapScripts)
      for (importMap = 0; importMap < bootstrapScripts.length; importMap++)
        ((idPrefix = bootstrapScripts[importMap]),
          (nonceStyle = inlineScriptWithNonce = void 0),
          (inlineStyleWithNonce = {
            rel: "preload",
            as: "script",
            fetchPriority: "low",
            nonce,
          }),
          "string" === typeof idPrefix
            ? (inlineStyleWithNonce.href = maxHeadersLength = idPrefix)
            : ((inlineStyleWithNonce.href = maxHeadersLength = idPrefix.src),
              (inlineStyleWithNonce.integrity = nonceStyle =
                "string" === typeof idPrefix.integrity ? idPrefix.integrity : void 0),
              (inlineStyleWithNonce.crossOrigin = inlineScriptWithNonce =
                "string" === typeof idPrefix || null == idPrefix.crossOrigin
                  ? void 0
                  : "use-credentials" === idPrefix.crossOrigin
                    ? "use-credentials"
                    : "")),
          (idPrefix = resumableState),
          (bootstrapScriptContent = maxHeadersLength),
          (idPrefix.scriptResources[bootstrapScriptContent] = null),
          (idPrefix.moduleScriptResources[bootstrapScriptContent] = null),
          (idPrefix = []),
          pushLinkImpl(idPrefix, inlineStyleWithNonce),
          onHeaders.bootstrapScripts.add(idPrefix),
          bootstrapChunks.push(
            startScriptSrc,
            stringToChunk(escapeTextForBrowser(maxHeadersLength)),
            attributeEnd,
          ),
          externalRuntimeConfig &&
            bootstrapChunks.push(
              scriptNonce,
              stringToChunk(escapeTextForBrowser(externalRuntimeConfig)),
              attributeEnd,
            ),
          "string" === typeof nonceStyle &&
            bootstrapChunks.push(
              scriptIntegirty,
              stringToChunk(escapeTextForBrowser(nonceStyle)),
              attributeEnd,
            ),
          "string" === typeof inlineScriptWithNonce &&
            bootstrapChunks.push(
              scriptCrossOrigin,
              stringToChunk(escapeTextForBrowser(inlineScriptWithNonce)),
              attributeEnd,
            ),
          pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
          bootstrapChunks.push(endAsyncScript));
    if (void 0 !== bootstrapModules)
      for (nonce = 0; nonce < bootstrapModules.length; nonce++)
        ((nonceStyle = bootstrapModules[nonce]),
          (maxHeadersLength = importMap = void 0),
          (inlineScriptWithNonce = {
            rel: "modulepreload",
            fetchPriority: "low",
            nonce: externalRuntimeConfig,
          }),
          "string" === typeof nonceStyle
            ? (inlineScriptWithNonce.href = bootstrapScripts = nonceStyle)
            : ((inlineScriptWithNonce.href = bootstrapScripts = nonceStyle.src),
              (inlineScriptWithNonce.integrity = maxHeadersLength =
                "string" === typeof nonceStyle.integrity ? nonceStyle.integrity : void 0),
              (inlineScriptWithNonce.crossOrigin = importMap =
                "string" === typeof nonceStyle || null == nonceStyle.crossOrigin
                  ? void 0
                  : "use-credentials" === nonceStyle.crossOrigin
                    ? "use-credentials"
                    : "")),
          (nonceStyle = resumableState),
          (inlineStyleWithNonce = bootstrapScripts),
          (nonceStyle.scriptResources[inlineStyleWithNonce] = null),
          (nonceStyle.moduleScriptResources[inlineStyleWithNonce] = null),
          (nonceStyle = []),
          pushLinkImpl(nonceStyle, inlineScriptWithNonce),
          onHeaders.bootstrapScripts.add(nonceStyle),
          bootstrapChunks.push(
            startModuleSrc,
            stringToChunk(escapeTextForBrowser(bootstrapScripts)),
            attributeEnd,
          ),
          externalRuntimeConfig &&
            bootstrapChunks.push(
              scriptNonce,
              stringToChunk(escapeTextForBrowser(externalRuntimeConfig)),
              attributeEnd,
            ),
          "string" === typeof maxHeadersLength &&
            bootstrapChunks.push(
              scriptIntegirty,
              stringToChunk(escapeTextForBrowser(maxHeadersLength)),
              attributeEnd,
            ),
          "string" === typeof importMap &&
            bootstrapChunks.push(
              scriptCrossOrigin,
              stringToChunk(escapeTextForBrowser(importMap)),
              attributeEnd,
            ),
          pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
          bootstrapChunks.push(endAsyncScript));
    return onHeaders;
  }
  function createResumableState(
    identifierPrefix,
    externalRuntimeConfig,
    bootstrapScriptContent,
    bootstrapScripts,
    bootstrapModules,
  ) {
    return {
      idPrefix: void 0 === identifierPrefix ? "" : identifierPrefix,
      nextFormID: 0,
      streamingFormat: 0,
      bootstrapScriptContent,
      bootstrapScripts,
      bootstrapModules,
      instructions: 0,
      hasBody: !1,
      hasHtml: !1,
      unknownResources: {},
      dnsResources: {},
      connectResources: {
        default: {},
        anonymous: {},
        credentials: {},
      },
      imageResources: {},
      styleResources: {},
      scriptResources: {},
      moduleUnknownResources: {},
      moduleScriptResources: {},
    };
  }
  function createPreambleState() {
    return {
      htmlChunks: null,
      headChunks: null,
      bodyChunks: null,
    };
  }
  function createFormatContext(insertionMode, selectedValue, tagScope, viewTransition) {
    return {
      insertionMode,
      selectedValue,
      tagScope,
      viewTransition,
    };
  }
  function createRootFormatContext(namespaceURI) {
    return createFormatContext(
      "http://www.w3.org/2000/svg" === namespaceURI
        ? 4
        : "http://www.w3.org/1998/Math/MathML" === namespaceURI
          ? 5
          : 0,
      null,
      0,
      null,
    );
  }
  function getChildFormatContext(parentContext, type, props) {
    var subtreeScope = parentContext.tagScope & -25;
    switch (type) {
      case "noscript":
        return createFormatContext(2, null, subtreeScope | 1, null);
      case "select":
        return createFormatContext(
          2,
          null != props.value ? props.value : props.defaultValue,
          subtreeScope,
          null,
        );
      case "svg":
        return createFormatContext(4, null, subtreeScope, null);
      case "picture":
        return createFormatContext(2, null, subtreeScope | 2, null);
      case "math":
        return createFormatContext(5, null, subtreeScope, null);
      case "foreignObject":
        return createFormatContext(2, null, subtreeScope, null);
      case "table":
        return createFormatContext(6, null, subtreeScope, null);
      case "thead":
      case "tbody":
      case "tfoot":
        return createFormatContext(7, null, subtreeScope, null);
      case "colgroup":
        return createFormatContext(9, null, subtreeScope, null);
      case "tr":
        return createFormatContext(8, null, subtreeScope, null);
      case "head":
        if (2 > parentContext.insertionMode)
          return createFormatContext(3, null, subtreeScope, null);
        break;
      case "html":
        if (0 === parentContext.insertionMode)
          return createFormatContext(1, null, subtreeScope, null);
    }
    return 6 <= parentContext.insertionMode || 2 > parentContext.insertionMode
      ? createFormatContext(2, null, subtreeScope, null)
      : parentContext.tagScope !== subtreeScope
        ? createFormatContext(
            parentContext.insertionMode,
            parentContext.selectedValue,
            subtreeScope,
            null,
          )
        : parentContext;
  }
  function getSuspenseViewTransition(parentViewTransition) {
    return null === parentViewTransition
      ? null
      : {
          update: parentViewTransition.update,
          enter: "none",
          exit: "none",
          share: parentViewTransition.update,
          name: parentViewTransition.autoName,
          autoName: parentViewTransition.autoName,
          nameIdx: 0,
        };
  }
  function getSuspenseFallbackFormatContext(resumableState, parentContext) {
    parentContext.tagScope & 32 && (resumableState.instructions |= 128);
    return createFormatContext(
      parentContext.insertionMode,
      parentContext.selectedValue,
      parentContext.tagScope | 12,
      getSuspenseViewTransition(parentContext.viewTransition),
    );
  }
  function getSuspenseContentFormatContext(resumableState, parentContext) {
    resumableState = getSuspenseViewTransition(parentContext.viewTransition);
    var subtreeScope = parentContext.tagScope | 16;
    null !== resumableState && "none" !== resumableState.share && (subtreeScope |= 64);
    return createFormatContext(
      parentContext.insertionMode,
      parentContext.selectedValue,
      subtreeScope,
      resumableState,
    );
  }
  var textSeparator = stringToPrecomputedChunk("<!-- -->");
  function pushTextInstance(target, text, renderState, textEmbedded) {
    if ("" === text) return textEmbedded;
    textEmbedded && target.push(textSeparator);
    target.push(stringToChunk(escapeTextForBrowser(text)));
    return !0;
  }
  var styleNameCache = /* @__PURE__ */ new Map(),
    styleAttributeStart = stringToPrecomputedChunk(' style="'),
    styleAssign = stringToPrecomputedChunk(":"),
    styleSeparator = stringToPrecomputedChunk(";");
  function pushStyleAttribute(target, style) {
    if ("object" !== typeof style)
      throw Error(
        "The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.",
      );
    var isFirst = !0,
      styleName;
    for (styleName in style)
      if (hasOwnProperty.call(style, styleName)) {
        var styleValue = style[styleName];
        if (null != styleValue && "boolean" !== typeof styleValue && "" !== styleValue) {
          if (0 === styleName.indexOf("--")) {
            var nameChunk = stringToChunk(escapeTextForBrowser(styleName));
            styleValue = stringToChunk(escapeTextForBrowser(("" + styleValue).trim()));
          } else
            ((nameChunk = styleNameCache.get(styleName)),
              void 0 === nameChunk &&
                ((nameChunk = stringToPrecomputedChunk(
                  escapeTextForBrowser(
                    styleName
                      .replace(uppercasePattern, "-$1")
                      .toLowerCase()
                      .replace(msPattern, "-ms-"),
                  ),
                )),
                styleNameCache.set(styleName, nameChunk)),
              (styleValue =
                "number" === typeof styleValue
                  ? 0 === styleValue || unitlessNumbers.has(styleName)
                    ? stringToChunk("" + styleValue)
                    : stringToChunk(styleValue + "px")
                  : stringToChunk(escapeTextForBrowser(("" + styleValue).trim()))));
          isFirst
            ? ((isFirst = !1), target.push(styleAttributeStart, nameChunk, styleAssign, styleValue))
            : target.push(styleSeparator, nameChunk, styleAssign, styleValue);
        }
      }
    isFirst || target.push(attributeEnd);
  }
  var attributeSeparator = stringToPrecomputedChunk(" "),
    attributeAssign = stringToPrecomputedChunk('="'),
    attributeEnd = stringToPrecomputedChunk('"'),
    attributeEmptyString = stringToPrecomputedChunk('=""');
  function pushBooleanAttribute(target, name, value) {
    value &&
      "function" !== typeof value &&
      "symbol" !== typeof value &&
      target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
  }
  function pushStringAttribute(target, name, value) {
    "function" !== typeof value &&
      "symbol" !== typeof value &&
      "boolean" !== typeof value &&
      target.push(
        attributeSeparator,
        stringToChunk(name),
        attributeAssign,
        stringToChunk(escapeTextForBrowser(value)),
        attributeEnd,
      );
  }
  var actionJavaScriptURL = stringToPrecomputedChunk(
      escapeTextForBrowser("javascript:throw new Error('React form unexpectedly submitted.')"),
    ),
    startHiddenInputChunk = stringToPrecomputedChunk('<input type="hidden"');
  function pushAdditionalFormField(value, key) {
    this.push(startHiddenInputChunk);
    validateAdditionalFormField(value);
    pushStringAttribute(this, "name", key);
    pushStringAttribute(this, "value", value);
    this.push(endOfStartTagSelfClosing);
  }
  function validateAdditionalFormField(value) {
    if ("string" !== typeof value)
      throw Error(
        "File/Blob fields are not yet supported in progressive forms. Will fallback to client hydration.",
      );
  }
  function getCustomFormFields(resumableState, formAction) {
    if ("function" === typeof formAction.$$FORM_ACTION) {
      var id = resumableState.nextFormID++;
      resumableState = resumableState.idPrefix + id;
      try {
        var customFields = formAction.$$FORM_ACTION(resumableState);
        if (customFields) customFields.data?.forEach(validateAdditionalFormField);
        return customFields;
      } catch (x) {
        if ("object" === typeof x && null !== x && "function" === typeof x.then) throw x;
      }
    }
    return null;
  }
  function pushFormActionAttribute(
    target,
    resumableState,
    renderState,
    formAction,
    formEncType,
    formMethod,
    formTarget,
    name,
  ) {
    var formData = null;
    if ("function" === typeof formAction) {
      var customFields = getCustomFormFields(resumableState, formAction);
      null !== customFields
        ? ((name = customFields.name),
          (formAction = customFields.action || ""),
          (formEncType = customFields.encType),
          (formMethod = customFields.method),
          (formTarget = customFields.target),
          (formData = customFields.data))
        : (target.push(
            attributeSeparator,
            stringToChunk("formAction"),
            attributeAssign,
            actionJavaScriptURL,
            attributeEnd,
          ),
          (formTarget = formMethod = formEncType = formAction = name = null),
          injectFormReplayingRuntime(resumableState, renderState));
    }
    null != name && pushAttribute(target, "name", name);
    null != formAction && pushAttribute(target, "formAction", formAction);
    null != formEncType && pushAttribute(target, "formEncType", formEncType);
    null != formMethod && pushAttribute(target, "formMethod", formMethod);
    null != formTarget && pushAttribute(target, "formTarget", formTarget);
    return formData;
  }
  function pushAttribute(target, name, value) {
    switch (name) {
      case "className":
        pushStringAttribute(target, "class", value);
        break;
      case "tabIndex":
        pushStringAttribute(target, "tabindex", value);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        pushStringAttribute(target, name, value);
        break;
      case "style":
        pushStyleAttribute(target, value);
        break;
      case "src":
      case "href":
        if ("" === value) break;
      case "action":
      case "formAction":
        if (
          null == value ||
          "function" === typeof value ||
          "symbol" === typeof value ||
          "boolean" === typeof value
        )
          break;
        value = sanitizeURL("" + value);
        target.push(
          attributeSeparator,
          stringToChunk(name),
          attributeAssign,
          stringToChunk(escapeTextForBrowser(value)),
          attributeEnd,
        );
        break;
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "ref":
        break;
      case "autoFocus":
      case "multiple":
      case "muted":
        pushBooleanAttribute(target, name.toLowerCase(), value);
        break;
      case "xlinkHref":
        if ("function" === typeof value || "symbol" === typeof value || "boolean" === typeof value)
          break;
        value = sanitizeURL("" + value);
        target.push(
          attributeSeparator,
          stringToChunk("xlink:href"),
          attributeAssign,
          stringToChunk(escapeTextForBrowser(value)),
          attributeEnd,
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        "function" !== typeof value &&
          "symbol" !== typeof value &&
          target.push(
            attributeSeparator,
            stringToChunk(name),
            attributeAssign,
            stringToChunk(escapeTextForBrowser(value)),
            attributeEnd,
          );
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        value &&
          "function" !== typeof value &&
          "symbol" !== typeof value &&
          target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
        break;
      case "capture":
      case "download":
        !0 === value
          ? target.push(attributeSeparator, stringToChunk(name), attributeEmptyString)
          : !1 !== value &&
            "function" !== typeof value &&
            "symbol" !== typeof value &&
            target.push(
              attributeSeparator,
              stringToChunk(name),
              attributeAssign,
              stringToChunk(escapeTextForBrowser(value)),
              attributeEnd,
            );
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        "function" !== typeof value &&
          "symbol" !== typeof value &&
          !isNaN(value) &&
          1 <= value &&
          target.push(
            attributeSeparator,
            stringToChunk(name),
            attributeAssign,
            stringToChunk(escapeTextForBrowser(value)),
            attributeEnd,
          );
        break;
      case "rowSpan":
      case "start":
        "function" === typeof value ||
          "symbol" === typeof value ||
          isNaN(value) ||
          target.push(
            attributeSeparator,
            stringToChunk(name),
            attributeAssign,
            stringToChunk(escapeTextForBrowser(value)),
            attributeEnd,
          );
        break;
      case "xlinkActuate":
        pushStringAttribute(target, "xlink:actuate", value);
        break;
      case "xlinkArcrole":
        pushStringAttribute(target, "xlink:arcrole", value);
        break;
      case "xlinkRole":
        pushStringAttribute(target, "xlink:role", value);
        break;
      case "xlinkShow":
        pushStringAttribute(target, "xlink:show", value);
        break;
      case "xlinkTitle":
        pushStringAttribute(target, "xlink:title", value);
        break;
      case "xlinkType":
        pushStringAttribute(target, "xlink:type", value);
        break;
      case "xmlBase":
        pushStringAttribute(target, "xml:base", value);
        break;
      case "xmlLang":
        pushStringAttribute(target, "xml:lang", value);
        break;
      case "xmlSpace":
        pushStringAttribute(target, "xml:space", value);
        break;
      default:
        if (
          !(2 < name.length) ||
          ("o" !== name[0] && "O" !== name[0]) ||
          ("n" !== name[1] && "N" !== name[1])
        ) {
          if (((name = aliases.get(name) || name), isAttributeNameSafe(name))) {
            switch (typeof value) {
              case "function":
              case "symbol":
                return;
              case "boolean":
                var prefix$8 = name.toLowerCase().slice(0, 5);
                if ("data-" !== prefix$8 && "aria-" !== prefix$8) return;
            }
            target.push(
              attributeSeparator,
              stringToChunk(name),
              attributeAssign,
              stringToChunk(escapeTextForBrowser(value)),
              attributeEnd,
            );
          }
        }
    }
  }
  var endOfStartTag = stringToPrecomputedChunk(">"),
    endOfStartTagSelfClosing = stringToPrecomputedChunk("/>");
  function pushInnerHTML(target, innerHTML, children) {
    if (null != innerHTML) {
      if (null != children)
        throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
      if ("object" !== typeof innerHTML || !("__html" in innerHTML))
        throw Error(
          "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.",
        );
      innerHTML = innerHTML.__html;
      null !== innerHTML && void 0 !== innerHTML && target.push(stringToChunk("" + innerHTML));
    }
  }
  function flattenOptionChildren(children) {
    var content = "";
    React.Children.forEach(children, function (child) {
      null != child && (content += child);
    });
    return content;
  }
  var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""'),
    formReplayingRuntimeScript = stringToPrecomputedChunk(
      'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});',
    );
  function injectFormReplayingRuntime(resumableState, renderState) {
    if (0 === (resumableState.instructions & 16)) {
      resumableState.instructions |= 16;
      var preamble = renderState.preamble,
        bootstrapChunks = renderState.bootstrapChunks;
      (preamble.htmlChunks || preamble.headChunks) && 0 === bootstrapChunks.length
        ? (bootstrapChunks.push(renderState.startInlineScript),
          pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
          bootstrapChunks.push(endOfStartTag, formReplayingRuntimeScript, endInlineScript))
        : bootstrapChunks.unshift(
            renderState.startInlineScript,
            endOfStartTag,
            formReplayingRuntimeScript,
            endInlineScript,
          );
    }
  }
  var formStateMarkerIsMatching = stringToPrecomputedChunk("<!--F!-->"),
    formStateMarkerIsNotMatching = stringToPrecomputedChunk("<!--F-->");
  function pushLinkImpl(target, props) {
    target.push(startChunkForTag("link"));
    for (var propKey in props)
      if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue)
          switch (propKey) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(
                "link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.",
              );
            default:
              pushAttribute(target, propKey, propValue);
          }
      }
    target.push(endOfStartTagSelfClosing);
    return null;
  }
  var styleRegex = /(<\/|<)(s)(tyle)/gi;
  function styleReplacer(match, prefix, s, suffix) {
    return "" + prefix + ("s" === s ? "\\73 " : "\\53 ") + suffix;
  }
  function pushSelfClosing(target, props, tag) {
    target.push(startChunkForTag(tag));
    for (var propKey in props)
      if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue)
          switch (propKey) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(
                tag +
                  " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.",
              );
            default:
              pushAttribute(target, propKey, propValue);
          }
      }
    target.push(endOfStartTagSelfClosing);
    return null;
  }
  function pushTitleImpl(target, props) {
    target.push(startChunkForTag("title"));
    var children = null,
      innerHTML = null,
      propKey;
    for (propKey in props)
      if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue)
          switch (propKey) {
            case "children":
              children = propValue;
              break;
            case "dangerouslySetInnerHTML":
              innerHTML = propValue;
              break;
            default:
              pushAttribute(target, propKey, propValue);
          }
      }
    target.push(endOfStartTag);
    props = Array.isArray(children) ? (2 > children.length ? children[0] : null) : children;
    "function" !== typeof props &&
      "symbol" !== typeof props &&
      null !== props &&
      void 0 !== props &&
      target.push(stringToChunk(escapeTextForBrowser("" + props)));
    pushInnerHTML(target, innerHTML, children);
    target.push(endChunkForTag("title"));
    return null;
  }
  var headPreambleContributionChunk = stringToPrecomputedChunk("<!--head-->"),
    bodyPreambleContributionChunk = stringToPrecomputedChunk("<!--body-->"),
    htmlPreambleContributionChunk = stringToPrecomputedChunk("<!--html-->");
  function pushScriptImpl(target, props) {
    target.push(startChunkForTag("script"));
    var children = null,
      innerHTML = null,
      propKey;
    for (propKey in props)
      if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue)
          switch (propKey) {
            case "children":
              children = propValue;
              break;
            case "dangerouslySetInnerHTML":
              innerHTML = propValue;
              break;
            default:
              pushAttribute(target, propKey, propValue);
          }
      }
    target.push(endOfStartTag);
    pushInnerHTML(target, innerHTML, children);
    "string" === typeof children &&
      target.push(stringToChunk(("" + children).replace(scriptRegex, scriptReplacer)));
    target.push(endChunkForTag("script"));
    return null;
  }
  function pushStartSingletonElement(target, props, tag) {
    target.push(startChunkForTag(tag));
    var innerHTML = (tag = null),
      propKey;
    for (propKey in props)
      if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue)
          switch (propKey) {
            case "children":
              tag = propValue;
              break;
            case "dangerouslySetInnerHTML":
              innerHTML = propValue;
              break;
            default:
              pushAttribute(target, propKey, propValue);
          }
      }
    target.push(endOfStartTag);
    pushInnerHTML(target, innerHTML, tag);
    return tag;
  }
  function pushStartGenericElement(target, props, tag) {
    target.push(startChunkForTag(tag));
    var innerHTML = (tag = null),
      propKey;
    for (propKey in props)
      if (hasOwnProperty.call(props, propKey)) {
        var propValue = props[propKey];
        if (null != propValue)
          switch (propKey) {
            case "children":
              tag = propValue;
              break;
            case "dangerouslySetInnerHTML":
              innerHTML = propValue;
              break;
            default:
              pushAttribute(target, propKey, propValue);
          }
      }
    target.push(endOfStartTag);
    pushInnerHTML(target, innerHTML, tag);
    return "string" === typeof tag
      ? (target.push(stringToChunk(escapeTextForBrowser(tag))), null)
      : tag;
  }
  var leadingNewline = stringToPrecomputedChunk("\n"),
    VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,
    validatedTagCache = /* @__PURE__ */ new Map();
  function startChunkForTag(tag) {
    var tagStartChunk = validatedTagCache.get(tag);
    if (void 0 === tagStartChunk) {
      if (!VALID_TAG_REGEX.test(tag)) throw Error("Invalid tag: " + tag);
      tagStartChunk = stringToPrecomputedChunk("<" + tag);
      validatedTagCache.set(tag, tagStartChunk);
    }
    return tagStartChunk;
  }
  var doctypeChunk = stringToPrecomputedChunk("<!DOCTYPE html>");
  function pushStartInstance(
    target$jscomp$0,
    type,
    props,
    resumableState,
    renderState,
    preambleState,
    hoistableState,
    formatContext,
    textEmbedded,
  ) {
    switch (type) {
      case "div":
      case "span":
      case "svg":
      case "path":
        break;
      case "a":
        target$jscomp$0.push(startChunkForTag("a"));
        var children = null,
          innerHTML = null,
          propKey;
        for (propKey in props)
          if (hasOwnProperty.call(props, propKey)) {
            var propValue = props[propKey];
            if (null != propValue)
              switch (propKey) {
                case "children":
                  children = propValue;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML = propValue;
                  break;
                case "href":
                  "" === propValue
                    ? pushStringAttribute(target$jscomp$0, "href", "")
                    : pushAttribute(target$jscomp$0, propKey, propValue);
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey, propValue);
              }
          }
        target$jscomp$0.push(endOfStartTag);
        pushInnerHTML(target$jscomp$0, innerHTML, children);
        if ("string" === typeof children) {
          target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children)));
          var JSCompiler_inline_result = null;
        } else JSCompiler_inline_result = children;
        return JSCompiler_inline_result;
      case "g":
      case "p":
      case "li":
        break;
      case "select":
        target$jscomp$0.push(startChunkForTag("select"));
        var children$jscomp$0 = null,
          innerHTML$jscomp$0 = null,
          propKey$jscomp$0;
        for (propKey$jscomp$0 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$0)) {
            var propValue$jscomp$0 = props[propKey$jscomp$0];
            if (null != propValue$jscomp$0)
              switch (propKey$jscomp$0) {
                case "children":
                  children$jscomp$0 = propValue$jscomp$0;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$0 = propValue$jscomp$0;
                  break;
                case "defaultValue":
                case "value":
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$0, propValue$jscomp$0);
              }
          }
        target$jscomp$0.push(endOfStartTag);
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$0, children$jscomp$0);
        return children$jscomp$0;
      case "option":
        var selectedValue = formatContext.selectedValue;
        target$jscomp$0.push(startChunkForTag("option"));
        var children$jscomp$1 = null,
          value = null,
          selected = null,
          innerHTML$jscomp$1 = null,
          propKey$jscomp$1;
        for (propKey$jscomp$1 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$1)) {
            var propValue$jscomp$1 = props[propKey$jscomp$1];
            if (null != propValue$jscomp$1)
              switch (propKey$jscomp$1) {
                case "children":
                  children$jscomp$1 = propValue$jscomp$1;
                  break;
                case "selected":
                  selected = propValue$jscomp$1;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$1 = propValue$jscomp$1;
                  break;
                case "value":
                  value = propValue$jscomp$1;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$1, propValue$jscomp$1);
              }
          }
        if (null != selectedValue) {
          var stringValue = null !== value ? "" + value : flattenOptionChildren(children$jscomp$1);
          if (isArrayImpl(selectedValue)) {
            for (var i = 0; i < selectedValue.length; i++)
              if ("" + selectedValue[i] === stringValue) {
                target$jscomp$0.push(selectedMarkerAttribute);
                break;
              }
          } else
            "" + selectedValue === stringValue && target$jscomp$0.push(selectedMarkerAttribute);
        } else selected && target$jscomp$0.push(selectedMarkerAttribute);
        target$jscomp$0.push(endOfStartTag);
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$1, children$jscomp$1);
        return children$jscomp$1;
      case "textarea":
        target$jscomp$0.push(startChunkForTag("textarea"));
        var value$jscomp$0 = null,
          defaultValue = null,
          children$jscomp$2 = null,
          propKey$jscomp$2;
        for (propKey$jscomp$2 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$2)) {
            var propValue$jscomp$2 = props[propKey$jscomp$2];
            if (null != propValue$jscomp$2)
              switch (propKey$jscomp$2) {
                case "children":
                  children$jscomp$2 = propValue$jscomp$2;
                  break;
                case "value":
                  value$jscomp$0 = propValue$jscomp$2;
                  break;
                case "defaultValue":
                  defaultValue = propValue$jscomp$2;
                  break;
                case "dangerouslySetInnerHTML":
                  throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$2, propValue$jscomp$2);
              }
          }
        null === value$jscomp$0 && null !== defaultValue && (value$jscomp$0 = defaultValue);
        target$jscomp$0.push(endOfStartTag);
        if (null != children$jscomp$2) {
          if (null != value$jscomp$0)
            throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
          if (isArrayImpl(children$jscomp$2)) {
            if (1 < children$jscomp$2.length)
              throw Error("<textarea> can only have at most one child.");
            value$jscomp$0 = "" + children$jscomp$2[0];
          }
          value$jscomp$0 = "" + children$jscomp$2;
        }
        "string" === typeof value$jscomp$0 &&
          "\n" === value$jscomp$0[0] &&
          target$jscomp$0.push(leadingNewline);
        null !== value$jscomp$0 &&
          target$jscomp$0.push(stringToChunk(escapeTextForBrowser("" + value$jscomp$0)));
        return null;
      case "input":
        target$jscomp$0.push(startChunkForTag("input"));
        var name = null,
          formAction = null,
          formEncType = null,
          formMethod = null,
          formTarget = null,
          value$jscomp$1 = null,
          defaultValue$jscomp$0 = null,
          checked = null,
          defaultChecked = null,
          propKey$jscomp$3;
        for (propKey$jscomp$3 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$3)) {
            var propValue$jscomp$3 = props[propKey$jscomp$3];
            if (null != propValue$jscomp$3)
              switch (propKey$jscomp$3) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(
                    "input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.",
                  );
                case "name":
                  name = propValue$jscomp$3;
                  break;
                case "formAction":
                  formAction = propValue$jscomp$3;
                  break;
                case "formEncType":
                  formEncType = propValue$jscomp$3;
                  break;
                case "formMethod":
                  formMethod = propValue$jscomp$3;
                  break;
                case "formTarget":
                  formTarget = propValue$jscomp$3;
                  break;
                case "defaultChecked":
                  defaultChecked = propValue$jscomp$3;
                  break;
                case "defaultValue":
                  defaultValue$jscomp$0 = propValue$jscomp$3;
                  break;
                case "checked":
                  checked = propValue$jscomp$3;
                  break;
                case "value":
                  value$jscomp$1 = propValue$jscomp$3;
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$3, propValue$jscomp$3);
              }
          }
        var formData = pushFormActionAttribute(
          target$jscomp$0,
          resumableState,
          renderState,
          formAction,
          formEncType,
          formMethod,
          formTarget,
          name,
        );
        null !== checked
          ? pushBooleanAttribute(target$jscomp$0, "checked", checked)
          : null !== defaultChecked &&
            pushBooleanAttribute(target$jscomp$0, "checked", defaultChecked);
        null !== value$jscomp$1
          ? pushAttribute(target$jscomp$0, "value", value$jscomp$1)
          : null !== defaultValue$jscomp$0 &&
            pushAttribute(target$jscomp$0, "value", defaultValue$jscomp$0);
        target$jscomp$0.push(endOfStartTagSelfClosing);
        formData?.forEach(pushAdditionalFormField, target$jscomp$0);
        return null;
      case "button":
        target$jscomp$0.push(startChunkForTag("button"));
        var children$jscomp$3 = null,
          innerHTML$jscomp$2 = null,
          name$jscomp$0 = null,
          formAction$jscomp$0 = null,
          formEncType$jscomp$0 = null,
          formMethod$jscomp$0 = null,
          formTarget$jscomp$0 = null,
          propKey$jscomp$4;
        for (propKey$jscomp$4 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$4)) {
            var propValue$jscomp$4 = props[propKey$jscomp$4];
            if (null != propValue$jscomp$4)
              switch (propKey$jscomp$4) {
                case "children":
                  children$jscomp$3 = propValue$jscomp$4;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$2 = propValue$jscomp$4;
                  break;
                case "name":
                  name$jscomp$0 = propValue$jscomp$4;
                  break;
                case "formAction":
                  formAction$jscomp$0 = propValue$jscomp$4;
                  break;
                case "formEncType":
                  formEncType$jscomp$0 = propValue$jscomp$4;
                  break;
                case "formMethod":
                  formMethod$jscomp$0 = propValue$jscomp$4;
                  break;
                case "formTarget":
                  formTarget$jscomp$0 = propValue$jscomp$4;
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$4, propValue$jscomp$4);
              }
          }
        var formData$jscomp$0 = pushFormActionAttribute(
          target$jscomp$0,
          resumableState,
          renderState,
          formAction$jscomp$0,
          formEncType$jscomp$0,
          formMethod$jscomp$0,
          formTarget$jscomp$0,
          name$jscomp$0,
        );
        target$jscomp$0.push(endOfStartTag);
        formData$jscomp$0?.forEach(pushAdditionalFormField, target$jscomp$0);
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$2, children$jscomp$3);
        if ("string" === typeof children$jscomp$3) {
          target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children$jscomp$3)));
          var JSCompiler_inline_result$jscomp$0 = null;
        } else JSCompiler_inline_result$jscomp$0 = children$jscomp$3;
        return JSCompiler_inline_result$jscomp$0;
      case "form":
        target$jscomp$0.push(startChunkForTag("form"));
        var children$jscomp$4 = null,
          innerHTML$jscomp$3 = null,
          formAction$jscomp$1 = null,
          formEncType$jscomp$1 = null,
          formMethod$jscomp$1 = null,
          formTarget$jscomp$1 = null,
          propKey$jscomp$5;
        for (propKey$jscomp$5 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$5)) {
            var propValue$jscomp$5 = props[propKey$jscomp$5];
            if (null != propValue$jscomp$5)
              switch (propKey$jscomp$5) {
                case "children":
                  children$jscomp$4 = propValue$jscomp$5;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$3 = propValue$jscomp$5;
                  break;
                case "action":
                  formAction$jscomp$1 = propValue$jscomp$5;
                  break;
                case "encType":
                  formEncType$jscomp$1 = propValue$jscomp$5;
                  break;
                case "method":
                  formMethod$jscomp$1 = propValue$jscomp$5;
                  break;
                case "target":
                  formTarget$jscomp$1 = propValue$jscomp$5;
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$5, propValue$jscomp$5);
              }
          }
        var formData$jscomp$1 = null,
          formActionName = null;
        if ("function" === typeof formAction$jscomp$1) {
          var customFields = getCustomFormFields(resumableState, formAction$jscomp$1);
          null !== customFields
            ? ((formAction$jscomp$1 = customFields.action || ""),
              (formEncType$jscomp$1 = customFields.encType),
              (formMethod$jscomp$1 = customFields.method),
              (formTarget$jscomp$1 = customFields.target),
              (formData$jscomp$1 = customFields.data),
              (formActionName = customFields.name))
            : (target$jscomp$0.push(
                attributeSeparator,
                stringToChunk("action"),
                attributeAssign,
                actionJavaScriptURL,
                attributeEnd,
              ),
              (formTarget$jscomp$1 =
                formMethod$jscomp$1 =
                formEncType$jscomp$1 =
                formAction$jscomp$1 =
                  null),
              injectFormReplayingRuntime(resumableState, renderState));
        }
        null != formAction$jscomp$1 &&
          pushAttribute(target$jscomp$0, "action", formAction$jscomp$1);
        null != formEncType$jscomp$1 &&
          pushAttribute(target$jscomp$0, "encType", formEncType$jscomp$1);
        null != formMethod$jscomp$1 &&
          pushAttribute(target$jscomp$0, "method", formMethod$jscomp$1);
        null != formTarget$jscomp$1 &&
          pushAttribute(target$jscomp$0, "target", formTarget$jscomp$1);
        target$jscomp$0.push(endOfStartTag);
        null !== formActionName &&
          (target$jscomp$0.push(startHiddenInputChunk),
          pushStringAttribute(target$jscomp$0, "name", formActionName),
          target$jscomp$0.push(endOfStartTagSelfClosing),
          formData$jscomp$1?.forEach(pushAdditionalFormField, target$jscomp$0));
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$3, children$jscomp$4);
        if ("string" === typeof children$jscomp$4) {
          target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children$jscomp$4)));
          var JSCompiler_inline_result$jscomp$1 = null;
        } else JSCompiler_inline_result$jscomp$1 = children$jscomp$4;
        return JSCompiler_inline_result$jscomp$1;
      case "menuitem":
        target$jscomp$0.push(startChunkForTag("menuitem"));
        for (var propKey$jscomp$6 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$6)) {
            var propValue$jscomp$6 = props[propKey$jscomp$6];
            if (null != propValue$jscomp$6)
              switch (propKey$jscomp$6) {
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$6, propValue$jscomp$6);
              }
          }
        target$jscomp$0.push(endOfStartTag);
        return null;
      case "object":
        target$jscomp$0.push(startChunkForTag("object"));
        var children$jscomp$5 = null,
          innerHTML$jscomp$4 = null,
          propKey$jscomp$7;
        for (propKey$jscomp$7 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$7)) {
            var propValue$jscomp$7 = props[propKey$jscomp$7];
            if (null != propValue$jscomp$7)
              switch (propKey$jscomp$7) {
                case "children":
                  children$jscomp$5 = propValue$jscomp$7;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$4 = propValue$jscomp$7;
                  break;
                case "data":
                  var sanitizedValue = sanitizeURL("" + propValue$jscomp$7);
                  if ("" === sanitizedValue) break;
                  target$jscomp$0.push(
                    attributeSeparator,
                    stringToChunk("data"),
                    attributeAssign,
                    stringToChunk(escapeTextForBrowser(sanitizedValue)),
                    attributeEnd,
                  );
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$7, propValue$jscomp$7);
              }
          }
        target$jscomp$0.push(endOfStartTag);
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$4, children$jscomp$5);
        if ("string" === typeof children$jscomp$5) {
          target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children$jscomp$5)));
          var JSCompiler_inline_result$jscomp$2 = null;
        } else JSCompiler_inline_result$jscomp$2 = children$jscomp$5;
        return JSCompiler_inline_result$jscomp$2;
      case "title":
        var noscriptTagInScope = formatContext.tagScope & 1,
          isFallback = formatContext.tagScope & 4;
        if (4 === formatContext.insertionMode || noscriptTagInScope || null != props.itemProp)
          var JSCompiler_inline_result$jscomp$3 = pushTitleImpl(target$jscomp$0, props);
        else
          isFallback
            ? (JSCompiler_inline_result$jscomp$3 = null)
            : (pushTitleImpl(renderState.hoistableChunks, props),
              (JSCompiler_inline_result$jscomp$3 = void 0));
        return JSCompiler_inline_result$jscomp$3;
      case "link":
        var noscriptTagInScope$jscomp$0 = formatContext.tagScope & 1,
          isFallback$jscomp$0 = formatContext.tagScope & 4,
          rel = props.rel,
          href = props.href,
          precedence = props.precedence;
        if (
          4 === formatContext.insertionMode ||
          noscriptTagInScope$jscomp$0 ||
          null != props.itemProp ||
          "string" !== typeof rel ||
          "string" !== typeof href ||
          "" === href
        ) {
          pushLinkImpl(target$jscomp$0, props);
          var JSCompiler_inline_result$jscomp$4 = null;
        } else if ("stylesheet" === props.rel)
          if (
            "string" !== typeof precedence ||
            null != props.disabled ||
            props.onLoad ||
            props.onError
          )
            JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props);
          else {
            var styleQueue = renderState.styles.get(precedence),
              resourceState = resumableState.styleResources.hasOwnProperty(href)
                ? resumableState.styleResources[href]
                : void 0;
            if (null !== resourceState) {
              resumableState.styleResources[href] = null;
              styleQueue ||
                ((styleQueue = {
                  precedence: stringToChunk(escapeTextForBrowser(precedence)),
                  rules: [],
                  hrefs: [],
                  sheets: /* @__PURE__ */ new Map(),
                }),
                renderState.styles.set(precedence, styleQueue));
              var resource = {
                state: 0,
                props: assign({}, props, {
                  "data-precedence": props.precedence,
                  precedence: null,
                }),
              };
              if (resourceState) {
                2 === resourceState.length &&
                  adoptPreloadCredentials(resource.props, resourceState);
                var preloadResource = renderState.preloads.stylesheets.get(href);
                preloadResource && 0 < preloadResource.length
                  ? (preloadResource.length = 0)
                  : (resource.state = 1);
              }
              styleQueue.sheets.set(href, resource);
              hoistableState && hoistableState.stylesheets.add(resource);
            } else if (styleQueue) {
              var resource$9 = styleQueue.sheets.get(href);
              resource$9 && hoistableState && hoistableState.stylesheets.add(resource$9);
            }
            textEmbedded && target$jscomp$0.push(textSeparator);
            JSCompiler_inline_result$jscomp$4 = null;
          }
        else
          props.onLoad || props.onError
            ? (JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props))
            : (textEmbedded && target$jscomp$0.push(textSeparator),
              (JSCompiler_inline_result$jscomp$4 = isFallback$jscomp$0
                ? null
                : pushLinkImpl(renderState.hoistableChunks, props)));
        return JSCompiler_inline_result$jscomp$4;
      case "script":
        var noscriptTagInScope$jscomp$1 = formatContext.tagScope & 1,
          asyncProp = props.async;
        if (
          "string" !== typeof props.src ||
          !props.src ||
          !asyncProp ||
          "function" === typeof asyncProp ||
          "symbol" === typeof asyncProp ||
          props.onLoad ||
          props.onError ||
          4 === formatContext.insertionMode ||
          noscriptTagInScope$jscomp$1 ||
          null != props.itemProp
        )
          var JSCompiler_inline_result$jscomp$5 = pushScriptImpl(target$jscomp$0, props);
        else {
          var key = props.src;
          if ("module" === props.type) {
            var resources = resumableState.moduleScriptResources;
            var preloads = renderState.preloads.moduleScripts;
          } else
            ((resources = resumableState.scriptResources),
              (preloads = renderState.preloads.scripts));
          var resourceState$jscomp$0 = resources.hasOwnProperty(key) ? resources[key] : void 0;
          if (null !== resourceState$jscomp$0) {
            resources[key] = null;
            var scriptProps = props;
            if (resourceState$jscomp$0) {
              2 === resourceState$jscomp$0.length &&
                ((scriptProps = assign({}, props)),
                adoptPreloadCredentials(scriptProps, resourceState$jscomp$0));
              var preloadResource$jscomp$0 = preloads.get(key);
              preloadResource$jscomp$0 && (preloadResource$jscomp$0.length = 0);
            }
            var resource$jscomp$0 = [];
            renderState.scripts.add(resource$jscomp$0);
            pushScriptImpl(resource$jscomp$0, scriptProps);
          }
          textEmbedded && target$jscomp$0.push(textSeparator);
          JSCompiler_inline_result$jscomp$5 = null;
        }
        return JSCompiler_inline_result$jscomp$5;
      case "style":
        var noscriptTagInScope$jscomp$2 = formatContext.tagScope & 1,
          precedence$jscomp$0 = props.precedence,
          href$jscomp$0 = props.href,
          nonce = props.nonce;
        if (
          4 === formatContext.insertionMode ||
          noscriptTagInScope$jscomp$2 ||
          null != props.itemProp ||
          "string" !== typeof precedence$jscomp$0 ||
          "string" !== typeof href$jscomp$0 ||
          "" === href$jscomp$0
        ) {
          target$jscomp$0.push(startChunkForTag("style"));
          var children$jscomp$6 = null,
            innerHTML$jscomp$5 = null,
            propKey$jscomp$8;
          for (propKey$jscomp$8 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$8)) {
              var propValue$jscomp$8 = props[propKey$jscomp$8];
              if (null != propValue$jscomp$8)
                switch (propKey$jscomp$8) {
                  case "children":
                    children$jscomp$6 = propValue$jscomp$8;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$5 = propValue$jscomp$8;
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$8, propValue$jscomp$8);
                }
            }
          target$jscomp$0.push(endOfStartTag);
          var child = Array.isArray(children$jscomp$6)
            ? 2 > children$jscomp$6.length
              ? children$jscomp$6[0]
              : null
            : children$jscomp$6;
          "function" !== typeof child &&
            "symbol" !== typeof child &&
            null !== child &&
            void 0 !== child &&
            target$jscomp$0.push(stringToChunk(("" + child).replace(styleRegex, styleReplacer)));
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$5, children$jscomp$6);
          target$jscomp$0.push(endChunkForTag("style"));
          var JSCompiler_inline_result$jscomp$6 = null;
        } else {
          var styleQueue$jscomp$0 = renderState.styles.get(precedence$jscomp$0);
          if (
            null !==
            (resumableState.styleResources.hasOwnProperty(href$jscomp$0)
              ? resumableState.styleResources[href$jscomp$0]
              : void 0)
          ) {
            resumableState.styleResources[href$jscomp$0] = null;
            styleQueue$jscomp$0 ||
              ((styleQueue$jscomp$0 = {
                precedence: stringToChunk(escapeTextForBrowser(precedence$jscomp$0)),
                rules: [],
                hrefs: [],
                sheets: /* @__PURE__ */ new Map(),
              }),
              renderState.styles.set(precedence$jscomp$0, styleQueue$jscomp$0));
            var nonceStyle = renderState.nonce.style;
            if (!nonceStyle || nonceStyle === nonce) {
              styleQueue$jscomp$0.hrefs.push(stringToChunk(escapeTextForBrowser(href$jscomp$0)));
              var target = styleQueue$jscomp$0.rules,
                children$jscomp$7 = null,
                innerHTML$jscomp$6 = null,
                propKey$jscomp$9;
              for (propKey$jscomp$9 in props)
                if (hasOwnProperty.call(props, propKey$jscomp$9)) {
                  var propValue$jscomp$9 = props[propKey$jscomp$9];
                  if (null != propValue$jscomp$9)
                    switch (propKey$jscomp$9) {
                      case "children":
                        children$jscomp$7 = propValue$jscomp$9;
                        break;
                      case "dangerouslySetInnerHTML":
                        innerHTML$jscomp$6 = propValue$jscomp$9;
                    }
                }
              var child$jscomp$0 = Array.isArray(children$jscomp$7)
                ? 2 > children$jscomp$7.length
                  ? children$jscomp$7[0]
                  : null
                : children$jscomp$7;
              "function" !== typeof child$jscomp$0 &&
                "symbol" !== typeof child$jscomp$0 &&
                null !== child$jscomp$0 &&
                void 0 !== child$jscomp$0 &&
                target.push(
                  stringToChunk(("" + child$jscomp$0).replace(styleRegex, styleReplacer)),
                );
              pushInnerHTML(target, innerHTML$jscomp$6, children$jscomp$7);
            }
          }
          styleQueue$jscomp$0 && hoistableState && hoistableState.styles.add(styleQueue$jscomp$0);
          textEmbedded && target$jscomp$0.push(textSeparator);
          JSCompiler_inline_result$jscomp$6 = void 0;
        }
        return JSCompiler_inline_result$jscomp$6;
      case "meta":
        var noscriptTagInScope$jscomp$3 = formatContext.tagScope & 1,
          isFallback$jscomp$1 = formatContext.tagScope & 4;
        if (
          4 === formatContext.insertionMode ||
          noscriptTagInScope$jscomp$3 ||
          null != props.itemProp
        )
          var JSCompiler_inline_result$jscomp$7 = pushSelfClosing(target$jscomp$0, props, "meta");
        else
          (textEmbedded && target$jscomp$0.push(textSeparator),
            (JSCompiler_inline_result$jscomp$7 = isFallback$jscomp$1
              ? null
              : "string" === typeof props.charSet
                ? pushSelfClosing(renderState.charsetChunks, props, "meta")
                : "viewport" === props.name
                  ? pushSelfClosing(renderState.viewportChunks, props, "meta")
                  : pushSelfClosing(renderState.hoistableChunks, props, "meta")));
        return JSCompiler_inline_result$jscomp$7;
      case "listing":
      case "pre":
        target$jscomp$0.push(startChunkForTag(type));
        var children$jscomp$8 = null,
          innerHTML$jscomp$7 = null,
          propKey$jscomp$10;
        for (propKey$jscomp$10 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$10)) {
            var propValue$jscomp$10 = props[propKey$jscomp$10];
            if (null != propValue$jscomp$10)
              switch (propKey$jscomp$10) {
                case "children":
                  children$jscomp$8 = propValue$jscomp$10;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$7 = propValue$jscomp$10;
                  break;
                default:
                  pushAttribute(target$jscomp$0, propKey$jscomp$10, propValue$jscomp$10);
              }
          }
        target$jscomp$0.push(endOfStartTag);
        if (null != innerHTML$jscomp$7) {
          if (null != children$jscomp$8)
            throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
          if ("object" !== typeof innerHTML$jscomp$7 || !("__html" in innerHTML$jscomp$7))
            throw Error(
              "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.",
            );
          var html = innerHTML$jscomp$7.__html;
          null !== html &&
            void 0 !== html &&
            ("string" === typeof html && 0 < html.length && "\n" === html[0]
              ? target$jscomp$0.push(leadingNewline, stringToChunk(html))
              : target$jscomp$0.push(stringToChunk("" + html)));
        }
        "string" === typeof children$jscomp$8 &&
          "\n" === children$jscomp$8[0] &&
          target$jscomp$0.push(leadingNewline);
        return children$jscomp$8;
      case "img":
        var pictureOrNoScriptTagInScope = formatContext.tagScope & 3,
          src = props.src,
          srcSet = props.srcSet;
        if (
          !(
            "lazy" === props.loading ||
            (!src && !srcSet) ||
            ("string" !== typeof src && null != src) ||
            ("string" !== typeof srcSet && null != srcSet) ||
            "low" === props.fetchPriority ||
            pictureOrNoScriptTagInScope
          ) &&
          ("string" !== typeof src ||
            ":" !== src[4] ||
            ("d" !== src[0] && "D" !== src[0]) ||
            ("a" !== src[1] && "A" !== src[1]) ||
            ("t" !== src[2] && "T" !== src[2]) ||
            ("a" !== src[3] && "A" !== src[3])) &&
          ("string" !== typeof srcSet ||
            ":" !== srcSet[4] ||
            ("d" !== srcSet[0] && "D" !== srcSet[0]) ||
            ("a" !== srcSet[1] && "A" !== srcSet[1]) ||
            ("t" !== srcSet[2] && "T" !== srcSet[2]) ||
            ("a" !== srcSet[3] && "A" !== srcSet[3]))
        ) {
          null !== hoistableState &&
            formatContext.tagScope & 64 &&
            (hoistableState.suspenseyImages = !0);
          var sizes = "string" === typeof props.sizes ? props.sizes : void 0,
            key$jscomp$0 = srcSet ? srcSet + "\n" + (sizes || "") : src,
            promotablePreloads = renderState.preloads.images,
            resource$jscomp$1 = promotablePreloads.get(key$jscomp$0);
          if (resource$jscomp$1) {
            if ("high" === props.fetchPriority || 10 > renderState.highImagePreloads.size)
              (promotablePreloads.delete(key$jscomp$0),
                renderState.highImagePreloads.add(resource$jscomp$1));
          } else if (!resumableState.imageResources.hasOwnProperty(key$jscomp$0)) {
            resumableState.imageResources[key$jscomp$0] = PRELOAD_NO_CREDS;
            var input = props.crossOrigin;
            var JSCompiler_inline_result$jscomp$8 =
              "string" === typeof input ? ("use-credentials" === input ? input : "") : void 0;
            var headers = renderState.headers,
              header;
            headers &&
            0 < headers.remainingCapacity &&
            "string" !== typeof props.srcSet &&
            ("high" === props.fetchPriority || 500 > headers.highImagePreloads.length) &&
            ((header = getPreloadAsHeader(src, "image", {
              imageSrcSet: props.srcSet,
              imageSizes: props.sizes,
              crossOrigin: JSCompiler_inline_result$jscomp$8,
              integrity: props.integrity,
              nonce: props.nonce,
              type: props.type,
              fetchPriority: props.fetchPriority,
              referrerPolicy: props.refererPolicy,
            })),
            0 <= (headers.remainingCapacity -= header.length + 2))
              ? ((renderState.resets.image[key$jscomp$0] = PRELOAD_NO_CREDS),
                headers.highImagePreloads && (headers.highImagePreloads += ", "),
                (headers.highImagePreloads += header))
              : ((resource$jscomp$1 = []),
                pushLinkImpl(resource$jscomp$1, {
                  rel: "preload",
                  as: "image",
                  href: srcSet ? void 0 : src,
                  imageSrcSet: srcSet,
                  imageSizes: sizes,
                  crossOrigin: JSCompiler_inline_result$jscomp$8,
                  integrity: props.integrity,
                  type: props.type,
                  fetchPriority: props.fetchPriority,
                  referrerPolicy: props.referrerPolicy,
                }),
                "high" === props.fetchPriority || 10 > renderState.highImagePreloads.size
                  ? renderState.highImagePreloads.add(resource$jscomp$1)
                  : (renderState.bulkPreloads.add(resource$jscomp$1),
                    promotablePreloads.set(key$jscomp$0, resource$jscomp$1)));
          }
        }
        return pushSelfClosing(target$jscomp$0, props, "img");
      case "base":
      case "area":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "param":
      case "source":
      case "track":
      case "wbr":
        return pushSelfClosing(target$jscomp$0, props, type);
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        break;
      case "head":
        if (2 > formatContext.insertionMode) {
          var preamble = preambleState || renderState.preamble;
          if (preamble.headChunks) throw Error("The `<head>` tag may only be rendered once.");
          null !== preambleState && target$jscomp$0.push(headPreambleContributionChunk);
          preamble.headChunks = [];
          var JSCompiler_inline_result$jscomp$9 = pushStartSingletonElement(
            preamble.headChunks,
            props,
            "head",
          );
        } else
          JSCompiler_inline_result$jscomp$9 = pushStartGenericElement(
            target$jscomp$0,
            props,
            "head",
          );
        return JSCompiler_inline_result$jscomp$9;
      case "body":
        if (2 > formatContext.insertionMode) {
          var preamble$jscomp$0 = preambleState || renderState.preamble;
          if (preamble$jscomp$0.bodyChunks)
            throw Error("The `<body>` tag may only be rendered once.");
          null !== preambleState && target$jscomp$0.push(bodyPreambleContributionChunk);
          preamble$jscomp$0.bodyChunks = [];
          var JSCompiler_inline_result$jscomp$10 = pushStartSingletonElement(
            preamble$jscomp$0.bodyChunks,
            props,
            "body",
          );
        } else
          JSCompiler_inline_result$jscomp$10 = pushStartGenericElement(
            target$jscomp$0,
            props,
            "body",
          );
        return JSCompiler_inline_result$jscomp$10;
      case "html":
        if (0 === formatContext.insertionMode) {
          var preamble$jscomp$1 = preambleState || renderState.preamble;
          if (preamble$jscomp$1.htmlChunks)
            throw Error("The `<html>` tag may only be rendered once.");
          null !== preambleState && target$jscomp$0.push(htmlPreambleContributionChunk);
          preamble$jscomp$1.htmlChunks = [doctypeChunk];
          var JSCompiler_inline_result$jscomp$11 = pushStartSingletonElement(
            preamble$jscomp$1.htmlChunks,
            props,
            "html",
          );
        } else
          JSCompiler_inline_result$jscomp$11 = pushStartGenericElement(
            target$jscomp$0,
            props,
            "html",
          );
        return JSCompiler_inline_result$jscomp$11;
      default:
        if (-1 !== type.indexOf("-")) {
          target$jscomp$0.push(startChunkForTag(type));
          var children$jscomp$9 = null,
            innerHTML$jscomp$8 = null,
            propKey$jscomp$11;
          for (propKey$jscomp$11 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$11)) {
              var propValue$jscomp$11 = props[propKey$jscomp$11];
              if (null != propValue$jscomp$11) {
                var attributeName = propKey$jscomp$11;
                switch (propKey$jscomp$11) {
                  case "children":
                    children$jscomp$9 = propValue$jscomp$11;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$8 = propValue$jscomp$11;
                    break;
                  case "style":
                    pushStyleAttribute(target$jscomp$0, propValue$jscomp$11);
                    break;
                  case "suppressContentEditableWarning":
                  case "suppressHydrationWarning":
                  case "ref":
                    break;
                  case "className":
                    attributeName = "class";
                  default:
                    if (
                      isAttributeNameSafe(propKey$jscomp$11) &&
                      "function" !== typeof propValue$jscomp$11 &&
                      "symbol" !== typeof propValue$jscomp$11 &&
                      !1 !== propValue$jscomp$11
                    ) {
                      if (!0 === propValue$jscomp$11) propValue$jscomp$11 = "";
                      else if ("object" === typeof propValue$jscomp$11) continue;
                      target$jscomp$0.push(
                        attributeSeparator,
                        stringToChunk(attributeName),
                        attributeAssign,
                        stringToChunk(escapeTextForBrowser(propValue$jscomp$11)),
                        attributeEnd,
                      );
                    }
                }
              }
            }
          target$jscomp$0.push(endOfStartTag);
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$8, children$jscomp$9);
          return children$jscomp$9;
        }
    }
    return pushStartGenericElement(target$jscomp$0, props, type);
  }
  var endTagCache = /* @__PURE__ */ new Map();
  function endChunkForTag(tag) {
    var chunk = endTagCache.get(tag);
    void 0 === chunk &&
      ((chunk = stringToPrecomputedChunk("</" + tag + ">")), endTagCache.set(tag, chunk));
    return chunk;
  }
  function hoistPreambleState(renderState, preambleState) {
    renderState = renderState.preamble;
    null === renderState.htmlChunks &&
      preambleState.htmlChunks &&
      (renderState.htmlChunks = preambleState.htmlChunks);
    null === renderState.headChunks &&
      preambleState.headChunks &&
      (renderState.headChunks = preambleState.headChunks);
    null === renderState.bodyChunks &&
      preambleState.bodyChunks &&
      (renderState.bodyChunks = preambleState.bodyChunks);
  }
  function writeBootstrap(destination, renderState) {
    renderState = renderState.bootstrapChunks;
    for (var i = 0; i < renderState.length - 1; i++) writeChunk(destination, renderState[i]);
    return i < renderState.length
      ? ((i = renderState[i]), (renderState.length = 0), writeChunkAndReturn(destination, i))
      : !0;
  }
  var shellTimeRuntimeScript = stringToPrecomputedChunk(
      "requestAnimationFrame(function(){$RT=performance.now()});",
    ),
    placeholder1 = stringToPrecomputedChunk('<template id="'),
    placeholder2 = stringToPrecomputedChunk('"></template>'),
    startActivityBoundary = stringToPrecomputedChunk("<!--&-->"),
    endActivityBoundary = stringToPrecomputedChunk("<!--/&-->"),
    startCompletedSuspenseBoundary = stringToPrecomputedChunk("<!--$-->"),
    startPendingSuspenseBoundary1 = stringToPrecomputedChunk('<!--$?--><template id="'),
    startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>'),
    startClientRenderedSuspenseBoundary = stringToPrecomputedChunk("<!--$!-->"),
    endSuspenseBoundary = stringToPrecomputedChunk("<!--/$-->"),
    clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk("<template"),
    clientRenderedSuspenseBoundaryErrorAttrInterstitial = stringToPrecomputedChunk('"'),
    clientRenderedSuspenseBoundaryError1A = stringToPrecomputedChunk(' data-dgst="');
  stringToPrecomputedChunk(' data-msg="');
  stringToPrecomputedChunk(' data-stck="');
  stringToPrecomputedChunk(' data-cstck="');
  var clientRenderedSuspenseBoundaryError2 = stringToPrecomputedChunk("></template>");
  function writeStartPendingSuspenseBoundary(destination, renderState, id) {
    writeChunk(destination, startPendingSuspenseBoundary1);
    if (null === id)
      throw Error("An ID must have been assigned before we can complete the boundary.");
    writeChunk(destination, renderState.boundaryPrefix);
    writeChunk(destination, stringToChunk(id.toString(16)));
    return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
  }
  var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="'),
    startSegmentHTML2 = stringToPrecomputedChunk('">'),
    endSegmentHTML = stringToPrecomputedChunk("</div>"),
    startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="'),
    startSegmentSVG2 = stringToPrecomputedChunk('">'),
    endSegmentSVG = stringToPrecomputedChunk("</svg>"),
    startSegmentMathML = stringToPrecomputedChunk(
      '<math aria-hidden="true" style="display:none" id="',
    ),
    startSegmentMathML2 = stringToPrecomputedChunk('">'),
    endSegmentMathML = stringToPrecomputedChunk("</math>"),
    startSegmentTable = stringToPrecomputedChunk('<table hidden id="'),
    startSegmentTable2 = stringToPrecomputedChunk('">'),
    endSegmentTable = stringToPrecomputedChunk("</table>"),
    startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="'),
    startSegmentTableBody2 = stringToPrecomputedChunk('">'),
    endSegmentTableBody = stringToPrecomputedChunk("</tbody></table>"),
    startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="'),
    startSegmentTableRow2 = stringToPrecomputedChunk('">'),
    endSegmentTableRow = stringToPrecomputedChunk("</tr></table>"),
    startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="'),
    startSegmentColGroup2 = stringToPrecomputedChunk('">'),
    endSegmentColGroup = stringToPrecomputedChunk("</colgroup></table>");
  function writeStartSegment(destination, renderState, formatContext, id) {
    switch (formatContext.insertionMode) {
      case 0:
      case 1:
      case 3:
      case 2:
        return (
          writeChunk(destination, startSegmentHTML),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentHTML2)
        );
      case 4:
        return (
          writeChunk(destination, startSegmentSVG),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentSVG2)
        );
      case 5:
        return (
          writeChunk(destination, startSegmentMathML),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentMathML2)
        );
      case 6:
        return (
          writeChunk(destination, startSegmentTable),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentTable2)
        );
      case 7:
        return (
          writeChunk(destination, startSegmentTableBody),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentTableBody2)
        );
      case 8:
        return (
          writeChunk(destination, startSegmentTableRow),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentTableRow2)
        );
      case 9:
        return (
          writeChunk(destination, startSegmentColGroup),
          writeChunk(destination, renderState.segmentPrefix),
          writeChunk(destination, stringToChunk(id.toString(16))),
          writeChunkAndReturn(destination, startSegmentColGroup2)
        );
      default:
        throw Error("Unknown insertion mode. This is a bug in React.");
    }
  }
  function writeEndSegment(destination, formatContext) {
    switch (formatContext.insertionMode) {
      case 0:
      case 1:
      case 3:
      case 2:
        return writeChunkAndReturn(destination, endSegmentHTML);
      case 4:
        return writeChunkAndReturn(destination, endSegmentSVG);
      case 5:
        return writeChunkAndReturn(destination, endSegmentMathML);
      case 6:
        return writeChunkAndReturn(destination, endSegmentTable);
      case 7:
        return writeChunkAndReturn(destination, endSegmentTableBody);
      case 8:
        return writeChunkAndReturn(destination, endSegmentTableRow);
      case 9:
        return writeChunkAndReturn(destination, endSegmentColGroup);
      default:
        throw Error("Unknown insertion mode. This is a bug in React.");
    }
  }
  var completeSegmentScript1Full = stringToPrecomputedChunk(
      '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("',
    ),
    completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("'),
    completeSegmentScript2 = stringToPrecomputedChunk('","'),
    completeSegmentScriptEnd = stringToPrecomputedChunk('")<\/script>');
  stringToPrecomputedChunk('<template data-rsi="" data-sid="');
  stringToPrecomputedChunk('" data-pid="');
  var completeBoundaryScriptFunctionOnly = stringToPrecomputedChunk(
    '$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};',
  );
  stringToChunk(
    '$RV=function(A,g){function k(a,b){var e=a.getAttribute(b);e&&(b=a.style,l.push(a,b.viewTransitionName,b.viewTransitionClass),"auto"!==e&&(b.viewTransitionClass=e),(a=a.getAttribute("vt-name"))||(a="_T_"+K++ +"_"),b.viewTransitionName=a,B=!0)}var B=!1,K=0,l=[];try{var f=document.__reactViewTransition;if(f){f.finished.finally($RV.bind(null,g));return}var m=new Map;for(f=1;f<g.length;f+=2)for(var h=g[f].querySelectorAll("[vt-share]"),d=0;d<h.length;d++){var c=h[d];m.set(c.getAttribute("vt-name"),c)}var u=[];for(h=0;h<g.length;h+=2){var C=g[h],x=C.parentNode;if(x){var v=x.getBoundingClientRect();if(v.left||v.top||v.width||v.height){c=C;for(f=0;c;){if(8===c.nodeType){var r=c.data;if("/$"===r)if(0===f)break;else f--;else"$"!==r&&"$?"!==r&&"$~"!==r&&"$!"!==r||f++}else if(1===c.nodeType){d=c;var D=d.getAttribute("vt-name"),y=m.get(D);k(d,y?"vt-share":"vt-exit");y&&(k(y,"vt-share"),m.set(D,null));var E=d.querySelectorAll("[vt-share]");for(d=0;d<E.length;d++){var F=E[d],G=F.getAttribute("vt-name"),\nH=m.get(G);H&&(k(F,"vt-share"),k(H,"vt-share"),m.set(G,null))}}c=c.nextSibling}for(var I=g[h+1],t=I.firstElementChild;t;)null!==m.get(t.getAttribute("vt-name"))&&k(t,"vt-enter"),t=t.nextElementSibling;c=x;do for(var n=c.firstElementChild;n;){var J=n.getAttribute("vt-update");J&&"none"!==J&&!l.includes(n)&&k(n,"vt-update");n=n.nextElementSibling}while((c=c.parentNode)&&1===c.nodeType&&"none"!==c.getAttribute("vt-update"));u.push.apply(u,I.querySelectorAll(\'img[src]:not([loading="lazy"])\'))}}}if(B){var z=\ndocument.__reactViewTransition=document.startViewTransition({update:function(){A(g);for(var a=[document.documentElement.clientHeight,document.fonts.ready],b={},e=0;e<u.length;b={g:b.g},e++)if(b.g=u[e],!b.g.complete){var p=b.g.getBoundingClientRect();0<p.bottom&&0<p.right&&p.top<window.innerHeight&&p.left<window.innerWidth&&(p=new Promise(function(w){return function(q){w.g.addEventListener("load",q);w.g.addEventListener("error",q)}}(b)),a.push(p))}return Promise.race([Promise.all(a),new Promise(function(w){var q=\nperformance.now();setTimeout(w,2300>q&&2E3<q?2300-q:500)})])},types:[]});z.ready.finally(function(){for(var a=l.length-3;0<=a;a-=3){var b=l[a],e=b.style;e.viewTransitionName=l[a+1];e.viewTransitionClass=l[a+1];""===b.getAttribute("style")&&b.removeAttribute("style")}});z.finished.finally(function(){document.__reactViewTransition===z&&(document.__reactViewTransition=null)});$RB=[];return}}catch(a){}A(g)}.bind(null,$RV);',
  );
  var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("'),
    completeBoundaryWithStylesScript1FullPartial = stringToPrecomputedChunk(
      '$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll("link[data-precedence],style[data-precedence]"),v=[],k=0;b=e[k++];)"not all"===b.getAttribute("media")?v.push(b):("LINK"===b.tagName&&$RM.set(b.getAttribute("href"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement("link");a.href=d;a.rel=\n"stylesheet";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute("media");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n"$~";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,"CSS failed to load"))};$RR("',
    ),
    completeBoundaryWithStylesScript1Partial = stringToPrecomputedChunk('$RR("'),
    completeBoundaryScript2 = stringToPrecomputedChunk('","'),
    completeBoundaryScript3a = stringToPrecomputedChunk('",'),
    completeBoundaryScript3b = stringToPrecomputedChunk('"'),
    completeBoundaryScriptEnd = stringToPrecomputedChunk(")<\/script>");
  stringToPrecomputedChunk('<template data-rci="" data-bid="');
  stringToPrecomputedChunk('<template data-rri="" data-bid="');
  stringToPrecomputedChunk('" data-sid="');
  stringToPrecomputedChunk('" data-sty="');
  var clientRenderScriptFunctionOnly = stringToPrecomputedChunk(
      '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};',
    ),
    clientRenderScript1Full = stringToPrecomputedChunk(
      '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX("',
    ),
    clientRenderScript1Partial = stringToPrecomputedChunk('$RX("'),
    clientRenderScript1A = stringToPrecomputedChunk('"'),
    clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(","),
    clientRenderScriptEnd = stringToPrecomputedChunk(")<\/script>");
  stringToPrecomputedChunk('<template data-rxi="" data-bid="');
  stringToPrecomputedChunk('" data-dgst="');
  stringToPrecomputedChunk('" data-msg="');
  stringToPrecomputedChunk('" data-stck="');
  stringToPrecomputedChunk('" data-cstck="');
  var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
  function escapeJSStringsForInstructionScripts(input) {
    return JSON.stringify(input).replace(regexForJSStringsInInstructionScripts, function (match) {
      switch (match) {
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error(
            "escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
          );
      }
    });
  }
  var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
  function escapeJSObjectForInstructionScripts(input) {
    return JSON.stringify(input).replace(regexForJSStringsInScripts, function (match) {
      switch (match) {
        case "&":
          return "\\u0026";
        case ">":
          return "\\u003e";
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error(
            "escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
          );
      }
    });
  }
  var lateStyleTagResourceOpen1 = stringToPrecomputedChunk(' media="not all" data-precedence="'),
    lateStyleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="'),
    lateStyleTagResourceOpen3 = stringToPrecomputedChunk('">'),
    lateStyleTagTemplateClose = stringToPrecomputedChunk("</style>"),
    currentlyRenderingBoundaryHasStylesToHoist = !1,
    destinationHasCapacity = !0;
  function flushStyleTagsLateForBoundary(styleQueue) {
    var rules = styleQueue.rules,
      hrefs = styleQueue.hrefs,
      i = 0;
    if (hrefs.length) {
      writeChunk(this, currentlyFlushingRenderState.startInlineStyle);
      writeChunk(this, lateStyleTagResourceOpen1);
      writeChunk(this, styleQueue.precedence);
      for (writeChunk(this, lateStyleTagResourceOpen2); i < hrefs.length - 1; i++)
        (writeChunk(this, hrefs[i]), writeChunk(this, spaceSeparator));
      writeChunk(this, hrefs[i]);
      writeChunk(this, lateStyleTagResourceOpen3);
      for (i = 0; i < rules.length; i++) writeChunk(this, rules[i]);
      destinationHasCapacity = writeChunkAndReturn(this, lateStyleTagTemplateClose);
      currentlyRenderingBoundaryHasStylesToHoist = !0;
      rules.length = 0;
      hrefs.length = 0;
    }
  }
  function hasStylesToHoist(stylesheet) {
    return 2 !== stylesheet.state ? (currentlyRenderingBoundaryHasStylesToHoist = !0) : !1;
  }
  function writeHoistablesForBoundary(destination, hoistableState, renderState) {
    currentlyRenderingBoundaryHasStylesToHoist = !1;
    destinationHasCapacity = !0;
    currentlyFlushingRenderState = renderState;
    hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
    currentlyFlushingRenderState = null;
    hoistableState.stylesheets.forEach(hasStylesToHoist);
    currentlyRenderingBoundaryHasStylesToHoist && (renderState.stylesToHoist = !0);
    return destinationHasCapacity;
  }
  function flushResource(resource) {
    for (var i = 0; i < resource.length; i++) writeChunk(this, resource[i]);
    resource.length = 0;
  }
  var stylesheetFlushingQueue = [];
  function flushStyleInPreamble(stylesheet) {
    pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
    for (var i = 0; i < stylesheetFlushingQueue.length; i++)
      writeChunk(this, stylesheetFlushingQueue[i]);
    stylesheetFlushingQueue.length = 0;
    stylesheet.state = 2;
  }
  var styleTagResourceOpen1 = stringToPrecomputedChunk(' data-precedence="'),
    styleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="'),
    spaceSeparator = stringToPrecomputedChunk(" "),
    styleTagResourceOpen3 = stringToPrecomputedChunk('">'),
    styleTagResourceClose = stringToPrecomputedChunk("</style>");
  function flushStylesInPreamble(styleQueue) {
    var hasStylesheets = 0 < styleQueue.sheets.size;
    styleQueue.sheets.forEach(flushStyleInPreamble, this);
    styleQueue.sheets.clear();
    var rules = styleQueue.rules,
      hrefs = styleQueue.hrefs;
    if (!hasStylesheets || hrefs.length) {
      writeChunk(this, currentlyFlushingRenderState.startInlineStyle);
      writeChunk(this, styleTagResourceOpen1);
      writeChunk(this, styleQueue.precedence);
      styleQueue = 0;
      if (hrefs.length) {
        for (writeChunk(this, styleTagResourceOpen2); styleQueue < hrefs.length - 1; styleQueue++)
          (writeChunk(this, hrefs[styleQueue]), writeChunk(this, spaceSeparator));
        writeChunk(this, hrefs[styleQueue]);
      }
      writeChunk(this, styleTagResourceOpen3);
      for (styleQueue = 0; styleQueue < rules.length; styleQueue++)
        writeChunk(this, rules[styleQueue]);
      writeChunk(this, styleTagResourceClose);
      rules.length = 0;
      hrefs.length = 0;
    }
  }
  function preloadLateStyle(stylesheet) {
    if (0 === stylesheet.state) {
      stylesheet.state = 1;
      var props = stylesheet.props;
      pushLinkImpl(stylesheetFlushingQueue, {
        rel: "preload",
        as: "style",
        href: stylesheet.props.href,
        crossOrigin: props.crossOrigin,
        fetchPriority: props.fetchPriority,
        integrity: props.integrity,
        media: props.media,
        hrefLang: props.hrefLang,
        referrerPolicy: props.referrerPolicy,
      });
      for (stylesheet = 0; stylesheet < stylesheetFlushingQueue.length; stylesheet++)
        writeChunk(this, stylesheetFlushingQueue[stylesheet]);
      stylesheetFlushingQueue.length = 0;
    }
  }
  function preloadLateStyles(styleQueue) {
    styleQueue.sheets.forEach(preloadLateStyle, this);
    styleQueue.sheets.clear();
  }
  stringToPrecomputedChunk('<link rel="expect" href="#');
  stringToPrecomputedChunk('" blocking="render"/>');
  var completedShellIdAttributeStart = stringToPrecomputedChunk(' id="');
  function pushCompletedShellIdAttribute(target, resumableState) {
    0 === (resumableState.instructions & 32) &&
      ((resumableState.instructions |= 32),
      target.push(
        completedShellIdAttributeStart,
        stringToChunk(escapeTextForBrowser("_" + resumableState.idPrefix + "R_")),
        attributeEnd,
      ));
  }
  var arrayFirstOpenBracket = stringToPrecomputedChunk("["),
    arraySubsequentOpenBracket = stringToPrecomputedChunk(",["),
    arrayInterstitial = stringToPrecomputedChunk(","),
    arrayCloseBracket = stringToPrecomputedChunk("]");
  function writeStyleResourceDependenciesInJS(destination, hoistableState) {
    writeChunk(destination, arrayFirstOpenBracket);
    var nextArrayOpenBrackChunk = arrayFirstOpenBracket;
    hoistableState.stylesheets.forEach(function (resource) {
      if (2 !== resource.state)
        if (3 === resource.state)
          (writeChunk(destination, nextArrayOpenBrackChunk),
            writeChunk(
              destination,
              stringToChunk(escapeJSObjectForInstructionScripts("" + resource.props.href)),
            ),
            writeChunk(destination, arrayCloseBracket),
            (nextArrayOpenBrackChunk = arraySubsequentOpenBracket));
        else {
          writeChunk(destination, nextArrayOpenBrackChunk);
          var precedence = resource.props["data-precedence"],
            props = resource.props;
          writeChunk(
            destination,
            stringToChunk(
              escapeJSObjectForInstructionScripts(sanitizeURL("" + resource.props.href)),
            ),
          );
          precedence = "" + precedence;
          writeChunk(destination, arrayInterstitial);
          writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(precedence)));
          for (var propKey in props)
            if (
              hasOwnProperty.call(props, propKey) &&
              ((precedence = props[propKey]), null != precedence)
            )
              switch (propKey) {
                case "href":
                case "rel":
                case "precedence":
                case "data-precedence":
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(
                    "link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.",
                  );
                default:
                  writeStyleResourceAttributeInJS(destination, propKey, precedence);
              }
          writeChunk(destination, arrayCloseBracket);
          nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
          resource.state = 3;
        }
    });
    writeChunk(destination, arrayCloseBracket);
  }
  function writeStyleResourceAttributeInJS(destination, name, value) {
    var attributeName = name.toLowerCase();
    switch (typeof value) {
      case "function":
      case "symbol":
        return;
    }
    switch (name) {
      case "innerHTML":
      case "dangerouslySetInnerHTML":
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "style":
      case "ref":
        return;
      case "className":
        attributeName = "class";
        name = "" + value;
        break;
      case "hidden":
        if (!1 === value) return;
        name = "";
        break;
      case "src":
      case "href":
        value = sanitizeURL(value);
        name = "" + value;
        break;
      default:
        if (
          (2 < name.length &&
            ("o" === name[0] || "O" === name[0]) &&
            ("n" === name[1] || "N" === name[1])) ||
          !isAttributeNameSafe(name)
        )
          return;
        name = "" + value;
    }
    writeChunk(destination, arrayInterstitial);
    writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(attributeName)));
    writeChunk(destination, arrayInterstitial);
    writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(name)));
  }
  function createHoistableState() {
    return {
      styles: /* @__PURE__ */ new Set(),
      stylesheets: /* @__PURE__ */ new Set(),
      suspenseyImages: !1,
    };
  }
  function prefetchDNS(href) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if ("string" === typeof href && href) {
        if (!resumableState.dnsResources.hasOwnProperty(href)) {
          resumableState.dnsResources[href] = null;
          resumableState = renderState.headers;
          var header, JSCompiler_temp;
          if ((JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity))
            JSCompiler_temp =
              ((header =
                "<" +
                ("" + href).replace(
                  regexForHrefInLinkHeaderURLContext,
                  escapeHrefForLinkHeaderURLContextReplacer,
                ) +
                ">; rel=dns-prefetch"),
              0 <= (resumableState.remainingCapacity -= header.length + 2));
          JSCompiler_temp
            ? ((renderState.resets.dns[href] = null),
              resumableState.preconnects && (resumableState.preconnects += ", "),
              (resumableState.preconnects += header))
            : ((header = []),
              pushLinkImpl(header, {
                href,
                rel: "dns-prefetch",
              }),
              renderState.preconnects.add(header));
        }
        enqueueFlush(request);
      }
    } else previousDispatcher.D(href);
  }
  function preconnect(href, crossOrigin) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if ("string" === typeof href && href) {
        var bucket =
          "use-credentials" === crossOrigin
            ? "credentials"
            : "string" === typeof crossOrigin
              ? "anonymous"
              : "default";
        if (!resumableState.connectResources[bucket].hasOwnProperty(href)) {
          resumableState.connectResources[bucket][href] = null;
          resumableState = renderState.headers;
          var header, JSCompiler_temp;
          if ((JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity)) {
            JSCompiler_temp =
              "<" +
              ("" + href).replace(
                regexForHrefInLinkHeaderURLContext,
                escapeHrefForLinkHeaderURLContextReplacer,
              ) +
              ">; rel=preconnect";
            if ("string" === typeof crossOrigin) {
              var escapedCrossOrigin = ("" + crossOrigin).replace(
                regexForLinkHeaderQuotedParamValueContext,
                escapeStringForLinkHeaderQuotedParamValueContextReplacer,
              );
              JSCompiler_temp += '; crossorigin="' + escapedCrossOrigin + '"';
            }
            JSCompiler_temp =
              ((header = JSCompiler_temp),
              0 <= (resumableState.remainingCapacity -= header.length + 2));
          }
          JSCompiler_temp
            ? ((renderState.resets.connect[bucket][href] = null),
              resumableState.preconnects && (resumableState.preconnects += ", "),
              (resumableState.preconnects += header))
            : ((bucket = []),
              pushLinkImpl(bucket, {
                rel: "preconnect",
                href,
                crossOrigin,
              }),
              renderState.preconnects.add(bucket));
        }
        enqueueFlush(request);
      }
    } else previousDispatcher.C(href, crossOrigin);
  }
  function preload(href, as, options) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if (as && href) {
        switch (as) {
          case "image":
            if (options) {
              var imageSrcSet = options.imageSrcSet;
              var imageSizes = options.imageSizes;
              var fetchPriority = options.fetchPriority;
            }
            var key = imageSrcSet ? imageSrcSet + "\n" + (imageSizes || "") : href;
            if (resumableState.imageResources.hasOwnProperty(key)) return;
            resumableState.imageResources[key] = PRELOAD_NO_CREDS;
            resumableState = renderState.headers;
            var header;
            resumableState &&
            0 < resumableState.remainingCapacity &&
            "string" !== typeof imageSrcSet &&
            "high" === fetchPriority &&
            ((header = getPreloadAsHeader(href, as, options)),
            0 <= (resumableState.remainingCapacity -= header.length + 2))
              ? ((renderState.resets.image[key] = PRELOAD_NO_CREDS),
                resumableState.highImagePreloads && (resumableState.highImagePreloads += ", "),
                (resumableState.highImagePreloads += header))
              : ((resumableState = []),
                pushLinkImpl(
                  resumableState,
                  assign(
                    {
                      rel: "preload",
                      href: imageSrcSet ? void 0 : href,
                      as,
                    },
                    options,
                  ),
                ),
                "high" === fetchPriority
                  ? renderState.highImagePreloads.add(resumableState)
                  : (renderState.bulkPreloads.add(resumableState),
                    renderState.preloads.images.set(key, resumableState)));
            break;
          case "style":
            if (resumableState.styleResources.hasOwnProperty(href)) return;
            imageSrcSet = [];
            pushLinkImpl(
              imageSrcSet,
              assign(
                {
                  rel: "preload",
                  href,
                  as,
                },
                options,
              ),
            );
            resumableState.styleResources[href] =
              !options ||
              ("string" !== typeof options.crossOrigin && "string" !== typeof options.integrity)
                ? PRELOAD_NO_CREDS
                : [options.crossOrigin, options.integrity];
            renderState.preloads.stylesheets.set(href, imageSrcSet);
            renderState.bulkPreloads.add(imageSrcSet);
            break;
          case "script":
            if (resumableState.scriptResources.hasOwnProperty(href)) return;
            imageSrcSet = [];
            renderState.preloads.scripts.set(href, imageSrcSet);
            renderState.bulkPreloads.add(imageSrcSet);
            pushLinkImpl(
              imageSrcSet,
              assign(
                {
                  rel: "preload",
                  href,
                  as,
                },
                options,
              ),
            );
            resumableState.scriptResources[href] =
              !options ||
              ("string" !== typeof options.crossOrigin && "string" !== typeof options.integrity)
                ? PRELOAD_NO_CREDS
                : [options.crossOrigin, options.integrity];
            break;
          default:
            if (resumableState.unknownResources.hasOwnProperty(as)) {
              if (
                ((imageSrcSet = resumableState.unknownResources[as]),
                imageSrcSet.hasOwnProperty(href))
              )
                return;
            } else ((imageSrcSet = {}), (resumableState.unknownResources[as] = imageSrcSet));
            imageSrcSet[href] = PRELOAD_NO_CREDS;
            if (
              (resumableState = renderState.headers) &&
              0 < resumableState.remainingCapacity &&
              "font" === as &&
              ((key = getPreloadAsHeader(href, as, options)),
              0 <= (resumableState.remainingCapacity -= key.length + 2))
            )
              ((renderState.resets.font[href] = PRELOAD_NO_CREDS),
                resumableState.fontPreloads && (resumableState.fontPreloads += ", "),
                (resumableState.fontPreloads += key));
            else
              switch (
                ((resumableState = []),
                (href = assign(
                  {
                    rel: "preload",
                    href,
                    as,
                  },
                  options,
                )),
                pushLinkImpl(resumableState, href),
                as)
              ) {
                case "font":
                  renderState.fontPreloads.add(resumableState);
                  break;
                default:
                  renderState.bulkPreloads.add(resumableState);
              }
        }
        enqueueFlush(request);
      }
    } else previousDispatcher.L(href, as, options);
  }
  function preloadModule(href, options) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if (href) {
        var as = options && "string" === typeof options.as ? options.as : "script";
        switch (as) {
          case "script":
            if (resumableState.moduleScriptResources.hasOwnProperty(href)) return;
            as = [];
            resumableState.moduleScriptResources[href] =
              !options ||
              ("string" !== typeof options.crossOrigin && "string" !== typeof options.integrity)
                ? PRELOAD_NO_CREDS
                : [options.crossOrigin, options.integrity];
            renderState.preloads.moduleScripts.set(href, as);
            break;
          default:
            if (resumableState.moduleUnknownResources.hasOwnProperty(as)) {
              var resources = resumableState.unknownResources[as];
              if (resources.hasOwnProperty(href)) return;
            } else ((resources = {}), (resumableState.moduleUnknownResources[as] = resources));
            as = [];
            resources[href] = PRELOAD_NO_CREDS;
        }
        pushLinkImpl(
          as,
          assign(
            {
              rel: "modulepreload",
              href,
            },
            options,
          ),
        );
        renderState.bulkPreloads.add(as);
        enqueueFlush(request);
      }
    } else previousDispatcher.m(href, options);
  }
  function preinitStyle(href, precedence, options) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if (href) {
        precedence = precedence || "default";
        var styleQueue = renderState.styles.get(precedence),
          resourceState = resumableState.styleResources.hasOwnProperty(href)
            ? resumableState.styleResources[href]
            : void 0;
        null !== resourceState &&
          ((resumableState.styleResources[href] = null),
          styleQueue ||
            ((styleQueue = {
              precedence: stringToChunk(escapeTextForBrowser(precedence)),
              rules: [],
              hrefs: [],
              sheets: /* @__PURE__ */ new Map(),
            }),
            renderState.styles.set(precedence, styleQueue)),
          (precedence = {
            state: 0,
            props: assign(
              {
                rel: "stylesheet",
                href,
                "data-precedence": precedence,
              },
              options,
            ),
          }),
          resourceState &&
            (2 === resourceState.length && adoptPreloadCredentials(precedence.props, resourceState),
            (renderState = renderState.preloads.stylesheets.get(href)) && 0 < renderState.length
              ? (renderState.length = 0)
              : (precedence.state = 1)),
          styleQueue.sheets.set(href, precedence),
          enqueueFlush(request));
      }
    } else previousDispatcher.S(href, precedence, options);
  }
  function preinitScript(src, options) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if (src) {
        var resourceState = resumableState.scriptResources.hasOwnProperty(src)
          ? resumableState.scriptResources[src]
          : void 0;
        null !== resourceState &&
          ((resumableState.scriptResources[src] = null),
          (options = assign(
            {
              src,
              async: !0,
            },
            options,
          )),
          resourceState &&
            (2 === resourceState.length && adoptPreloadCredentials(options, resourceState),
            (src = renderState.preloads.scripts.get(src))) &&
            (src.length = 0),
          (src = []),
          renderState.scripts.add(src),
          pushScriptImpl(src, options),
          enqueueFlush(request));
      }
    } else previousDispatcher.X(src, options);
  }
  function preinitModuleScript(src, options) {
    var request = resolveRequest();
    if (request) {
      var resumableState = request.resumableState,
        renderState = request.renderState;
      if (src) {
        var resourceState = resumableState.moduleScriptResources.hasOwnProperty(src)
          ? resumableState.moduleScriptResources[src]
          : void 0;
        null !== resourceState &&
          ((resumableState.moduleScriptResources[src] = null),
          (options = assign(
            {
              src,
              type: "module",
              async: !0,
            },
            options,
          )),
          resourceState &&
            (2 === resourceState.length && adoptPreloadCredentials(options, resourceState),
            (src = renderState.preloads.moduleScripts.get(src))) &&
            (src.length = 0),
          (src = []),
          renderState.scripts.add(src),
          pushScriptImpl(src, options),
          enqueueFlush(request));
      }
    } else previousDispatcher.M(src, options);
  }
  function adoptPreloadCredentials(target, preloadState) {
    target.crossOrigin ??= preloadState[0];
    target.integrity ??= preloadState[1];
  }
  function getPreloadAsHeader(href, as, params) {
    href = ("" + href).replace(
      regexForHrefInLinkHeaderURLContext,
      escapeHrefForLinkHeaderURLContextReplacer,
    );
    as = ("" + as).replace(
      regexForLinkHeaderQuotedParamValueContext,
      escapeStringForLinkHeaderQuotedParamValueContextReplacer,
    );
    as = "<" + href + '>; rel=preload; as="' + as + '"';
    for (var paramName in params)
      hasOwnProperty.call(params, paramName) &&
        ((href = params[paramName]),
        "string" === typeof href &&
          (as +=
            "; " +
            paramName.toLowerCase() +
            '="' +
            ("" + href).replace(
              regexForLinkHeaderQuotedParamValueContext,
              escapeStringForLinkHeaderQuotedParamValueContextReplacer,
            ) +
            '"'));
    return as;
  }
  var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
  function escapeHrefForLinkHeaderURLContextReplacer(match) {
    switch (match) {
      case "<":
        return "%3C";
      case ">":
        return "%3E";
      case "\n":
        return "%0A";
      case "\r":
        return "%0D";
      default:
        throw Error(
          "escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
        );
    }
  }
  var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
  function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
    switch (match) {
      case '"':
        return "%22";
      case "'":
        return "%27";
      case ";":
        return "%3B";
      case ",":
        return "%2C";
      case "\n":
        return "%0A";
      case "\r":
        return "%0D";
      default:
        throw Error(
          "escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
        );
    }
  }
  function hoistStyleQueueDependency(styleQueue) {
    this.styles.add(styleQueue);
  }
  function hoistStylesheetDependency(stylesheet) {
    this.stylesheets.add(stylesheet);
  }
  function hoistHoistables(parentState, childState) {
    childState.styles.forEach(hoistStyleQueueDependency, parentState);
    childState.stylesheets.forEach(hoistStylesheetDependency, parentState);
    childState.suspenseyImages && (parentState.suspenseyImages = !0);
  }
  function hasSuspenseyContent(hoistableState) {
    return 0 < hoistableState.stylesheets.size || hoistableState.suspenseyImages;
  }
  var bind = Function.prototype.bind,
    supportsRequestStorage = "function" === typeof AsyncLocalStorage,
    requestStorage = supportsRequestStorage ? new AsyncLocalStorage() : null,
    REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function getComponentNameFromType(type) {
    if (null == type) return null;
    if ("function" === typeof type)
      return type.$$typeof === REACT_CLIENT_REFERENCE
        ? null
        : type.displayName || type.name || null;
    if ("string" === typeof type) return type;
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return "Fragment";
      case REACT_PROFILER_TYPE:
        return "Profiler";
      case REACT_STRICT_MODE_TYPE:
        return "StrictMode";
      case REACT_SUSPENSE_TYPE:
        return "Suspense";
      case REACT_SUSPENSE_LIST_TYPE:
        return "SuspenseList";
      case REACT_ACTIVITY_TYPE:
        return "Activity";
    }
    if ("object" === typeof type)
      switch (type.$$typeof) {
        case REACT_PORTAL_TYPE:
          return "Portal";
        case REACT_CONTEXT_TYPE:
          return type.displayName || "Context";
        case REACT_CONSUMER_TYPE:
          return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
          var innerType = type.render;
          type = type.displayName;
          type ||
            ((type = innerType.displayName || innerType.name || ""),
            (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
          return type;
        case REACT_MEMO_TYPE:
          return (
            (innerType = type.displayName || null),
            null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo"
          );
        case REACT_LAZY_TYPE:
          innerType = type._payload;
          type = type._init;
          try {
            return getComponentNameFromType(type(innerType));
          } catch (x) {}
      }
    return null;
  }
  var emptyContextObject = {},
    currentActiveSnapshot = null;
  function popToNearestCommonAncestor(prev, next) {
    if (prev !== next) {
      prev.context._currentValue = prev.parentValue;
      prev = prev.parent;
      var parentNext = next.parent;
      if (null === prev) {
        if (null !== parentNext)
          throw Error("The stacks must reach the root at the same time. This is a bug in React.");
      } else {
        if (null === parentNext)
          throw Error("The stacks must reach the root at the same time. This is a bug in React.");
        popToNearestCommonAncestor(prev, parentNext);
      }
      next.context._currentValue = next.value;
    }
  }
  function popAllPrevious(prev) {
    prev.context._currentValue = prev.parentValue;
    prev = prev.parent;
    null !== prev && popAllPrevious(prev);
  }
  function pushAllNext(next) {
    var parentNext = next.parent;
    null !== parentNext && pushAllNext(parentNext);
    next.context._currentValue = next.value;
  }
  function popPreviousToCommonLevel(prev, next) {
    prev.context._currentValue = prev.parentValue;
    prev = prev.parent;
    if (null === prev)
      throw Error(
        "The depth must equal at least at zero before reaching the root. This is a bug in React.",
      );
    prev.depth === next.depth
      ? popToNearestCommonAncestor(prev, next)
      : popPreviousToCommonLevel(prev, next);
  }
  function popNextToCommonLevel(prev, next) {
    var parentNext = next.parent;
    if (null === parentNext)
      throw Error(
        "The depth must equal at least at zero before reaching the root. This is a bug in React.",
      );
    prev.depth === parentNext.depth
      ? popToNearestCommonAncestor(prev, parentNext)
      : popNextToCommonLevel(prev, parentNext);
    next.context._currentValue = next.value;
  }
  function switchContext(newSnapshot) {
    var prev = currentActiveSnapshot;
    prev !== newSnapshot &&
      (null === prev
        ? pushAllNext(newSnapshot)
        : null === newSnapshot
          ? popAllPrevious(prev)
          : prev.depth === newSnapshot.depth
            ? popToNearestCommonAncestor(prev, newSnapshot)
            : prev.depth > newSnapshot.depth
              ? popPreviousToCommonLevel(prev, newSnapshot)
              : popNextToCommonLevel(prev, newSnapshot),
      (currentActiveSnapshot = newSnapshot));
  }
  var classComponentUpdater = {
      enqueueSetState: function (inst, payload) {
        inst = inst._reactInternals;
        null !== inst.queue && inst.queue.push(payload);
      },
      enqueueReplaceState: function (inst, payload) {
        inst = inst._reactInternals;
        inst.replace = !0;
        inst.queue = [payload];
      },
      enqueueForceUpdate: function () {},
    },
    emptyTreeContext = {
      id: 1,
      overflow: "",
    };
  function pushTreeContext(baseContext, totalChildren, index) {
    var baseIdWithLeadingBit = baseContext.id;
    baseContext = baseContext.overflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
      var numberOfOverflowBits = baseLength - (baseLength % 5);
      length = (baseIdWithLeadingBit & ((1 << numberOfOverflowBits) - 1)).toString(32);
      baseIdWithLeadingBit >>= numberOfOverflowBits;
      baseLength -= numberOfOverflowBits;
      return {
        id:
          (1 << (32 - clz32(totalChildren) + baseLength)) |
          (index << baseLength) |
          baseIdWithLeadingBit,
        overflow: length + baseContext,
      };
    }
    return {
      id: (1 << length) | (index << baseLength) | baseIdWithLeadingBit,
      overflow: baseContext,
    };
  }
  var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback,
    log = Math.log,
    LN2 = Math.LN2;
  function clz32Fallback(x) {
    x >>>= 0;
    return 0 === x ? 32 : (31 - ((log(x) / LN2) | 0)) | 0;
  }
  function noop() {}
  var SuspenseException = Error(
    "Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.",
  );
  function trackUsedThenable(thenableState, thenable, index) {
    index = thenableState[index];
    void 0 === index
      ? thenableState.push(thenable)
      : index !== thenable && (thenable.then(noop, noop), (thenable = index));
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        "string" === typeof thenable.status
          ? thenable.then(noop, noop)
          : ((thenableState = thenable),
            (thenableState.status = "pending"),
            thenableState.then(
              function (fulfilledValue) {
                if ("pending" === thenable.status) {
                  var fulfilledThenable = thenable;
                  fulfilledThenable.status = "fulfilled";
                  fulfilledThenable.value = fulfilledValue;
                }
              },
              function (error) {
                if ("pending" === thenable.status) {
                  var rejectedThenable = thenable;
                  rejectedThenable.status = "rejected";
                  rejectedThenable.reason = error;
                }
              },
            ));
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
        suspendedThenable = thenable;
        throw SuspenseException;
    }
  }
  var suspendedThenable = null;
  function getSuspendedThenable() {
    if (null === suspendedThenable)
      throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }
  function is(x, y) {
    return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is,
    currentlyRenderingComponent = null,
    currentlyRenderingTask = null,
    currentlyRenderingRequest = null,
    currentlyRenderingKeyPath = null,
    firstWorkInProgressHook = null,
    workInProgressHook = null,
    isReRender = !1,
    didScheduleRenderPhaseUpdate = !1,
    localIdCounter = 0,
    actionStateCounter = 0,
    actionStateMatchingIndex = -1,
    thenableIndexCounter = 0,
    thenableState = null,
    renderPhaseUpdates = null,
    numberOfReRenders = 0;
  function resolveCurrentlyRenderingComponent() {
    if (null === currentlyRenderingComponent)
      throw Error(
        "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.",
      );
    return currentlyRenderingComponent;
  }
  function createHook() {
    if (0 < numberOfReRenders) throw Error("Rendered more hooks than during the previous render");
    return {
      memoizedState: null,
      queue: null,
      next: null,
    };
  }
  function createWorkInProgressHook() {
    null === workInProgressHook
      ? null === firstWorkInProgressHook
        ? ((isReRender = !1), (firstWorkInProgressHook = workInProgressHook = createHook()))
        : ((isReRender = !0), (workInProgressHook = firstWorkInProgressHook))
      : null === workInProgressHook.next
        ? ((isReRender = !1), (workInProgressHook = workInProgressHook.next = createHook()))
        : ((isReRender = !0), (workInProgressHook = workInProgressHook.next));
    return workInProgressHook;
  }
  function getThenableStateAfterSuspending() {
    var state = thenableState;
    thenableState = null;
    return state;
  }
  function resetHooksState() {
    currentlyRenderingKeyPath =
      currentlyRenderingRequest =
      currentlyRenderingTask =
      currentlyRenderingComponent =
        null;
    didScheduleRenderPhaseUpdate = !1;
    firstWorkInProgressHook = null;
    numberOfReRenders = 0;
    workInProgressHook = renderPhaseUpdates = null;
  }
  function basicStateReducer(state, action) {
    return "function" === typeof action ? action(state) : action;
  }
  function useReducer(reducer, initialArg, init) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    if (isReRender) {
      var queue = workInProgressHook.queue;
      initialArg = queue.dispatch;
      if (
        null !== renderPhaseUpdates &&
        ((init = renderPhaseUpdates.get(queue)), void 0 !== init)
      ) {
        renderPhaseUpdates.delete(queue);
        queue = workInProgressHook.memoizedState;
        do ((queue = reducer(queue, init.action)), (init = init.next));
        while (null !== init);
        workInProgressHook.memoizedState = queue;
        return [queue, initialArg];
      }
      return [workInProgressHook.memoizedState, initialArg];
    }
    reducer =
      reducer === basicStateReducer
        ? "function" === typeof initialArg
          ? initialArg()
          : initialArg
        : void 0 !== init
          ? init(initialArg)
          : initialArg;
    workInProgressHook.memoizedState = reducer;
    reducer = workInProgressHook.queue = {
      last: null,
      dispatch: null,
    };
    reducer = reducer.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, reducer);
    return [workInProgressHook.memoizedState, reducer];
  }
  function useMemo(nextCreate, deps) {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    deps = void 0 === deps ? null : deps;
    if (null !== workInProgressHook) {
      var prevState = workInProgressHook.memoizedState;
      if (null !== prevState && null !== deps) {
        var prevDeps = prevState[1];
        a: if (null === prevDeps) prevDeps = !1;
        else {
          for (var i = 0; i < prevDeps.length && i < deps.length; i++)
            if (!objectIs(deps[i], prevDeps[i])) {
              prevDeps = !1;
              break a;
            }
          prevDeps = !0;
        }
        if (prevDeps) return prevState[0];
      }
    }
    nextCreate = nextCreate();
    workInProgressHook.memoizedState = [nextCreate, deps];
    return nextCreate;
  }
  function dispatchAction(componentIdentity, queue, action) {
    if (25 <= numberOfReRenders)
      throw Error(
        "Too many re-renders. React limits the number of renders to prevent an infinite loop.",
      );
    if (componentIdentity === currentlyRenderingComponent)
      if (
        ((didScheduleRenderPhaseUpdate = !0),
        (componentIdentity = {
          action,
          next: null,
        }),
        null === renderPhaseUpdates && (renderPhaseUpdates = /* @__PURE__ */ new Map()),
        (action = renderPhaseUpdates.get(queue)),
        void 0 === action)
      )
        renderPhaseUpdates.set(queue, componentIdentity);
      else {
        for (queue = action; null !== queue.next; ) queue = queue.next;
        queue.next = componentIdentity;
      }
  }
  function throwOnUseEffectEventCall() {
    throw Error("A function wrapped in useEffectEvent can't be called during rendering.");
  }
  function unsupportedStartTransition() {
    throw Error("startTransition cannot be called during server rendering.");
  }
  function unsupportedSetOptimisticState() {
    throw Error("Cannot update optimistic state while rendering.");
  }
  function useActionState(action, initialState, permalink) {
    resolveCurrentlyRenderingComponent();
    var actionStateHookIndex = actionStateCounter++,
      request = currentlyRenderingRequest;
    if ("function" === typeof action.$$FORM_ACTION) {
      var nextPostbackStateKey = null,
        componentKeyPath = currentlyRenderingKeyPath;
      request = request.formState;
      var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
      if (null !== request && "function" === typeof isSignatureEqual) {
        var postbackKey = request[1];
        isSignatureEqual.call(action, request[2], request[3]) &&
          ((nextPostbackStateKey =
            void 0 !== permalink
              ? "p" + permalink
              : "k" +
                murmurhash3_32_gc(
                  JSON.stringify([componentKeyPath, null, actionStateHookIndex]),
                  0,
                )),
          postbackKey === nextPostbackStateKey &&
            ((actionStateMatchingIndex = actionStateHookIndex), (initialState = request[0])));
      }
      var boundAction = action.bind(null, initialState);
      action = function (payload) {
        boundAction(payload);
      };
      "function" === typeof boundAction.$$FORM_ACTION &&
        (action.$$FORM_ACTION = function (prefix) {
          prefix = boundAction.$$FORM_ACTION(prefix);
          void 0 !== permalink && ((permalink += ""), (prefix.action = permalink));
          var formData = prefix.data;
          formData &&
            (null === nextPostbackStateKey &&
              (nextPostbackStateKey =
                void 0 !== permalink
                  ? "p" + permalink
                  : "k" +
                    murmurhash3_32_gc(
                      JSON.stringify([componentKeyPath, null, actionStateHookIndex]),
                      0,
                    )),
            formData.append("$ACTION_KEY", nextPostbackStateKey));
          return prefix;
        });
      return [initialState, action, !1];
    }
    var boundAction$22 = action.bind(null, initialState);
    return [
      initialState,
      function (payload) {
        boundAction$22(payload);
      },
      !1,
    ];
  }
  function unwrapThenable(thenable) {
    var index = thenableIndexCounter;
    thenableIndexCounter += 1;
    null === thenableState && (thenableState = []);
    return trackUsedThenable(thenableState, thenable, index);
  }
  function unsupportedRefresh() {
    throw Error("Cache cannot be refreshed during server rendering.");
  }
  var HooksDispatcher = {
      readContext: function (context) {
        return context._currentValue;
      },
      use: function (usable) {
        if (null !== usable && "object" === typeof usable) {
          if ("function" === typeof usable.then) return unwrapThenable(usable);
          if (usable.$$typeof === REACT_CONTEXT_TYPE) return usable._currentValue;
        }
        throw Error("An unsupported type was passed to use(): " + String(usable));
      },
      useContext: function (context) {
        resolveCurrentlyRenderingComponent();
        return context._currentValue;
      },
      useMemo,
      useReducer,
      useRef: function (initialValue) {
        currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
        workInProgressHook = createWorkInProgressHook();
        var previousRef = workInProgressHook.memoizedState;
        return null === previousRef
          ? ((initialValue = { current: initialValue }),
            (workInProgressHook.memoizedState = initialValue))
          : previousRef;
      },
      useState: function (initialState) {
        return useReducer(basicStateReducer, initialState);
      },
      useInsertionEffect: noop,
      useLayoutEffect: noop,
      useCallback: function (callback, deps) {
        return useMemo(function () {
          return callback;
        }, deps);
      },
      useImperativeHandle: noop,
      useEffect: noop,
      useDebugValue: noop,
      useDeferredValue: function (value, initialValue) {
        resolveCurrentlyRenderingComponent();
        return void 0 !== initialValue ? initialValue : value;
      },
      useTransition: function () {
        resolveCurrentlyRenderingComponent();
        return [!1, unsupportedStartTransition];
      },
      useId: function () {
        var JSCompiler_inline_result = currentlyRenderingTask.treeContext;
        var overflow = JSCompiler_inline_result.overflow;
        JSCompiler_inline_result = JSCompiler_inline_result.id;
        JSCompiler_inline_result =
          (JSCompiler_inline_result & ~(1 << (32 - clz32(JSCompiler_inline_result) - 1))).toString(
            32,
          ) + overflow;
        var resumableState = currentResumableState;
        if (null === resumableState)
          throw Error(
            "Invalid hook call. Hooks can only be called inside of the body of a function component.",
          );
        overflow = localIdCounter++;
        JSCompiler_inline_result = "_" + resumableState.idPrefix + "R_" + JSCompiler_inline_result;
        0 < overflow && (JSCompiler_inline_result += "H" + overflow.toString(32));
        return JSCompiler_inline_result + "_";
      },
      useSyncExternalStore: function (subscribe, getSnapshot, getServerSnapshot) {
        if (void 0 === getServerSnapshot)
          throw Error(
            "Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.",
          );
        return getServerSnapshot();
      },
      useOptimistic: function (passthrough) {
        resolveCurrentlyRenderingComponent();
        return [passthrough, unsupportedSetOptimisticState];
      },
      useActionState,
      useFormState: useActionState,
      useHostTransitionStatus: function () {
        resolveCurrentlyRenderingComponent();
        return sharedNotPendingObject;
      },
      useMemoCache: function (size) {
        for (var data = Array(size), i = 0; i < size; i++) data[i] = REACT_MEMO_CACHE_SENTINEL;
        return data;
      },
      useCacheRefresh: function () {
        return unsupportedRefresh;
      },
      useEffectEvent: function () {
        return throwOnUseEffectEventCall;
      },
    },
    currentResumableState = null,
    DefaultAsyncDispatcher = {
      getCacheForType: function () {
        throw Error("Not implemented.");
      },
      cacheSignal: function () {
        throw Error("Not implemented.");
      },
    };
  function prepareStackTrace(error, structuredStackTrace) {
    error = (error.name || "Error") + ": " + (error.message || "");
    for (var i = 0; i < structuredStackTrace.length; i++)
      error += "\n    at " + structuredStackTrace[i].toString();
    return error;
  }
  var prefix, suffix;
  function describeBuiltInComponentFrame(name) {
    if (void 0 === prefix)
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = (match && match[1]) || "";
        suffix =
          -1 < x.stack.indexOf("\n    at")
            ? " (<anonymous>)"
            : -1 < x.stack.indexOf("@")
              ? "@unknown:0:0"
              : "";
      }
    return "\n" + prefix + name + suffix;
  }
  var reentry = !1;
  function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry) return "";
    reentry = !0;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = prepareStackTrace;
    try {
      var RunInRootFrame = {
        DetermineComponentFrameRoot: function () {
          try {
            if (construct) {
              var Fake = function () {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function () {
                  throw Error();
                },
              });
              if ("object" === typeof Reflect && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  var control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x$24) {
                  control = x$24;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x$25) {
                control = x$25;
              }
              (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function () {});
            }
          } catch (sample) {
            if (sample && control && "string" === typeof sample.stack)
              return [sample.stack, control.stack];
          }
          return [null, null];
        },
      };
      RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var namePropDescriptor = Object.getOwnPropertyDescriptor(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
      );
      namePropDescriptor &&
        namePropDescriptor.configurable &&
        Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", {
          value: "DetermineComponentFrameRoot",
        });
      var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
        sampleStack = _RunInRootFrame$Deter[0],
        controlStack = _RunInRootFrame$Deter[1];
      if (sampleStack && controlStack) {
        var sampleLines = sampleStack.split("\n"),
          controlLines = controlStack.split("\n");
        for (
          namePropDescriptor = RunInRootFrame = 0;
          RunInRootFrame < sampleLines.length &&
          !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");
        )
          RunInRootFrame++;
        for (
          ;
          namePropDescriptor < controlLines.length &&
          !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");
        )
          namePropDescriptor++;
        if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
          for (
            RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1;
            1 <= RunInRootFrame &&
            0 <= namePropDescriptor &&
            sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];
          )
            namePropDescriptor--;
        for (
          ;
          1 <= RunInRootFrame && 0 <= namePropDescriptor;
          RunInRootFrame--, namePropDescriptor--
        )
          if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
            if (1 !== RunInRootFrame || 1 !== namePropDescriptor)
              do
                if (
                  (RunInRootFrame--,
                  namePropDescriptor--,
                  0 > namePropDescriptor ||
                    sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor])
                ) {
                  var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                  fn.displayName &&
                    frame.includes("<anonymous>") &&
                    (frame = frame.replace("<anonymous>", fn.displayName));
                  return frame;
                }
              while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
            break;
          }
      }
    } finally {
      ((reentry = !1), (Error.prepareStackTrace = previousPrepareStackTrace));
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "")
      ? describeBuiltInComponentFrame(previousPrepareStackTrace)
      : "";
  }
  function describeComponentStackByType(type) {
    if ("string" === typeof type) return describeBuiltInComponentFrame(type);
    if ("function" === typeof type)
      return type.prototype && type.prototype.isReactComponent
        ? describeNativeComponentFrame(type, !0)
        : describeNativeComponentFrame(type, !1);
    if ("object" === typeof type && null !== type) {
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          return describeNativeComponentFrame(type.render, !1);
        case REACT_MEMO_TYPE:
          return describeNativeComponentFrame(type.type, !1);
        case REACT_LAZY_TYPE:
          var lazyComponent = type,
            payload = lazyComponent._payload;
          lazyComponent = lazyComponent._init;
          try {
            type = lazyComponent(payload);
          } catch (x) {
            return describeBuiltInComponentFrame("Lazy");
          }
          return describeComponentStackByType(type);
      }
      if ("string" === typeof type.name) {
        a: {
          payload = type.name;
          lazyComponent = type.env;
          var location = type.debugLocation;
          if (
            null != location &&
            ((type = Error.prepareStackTrace),
            (Error.prepareStackTrace = prepareStackTrace),
            (location = location.stack),
            (Error.prepareStackTrace = type),
            location.startsWith("Error: react-stack-top-frame\n") &&
              (location = location.slice(29)),
            (type = location.indexOf("\n")),
            -1 !== type && (location = location.slice(type + 1)),
            (type = location.indexOf("react_stack_bottom_frame")),
            -1 !== type && (type = location.lastIndexOf("\n", type)),
            (type = -1 !== type ? (location = location.slice(0, type)) : ""),
            (location = type.lastIndexOf("\n")),
            (type = -1 === location ? type : type.slice(location + 1)),
            -1 !== type.indexOf(payload))
          ) {
            payload = "\n" + type;
            break a;
          }
          payload = describeBuiltInComponentFrame(
            payload + (lazyComponent ? " [" + lazyComponent + "]" : ""),
          );
        }
        return payload;
      }
    }
    switch (type) {
      case REACT_SUSPENSE_LIST_TYPE:
        return describeBuiltInComponentFrame("SuspenseList");
      case REACT_SUSPENSE_TYPE:
        return describeBuiltInComponentFrame("Suspense");
    }
    return "";
  }
  function isEligibleForOutlining(request, boundary) {
    return (
      (500 < boundary.byteSize || hasSuspenseyContent(boundary.contentState)) &&
      null === boundary.contentPreamble
    );
  }
  function defaultErrorHandler(error) {
    if ("object" === typeof error && null !== error && "string" === typeof error.environmentName) {
      var JSCompiler_inline_result = error.environmentName;
      error = [error].slice(0);
      "string" === typeof error[0]
        ? error.splice(
            0,
            1,
            "\x1B[0m\x1B[7m%c%s\x1B[0m%c " + error[0],
            "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px",
            " " + JSCompiler_inline_result + " ",
            "",
          )
        : error.splice(
            0,
            0,
            "\x1B[0m\x1B[7m%c%s\x1B[0m%c",
            "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px",
            " " + JSCompiler_inline_result + " ",
            "",
          );
      error.unshift(console);
      JSCompiler_inline_result = bind.apply(console.error, error);
      JSCompiler_inline_result();
    } else console.error(error);
    return null;
  }
  function RequestInstance(
    resumableState,
    renderState,
    rootFormatContext,
    progressiveChunkSize,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
    formState,
  ) {
    var abortSet = /* @__PURE__ */ new Set();
    this.destination = null;
    this.flushScheduled = !1;
    this.resumableState = resumableState;
    this.renderState = renderState;
    this.rootFormatContext = rootFormatContext;
    this.progressiveChunkSize = void 0 === progressiveChunkSize ? 12800 : progressiveChunkSize;
    this.status = 10;
    this.fatalError = null;
    this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0;
    this.completedPreambleSegments = this.completedRootSegment = null;
    this.byteSize = 0;
    this.abortableTasks = abortSet;
    this.pingedTasks = [];
    this.clientRenderedBoundaries = [];
    this.completedBoundaries = [];
    this.partialBoundaries = [];
    this.trackedPostpones = null;
    this.onError = void 0 === onError ? defaultErrorHandler : onError;
    this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
    this.onAllReady = void 0 === onAllReady ? noop : onAllReady;
    this.onShellReady = void 0 === onShellReady ? noop : onShellReady;
    this.onShellError = void 0 === onShellError ? noop : onShellError;
    this.onFatalError = void 0 === onFatalError ? noop : onFatalError;
    this.formState = void 0 === formState ? null : formState;
  }
  function createRequest(
    children,
    resumableState,
    renderState,
    rootFormatContext,
    progressiveChunkSize,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
    formState,
  ) {
    resumableState = new RequestInstance(
      resumableState,
      renderState,
      rootFormatContext,
      progressiveChunkSize,
      onError,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      onPostpone,
      formState,
    );
    renderState = createPendingSegment(resumableState, 0, null, rootFormatContext, !1, !1);
    renderState.parentFlushed = !0;
    children = createRenderTask(
      resumableState,
      null,
      children,
      -1,
      null,
      renderState,
      null,
      null,
      resumableState.abortableTasks,
      null,
      rootFormatContext,
      null,
      emptyTreeContext,
      null,
      null,
    );
    pushComponentStack(children);
    resumableState.pingedTasks.push(children);
    return resumableState;
  }
  function createPrerenderRequest(
    children,
    resumableState,
    renderState,
    rootFormatContext,
    progressiveChunkSize,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
  ) {
    children = createRequest(
      children,
      resumableState,
      renderState,
      rootFormatContext,
      progressiveChunkSize,
      onError,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      onPostpone,
      void 0,
    );
    children.trackedPostpones = {
      workingMap: /* @__PURE__ */ new Map(),
      rootNodes: [],
      rootSlots: null,
    };
    return children;
  }
  function resumeRequest(
    children,
    postponedState,
    renderState,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
  ) {
    renderState = new RequestInstance(
      postponedState.resumableState,
      renderState,
      postponedState.rootFormatContext,
      postponedState.progressiveChunkSize,
      onError,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      onPostpone,
      null,
    );
    renderState.nextSegmentId = postponedState.nextSegmentId;
    if ("number" === typeof postponedState.replaySlots)
      return (
        (onError = createPendingSegment(
          renderState,
          0,
          null,
          postponedState.rootFormatContext,
          !1,
          !1,
        )),
        (onError.parentFlushed = !0),
        (children = createRenderTask(
          renderState,
          null,
          children,
          -1,
          null,
          onError,
          null,
          null,
          renderState.abortableTasks,
          null,
          postponedState.rootFormatContext,
          null,
          emptyTreeContext,
          null,
          null,
        )),
        pushComponentStack(children),
        renderState.pingedTasks.push(children),
        renderState
      );
    children = createReplayTask(
      renderState,
      null,
      {
        nodes: postponedState.replayNodes,
        slots: postponedState.replaySlots,
        pendingTasks: 0,
      },
      children,
      -1,
      null,
      null,
      renderState.abortableTasks,
      null,
      postponedState.rootFormatContext,
      null,
      emptyTreeContext,
      null,
      null,
    );
    pushComponentStack(children);
    renderState.pingedTasks.push(children);
    return renderState;
  }
  function resumeAndPrerenderRequest(
    children,
    postponedState,
    renderState,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
  ) {
    children = resumeRequest(
      children,
      postponedState,
      renderState,
      onError,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      onPostpone,
    );
    children.trackedPostpones = {
      workingMap: /* @__PURE__ */ new Map(),
      rootNodes: [],
      rootSlots: null,
    };
    return children;
  }
  var currentRequest = null;
  function resolveRequest() {
    if (currentRequest) return currentRequest;
    if (supportsRequestStorage) {
      var store = requestStorage.getStore();
      if (store) return store;
    }
    return null;
  }
  function pingTask(request, task) {
    request.pingedTasks.push(task);
    1 === request.pingedTasks.length &&
      ((request.flushScheduled = null !== request.destination),
      null !== request.trackedPostpones || 10 === request.status
        ? scheduleMicrotask(function () {
            return performWork(request);
          })
        : setTimeout(function () {
            return performWork(request);
          }, 0));
  }
  function createSuspenseBoundary(
    request,
    row,
    fallbackAbortableTasks,
    contentPreamble,
    fallbackPreamble,
  ) {
    fallbackAbortableTasks = {
      status: 0,
      rootSegmentID: -1,
      parentFlushed: !1,
      pendingTasks: 0,
      row,
      completedSegments: [],
      byteSize: 0,
      fallbackAbortableTasks,
      errorDigest: null,
      contentState: createHoistableState(),
      fallbackState: createHoistableState(),
      contentPreamble,
      fallbackPreamble,
      trackedContentKeyPath: null,
      trackedFallbackNode: null,
    };
    null !== row &&
      (row.pendingTasks++,
      (contentPreamble = row.boundaries),
      null !== contentPreamble &&
        (request.allPendingTasks++,
        fallbackAbortableTasks.pendingTasks++,
        contentPreamble.push(fallbackAbortableTasks)),
      (request = row.inheritedHoistables),
      null !== request && hoistHoistables(fallbackAbortableTasks.contentState, request));
    return fallbackAbortableTasks;
  }
  function createRenderTask(
    request,
    thenableState,
    node,
    childIndex,
    blockedBoundary,
    blockedSegment,
    blockedPreamble,
    hoistableState,
    abortSet,
    keyPath,
    formatContext,
    context,
    treeContext,
    row,
    componentStack,
  ) {
    request.allPendingTasks++;
    null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
    null !== row && row.pendingTasks++;
    var task = {
      replay: null,
      node,
      childIndex,
      ping: function () {
        return pingTask(request, task);
      },
      blockedBoundary,
      blockedSegment,
      blockedPreamble,
      hoistableState,
      abortSet,
      keyPath,
      formatContext,
      context,
      treeContext,
      row,
      componentStack,
      thenableState,
    };
    abortSet.add(task);
    return task;
  }
  function createReplayTask(
    request,
    thenableState,
    replay,
    node,
    childIndex,
    blockedBoundary,
    hoistableState,
    abortSet,
    keyPath,
    formatContext,
    context,
    treeContext,
    row,
    componentStack,
  ) {
    request.allPendingTasks++;
    null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
    null !== row && row.pendingTasks++;
    replay.pendingTasks++;
    var task = {
      replay,
      node,
      childIndex,
      ping: function () {
        return pingTask(request, task);
      },
      blockedBoundary,
      blockedSegment: null,
      blockedPreamble: null,
      hoistableState,
      abortSet,
      keyPath,
      formatContext,
      context,
      treeContext,
      row,
      componentStack,
      thenableState,
    };
    abortSet.add(task);
    return task;
  }
  function createPendingSegment(
    request,
    index,
    boundary,
    parentFormatContext,
    lastPushedText,
    textEmbedded,
  ) {
    return {
      status: 0,
      parentFlushed: !1,
      id: -1,
      index,
      chunks: [],
      children: [],
      preambleChildren: [],
      parentFormatContext,
      boundary,
      lastPushedText,
      textEmbedded,
    };
  }
  function pushComponentStack(task) {
    var node = task.node;
    if ("object" === typeof node && null !== node)
      switch (node.$$typeof) {
        case REACT_ELEMENT_TYPE:
          task.componentStack = {
            parent: task.componentStack,
            type: node.type,
          };
      }
  }
  function replaceSuspenseComponentStackWithSuspenseFallbackStack(componentStack) {
    return null === componentStack
      ? null
      : {
          parent: componentStack.parent,
          type: "Suspense Fallback",
        };
  }
  function getThrownInfo(node$jscomp$0) {
    var errorInfo = {};
    node$jscomp$0 &&
      Object.defineProperty(errorInfo, "componentStack", {
        configurable: !0,
        enumerable: !0,
        get: function () {
          try {
            var info = "",
              node = node$jscomp$0;
            do ((info += describeComponentStackByType(node.type)), (node = node.parent));
            while (node);
            var JSCompiler_inline_result = info;
          } catch (x) {
            JSCompiler_inline_result = "\nError generating stack: " + x.message + "\n" + x.stack;
          }
          Object.defineProperty(errorInfo, "componentStack", { value: JSCompiler_inline_result });
          return JSCompiler_inline_result;
        },
      });
    return errorInfo;
  }
  function logRecoverableError(request, error, errorInfo) {
    request = request.onError;
    error = request(error, errorInfo);
    if (null == error || "string" === typeof error) return error;
  }
  function fatalError(request, error) {
    var onShellError = request.onShellError,
      onFatalError = request.onFatalError;
    onShellError(error);
    onFatalError(error);
    null !== request.destination
      ? ((request.status = 14), closeWithError(request.destination, error))
      : ((request.status = 13), (request.fatalError = error));
  }
  function finishSuspenseListRow(request, row) {
    unblockSuspenseListRow(request, row.next, row.hoistables);
  }
  function unblockSuspenseListRow(request, unblockedRow, inheritedHoistables) {
    for (; null !== unblockedRow; ) {
      null !== inheritedHoistables &&
        (hoistHoistables(unblockedRow.hoistables, inheritedHoistables),
        (unblockedRow.inheritedHoistables = inheritedHoistables));
      var unblockedBoundaries = unblockedRow.boundaries;
      if (null !== unblockedBoundaries) {
        unblockedRow.boundaries = null;
        for (var i = 0; i < unblockedBoundaries.length; i++) {
          var unblockedBoundary = unblockedBoundaries[i];
          null !== inheritedHoistables &&
            hoistHoistables(unblockedBoundary.contentState, inheritedHoistables);
          finishedTask(request, unblockedBoundary, null, null);
        }
      }
      unblockedRow.pendingTasks--;
      if (0 < unblockedRow.pendingTasks) break;
      inheritedHoistables = unblockedRow.hoistables;
      unblockedRow = unblockedRow.next;
    }
  }
  function tryToResolveTogetherRow(request, togetherRow) {
    var boundaries = togetherRow.boundaries;
    if (null !== boundaries && togetherRow.pendingTasks === boundaries.length) {
      for (var allCompleteAndInlinable = !0, i = 0; i < boundaries.length; i++) {
        var rowBoundary = boundaries[i];
        if (
          1 !== rowBoundary.pendingTasks ||
          rowBoundary.parentFlushed ||
          isEligibleForOutlining(request, rowBoundary)
        ) {
          allCompleteAndInlinable = !1;
          break;
        }
      }
      allCompleteAndInlinable &&
        unblockSuspenseListRow(request, togetherRow, togetherRow.hoistables);
    }
  }
  function createSuspenseListRow(previousRow) {
    var newRow = {
      pendingTasks: 1,
      boundaries: null,
      hoistables: createHoistableState(),
      inheritedHoistables: null,
      together: !1,
      next: null,
    };
    null !== previousRow &&
      0 < previousRow.pendingTasks &&
      (newRow.pendingTasks++, (newRow.boundaries = []), (previousRow.next = newRow));
    return newRow;
  }
  function renderSuspenseListRows(request, task, keyPath, rows, revealOrder) {
    var prevKeyPath = task.keyPath,
      prevTreeContext = task.treeContext,
      prevRow = task.row;
    task.keyPath = keyPath;
    keyPath = rows.length;
    var previousSuspenseListRow = null;
    if (null !== task.replay) {
      var resumeSlots = task.replay.slots;
      if (null !== resumeSlots && "object" === typeof resumeSlots)
        for (var n = 0; n < keyPath; n++) {
          var i =
              "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder
                ? n
                : keyPath - 1 - n,
            node = rows[i];
          task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
          task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
          var resumeSegmentID = resumeSlots[i];
          "number" === typeof resumeSegmentID
            ? (resumeNode(request, task, resumeSegmentID, node, i), delete resumeSlots[i])
            : renderNode(request, task, node, i);
          0 === --previousSuspenseListRow.pendingTasks &&
            finishSuspenseListRow(request, previousSuspenseListRow);
        }
      else
        for (resumeSlots = 0; resumeSlots < keyPath; resumeSlots++)
          ((n =
            "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder
              ? resumeSlots
              : keyPath - 1 - resumeSlots),
            (i = rows[n]),
            (task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow)),
            (task.treeContext = pushTreeContext(prevTreeContext, keyPath, n)),
            renderNode(request, task, i, n),
            0 === --previousSuspenseListRow.pendingTasks &&
              finishSuspenseListRow(request, previousSuspenseListRow));
    } else if ("backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder)
      for (revealOrder = 0; revealOrder < keyPath; revealOrder++)
        ((resumeSlots = rows[revealOrder]),
          (task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow)),
          (task.treeContext = pushTreeContext(prevTreeContext, keyPath, revealOrder)),
          renderNode(request, task, resumeSlots, revealOrder),
          0 === --previousSuspenseListRow.pendingTasks &&
            finishSuspenseListRow(request, previousSuspenseListRow));
    else {
      revealOrder = task.blockedSegment;
      resumeSlots = revealOrder.children.length;
      n = revealOrder.chunks.length;
      for (i = keyPath - 1; 0 <= i; i--) {
        node = rows[i];
        task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
        task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
        resumeSegmentID = createPendingSegment(
          request,
          n,
          null,
          task.formatContext,
          0 === i ? revealOrder.lastPushedText : !0,
          !0,
        );
        revealOrder.children.splice(resumeSlots, 0, resumeSegmentID);
        task.blockedSegment = resumeSegmentID;
        try {
          (renderNode(request, task, node, i),
            resumeSegmentID.lastPushedText &&
              resumeSegmentID.textEmbedded &&
              resumeSegmentID.chunks.push(textSeparator),
            (resumeSegmentID.status = 1),
            finishedSegment(request, task.blockedBoundary, resumeSegmentID),
            0 === --previousSuspenseListRow.pendingTasks &&
              finishSuspenseListRow(request, previousSuspenseListRow));
        } catch (thrownValue) {
          throw ((resumeSegmentID.status = 12 === request.status ? 3 : 4), thrownValue);
        }
      }
      task.blockedSegment = revealOrder;
      revealOrder.lastPushedText = !1;
    }
    null !== prevRow &&
      null !== previousSuspenseListRow &&
      0 < previousSuspenseListRow.pendingTasks &&
      (prevRow.pendingTasks++, (previousSuspenseListRow.next = prevRow));
    task.treeContext = prevTreeContext;
    task.row = prevRow;
    task.keyPath = prevKeyPath;
  }
  function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
    var prevThenableState = task.thenableState;
    task.thenableState = null;
    currentlyRenderingComponent = {};
    currentlyRenderingTask = task;
    currentlyRenderingRequest = request;
    currentlyRenderingKeyPath = keyPath;
    actionStateCounter = localIdCounter = 0;
    actionStateMatchingIndex = -1;
    thenableIndexCounter = 0;
    thenableState = prevThenableState;
    for (request = Component(props, secondArg); didScheduleRenderPhaseUpdate; )
      ((didScheduleRenderPhaseUpdate = !1),
        (actionStateCounter = localIdCounter = 0),
        (actionStateMatchingIndex = -1),
        (thenableIndexCounter = 0),
        (numberOfReRenders += 1),
        (workInProgressHook = null),
        (request = Component(props, secondArg)));
    resetHooksState();
    return request;
  }
  function finishFunctionComponent(
    request,
    task,
    keyPath,
    children,
    hasId,
    actionStateCount,
    actionStateMatchingIndex,
  ) {
    var didEmitActionStateMarkers = !1;
    if (0 !== actionStateCount && null !== request.formState) {
      var segment = task.blockedSegment;
      if (null !== segment) {
        didEmitActionStateMarkers = !0;
        segment = segment.chunks;
        for (var i = 0; i < actionStateCount; i++)
          i === actionStateMatchingIndex
            ? segment.push(formStateMarkerIsMatching)
            : segment.push(formStateMarkerIsNotMatching);
      }
    }
    actionStateCount = task.keyPath;
    task.keyPath = keyPath;
    hasId
      ? ((keyPath = task.treeContext),
        (task.treeContext = pushTreeContext(keyPath, 1, 0)),
        renderNode(request, task, children, -1),
        (task.treeContext = keyPath))
      : didEmitActionStateMarkers
        ? renderNode(request, task, children, -1)
        : renderNodeDestructive(request, task, children, -1);
    task.keyPath = actionStateCount;
  }
  function renderElement(request, task, keyPath, type, props, ref) {
    if ("function" === typeof type)
      if (type.prototype && type.prototype.isReactComponent) {
        var newProps = props;
        if ("ref" in props) {
          newProps = {};
          for (var propName in props) "ref" !== propName && (newProps[propName] = props[propName]);
        }
        var defaultProps = type.defaultProps;
        if (defaultProps) {
          newProps === props && (newProps = assign({}, newProps, props));
          for (var propName$44 in defaultProps)
            void 0 === newProps[propName$44] && (newProps[propName$44] = defaultProps[propName$44]);
        }
        props = newProps;
        newProps = emptyContextObject;
        defaultProps = type.contextType;
        "object" === typeof defaultProps &&
          null !== defaultProps &&
          (newProps = defaultProps._currentValue);
        newProps = new type(props, newProps);
        var initialState = void 0 !== newProps.state ? newProps.state : null;
        newProps.updater = classComponentUpdater;
        newProps.props = props;
        newProps.state = initialState;
        defaultProps = {
          queue: [],
          replace: !1,
        };
        newProps._reactInternals = defaultProps;
        ref = type.contextType;
        newProps.context =
          "object" === typeof ref && null !== ref ? ref._currentValue : emptyContextObject;
        ref = type.getDerivedStateFromProps;
        "function" === typeof ref &&
          ((ref = ref(props, initialState)),
          (initialState =
            null === ref || void 0 === ref ? initialState : assign({}, initialState, ref)),
          (newProps.state = initialState));
        if (
          "function" !== typeof type.getDerivedStateFromProps &&
          "function" !== typeof newProps.getSnapshotBeforeUpdate &&
          ("function" === typeof newProps.UNSAFE_componentWillMount ||
            "function" === typeof newProps.componentWillMount)
        )
          if (
            ((type = newProps.state),
            "function" === typeof newProps.componentWillMount && newProps.componentWillMount(),
            "function" === typeof newProps.UNSAFE_componentWillMount &&
              newProps.UNSAFE_componentWillMount(),
            type !== newProps.state &&
              classComponentUpdater.enqueueReplaceState(newProps, newProps.state, null),
            null !== defaultProps.queue && 0 < defaultProps.queue.length)
          )
            if (
              ((type = defaultProps.queue),
              (ref = defaultProps.replace),
              (defaultProps.queue = null),
              (defaultProps.replace = !1),
              ref && 1 === type.length)
            )
              newProps.state = type[0];
            else {
              defaultProps = ref ? type[0] : newProps.state;
              initialState = !0;
              for (ref = ref ? 1 : 0; ref < type.length; ref++)
                ((propName$44 = type[ref]),
                  (propName$44 =
                    "function" === typeof propName$44
                      ? propName$44.call(newProps, defaultProps, props, void 0)
                      : propName$44),
                  null != propName$44 &&
                    (initialState
                      ? ((initialState = !1),
                        (defaultProps = assign({}, defaultProps, propName$44)))
                      : assign(defaultProps, propName$44)));
              newProps.state = defaultProps;
            }
          else defaultProps.queue = null;
        type = newProps.render();
        if (12 === request.status) throw null;
        props = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, type, -1);
        task.keyPath = props;
      } else {
        type = renderWithHooks(request, task, keyPath, type, props, void 0);
        if (12 === request.status) throw null;
        finishFunctionComponent(
          request,
          task,
          keyPath,
          type,
          0 !== localIdCounter,
          actionStateCounter,
          actionStateMatchingIndex,
        );
      }
    else if ("string" === typeof type)
      if (((newProps = task.blockedSegment), null === newProps))
        ((newProps = props.children),
          (defaultProps = task.formatContext),
          (initialState = task.keyPath),
          (task.formatContext = getChildFormatContext(defaultProps, type, props)),
          (task.keyPath = keyPath),
          renderNode(request, task, newProps, -1),
          (task.formatContext = defaultProps),
          (task.keyPath = initialState));
      else {
        initialState = pushStartInstance(
          newProps.chunks,
          type,
          props,
          request.resumableState,
          request.renderState,
          task.blockedPreamble,
          task.hoistableState,
          task.formatContext,
          newProps.lastPushedText,
        );
        newProps.lastPushedText = !1;
        defaultProps = task.formatContext;
        ref = task.keyPath;
        task.keyPath = keyPath;
        if (
          3 ===
          (task.formatContext = getChildFormatContext(defaultProps, type, props)).insertionMode
        ) {
          keyPath = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
          newProps.preambleChildren.push(keyPath);
          task.blockedSegment = keyPath;
          try {
            ((keyPath.status = 6),
              renderNode(request, task, initialState, -1),
              keyPath.lastPushedText && keyPath.textEmbedded && keyPath.chunks.push(textSeparator),
              (keyPath.status = 1),
              finishedSegment(request, task.blockedBoundary, keyPath));
          } finally {
            task.blockedSegment = newProps;
          }
        } else renderNode(request, task, initialState, -1);
        task.formatContext = defaultProps;
        task.keyPath = ref;
        a: {
          task = newProps.chunks;
          request = request.resumableState;
          switch (type) {
            case "title":
            case "style":
            case "script":
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "input":
            case "keygen":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr":
              break a;
            case "body":
              if (1 >= defaultProps.insertionMode) {
                request.hasBody = !0;
                break a;
              }
              break;
            case "html":
              if (0 === defaultProps.insertionMode) {
                request.hasHtml = !0;
                break a;
              }
              break;
            case "head":
              if (1 >= defaultProps.insertionMode) break a;
          }
          task.push(endChunkForTag(type));
        }
        newProps.lastPushedText = !1;
      }
    else {
      switch (type) {
        case REACT_LEGACY_HIDDEN_TYPE:
        case REACT_STRICT_MODE_TYPE:
        case REACT_PROFILER_TYPE:
        case REACT_FRAGMENT_TYPE:
          type = task.keyPath;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, props.children, -1);
          task.keyPath = type;
          return;
        case REACT_ACTIVITY_TYPE:
          type = task.blockedSegment;
          null === type
            ? "hidden" !== props.mode &&
              ((type = task.keyPath),
              (task.keyPath = keyPath),
              renderNode(request, task, props.children, -1),
              (task.keyPath = type))
            : "hidden" !== props.mode &&
              (type.chunks.push(startActivityBoundary),
              (type.lastPushedText = !1),
              (newProps = task.keyPath),
              (task.keyPath = keyPath),
              renderNode(request, task, props.children, -1),
              (task.keyPath = newProps),
              type.chunks.push(endActivityBoundary),
              (type.lastPushedText = !1));
          return;
        case REACT_SUSPENSE_LIST_TYPE:
          a: {
            type = props.children;
            props = props.revealOrder;
            if (
              "forwards" === props ||
              "backwards" === props ||
              "unstable_legacy-backwards" === props
            ) {
              if (isArrayImpl(type)) {
                renderSuspenseListRows(request, task, keyPath, type, props);
                break a;
              }
              if ((newProps = getIteratorFn(type))) {
                if ((newProps = newProps.call(type))) {
                  defaultProps = newProps.next();
                  if (!defaultProps.done) {
                    do defaultProps = newProps.next();
                    while (!defaultProps.done);
                    renderSuspenseListRows(request, task, keyPath, type, props);
                  }
                  break a;
                }
              }
            }
            "together" === props
              ? ((props = task.keyPath),
                (newProps = task.row),
                (defaultProps = task.row = createSuspenseListRow(null)),
                (defaultProps.boundaries = []),
                (defaultProps.together = !0),
                (task.keyPath = keyPath),
                renderNodeDestructive(request, task, type, -1),
                0 === --defaultProps.pendingTasks && finishSuspenseListRow(request, defaultProps),
                (task.keyPath = props),
                (task.row = newProps),
                null !== newProps &&
                  0 < defaultProps.pendingTasks &&
                  (newProps.pendingTasks++, (defaultProps.next = newProps)))
              : ((props = task.keyPath),
                (task.keyPath = keyPath),
                renderNodeDestructive(request, task, type, -1),
                (task.keyPath = props));
          }
          return;
        case REACT_VIEW_TRANSITION_TYPE:
        case REACT_SCOPE_TYPE:
          throw Error("ReactDOMServer does not yet support scope components.");
        case REACT_SUSPENSE_TYPE:
          a: if (null !== task.replay) {
            type = task.keyPath;
            newProps = task.formatContext;
            defaultProps = task.row;
            task.keyPath = keyPath;
            task.formatContext = getSuspenseContentFormatContext(request.resumableState, newProps);
            task.row = null;
            keyPath = props.children;
            try {
              renderNode(request, task, keyPath, -1);
            } finally {
              ((task.keyPath = type), (task.formatContext = newProps), (task.row = defaultProps));
            }
          } else {
            type = task.keyPath;
            ref = task.formatContext;
            var prevRow = task.row;
            propName$44 = task.blockedBoundary;
            propName = task.blockedPreamble;
            var parentHoistableState = task.hoistableState,
              parentSegment = task.blockedSegment,
              fallback = props.fallback;
            props = props.children;
            var fallbackAbortSet = /* @__PURE__ */ new Set();
            var newBoundary =
              2 > task.formatContext.insertionMode
                ? createSuspenseBoundary(
                    request,
                    task.row,
                    fallbackAbortSet,
                    createPreambleState(),
                    createPreambleState(),
                  )
                : createSuspenseBoundary(request, task.row, fallbackAbortSet, null, null);
            null !== request.trackedPostpones && (newBoundary.trackedContentKeyPath = keyPath);
            var boundarySegment = createPendingSegment(
              request,
              parentSegment.chunks.length,
              newBoundary,
              task.formatContext,
              !1,
              !1,
            );
            parentSegment.children.push(boundarySegment);
            parentSegment.lastPushedText = !1;
            var contentRootSegment = createPendingSegment(
              request,
              0,
              null,
              task.formatContext,
              !1,
              !1,
            );
            contentRootSegment.parentFlushed = !0;
            if (null !== request.trackedPostpones) {
              newProps = task.componentStack;
              defaultProps = [keyPath[0], "Suspense Fallback", keyPath[2]];
              initialState = [defaultProps[1], defaultProps[2], [], null];
              request.trackedPostpones.workingMap.set(defaultProps, initialState);
              newBoundary.trackedFallbackNode = initialState;
              task.blockedSegment = boundarySegment;
              task.blockedPreamble = newBoundary.fallbackPreamble;
              task.keyPath = defaultProps;
              task.formatContext = getSuspenseFallbackFormatContext(request.resumableState, ref);
              task.componentStack =
                replaceSuspenseComponentStackWithSuspenseFallbackStack(newProps);
              boundarySegment.status = 6;
              try {
                (renderNode(request, task, fallback, -1),
                  boundarySegment.lastPushedText &&
                    boundarySegment.textEmbedded &&
                    boundarySegment.chunks.push(textSeparator),
                  (boundarySegment.status = 1),
                  finishedSegment(request, propName$44, boundarySegment));
              } catch (thrownValue) {
                throw ((boundarySegment.status = 12 === request.status ? 3 : 4), thrownValue);
              } finally {
                ((task.blockedSegment = parentSegment),
                  (task.blockedPreamble = propName),
                  (task.keyPath = type),
                  (task.formatContext = ref));
              }
              task = createRenderTask(
                request,
                null,
                props,
                -1,
                newBoundary,
                contentRootSegment,
                newBoundary.contentPreamble,
                newBoundary.contentState,
                task.abortSet,
                keyPath,
                getSuspenseContentFormatContext(request.resumableState, task.formatContext),
                task.context,
                task.treeContext,
                null,
                newProps,
              );
              pushComponentStack(task);
              request.pingedTasks.push(task);
            } else {
              task.blockedBoundary = newBoundary;
              task.blockedPreamble = newBoundary.contentPreamble;
              task.hoistableState = newBoundary.contentState;
              task.blockedSegment = contentRootSegment;
              task.keyPath = keyPath;
              task.formatContext = getSuspenseContentFormatContext(request.resumableState, ref);
              task.row = null;
              contentRootSegment.status = 6;
              try {
                if (
                  (renderNode(request, task, props, -1),
                  contentRootSegment.lastPushedText &&
                    contentRootSegment.textEmbedded &&
                    contentRootSegment.chunks.push(textSeparator),
                  (contentRootSegment.status = 1),
                  finishedSegment(request, newBoundary, contentRootSegment),
                  queueCompletedSegment(newBoundary, contentRootSegment),
                  0 === newBoundary.pendingTasks && 0 === newBoundary.status)
                ) {
                  if (((newBoundary.status = 1), !isEligibleForOutlining(request, newBoundary))) {
                    null !== prevRow &&
                      0 === --prevRow.pendingTasks &&
                      finishSuspenseListRow(request, prevRow);
                    0 === request.pendingRootTasks &&
                      task.blockedPreamble &&
                      preparePreamble(request);
                    break a;
                  }
                } else
                  null !== prevRow && prevRow.together && tryToResolveTogetherRow(request, prevRow);
              } catch (thrownValue$31) {
                ((newBoundary.status = 4),
                  12 === request.status
                    ? ((contentRootSegment.status = 3), (newProps = request.fatalError))
                    : ((contentRootSegment.status = 4), (newProps = thrownValue$31)),
                  (defaultProps = getThrownInfo(task.componentStack)),
                  (initialState = logRecoverableError(request, newProps, defaultProps)),
                  (newBoundary.errorDigest = initialState),
                  untrackBoundary(request, newBoundary));
              } finally {
                ((task.blockedBoundary = propName$44),
                  (task.blockedPreamble = propName),
                  (task.hoistableState = parentHoistableState),
                  (task.blockedSegment = parentSegment),
                  (task.keyPath = type),
                  (task.formatContext = ref),
                  (task.row = prevRow));
              }
              task = createRenderTask(
                request,
                null,
                fallback,
                -1,
                propName$44,
                boundarySegment,
                newBoundary.fallbackPreamble,
                newBoundary.fallbackState,
                fallbackAbortSet,
                [keyPath[0], "Suspense Fallback", keyPath[2]],
                getSuspenseFallbackFormatContext(request.resumableState, task.formatContext),
                task.context,
                task.treeContext,
                task.row,
                replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack),
              );
              pushComponentStack(task);
              request.pingedTasks.push(task);
            }
          }
          return;
      }
      if ("object" === typeof type && null !== type)
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
            if ("ref" in props)
              for (parentSegment in ((newProps = {}), props))
                "ref" !== parentSegment && (newProps[parentSegment] = props[parentSegment]);
            else newProps = props;
            type = renderWithHooks(request, task, keyPath, type.render, newProps, ref);
            finishFunctionComponent(
              request,
              task,
              keyPath,
              type,
              0 !== localIdCounter,
              actionStateCounter,
              actionStateMatchingIndex,
            );
            return;
          case REACT_MEMO_TYPE:
            renderElement(request, task, keyPath, type.type, props, ref);
            return;
          case REACT_CONTEXT_TYPE:
            defaultProps = props.children;
            newProps = task.keyPath;
            props = props.value;
            initialState = type._currentValue;
            type._currentValue = props;
            ref = currentActiveSnapshot;
            currentActiveSnapshot = type = {
              parent: ref,
              depth: null === ref ? 0 : ref.depth + 1,
              context: type,
              parentValue: initialState,
              value: props,
            };
            task.context = type;
            task.keyPath = keyPath;
            renderNodeDestructive(request, task, defaultProps, -1);
            request = currentActiveSnapshot;
            if (null === request)
              throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
            request.context._currentValue = request.parentValue;
            request = currentActiveSnapshot = request.parent;
            task.context = request;
            task.keyPath = newProps;
            return;
          case REACT_CONSUMER_TYPE:
            props = props.children;
            type = props(type._context._currentValue);
            props = task.keyPath;
            task.keyPath = keyPath;
            renderNodeDestructive(request, task, type, -1);
            task.keyPath = props;
            return;
          case REACT_LAZY_TYPE:
            newProps = type._init;
            type = newProps(type._payload);
            if (12 === request.status) throw null;
            renderElement(request, task, keyPath, type, props, ref);
            return;
        }
      throw Error(
        "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " +
          ((null == type ? type : typeof type) + "."),
      );
    }
  }
  function resumeNode(request, task, segmentId, node, childIndex) {
    var prevReplay = task.replay,
      blockedBoundary = task.blockedBoundary,
      resumedSegment = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
    resumedSegment.id = segmentId;
    resumedSegment.parentFlushed = !0;
    try {
      ((task.replay = null),
        (task.blockedSegment = resumedSegment),
        renderNode(request, task, node, childIndex),
        (resumedSegment.status = 1),
        finishedSegment(request, blockedBoundary, resumedSegment),
        null === blockedBoundary
          ? (request.completedRootSegment = resumedSegment)
          : (queueCompletedSegment(blockedBoundary, resumedSegment),
            blockedBoundary.parentFlushed && request.partialBoundaries.push(blockedBoundary)));
    } finally {
      ((task.replay = prevReplay), (task.blockedSegment = null));
    }
  }
  function renderNodeDestructive(request, task, node, childIndex) {
    null !== task.replay && "number" === typeof task.replay.slots
      ? resumeNode(request, task, task.replay.slots, node, childIndex)
      : ((task.node = node),
        (task.childIndex = childIndex),
        (node = task.componentStack),
        pushComponentStack(task),
        retryNode(request, task),
        (task.componentStack = node));
  }
  function retryNode(request, task) {
    var node = task.node,
      childIndex = task.childIndex;
    if (null !== node) {
      if ("object" === typeof node) {
        switch (node.$$typeof) {
          case REACT_ELEMENT_TYPE:
            var type = node.type,
              key = node.key,
              props = node.props;
            node = props.ref;
            var ref = void 0 !== node ? node : null,
              name = getComponentNameFromType(type),
              keyOrIndex = null == key ? (-1 === childIndex ? 0 : childIndex) : key;
            key = [task.keyPath, name, keyOrIndex];
            if (null !== task.replay)
              a: {
                var replay = task.replay;
                childIndex = replay.nodes;
                for (node = 0; node < childIndex.length; node++) {
                  var node$jscomp$0 = childIndex[node];
                  if (keyOrIndex === node$jscomp$0[1]) {
                    if (4 === node$jscomp$0.length) {
                      if (null !== name && name !== node$jscomp$0[0])
                        throw Error(
                          "Expected the resume to render <" +
                            node$jscomp$0[0] +
                            "> in this slot but instead it rendered <" +
                            name +
                            ">. The tree doesn't match so React will fallback to client rendering.",
                        );
                      var childNodes = node$jscomp$0[2];
                      name = node$jscomp$0[3];
                      keyOrIndex = task.node;
                      task.replay = {
                        nodes: childNodes,
                        slots: name,
                        pendingTasks: 1,
                      };
                      try {
                        renderElement(request, task, key, type, props, ref);
                        if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                          throw Error(
                            "Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.",
                          );
                        task.replay.pendingTasks--;
                      } catch (x) {
                        if (
                          "object" === typeof x &&
                          null !== x &&
                          (x === SuspenseException || "function" === typeof x.then)
                        )
                          throw (
                            task.node === keyOrIndex
                              ? (task.replay = replay)
                              : childIndex.splice(node, 1),
                            x
                          );
                        task.replay.pendingTasks--;
                        props = getThrownInfo(task.componentStack);
                        key = request;
                        request = task.blockedBoundary;
                        type = x;
                        props = logRecoverableError(key, type, props);
                        abortRemainingReplayNodes(key, request, childNodes, name, type, props);
                      }
                      task.replay = replay;
                    } else {
                      if (type !== REACT_SUSPENSE_TYPE)
                        throw Error(
                          "Expected the resume to render <Suspense> in this slot but instead it rendered <" +
                            (getComponentNameFromType(type) || "Unknown") +
                            ">. The tree doesn't match so React will fallback to client rendering.",
                        );
                      b: {
                        replay = void 0;
                        type = node$jscomp$0[5];
                        ref = node$jscomp$0[2];
                        name = node$jscomp$0[3];
                        keyOrIndex = null === node$jscomp$0[4] ? [] : node$jscomp$0[4][2];
                        node$jscomp$0 = null === node$jscomp$0[4] ? null : node$jscomp$0[4][3];
                        var prevKeyPath = task.keyPath,
                          prevContext = task.formatContext,
                          prevRow = task.row,
                          previousReplaySet = task.replay,
                          parentBoundary = task.blockedBoundary,
                          parentHoistableState = task.hoistableState,
                          content = props.children,
                          fallback = props.fallback,
                          fallbackAbortSet = /* @__PURE__ */ new Set();
                        props =
                          2 > task.formatContext.insertionMode
                            ? createSuspenseBoundary(
                                request,
                                task.row,
                                fallbackAbortSet,
                                createPreambleState(),
                                createPreambleState(),
                              )
                            : createSuspenseBoundary(
                                request,
                                task.row,
                                fallbackAbortSet,
                                null,
                                null,
                              );
                        props.parentFlushed = !0;
                        props.rootSegmentID = type;
                        task.blockedBoundary = props;
                        task.hoistableState = props.contentState;
                        task.keyPath = key;
                        task.formatContext = getSuspenseContentFormatContext(
                          request.resumableState,
                          prevContext,
                        );
                        task.row = null;
                        task.replay = {
                          nodes: ref,
                          slots: name,
                          pendingTasks: 1,
                        };
                        try {
                          renderNode(request, task, content, -1);
                          if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                            throw Error(
                              "Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.",
                            );
                          task.replay.pendingTasks--;
                          if (0 === props.pendingTasks && 0 === props.status) {
                            props.status = 1;
                            request.completedBoundaries.push(props);
                            break b;
                          }
                        } catch (error) {
                          ((props.status = 4),
                            (childNodes = getThrownInfo(task.componentStack)),
                            (replay = logRecoverableError(request, error, childNodes)),
                            (props.errorDigest = replay),
                            task.replay.pendingTasks--,
                            request.clientRenderedBoundaries.push(props));
                        } finally {
                          ((task.blockedBoundary = parentBoundary),
                            (task.hoistableState = parentHoistableState),
                            (task.replay = previousReplaySet),
                            (task.keyPath = prevKeyPath),
                            (task.formatContext = prevContext),
                            (task.row = prevRow));
                        }
                        childNodes = createReplayTask(
                          request,
                          null,
                          {
                            nodes: keyOrIndex,
                            slots: node$jscomp$0,
                            pendingTasks: 0,
                          },
                          fallback,
                          -1,
                          parentBoundary,
                          props.fallbackState,
                          fallbackAbortSet,
                          [key[0], "Suspense Fallback", key[2]],
                          getSuspenseFallbackFormatContext(
                            request.resumableState,
                            task.formatContext,
                          ),
                          task.context,
                          task.treeContext,
                          task.row,
                          replaceSuspenseComponentStackWithSuspenseFallbackStack(
                            task.componentStack,
                          ),
                        );
                        pushComponentStack(childNodes);
                        request.pingedTasks.push(childNodes);
                      }
                    }
                    childIndex.splice(node, 1);
                    break a;
                  }
                }
              }
            else renderElement(request, task, key, type, props, ref);
            return;
          case REACT_PORTAL_TYPE:
            throw Error(
              "Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.",
            );
          case REACT_LAZY_TYPE:
            childNodes = node._init;
            node = childNodes(node._payload);
            if (12 === request.status) throw null;
            renderNodeDestructive(request, task, node, childIndex);
            return;
        }
        if (isArrayImpl(node)) {
          renderChildrenArray(request, task, node, childIndex);
          return;
        }
        if ((childNodes = getIteratorFn(node))) {
          if ((childNodes = childNodes.call(node))) {
            node = childNodes.next();
            if (!node.done) {
              props = [];
              do (props.push(node.value), (node = childNodes.next()));
              while (!node.done);
              renderChildrenArray(request, task, props, childIndex);
            }
            return;
          }
        }
        if ("function" === typeof node.then)
          return (
            (task.thenableState = null),
            renderNodeDestructive(request, task, unwrapThenable(node), childIndex)
          );
        if (node.$$typeof === REACT_CONTEXT_TYPE)
          return renderNodeDestructive(request, task, node._currentValue, childIndex);
        childIndex = Object.prototype.toString.call(node);
        throw Error(
          "Objects are not valid as a React child (found: " +
            ("[object Object]" === childIndex
              ? "object with keys {" + Object.keys(node).join(", ") + "}"
              : childIndex) +
            "). If you meant to render a collection of children, use an array instead.",
        );
      }
      if ("string" === typeof node)
        ((childIndex = task.blockedSegment),
          null !== childIndex &&
            (childIndex.lastPushedText = pushTextInstance(
              childIndex.chunks,
              node,
              request.renderState,
              childIndex.lastPushedText,
            )));
      else if ("number" === typeof node || "bigint" === typeof node)
        ((childIndex = task.blockedSegment),
          null !== childIndex &&
            (childIndex.lastPushedText = pushTextInstance(
              childIndex.chunks,
              "" + node,
              request.renderState,
              childIndex.lastPushedText,
            )));
    }
  }
  function renderChildrenArray(request, task, children, childIndex) {
    var prevKeyPath = task.keyPath;
    if (
      -1 !== childIndex &&
      ((task.keyPath = [task.keyPath, "Fragment", childIndex]), null !== task.replay)
    ) {
      for (
        var replay = task.replay, replayNodes = replay.nodes, j = 0;
        j < replayNodes.length;
        j++
      ) {
        var node = replayNodes[j];
        if (node[1] === childIndex) {
          childIndex = node[2];
          node = node[3];
          task.replay = {
            nodes: childIndex,
            slots: node,
            pendingTasks: 1,
          };
          try {
            renderChildrenArray(request, task, children, -1);
            if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
              throw Error(
                "Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.",
              );
            task.replay.pendingTasks--;
          } catch (x) {
            if (
              "object" === typeof x &&
              null !== x &&
              (x === SuspenseException || "function" === typeof x.then)
            )
              throw x;
            task.replay.pendingTasks--;
            children = getThrownInfo(task.componentStack);
            var boundary = task.blockedBoundary,
              error = x;
            children = logRecoverableError(request, error, children);
            abortRemainingReplayNodes(request, boundary, childIndex, node, error, children);
          }
          task.replay = replay;
          replayNodes.splice(j, 1);
          break;
        }
      }
      task.keyPath = prevKeyPath;
      return;
    }
    replay = task.treeContext;
    replayNodes = children.length;
    if (null !== task.replay && ((j = task.replay.slots), null !== j && "object" === typeof j)) {
      for (childIndex = 0; childIndex < replayNodes; childIndex++)
        ((node = children[childIndex]),
          (task.treeContext = pushTreeContext(replay, replayNodes, childIndex)),
          (boundary = j[childIndex]),
          "number" === typeof boundary
            ? (resumeNode(request, task, boundary, node, childIndex), delete j[childIndex])
            : renderNode(request, task, node, childIndex));
      task.treeContext = replay;
      task.keyPath = prevKeyPath;
      return;
    }
    for (j = 0; j < replayNodes; j++)
      ((childIndex = children[j]),
        (task.treeContext = pushTreeContext(replay, replayNodes, j)),
        renderNode(request, task, childIndex, j));
    task.treeContext = replay;
    task.keyPath = prevKeyPath;
  }
  function trackPostponedBoundary(request, trackedPostpones, boundary) {
    boundary.status = 5;
    boundary.rootSegmentID = request.nextSegmentId++;
    request = boundary.trackedContentKeyPath;
    if (null === request)
      throw Error("It should not be possible to postpone at the root. This is a bug in React.");
    var fallbackReplayNode = boundary.trackedFallbackNode,
      children = [],
      boundaryNode = trackedPostpones.workingMap.get(request);
    if (void 0 === boundaryNode)
      return (
        (boundary = [
          request[1],
          request[2],
          children,
          null,
          fallbackReplayNode,
          boundary.rootSegmentID,
        ]),
        trackedPostpones.workingMap.set(request, boundary),
        addToReplayParent(boundary, request[0], trackedPostpones),
        boundary
      );
    boundaryNode[4] = fallbackReplayNode;
    boundaryNode[5] = boundary.rootSegmentID;
    return boundaryNode;
  }
  function trackPostpone(request, trackedPostpones, task, segment) {
    segment.status = 5;
    var keyPath = task.keyPath,
      boundary = task.blockedBoundary;
    if (null === boundary)
      ((segment.id = request.nextSegmentId++),
        (trackedPostpones.rootSlots = segment.id),
        null !== request.completedRootSegment && (request.completedRootSegment.status = 5));
    else {
      if (null !== boundary && 0 === boundary.status) {
        var boundaryNode = trackPostponedBoundary(request, trackedPostpones, boundary);
        if (boundary.trackedContentKeyPath === keyPath && -1 === task.childIndex) {
          -1 === segment.id &&
            (segment.id = segment.parentFlushed ? boundary.rootSegmentID : request.nextSegmentId++);
          boundaryNode[3] = segment.id;
          return;
        }
      }
      -1 === segment.id &&
        (segment.id =
          segment.parentFlushed && null !== boundary
            ? boundary.rootSegmentID
            : request.nextSegmentId++);
      if (-1 === task.childIndex)
        null === keyPath
          ? (trackedPostpones.rootSlots = segment.id)
          : ((task = trackedPostpones.workingMap.get(keyPath)),
            void 0 === task
              ? ((task = [keyPath[1], keyPath[2], [], segment.id]),
                addToReplayParent(task, keyPath[0], trackedPostpones))
              : (task[3] = segment.id));
      else {
        if (null === keyPath) {
          if (((request = trackedPostpones.rootSlots), null === request))
            request = trackedPostpones.rootSlots = {};
          else if ("number" === typeof request)
            throw Error(
              "It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.",
            );
        } else if (
          ((boundary = trackedPostpones.workingMap),
          (boundaryNode = boundary.get(keyPath)),
          void 0 === boundaryNode)
        )
          ((request = {}),
            (boundaryNode = [keyPath[1], keyPath[2], [], request]),
            boundary.set(keyPath, boundaryNode),
            addToReplayParent(boundaryNode, keyPath[0], trackedPostpones));
        else if (((request = boundaryNode[3]), null === request)) request = boundaryNode[3] = {};
        else if ("number" === typeof request)
          throw Error(
            "It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.",
          );
        request[task.childIndex] = segment.id;
      }
    }
  }
  function untrackBoundary(request, boundary) {
    request = request.trackedPostpones;
    null !== request &&
      ((boundary = boundary.trackedContentKeyPath),
      null !== boundary &&
        ((boundary = request.workingMap.get(boundary)),
        void 0 !== boundary && ((boundary.length = 4), (boundary[2] = []), (boundary[3] = null))));
  }
  function spawnNewSuspendedReplayTask(request, task, thenableState) {
    return createReplayTask(
      request,
      thenableState,
      task.replay,
      task.node,
      task.childIndex,
      task.blockedBoundary,
      task.hoistableState,
      task.abortSet,
      task.keyPath,
      task.formatContext,
      task.context,
      task.treeContext,
      task.row,
      task.componentStack,
    );
  }
  function spawnNewSuspendedRenderTask(request, task, thenableState) {
    var segment = task.blockedSegment,
      newSegment = createPendingSegment(
        request,
        segment.chunks.length,
        null,
        task.formatContext,
        segment.lastPushedText,
        !0,
      );
    segment.children.push(newSegment);
    segment.lastPushedText = !1;
    return createRenderTask(
      request,
      thenableState,
      task.node,
      task.childIndex,
      task.blockedBoundary,
      newSegment,
      task.blockedPreamble,
      task.hoistableState,
      task.abortSet,
      task.keyPath,
      task.formatContext,
      task.context,
      task.treeContext,
      task.row,
      task.componentStack,
    );
  }
  function renderNode(request, task, node, childIndex) {
    var previousFormatContext = task.formatContext,
      previousContext = task.context,
      previousKeyPath = task.keyPath,
      previousTreeContext = task.treeContext,
      previousComponentStack = task.componentStack,
      segment = task.blockedSegment;
    if (null === segment) {
      segment = task.replay;
      try {
        return renderNodeDestructive(request, task, node, childIndex);
      } catch (thrownValue) {
        if (
          (resetHooksState(),
          (node = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue),
          12 !== request.status && "object" === typeof node && null !== node)
        ) {
          if ("function" === typeof node.then) {
            childIndex =
              thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
            request = spawnNewSuspendedReplayTask(request, task, childIndex).ping;
            node.then(request, request);
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            task.replay = segment;
            switchContext(previousContext);
            return;
          }
          if ("Maximum call stack size exceeded" === node.message) {
            node = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
            node = spawnNewSuspendedReplayTask(request, task, node);
            request.pingedTasks.push(node);
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            task.replay = segment;
            switchContext(previousContext);
            return;
          }
        }
      }
    } else {
      var childrenLength = segment.children.length,
        chunkLength = segment.chunks.length;
      try {
        return renderNodeDestructive(request, task, node, childIndex);
      } catch (thrownValue$63) {
        if (
          (resetHooksState(),
          (segment.children.length = childrenLength),
          (segment.chunks.length = chunkLength),
          (node = thrownValue$63 === SuspenseException ? getSuspendedThenable() : thrownValue$63),
          12 !== request.status && "object" === typeof node && null !== node)
        ) {
          if ("function" === typeof node.then) {
            segment = node;
            node = thrownValue$63 === SuspenseException ? getThenableStateAfterSuspending() : null;
            request = spawnNewSuspendedRenderTask(request, task, node).ping;
            segment.then(request, request);
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            switchContext(previousContext);
            return;
          }
          if ("Maximum call stack size exceeded" === node.message) {
            segment =
              thrownValue$63 === SuspenseException ? getThenableStateAfterSuspending() : null;
            segment = spawnNewSuspendedRenderTask(request, task, segment);
            request.pingedTasks.push(segment);
            task.formatContext = previousFormatContext;
            task.context = previousContext;
            task.keyPath = previousKeyPath;
            task.treeContext = previousTreeContext;
            task.componentStack = previousComponentStack;
            switchContext(previousContext);
            return;
          }
        }
      }
    }
    task.formatContext = previousFormatContext;
    task.context = previousContext;
    task.keyPath = previousKeyPath;
    task.treeContext = previousTreeContext;
    switchContext(previousContext);
    throw node;
  }
  function abortTaskSoft(task) {
    var boundary = task.blockedBoundary,
      segment = task.blockedSegment;
    null !== segment && ((segment.status = 3), finishedTask(this, boundary, task.row, segment));
  }
  function abortRemainingReplayNodes(
    request$jscomp$0,
    boundary,
    nodes,
    slots,
    error,
    errorDigest$jscomp$0,
  ) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (4 === node.length)
        abortRemainingReplayNodes(
          request$jscomp$0,
          boundary,
          node[2],
          node[3],
          error,
          errorDigest$jscomp$0,
        );
      else {
        node = node[5];
        var request = request$jscomp$0,
          errorDigest = errorDigest$jscomp$0,
          resumedBoundary = createSuspenseBoundary(
            request,
            null,
            /* @__PURE__ */ new Set(),
            null,
            null,
          );
        resumedBoundary.parentFlushed = !0;
        resumedBoundary.rootSegmentID = node;
        resumedBoundary.status = 4;
        resumedBoundary.errorDigest = errorDigest;
        resumedBoundary.parentFlushed && request.clientRenderedBoundaries.push(resumedBoundary);
      }
    }
    nodes.length = 0;
    if (null !== slots) {
      if (null === boundary)
        throw Error("We should not have any resumable nodes in the shell. This is a bug in React.");
      4 !== boundary.status &&
        ((boundary.status = 4),
        (boundary.errorDigest = errorDigest$jscomp$0),
        boundary.parentFlushed && request$jscomp$0.clientRenderedBoundaries.push(boundary));
      if ("object" === typeof slots) for (var index in slots) delete slots[index];
    }
  }
  function abortTask(task, request, error) {
    var boundary = task.blockedBoundary,
      segment = task.blockedSegment;
    if (null !== segment) {
      if (6 === segment.status) return;
      segment.status = 3;
    }
    var errorInfo = getThrownInfo(task.componentStack);
    if (null === boundary) {
      if (13 !== request.status && 14 !== request.status) {
        boundary = task.replay;
        if (null === boundary) {
          null !== request.trackedPostpones && null !== segment
            ? ((boundary = request.trackedPostpones),
              logRecoverableError(request, error, errorInfo),
              trackPostpone(request, boundary, task, segment),
              finishedTask(request, null, task.row, segment))
            : (logRecoverableError(request, error, errorInfo), fatalError(request, error));
          return;
        }
        boundary.pendingTasks--;
        0 === boundary.pendingTasks &&
          0 < boundary.nodes.length &&
          ((segment = logRecoverableError(request, error, errorInfo)),
          abortRemainingReplayNodes(request, null, boundary.nodes, boundary.slots, error, segment));
        request.pendingRootTasks--;
        0 === request.pendingRootTasks && completeShell(request);
      }
    } else {
      var trackedPostpones$64 = request.trackedPostpones;
      if (4 !== boundary.status) {
        if (null !== trackedPostpones$64 && null !== segment)
          return (
            logRecoverableError(request, error, errorInfo),
            trackPostpone(request, trackedPostpones$64, task, segment),
            boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
              return abortTask(fallbackTask, request, error);
            }),
            boundary.fallbackAbortableTasks.clear(),
            finishedTask(request, boundary, task.row, segment)
          );
        boundary.status = 4;
        segment = logRecoverableError(request, error, errorInfo);
        boundary.status = 4;
        boundary.errorDigest = segment;
        untrackBoundary(request, boundary);
        boundary.parentFlushed && request.clientRenderedBoundaries.push(boundary);
      }
      boundary.pendingTasks--;
      segment = boundary.row;
      null !== segment && 0 === --segment.pendingTasks && finishSuspenseListRow(request, segment);
      boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
        return abortTask(fallbackTask, request, error);
      });
      boundary.fallbackAbortableTasks.clear();
    }
    task = task.row;
    null !== task && 0 === --task.pendingTasks && finishSuspenseListRow(request, task);
    request.allPendingTasks--;
    0 === request.allPendingTasks && completeAll(request);
  }
  function safelyEmitEarlyPreloads(request, shellComplete) {
    try {
      var renderState = request.renderState,
        onHeaders = renderState.onHeaders;
      if (onHeaders) {
        var headers = renderState.headers;
        if (headers) {
          renderState.headers = null;
          var linkHeader = headers.preconnects;
          headers.fontPreloads &&
            (linkHeader && (linkHeader += ", "), (linkHeader += headers.fontPreloads));
          headers.highImagePreloads &&
            (linkHeader && (linkHeader += ", "), (linkHeader += headers.highImagePreloads));
          if (!shellComplete) {
            var queueIter = renderState.styles.values(),
              queueStep = queueIter.next();
            b: for (
              ;
              0 < headers.remainingCapacity && !queueStep.done;
              queueStep = queueIter.next()
            )
              for (
                var sheetIter = queueStep.value.sheets.values(), sheetStep = sheetIter.next();
                0 < headers.remainingCapacity && !sheetStep.done;
                sheetStep = sheetIter.next()
              ) {
                var sheet = sheetStep.value,
                  props = sheet.props,
                  key = props.href,
                  props$jscomp$0 = sheet.props,
                  header = getPreloadAsHeader(props$jscomp$0.href, "style", {
                    crossOrigin: props$jscomp$0.crossOrigin,
                    integrity: props$jscomp$0.integrity,
                    nonce: props$jscomp$0.nonce,
                    type: props$jscomp$0.type,
                    fetchPriority: props$jscomp$0.fetchPriority,
                    referrerPolicy: props$jscomp$0.referrerPolicy,
                    media: props$jscomp$0.media,
                  });
                if (0 <= (headers.remainingCapacity -= header.length + 2))
                  ((renderState.resets.style[key] = PRELOAD_NO_CREDS),
                    linkHeader && (linkHeader += ", "),
                    (linkHeader += header),
                    (renderState.resets.style[key] =
                      "string" === typeof props.crossOrigin || "string" === typeof props.integrity
                        ? [props.crossOrigin, props.integrity]
                        : PRELOAD_NO_CREDS));
                else break b;
              }
          }
          linkHeader ? onHeaders({ Link: linkHeader }) : onHeaders({});
        }
      }
    } catch (error) {
      logRecoverableError(request, error, {});
    }
  }
  function completeShell(request) {
    null === request.trackedPostpones && safelyEmitEarlyPreloads(request, !0);
    null === request.trackedPostpones && preparePreamble(request);
    request.onShellError = noop;
    request = request.onShellReady;
    request();
  }
  function completeAll(request) {
    safelyEmitEarlyPreloads(
      request,
      null === request.trackedPostpones
        ? !0
        : null === request.completedRootSegment || 5 !== request.completedRootSegment.status,
    );
    preparePreamble(request);
    request = request.onAllReady;
    request();
  }
  function queueCompletedSegment(boundary, segment) {
    if (
      0 === segment.chunks.length &&
      1 === segment.children.length &&
      null === segment.children[0].boundary &&
      -1 === segment.children[0].id
    ) {
      var childSegment = segment.children[0];
      childSegment.id = segment.id;
      childSegment.parentFlushed = !0;
      (1 !== childSegment.status && 3 !== childSegment.status && 4 !== childSegment.status) ||
        queueCompletedSegment(boundary, childSegment);
    } else boundary.completedSegments.push(segment);
  }
  function finishedSegment(request, boundary, segment) {
    if (null !== byteLengthOfChunk) {
      segment = segment.chunks;
      for (var segmentByteSize = 0, i = 0; i < segment.length; i++)
        segmentByteSize += segment[i].byteLength;
      null === boundary
        ? (request.byteSize += segmentByteSize)
        : (boundary.byteSize += segmentByteSize);
    }
  }
  function finishedTask(request, boundary, row, segment) {
    null !== row &&
      (0 === --row.pendingTasks
        ? finishSuspenseListRow(request, row)
        : row.together && tryToResolveTogetherRow(request, row));
    request.allPendingTasks--;
    if (null === boundary) {
      if (null !== segment && segment.parentFlushed) {
        if (null !== request.completedRootSegment)
          throw Error("There can only be one root segment. This is a bug in React.");
        request.completedRootSegment = segment;
      }
      request.pendingRootTasks--;
      0 === request.pendingRootTasks && completeShell(request);
    } else if ((boundary.pendingTasks--, 4 !== boundary.status))
      if (0 === boundary.pendingTasks) {
        if (
          (0 === boundary.status && (boundary.status = 1),
          null !== segment &&
            segment.parentFlushed &&
            (1 === segment.status || 3 === segment.status) &&
            queueCompletedSegment(boundary, segment),
          boundary.parentFlushed && request.completedBoundaries.push(boundary),
          1 === boundary.status)
        )
          ((row = boundary.row),
            null !== row && hoistHoistables(row.hoistables, boundary.contentState),
            isEligibleForOutlining(request, boundary) ||
              (boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request),
              boundary.fallbackAbortableTasks.clear(),
              null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row)),
            0 === request.pendingRootTasks &&
              null === request.trackedPostpones &&
              null !== boundary.contentPreamble &&
              preparePreamble(request));
        else if (5 === boundary.status && ((boundary = boundary.row), null !== boundary)) {
          if (null !== request.trackedPostpones) {
            row = request.trackedPostpones;
            var postponedRow = boundary.next;
            if (null !== postponedRow && ((segment = postponedRow.boundaries), null !== segment))
              for (
                postponedRow.boundaries = null, postponedRow = 0;
                postponedRow < segment.length;
                postponedRow++
              ) {
                var postponedBoundary = segment[postponedRow];
                trackPostponedBoundary(request, row, postponedBoundary);
                finishedTask(request, postponedBoundary, null, null);
              }
          }
          0 === --boundary.pendingTasks && finishSuspenseListRow(request, boundary);
        }
      } else
        (null === segment ||
          !segment.parentFlushed ||
          (1 !== segment.status && 3 !== segment.status) ||
          (queueCompletedSegment(boundary, segment),
          1 === boundary.completedSegments.length &&
            boundary.parentFlushed &&
            request.partialBoundaries.push(boundary)),
          (boundary = boundary.row),
          null !== boundary && boundary.together && tryToResolveTogetherRow(request, boundary));
    0 === request.allPendingTasks && completeAll(request);
  }
  function performWork(request$jscomp$2) {
    if (14 !== request$jscomp$2.status && 13 !== request$jscomp$2.status) {
      var prevContext = currentActiveSnapshot,
        prevDispatcher = ReactSharedInternals.H;
      ReactSharedInternals.H = HooksDispatcher;
      var prevAsyncDispatcher = ReactSharedInternals.A;
      ReactSharedInternals.A = DefaultAsyncDispatcher;
      var prevRequest = currentRequest;
      currentRequest = request$jscomp$2;
      var prevResumableState = currentResumableState;
      currentResumableState = request$jscomp$2.resumableState;
      try {
        var pingedTasks = request$jscomp$2.pingedTasks,
          i;
        for (i = 0; i < pingedTasks.length; i++) {
          var task = pingedTasks[i],
            request = request$jscomp$2,
            segment = task.blockedSegment;
          if (null === segment) {
            var request$jscomp$0 = request;
            if (0 !== task.replay.pendingTasks) {
              switchContext(task.context);
              try {
                "number" === typeof task.replay.slots
                  ? resumeNode(
                      request$jscomp$0,
                      task,
                      task.replay.slots,
                      task.node,
                      task.childIndex,
                    )
                  : retryNode(request$jscomp$0, task);
                if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                  throw Error(
                    "Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.",
                  );
                task.replay.pendingTasks--;
                task.abortSet.delete(task);
                finishedTask(request$jscomp$0, task.blockedBoundary, task.row, null);
              } catch (thrownValue) {
                resetHooksState();
                var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
                if ("object" === typeof x && null !== x && "function" === typeof x.then) {
                  var ping = task.ping;
                  x.then(ping, ping);
                  task.thenableState =
                    thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                } else {
                  task.replay.pendingTasks--;
                  task.abortSet.delete(task);
                  var errorInfo = getThrownInfo(task.componentStack);
                  request = void 0;
                  var request$jscomp$1 = request$jscomp$0,
                    boundary = task.blockedBoundary,
                    error$jscomp$0 =
                      12 === request$jscomp$0.status ? request$jscomp$0.fatalError : x,
                    replayNodes = task.replay.nodes,
                    resumeSlots = task.replay.slots;
                  request = logRecoverableError(request$jscomp$1, error$jscomp$0, errorInfo);
                  abortRemainingReplayNodes(
                    request$jscomp$1,
                    boundary,
                    replayNodes,
                    resumeSlots,
                    error$jscomp$0,
                    request,
                  );
                  request$jscomp$0.pendingRootTasks--;
                  0 === request$jscomp$0.pendingRootTasks && completeShell(request$jscomp$0);
                  request$jscomp$0.allPendingTasks--;
                  0 === request$jscomp$0.allPendingTasks && completeAll(request$jscomp$0);
                }
              }
            }
          } else if (
            ((request$jscomp$0 = void 0),
            (request$jscomp$1 = segment),
            0 === request$jscomp$1.status)
          ) {
            request$jscomp$1.status = 6;
            switchContext(task.context);
            var childrenLength = request$jscomp$1.children.length,
              chunkLength = request$jscomp$1.chunks.length;
            try {
              (retryNode(request, task),
                request$jscomp$1.lastPushedText &&
                  request$jscomp$1.textEmbedded &&
                  request$jscomp$1.chunks.push(textSeparator),
                task.abortSet.delete(task),
                (request$jscomp$1.status = 1),
                finishedSegment(request, task.blockedBoundary, request$jscomp$1),
                finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1));
            } catch (thrownValue) {
              resetHooksState();
              request$jscomp$1.children.length = childrenLength;
              request$jscomp$1.chunks.length = chunkLength;
              var x$jscomp$0 =
                thrownValue === SuspenseException
                  ? getSuspendedThenable()
                  : 12 === request.status
                    ? request.fatalError
                    : thrownValue;
              if (12 === request.status && null !== request.trackedPostpones) {
                var trackedPostpones = request.trackedPostpones,
                  thrownInfo = getThrownInfo(task.componentStack);
                task.abortSet.delete(task);
                logRecoverableError(request, x$jscomp$0, thrownInfo);
                trackPostpone(request, trackedPostpones, task, request$jscomp$1);
                finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1);
              } else if (
                "object" === typeof x$jscomp$0 &&
                null !== x$jscomp$0 &&
                "function" === typeof x$jscomp$0.then
              ) {
                request$jscomp$1.status = 0;
                task.thenableState =
                  thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                var ping$jscomp$0 = task.ping;
                x$jscomp$0.then(ping$jscomp$0, ping$jscomp$0);
              } else {
                var errorInfo$jscomp$0 = getThrownInfo(task.componentStack);
                task.abortSet.delete(task);
                request$jscomp$1.status = 4;
                var boundary$jscomp$0 = task.blockedBoundary,
                  row = task.row;
                null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
                request.allPendingTasks--;
                request$jscomp$0 = logRecoverableError(request, x$jscomp$0, errorInfo$jscomp$0);
                if (null === boundary$jscomp$0) fatalError(request, x$jscomp$0);
                else if ((boundary$jscomp$0.pendingTasks--, 4 !== boundary$jscomp$0.status)) {
                  boundary$jscomp$0.status = 4;
                  boundary$jscomp$0.errorDigest = request$jscomp$0;
                  untrackBoundary(request, boundary$jscomp$0);
                  var boundaryRow = boundary$jscomp$0.row;
                  null !== boundaryRow &&
                    0 === --boundaryRow.pendingTasks &&
                    finishSuspenseListRow(request, boundaryRow);
                  boundary$jscomp$0.parentFlushed &&
                    request.clientRenderedBoundaries.push(boundary$jscomp$0);
                  0 === request.pendingRootTasks &&
                    null === request.trackedPostpones &&
                    null !== boundary$jscomp$0.contentPreamble &&
                    preparePreamble(request);
                }
                0 === request.allPendingTasks && completeAll(request);
              }
            }
          }
        }
        pingedTasks.splice(0, i);
        null !== request$jscomp$2.destination &&
          flushCompletedQueues(request$jscomp$2, request$jscomp$2.destination);
      } catch (error) {
        (logRecoverableError(request$jscomp$2, error, {}), fatalError(request$jscomp$2, error));
      } finally {
        ((currentResumableState = prevResumableState),
          (ReactSharedInternals.H = prevDispatcher),
          (ReactSharedInternals.A = prevAsyncDispatcher),
          prevDispatcher === HooksDispatcher && switchContext(prevContext),
          (currentRequest = prevRequest));
      }
    }
  }
  function preparePreambleFromSubtree(request, segment, collectedPreambleSegments) {
    segment.preambleChildren.length && collectedPreambleSegments.push(segment.preambleChildren);
    for (var pendingPreambles = !1, i = 0; i < segment.children.length; i++)
      pendingPreambles =
        preparePreambleFromSegment(request, segment.children[i], collectedPreambleSegments) ||
        pendingPreambles;
    return pendingPreambles;
  }
  function preparePreambleFromSegment(request, segment, collectedPreambleSegments) {
    var boundary = segment.boundary;
    if (null === boundary)
      return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
    var preamble = boundary.contentPreamble,
      fallbackPreamble = boundary.fallbackPreamble;
    if (null === preamble || null === fallbackPreamble) return !1;
    switch (boundary.status) {
      case 1:
        hoistPreambleState(request.renderState, preamble);
        request.byteSize += boundary.byteSize;
        segment = boundary.completedSegments[0];
        if (!segment)
          throw Error(
            "A previously unvisited boundary must have exactly one root segment. This is a bug in React.",
          );
        return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
      case 5:
        if (null !== request.trackedPostpones) return !0;
      case 4:
        if (1 === segment.status)
          return (
            hoistPreambleState(request.renderState, fallbackPreamble),
            preparePreambleFromSubtree(request, segment, collectedPreambleSegments)
          );
      default:
        return !0;
    }
  }
  function preparePreamble(request) {
    if (request.completedRootSegment && null === request.completedPreambleSegments) {
      var collectedPreambleSegments = [],
        originalRequestByteSize = request.byteSize,
        hasPendingPreambles = preparePreambleFromSegment(
          request,
          request.completedRootSegment,
          collectedPreambleSegments,
        ),
        preamble = request.renderState.preamble;
      !1 === hasPendingPreambles || (preamble.headChunks && preamble.bodyChunks)
        ? (request.completedPreambleSegments = collectedPreambleSegments)
        : (request.byteSize = originalRequestByteSize);
    }
  }
  function flushSubtree(request, destination, segment, hoistableState) {
    segment.parentFlushed = !0;
    switch (segment.status) {
      case 0:
        segment.id = request.nextSegmentId++;
      case 5:
        return (
          (hoistableState = segment.id),
          (segment.lastPushedText = !1),
          (segment.textEmbedded = !1),
          (request = request.renderState),
          writeChunk(destination, placeholder1),
          writeChunk(destination, request.placeholderPrefix),
          (request = stringToChunk(hoistableState.toString(16))),
          writeChunk(destination, request),
          writeChunkAndReturn(destination, placeholder2)
        );
      case 1:
        segment.status = 2;
        var r = !0,
          chunks = segment.chunks,
          chunkIdx = 0;
        segment = segment.children;
        for (var childIdx = 0; childIdx < segment.length; childIdx++) {
          for (r = segment[childIdx]; chunkIdx < r.index; chunkIdx++)
            writeChunk(destination, chunks[chunkIdx]);
          r = flushSegment(request, destination, r, hoistableState);
        }
        for (; chunkIdx < chunks.length - 1; chunkIdx++) writeChunk(destination, chunks[chunkIdx]);
        chunkIdx < chunks.length && (r = writeChunkAndReturn(destination, chunks[chunkIdx]));
        return r;
      case 3:
        return !0;
      default:
        throw Error(
          "Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.",
        );
    }
  }
  var flushedByteSize = 0;
  function flushSegment(request, destination, segment, hoistableState) {
    var boundary = segment.boundary;
    if (null === boundary) return flushSubtree(request, destination, segment, hoistableState);
    boundary.parentFlushed = !0;
    if (4 === boundary.status) {
      var row = boundary.row;
      null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
      boundary = boundary.errorDigest;
      writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
      writeChunk(destination, clientRenderedSuspenseBoundaryError1);
      boundary &&
        (writeChunk(destination, clientRenderedSuspenseBoundaryError1A),
        writeChunk(destination, stringToChunk(escapeTextForBrowser(boundary))),
        writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial));
      writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
      flushSubtree(request, destination, segment, hoistableState);
    } else if (1 !== boundary.status)
      (0 === boundary.status && (boundary.rootSegmentID = request.nextSegmentId++),
        0 < boundary.completedSegments.length && request.partialBoundaries.push(boundary),
        writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID),
        hoistableState && hoistHoistables(hoistableState, boundary.fallbackState),
        flushSubtree(request, destination, segment, hoistableState));
    else if (
      !flushingPartialBoundaries &&
      isEligibleForOutlining(request, boundary) &&
      (flushedByteSize + boundary.byteSize > request.progressiveChunkSize ||
        hasSuspenseyContent(boundary.contentState))
    )
      ((boundary.rootSegmentID = request.nextSegmentId++),
        request.completedBoundaries.push(boundary),
        writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID),
        flushSubtree(request, destination, segment, hoistableState));
    else {
      flushedByteSize += boundary.byteSize;
      hoistableState && hoistHoistables(hoistableState, boundary.contentState);
      segment = boundary.row;
      null !== segment &&
        isEligibleForOutlining(request, boundary) &&
        0 === --segment.pendingTasks &&
        finishSuspenseListRow(request, segment);
      writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
      segment = boundary.completedSegments;
      if (1 !== segment.length)
        throw Error(
          "A previously unvisited boundary must have exactly one root segment. This is a bug in React.",
        );
      flushSegment(request, destination, segment[0], hoistableState);
    }
    return writeChunkAndReturn(destination, endSuspenseBoundary);
  }
  function flushSegmentContainer(request, destination, segment, hoistableState) {
    writeStartSegment(destination, request.renderState, segment.parentFormatContext, segment.id);
    flushSegment(request, destination, segment, hoistableState);
    return writeEndSegment(destination, segment.parentFormatContext);
  }
  function flushCompletedBoundary(request, destination, boundary) {
    flushedByteSize = boundary.byteSize;
    for (
      var completedSegments = boundary.completedSegments, i = 0;
      i < completedSegments.length;
      i++
    )
      flushPartiallyCompletedSegment(request, destination, boundary, completedSegments[i]);
    completedSegments.length = 0;
    completedSegments = boundary.row;
    null !== completedSegments &&
      isEligibleForOutlining(request, boundary) &&
      0 === --completedSegments.pendingTasks &&
      finishSuspenseListRow(request, completedSegments);
    writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
    completedSegments = request.resumableState;
    request = request.renderState;
    i = boundary.rootSegmentID;
    boundary = boundary.contentState;
    var requiresStyleInsertion = request.stylesToHoist;
    request.stylesToHoist = !1;
    writeChunk(destination, request.startInlineScript);
    writeChunk(destination, endOfStartTag);
    requiresStyleInsertion
      ? (0 === (completedSegments.instructions & 4) &&
          ((completedSegments.instructions |= 4),
          writeChunk(destination, clientRenderScriptFunctionOnly)),
        0 === (completedSegments.instructions & 2) &&
          ((completedSegments.instructions |= 2),
          writeChunk(destination, completeBoundaryScriptFunctionOnly)),
        0 === (completedSegments.instructions & 8)
          ? ((completedSegments.instructions |= 8),
            writeChunk(destination, completeBoundaryWithStylesScript1FullPartial))
          : writeChunk(destination, completeBoundaryWithStylesScript1Partial))
      : (0 === (completedSegments.instructions & 2) &&
          ((completedSegments.instructions |= 2),
          writeChunk(destination, completeBoundaryScriptFunctionOnly)),
        writeChunk(destination, completeBoundaryScript1Partial));
    completedSegments = stringToChunk(i.toString(16));
    writeChunk(destination, request.boundaryPrefix);
    writeChunk(destination, completedSegments);
    writeChunk(destination, completeBoundaryScript2);
    writeChunk(destination, request.segmentPrefix);
    writeChunk(destination, completedSegments);
    requiresStyleInsertion
      ? (writeChunk(destination, completeBoundaryScript3a),
        writeStyleResourceDependenciesInJS(destination, boundary))
      : writeChunk(destination, completeBoundaryScript3b);
    boundary = writeChunkAndReturn(destination, completeBoundaryScriptEnd);
    return writeBootstrap(destination, request) && boundary;
  }
  function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
    if (2 === segment.status) return !0;
    var hoistableState = boundary.contentState,
      segmentID = segment.id;
    if (-1 === segmentID) {
      if (-1 === (segment.id = boundary.rootSegmentID))
        throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
      return flushSegmentContainer(request, destination, segment, hoistableState);
    }
    if (segmentID === boundary.rootSegmentID)
      return flushSegmentContainer(request, destination, segment, hoistableState);
    flushSegmentContainer(request, destination, segment, hoistableState);
    boundary = request.resumableState;
    request = request.renderState;
    writeChunk(destination, request.startInlineScript);
    writeChunk(destination, endOfStartTag);
    0 === (boundary.instructions & 1)
      ? ((boundary.instructions |= 1), writeChunk(destination, completeSegmentScript1Full))
      : writeChunk(destination, completeSegmentScript1Partial);
    writeChunk(destination, request.segmentPrefix);
    segmentID = stringToChunk(segmentID.toString(16));
    writeChunk(destination, segmentID);
    writeChunk(destination, completeSegmentScript2);
    writeChunk(destination, request.placeholderPrefix);
    writeChunk(destination, segmentID);
    destination = writeChunkAndReturn(destination, completeSegmentScriptEnd);
    return destination;
  }
  var flushingPartialBoundaries = !1;
  function flushCompletedQueues(request, destination) {
    currentView = new Uint8Array(2048);
    writtenBytes = 0;
    try {
      if (!(0 < request.pendingRootTasks)) {
        var i,
          completedRootSegment = request.completedRootSegment;
        if (null !== completedRootSegment) {
          if (5 === completedRootSegment.status) return;
          var completedPreambleSegments = request.completedPreambleSegments;
          if (null === completedPreambleSegments) return;
          flushedByteSize = request.byteSize;
          var resumableState = request.resumableState,
            renderState = request.renderState,
            preamble = renderState.preamble,
            htmlChunks = preamble.htmlChunks,
            headChunks = preamble.headChunks,
            i$jscomp$0;
          if (htmlChunks) {
            for (i$jscomp$0 = 0; i$jscomp$0 < htmlChunks.length; i$jscomp$0++)
              writeChunk(destination, htmlChunks[i$jscomp$0]);
            if (headChunks)
              for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
                writeChunk(destination, headChunks[i$jscomp$0]);
            else
              (writeChunk(destination, startChunkForTag("head")),
                writeChunk(destination, endOfStartTag));
          } else if (headChunks)
            for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
              writeChunk(destination, headChunks[i$jscomp$0]);
          var charsetChunks = renderState.charsetChunks;
          for (i$jscomp$0 = 0; i$jscomp$0 < charsetChunks.length; i$jscomp$0++)
            writeChunk(destination, charsetChunks[i$jscomp$0]);
          charsetChunks.length = 0;
          renderState.preconnects.forEach(flushResource, destination);
          renderState.preconnects.clear();
          var viewportChunks = renderState.viewportChunks;
          for (i$jscomp$0 = 0; i$jscomp$0 < viewportChunks.length; i$jscomp$0++)
            writeChunk(destination, viewportChunks[i$jscomp$0]);
          viewportChunks.length = 0;
          renderState.fontPreloads.forEach(flushResource, destination);
          renderState.fontPreloads.clear();
          renderState.highImagePreloads.forEach(flushResource, destination);
          renderState.highImagePreloads.clear();
          currentlyFlushingRenderState = renderState;
          renderState.styles.forEach(flushStylesInPreamble, destination);
          currentlyFlushingRenderState = null;
          var importMapChunks = renderState.importMapChunks;
          for (i$jscomp$0 = 0; i$jscomp$0 < importMapChunks.length; i$jscomp$0++)
            writeChunk(destination, importMapChunks[i$jscomp$0]);
          importMapChunks.length = 0;
          renderState.bootstrapScripts.forEach(flushResource, destination);
          renderState.scripts.forEach(flushResource, destination);
          renderState.scripts.clear();
          renderState.bulkPreloads.forEach(flushResource, destination);
          renderState.bulkPreloads.clear();
          htmlChunks || headChunks || (resumableState.instructions |= 32);
          var hoistableChunks = renderState.hoistableChunks;
          for (i$jscomp$0 = 0; i$jscomp$0 < hoistableChunks.length; i$jscomp$0++)
            writeChunk(destination, hoistableChunks[i$jscomp$0]);
          for (
            resumableState = hoistableChunks.length = 0;
            resumableState < completedPreambleSegments.length;
            resumableState++
          ) {
            var segments = completedPreambleSegments[resumableState];
            for (renderState = 0; renderState < segments.length; renderState++)
              flushSegment(request, destination, segments[renderState], null);
          }
          var preamble$jscomp$0 = request.renderState.preamble,
            headChunks$jscomp$0 = preamble$jscomp$0.headChunks;
          (preamble$jscomp$0.htmlChunks || headChunks$jscomp$0) &&
            writeChunk(destination, endChunkForTag("head"));
          var bodyChunks = preamble$jscomp$0.bodyChunks;
          if (bodyChunks)
            for (
              completedPreambleSegments = 0;
              completedPreambleSegments < bodyChunks.length;
              completedPreambleSegments++
            )
              writeChunk(destination, bodyChunks[completedPreambleSegments]);
          flushSegment(request, destination, completedRootSegment, null);
          request.completedRootSegment = null;
          var renderState$jscomp$0 = request.renderState;
          if (
            0 !== request.allPendingTasks ||
            0 !== request.clientRenderedBoundaries.length ||
            0 !== request.completedBoundaries.length ||
            (null !== request.trackedPostpones &&
              (0 !== request.trackedPostpones.rootNodes.length ||
                null !== request.trackedPostpones.rootSlots))
          ) {
            var resumableState$jscomp$0 = request.resumableState;
            if (0 === (resumableState$jscomp$0.instructions & 64)) {
              resumableState$jscomp$0.instructions |= 64;
              writeChunk(destination, renderState$jscomp$0.startInlineScript);
              if (0 === (resumableState$jscomp$0.instructions & 32)) {
                resumableState$jscomp$0.instructions |= 32;
                var shellId = "_" + resumableState$jscomp$0.idPrefix + "R_";
                writeChunk(destination, completedShellIdAttributeStart);
                writeChunk(destination, stringToChunk(escapeTextForBrowser(shellId)));
                writeChunk(destination, attributeEnd);
              }
              writeChunk(destination, endOfStartTag);
              writeChunk(destination, shellTimeRuntimeScript);
              writeChunkAndReturn(destination, endInlineScript);
            }
          }
          writeBootstrap(destination, renderState$jscomp$0);
        }
        var renderState$jscomp$1 = request.renderState;
        completedRootSegment = 0;
        var viewportChunks$jscomp$0 = renderState$jscomp$1.viewportChunks;
        for (
          completedRootSegment = 0;
          completedRootSegment < viewportChunks$jscomp$0.length;
          completedRootSegment++
        )
          writeChunk(destination, viewportChunks$jscomp$0[completedRootSegment]);
        viewportChunks$jscomp$0.length = 0;
        renderState$jscomp$1.preconnects.forEach(flushResource, destination);
        renderState$jscomp$1.preconnects.clear();
        renderState$jscomp$1.fontPreloads.forEach(flushResource, destination);
        renderState$jscomp$1.fontPreloads.clear();
        renderState$jscomp$1.highImagePreloads.forEach(flushResource, destination);
        renderState$jscomp$1.highImagePreloads.clear();
        renderState$jscomp$1.styles.forEach(preloadLateStyles, destination);
        renderState$jscomp$1.scripts.forEach(flushResource, destination);
        renderState$jscomp$1.scripts.clear();
        renderState$jscomp$1.bulkPreloads.forEach(flushResource, destination);
        renderState$jscomp$1.bulkPreloads.clear();
        var hoistableChunks$jscomp$0 = renderState$jscomp$1.hoistableChunks;
        for (
          completedRootSegment = 0;
          completedRootSegment < hoistableChunks$jscomp$0.length;
          completedRootSegment++
        )
          writeChunk(destination, hoistableChunks$jscomp$0[completedRootSegment]);
        hoistableChunks$jscomp$0.length = 0;
        var clientRenderedBoundaries = request.clientRenderedBoundaries;
        for (i = 0; i < clientRenderedBoundaries.length; i++) {
          var boundary = clientRenderedBoundaries[i];
          renderState$jscomp$1 = destination;
          var resumableState$jscomp$1 = request.resumableState,
            renderState$jscomp$2 = request.renderState,
            id = boundary.rootSegmentID,
            errorDigest = boundary.errorDigest;
          writeChunk(renderState$jscomp$1, renderState$jscomp$2.startInlineScript);
          writeChunk(renderState$jscomp$1, endOfStartTag);
          0 === (resumableState$jscomp$1.instructions & 4)
            ? ((resumableState$jscomp$1.instructions |= 4),
              writeChunk(renderState$jscomp$1, clientRenderScript1Full))
            : writeChunk(renderState$jscomp$1, clientRenderScript1Partial);
          writeChunk(renderState$jscomp$1, renderState$jscomp$2.boundaryPrefix);
          writeChunk(renderState$jscomp$1, stringToChunk(id.toString(16)));
          writeChunk(renderState$jscomp$1, clientRenderScript1A);
          errorDigest &&
            (writeChunk(renderState$jscomp$1, clientRenderErrorScriptArgInterstitial),
            writeChunk(
              renderState$jscomp$1,
              stringToChunk(escapeJSStringsForInstructionScripts(errorDigest || "")),
            ));
          var JSCompiler_inline_result = writeChunkAndReturn(
            renderState$jscomp$1,
            clientRenderScriptEnd,
          );
          if (!JSCompiler_inline_result) {
            request.destination = null;
            i++;
            clientRenderedBoundaries.splice(0, i);
            return;
          }
        }
        clientRenderedBoundaries.splice(0, i);
        var completedBoundaries = request.completedBoundaries;
        for (i = 0; i < completedBoundaries.length; i++)
          if (!flushCompletedBoundary(request, destination, completedBoundaries[i])) {
            request.destination = null;
            i++;
            completedBoundaries.splice(0, i);
            return;
          }
        completedBoundaries.splice(0, i);
        completeWriting(destination);
        currentView = new Uint8Array(2048);
        writtenBytes = 0;
        flushingPartialBoundaries = !0;
        var partialBoundaries = request.partialBoundaries;
        for (i = 0; i < partialBoundaries.length; i++) {
          var boundary$70 = partialBoundaries[i];
          a: {
            clientRenderedBoundaries = request;
            boundary = destination;
            flushedByteSize = boundary$70.byteSize;
            var completedSegments = boundary$70.completedSegments;
            for (
              JSCompiler_inline_result = 0;
              JSCompiler_inline_result < completedSegments.length;
              JSCompiler_inline_result++
            )
              if (
                !flushPartiallyCompletedSegment(
                  clientRenderedBoundaries,
                  boundary,
                  boundary$70,
                  completedSegments[JSCompiler_inline_result],
                )
              ) {
                JSCompiler_inline_result++;
                completedSegments.splice(0, JSCompiler_inline_result);
                var JSCompiler_inline_result$jscomp$0 = !1;
                break a;
              }
            completedSegments.splice(0, JSCompiler_inline_result);
            var row = boundary$70.row;
            null !== row &&
              row.together &&
              1 === boundary$70.pendingTasks &&
              (1 === row.pendingTasks
                ? unblockSuspenseListRow(clientRenderedBoundaries, row, row.hoistables)
                : row.pendingTasks--);
            JSCompiler_inline_result$jscomp$0 = writeHoistablesForBoundary(
              boundary,
              boundary$70.contentState,
              clientRenderedBoundaries.renderState,
            );
          }
          if (!JSCompiler_inline_result$jscomp$0) {
            request.destination = null;
            i++;
            partialBoundaries.splice(0, i);
            return;
          }
        }
        partialBoundaries.splice(0, i);
        flushingPartialBoundaries = !1;
        var largeBoundaries = request.completedBoundaries;
        for (i = 0; i < largeBoundaries.length; i++)
          if (!flushCompletedBoundary(request, destination, largeBoundaries[i])) {
            request.destination = null;
            i++;
            largeBoundaries.splice(0, i);
            return;
          }
        largeBoundaries.splice(0, i);
      }
    } finally {
      ((flushingPartialBoundaries = !1),
        0 === request.allPendingTasks &&
        0 === request.clientRenderedBoundaries.length &&
        0 === request.completedBoundaries.length
          ? ((request.flushScheduled = !1),
            (i = request.resumableState),
            i.hasBody && writeChunk(destination, endChunkForTag("body")),
            i.hasHtml && writeChunk(destination, endChunkForTag("html")),
            completeWriting(destination),
            (request.status = 14),
            destination.close(),
            (request.destination = null))
          : completeWriting(destination));
    }
  }
  function startWork(request) {
    request.flushScheduled = null !== request.destination;
    supportsRequestStorage
      ? scheduleMicrotask(function () {
          return requestStorage.run(request, performWork, request);
        })
      : scheduleMicrotask(function () {
          return performWork(request);
        });
    setTimeout(function () {
      10 === request.status && (request.status = 11);
      null === request.trackedPostpones &&
        (supportsRequestStorage
          ? requestStorage.run(request, enqueueEarlyPreloadsAfterInitialWork, request)
          : enqueueEarlyPreloadsAfterInitialWork(request));
    }, 0);
  }
  function enqueueEarlyPreloadsAfterInitialWork(request) {
    safelyEmitEarlyPreloads(request, 0 === request.pendingRootTasks);
  }
  function enqueueFlush(request) {
    !1 === request.flushScheduled &&
      0 === request.pingedTasks.length &&
      null !== request.destination &&
      ((request.flushScheduled = !0),
      setTimeout(function () {
        var destination = request.destination;
        destination ? flushCompletedQueues(request, destination) : (request.flushScheduled = !1);
      }, 0));
  }
  function startFlowing(request, destination) {
    if (13 === request.status)
      ((request.status = 14), closeWithError(destination, request.fatalError));
    else if (14 !== request.status && null === request.destination) {
      request.destination = destination;
      try {
        flushCompletedQueues(request, destination);
      } catch (error) {
        (logRecoverableError(request, error, {}), fatalError(request, error));
      }
    }
  }
  function abort(request, reason) {
    if (11 === request.status || 10 === request.status) request.status = 12;
    try {
      var abortableTasks = request.abortableTasks;
      if (0 < abortableTasks.size) {
        var error =
          void 0 === reason
            ? Error("The render was aborted by the server without a reason.")
            : "object" === typeof reason && null !== reason && "function" === typeof reason.then
              ? Error("The render was aborted by the server with a promise.")
              : reason;
        request.fatalError = error;
        abortableTasks.forEach(function (task) {
          return abortTask(task, request, error);
        });
        abortableTasks.clear();
      }
      null !== request.destination && flushCompletedQueues(request, request.destination);
    } catch (error$72) {
      (logRecoverableError(request, error$72, {}), fatalError(request, error$72));
    }
  }
  function addToReplayParent(node, parentKeyPath, trackedPostpones) {
    if (null === parentKeyPath) trackedPostpones.rootNodes.push(node);
    else {
      var workingMap = trackedPostpones.workingMap,
        parentNode = workingMap.get(parentKeyPath);
      void 0 === parentNode &&
        ((parentNode = [parentKeyPath[1], parentKeyPath[2], [], null]),
        workingMap.set(parentKeyPath, parentNode),
        addToReplayParent(parentNode, parentKeyPath[0], trackedPostpones));
      parentNode[2].push(node);
    }
  }
  function getPostponedState(request) {
    var trackedPostpones = request.trackedPostpones;
    if (
      null === trackedPostpones ||
      (0 === trackedPostpones.rootNodes.length && null === trackedPostpones.rootSlots)
    )
      return (request.trackedPostpones = null);
    if (
      null === request.completedRootSegment ||
      (5 !== request.completedRootSegment.status && null !== request.completedPreambleSegments)
    ) {
      var nextSegmentId = request.nextSegmentId;
      var replaySlots = trackedPostpones.rootSlots;
      var resumableState = request.resumableState;
      resumableState.bootstrapScriptContent = void 0;
      resumableState.bootstrapScripts = void 0;
      resumableState.bootstrapModules = void 0;
    } else {
      nextSegmentId = 0;
      replaySlots = -1;
      resumableState = request.resumableState;
      var renderState = request.renderState;
      resumableState.nextFormID = 0;
      resumableState.hasBody = !1;
      resumableState.hasHtml = !1;
      resumableState.unknownResources = { font: renderState.resets.font };
      resumableState.dnsResources = renderState.resets.dns;
      resumableState.connectResources = renderState.resets.connect;
      resumableState.imageResources = renderState.resets.image;
      resumableState.styleResources = renderState.resets.style;
      resumableState.scriptResources = {};
      resumableState.moduleUnknownResources = {};
      resumableState.moduleScriptResources = {};
      resumableState.instructions = 0;
    }
    return {
      nextSegmentId,
      rootFormatContext: request.rootFormatContext,
      progressiveChunkSize: request.progressiveChunkSize,
      resumableState: request.resumableState,
      replayNodes: trackedPostpones.rootNodes,
      replaySlots,
    };
  }
  function ensureCorrectIsomorphicReactVersion() {
    var isomorphicReactPackageVersion = React.version;
    if ("19.2.4" !== isomorphicReactPackageVersion)
      throw Error(
        'Incompatible React versions: The "react" and "react-dom" packages must have the exact same version. Instead got:\n  - react:      ' +
          (isomorphicReactPackageVersion +
            "\n  - react-dom:  19.2.4\nLearn more: https://react.dev/warnings/version-mismatch"),
      );
  }
  ensureCorrectIsomorphicReactVersion();
  ensureCorrectIsomorphicReactVersion();
  exports.prerender = function (children, options) {
    return new Promise(function (resolve, reject) {
      var onHeaders = options ? options.onHeaders : void 0,
        onHeadersImpl;
      onHeaders &&
        (onHeadersImpl = function (headersDescriptor) {
          onHeaders(new Headers(headersDescriptor));
        });
      var resources = createResumableState(
          options ? options.identifierPrefix : void 0,
          options ? options.unstable_externalRuntimeSrc : void 0,
          options ? options.bootstrapScriptContent : void 0,
          options ? options.bootstrapScripts : void 0,
          options ? options.bootstrapModules : void 0,
        ),
        request = createPrerenderRequest(
          children,
          resources,
          createRenderState(
            resources,
            void 0,
            options ? options.unstable_externalRuntimeSrc : void 0,
            options ? options.importMap : void 0,
            onHeadersImpl,
            options ? options.maxHeadersLength : void 0,
          ),
          createRootFormatContext(options ? options.namespaceURI : void 0),
          options ? options.progressiveChunkSize : void 0,
          options ? options.onError : void 0,
          function () {
            var stream = new ReadableStream(
              {
                type: "bytes",
                pull: function (controller) {
                  startFlowing(request, controller);
                },
                cancel: function (reason) {
                  request.destination = null;
                  abort(request, reason);
                },
              },
              { highWaterMark: 0 },
            );
            stream = {
              postponed: getPostponedState(request),
              prelude: stream,
            };
            resolve(stream);
          },
          void 0,
          void 0,
          reject,
          options ? options.onPostpone : void 0,
        );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(request, signal.reason);
        else {
          var listener = function () {
            abort(request, signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
      startWork(request);
    });
  };
  exports.renderToReadableStream = function (children, options) {
    return new Promise(function (resolve, reject) {
      var onFatalError,
        onAllReady,
        allReady = new Promise(function (res, rej) {
          onAllReady = res;
          onFatalError = rej;
        }),
        onHeaders = options ? options.onHeaders : void 0,
        onHeadersImpl;
      onHeaders &&
        (onHeadersImpl = function (headersDescriptor) {
          onHeaders(new Headers(headersDescriptor));
        });
      var resumableState = createResumableState(
          options ? options.identifierPrefix : void 0,
          options ? options.unstable_externalRuntimeSrc : void 0,
          options ? options.bootstrapScriptContent : void 0,
          options ? options.bootstrapScripts : void 0,
          options ? options.bootstrapModules : void 0,
        ),
        request = createRequest(
          children,
          resumableState,
          createRenderState(
            resumableState,
            options ? options.nonce : void 0,
            options ? options.unstable_externalRuntimeSrc : void 0,
            options ? options.importMap : void 0,
            onHeadersImpl,
            options ? options.maxHeadersLength : void 0,
          ),
          createRootFormatContext(options ? options.namespaceURI : void 0),
          options ? options.progressiveChunkSize : void 0,
          options ? options.onError : void 0,
          onAllReady,
          function () {
            var stream = new ReadableStream(
              {
                type: "bytes",
                pull: function (controller) {
                  startFlowing(request, controller);
                },
                cancel: function (reason) {
                  request.destination = null;
                  abort(request, reason);
                },
              },
              { highWaterMark: 0 },
            );
            stream.allReady = allReady;
            resolve(stream);
          },
          function (error) {
            allReady.catch(function () {});
            reject(error);
          },
          onFatalError,
          options ? options.onPostpone : void 0,
          options ? options.formState : void 0,
        );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(request, signal.reason);
        else {
          var listener = function () {
            abort(request, signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
      startWork(request);
    });
  };
  exports.resume = function (children, postponedState, options) {
    return new Promise(function (resolve, reject) {
      var onFatalError,
        onAllReady,
        allReady = new Promise(function (res, rej) {
          onAllReady = res;
          onFatalError = rej;
        }),
        request = resumeRequest(
          children,
          postponedState,
          createRenderState(
            postponedState.resumableState,
            options ? options.nonce : void 0,
            void 0,
            void 0,
            void 0,
            void 0,
          ),
          options ? options.onError : void 0,
          onAllReady,
          function () {
            var stream = new ReadableStream(
              {
                type: "bytes",
                pull: function (controller) {
                  startFlowing(request, controller);
                },
                cancel: function (reason) {
                  request.destination = null;
                  abort(request, reason);
                },
              },
              { highWaterMark: 0 },
            );
            stream.allReady = allReady;
            resolve(stream);
          },
          function (error) {
            allReady.catch(function () {});
            reject(error);
          },
          onFatalError,
          options ? options.onPostpone : void 0,
        );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(request, signal.reason);
        else {
          var listener = function () {
            abort(request, signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
      startWork(request);
    });
  };
  exports.resumeAndPrerender = function (children, postponedState, options) {
    return new Promise(function (resolve, reject) {
      var request = resumeAndPrerenderRequest(
        children,
        postponedState,
        createRenderState(postponedState.resumableState, void 0, void 0, void 0, void 0, void 0),
        options ? options.onError : void 0,
        function () {
          var stream = new ReadableStream(
            {
              type: "bytes",
              pull: function (controller) {
                startFlowing(request, controller);
              },
              cancel: function (reason) {
                request.destination = null;
                abort(request, reason);
              },
            },
            { highWaterMark: 0 },
          );
          stream = {
            postponed: getPostponedState(request),
            prelude: stream,
          };
          resolve(stream);
        },
        void 0,
        void 0,
        reject,
        options ? options.onPostpone : void 0,
      );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(request, signal.reason);
        else {
          var listener = function () {
            abort(request, signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
      startWork(request);
    });
  };
  exports.version = "19.2.4";
});
//#endregion
//#region ../../node_modules/.bun/react-dom@19.2.4+b1ab299f0a400331/node_modules/react-dom/cjs/react-dom-server-legacy.browser.production.js
/**
 * @license React
 * react-dom-server-legacy.browser.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const require_react_dom_server_legacy_browser_production = /* @__PURE__ */ __commonJSMin(
  (exports) => {
    var React = require_react(),
      ReactDOM = require_react_dom();
    function formatProdErrorMessage(code) {
      var url = "https://react.dev/errors/" + code;
      if (1 < arguments.length) {
        url += "?args[]=" + encodeURIComponent(arguments[1]);
        for (var i = 2; i < arguments.length; i++)
          url += "&args[]=" + encodeURIComponent(arguments[i]);
      }
      return (
        "Minified React error #" +
        code +
        "; visit " +
        url +
        " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
      );
    }
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
      REACT_PORTAL_TYPE = Symbol.for("react.portal"),
      REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
      REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
      REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
      REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
      REACT_CONTEXT_TYPE = Symbol.for("react.context"),
      REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
      REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
      REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
      REACT_MEMO_TYPE = Symbol.for("react.memo"),
      REACT_LAZY_TYPE = Symbol.for("react.lazy"),
      REACT_SCOPE_TYPE = Symbol.for("react.scope"),
      REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
      REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden"),
      REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"),
      REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"),
      MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable =
        (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
        maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var isArrayImpl = Array.isArray;
    function murmurhash3_32_gc(key, seed) {
      var remainder = key.length & 3;
      var bytes = key.length - remainder;
      var h1 = seed;
      for (seed = 0; seed < bytes; ) {
        var k1 =
          (key.charCodeAt(seed) & 255) |
          ((key.charCodeAt(++seed) & 255) << 8) |
          ((key.charCodeAt(++seed) & 255) << 16) |
          ((key.charCodeAt(++seed) & 255) << 24);
        ++seed;
        k1 =
          (3432918353 * (k1 & 65535) + (((3432918353 * (k1 >>> 16)) & 65535) << 16)) & 4294967295;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (461845907 * (k1 & 65535) + (((461845907 * (k1 >>> 16)) & 65535) << 16)) & 4294967295;
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1 = (5 * (h1 & 65535) + (((5 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
        h1 = (h1 & 65535) + 27492 + ((((h1 >>> 16) + 58964) & 65535) << 16);
      }
      k1 = 0;
      switch (remainder) {
        case 3:
          k1 ^= (key.charCodeAt(seed + 2) & 255) << 16;
        case 2:
          k1 ^= (key.charCodeAt(seed + 1) & 255) << 8;
        case 1:
          ((k1 ^= key.charCodeAt(seed) & 255),
            (k1 =
              (3432918353 * (k1 & 65535) + (((3432918353 * (k1 >>> 16)) & 65535) << 16)) &
              4294967295),
            (k1 = (k1 << 15) | (k1 >>> 17)),
            (h1 ^=
              (461845907 * (k1 & 65535) + (((461845907 * (k1 >>> 16)) & 65535) << 16)) &
              4294967295));
      }
      h1 ^= key.length;
      h1 ^= h1 >>> 16;
      h1 = (2246822507 * (h1 & 65535) + (((2246822507 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
      h1 ^= h1 >>> 13;
      h1 = (3266489909 * (h1 & 65535) + (((3266489909 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
      return (h1 ^ (h1 >>> 16)) >>> 0;
    }
    var assign = Object.assign,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      VALID_ATTRIBUTE_NAME_REGEX = RegExp(
        "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
      ),
      illegalAttributeNameCache = {},
      validatedAttributeNameCache = {};
    function isAttributeNameSafe(attributeName) {
      if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
      if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
      if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
        return (validatedAttributeNameCache[attributeName] = !0);
      illegalAttributeNameCache[attributeName] = !0;
      return !1;
    }
    var unitlessNumbers = new Set(
        "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
          " ",
        ),
      ),
      aliases = new Map([
        ["acceptCharset", "accept-charset"],
        ["htmlFor", "for"],
        ["httpEquiv", "http-equiv"],
        ["crossOrigin", "crossorigin"],
        ["accentHeight", "accent-height"],
        ["alignmentBaseline", "alignment-baseline"],
        ["arabicForm", "arabic-form"],
        ["baselineShift", "baseline-shift"],
        ["capHeight", "cap-height"],
        ["clipPath", "clip-path"],
        ["clipRule", "clip-rule"],
        ["colorInterpolation", "color-interpolation"],
        ["colorInterpolationFilters", "color-interpolation-filters"],
        ["colorProfile", "color-profile"],
        ["colorRendering", "color-rendering"],
        ["dominantBaseline", "dominant-baseline"],
        ["enableBackground", "enable-background"],
        ["fillOpacity", "fill-opacity"],
        ["fillRule", "fill-rule"],
        ["floodColor", "flood-color"],
        ["floodOpacity", "flood-opacity"],
        ["fontFamily", "font-family"],
        ["fontSize", "font-size"],
        ["fontSizeAdjust", "font-size-adjust"],
        ["fontStretch", "font-stretch"],
        ["fontStyle", "font-style"],
        ["fontVariant", "font-variant"],
        ["fontWeight", "font-weight"],
        ["glyphName", "glyph-name"],
        ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
        ["glyphOrientationVertical", "glyph-orientation-vertical"],
        ["horizAdvX", "horiz-adv-x"],
        ["horizOriginX", "horiz-origin-x"],
        ["imageRendering", "image-rendering"],
        ["letterSpacing", "letter-spacing"],
        ["lightingColor", "lighting-color"],
        ["markerEnd", "marker-end"],
        ["markerMid", "marker-mid"],
        ["markerStart", "marker-start"],
        ["overlinePosition", "overline-position"],
        ["overlineThickness", "overline-thickness"],
        ["paintOrder", "paint-order"],
        ["panose-1", "panose-1"],
        ["pointerEvents", "pointer-events"],
        ["renderingIntent", "rendering-intent"],
        ["shapeRendering", "shape-rendering"],
        ["stopColor", "stop-color"],
        ["stopOpacity", "stop-opacity"],
        ["strikethroughPosition", "strikethrough-position"],
        ["strikethroughThickness", "strikethrough-thickness"],
        ["strokeDasharray", "stroke-dasharray"],
        ["strokeDashoffset", "stroke-dashoffset"],
        ["strokeLinecap", "stroke-linecap"],
        ["strokeLinejoin", "stroke-linejoin"],
        ["strokeMiterlimit", "stroke-miterlimit"],
        ["strokeOpacity", "stroke-opacity"],
        ["strokeWidth", "stroke-width"],
        ["textAnchor", "text-anchor"],
        ["textDecoration", "text-decoration"],
        ["textRendering", "text-rendering"],
        ["transformOrigin", "transform-origin"],
        ["underlinePosition", "underline-position"],
        ["underlineThickness", "underline-thickness"],
        ["unicodeBidi", "unicode-bidi"],
        ["unicodeRange", "unicode-range"],
        ["unitsPerEm", "units-per-em"],
        ["vAlphabetic", "v-alphabetic"],
        ["vHanging", "v-hanging"],
        ["vIdeographic", "v-ideographic"],
        ["vMathematical", "v-mathematical"],
        ["vectorEffect", "vector-effect"],
        ["vertAdvY", "vert-adv-y"],
        ["vertOriginX", "vert-origin-x"],
        ["vertOriginY", "vert-origin-y"],
        ["wordSpacing", "word-spacing"],
        ["writingMode", "writing-mode"],
        ["xmlnsXlink", "xmlns:xlink"],
        ["xHeight", "x-height"],
      ]),
      matchHtmlRegExp = /["'&<>]/;
    function escapeTextForBrowser(text) {
      if ("boolean" === typeof text || "number" === typeof text || "bigint" === typeof text)
        return "" + text;
      text = "" + text;
      var match = matchHtmlRegExp.exec(text);
      if (match) {
        var html = "",
          index,
          lastIndex = 0;
        for (index = match.index; index < text.length; index++) {
          switch (text.charCodeAt(index)) {
            case 34:
              match = "&quot;";
              break;
            case 38:
              match = "&amp;";
              break;
            case 39:
              match = "&#x27;";
              break;
            case 60:
              match = "&lt;";
              break;
            case 62:
              match = "&gt;";
              break;
            default:
              continue;
          }
          lastIndex !== index && (html += text.slice(lastIndex, index));
          lastIndex = index + 1;
          html += match;
        }
        text = lastIndex !== index ? html + text.slice(lastIndex, index) : html;
      }
      return text;
    }
    var uppercasePattern = /([A-Z])/g,
      msPattern = /^ms-/,
      isJavaScriptProtocol =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function sanitizeURL(url) {
      return isJavaScriptProtocol.test("" + url)
        ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
        : url;
    }
    var ReactSharedInternals =
        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      ReactDOMSharedInternals =
        ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      sharedNotPendingObject = {
        pending: !1,
        data: null,
        method: null,
        action: null,
      },
      previousDispatcher = ReactDOMSharedInternals.d;
    ReactDOMSharedInternals.d = {
      f: previousDispatcher.f,
      r: previousDispatcher.r,
      D: prefetchDNS,
      C: preconnect,
      L: preload,
      m: preloadModule,
      X: preinitScript,
      S: preinitStyle,
      M: preinitModuleScript,
    };
    var PRELOAD_NO_CREDS = [],
      currentlyFlushingRenderState = null,
      scriptRegex = /(<\/|<)(s)(cript)/gi;
    function scriptReplacer(match, prefix, s, suffix) {
      return "" + prefix + ("s" === s ? "\\u0073" : "\\u0053") + suffix;
    }
    function createResumableState(
      identifierPrefix,
      externalRuntimeConfig,
      bootstrapScriptContent,
      bootstrapScripts,
      bootstrapModules,
    ) {
      return {
        idPrefix: void 0 === identifierPrefix ? "" : identifierPrefix,
        nextFormID: 0,
        streamingFormat: 0,
        bootstrapScriptContent,
        bootstrapScripts,
        bootstrapModules,
        instructions: 0,
        hasBody: !1,
        hasHtml: !1,
        unknownResources: {},
        dnsResources: {},
        connectResources: {
          default: {},
          anonymous: {},
          credentials: {},
        },
        imageResources: {},
        styleResources: {},
        scriptResources: {},
        moduleUnknownResources: {},
        moduleScriptResources: {},
      };
    }
    function createFormatContext(insertionMode, selectedValue, tagScope, viewTransition) {
      return {
        insertionMode,
        selectedValue,
        tagScope,
        viewTransition,
      };
    }
    function getChildFormatContext(parentContext, type, props) {
      var subtreeScope = parentContext.tagScope & -25;
      switch (type) {
        case "noscript":
          return createFormatContext(2, null, subtreeScope | 1, null);
        case "select":
          return createFormatContext(
            2,
            null != props.value ? props.value : props.defaultValue,
            subtreeScope,
            null,
          );
        case "svg":
          return createFormatContext(4, null, subtreeScope, null);
        case "picture":
          return createFormatContext(2, null, subtreeScope | 2, null);
        case "math":
          return createFormatContext(5, null, subtreeScope, null);
        case "foreignObject":
          return createFormatContext(2, null, subtreeScope, null);
        case "table":
          return createFormatContext(6, null, subtreeScope, null);
        case "thead":
        case "tbody":
        case "tfoot":
          return createFormatContext(7, null, subtreeScope, null);
        case "colgroup":
          return createFormatContext(9, null, subtreeScope, null);
        case "tr":
          return createFormatContext(8, null, subtreeScope, null);
        case "head":
          if (2 > parentContext.insertionMode)
            return createFormatContext(3, null, subtreeScope, null);
          break;
        case "html":
          if (0 === parentContext.insertionMode)
            return createFormatContext(1, null, subtreeScope, null);
      }
      return 6 <= parentContext.insertionMode || 2 > parentContext.insertionMode
        ? createFormatContext(2, null, subtreeScope, null)
        : parentContext.tagScope !== subtreeScope
          ? createFormatContext(
              parentContext.insertionMode,
              parentContext.selectedValue,
              subtreeScope,
              null,
            )
          : parentContext;
    }
    function getSuspenseViewTransition(parentViewTransition) {
      return null === parentViewTransition
        ? null
        : {
            update: parentViewTransition.update,
            enter: "none",
            exit: "none",
            share: parentViewTransition.update,
            name: parentViewTransition.autoName,
            autoName: parentViewTransition.autoName,
            nameIdx: 0,
          };
    }
    function getSuspenseFallbackFormatContext(resumableState, parentContext) {
      parentContext.tagScope & 32 && (resumableState.instructions |= 128);
      return createFormatContext(
        parentContext.insertionMode,
        parentContext.selectedValue,
        parentContext.tagScope | 12,
        getSuspenseViewTransition(parentContext.viewTransition),
      );
    }
    function getSuspenseContentFormatContext(resumableState, parentContext) {
      resumableState = getSuspenseViewTransition(parentContext.viewTransition);
      var subtreeScope = parentContext.tagScope | 16;
      null !== resumableState && "none" !== resumableState.share && (subtreeScope |= 64);
      return createFormatContext(
        parentContext.insertionMode,
        parentContext.selectedValue,
        subtreeScope,
        resumableState,
      );
    }
    var styleNameCache = /* @__PURE__ */ new Map();
    function pushStyleAttribute(target, style) {
      if ("object" !== typeof style) throw Error(formatProdErrorMessage(62));
      var isFirst = !0,
        styleName;
      for (styleName in style)
        if (hasOwnProperty.call(style, styleName)) {
          var styleValue = style[styleName];
          if (null != styleValue && "boolean" !== typeof styleValue && "" !== styleValue) {
            if (0 === styleName.indexOf("--")) {
              var nameChunk = escapeTextForBrowser(styleName);
              styleValue = escapeTextForBrowser(("" + styleValue).trim());
            } else
              ((nameChunk = styleNameCache.get(styleName)),
                void 0 === nameChunk &&
                  ((nameChunk = escapeTextForBrowser(
                    styleName
                      .replace(uppercasePattern, "-$1")
                      .toLowerCase()
                      .replace(msPattern, "-ms-"),
                  )),
                  styleNameCache.set(styleName, nameChunk)),
                (styleValue =
                  "number" === typeof styleValue
                    ? 0 === styleValue || unitlessNumbers.has(styleName)
                      ? "" + styleValue
                      : styleValue + "px"
                    : escapeTextForBrowser(("" + styleValue).trim())));
            isFirst
              ? ((isFirst = !1), target.push(' style="', nameChunk, ":", styleValue))
              : target.push(";", nameChunk, ":", styleValue);
          }
        }
      isFirst || target.push('"');
    }
    function pushBooleanAttribute(target, name, value) {
      value &&
        "function" !== typeof value &&
        "symbol" !== typeof value &&
        target.push(" ", name, '=""');
    }
    function pushStringAttribute(target, name, value) {
      "function" !== typeof value &&
        "symbol" !== typeof value &&
        "boolean" !== typeof value &&
        target.push(" ", name, '="', escapeTextForBrowser(value), '"');
    }
    var actionJavaScriptURL = escapeTextForBrowser(
      "javascript:throw new Error('React form unexpectedly submitted.')",
    );
    function pushAdditionalFormField(value, key) {
      this.push('<input type="hidden"');
      validateAdditionalFormField(value);
      pushStringAttribute(this, "name", key);
      pushStringAttribute(this, "value", value);
      this.push("/>");
    }
    function validateAdditionalFormField(value) {
      if ("string" !== typeof value) throw Error(formatProdErrorMessage(480));
    }
    function getCustomFormFields(resumableState, formAction) {
      if ("function" === typeof formAction.$$FORM_ACTION) {
        var id = resumableState.nextFormID++;
        resumableState = resumableState.idPrefix + id;
        try {
          var customFields = formAction.$$FORM_ACTION(resumableState);
          if (customFields) customFields.data?.forEach(validateAdditionalFormField);
          return customFields;
        } catch (x) {
          if ("object" === typeof x && null !== x && "function" === typeof x.then) throw x;
        }
      }
      return null;
    }
    function pushFormActionAttribute(
      target,
      resumableState,
      renderState,
      formAction,
      formEncType,
      formMethod,
      formTarget,
      name,
    ) {
      var formData = null;
      if ("function" === typeof formAction) {
        var customFields = getCustomFormFields(resumableState, formAction);
        null !== customFields
          ? ((name = customFields.name),
            (formAction = customFields.action || ""),
            (formEncType = customFields.encType),
            (formMethod = customFields.method),
            (formTarget = customFields.target),
            (formData = customFields.data))
          : (target.push(" ", "formAction", '="', actionJavaScriptURL, '"'),
            (formTarget = formMethod = formEncType = formAction = name = null),
            injectFormReplayingRuntime(resumableState, renderState));
      }
      null != name && pushAttribute(target, "name", name);
      null != formAction && pushAttribute(target, "formAction", formAction);
      null != formEncType && pushAttribute(target, "formEncType", formEncType);
      null != formMethod && pushAttribute(target, "formMethod", formMethod);
      null != formTarget && pushAttribute(target, "formTarget", formTarget);
      return formData;
    }
    function pushAttribute(target, name, value) {
      switch (name) {
        case "className":
          pushStringAttribute(target, "class", value);
          break;
        case "tabIndex":
          pushStringAttribute(target, "tabindex", value);
          break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
          pushStringAttribute(target, name, value);
          break;
        case "style":
          pushStyleAttribute(target, value);
          break;
        case "src":
        case "href":
          if ("" === value) break;
        case "action":
        case "formAction":
          if (
            null == value ||
            "function" === typeof value ||
            "symbol" === typeof value ||
            "boolean" === typeof value
          )
            break;
          value = sanitizeURL("" + value);
          target.push(" ", name, '="', escapeTextForBrowser(value), '"');
          break;
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "ref":
          break;
        case "autoFocus":
        case "multiple":
        case "muted":
          pushBooleanAttribute(target, name.toLowerCase(), value);
          break;
        case "xlinkHref":
          if (
            "function" === typeof value ||
            "symbol" === typeof value ||
            "boolean" === typeof value
          )
            break;
          value = sanitizeURL("" + value);
          target.push(" ", "xlink:href", '="', escapeTextForBrowser(value), '"');
          break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
          "function" !== typeof value &&
            "symbol" !== typeof value &&
            target.push(" ", name, '="', escapeTextForBrowser(value), '"');
          break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
          value &&
            "function" !== typeof value &&
            "symbol" !== typeof value &&
            target.push(" ", name, '=""');
          break;
        case "capture":
        case "download":
          !0 === value
            ? target.push(" ", name, '=""')
            : !1 !== value &&
              "function" !== typeof value &&
              "symbol" !== typeof value &&
              target.push(" ", name, '="', escapeTextForBrowser(value), '"');
          break;
        case "cols":
        case "rows":
        case "size":
        case "span":
          "function" !== typeof value &&
            "symbol" !== typeof value &&
            !isNaN(value) &&
            1 <= value &&
            target.push(" ", name, '="', escapeTextForBrowser(value), '"');
          break;
        case "rowSpan":
        case "start":
          "function" === typeof value ||
            "symbol" === typeof value ||
            isNaN(value) ||
            target.push(" ", name, '="', escapeTextForBrowser(value), '"');
          break;
        case "xlinkActuate":
          pushStringAttribute(target, "xlink:actuate", value);
          break;
        case "xlinkArcrole":
          pushStringAttribute(target, "xlink:arcrole", value);
          break;
        case "xlinkRole":
          pushStringAttribute(target, "xlink:role", value);
          break;
        case "xlinkShow":
          pushStringAttribute(target, "xlink:show", value);
          break;
        case "xlinkTitle":
          pushStringAttribute(target, "xlink:title", value);
          break;
        case "xlinkType":
          pushStringAttribute(target, "xlink:type", value);
          break;
        case "xmlBase":
          pushStringAttribute(target, "xml:base", value);
          break;
        case "xmlLang":
          pushStringAttribute(target, "xml:lang", value);
          break;
        case "xmlSpace":
          pushStringAttribute(target, "xml:space", value);
          break;
        default:
          if (
            !(2 < name.length) ||
            ("o" !== name[0] && "O" !== name[0]) ||
            ("n" !== name[1] && "N" !== name[1])
          ) {
            if (((name = aliases.get(name) || name), isAttributeNameSafe(name))) {
              switch (typeof value) {
                case "function":
                case "symbol":
                  return;
                case "boolean":
                  var prefix$8 = name.toLowerCase().slice(0, 5);
                  if ("data-" !== prefix$8 && "aria-" !== prefix$8) return;
              }
              target.push(" ", name, '="', escapeTextForBrowser(value), '"');
            }
          }
      }
    }
    function pushInnerHTML(target, innerHTML, children) {
      if (null != innerHTML) {
        if (null != children) throw Error(formatProdErrorMessage(60));
        if ("object" !== typeof innerHTML || !("__html" in innerHTML))
          throw Error(formatProdErrorMessage(61));
        innerHTML = innerHTML.__html;
        null !== innerHTML && void 0 !== innerHTML && target.push("" + innerHTML);
      }
    }
    function flattenOptionChildren(children) {
      var content = "";
      React.Children.forEach(children, function (child) {
        null != child && (content += child);
      });
      return content;
    }
    function injectFormReplayingRuntime(resumableState, renderState) {
      if (0 === (resumableState.instructions & 16)) {
        resumableState.instructions |= 16;
        var preamble = renderState.preamble,
          bootstrapChunks = renderState.bootstrapChunks;
        (preamble.htmlChunks || preamble.headChunks) && 0 === bootstrapChunks.length
          ? (bootstrapChunks.push(renderState.startInlineScript),
            pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
            bootstrapChunks.push(
              ">",
              'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});',
              "<\/script>",
            ))
          : bootstrapChunks.unshift(
              renderState.startInlineScript,
              ">",
              'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});',
              "<\/script>",
            );
      }
    }
    function pushLinkImpl(target, props) {
      target.push(startChunkForTag("link"));
      for (var propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, "link"));
              default:
                pushAttribute(target, propKey, propValue);
            }
        }
      target.push("/>");
      return null;
    }
    var styleRegex = /(<\/|<)(s)(tyle)/gi;
    function styleReplacer(match, prefix, s, suffix) {
      return "" + prefix + ("s" === s ? "\\73 " : "\\53 ") + suffix;
    }
    function pushSelfClosing(target, props, tag) {
      target.push(startChunkForTag(tag));
      for (var propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, tag));
              default:
                pushAttribute(target, propKey, propValue);
            }
        }
      target.push("/>");
      return null;
    }
    function pushTitleImpl(target, props) {
      target.push(startChunkForTag("title"));
      var children = null,
        innerHTML = null,
        propKey;
      for (propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
                children = propValue;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
              default:
                pushAttribute(target, propKey, propValue);
            }
        }
      target.push(">");
      props = Array.isArray(children) ? (2 > children.length ? children[0] : null) : children;
      "function" !== typeof props &&
        "symbol" !== typeof props &&
        null !== props &&
        void 0 !== props &&
        target.push(escapeTextForBrowser("" + props));
      pushInnerHTML(target, innerHTML, children);
      target.push(endChunkForTag("title"));
      return null;
    }
    function pushScriptImpl(target, props) {
      target.push(startChunkForTag("script"));
      var children = null,
        innerHTML = null,
        propKey;
      for (propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
                children = propValue;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
              default:
                pushAttribute(target, propKey, propValue);
            }
        }
      target.push(">");
      pushInnerHTML(target, innerHTML, children);
      "string" === typeof children &&
        target.push(("" + children).replace(scriptRegex, scriptReplacer));
      target.push(endChunkForTag("script"));
      return null;
    }
    function pushStartSingletonElement(target, props, tag) {
      target.push(startChunkForTag(tag));
      var innerHTML = (tag = null),
        propKey;
      for (propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
                tag = propValue;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
              default:
                pushAttribute(target, propKey, propValue);
            }
        }
      target.push(">");
      pushInnerHTML(target, innerHTML, tag);
      return tag;
    }
    function pushStartGenericElement(target, props, tag) {
      target.push(startChunkForTag(tag));
      var innerHTML = (tag = null),
        propKey;
      for (propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
                tag = propValue;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
              default:
                pushAttribute(target, propKey, propValue);
            }
        }
      target.push(">");
      pushInnerHTML(target, innerHTML, tag);
      return "string" === typeof tag ? (target.push(escapeTextForBrowser(tag)), null) : tag;
    }
    var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,
      validatedTagCache = /* @__PURE__ */ new Map();
    function startChunkForTag(tag) {
      var tagStartChunk = validatedTagCache.get(tag);
      if (void 0 === tagStartChunk) {
        if (!VALID_TAG_REGEX.test(tag)) throw Error(formatProdErrorMessage(65, tag));
        tagStartChunk = "<" + tag;
        validatedTagCache.set(tag, tagStartChunk);
      }
      return tagStartChunk;
    }
    function pushStartInstance(
      target$jscomp$0,
      type,
      props,
      resumableState,
      renderState,
      preambleState,
      hoistableState,
      formatContext,
      textEmbedded,
    ) {
      switch (type) {
        case "div":
        case "span":
        case "svg":
        case "path":
          break;
        case "a":
          target$jscomp$0.push(startChunkForTag("a"));
          var children = null,
            innerHTML = null,
            propKey;
          for (propKey in props)
            if (hasOwnProperty.call(props, propKey)) {
              var propValue = props[propKey];
              if (null != propValue)
                switch (propKey) {
                  case "children":
                    children = propValue;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML = propValue;
                    break;
                  case "href":
                    "" === propValue
                      ? pushStringAttribute(target$jscomp$0, "href", "")
                      : pushAttribute(target$jscomp$0, propKey, propValue);
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey, propValue);
                }
            }
          target$jscomp$0.push(">");
          pushInnerHTML(target$jscomp$0, innerHTML, children);
          if ("string" === typeof children) {
            target$jscomp$0.push(escapeTextForBrowser(children));
            var JSCompiler_inline_result = null;
          } else JSCompiler_inline_result = children;
          return JSCompiler_inline_result;
        case "g":
        case "p":
        case "li":
          break;
        case "select":
          target$jscomp$0.push(startChunkForTag("select"));
          var children$jscomp$0 = null,
            innerHTML$jscomp$0 = null,
            propKey$jscomp$0;
          for (propKey$jscomp$0 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$0)) {
              var propValue$jscomp$0 = props[propKey$jscomp$0];
              if (null != propValue$jscomp$0)
                switch (propKey$jscomp$0) {
                  case "children":
                    children$jscomp$0 = propValue$jscomp$0;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$0 = propValue$jscomp$0;
                    break;
                  case "defaultValue":
                  case "value":
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$0, propValue$jscomp$0);
                }
            }
          target$jscomp$0.push(">");
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$0, children$jscomp$0);
          return children$jscomp$0;
        case "option":
          var selectedValue = formatContext.selectedValue;
          target$jscomp$0.push(startChunkForTag("option"));
          var children$jscomp$1 = null,
            value = null,
            selected = null,
            innerHTML$jscomp$1 = null,
            propKey$jscomp$1;
          for (propKey$jscomp$1 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$1)) {
              var propValue$jscomp$1 = props[propKey$jscomp$1];
              if (null != propValue$jscomp$1)
                switch (propKey$jscomp$1) {
                  case "children":
                    children$jscomp$1 = propValue$jscomp$1;
                    break;
                  case "selected":
                    selected = propValue$jscomp$1;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$1 = propValue$jscomp$1;
                    break;
                  case "value":
                    value = propValue$jscomp$1;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$1, propValue$jscomp$1);
                }
            }
          if (null != selectedValue) {
            var stringValue =
              null !== value ? "" + value : flattenOptionChildren(children$jscomp$1);
            if (isArrayImpl(selectedValue)) {
              for (var i = 0; i < selectedValue.length; i++)
                if ("" + selectedValue[i] === stringValue) {
                  target$jscomp$0.push(' selected=""');
                  break;
                }
            } else "" + selectedValue === stringValue && target$jscomp$0.push(' selected=""');
          } else selected && target$jscomp$0.push(' selected=""');
          target$jscomp$0.push(">");
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$1, children$jscomp$1);
          return children$jscomp$1;
        case "textarea":
          target$jscomp$0.push(startChunkForTag("textarea"));
          var value$jscomp$0 = null,
            defaultValue = null,
            children$jscomp$2 = null,
            propKey$jscomp$2;
          for (propKey$jscomp$2 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$2)) {
              var propValue$jscomp$2 = props[propKey$jscomp$2];
              if (null != propValue$jscomp$2)
                switch (propKey$jscomp$2) {
                  case "children":
                    children$jscomp$2 = propValue$jscomp$2;
                    break;
                  case "value":
                    value$jscomp$0 = propValue$jscomp$2;
                    break;
                  case "defaultValue":
                    defaultValue = propValue$jscomp$2;
                    break;
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(91));
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$2, propValue$jscomp$2);
                }
            }
          null === value$jscomp$0 && null !== defaultValue && (value$jscomp$0 = defaultValue);
          target$jscomp$0.push(">");
          if (null != children$jscomp$2) {
            if (null != value$jscomp$0) throw Error(formatProdErrorMessage(92));
            if (isArrayImpl(children$jscomp$2)) {
              if (1 < children$jscomp$2.length) throw Error(formatProdErrorMessage(93));
              value$jscomp$0 = "" + children$jscomp$2[0];
            }
            value$jscomp$0 = "" + children$jscomp$2;
          }
          "string" === typeof value$jscomp$0 &&
            "\n" === value$jscomp$0[0] &&
            target$jscomp$0.push("\n");
          null !== value$jscomp$0 &&
            target$jscomp$0.push(escapeTextForBrowser("" + value$jscomp$0));
          return null;
        case "input":
          target$jscomp$0.push(startChunkForTag("input"));
          var name = null,
            formAction = null,
            formEncType = null,
            formMethod = null,
            formTarget = null,
            value$jscomp$1 = null,
            defaultValue$jscomp$0 = null,
            checked = null,
            defaultChecked = null,
            propKey$jscomp$3;
          for (propKey$jscomp$3 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$3)) {
              var propValue$jscomp$3 = props[propKey$jscomp$3];
              if (null != propValue$jscomp$3)
                switch (propKey$jscomp$3) {
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(399, "input"));
                  case "name":
                    name = propValue$jscomp$3;
                    break;
                  case "formAction":
                    formAction = propValue$jscomp$3;
                    break;
                  case "formEncType":
                    formEncType = propValue$jscomp$3;
                    break;
                  case "formMethod":
                    formMethod = propValue$jscomp$3;
                    break;
                  case "formTarget":
                    formTarget = propValue$jscomp$3;
                    break;
                  case "defaultChecked":
                    defaultChecked = propValue$jscomp$3;
                    break;
                  case "defaultValue":
                    defaultValue$jscomp$0 = propValue$jscomp$3;
                    break;
                  case "checked":
                    checked = propValue$jscomp$3;
                    break;
                  case "value":
                    value$jscomp$1 = propValue$jscomp$3;
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$3, propValue$jscomp$3);
                }
            }
          var formData = pushFormActionAttribute(
            target$jscomp$0,
            resumableState,
            renderState,
            formAction,
            formEncType,
            formMethod,
            formTarget,
            name,
          );
          null !== checked
            ? pushBooleanAttribute(target$jscomp$0, "checked", checked)
            : null !== defaultChecked &&
              pushBooleanAttribute(target$jscomp$0, "checked", defaultChecked);
          null !== value$jscomp$1
            ? pushAttribute(target$jscomp$0, "value", value$jscomp$1)
            : null !== defaultValue$jscomp$0 &&
              pushAttribute(target$jscomp$0, "value", defaultValue$jscomp$0);
          target$jscomp$0.push("/>");
          formData?.forEach(pushAdditionalFormField, target$jscomp$0);
          return null;
        case "button":
          target$jscomp$0.push(startChunkForTag("button"));
          var children$jscomp$3 = null,
            innerHTML$jscomp$2 = null,
            name$jscomp$0 = null,
            formAction$jscomp$0 = null,
            formEncType$jscomp$0 = null,
            formMethod$jscomp$0 = null,
            formTarget$jscomp$0 = null,
            propKey$jscomp$4;
          for (propKey$jscomp$4 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$4)) {
              var propValue$jscomp$4 = props[propKey$jscomp$4];
              if (null != propValue$jscomp$4)
                switch (propKey$jscomp$4) {
                  case "children":
                    children$jscomp$3 = propValue$jscomp$4;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$2 = propValue$jscomp$4;
                    break;
                  case "name":
                    name$jscomp$0 = propValue$jscomp$4;
                    break;
                  case "formAction":
                    formAction$jscomp$0 = propValue$jscomp$4;
                    break;
                  case "formEncType":
                    formEncType$jscomp$0 = propValue$jscomp$4;
                    break;
                  case "formMethod":
                    formMethod$jscomp$0 = propValue$jscomp$4;
                    break;
                  case "formTarget":
                    formTarget$jscomp$0 = propValue$jscomp$4;
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$4, propValue$jscomp$4);
                }
            }
          var formData$jscomp$0 = pushFormActionAttribute(
            target$jscomp$0,
            resumableState,
            renderState,
            formAction$jscomp$0,
            formEncType$jscomp$0,
            formMethod$jscomp$0,
            formTarget$jscomp$0,
            name$jscomp$0,
          );
          target$jscomp$0.push(">");
          formData$jscomp$0?.forEach(pushAdditionalFormField, target$jscomp$0);
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$2, children$jscomp$3);
          if ("string" === typeof children$jscomp$3) {
            target$jscomp$0.push(escapeTextForBrowser(children$jscomp$3));
            var JSCompiler_inline_result$jscomp$0 = null;
          } else JSCompiler_inline_result$jscomp$0 = children$jscomp$3;
          return JSCompiler_inline_result$jscomp$0;
        case "form":
          target$jscomp$0.push(startChunkForTag("form"));
          var children$jscomp$4 = null,
            innerHTML$jscomp$3 = null,
            formAction$jscomp$1 = null,
            formEncType$jscomp$1 = null,
            formMethod$jscomp$1 = null,
            formTarget$jscomp$1 = null,
            propKey$jscomp$5;
          for (propKey$jscomp$5 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$5)) {
              var propValue$jscomp$5 = props[propKey$jscomp$5];
              if (null != propValue$jscomp$5)
                switch (propKey$jscomp$5) {
                  case "children":
                    children$jscomp$4 = propValue$jscomp$5;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$3 = propValue$jscomp$5;
                    break;
                  case "action":
                    formAction$jscomp$1 = propValue$jscomp$5;
                    break;
                  case "encType":
                    formEncType$jscomp$1 = propValue$jscomp$5;
                    break;
                  case "method":
                    formMethod$jscomp$1 = propValue$jscomp$5;
                    break;
                  case "target":
                    formTarget$jscomp$1 = propValue$jscomp$5;
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$5, propValue$jscomp$5);
                }
            }
          var formData$jscomp$1 = null,
            formActionName = null;
          if ("function" === typeof formAction$jscomp$1) {
            var customFields = getCustomFormFields(resumableState, formAction$jscomp$1);
            null !== customFields
              ? ((formAction$jscomp$1 = customFields.action || ""),
                (formEncType$jscomp$1 = customFields.encType),
                (formMethod$jscomp$1 = customFields.method),
                (formTarget$jscomp$1 = customFields.target),
                (formData$jscomp$1 = customFields.data),
                (formActionName = customFields.name))
              : (target$jscomp$0.push(" ", "action", '="', actionJavaScriptURL, '"'),
                (formTarget$jscomp$1 =
                  formMethod$jscomp$1 =
                  formEncType$jscomp$1 =
                  formAction$jscomp$1 =
                    null),
                injectFormReplayingRuntime(resumableState, renderState));
          }
          null != formAction$jscomp$1 &&
            pushAttribute(target$jscomp$0, "action", formAction$jscomp$1);
          null != formEncType$jscomp$1 &&
            pushAttribute(target$jscomp$0, "encType", formEncType$jscomp$1);
          null != formMethod$jscomp$1 &&
            pushAttribute(target$jscomp$0, "method", formMethod$jscomp$1);
          null != formTarget$jscomp$1 &&
            pushAttribute(target$jscomp$0, "target", formTarget$jscomp$1);
          target$jscomp$0.push(">");
          null !== formActionName &&
            (target$jscomp$0.push('<input type="hidden"'),
            pushStringAttribute(target$jscomp$0, "name", formActionName),
            target$jscomp$0.push("/>"),
            formData$jscomp$1?.forEach(pushAdditionalFormField, target$jscomp$0));
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$3, children$jscomp$4);
          if ("string" === typeof children$jscomp$4) {
            target$jscomp$0.push(escapeTextForBrowser(children$jscomp$4));
            var JSCompiler_inline_result$jscomp$1 = null;
          } else JSCompiler_inline_result$jscomp$1 = children$jscomp$4;
          return JSCompiler_inline_result$jscomp$1;
        case "menuitem":
          target$jscomp$0.push(startChunkForTag("menuitem"));
          for (var propKey$jscomp$6 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$6)) {
              var propValue$jscomp$6 = props[propKey$jscomp$6];
              if (null != propValue$jscomp$6)
                switch (propKey$jscomp$6) {
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(400));
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$6, propValue$jscomp$6);
                }
            }
          target$jscomp$0.push(">");
          return null;
        case "object":
          target$jscomp$0.push(startChunkForTag("object"));
          var children$jscomp$5 = null,
            innerHTML$jscomp$4 = null,
            propKey$jscomp$7;
          for (propKey$jscomp$7 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$7)) {
              var propValue$jscomp$7 = props[propKey$jscomp$7];
              if (null != propValue$jscomp$7)
                switch (propKey$jscomp$7) {
                  case "children":
                    children$jscomp$5 = propValue$jscomp$7;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$4 = propValue$jscomp$7;
                    break;
                  case "data":
                    var sanitizedValue = sanitizeURL("" + propValue$jscomp$7);
                    if ("" === sanitizedValue) break;
                    target$jscomp$0.push(
                      " ",
                      "data",
                      '="',
                      escapeTextForBrowser(sanitizedValue),
                      '"',
                    );
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$7, propValue$jscomp$7);
                }
            }
          target$jscomp$0.push(">");
          pushInnerHTML(target$jscomp$0, innerHTML$jscomp$4, children$jscomp$5);
          if ("string" === typeof children$jscomp$5) {
            target$jscomp$0.push(escapeTextForBrowser(children$jscomp$5));
            var JSCompiler_inline_result$jscomp$2 = null;
          } else JSCompiler_inline_result$jscomp$2 = children$jscomp$5;
          return JSCompiler_inline_result$jscomp$2;
        case "title":
          var noscriptTagInScope = formatContext.tagScope & 1,
            isFallback = formatContext.tagScope & 4;
          if (4 === formatContext.insertionMode || noscriptTagInScope || null != props.itemProp)
            var JSCompiler_inline_result$jscomp$3 = pushTitleImpl(target$jscomp$0, props);
          else
            isFallback
              ? (JSCompiler_inline_result$jscomp$3 = null)
              : (pushTitleImpl(renderState.hoistableChunks, props),
                (JSCompiler_inline_result$jscomp$3 = void 0));
          return JSCompiler_inline_result$jscomp$3;
        case "link":
          var noscriptTagInScope$jscomp$0 = formatContext.tagScope & 1,
            isFallback$jscomp$0 = formatContext.tagScope & 4,
            rel = props.rel,
            href = props.href,
            precedence = props.precedence;
          if (
            4 === formatContext.insertionMode ||
            noscriptTagInScope$jscomp$0 ||
            null != props.itemProp ||
            "string" !== typeof rel ||
            "string" !== typeof href ||
            "" === href
          ) {
            pushLinkImpl(target$jscomp$0, props);
            var JSCompiler_inline_result$jscomp$4 = null;
          } else if ("stylesheet" === props.rel)
            if (
              "string" !== typeof precedence ||
              null != props.disabled ||
              props.onLoad ||
              props.onError
            )
              JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props);
            else {
              var styleQueue = renderState.styles.get(precedence),
                resourceState = resumableState.styleResources.hasOwnProperty(href)
                  ? resumableState.styleResources[href]
                  : void 0;
              if (null !== resourceState) {
                resumableState.styleResources[href] = null;
                styleQueue ||
                  ((styleQueue = {
                    precedence: escapeTextForBrowser(precedence),
                    rules: [],
                    hrefs: [],
                    sheets: /* @__PURE__ */ new Map(),
                  }),
                  renderState.styles.set(precedence, styleQueue));
                var resource = {
                  state: 0,
                  props: assign({}, props, {
                    "data-precedence": props.precedence,
                    precedence: null,
                  }),
                };
                if (resourceState) {
                  2 === resourceState.length &&
                    adoptPreloadCredentials(resource.props, resourceState);
                  var preloadResource = renderState.preloads.stylesheets.get(href);
                  preloadResource && 0 < preloadResource.length
                    ? (preloadResource.length = 0)
                    : (resource.state = 1);
                }
                styleQueue.sheets.set(href, resource);
                hoistableState && hoistableState.stylesheets.add(resource);
              } else if (styleQueue) {
                var resource$9 = styleQueue.sheets.get(href);
                resource$9 && hoistableState && hoistableState.stylesheets.add(resource$9);
              }
              textEmbedded && target$jscomp$0.push("<!-- -->");
              JSCompiler_inline_result$jscomp$4 = null;
            }
          else
            props.onLoad || props.onError
              ? (JSCompiler_inline_result$jscomp$4 = pushLinkImpl(target$jscomp$0, props))
              : (textEmbedded && target$jscomp$0.push("<!-- -->"),
                (JSCompiler_inline_result$jscomp$4 = isFallback$jscomp$0
                  ? null
                  : pushLinkImpl(renderState.hoistableChunks, props)));
          return JSCompiler_inline_result$jscomp$4;
        case "script":
          var noscriptTagInScope$jscomp$1 = formatContext.tagScope & 1,
            asyncProp = props.async;
          if (
            "string" !== typeof props.src ||
            !props.src ||
            !asyncProp ||
            "function" === typeof asyncProp ||
            "symbol" === typeof asyncProp ||
            props.onLoad ||
            props.onError ||
            4 === formatContext.insertionMode ||
            noscriptTagInScope$jscomp$1 ||
            null != props.itemProp
          )
            var JSCompiler_inline_result$jscomp$5 = pushScriptImpl(target$jscomp$0, props);
          else {
            var key = props.src;
            if ("module" === props.type) {
              var resources = resumableState.moduleScriptResources;
              var preloads = renderState.preloads.moduleScripts;
            } else
              ((resources = resumableState.scriptResources),
                (preloads = renderState.preloads.scripts));
            var resourceState$jscomp$0 = resources.hasOwnProperty(key) ? resources[key] : void 0;
            if (null !== resourceState$jscomp$0) {
              resources[key] = null;
              var scriptProps = props;
              if (resourceState$jscomp$0) {
                2 === resourceState$jscomp$0.length &&
                  ((scriptProps = assign({}, props)),
                  adoptPreloadCredentials(scriptProps, resourceState$jscomp$0));
                var preloadResource$jscomp$0 = preloads.get(key);
                preloadResource$jscomp$0 && (preloadResource$jscomp$0.length = 0);
              }
              var resource$jscomp$0 = [];
              renderState.scripts.add(resource$jscomp$0);
              pushScriptImpl(resource$jscomp$0, scriptProps);
            }
            textEmbedded && target$jscomp$0.push("<!-- -->");
            JSCompiler_inline_result$jscomp$5 = null;
          }
          return JSCompiler_inline_result$jscomp$5;
        case "style":
          var noscriptTagInScope$jscomp$2 = formatContext.tagScope & 1,
            precedence$jscomp$0 = props.precedence,
            href$jscomp$0 = props.href,
            nonce = props.nonce;
          if (
            4 === formatContext.insertionMode ||
            noscriptTagInScope$jscomp$2 ||
            null != props.itemProp ||
            "string" !== typeof precedence$jscomp$0 ||
            "string" !== typeof href$jscomp$0 ||
            "" === href$jscomp$0
          ) {
            target$jscomp$0.push(startChunkForTag("style"));
            var children$jscomp$6 = null,
              innerHTML$jscomp$5 = null,
              propKey$jscomp$8;
            for (propKey$jscomp$8 in props)
              if (hasOwnProperty.call(props, propKey$jscomp$8)) {
                var propValue$jscomp$8 = props[propKey$jscomp$8];
                if (null != propValue$jscomp$8)
                  switch (propKey$jscomp$8) {
                    case "children":
                      children$jscomp$6 = propValue$jscomp$8;
                      break;
                    case "dangerouslySetInnerHTML":
                      innerHTML$jscomp$5 = propValue$jscomp$8;
                      break;
                    default:
                      pushAttribute(target$jscomp$0, propKey$jscomp$8, propValue$jscomp$8);
                  }
              }
            target$jscomp$0.push(">");
            var child = Array.isArray(children$jscomp$6)
              ? 2 > children$jscomp$6.length
                ? children$jscomp$6[0]
                : null
              : children$jscomp$6;
            "function" !== typeof child &&
              "symbol" !== typeof child &&
              null !== child &&
              void 0 !== child &&
              target$jscomp$0.push(("" + child).replace(styleRegex, styleReplacer));
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$5, children$jscomp$6);
            target$jscomp$0.push(endChunkForTag("style"));
            var JSCompiler_inline_result$jscomp$6 = null;
          } else {
            var styleQueue$jscomp$0 = renderState.styles.get(precedence$jscomp$0);
            if (
              null !==
              (resumableState.styleResources.hasOwnProperty(href$jscomp$0)
                ? resumableState.styleResources[href$jscomp$0]
                : void 0)
            ) {
              resumableState.styleResources[href$jscomp$0] = null;
              styleQueue$jscomp$0 ||
                ((styleQueue$jscomp$0 = {
                  precedence: escapeTextForBrowser(precedence$jscomp$0),
                  rules: [],
                  hrefs: [],
                  sheets: /* @__PURE__ */ new Map(),
                }),
                renderState.styles.set(precedence$jscomp$0, styleQueue$jscomp$0));
              var nonceStyle = renderState.nonce.style;
              if (!nonceStyle || nonceStyle === nonce) {
                styleQueue$jscomp$0.hrefs.push(escapeTextForBrowser(href$jscomp$0));
                var target = styleQueue$jscomp$0.rules,
                  children$jscomp$7 = null,
                  innerHTML$jscomp$6 = null,
                  propKey$jscomp$9;
                for (propKey$jscomp$9 in props)
                  if (hasOwnProperty.call(props, propKey$jscomp$9)) {
                    var propValue$jscomp$9 = props[propKey$jscomp$9];
                    if (null != propValue$jscomp$9)
                      switch (propKey$jscomp$9) {
                        case "children":
                          children$jscomp$7 = propValue$jscomp$9;
                          break;
                        case "dangerouslySetInnerHTML":
                          innerHTML$jscomp$6 = propValue$jscomp$9;
                      }
                  }
                var child$jscomp$0 = Array.isArray(children$jscomp$7)
                  ? 2 > children$jscomp$7.length
                    ? children$jscomp$7[0]
                    : null
                  : children$jscomp$7;
                "function" !== typeof child$jscomp$0 &&
                  "symbol" !== typeof child$jscomp$0 &&
                  null !== child$jscomp$0 &&
                  void 0 !== child$jscomp$0 &&
                  target.push(("" + child$jscomp$0).replace(styleRegex, styleReplacer));
                pushInnerHTML(target, innerHTML$jscomp$6, children$jscomp$7);
              }
            }
            styleQueue$jscomp$0 && hoistableState && hoistableState.styles.add(styleQueue$jscomp$0);
            textEmbedded && target$jscomp$0.push("<!-- -->");
            JSCompiler_inline_result$jscomp$6 = void 0;
          }
          return JSCompiler_inline_result$jscomp$6;
        case "meta":
          var noscriptTagInScope$jscomp$3 = formatContext.tagScope & 1,
            isFallback$jscomp$1 = formatContext.tagScope & 4;
          if (
            4 === formatContext.insertionMode ||
            noscriptTagInScope$jscomp$3 ||
            null != props.itemProp
          )
            var JSCompiler_inline_result$jscomp$7 = pushSelfClosing(target$jscomp$0, props, "meta");
          else
            (textEmbedded && target$jscomp$0.push("<!-- -->"),
              (JSCompiler_inline_result$jscomp$7 = isFallback$jscomp$1
                ? null
                : "string" === typeof props.charSet
                  ? pushSelfClosing(renderState.charsetChunks, props, "meta")
                  : "viewport" === props.name
                    ? pushSelfClosing(renderState.viewportChunks, props, "meta")
                    : pushSelfClosing(renderState.hoistableChunks, props, "meta")));
          return JSCompiler_inline_result$jscomp$7;
        case "listing":
        case "pre":
          target$jscomp$0.push(startChunkForTag(type));
          var children$jscomp$8 = null,
            innerHTML$jscomp$7 = null,
            propKey$jscomp$10;
          for (propKey$jscomp$10 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$10)) {
              var propValue$jscomp$10 = props[propKey$jscomp$10];
              if (null != propValue$jscomp$10)
                switch (propKey$jscomp$10) {
                  case "children":
                    children$jscomp$8 = propValue$jscomp$10;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$7 = propValue$jscomp$10;
                    break;
                  default:
                    pushAttribute(target$jscomp$0, propKey$jscomp$10, propValue$jscomp$10);
                }
            }
          target$jscomp$0.push(">");
          if (null != innerHTML$jscomp$7) {
            if (null != children$jscomp$8) throw Error(formatProdErrorMessage(60));
            if ("object" !== typeof innerHTML$jscomp$7 || !("__html" in innerHTML$jscomp$7))
              throw Error(formatProdErrorMessage(61));
            var html = innerHTML$jscomp$7.__html;
            null !== html &&
              void 0 !== html &&
              ("string" === typeof html && 0 < html.length && "\n" === html[0]
                ? target$jscomp$0.push("\n", html)
                : target$jscomp$0.push("" + html));
          }
          "string" === typeof children$jscomp$8 &&
            "\n" === children$jscomp$8[0] &&
            target$jscomp$0.push("\n");
          return children$jscomp$8;
        case "img":
          var pictureOrNoScriptTagInScope = formatContext.tagScope & 3,
            src = props.src,
            srcSet = props.srcSet;
          if (
            !(
              "lazy" === props.loading ||
              (!src && !srcSet) ||
              ("string" !== typeof src && null != src) ||
              ("string" !== typeof srcSet && null != srcSet) ||
              "low" === props.fetchPriority ||
              pictureOrNoScriptTagInScope
            ) &&
            ("string" !== typeof src ||
              ":" !== src[4] ||
              ("d" !== src[0] && "D" !== src[0]) ||
              ("a" !== src[1] && "A" !== src[1]) ||
              ("t" !== src[2] && "T" !== src[2]) ||
              ("a" !== src[3] && "A" !== src[3])) &&
            ("string" !== typeof srcSet ||
              ":" !== srcSet[4] ||
              ("d" !== srcSet[0] && "D" !== srcSet[0]) ||
              ("a" !== srcSet[1] && "A" !== srcSet[1]) ||
              ("t" !== srcSet[2] && "T" !== srcSet[2]) ||
              ("a" !== srcSet[3] && "A" !== srcSet[3]))
          ) {
            null !== hoistableState &&
              formatContext.tagScope & 64 &&
              (hoistableState.suspenseyImages = !0);
            var sizes = "string" === typeof props.sizes ? props.sizes : void 0,
              key$jscomp$0 = srcSet ? srcSet + "\n" + (sizes || "") : src,
              promotablePreloads = renderState.preloads.images,
              resource$jscomp$1 = promotablePreloads.get(key$jscomp$0);
            if (resource$jscomp$1) {
              if ("high" === props.fetchPriority || 10 > renderState.highImagePreloads.size)
                (promotablePreloads.delete(key$jscomp$0),
                  renderState.highImagePreloads.add(resource$jscomp$1));
            } else if (!resumableState.imageResources.hasOwnProperty(key$jscomp$0)) {
              resumableState.imageResources[key$jscomp$0] = PRELOAD_NO_CREDS;
              var input = props.crossOrigin;
              var JSCompiler_inline_result$jscomp$8 =
                "string" === typeof input ? ("use-credentials" === input ? input : "") : void 0;
              var headers = renderState.headers,
                header;
              headers &&
              0 < headers.remainingCapacity &&
              "string" !== typeof props.srcSet &&
              ("high" === props.fetchPriority || 500 > headers.highImagePreloads.length) &&
              ((header = getPreloadAsHeader(src, "image", {
                imageSrcSet: props.srcSet,
                imageSizes: props.sizes,
                crossOrigin: JSCompiler_inline_result$jscomp$8,
                integrity: props.integrity,
                nonce: props.nonce,
                type: props.type,
                fetchPriority: props.fetchPriority,
                referrerPolicy: props.refererPolicy,
              })),
              0 <= (headers.remainingCapacity -= header.length + 2))
                ? ((renderState.resets.image[key$jscomp$0] = PRELOAD_NO_CREDS),
                  headers.highImagePreloads && (headers.highImagePreloads += ", "),
                  (headers.highImagePreloads += header))
                : ((resource$jscomp$1 = []),
                  pushLinkImpl(resource$jscomp$1, {
                    rel: "preload",
                    as: "image",
                    href: srcSet ? void 0 : src,
                    imageSrcSet: srcSet,
                    imageSizes: sizes,
                    crossOrigin: JSCompiler_inline_result$jscomp$8,
                    integrity: props.integrity,
                    type: props.type,
                    fetchPriority: props.fetchPriority,
                    referrerPolicy: props.referrerPolicy,
                  }),
                  "high" === props.fetchPriority || 10 > renderState.highImagePreloads.size
                    ? renderState.highImagePreloads.add(resource$jscomp$1)
                    : (renderState.bulkPreloads.add(resource$jscomp$1),
                      promotablePreloads.set(key$jscomp$0, resource$jscomp$1)));
            }
          }
          return pushSelfClosing(target$jscomp$0, props, "img");
        case "base":
        case "area":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "param":
        case "source":
        case "track":
        case "wbr":
          return pushSelfClosing(target$jscomp$0, props, type);
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          break;
        case "head":
          if (2 > formatContext.insertionMode) {
            var preamble = preambleState || renderState.preamble;
            if (preamble.headChunks) throw Error(formatProdErrorMessage(545, "`<head>`"));
            null !== preambleState && target$jscomp$0.push("<!--head-->");
            preamble.headChunks = [];
            var JSCompiler_inline_result$jscomp$9 = pushStartSingletonElement(
              preamble.headChunks,
              props,
              "head",
            );
          } else
            JSCompiler_inline_result$jscomp$9 = pushStartGenericElement(
              target$jscomp$0,
              props,
              "head",
            );
          return JSCompiler_inline_result$jscomp$9;
        case "body":
          if (2 > formatContext.insertionMode) {
            var preamble$jscomp$0 = preambleState || renderState.preamble;
            if (preamble$jscomp$0.bodyChunks) throw Error(formatProdErrorMessage(545, "`<body>`"));
            null !== preambleState && target$jscomp$0.push("<!--body-->");
            preamble$jscomp$0.bodyChunks = [];
            var JSCompiler_inline_result$jscomp$10 = pushStartSingletonElement(
              preamble$jscomp$0.bodyChunks,
              props,
              "body",
            );
          } else
            JSCompiler_inline_result$jscomp$10 = pushStartGenericElement(
              target$jscomp$0,
              props,
              "body",
            );
          return JSCompiler_inline_result$jscomp$10;
        case "html":
          if (0 === formatContext.insertionMode) {
            var preamble$jscomp$1 = preambleState || renderState.preamble;
            if (preamble$jscomp$1.htmlChunks) throw Error(formatProdErrorMessage(545, "`<html>`"));
            null !== preambleState && target$jscomp$0.push("<!--html-->");
            preamble$jscomp$1.htmlChunks = [""];
            var JSCompiler_inline_result$jscomp$11 = pushStartSingletonElement(
              preamble$jscomp$1.htmlChunks,
              props,
              "html",
            );
          } else
            JSCompiler_inline_result$jscomp$11 = pushStartGenericElement(
              target$jscomp$0,
              props,
              "html",
            );
          return JSCompiler_inline_result$jscomp$11;
        default:
          if (-1 !== type.indexOf("-")) {
            target$jscomp$0.push(startChunkForTag(type));
            var children$jscomp$9 = null,
              innerHTML$jscomp$8 = null,
              propKey$jscomp$11;
            for (propKey$jscomp$11 in props)
              if (hasOwnProperty.call(props, propKey$jscomp$11)) {
                var propValue$jscomp$11 = props[propKey$jscomp$11];
                if (null != propValue$jscomp$11) {
                  var attributeName = propKey$jscomp$11;
                  switch (propKey$jscomp$11) {
                    case "children":
                      children$jscomp$9 = propValue$jscomp$11;
                      break;
                    case "dangerouslySetInnerHTML":
                      innerHTML$jscomp$8 = propValue$jscomp$11;
                      break;
                    case "style":
                      pushStyleAttribute(target$jscomp$0, propValue$jscomp$11);
                      break;
                    case "suppressContentEditableWarning":
                    case "suppressHydrationWarning":
                    case "ref":
                      break;
                    case "className":
                      attributeName = "class";
                    default:
                      if (
                        isAttributeNameSafe(propKey$jscomp$11) &&
                        "function" !== typeof propValue$jscomp$11 &&
                        "symbol" !== typeof propValue$jscomp$11 &&
                        !1 !== propValue$jscomp$11
                      ) {
                        if (!0 === propValue$jscomp$11) propValue$jscomp$11 = "";
                        else if ("object" === typeof propValue$jscomp$11) continue;
                        target$jscomp$0.push(
                          " ",
                          attributeName,
                          '="',
                          escapeTextForBrowser(propValue$jscomp$11),
                          '"',
                        );
                      }
                  }
                }
              }
            target$jscomp$0.push(">");
            pushInnerHTML(target$jscomp$0, innerHTML$jscomp$8, children$jscomp$9);
            return children$jscomp$9;
          }
      }
      return pushStartGenericElement(target$jscomp$0, props, type);
    }
    var endTagCache = /* @__PURE__ */ new Map();
    function endChunkForTag(tag) {
      var chunk = endTagCache.get(tag);
      void 0 === chunk && ((chunk = "</" + tag + ">"), endTagCache.set(tag, chunk));
      return chunk;
    }
    function hoistPreambleState(renderState, preambleState) {
      renderState = renderState.preamble;
      null === renderState.htmlChunks &&
        preambleState.htmlChunks &&
        (renderState.htmlChunks = preambleState.htmlChunks);
      null === renderState.headChunks &&
        preambleState.headChunks &&
        (renderState.headChunks = preambleState.headChunks);
      null === renderState.bodyChunks &&
        preambleState.bodyChunks &&
        (renderState.bodyChunks = preambleState.bodyChunks);
    }
    function writeBootstrap(destination, renderState) {
      renderState = renderState.bootstrapChunks;
      for (var i = 0; i < renderState.length - 1; i++) destination.push(renderState[i]);
      return i < renderState.length
        ? ((i = renderState[i]), (renderState.length = 0), destination.push(i))
        : !0;
    }
    function writeStartPendingSuspenseBoundary(destination, renderState, id) {
      destination.push('<!--$?--><template id="');
      if (null === id) throw Error(formatProdErrorMessage(395));
      destination.push(renderState.boundaryPrefix);
      renderState = id.toString(16);
      destination.push(renderState);
      return destination.push('"></template>');
    }
    function writeStartSegment(destination, renderState, formatContext, id) {
      switch (formatContext.insertionMode) {
        case 0:
        case 1:
        case 3:
        case 2:
          return (
            destination.push('<div hidden id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        case 4:
          return (
            destination.push('<svg aria-hidden="true" style="display:none" id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        case 5:
          return (
            destination.push('<math aria-hidden="true" style="display:none" id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        case 6:
          return (
            destination.push('<table hidden id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        case 7:
          return (
            destination.push('<table hidden><tbody id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        case 8:
          return (
            destination.push('<table hidden><tr id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        case 9:
          return (
            destination.push('<table hidden><colgroup id="'),
            destination.push(renderState.segmentPrefix),
            (renderState = id.toString(16)),
            destination.push(renderState),
            destination.push('">')
          );
        default:
          throw Error(formatProdErrorMessage(397));
      }
    }
    function writeEndSegment(destination, formatContext) {
      switch (formatContext.insertionMode) {
        case 0:
        case 1:
        case 3:
        case 2:
          return destination.push("</div>");
        case 4:
          return destination.push("</svg>");
        case 5:
          return destination.push("</math>");
        case 6:
          return destination.push("</table>");
        case 7:
          return destination.push("</tbody></table>");
        case 8:
          return destination.push("</tr></table>");
        case 9:
          return destination.push("</colgroup></table>");
        default:
          throw Error(formatProdErrorMessage(397));
      }
    }
    var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
    function escapeJSStringsForInstructionScripts(input) {
      return JSON.stringify(input).replace(regexForJSStringsInInstructionScripts, function (match) {
        switch (match) {
          case "<":
            return "\\u003c";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw Error(
              "escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
            );
        }
      });
    }
    var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
    function escapeJSObjectForInstructionScripts(input) {
      return JSON.stringify(input).replace(regexForJSStringsInScripts, function (match) {
        switch (match) {
          case "&":
            return "\\u0026";
          case ">":
            return "\\u003e";
          case "<":
            return "\\u003c";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw Error(
              "escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
            );
        }
      });
    }
    var currentlyRenderingBoundaryHasStylesToHoist = !1,
      destinationHasCapacity = !0;
    function flushStyleTagsLateForBoundary(styleQueue) {
      var rules = styleQueue.rules,
        hrefs = styleQueue.hrefs,
        i = 0;
      if (hrefs.length) {
        this.push(currentlyFlushingRenderState.startInlineStyle);
        this.push(' media="not all" data-precedence="');
        this.push(styleQueue.precedence);
        for (this.push('" data-href="'); i < hrefs.length - 1; i++)
          (this.push(hrefs[i]), this.push(" "));
        this.push(hrefs[i]);
        this.push('">');
        for (i = 0; i < rules.length; i++) this.push(rules[i]);
        destinationHasCapacity = this.push("</style>");
        currentlyRenderingBoundaryHasStylesToHoist = !0;
        rules.length = 0;
        hrefs.length = 0;
      }
    }
    function hasStylesToHoist(stylesheet) {
      return 2 !== stylesheet.state ? (currentlyRenderingBoundaryHasStylesToHoist = !0) : !1;
    }
    function writeHoistablesForBoundary(destination, hoistableState, renderState) {
      currentlyRenderingBoundaryHasStylesToHoist = !1;
      destinationHasCapacity = !0;
      currentlyFlushingRenderState = renderState;
      hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
      currentlyFlushingRenderState = null;
      hoistableState.stylesheets.forEach(hasStylesToHoist);
      currentlyRenderingBoundaryHasStylesToHoist && (renderState.stylesToHoist = !0);
      return destinationHasCapacity;
    }
    function flushResource(resource) {
      for (var i = 0; i < resource.length; i++) this.push(resource[i]);
      resource.length = 0;
    }
    var stylesheetFlushingQueue = [];
    function flushStyleInPreamble(stylesheet) {
      pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
      for (var i = 0; i < stylesheetFlushingQueue.length; i++)
        this.push(stylesheetFlushingQueue[i]);
      stylesheetFlushingQueue.length = 0;
      stylesheet.state = 2;
    }
    function flushStylesInPreamble(styleQueue) {
      var hasStylesheets = 0 < styleQueue.sheets.size;
      styleQueue.sheets.forEach(flushStyleInPreamble, this);
      styleQueue.sheets.clear();
      var rules = styleQueue.rules,
        hrefs = styleQueue.hrefs;
      if (!hasStylesheets || hrefs.length) {
        this.push(currentlyFlushingRenderState.startInlineStyle);
        this.push(' data-precedence="');
        this.push(styleQueue.precedence);
        styleQueue = 0;
        if (hrefs.length) {
          for (this.push('" data-href="'); styleQueue < hrefs.length - 1; styleQueue++)
            (this.push(hrefs[styleQueue]), this.push(" "));
          this.push(hrefs[styleQueue]);
        }
        this.push('">');
        for (styleQueue = 0; styleQueue < rules.length; styleQueue++) this.push(rules[styleQueue]);
        this.push("</style>");
        rules.length = 0;
        hrefs.length = 0;
      }
    }
    function preloadLateStyle(stylesheet) {
      if (0 === stylesheet.state) {
        stylesheet.state = 1;
        var props = stylesheet.props;
        pushLinkImpl(stylesheetFlushingQueue, {
          rel: "preload",
          as: "style",
          href: stylesheet.props.href,
          crossOrigin: props.crossOrigin,
          fetchPriority: props.fetchPriority,
          integrity: props.integrity,
          media: props.media,
          hrefLang: props.hrefLang,
          referrerPolicy: props.referrerPolicy,
        });
        for (stylesheet = 0; stylesheet < stylesheetFlushingQueue.length; stylesheet++)
          this.push(stylesheetFlushingQueue[stylesheet]);
        stylesheetFlushingQueue.length = 0;
      }
    }
    function preloadLateStyles(styleQueue) {
      styleQueue.sheets.forEach(preloadLateStyle, this);
      styleQueue.sheets.clear();
    }
    function pushCompletedShellIdAttribute(target, resumableState) {
      0 === (resumableState.instructions & 32) &&
        ((resumableState.instructions |= 32),
        target.push(' id="', escapeTextForBrowser("_" + resumableState.idPrefix + "R_"), '"'));
    }
    function writeStyleResourceDependenciesInJS(destination, hoistableState) {
      destination.push("[");
      var nextArrayOpenBrackChunk = "[";
      hoistableState.stylesheets.forEach(function (resource) {
        if (2 !== resource.state)
          if (3 === resource.state)
            (destination.push(nextArrayOpenBrackChunk),
              (resource = escapeJSObjectForInstructionScripts("" + resource.props.href)),
              destination.push(resource),
              destination.push("]"),
              (nextArrayOpenBrackChunk = ",["));
          else {
            destination.push(nextArrayOpenBrackChunk);
            var precedence = resource.props["data-precedence"],
              props = resource.props,
              coercedHref = sanitizeURL("" + resource.props.href);
            coercedHref = escapeJSObjectForInstructionScripts(coercedHref);
            destination.push(coercedHref);
            precedence = "" + precedence;
            destination.push(",");
            precedence = escapeJSObjectForInstructionScripts(precedence);
            destination.push(precedence);
            for (var propKey in props)
              if (
                hasOwnProperty.call(props, propKey) &&
                ((precedence = props[propKey]), null != precedence)
              )
                switch (propKey) {
                  case "href":
                  case "rel":
                  case "precedence":
                  case "data-precedence":
                    break;
                  case "children":
                  case "dangerouslySetInnerHTML":
                    throw Error(formatProdErrorMessage(399, "link"));
                  default:
                    writeStyleResourceAttributeInJS(destination, propKey, precedence);
                }
            destination.push("]");
            nextArrayOpenBrackChunk = ",[";
            resource.state = 3;
          }
      });
      destination.push("]");
    }
    function writeStyleResourceAttributeInJS(destination, name, value) {
      var attributeName = name.toLowerCase();
      switch (typeof value) {
        case "function":
        case "symbol":
          return;
      }
      switch (name) {
        case "innerHTML":
        case "dangerouslySetInnerHTML":
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "style":
        case "ref":
          return;
        case "className":
          attributeName = "class";
          name = "" + value;
          break;
        case "hidden":
          if (!1 === value) return;
          name = "";
          break;
        case "src":
        case "href":
          value = sanitizeURL(value);
          name = "" + value;
          break;
        default:
          if (
            (2 < name.length &&
              ("o" === name[0] || "O" === name[0]) &&
              ("n" === name[1] || "N" === name[1])) ||
            !isAttributeNameSafe(name)
          )
            return;
          name = "" + value;
      }
      destination.push(",");
      attributeName = escapeJSObjectForInstructionScripts(attributeName);
      destination.push(attributeName);
      destination.push(",");
      attributeName = escapeJSObjectForInstructionScripts(name);
      destination.push(attributeName);
    }
    function createHoistableState() {
      return {
        styles: /* @__PURE__ */ new Set(),
        stylesheets: /* @__PURE__ */ new Set(),
        suspenseyImages: !1,
      };
    }
    function prefetchDNS(href) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if ("string" === typeof href && href) {
          if (!resumableState.dnsResources.hasOwnProperty(href)) {
            resumableState.dnsResources[href] = null;
            resumableState = renderState.headers;
            var header, JSCompiler_temp;
            if ((JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity))
              JSCompiler_temp =
                ((header =
                  "<" +
                  ("" + href).replace(
                    regexForHrefInLinkHeaderURLContext,
                    escapeHrefForLinkHeaderURLContextReplacer,
                  ) +
                  ">; rel=dns-prefetch"),
                0 <= (resumableState.remainingCapacity -= header.length + 2));
            JSCompiler_temp
              ? ((renderState.resets.dns[href] = null),
                resumableState.preconnects && (resumableState.preconnects += ", "),
                (resumableState.preconnects += header))
              : ((header = []),
                pushLinkImpl(header, {
                  href,
                  rel: "dns-prefetch",
                }),
                renderState.preconnects.add(header));
          }
          enqueueFlush(request);
        }
      } else previousDispatcher.D(href);
    }
    function preconnect(href, crossOrigin) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if ("string" === typeof href && href) {
          var bucket =
            "use-credentials" === crossOrigin
              ? "credentials"
              : "string" === typeof crossOrigin
                ? "anonymous"
                : "default";
          if (!resumableState.connectResources[bucket].hasOwnProperty(href)) {
            resumableState.connectResources[bucket][href] = null;
            resumableState = renderState.headers;
            var header, JSCompiler_temp;
            if ((JSCompiler_temp = resumableState && 0 < resumableState.remainingCapacity)) {
              JSCompiler_temp =
                "<" +
                ("" + href).replace(
                  regexForHrefInLinkHeaderURLContext,
                  escapeHrefForLinkHeaderURLContextReplacer,
                ) +
                ">; rel=preconnect";
              if ("string" === typeof crossOrigin) {
                var escapedCrossOrigin = ("" + crossOrigin).replace(
                  regexForLinkHeaderQuotedParamValueContext,
                  escapeStringForLinkHeaderQuotedParamValueContextReplacer,
                );
                JSCompiler_temp += '; crossorigin="' + escapedCrossOrigin + '"';
              }
              JSCompiler_temp =
                ((header = JSCompiler_temp),
                0 <= (resumableState.remainingCapacity -= header.length + 2));
            }
            JSCompiler_temp
              ? ((renderState.resets.connect[bucket][href] = null),
                resumableState.preconnects && (resumableState.preconnects += ", "),
                (resumableState.preconnects += header))
              : ((bucket = []),
                pushLinkImpl(bucket, {
                  rel: "preconnect",
                  href,
                  crossOrigin,
                }),
                renderState.preconnects.add(bucket));
          }
          enqueueFlush(request);
        }
      } else previousDispatcher.C(href, crossOrigin);
    }
    function preload(href, as, options) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if (as && href) {
          switch (as) {
            case "image":
              if (options) {
                var imageSrcSet = options.imageSrcSet;
                var imageSizes = options.imageSizes;
                var fetchPriority = options.fetchPriority;
              }
              var key = imageSrcSet ? imageSrcSet + "\n" + (imageSizes || "") : href;
              if (resumableState.imageResources.hasOwnProperty(key)) return;
              resumableState.imageResources[key] = PRELOAD_NO_CREDS;
              resumableState = renderState.headers;
              var header;
              resumableState &&
              0 < resumableState.remainingCapacity &&
              "string" !== typeof imageSrcSet &&
              "high" === fetchPriority &&
              ((header = getPreloadAsHeader(href, as, options)),
              0 <= (resumableState.remainingCapacity -= header.length + 2))
                ? ((renderState.resets.image[key] = PRELOAD_NO_CREDS),
                  resumableState.highImagePreloads && (resumableState.highImagePreloads += ", "),
                  (resumableState.highImagePreloads += header))
                : ((resumableState = []),
                  pushLinkImpl(
                    resumableState,
                    assign(
                      {
                        rel: "preload",
                        href: imageSrcSet ? void 0 : href,
                        as,
                      },
                      options,
                    ),
                  ),
                  "high" === fetchPriority
                    ? renderState.highImagePreloads.add(resumableState)
                    : (renderState.bulkPreloads.add(resumableState),
                      renderState.preloads.images.set(key, resumableState)));
              break;
            case "style":
              if (resumableState.styleResources.hasOwnProperty(href)) return;
              imageSrcSet = [];
              pushLinkImpl(
                imageSrcSet,
                assign(
                  {
                    rel: "preload",
                    href,
                    as,
                  },
                  options,
                ),
              );
              resumableState.styleResources[href] =
                !options ||
                ("string" !== typeof options.crossOrigin && "string" !== typeof options.integrity)
                  ? PRELOAD_NO_CREDS
                  : [options.crossOrigin, options.integrity];
              renderState.preloads.stylesheets.set(href, imageSrcSet);
              renderState.bulkPreloads.add(imageSrcSet);
              break;
            case "script":
              if (resumableState.scriptResources.hasOwnProperty(href)) return;
              imageSrcSet = [];
              renderState.preloads.scripts.set(href, imageSrcSet);
              renderState.bulkPreloads.add(imageSrcSet);
              pushLinkImpl(
                imageSrcSet,
                assign(
                  {
                    rel: "preload",
                    href,
                    as,
                  },
                  options,
                ),
              );
              resumableState.scriptResources[href] =
                !options ||
                ("string" !== typeof options.crossOrigin && "string" !== typeof options.integrity)
                  ? PRELOAD_NO_CREDS
                  : [options.crossOrigin, options.integrity];
              break;
            default:
              if (resumableState.unknownResources.hasOwnProperty(as)) {
                if (
                  ((imageSrcSet = resumableState.unknownResources[as]),
                  imageSrcSet.hasOwnProperty(href))
                )
                  return;
              } else ((imageSrcSet = {}), (resumableState.unknownResources[as] = imageSrcSet));
              imageSrcSet[href] = PRELOAD_NO_CREDS;
              if (
                (resumableState = renderState.headers) &&
                0 < resumableState.remainingCapacity &&
                "font" === as &&
                ((key = getPreloadAsHeader(href, as, options)),
                0 <= (resumableState.remainingCapacity -= key.length + 2))
              )
                ((renderState.resets.font[href] = PRELOAD_NO_CREDS),
                  resumableState.fontPreloads && (resumableState.fontPreloads += ", "),
                  (resumableState.fontPreloads += key));
              else
                switch (
                  ((resumableState = []),
                  (href = assign(
                    {
                      rel: "preload",
                      href,
                      as,
                    },
                    options,
                  )),
                  pushLinkImpl(resumableState, href),
                  as)
                ) {
                  case "font":
                    renderState.fontPreloads.add(resumableState);
                    break;
                  default:
                    renderState.bulkPreloads.add(resumableState);
                }
          }
          enqueueFlush(request);
        }
      } else previousDispatcher.L(href, as, options);
    }
    function preloadModule(href, options) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if (href) {
          var as = options && "string" === typeof options.as ? options.as : "script";
          switch (as) {
            case "script":
              if (resumableState.moduleScriptResources.hasOwnProperty(href)) return;
              as = [];
              resumableState.moduleScriptResources[href] =
                !options ||
                ("string" !== typeof options.crossOrigin && "string" !== typeof options.integrity)
                  ? PRELOAD_NO_CREDS
                  : [options.crossOrigin, options.integrity];
              renderState.preloads.moduleScripts.set(href, as);
              break;
            default:
              if (resumableState.moduleUnknownResources.hasOwnProperty(as)) {
                var resources = resumableState.unknownResources[as];
                if (resources.hasOwnProperty(href)) return;
              } else ((resources = {}), (resumableState.moduleUnknownResources[as] = resources));
              as = [];
              resources[href] = PRELOAD_NO_CREDS;
          }
          pushLinkImpl(
            as,
            assign(
              {
                rel: "modulepreload",
                href,
              },
              options,
            ),
          );
          renderState.bulkPreloads.add(as);
          enqueueFlush(request);
        }
      } else previousDispatcher.m(href, options);
    }
    function preinitStyle(href, precedence, options) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if (href) {
          precedence = precedence || "default";
          var styleQueue = renderState.styles.get(precedence),
            resourceState = resumableState.styleResources.hasOwnProperty(href)
              ? resumableState.styleResources[href]
              : void 0;
          null !== resourceState &&
            ((resumableState.styleResources[href] = null),
            styleQueue ||
              ((styleQueue = {
                precedence: escapeTextForBrowser(precedence),
                rules: [],
                hrefs: [],
                sheets: /* @__PURE__ */ new Map(),
              }),
              renderState.styles.set(precedence, styleQueue)),
            (precedence = {
              state: 0,
              props: assign(
                {
                  rel: "stylesheet",
                  href,
                  "data-precedence": precedence,
                },
                options,
              ),
            }),
            resourceState &&
              (2 === resourceState.length &&
                adoptPreloadCredentials(precedence.props, resourceState),
              (renderState = renderState.preloads.stylesheets.get(href)) && 0 < renderState.length
                ? (renderState.length = 0)
                : (precedence.state = 1)),
            styleQueue.sheets.set(href, precedence),
            enqueueFlush(request));
        }
      } else previousDispatcher.S(href, precedence, options);
    }
    function preinitScript(src, options) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if (src) {
          var resourceState = resumableState.scriptResources.hasOwnProperty(src)
            ? resumableState.scriptResources[src]
            : void 0;
          null !== resourceState &&
            ((resumableState.scriptResources[src] = null),
            (options = assign(
              {
                src,
                async: !0,
              },
              options,
            )),
            resourceState &&
              (2 === resourceState.length && adoptPreloadCredentials(options, resourceState),
              (src = renderState.preloads.scripts.get(src))) &&
              (src.length = 0),
            (src = []),
            renderState.scripts.add(src),
            pushScriptImpl(src, options),
            enqueueFlush(request));
        }
      } else previousDispatcher.X(src, options);
    }
    function preinitModuleScript(src, options) {
      var request = currentRequest ? currentRequest : null;
      if (request) {
        var resumableState = request.resumableState,
          renderState = request.renderState;
        if (src) {
          var resourceState = resumableState.moduleScriptResources.hasOwnProperty(src)
            ? resumableState.moduleScriptResources[src]
            : void 0;
          null !== resourceState &&
            ((resumableState.moduleScriptResources[src] = null),
            (options = assign(
              {
                src,
                type: "module",
                async: !0,
              },
              options,
            )),
            resourceState &&
              (2 === resourceState.length && adoptPreloadCredentials(options, resourceState),
              (src = renderState.preloads.moduleScripts.get(src))) &&
              (src.length = 0),
            (src = []),
            renderState.scripts.add(src),
            pushScriptImpl(src, options),
            enqueueFlush(request));
        }
      } else previousDispatcher.M(src, options);
    }
    function adoptPreloadCredentials(target, preloadState) {
      target.crossOrigin ??= preloadState[0];
      target.integrity ??= preloadState[1];
    }
    function getPreloadAsHeader(href, as, params) {
      href = ("" + href).replace(
        regexForHrefInLinkHeaderURLContext,
        escapeHrefForLinkHeaderURLContextReplacer,
      );
      as = ("" + as).replace(
        regexForLinkHeaderQuotedParamValueContext,
        escapeStringForLinkHeaderQuotedParamValueContextReplacer,
      );
      as = "<" + href + '>; rel=preload; as="' + as + '"';
      for (var paramName in params)
        hasOwnProperty.call(params, paramName) &&
          ((href = params[paramName]),
          "string" === typeof href &&
            (as +=
              "; " +
              paramName.toLowerCase() +
              '="' +
              ("" + href).replace(
                regexForLinkHeaderQuotedParamValueContext,
                escapeStringForLinkHeaderQuotedParamValueContextReplacer,
              ) +
              '"'));
      return as;
    }
    var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
    function escapeHrefForLinkHeaderURLContextReplacer(match) {
      switch (match) {
        case "<":
          return "%3C";
        case ">":
          return "%3E";
        case "\n":
          return "%0A";
        case "\r":
          return "%0D";
        default:
          throw Error(
            "escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
          );
      }
    }
    var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
    function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
      switch (match) {
        case '"':
          return "%22";
        case "'":
          return "%27";
        case ";":
          return "%3B";
        case ",":
          return "%2C";
        case "\n":
          return "%0A";
        case "\r":
          return "%0D";
        default:
          throw Error(
            "escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React",
          );
      }
    }
    function hoistStyleQueueDependency(styleQueue) {
      this.styles.add(styleQueue);
    }
    function hoistStylesheetDependency(stylesheet) {
      this.stylesheets.add(stylesheet);
    }
    function hoistHoistables(parentState, childState) {
      childState.styles.forEach(hoistStyleQueueDependency, parentState);
      childState.stylesheets.forEach(hoistStylesheetDependency, parentState);
      childState.suspenseyImages && (parentState.suspenseyImages = !0);
    }
    function createRenderState(resumableState, generateStaticMarkup) {
      var idPrefix = resumableState.idPrefix,
        bootstrapChunks = [],
        bootstrapScriptContent = resumableState.bootstrapScriptContent,
        bootstrapScripts = resumableState.bootstrapScripts,
        bootstrapModules = resumableState.bootstrapModules;
      void 0 !== bootstrapScriptContent &&
        (bootstrapChunks.push("<script"),
        pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
        bootstrapChunks.push(
          ">",
          ("" + bootstrapScriptContent).replace(scriptRegex, scriptReplacer),
          "<\/script>",
        ));
      bootstrapScriptContent = idPrefix + "P:";
      var JSCompiler_object_inline_segmentPrefix_1673 = idPrefix + "S:";
      idPrefix += "B:";
      var JSCompiler_object_inline_preconnects_1687 = /* @__PURE__ */ new Set(),
        JSCompiler_object_inline_fontPreloads_1688 = /* @__PURE__ */ new Set(),
        JSCompiler_object_inline_highImagePreloads_1689 = /* @__PURE__ */ new Set(),
        JSCompiler_object_inline_styles_1690 = /* @__PURE__ */ new Map(),
        JSCompiler_object_inline_bootstrapScripts_1691 = /* @__PURE__ */ new Set(),
        JSCompiler_object_inline_scripts_1692 = /* @__PURE__ */ new Set(),
        JSCompiler_object_inline_bulkPreloads_1693 = /* @__PURE__ */ new Set(),
        JSCompiler_object_inline_preloads_1694 = {
          images: /* @__PURE__ */ new Map(),
          stylesheets: /* @__PURE__ */ new Map(),
          scripts: /* @__PURE__ */ new Map(),
          moduleScripts: /* @__PURE__ */ new Map(),
        };
      if (void 0 !== bootstrapScripts)
        for (var i = 0; i < bootstrapScripts.length; i++) {
          var scriptConfig = bootstrapScripts[i],
            src,
            crossOrigin = void 0,
            integrity = void 0,
            props = {
              rel: "preload",
              as: "script",
              fetchPriority: "low",
              nonce: void 0,
            };
          "string" === typeof scriptConfig
            ? (props.href = src = scriptConfig)
            : ((props.href = src = scriptConfig.src),
              (props.integrity = integrity =
                "string" === typeof scriptConfig.integrity ? scriptConfig.integrity : void 0),
              (props.crossOrigin = crossOrigin =
                "string" === typeof scriptConfig || null == scriptConfig.crossOrigin
                  ? void 0
                  : "use-credentials" === scriptConfig.crossOrigin
                    ? "use-credentials"
                    : ""));
          scriptConfig = resumableState;
          var href = src;
          scriptConfig.scriptResources[href] = null;
          scriptConfig.moduleScriptResources[href] = null;
          scriptConfig = [];
          pushLinkImpl(scriptConfig, props);
          JSCompiler_object_inline_bootstrapScripts_1691.add(scriptConfig);
          bootstrapChunks.push('<script src="', escapeTextForBrowser(src), '"');
          "string" === typeof integrity &&
            bootstrapChunks.push(' integrity="', escapeTextForBrowser(integrity), '"');
          "string" === typeof crossOrigin &&
            bootstrapChunks.push(' crossorigin="', escapeTextForBrowser(crossOrigin), '"');
          pushCompletedShellIdAttribute(bootstrapChunks, resumableState);
          bootstrapChunks.push(' async=""><\/script>');
        }
      if (void 0 !== bootstrapModules)
        for (bootstrapScripts = 0; bootstrapScripts < bootstrapModules.length; bootstrapScripts++)
          ((props = bootstrapModules[bootstrapScripts]),
            (crossOrigin = src = void 0),
            (integrity = {
              rel: "modulepreload",
              fetchPriority: "low",
              nonce: void 0,
            }),
            "string" === typeof props
              ? (integrity.href = i = props)
              : ((integrity.href = i = props.src),
                (integrity.integrity = crossOrigin =
                  "string" === typeof props.integrity ? props.integrity : void 0),
                (integrity.crossOrigin = src =
                  "string" === typeof props || null == props.crossOrigin
                    ? void 0
                    : "use-credentials" === props.crossOrigin
                      ? "use-credentials"
                      : "")),
            (props = resumableState),
            (scriptConfig = i),
            (props.scriptResources[scriptConfig] = null),
            (props.moduleScriptResources[scriptConfig] = null),
            (props = []),
            pushLinkImpl(props, integrity),
            JSCompiler_object_inline_bootstrapScripts_1691.add(props),
            bootstrapChunks.push('<script type="module" src="', escapeTextForBrowser(i), '"'),
            "string" === typeof crossOrigin &&
              bootstrapChunks.push(' integrity="', escapeTextForBrowser(crossOrigin), '"'),
            "string" === typeof src &&
              bootstrapChunks.push(' crossorigin="', escapeTextForBrowser(src), '"'),
            pushCompletedShellIdAttribute(bootstrapChunks, resumableState),
            bootstrapChunks.push(' async=""><\/script>'));
      return {
        placeholderPrefix: bootstrapScriptContent,
        segmentPrefix: JSCompiler_object_inline_segmentPrefix_1673,
        boundaryPrefix: idPrefix,
        startInlineScript: "<script",
        startInlineStyle: "<style",
        preamble: {
          htmlChunks: null,
          headChunks: null,
          bodyChunks: null,
        },
        externalRuntimeScript: null,
        bootstrapChunks,
        importMapChunks: [],
        onHeaders: void 0,
        headers: null,
        resets: {
          font: {},
          dns: {},
          connect: {
            default: {},
            anonymous: {},
            credentials: {},
          },
          image: {},
          style: {},
        },
        charsetChunks: [],
        viewportChunks: [],
        hoistableChunks: [],
        preconnects: JSCompiler_object_inline_preconnects_1687,
        fontPreloads: JSCompiler_object_inline_fontPreloads_1688,
        highImagePreloads: JSCompiler_object_inline_highImagePreloads_1689,
        styles: JSCompiler_object_inline_styles_1690,
        bootstrapScripts: JSCompiler_object_inline_bootstrapScripts_1691,
        scripts: JSCompiler_object_inline_scripts_1692,
        bulkPreloads: JSCompiler_object_inline_bulkPreloads_1693,
        preloads: JSCompiler_object_inline_preloads_1694,
        nonce: {
          script: void 0,
          style: void 0,
        },
        stylesToHoist: !1,
        generateStaticMarkup,
      };
    }
    function pushTextInstance(target, text, renderState, textEmbedded) {
      if (renderState.generateStaticMarkup) return (target.push(escapeTextForBrowser(text)), !1);
      "" === text
        ? (target = textEmbedded)
        : (textEmbedded && target.push("<!-- -->"),
          target.push(escapeTextForBrowser(text)),
          (target = !0));
      return target;
    }
    function pushSegmentFinale(target, renderState, lastPushedText, textEmbedded) {
      renderState.generateStaticMarkup ||
        (lastPushedText && textEmbedded && target.push("<!-- -->"));
    }
    var bind = Function.prototype.bind,
      REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
    function getComponentNameFromType(type) {
      if (null == type) return null;
      if ("function" === typeof type)
        return type.$$typeof === REACT_CLIENT_REFERENCE
          ? null
          : type.displayName || type.name || null;
      if ("string" === typeof type) return type;
      switch (type) {
        case REACT_FRAGMENT_TYPE:
          return "Fragment";
        case REACT_PROFILER_TYPE:
          return "Profiler";
        case REACT_STRICT_MODE_TYPE:
          return "StrictMode";
        case REACT_SUSPENSE_TYPE:
          return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
          return "SuspenseList";
        case REACT_ACTIVITY_TYPE:
          return "Activity";
      }
      if ("object" === typeof type)
        switch (type.$$typeof) {
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_CONTEXT_TYPE:
            return type.displayName || "Context";
          case REACT_CONSUMER_TYPE:
            return (type._context.displayName || "Context") + ".Consumer";
          case REACT_FORWARD_REF_TYPE:
            var innerType = type.render;
            type = type.displayName;
            type ||
              ((type = innerType.displayName || innerType.name || ""),
              (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
            return type;
          case REACT_MEMO_TYPE:
            return (
              (innerType = type.displayName || null),
              null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo"
            );
          case REACT_LAZY_TYPE:
            innerType = type._payload;
            type = type._init;
            try {
              return getComponentNameFromType(type(innerType));
            } catch (x) {}
        }
      return null;
    }
    var emptyContextObject = {},
      currentActiveSnapshot = null;
    function popToNearestCommonAncestor(prev, next) {
      if (prev !== next) {
        prev.context._currentValue2 = prev.parentValue;
        prev = prev.parent;
        var parentNext = next.parent;
        if (null === prev) {
          if (null !== parentNext) throw Error(formatProdErrorMessage(401));
        } else {
          if (null === parentNext) throw Error(formatProdErrorMessage(401));
          popToNearestCommonAncestor(prev, parentNext);
        }
        next.context._currentValue2 = next.value;
      }
    }
    function popAllPrevious(prev) {
      prev.context._currentValue2 = prev.parentValue;
      prev = prev.parent;
      null !== prev && popAllPrevious(prev);
    }
    function pushAllNext(next) {
      var parentNext = next.parent;
      null !== parentNext && pushAllNext(parentNext);
      next.context._currentValue2 = next.value;
    }
    function popPreviousToCommonLevel(prev, next) {
      prev.context._currentValue2 = prev.parentValue;
      prev = prev.parent;
      if (null === prev) throw Error(formatProdErrorMessage(402));
      prev.depth === next.depth
        ? popToNearestCommonAncestor(prev, next)
        : popPreviousToCommonLevel(prev, next);
    }
    function popNextToCommonLevel(prev, next) {
      var parentNext = next.parent;
      if (null === parentNext) throw Error(formatProdErrorMessage(402));
      prev.depth === parentNext.depth
        ? popToNearestCommonAncestor(prev, parentNext)
        : popNextToCommonLevel(prev, parentNext);
      next.context._currentValue2 = next.value;
    }
    function switchContext(newSnapshot) {
      var prev = currentActiveSnapshot;
      prev !== newSnapshot &&
        (null === prev
          ? pushAllNext(newSnapshot)
          : null === newSnapshot
            ? popAllPrevious(prev)
            : prev.depth === newSnapshot.depth
              ? popToNearestCommonAncestor(prev, newSnapshot)
              : prev.depth > newSnapshot.depth
                ? popPreviousToCommonLevel(prev, newSnapshot)
                : popNextToCommonLevel(prev, newSnapshot),
        (currentActiveSnapshot = newSnapshot));
    }
    var classComponentUpdater = {
        enqueueSetState: function (inst, payload) {
          inst = inst._reactInternals;
          null !== inst.queue && inst.queue.push(payload);
        },
        enqueueReplaceState: function (inst, payload) {
          inst = inst._reactInternals;
          inst.replace = !0;
          inst.queue = [payload];
        },
        enqueueForceUpdate: function () {},
      },
      emptyTreeContext = {
        id: 1,
        overflow: "",
      };
    function pushTreeContext(baseContext, totalChildren, index) {
      var baseIdWithLeadingBit = baseContext.id;
      baseContext = baseContext.overflow;
      var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
      baseIdWithLeadingBit &= ~(1 << baseLength);
      index += 1;
      var length = 32 - clz32(totalChildren) + baseLength;
      if (30 < length) {
        var numberOfOverflowBits = baseLength - (baseLength % 5);
        length = (baseIdWithLeadingBit & ((1 << numberOfOverflowBits) - 1)).toString(32);
        baseIdWithLeadingBit >>= numberOfOverflowBits;
        baseLength -= numberOfOverflowBits;
        return {
          id:
            (1 << (32 - clz32(totalChildren) + baseLength)) |
            (index << baseLength) |
            baseIdWithLeadingBit,
          overflow: length + baseContext,
        };
      }
      return {
        id: (1 << length) | (index << baseLength) | baseIdWithLeadingBit,
        overflow: baseContext,
      };
    }
    var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback,
      log = Math.log,
      LN2 = Math.LN2;
    function clz32Fallback(x) {
      x >>>= 0;
      return 0 === x ? 32 : (31 - ((log(x) / LN2) | 0)) | 0;
    }
    function noop() {}
    var SuspenseException = Error(formatProdErrorMessage(460));
    function trackUsedThenable(thenableState, thenable, index) {
      index = thenableState[index];
      void 0 === index
        ? thenableState.push(thenable)
        : index !== thenable && (thenable.then(noop, noop), (thenable = index));
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          "string" === typeof thenable.status
            ? thenable.then(noop, noop)
            : ((thenableState = thenable),
              (thenableState.status = "pending"),
              thenableState.then(
                function (fulfilledValue) {
                  if ("pending" === thenable.status) {
                    var fulfilledThenable = thenable;
                    fulfilledThenable.status = "fulfilled";
                    fulfilledThenable.value = fulfilledValue;
                  }
                },
                function (error) {
                  if ("pending" === thenable.status) {
                    var rejectedThenable = thenable;
                    rejectedThenable.status = "rejected";
                    rejectedThenable.reason = error;
                  }
                },
              ));
          switch (thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
          suspendedThenable = thenable;
          throw SuspenseException;
      }
    }
    var suspendedThenable = null;
    function getSuspendedThenable() {
      if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
      var thenable = suspendedThenable;
      suspendedThenable = null;
      return thenable;
    }
    function is(x, y) {
      return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is,
      currentlyRenderingComponent = null,
      currentlyRenderingTask = null,
      currentlyRenderingRequest = null,
      currentlyRenderingKeyPath = null,
      firstWorkInProgressHook = null,
      workInProgressHook = null,
      isReRender = !1,
      didScheduleRenderPhaseUpdate = !1,
      localIdCounter = 0,
      actionStateCounter = 0,
      actionStateMatchingIndex = -1,
      thenableIndexCounter = 0,
      thenableState = null,
      renderPhaseUpdates = null,
      numberOfReRenders = 0;
    function resolveCurrentlyRenderingComponent() {
      if (null === currentlyRenderingComponent) throw Error(formatProdErrorMessage(321));
      return currentlyRenderingComponent;
    }
    function createHook() {
      if (0 < numberOfReRenders) throw Error(formatProdErrorMessage(312));
      return {
        memoizedState: null,
        queue: null,
        next: null,
      };
    }
    function createWorkInProgressHook() {
      null === workInProgressHook
        ? null === firstWorkInProgressHook
          ? ((isReRender = !1), (firstWorkInProgressHook = workInProgressHook = createHook()))
          : ((isReRender = !0), (workInProgressHook = firstWorkInProgressHook))
        : null === workInProgressHook.next
          ? ((isReRender = !1), (workInProgressHook = workInProgressHook.next = createHook()))
          : ((isReRender = !0), (workInProgressHook = workInProgressHook.next));
      return workInProgressHook;
    }
    function getThenableStateAfterSuspending() {
      var state = thenableState;
      thenableState = null;
      return state;
    }
    function resetHooksState() {
      currentlyRenderingKeyPath =
        currentlyRenderingRequest =
        currentlyRenderingTask =
        currentlyRenderingComponent =
          null;
      didScheduleRenderPhaseUpdate = !1;
      firstWorkInProgressHook = null;
      numberOfReRenders = 0;
      workInProgressHook = renderPhaseUpdates = null;
    }
    function basicStateReducer(state, action) {
      return "function" === typeof action ? action(state) : action;
    }
    function useReducer(reducer, initialArg, init) {
      currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
      workInProgressHook = createWorkInProgressHook();
      if (isReRender) {
        var queue = workInProgressHook.queue;
        initialArg = queue.dispatch;
        if (
          null !== renderPhaseUpdates &&
          ((init = renderPhaseUpdates.get(queue)), void 0 !== init)
        ) {
          renderPhaseUpdates.delete(queue);
          queue = workInProgressHook.memoizedState;
          do ((queue = reducer(queue, init.action)), (init = init.next));
          while (null !== init);
          workInProgressHook.memoizedState = queue;
          return [queue, initialArg];
        }
        return [workInProgressHook.memoizedState, initialArg];
      }
      reducer =
        reducer === basicStateReducer
          ? "function" === typeof initialArg
            ? initialArg()
            : initialArg
          : void 0 !== init
            ? init(initialArg)
            : initialArg;
      workInProgressHook.memoizedState = reducer;
      reducer = workInProgressHook.queue = {
        last: null,
        dispatch: null,
      };
      reducer = reducer.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, reducer);
      return [workInProgressHook.memoizedState, reducer];
    }
    function useMemo(nextCreate, deps) {
      currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
      workInProgressHook = createWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      if (null !== workInProgressHook) {
        var prevState = workInProgressHook.memoizedState;
        if (null !== prevState && null !== deps) {
          var prevDeps = prevState[1];
          a: if (null === prevDeps) prevDeps = !1;
          else {
            for (var i = 0; i < prevDeps.length && i < deps.length; i++)
              if (!objectIs(deps[i], prevDeps[i])) {
                prevDeps = !1;
                break a;
              }
            prevDeps = !0;
          }
          if (prevDeps) return prevState[0];
        }
      }
      nextCreate = nextCreate();
      workInProgressHook.memoizedState = [nextCreate, deps];
      return nextCreate;
    }
    function dispatchAction(componentIdentity, queue, action) {
      if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
      if (componentIdentity === currentlyRenderingComponent)
        if (
          ((didScheduleRenderPhaseUpdate = !0),
          (componentIdentity = {
            action,
            next: null,
          }),
          null === renderPhaseUpdates && (renderPhaseUpdates = /* @__PURE__ */ new Map()),
          (action = renderPhaseUpdates.get(queue)),
          void 0 === action)
        )
          renderPhaseUpdates.set(queue, componentIdentity);
        else {
          for (queue = action; null !== queue.next; ) queue = queue.next;
          queue.next = componentIdentity;
        }
    }
    function throwOnUseEffectEventCall() {
      throw Error(formatProdErrorMessage(440));
    }
    function unsupportedStartTransition() {
      throw Error(formatProdErrorMessage(394));
    }
    function unsupportedSetOptimisticState() {
      throw Error(formatProdErrorMessage(479));
    }
    function useActionState(action, initialState, permalink) {
      resolveCurrentlyRenderingComponent();
      var actionStateHookIndex = actionStateCounter++,
        request = currentlyRenderingRequest;
      if ("function" === typeof action.$$FORM_ACTION) {
        var nextPostbackStateKey = null,
          componentKeyPath = currentlyRenderingKeyPath;
        request = request.formState;
        var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
        if (null !== request && "function" === typeof isSignatureEqual) {
          var postbackKey = request[1];
          isSignatureEqual.call(action, request[2], request[3]) &&
            ((nextPostbackStateKey =
              void 0 !== permalink
                ? "p" + permalink
                : "k" +
                  murmurhash3_32_gc(
                    JSON.stringify([componentKeyPath, null, actionStateHookIndex]),
                    0,
                  )),
            postbackKey === nextPostbackStateKey &&
              ((actionStateMatchingIndex = actionStateHookIndex), (initialState = request[0])));
        }
        var boundAction = action.bind(null, initialState);
        action = function (payload) {
          boundAction(payload);
        };
        "function" === typeof boundAction.$$FORM_ACTION &&
          (action.$$FORM_ACTION = function (prefix) {
            prefix = boundAction.$$FORM_ACTION(prefix);
            void 0 !== permalink && ((permalink += ""), (prefix.action = permalink));
            var formData = prefix.data;
            formData &&
              (null === nextPostbackStateKey &&
                (nextPostbackStateKey =
                  void 0 !== permalink
                    ? "p" + permalink
                    : "k" +
                      murmurhash3_32_gc(
                        JSON.stringify([componentKeyPath, null, actionStateHookIndex]),
                        0,
                      )),
              formData.append("$ACTION_KEY", nextPostbackStateKey));
            return prefix;
          });
        return [initialState, action, !1];
      }
      var boundAction$22 = action.bind(null, initialState);
      return [
        initialState,
        function (payload) {
          boundAction$22(payload);
        },
        !1,
      ];
    }
    function unwrapThenable(thenable) {
      var index = thenableIndexCounter;
      thenableIndexCounter += 1;
      null === thenableState && (thenableState = []);
      return trackUsedThenable(thenableState, thenable, index);
    }
    function unsupportedRefresh() {
      throw Error(formatProdErrorMessage(393));
    }
    var HooksDispatcher = {
        readContext: function (context) {
          return context._currentValue2;
        },
        use: function (usable) {
          if (null !== usable && "object" === typeof usable) {
            if ("function" === typeof usable.then) return unwrapThenable(usable);
            if (usable.$$typeof === REACT_CONTEXT_TYPE) return usable._currentValue2;
          }
          throw Error(formatProdErrorMessage(438, String(usable)));
        },
        useContext: function (context) {
          resolveCurrentlyRenderingComponent();
          return context._currentValue2;
        },
        useMemo,
        useReducer,
        useRef: function (initialValue) {
          currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
          workInProgressHook = createWorkInProgressHook();
          var previousRef = workInProgressHook.memoizedState;
          return null === previousRef
            ? ((initialValue = { current: initialValue }),
              (workInProgressHook.memoizedState = initialValue))
            : previousRef;
        },
        useState: function (initialState) {
          return useReducer(basicStateReducer, initialState);
        },
        useInsertionEffect: noop,
        useLayoutEffect: noop,
        useCallback: function (callback, deps) {
          return useMemo(function () {
            return callback;
          }, deps);
        },
        useImperativeHandle: noop,
        useEffect: noop,
        useDebugValue: noop,
        useDeferredValue: function (value, initialValue) {
          resolveCurrentlyRenderingComponent();
          return void 0 !== initialValue ? initialValue : value;
        },
        useTransition: function () {
          resolveCurrentlyRenderingComponent();
          return [!1, unsupportedStartTransition];
        },
        useId: function () {
          var JSCompiler_inline_result = currentlyRenderingTask.treeContext;
          var overflow = JSCompiler_inline_result.overflow;
          JSCompiler_inline_result = JSCompiler_inline_result.id;
          JSCompiler_inline_result =
            (
              JSCompiler_inline_result & ~(1 << (32 - clz32(JSCompiler_inline_result) - 1))
            ).toString(32) + overflow;
          var resumableState = currentResumableState;
          if (null === resumableState) throw Error(formatProdErrorMessage(404));
          overflow = localIdCounter++;
          JSCompiler_inline_result =
            "_" + resumableState.idPrefix + "R_" + JSCompiler_inline_result;
          0 < overflow && (JSCompiler_inline_result += "H" + overflow.toString(32));
          return JSCompiler_inline_result + "_";
        },
        useSyncExternalStore: function (subscribe, getSnapshot, getServerSnapshot) {
          if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
          return getServerSnapshot();
        },
        useOptimistic: function (passthrough) {
          resolveCurrentlyRenderingComponent();
          return [passthrough, unsupportedSetOptimisticState];
        },
        useActionState,
        useFormState: useActionState,
        useHostTransitionStatus: function () {
          resolveCurrentlyRenderingComponent();
          return sharedNotPendingObject;
        },
        useMemoCache: function (size) {
          for (var data = Array(size), i = 0; i < size; i++) data[i] = REACT_MEMO_CACHE_SENTINEL;
          return data;
        },
        useCacheRefresh: function () {
          return unsupportedRefresh;
        },
        useEffectEvent: function () {
          return throwOnUseEffectEventCall;
        },
      },
      currentResumableState = null,
      DefaultAsyncDispatcher = {
        getCacheForType: function () {
          throw Error(formatProdErrorMessage(248));
        },
        cacheSignal: function () {
          throw Error(formatProdErrorMessage(248));
        },
      },
      prefix,
      suffix;
    function describeBuiltInComponentFrame(name) {
      if (void 0 === prefix)
        try {
          throw Error();
        } catch (x) {
          var match = x.stack.trim().match(/\n( *(at )?)/);
          prefix = (match && match[1]) || "";
          suffix =
            -1 < x.stack.indexOf("\n    at")
              ? " (<anonymous>)"
              : -1 < x.stack.indexOf("@")
                ? "@unknown:0:0"
                : "";
        }
      return "\n" + prefix + name + suffix;
    }
    var reentry = !1;
    function describeNativeComponentFrame(fn, construct) {
      if (!fn || reentry) return "";
      reentry = !0;
      var previousPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var RunInRootFrame = {
          DetermineComponentFrameRoot: function () {
            try {
              if (construct) {
                var Fake = function () {
                  throw Error();
                };
                Object.defineProperty(Fake.prototype, "props", {
                  set: function () {
                    throw Error();
                  },
                });
                if ("object" === typeof Reflect && Reflect.construct) {
                  try {
                    Reflect.construct(Fake, []);
                  } catch (x) {
                    var control = x;
                  }
                  Reflect.construct(fn, [], Fake);
                } else {
                  try {
                    Fake.call();
                  } catch (x$24) {
                    control = x$24;
                  }
                  fn.call(Fake.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (x$25) {
                  control = x$25;
                }
                (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function () {});
              }
            } catch (sample) {
              if (sample && control && "string" === typeof sample.stack)
                return [sample.stack, control.stack];
            }
            return [null, null];
          },
        };
        RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var namePropDescriptor = Object.getOwnPropertyDescriptor(
          RunInRootFrame.DetermineComponentFrameRoot,
          "name",
        );
        namePropDescriptor &&
          namePropDescriptor.configurable &&
          Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", {
            value: "DetermineComponentFrameRoot",
          });
        var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
          sampleStack = _RunInRootFrame$Deter[0],
          controlStack = _RunInRootFrame$Deter[1];
        if (sampleStack && controlStack) {
          var sampleLines = sampleStack.split("\n"),
            controlLines = controlStack.split("\n");
          for (
            namePropDescriptor = RunInRootFrame = 0;
            RunInRootFrame < sampleLines.length &&
            !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");
          )
            RunInRootFrame++;
          for (
            ;
            namePropDescriptor < controlLines.length &&
            !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");
          )
            namePropDescriptor++;
          if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
            for (
              RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1;
              1 <= RunInRootFrame &&
              0 <= namePropDescriptor &&
              sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];
            )
              namePropDescriptor--;
          for (
            ;
            1 <= RunInRootFrame && 0 <= namePropDescriptor;
            RunInRootFrame--, namePropDescriptor--
          )
            if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
              if (1 !== RunInRootFrame || 1 !== namePropDescriptor)
                do
                  if (
                    (RunInRootFrame--,
                    namePropDescriptor--,
                    0 > namePropDescriptor ||
                      sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor])
                  ) {
                    var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                    fn.displayName &&
                      frame.includes("<anonymous>") &&
                      (frame = frame.replace("<anonymous>", fn.displayName));
                    return frame;
                  }
                while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
              break;
            }
        }
      } finally {
        ((reentry = !1), (Error.prepareStackTrace = previousPrepareStackTrace));
      }
      return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "")
        ? describeBuiltInComponentFrame(previousPrepareStackTrace)
        : "";
    }
    function describeComponentStackByType(type) {
      if ("string" === typeof type) return describeBuiltInComponentFrame(type);
      if ("function" === typeof type)
        return type.prototype && type.prototype.isReactComponent
          ? describeNativeComponentFrame(type, !0)
          : describeNativeComponentFrame(type, !1);
      if ("object" === typeof type && null !== type) {
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
            return describeNativeComponentFrame(type.render, !1);
          case REACT_MEMO_TYPE:
            return describeNativeComponentFrame(type.type, !1);
          case REACT_LAZY_TYPE:
            var lazyComponent = type,
              payload = lazyComponent._payload;
            lazyComponent = lazyComponent._init;
            try {
              type = lazyComponent(payload);
            } catch (x) {
              return describeBuiltInComponentFrame("Lazy");
            }
            return describeComponentStackByType(type);
        }
        if ("string" === typeof type.name) {
          a: {
            payload = type.name;
            lazyComponent = type.env;
            var location = type.debugLocation;
            if (
              null != location &&
              ((type = Error.prepareStackTrace),
              (Error.prepareStackTrace = void 0),
              (location = location.stack),
              (Error.prepareStackTrace = type),
              location.startsWith("Error: react-stack-top-frame\n") &&
                (location = location.slice(29)),
              (type = location.indexOf("\n")),
              -1 !== type && (location = location.slice(type + 1)),
              (type = location.indexOf("react_stack_bottom_frame")),
              -1 !== type && (type = location.lastIndexOf("\n", type)),
              (type = -1 !== type ? (location = location.slice(0, type)) : ""),
              (location = type.lastIndexOf("\n")),
              (type = -1 === location ? type : type.slice(location + 1)),
              -1 !== type.indexOf(payload))
            ) {
              payload = "\n" + type;
              break a;
            }
            payload = describeBuiltInComponentFrame(
              payload + (lazyComponent ? " [" + lazyComponent + "]" : ""),
            );
          }
          return payload;
        }
      }
      switch (type) {
        case REACT_SUSPENSE_LIST_TYPE:
          return describeBuiltInComponentFrame("SuspenseList");
        case REACT_SUSPENSE_TYPE:
          return describeBuiltInComponentFrame("Suspense");
      }
      return "";
    }
    function isEligibleForOutlining(request, boundary) {
      return (500 < boundary.byteSize || !1) && null === boundary.contentPreamble;
    }
    function defaultErrorHandler(error) {
      if (
        "object" === typeof error &&
        null !== error &&
        "string" === typeof error.environmentName
      ) {
        var JSCompiler_inline_result = error.environmentName;
        error = [error].slice(0);
        "string" === typeof error[0]
          ? error.splice(0, 1, "[%s] " + error[0], " " + JSCompiler_inline_result + " ")
          : error.splice(0, 0, "[%s]", " " + JSCompiler_inline_result + " ");
        error.unshift(console);
        JSCompiler_inline_result = bind.apply(console.error, error);
        JSCompiler_inline_result();
      } else console.error(error);
      return null;
    }
    function RequestInstance(
      resumableState,
      renderState,
      rootFormatContext,
      progressiveChunkSize,
      onError,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      onPostpone,
      formState,
    ) {
      var abortSet = /* @__PURE__ */ new Set();
      this.destination = null;
      this.flushScheduled = !1;
      this.resumableState = resumableState;
      this.renderState = renderState;
      this.rootFormatContext = rootFormatContext;
      this.progressiveChunkSize = void 0 === progressiveChunkSize ? 12800 : progressiveChunkSize;
      this.status = 10;
      this.fatalError = null;
      this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0;
      this.completedPreambleSegments = this.completedRootSegment = null;
      this.byteSize = 0;
      this.abortableTasks = abortSet;
      this.pingedTasks = [];
      this.clientRenderedBoundaries = [];
      this.completedBoundaries = [];
      this.partialBoundaries = [];
      this.trackedPostpones = null;
      this.onError = void 0 === onError ? defaultErrorHandler : onError;
      this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
      this.onAllReady = void 0 === onAllReady ? noop : onAllReady;
      this.onShellReady = void 0 === onShellReady ? noop : onShellReady;
      this.onShellError = void 0 === onShellError ? noop : onShellError;
      this.onFatalError = void 0 === onFatalError ? noop : onFatalError;
      this.formState = void 0 === formState ? null : formState;
    }
    function createRequest(
      children,
      resumableState,
      renderState,
      rootFormatContext,
      progressiveChunkSize,
      onError,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError,
      onPostpone,
      formState,
    ) {
      resumableState = new RequestInstance(
        resumableState,
        renderState,
        rootFormatContext,
        progressiveChunkSize,
        onError,
        onAllReady,
        onShellReady,
        onShellError,
        onFatalError,
        onPostpone,
        formState,
      );
      renderState = createPendingSegment(resumableState, 0, null, rootFormatContext, !1, !1);
      renderState.parentFlushed = !0;
      children = createRenderTask(
        resumableState,
        null,
        children,
        -1,
        null,
        renderState,
        null,
        null,
        resumableState.abortableTasks,
        null,
        rootFormatContext,
        null,
        emptyTreeContext,
        null,
        null,
      );
      pushComponentStack(children);
      resumableState.pingedTasks.push(children);
      return resumableState;
    }
    var currentRequest = null;
    function pingTask(request, task) {
      request.pingedTasks.push(task);
      1 === request.pingedTasks.length &&
        ((request.flushScheduled = null !== request.destination), performWork(request));
    }
    function createSuspenseBoundary(
      request,
      row,
      fallbackAbortableTasks,
      contentPreamble,
      fallbackPreamble,
    ) {
      fallbackAbortableTasks = {
        status: 0,
        rootSegmentID: -1,
        parentFlushed: !1,
        pendingTasks: 0,
        row,
        completedSegments: [],
        byteSize: 0,
        fallbackAbortableTasks,
        errorDigest: null,
        contentState: createHoistableState(),
        fallbackState: createHoistableState(),
        contentPreamble,
        fallbackPreamble,
        trackedContentKeyPath: null,
        trackedFallbackNode: null,
      };
      null !== row &&
        (row.pendingTasks++,
        (contentPreamble = row.boundaries),
        null !== contentPreamble &&
          (request.allPendingTasks++,
          fallbackAbortableTasks.pendingTasks++,
          contentPreamble.push(fallbackAbortableTasks)),
        (request = row.inheritedHoistables),
        null !== request && hoistHoistables(fallbackAbortableTasks.contentState, request));
      return fallbackAbortableTasks;
    }
    function createRenderTask(
      request,
      thenableState,
      node,
      childIndex,
      blockedBoundary,
      blockedSegment,
      blockedPreamble,
      hoistableState,
      abortSet,
      keyPath,
      formatContext,
      context,
      treeContext,
      row,
      componentStack,
    ) {
      request.allPendingTasks++;
      null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
      null !== row && row.pendingTasks++;
      var task = {
        replay: null,
        node,
        childIndex,
        ping: function () {
          return pingTask(request, task);
        },
        blockedBoundary,
        blockedSegment,
        blockedPreamble,
        hoistableState,
        abortSet,
        keyPath,
        formatContext,
        context,
        treeContext,
        row,
        componentStack,
        thenableState,
      };
      abortSet.add(task);
      return task;
    }
    function createReplayTask(
      request,
      thenableState,
      replay,
      node,
      childIndex,
      blockedBoundary,
      hoistableState,
      abortSet,
      keyPath,
      formatContext,
      context,
      treeContext,
      row,
      componentStack,
    ) {
      request.allPendingTasks++;
      null === blockedBoundary ? request.pendingRootTasks++ : blockedBoundary.pendingTasks++;
      null !== row && row.pendingTasks++;
      replay.pendingTasks++;
      var task = {
        replay,
        node,
        childIndex,
        ping: function () {
          return pingTask(request, task);
        },
        blockedBoundary,
        blockedSegment: null,
        blockedPreamble: null,
        hoistableState,
        abortSet,
        keyPath,
        formatContext,
        context,
        treeContext,
        row,
        componentStack,
        thenableState,
      };
      abortSet.add(task);
      return task;
    }
    function createPendingSegment(
      request,
      index,
      boundary,
      parentFormatContext,
      lastPushedText,
      textEmbedded,
    ) {
      return {
        status: 0,
        parentFlushed: !1,
        id: -1,
        index,
        chunks: [],
        children: [],
        preambleChildren: [],
        parentFormatContext,
        boundary,
        lastPushedText,
        textEmbedded,
      };
    }
    function pushComponentStack(task) {
      var node = task.node;
      if ("object" === typeof node && null !== node)
        switch (node.$$typeof) {
          case REACT_ELEMENT_TYPE:
            task.componentStack = {
              parent: task.componentStack,
              type: node.type,
            };
        }
    }
    function replaceSuspenseComponentStackWithSuspenseFallbackStack(componentStack) {
      return null === componentStack
        ? null
        : {
            parent: componentStack.parent,
            type: "Suspense Fallback",
          };
    }
    function getThrownInfo(node$jscomp$0) {
      var errorInfo = {};
      node$jscomp$0 &&
        Object.defineProperty(errorInfo, "componentStack", {
          configurable: !0,
          enumerable: !0,
          get: function () {
            try {
              var info = "",
                node = node$jscomp$0;
              do ((info += describeComponentStackByType(node.type)), (node = node.parent));
              while (node);
              var JSCompiler_inline_result = info;
            } catch (x) {
              JSCompiler_inline_result = "\nError generating stack: " + x.message + "\n" + x.stack;
            }
            Object.defineProperty(errorInfo, "componentStack", { value: JSCompiler_inline_result });
            return JSCompiler_inline_result;
          },
        });
      return errorInfo;
    }
    function logRecoverableError(request, error, errorInfo) {
      request = request.onError;
      error = request(error, errorInfo);
      if (null == error || "string" === typeof error) return error;
    }
    function fatalError(request, error) {
      var onShellError = request.onShellError,
        onFatalError = request.onFatalError;
      onShellError(error);
      onFatalError(error);
      null !== request.destination
        ? ((request.status = 14), request.destination.destroy(error))
        : ((request.status = 13), (request.fatalError = error));
    }
    function finishSuspenseListRow(request, row) {
      unblockSuspenseListRow(request, row.next, row.hoistables);
    }
    function unblockSuspenseListRow(request, unblockedRow, inheritedHoistables) {
      for (; null !== unblockedRow; ) {
        null !== inheritedHoistables &&
          (hoistHoistables(unblockedRow.hoistables, inheritedHoistables),
          (unblockedRow.inheritedHoistables = inheritedHoistables));
        var unblockedBoundaries = unblockedRow.boundaries;
        if (null !== unblockedBoundaries) {
          unblockedRow.boundaries = null;
          for (var i = 0; i < unblockedBoundaries.length; i++) {
            var unblockedBoundary = unblockedBoundaries[i];
            null !== inheritedHoistables &&
              hoistHoistables(unblockedBoundary.contentState, inheritedHoistables);
            finishedTask(request, unblockedBoundary, null, null);
          }
        }
        unblockedRow.pendingTasks--;
        if (0 < unblockedRow.pendingTasks) break;
        inheritedHoistables = unblockedRow.hoistables;
        unblockedRow = unblockedRow.next;
      }
    }
    function tryToResolveTogetherRow(request, togetherRow) {
      var boundaries = togetherRow.boundaries;
      if (null !== boundaries && togetherRow.pendingTasks === boundaries.length) {
        for (var allCompleteAndInlinable = !0, i = 0; i < boundaries.length; i++) {
          var rowBoundary = boundaries[i];
          if (
            1 !== rowBoundary.pendingTasks ||
            rowBoundary.parentFlushed ||
            isEligibleForOutlining(request, rowBoundary)
          ) {
            allCompleteAndInlinable = !1;
            break;
          }
        }
        allCompleteAndInlinable &&
          unblockSuspenseListRow(request, togetherRow, togetherRow.hoistables);
      }
    }
    function createSuspenseListRow(previousRow) {
      var newRow = {
        pendingTasks: 1,
        boundaries: null,
        hoistables: createHoistableState(),
        inheritedHoistables: null,
        together: !1,
        next: null,
      };
      null !== previousRow &&
        0 < previousRow.pendingTasks &&
        (newRow.pendingTasks++, (newRow.boundaries = []), (previousRow.next = newRow));
      return newRow;
    }
    function renderSuspenseListRows(request, task, keyPath, rows, revealOrder) {
      var prevKeyPath = task.keyPath,
        prevTreeContext = task.treeContext,
        prevRow = task.row;
      task.keyPath = keyPath;
      keyPath = rows.length;
      var previousSuspenseListRow = null;
      if (null !== task.replay) {
        var resumeSlots = task.replay.slots;
        if (null !== resumeSlots && "object" === typeof resumeSlots)
          for (var n = 0; n < keyPath; n++) {
            var i =
                "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder
                  ? n
                  : keyPath - 1 - n,
              node = rows[i];
            task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
            task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
            var resumeSegmentID = resumeSlots[i];
            "number" === typeof resumeSegmentID
              ? (resumeNode(request, task, resumeSegmentID, node, i), delete resumeSlots[i])
              : renderNode(request, task, node, i);
            0 === --previousSuspenseListRow.pendingTasks &&
              finishSuspenseListRow(request, previousSuspenseListRow);
          }
        else
          for (resumeSlots = 0; resumeSlots < keyPath; resumeSlots++)
            ((n =
              "backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder
                ? resumeSlots
                : keyPath - 1 - resumeSlots),
              (i = rows[n]),
              (task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow)),
              (task.treeContext = pushTreeContext(prevTreeContext, keyPath, n)),
              renderNode(request, task, i, n),
              0 === --previousSuspenseListRow.pendingTasks &&
                finishSuspenseListRow(request, previousSuspenseListRow));
      } else if ("backwards" !== revealOrder && "unstable_legacy-backwards" !== revealOrder)
        for (revealOrder = 0; revealOrder < keyPath; revealOrder++)
          ((resumeSlots = rows[revealOrder]),
            (task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow)),
            (task.treeContext = pushTreeContext(prevTreeContext, keyPath, revealOrder)),
            renderNode(request, task, resumeSlots, revealOrder),
            0 === --previousSuspenseListRow.pendingTasks &&
              finishSuspenseListRow(request, previousSuspenseListRow));
      else {
        revealOrder = task.blockedSegment;
        resumeSlots = revealOrder.children.length;
        n = revealOrder.chunks.length;
        for (i = keyPath - 1; 0 <= i; i--) {
          node = rows[i];
          task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
          task.treeContext = pushTreeContext(prevTreeContext, keyPath, i);
          resumeSegmentID = createPendingSegment(
            request,
            n,
            null,
            task.formatContext,
            0 === i ? revealOrder.lastPushedText : !0,
            !0,
          );
          revealOrder.children.splice(resumeSlots, 0, resumeSegmentID);
          task.blockedSegment = resumeSegmentID;
          try {
            (renderNode(request, task, node, i),
              pushSegmentFinale(
                resumeSegmentID.chunks,
                request.renderState,
                resumeSegmentID.lastPushedText,
                resumeSegmentID.textEmbedded,
              ),
              (resumeSegmentID.status = 1),
              0 === --previousSuspenseListRow.pendingTasks &&
                finishSuspenseListRow(request, previousSuspenseListRow));
          } catch (thrownValue) {
            throw ((resumeSegmentID.status = 12 === request.status ? 3 : 4), thrownValue);
          }
        }
        task.blockedSegment = revealOrder;
        revealOrder.lastPushedText = !1;
      }
      null !== prevRow &&
        null !== previousSuspenseListRow &&
        0 < previousSuspenseListRow.pendingTasks &&
        (prevRow.pendingTasks++, (previousSuspenseListRow.next = prevRow));
      task.treeContext = prevTreeContext;
      task.row = prevRow;
      task.keyPath = prevKeyPath;
    }
    function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
      var prevThenableState = task.thenableState;
      task.thenableState = null;
      currentlyRenderingComponent = {};
      currentlyRenderingTask = task;
      currentlyRenderingRequest = request;
      currentlyRenderingKeyPath = keyPath;
      actionStateCounter = localIdCounter = 0;
      actionStateMatchingIndex = -1;
      thenableIndexCounter = 0;
      thenableState = prevThenableState;
      for (request = Component(props, secondArg); didScheduleRenderPhaseUpdate; )
        ((didScheduleRenderPhaseUpdate = !1),
          (actionStateCounter = localIdCounter = 0),
          (actionStateMatchingIndex = -1),
          (thenableIndexCounter = 0),
          (numberOfReRenders += 1),
          (workInProgressHook = null),
          (request = Component(props, secondArg)));
      resetHooksState();
      return request;
    }
    function finishFunctionComponent(
      request,
      task,
      keyPath,
      children,
      hasId,
      actionStateCount,
      actionStateMatchingIndex,
    ) {
      var didEmitActionStateMarkers = !1;
      if (0 !== actionStateCount && null !== request.formState) {
        var segment = task.blockedSegment;
        if (null !== segment) {
          didEmitActionStateMarkers = !0;
          segment = segment.chunks;
          for (var i = 0; i < actionStateCount; i++)
            i === actionStateMatchingIndex ? segment.push("<!--F!-->") : segment.push("<!--F-->");
        }
      }
      actionStateCount = task.keyPath;
      task.keyPath = keyPath;
      hasId
        ? ((keyPath = task.treeContext),
          (task.treeContext = pushTreeContext(keyPath, 1, 0)),
          renderNode(request, task, children, -1),
          (task.treeContext = keyPath))
        : didEmitActionStateMarkers
          ? renderNode(request, task, children, -1)
          : renderNodeDestructive(request, task, children, -1);
      task.keyPath = actionStateCount;
    }
    function renderElement(request, task, keyPath, type, props, ref) {
      if ("function" === typeof type)
        if (type.prototype && type.prototype.isReactComponent) {
          var newProps = props;
          if ("ref" in props) {
            newProps = {};
            for (var propName in props)
              "ref" !== propName && (newProps[propName] = props[propName]);
          }
          var defaultProps = type.defaultProps;
          if (defaultProps) {
            newProps === props && (newProps = assign({}, newProps, props));
            for (var propName$43 in defaultProps)
              void 0 === newProps[propName$43] &&
                (newProps[propName$43] = defaultProps[propName$43]);
          }
          props = newProps;
          newProps = emptyContextObject;
          defaultProps = type.contextType;
          "object" === typeof defaultProps &&
            null !== defaultProps &&
            (newProps = defaultProps._currentValue2);
          newProps = new type(props, newProps);
          var initialState = void 0 !== newProps.state ? newProps.state : null;
          newProps.updater = classComponentUpdater;
          newProps.props = props;
          newProps.state = initialState;
          defaultProps = {
            queue: [],
            replace: !1,
          };
          newProps._reactInternals = defaultProps;
          ref = type.contextType;
          newProps.context =
            "object" === typeof ref && null !== ref ? ref._currentValue2 : emptyContextObject;
          ref = type.getDerivedStateFromProps;
          "function" === typeof ref &&
            ((ref = ref(props, initialState)),
            (initialState =
              null === ref || void 0 === ref ? initialState : assign({}, initialState, ref)),
            (newProps.state = initialState));
          if (
            "function" !== typeof type.getDerivedStateFromProps &&
            "function" !== typeof newProps.getSnapshotBeforeUpdate &&
            ("function" === typeof newProps.UNSAFE_componentWillMount ||
              "function" === typeof newProps.componentWillMount)
          )
            if (
              ((type = newProps.state),
              "function" === typeof newProps.componentWillMount && newProps.componentWillMount(),
              "function" === typeof newProps.UNSAFE_componentWillMount &&
                newProps.UNSAFE_componentWillMount(),
              type !== newProps.state &&
                classComponentUpdater.enqueueReplaceState(newProps, newProps.state, null),
              null !== defaultProps.queue && 0 < defaultProps.queue.length)
            )
              if (
                ((type = defaultProps.queue),
                (ref = defaultProps.replace),
                (defaultProps.queue = null),
                (defaultProps.replace = !1),
                ref && 1 === type.length)
              )
                newProps.state = type[0];
              else {
                defaultProps = ref ? type[0] : newProps.state;
                initialState = !0;
                for (ref = ref ? 1 : 0; ref < type.length; ref++)
                  ((propName$43 = type[ref]),
                    (propName$43 =
                      "function" === typeof propName$43
                        ? propName$43.call(newProps, defaultProps, props, void 0)
                        : propName$43),
                    null != propName$43 &&
                      (initialState
                        ? ((initialState = !1),
                          (defaultProps = assign({}, defaultProps, propName$43)))
                        : assign(defaultProps, propName$43)));
                newProps.state = defaultProps;
              }
            else defaultProps.queue = null;
          type = newProps.render();
          if (12 === request.status) throw null;
          props = task.keyPath;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, type, -1);
          task.keyPath = props;
        } else {
          type = renderWithHooks(request, task, keyPath, type, props, void 0);
          if (12 === request.status) throw null;
          finishFunctionComponent(
            request,
            task,
            keyPath,
            type,
            0 !== localIdCounter,
            actionStateCounter,
            actionStateMatchingIndex,
          );
        }
      else if ("string" === typeof type)
        if (((newProps = task.blockedSegment), null === newProps))
          ((newProps = props.children),
            (defaultProps = task.formatContext),
            (initialState = task.keyPath),
            (task.formatContext = getChildFormatContext(defaultProps, type, props)),
            (task.keyPath = keyPath),
            renderNode(request, task, newProps, -1),
            (task.formatContext = defaultProps),
            (task.keyPath = initialState));
        else {
          initialState = pushStartInstance(
            newProps.chunks,
            type,
            props,
            request.resumableState,
            request.renderState,
            task.blockedPreamble,
            task.hoistableState,
            task.formatContext,
            newProps.lastPushedText,
          );
          newProps.lastPushedText = !1;
          defaultProps = task.formatContext;
          ref = task.keyPath;
          task.keyPath = keyPath;
          if (
            3 ===
            (task.formatContext = getChildFormatContext(defaultProps, type, props)).insertionMode
          ) {
            keyPath = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
            newProps.preambleChildren.push(keyPath);
            task.blockedSegment = keyPath;
            try {
              ((keyPath.status = 6),
                renderNode(request, task, initialState, -1),
                pushSegmentFinale(
                  keyPath.chunks,
                  request.renderState,
                  keyPath.lastPushedText,
                  keyPath.textEmbedded,
                ),
                (keyPath.status = 1));
            } finally {
              task.blockedSegment = newProps;
            }
          } else renderNode(request, task, initialState, -1);
          task.formatContext = defaultProps;
          task.keyPath = ref;
          a: {
            task = newProps.chunks;
            request = request.resumableState;
            switch (type) {
              case "title":
              case "style":
              case "script":
              case "area":
              case "base":
              case "br":
              case "col":
              case "embed":
              case "hr":
              case "img":
              case "input":
              case "keygen":
              case "link":
              case "meta":
              case "param":
              case "source":
              case "track":
              case "wbr":
                break a;
              case "body":
                if (1 >= defaultProps.insertionMode) {
                  request.hasBody = !0;
                  break a;
                }
                break;
              case "html":
                if (0 === defaultProps.insertionMode) {
                  request.hasHtml = !0;
                  break a;
                }
                break;
              case "head":
                if (1 >= defaultProps.insertionMode) break a;
            }
            task.push(endChunkForTag(type));
          }
          newProps.lastPushedText = !1;
        }
      else {
        switch (type) {
          case REACT_LEGACY_HIDDEN_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_FRAGMENT_TYPE:
            type = task.keyPath;
            task.keyPath = keyPath;
            renderNodeDestructive(request, task, props.children, -1);
            task.keyPath = type;
            return;
          case REACT_ACTIVITY_TYPE:
            type = task.blockedSegment;
            null === type
              ? "hidden" !== props.mode &&
                ((type = task.keyPath),
                (task.keyPath = keyPath),
                renderNode(request, task, props.children, -1),
                (task.keyPath = type))
              : "hidden" !== props.mode &&
                (request.renderState.generateStaticMarkup || type.chunks.push("<!--&-->"),
                (type.lastPushedText = !1),
                (newProps = task.keyPath),
                (task.keyPath = keyPath),
                renderNode(request, task, props.children, -1),
                (task.keyPath = newProps),
                request.renderState.generateStaticMarkup || type.chunks.push("<!--/&-->"),
                (type.lastPushedText = !1));
            return;
          case REACT_SUSPENSE_LIST_TYPE:
            a: {
              type = props.children;
              props = props.revealOrder;
              if (
                "forwards" === props ||
                "backwards" === props ||
                "unstable_legacy-backwards" === props
              ) {
                if (isArrayImpl(type)) {
                  renderSuspenseListRows(request, task, keyPath, type, props);
                  break a;
                }
                if ((newProps = getIteratorFn(type))) {
                  if ((newProps = newProps.call(type))) {
                    defaultProps = newProps.next();
                    if (!defaultProps.done) {
                      do defaultProps = newProps.next();
                      while (!defaultProps.done);
                      renderSuspenseListRows(request, task, keyPath, type, props);
                    }
                    break a;
                  }
                }
              }
              "together" === props
                ? ((props = task.keyPath),
                  (newProps = task.row),
                  (defaultProps = task.row = createSuspenseListRow(null)),
                  (defaultProps.boundaries = []),
                  (defaultProps.together = !0),
                  (task.keyPath = keyPath),
                  renderNodeDestructive(request, task, type, -1),
                  0 === --defaultProps.pendingTasks && finishSuspenseListRow(request, defaultProps),
                  (task.keyPath = props),
                  (task.row = newProps),
                  null !== newProps &&
                    0 < defaultProps.pendingTasks &&
                    (newProps.pendingTasks++, (defaultProps.next = newProps)))
                : ((props = task.keyPath),
                  (task.keyPath = keyPath),
                  renderNodeDestructive(request, task, type, -1),
                  (task.keyPath = props));
            }
            return;
          case REACT_VIEW_TRANSITION_TYPE:
          case REACT_SCOPE_TYPE:
            throw Error(formatProdErrorMessage(343));
          case REACT_SUSPENSE_TYPE:
            a: if (null !== task.replay) {
              type = task.keyPath;
              newProps = task.formatContext;
              defaultProps = task.row;
              task.keyPath = keyPath;
              task.formatContext = getSuspenseContentFormatContext(
                request.resumableState,
                newProps,
              );
              task.row = null;
              keyPath = props.children;
              try {
                renderNode(request, task, keyPath, -1);
              } finally {
                ((task.keyPath = type), (task.formatContext = newProps), (task.row = defaultProps));
              }
            } else {
              type = task.keyPath;
              ref = task.formatContext;
              var prevRow = task.row,
                parentBoundary = task.blockedBoundary;
              propName$43 = task.blockedPreamble;
              var parentHoistableState = task.hoistableState;
              propName = task.blockedSegment;
              var fallback = props.fallback;
              props = props.children;
              var fallbackAbortSet = /* @__PURE__ */ new Set();
              var newBoundary = createSuspenseBoundary(
                request,
                task.row,
                fallbackAbortSet,
                null,
                null,
              );
              null !== request.trackedPostpones && (newBoundary.trackedContentKeyPath = keyPath);
              var boundarySegment = createPendingSegment(
                request,
                propName.chunks.length,
                newBoundary,
                task.formatContext,
                !1,
                !1,
              );
              propName.children.push(boundarySegment);
              propName.lastPushedText = !1;
              var contentRootSegment = createPendingSegment(
                request,
                0,
                null,
                task.formatContext,
                !1,
                !1,
              );
              contentRootSegment.parentFlushed = !0;
              if (null !== request.trackedPostpones) {
                newProps = task.componentStack;
                defaultProps = [keyPath[0], "Suspense Fallback", keyPath[2]];
                initialState = [defaultProps[1], defaultProps[2], [], null];
                request.trackedPostpones.workingMap.set(defaultProps, initialState);
                newBoundary.trackedFallbackNode = initialState;
                task.blockedSegment = boundarySegment;
                task.blockedPreamble = newBoundary.fallbackPreamble;
                task.keyPath = defaultProps;
                task.formatContext = getSuspenseFallbackFormatContext(request.resumableState, ref);
                task.componentStack =
                  replaceSuspenseComponentStackWithSuspenseFallbackStack(newProps);
                boundarySegment.status = 6;
                try {
                  (renderNode(request, task, fallback, -1),
                    pushSegmentFinale(
                      boundarySegment.chunks,
                      request.renderState,
                      boundarySegment.lastPushedText,
                      boundarySegment.textEmbedded,
                    ),
                    (boundarySegment.status = 1));
                } catch (thrownValue) {
                  throw ((boundarySegment.status = 12 === request.status ? 3 : 4), thrownValue);
                } finally {
                  ((task.blockedSegment = propName),
                    (task.blockedPreamble = propName$43),
                    (task.keyPath = type),
                    (task.formatContext = ref));
                }
                task = createRenderTask(
                  request,
                  null,
                  props,
                  -1,
                  newBoundary,
                  contentRootSegment,
                  newBoundary.contentPreamble,
                  newBoundary.contentState,
                  task.abortSet,
                  keyPath,
                  getSuspenseContentFormatContext(request.resumableState, task.formatContext),
                  task.context,
                  task.treeContext,
                  null,
                  newProps,
                );
                pushComponentStack(task);
                request.pingedTasks.push(task);
              } else {
                task.blockedBoundary = newBoundary;
                task.blockedPreamble = newBoundary.contentPreamble;
                task.hoistableState = newBoundary.contentState;
                task.blockedSegment = contentRootSegment;
                task.keyPath = keyPath;
                task.formatContext = getSuspenseContentFormatContext(request.resumableState, ref);
                task.row = null;
                contentRootSegment.status = 6;
                try {
                  if (
                    (renderNode(request, task, props, -1),
                    pushSegmentFinale(
                      contentRootSegment.chunks,
                      request.renderState,
                      contentRootSegment.lastPushedText,
                      contentRootSegment.textEmbedded,
                    ),
                    (contentRootSegment.status = 1),
                    queueCompletedSegment(newBoundary, contentRootSegment),
                    0 === newBoundary.pendingTasks && 0 === newBoundary.status)
                  ) {
                    if (((newBoundary.status = 1), !isEligibleForOutlining(request, newBoundary))) {
                      null !== prevRow &&
                        0 === --prevRow.pendingTasks &&
                        finishSuspenseListRow(request, prevRow);
                      0 === request.pendingRootTasks &&
                        task.blockedPreamble &&
                        preparePreamble(request);
                      break a;
                    }
                  } else
                    null !== prevRow &&
                      prevRow.together &&
                      tryToResolveTogetherRow(request, prevRow);
                } catch (thrownValue$30) {
                  ((newBoundary.status = 4),
                    12 === request.status
                      ? ((contentRootSegment.status = 3), (newProps = request.fatalError))
                      : ((contentRootSegment.status = 4), (newProps = thrownValue$30)),
                    (defaultProps = getThrownInfo(task.componentStack)),
                    (initialState = logRecoverableError(request, newProps, defaultProps)),
                    (newBoundary.errorDigest = initialState),
                    untrackBoundary(request, newBoundary));
                } finally {
                  ((task.blockedBoundary = parentBoundary),
                    (task.blockedPreamble = propName$43),
                    (task.hoistableState = parentHoistableState),
                    (task.blockedSegment = propName),
                    (task.keyPath = type),
                    (task.formatContext = ref),
                    (task.row = prevRow));
                }
                task = createRenderTask(
                  request,
                  null,
                  fallback,
                  -1,
                  parentBoundary,
                  boundarySegment,
                  newBoundary.fallbackPreamble,
                  newBoundary.fallbackState,
                  fallbackAbortSet,
                  [keyPath[0], "Suspense Fallback", keyPath[2]],
                  getSuspenseFallbackFormatContext(request.resumableState, task.formatContext),
                  task.context,
                  task.treeContext,
                  task.row,
                  replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack),
                );
                pushComponentStack(task);
                request.pingedTasks.push(task);
              }
            }
            return;
        }
        if ("object" === typeof type && null !== type)
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              if ("ref" in props)
                for (fallback in ((newProps = {}), props))
                  "ref" !== fallback && (newProps[fallback] = props[fallback]);
              else newProps = props;
              type = renderWithHooks(request, task, keyPath, type.render, newProps, ref);
              finishFunctionComponent(
                request,
                task,
                keyPath,
                type,
                0 !== localIdCounter,
                actionStateCounter,
                actionStateMatchingIndex,
              );
              return;
            case REACT_MEMO_TYPE:
              renderElement(request, task, keyPath, type.type, props, ref);
              return;
            case REACT_CONTEXT_TYPE:
              defaultProps = props.children;
              newProps = task.keyPath;
              props = props.value;
              initialState = type._currentValue2;
              type._currentValue2 = props;
              ref = currentActiveSnapshot;
              currentActiveSnapshot = type = {
                parent: ref,
                depth: null === ref ? 0 : ref.depth + 1,
                context: type,
                parentValue: initialState,
                value: props,
              };
              task.context = type;
              task.keyPath = keyPath;
              renderNodeDestructive(request, task, defaultProps, -1);
              request = currentActiveSnapshot;
              if (null === request) throw Error(formatProdErrorMessage(403));
              request.context._currentValue2 = request.parentValue;
              request = currentActiveSnapshot = request.parent;
              task.context = request;
              task.keyPath = newProps;
              return;
            case REACT_CONSUMER_TYPE:
              props = props.children;
              type = props(type._context._currentValue2);
              props = task.keyPath;
              task.keyPath = keyPath;
              renderNodeDestructive(request, task, type, -1);
              task.keyPath = props;
              return;
            case REACT_LAZY_TYPE:
              newProps = type._init;
              type = newProps(type._payload);
              if (12 === request.status) throw null;
              renderElement(request, task, keyPath, type, props, ref);
              return;
          }
        throw Error(formatProdErrorMessage(130, null == type ? type : typeof type, ""));
      }
    }
    function resumeNode(request, task, segmentId, node, childIndex) {
      var prevReplay = task.replay,
        blockedBoundary = task.blockedBoundary,
        resumedSegment = createPendingSegment(request, 0, null, task.formatContext, !1, !1);
      resumedSegment.id = segmentId;
      resumedSegment.parentFlushed = !0;
      try {
        ((task.replay = null),
          (task.blockedSegment = resumedSegment),
          renderNode(request, task, node, childIndex),
          (resumedSegment.status = 1),
          null === blockedBoundary
            ? (request.completedRootSegment = resumedSegment)
            : (queueCompletedSegment(blockedBoundary, resumedSegment),
              blockedBoundary.parentFlushed && request.partialBoundaries.push(blockedBoundary)));
      } finally {
        ((task.replay = prevReplay), (task.blockedSegment = null));
      }
    }
    function renderNodeDestructive(request, task, node, childIndex) {
      null !== task.replay && "number" === typeof task.replay.slots
        ? resumeNode(request, task, task.replay.slots, node, childIndex)
        : ((task.node = node),
          (task.childIndex = childIndex),
          (node = task.componentStack),
          pushComponentStack(task),
          retryNode(request, task),
          (task.componentStack = node));
    }
    function retryNode(request, task) {
      var node = task.node,
        childIndex = task.childIndex;
      if (null !== node) {
        if ("object" === typeof node) {
          switch (node.$$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = node.type,
                key = node.key,
                props = node.props;
              node = props.ref;
              var ref = void 0 !== node ? node : null,
                name = getComponentNameFromType(type),
                keyOrIndex = null == key ? (-1 === childIndex ? 0 : childIndex) : key;
              key = [task.keyPath, name, keyOrIndex];
              if (null !== task.replay)
                a: {
                  var replay = task.replay;
                  childIndex = replay.nodes;
                  for (node = 0; node < childIndex.length; node++) {
                    var node$jscomp$0 = childIndex[node];
                    if (keyOrIndex === node$jscomp$0[1]) {
                      if (4 === node$jscomp$0.length) {
                        if (null !== name && name !== node$jscomp$0[0])
                          throw Error(formatProdErrorMessage(490, node$jscomp$0[0], name));
                        var childNodes = node$jscomp$0[2];
                        name = node$jscomp$0[3];
                        keyOrIndex = task.node;
                        task.replay = {
                          nodes: childNodes,
                          slots: name,
                          pendingTasks: 1,
                        };
                        try {
                          renderElement(request, task, key, type, props, ref);
                          if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                            throw Error(formatProdErrorMessage(488));
                          task.replay.pendingTasks--;
                        } catch (x) {
                          if (
                            "object" === typeof x &&
                            null !== x &&
                            (x === SuspenseException || "function" === typeof x.then)
                          )
                            throw (
                              task.node === keyOrIndex
                                ? (task.replay = replay)
                                : childIndex.splice(node, 1),
                              x
                            );
                          task.replay.pendingTasks--;
                          props = getThrownInfo(task.componentStack);
                          key = request;
                          request = task.blockedBoundary;
                          type = x;
                          props = logRecoverableError(key, type, props);
                          abortRemainingReplayNodes(key, request, childNodes, name, type, props);
                        }
                        task.replay = replay;
                      } else {
                        if (type !== REACT_SUSPENSE_TYPE)
                          throw Error(
                            formatProdErrorMessage(
                              490,
                              "Suspense",
                              getComponentNameFromType(type) || "Unknown",
                            ),
                          );
                        b: {
                          replay = void 0;
                          type = node$jscomp$0[5];
                          ref = node$jscomp$0[2];
                          name = node$jscomp$0[3];
                          keyOrIndex = null === node$jscomp$0[4] ? [] : node$jscomp$0[4][2];
                          node$jscomp$0 = null === node$jscomp$0[4] ? null : node$jscomp$0[4][3];
                          var prevKeyPath = task.keyPath,
                            prevContext = task.formatContext,
                            prevRow = task.row,
                            previousReplaySet = task.replay,
                            parentBoundary = task.blockedBoundary,
                            parentHoistableState = task.hoistableState,
                            content = props.children,
                            fallback = props.fallback,
                            fallbackAbortSet = /* @__PURE__ */ new Set();
                          props = createSuspenseBoundary(
                            request,
                            task.row,
                            fallbackAbortSet,
                            null,
                            null,
                          );
                          props.parentFlushed = !0;
                          props.rootSegmentID = type;
                          task.blockedBoundary = props;
                          task.hoistableState = props.contentState;
                          task.keyPath = key;
                          task.formatContext = getSuspenseContentFormatContext(
                            request.resumableState,
                            prevContext,
                          );
                          task.row = null;
                          task.replay = {
                            nodes: ref,
                            slots: name,
                            pendingTasks: 1,
                          };
                          try {
                            renderNode(request, task, content, -1);
                            if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                              throw Error(formatProdErrorMessage(488));
                            task.replay.pendingTasks--;
                            if (0 === props.pendingTasks && 0 === props.status) {
                              props.status = 1;
                              request.completedBoundaries.push(props);
                              break b;
                            }
                          } catch (error) {
                            ((props.status = 4),
                              (childNodes = getThrownInfo(task.componentStack)),
                              (replay = logRecoverableError(request, error, childNodes)),
                              (props.errorDigest = replay),
                              task.replay.pendingTasks--,
                              request.clientRenderedBoundaries.push(props));
                          } finally {
                            ((task.blockedBoundary = parentBoundary),
                              (task.hoistableState = parentHoistableState),
                              (task.replay = previousReplaySet),
                              (task.keyPath = prevKeyPath),
                              (task.formatContext = prevContext),
                              (task.row = prevRow));
                          }
                          childNodes = createReplayTask(
                            request,
                            null,
                            {
                              nodes: keyOrIndex,
                              slots: node$jscomp$0,
                              pendingTasks: 0,
                            },
                            fallback,
                            -1,
                            parentBoundary,
                            props.fallbackState,
                            fallbackAbortSet,
                            [key[0], "Suspense Fallback", key[2]],
                            getSuspenseFallbackFormatContext(
                              request.resumableState,
                              task.formatContext,
                            ),
                            task.context,
                            task.treeContext,
                            task.row,
                            replaceSuspenseComponentStackWithSuspenseFallbackStack(
                              task.componentStack,
                            ),
                          );
                          pushComponentStack(childNodes);
                          request.pingedTasks.push(childNodes);
                        }
                      }
                      childIndex.splice(node, 1);
                      break a;
                    }
                  }
                }
              else renderElement(request, task, key, type, props, ref);
              return;
            case REACT_PORTAL_TYPE:
              throw Error(formatProdErrorMessage(257));
            case REACT_LAZY_TYPE:
              childNodes = node._init;
              node = childNodes(node._payload);
              if (12 === request.status) throw null;
              renderNodeDestructive(request, task, node, childIndex);
              return;
          }
          if (isArrayImpl(node)) {
            renderChildrenArray(request, task, node, childIndex);
            return;
          }
          if ((childNodes = getIteratorFn(node))) {
            if ((childNodes = childNodes.call(node))) {
              node = childNodes.next();
              if (!node.done) {
                props = [];
                do (props.push(node.value), (node = childNodes.next()));
                while (!node.done);
                renderChildrenArray(request, task, props, childIndex);
              }
              return;
            }
          }
          if ("function" === typeof node.then)
            return (
              (task.thenableState = null),
              renderNodeDestructive(request, task, unwrapThenable(node), childIndex)
            );
          if (node.$$typeof === REACT_CONTEXT_TYPE)
            return renderNodeDestructive(request, task, node._currentValue2, childIndex);
          childIndex = Object.prototype.toString.call(node);
          throw Error(
            formatProdErrorMessage(
              31,
              "[object Object]" === childIndex
                ? "object with keys {" + Object.keys(node).join(", ") + "}"
                : childIndex,
            ),
          );
        }
        if ("string" === typeof node)
          ((childIndex = task.blockedSegment),
            null !== childIndex &&
              (childIndex.lastPushedText = pushTextInstance(
                childIndex.chunks,
                node,
                request.renderState,
                childIndex.lastPushedText,
              )));
        else if ("number" === typeof node || "bigint" === typeof node)
          ((childIndex = task.blockedSegment),
            null !== childIndex &&
              (childIndex.lastPushedText = pushTextInstance(
                childIndex.chunks,
                "" + node,
                request.renderState,
                childIndex.lastPushedText,
              )));
      }
    }
    function renderChildrenArray(request, task, children, childIndex) {
      var prevKeyPath = task.keyPath;
      if (
        -1 !== childIndex &&
        ((task.keyPath = [task.keyPath, "Fragment", childIndex]), null !== task.replay)
      ) {
        for (
          var replay = task.replay, replayNodes = replay.nodes, j = 0;
          j < replayNodes.length;
          j++
        ) {
          var node = replayNodes[j];
          if (node[1] === childIndex) {
            childIndex = node[2];
            node = node[3];
            task.replay = {
              nodes: childIndex,
              slots: node,
              pendingTasks: 1,
            };
            try {
              renderChildrenArray(request, task, children, -1);
              if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                throw Error(formatProdErrorMessage(488));
              task.replay.pendingTasks--;
            } catch (x) {
              if (
                "object" === typeof x &&
                null !== x &&
                (x === SuspenseException || "function" === typeof x.then)
              )
                throw x;
              task.replay.pendingTasks--;
              children = getThrownInfo(task.componentStack);
              var boundary = task.blockedBoundary,
                error = x;
              children = logRecoverableError(request, error, children);
              abortRemainingReplayNodes(request, boundary, childIndex, node, error, children);
            }
            task.replay = replay;
            replayNodes.splice(j, 1);
            break;
          }
        }
        task.keyPath = prevKeyPath;
        return;
      }
      replay = task.treeContext;
      replayNodes = children.length;
      if (null !== task.replay && ((j = task.replay.slots), null !== j && "object" === typeof j)) {
        for (childIndex = 0; childIndex < replayNodes; childIndex++)
          ((node = children[childIndex]),
            (task.treeContext = pushTreeContext(replay, replayNodes, childIndex)),
            (boundary = j[childIndex]),
            "number" === typeof boundary
              ? (resumeNode(request, task, boundary, node, childIndex), delete j[childIndex])
              : renderNode(request, task, node, childIndex));
        task.treeContext = replay;
        task.keyPath = prevKeyPath;
        return;
      }
      for (j = 0; j < replayNodes; j++)
        ((childIndex = children[j]),
          (task.treeContext = pushTreeContext(replay, replayNodes, j)),
          renderNode(request, task, childIndex, j));
      task.treeContext = replay;
      task.keyPath = prevKeyPath;
    }
    function trackPostponedBoundary(request, trackedPostpones, boundary) {
      boundary.status = 5;
      boundary.rootSegmentID = request.nextSegmentId++;
      request = boundary.trackedContentKeyPath;
      if (null === request) throw Error(formatProdErrorMessage(486));
      var fallbackReplayNode = boundary.trackedFallbackNode,
        children = [],
        boundaryNode = trackedPostpones.workingMap.get(request);
      if (void 0 === boundaryNode)
        return (
          (boundary = [
            request[1],
            request[2],
            children,
            null,
            fallbackReplayNode,
            boundary.rootSegmentID,
          ]),
          trackedPostpones.workingMap.set(request, boundary),
          addToReplayParent(boundary, request[0], trackedPostpones),
          boundary
        );
      boundaryNode[4] = fallbackReplayNode;
      boundaryNode[5] = boundary.rootSegmentID;
      return boundaryNode;
    }
    function trackPostpone(request, trackedPostpones, task, segment) {
      segment.status = 5;
      var keyPath = task.keyPath,
        boundary = task.blockedBoundary;
      if (null === boundary)
        ((segment.id = request.nextSegmentId++),
          (trackedPostpones.rootSlots = segment.id),
          null !== request.completedRootSegment && (request.completedRootSegment.status = 5));
      else {
        if (null !== boundary && 0 === boundary.status) {
          var boundaryNode = trackPostponedBoundary(request, trackedPostpones, boundary);
          if (boundary.trackedContentKeyPath === keyPath && -1 === task.childIndex) {
            -1 === segment.id &&
              (segment.id = segment.parentFlushed
                ? boundary.rootSegmentID
                : request.nextSegmentId++);
            boundaryNode[3] = segment.id;
            return;
          }
        }
        -1 === segment.id &&
          (segment.id =
            segment.parentFlushed && null !== boundary
              ? boundary.rootSegmentID
              : request.nextSegmentId++);
        if (-1 === task.childIndex)
          null === keyPath
            ? (trackedPostpones.rootSlots = segment.id)
            : ((task = trackedPostpones.workingMap.get(keyPath)),
              void 0 === task
                ? ((task = [keyPath[1], keyPath[2], [], segment.id]),
                  addToReplayParent(task, keyPath[0], trackedPostpones))
                : (task[3] = segment.id));
        else {
          if (null === keyPath) {
            if (((request = trackedPostpones.rootSlots), null === request))
              request = trackedPostpones.rootSlots = {};
            else if ("number" === typeof request) throw Error(formatProdErrorMessage(491));
          } else if (
            ((boundary = trackedPostpones.workingMap),
            (boundaryNode = boundary.get(keyPath)),
            void 0 === boundaryNode)
          )
            ((request = {}),
              (boundaryNode = [keyPath[1], keyPath[2], [], request]),
              boundary.set(keyPath, boundaryNode),
              addToReplayParent(boundaryNode, keyPath[0], trackedPostpones));
          else if (((request = boundaryNode[3]), null === request)) request = boundaryNode[3] = {};
          else if ("number" === typeof request) throw Error(formatProdErrorMessage(491));
          request[task.childIndex] = segment.id;
        }
      }
    }
    function untrackBoundary(request, boundary) {
      request = request.trackedPostpones;
      null !== request &&
        ((boundary = boundary.trackedContentKeyPath),
        null !== boundary &&
          ((boundary = request.workingMap.get(boundary)),
          void 0 !== boundary &&
            ((boundary.length = 4), (boundary[2] = []), (boundary[3] = null))));
    }
    function spawnNewSuspendedReplayTask(request, task, thenableState) {
      return createReplayTask(
        request,
        thenableState,
        task.replay,
        task.node,
        task.childIndex,
        task.blockedBoundary,
        task.hoistableState,
        task.abortSet,
        task.keyPath,
        task.formatContext,
        task.context,
        task.treeContext,
        task.row,
        task.componentStack,
      );
    }
    function spawnNewSuspendedRenderTask(request, task, thenableState) {
      var segment = task.blockedSegment,
        newSegment = createPendingSegment(
          request,
          segment.chunks.length,
          null,
          task.formatContext,
          segment.lastPushedText,
          !0,
        );
      segment.children.push(newSegment);
      segment.lastPushedText = !1;
      return createRenderTask(
        request,
        thenableState,
        task.node,
        task.childIndex,
        task.blockedBoundary,
        newSegment,
        task.blockedPreamble,
        task.hoistableState,
        task.abortSet,
        task.keyPath,
        task.formatContext,
        task.context,
        task.treeContext,
        task.row,
        task.componentStack,
      );
    }
    function renderNode(request, task, node, childIndex) {
      var previousFormatContext = task.formatContext,
        previousContext = task.context,
        previousKeyPath = task.keyPath,
        previousTreeContext = task.treeContext,
        previousComponentStack = task.componentStack,
        segment = task.blockedSegment;
      if (null === segment) {
        segment = task.replay;
        try {
          return renderNodeDestructive(request, task, node, childIndex);
        } catch (thrownValue) {
          if (
            (resetHooksState(),
            (node = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue),
            12 !== request.status && "object" === typeof node && null !== node)
          ) {
            if ("function" === typeof node.then) {
              childIndex =
                thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
              request = spawnNewSuspendedReplayTask(request, task, childIndex).ping;
              node.then(request, request);
              task.formatContext = previousFormatContext;
              task.context = previousContext;
              task.keyPath = previousKeyPath;
              task.treeContext = previousTreeContext;
              task.componentStack = previousComponentStack;
              task.replay = segment;
              switchContext(previousContext);
              return;
            }
            if ("Maximum call stack size exceeded" === node.message) {
              node = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
              node = spawnNewSuspendedReplayTask(request, task, node);
              request.pingedTasks.push(node);
              task.formatContext = previousFormatContext;
              task.context = previousContext;
              task.keyPath = previousKeyPath;
              task.treeContext = previousTreeContext;
              task.componentStack = previousComponentStack;
              task.replay = segment;
              switchContext(previousContext);
              return;
            }
          }
        }
      } else {
        var childrenLength = segment.children.length,
          chunkLength = segment.chunks.length;
        try {
          return renderNodeDestructive(request, task, node, childIndex);
        } catch (thrownValue$62) {
          if (
            (resetHooksState(),
            (segment.children.length = childrenLength),
            (segment.chunks.length = chunkLength),
            (node = thrownValue$62 === SuspenseException ? getSuspendedThenable() : thrownValue$62),
            12 !== request.status && "object" === typeof node && null !== node)
          ) {
            if ("function" === typeof node.then) {
              segment = node;
              node =
                thrownValue$62 === SuspenseException ? getThenableStateAfterSuspending() : null;
              request = spawnNewSuspendedRenderTask(request, task, node).ping;
              segment.then(request, request);
              task.formatContext = previousFormatContext;
              task.context = previousContext;
              task.keyPath = previousKeyPath;
              task.treeContext = previousTreeContext;
              task.componentStack = previousComponentStack;
              switchContext(previousContext);
              return;
            }
            if ("Maximum call stack size exceeded" === node.message) {
              segment =
                thrownValue$62 === SuspenseException ? getThenableStateAfterSuspending() : null;
              segment = spawnNewSuspendedRenderTask(request, task, segment);
              request.pingedTasks.push(segment);
              task.formatContext = previousFormatContext;
              task.context = previousContext;
              task.keyPath = previousKeyPath;
              task.treeContext = previousTreeContext;
              task.componentStack = previousComponentStack;
              switchContext(previousContext);
              return;
            }
          }
        }
      }
      task.formatContext = previousFormatContext;
      task.context = previousContext;
      task.keyPath = previousKeyPath;
      task.treeContext = previousTreeContext;
      switchContext(previousContext);
      throw node;
    }
    function abortTaskSoft(task) {
      var boundary = task.blockedBoundary,
        segment = task.blockedSegment;
      null !== segment && ((segment.status = 3), finishedTask(this, boundary, task.row, segment));
    }
    function abortRemainingReplayNodes(
      request$jscomp$0,
      boundary,
      nodes,
      slots,
      error,
      errorDigest$jscomp$0,
    ) {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (4 === node.length)
          abortRemainingReplayNodes(
            request$jscomp$0,
            boundary,
            node[2],
            node[3],
            error,
            errorDigest$jscomp$0,
          );
        else {
          node = node[5];
          var request = request$jscomp$0,
            errorDigest = errorDigest$jscomp$0,
            resumedBoundary = createSuspenseBoundary(
              request,
              null,
              /* @__PURE__ */ new Set(),
              null,
              null,
            );
          resumedBoundary.parentFlushed = !0;
          resumedBoundary.rootSegmentID = node;
          resumedBoundary.status = 4;
          resumedBoundary.errorDigest = errorDigest;
          resumedBoundary.parentFlushed && request.clientRenderedBoundaries.push(resumedBoundary);
        }
      }
      nodes.length = 0;
      if (null !== slots) {
        if (null === boundary) throw Error(formatProdErrorMessage(487));
        4 !== boundary.status &&
          ((boundary.status = 4),
          (boundary.errorDigest = errorDigest$jscomp$0),
          boundary.parentFlushed && request$jscomp$0.clientRenderedBoundaries.push(boundary));
        if ("object" === typeof slots) for (var index in slots) delete slots[index];
      }
    }
    function abortTask(task, request, error) {
      var boundary = task.blockedBoundary,
        segment = task.blockedSegment;
      if (null !== segment) {
        if (6 === segment.status) return;
        segment.status = 3;
      }
      var errorInfo = getThrownInfo(task.componentStack);
      if (null === boundary) {
        if (13 !== request.status && 14 !== request.status) {
          boundary = task.replay;
          if (null === boundary) {
            null !== request.trackedPostpones && null !== segment
              ? ((boundary = request.trackedPostpones),
                logRecoverableError(request, error, errorInfo),
                trackPostpone(request, boundary, task, segment),
                finishedTask(request, null, task.row, segment))
              : (logRecoverableError(request, error, errorInfo), fatalError(request, error));
            return;
          }
          boundary.pendingTasks--;
          0 === boundary.pendingTasks &&
            0 < boundary.nodes.length &&
            ((segment = logRecoverableError(request, error, errorInfo)),
            abortRemainingReplayNodes(
              request,
              null,
              boundary.nodes,
              boundary.slots,
              error,
              segment,
            ));
          request.pendingRootTasks--;
          0 === request.pendingRootTasks && completeShell(request);
        }
      } else {
        var trackedPostpones$63 = request.trackedPostpones;
        if (4 !== boundary.status) {
          if (null !== trackedPostpones$63 && null !== segment)
            return (
              logRecoverableError(request, error, errorInfo),
              trackPostpone(request, trackedPostpones$63, task, segment),
              boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
                return abortTask(fallbackTask, request, error);
              }),
              boundary.fallbackAbortableTasks.clear(),
              finishedTask(request, boundary, task.row, segment)
            );
          boundary.status = 4;
          segment = logRecoverableError(request, error, errorInfo);
          boundary.status = 4;
          boundary.errorDigest = segment;
          untrackBoundary(request, boundary);
          boundary.parentFlushed && request.clientRenderedBoundaries.push(boundary);
        }
        boundary.pendingTasks--;
        segment = boundary.row;
        null !== segment && 0 === --segment.pendingTasks && finishSuspenseListRow(request, segment);
        boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
          return abortTask(fallbackTask, request, error);
        });
        boundary.fallbackAbortableTasks.clear();
      }
      task = task.row;
      null !== task && 0 === --task.pendingTasks && finishSuspenseListRow(request, task);
      request.allPendingTasks--;
      0 === request.allPendingTasks && completeAll(request);
    }
    function safelyEmitEarlyPreloads(request, shellComplete) {
      try {
        var renderState = request.renderState,
          onHeaders = renderState.onHeaders;
        if (onHeaders) {
          var headers = renderState.headers;
          if (headers) {
            renderState.headers = null;
            var linkHeader = headers.preconnects;
            headers.fontPreloads &&
              (linkHeader && (linkHeader += ", "), (linkHeader += headers.fontPreloads));
            headers.highImagePreloads &&
              (linkHeader && (linkHeader += ", "), (linkHeader += headers.highImagePreloads));
            if (!shellComplete) {
              var queueIter = renderState.styles.values(),
                queueStep = queueIter.next();
              b: for (
                ;
                0 < headers.remainingCapacity && !queueStep.done;
                queueStep = queueIter.next()
              )
                for (
                  var sheetIter = queueStep.value.sheets.values(), sheetStep = sheetIter.next();
                  0 < headers.remainingCapacity && !sheetStep.done;
                  sheetStep = sheetIter.next()
                ) {
                  var sheet = sheetStep.value,
                    props = sheet.props,
                    key = props.href,
                    props$jscomp$0 = sheet.props,
                    header = getPreloadAsHeader(props$jscomp$0.href, "style", {
                      crossOrigin: props$jscomp$0.crossOrigin,
                      integrity: props$jscomp$0.integrity,
                      nonce: props$jscomp$0.nonce,
                      type: props$jscomp$0.type,
                      fetchPriority: props$jscomp$0.fetchPriority,
                      referrerPolicy: props$jscomp$0.referrerPolicy,
                      media: props$jscomp$0.media,
                    });
                  if (0 <= (headers.remainingCapacity -= header.length + 2))
                    ((renderState.resets.style[key] = PRELOAD_NO_CREDS),
                      linkHeader && (linkHeader += ", "),
                      (linkHeader += header),
                      (renderState.resets.style[key] =
                        "string" === typeof props.crossOrigin || "string" === typeof props.integrity
                          ? [props.crossOrigin, props.integrity]
                          : PRELOAD_NO_CREDS));
                  else break b;
                }
            }
            linkHeader ? onHeaders({ Link: linkHeader }) : onHeaders({});
          }
        }
      } catch (error) {
        logRecoverableError(request, error, {});
      }
    }
    function completeShell(request) {
      null === request.trackedPostpones && safelyEmitEarlyPreloads(request, !0);
      null === request.trackedPostpones && preparePreamble(request);
      request.onShellError = noop;
      request = request.onShellReady;
      request();
    }
    function completeAll(request) {
      safelyEmitEarlyPreloads(
        request,
        null === request.trackedPostpones
          ? !0
          : null === request.completedRootSegment || 5 !== request.completedRootSegment.status,
      );
      preparePreamble(request);
      request = request.onAllReady;
      request();
    }
    function queueCompletedSegment(boundary, segment) {
      if (
        0 === segment.chunks.length &&
        1 === segment.children.length &&
        null === segment.children[0].boundary &&
        -1 === segment.children[0].id
      ) {
        var childSegment = segment.children[0];
        childSegment.id = segment.id;
        childSegment.parentFlushed = !0;
        (1 !== childSegment.status && 3 !== childSegment.status && 4 !== childSegment.status) ||
          queueCompletedSegment(boundary, childSegment);
      } else boundary.completedSegments.push(segment);
    }
    function finishedTask(request, boundary, row, segment) {
      null !== row &&
        (0 === --row.pendingTasks
          ? finishSuspenseListRow(request, row)
          : row.together && tryToResolveTogetherRow(request, row));
      request.allPendingTasks--;
      if (null === boundary) {
        if (null !== segment && segment.parentFlushed) {
          if (null !== request.completedRootSegment) throw Error(formatProdErrorMessage(389));
          request.completedRootSegment = segment;
        }
        request.pendingRootTasks--;
        0 === request.pendingRootTasks && completeShell(request);
      } else if ((boundary.pendingTasks--, 4 !== boundary.status))
        if (0 === boundary.pendingTasks) {
          if (
            (0 === boundary.status && (boundary.status = 1),
            null !== segment &&
              segment.parentFlushed &&
              (1 === segment.status || 3 === segment.status) &&
              queueCompletedSegment(boundary, segment),
            boundary.parentFlushed && request.completedBoundaries.push(boundary),
            1 === boundary.status)
          )
            ((row = boundary.row),
              null !== row && hoistHoistables(row.hoistables, boundary.contentState),
              isEligibleForOutlining(request, boundary) ||
                (boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request),
                boundary.fallbackAbortableTasks.clear(),
                null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row)),
              0 === request.pendingRootTasks &&
                null === request.trackedPostpones &&
                null !== boundary.contentPreamble &&
                preparePreamble(request));
          else if (5 === boundary.status && ((boundary = boundary.row), null !== boundary)) {
            if (null !== request.trackedPostpones) {
              row = request.trackedPostpones;
              var postponedRow = boundary.next;
              if (null !== postponedRow && ((segment = postponedRow.boundaries), null !== segment))
                for (
                  postponedRow.boundaries = null, postponedRow = 0;
                  postponedRow < segment.length;
                  postponedRow++
                ) {
                  var postponedBoundary = segment[postponedRow];
                  trackPostponedBoundary(request, row, postponedBoundary);
                  finishedTask(request, postponedBoundary, null, null);
                }
            }
            0 === --boundary.pendingTasks && finishSuspenseListRow(request, boundary);
          }
        } else
          (null === segment ||
            !segment.parentFlushed ||
            (1 !== segment.status && 3 !== segment.status) ||
            (queueCompletedSegment(boundary, segment),
            1 === boundary.completedSegments.length &&
              boundary.parentFlushed &&
              request.partialBoundaries.push(boundary)),
            (boundary = boundary.row),
            null !== boundary && boundary.together && tryToResolveTogetherRow(request, boundary));
      0 === request.allPendingTasks && completeAll(request);
    }
    function performWork(request$jscomp$2) {
      if (14 !== request$jscomp$2.status && 13 !== request$jscomp$2.status) {
        var prevContext = currentActiveSnapshot,
          prevDispatcher = ReactSharedInternals.H;
        ReactSharedInternals.H = HooksDispatcher;
        var prevAsyncDispatcher = ReactSharedInternals.A;
        ReactSharedInternals.A = DefaultAsyncDispatcher;
        var prevRequest = currentRequest;
        currentRequest = request$jscomp$2;
        var prevResumableState = currentResumableState;
        currentResumableState = request$jscomp$2.resumableState;
        try {
          var pingedTasks = request$jscomp$2.pingedTasks,
            i;
          for (i = 0; i < pingedTasks.length; i++) {
            var task = pingedTasks[i],
              request = request$jscomp$2,
              segment = task.blockedSegment;
            if (null === segment) {
              var request$jscomp$0 = request;
              if (0 !== task.replay.pendingTasks) {
                switchContext(task.context);
                try {
                  "number" === typeof task.replay.slots
                    ? resumeNode(
                        request$jscomp$0,
                        task,
                        task.replay.slots,
                        task.node,
                        task.childIndex,
                      )
                    : retryNode(request$jscomp$0, task);
                  if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
                    throw Error(formatProdErrorMessage(488));
                  task.replay.pendingTasks--;
                  task.abortSet.delete(task);
                  finishedTask(request$jscomp$0, task.blockedBoundary, task.row, null);
                } catch (thrownValue) {
                  resetHooksState();
                  var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
                  if ("object" === typeof x && null !== x && "function" === typeof x.then) {
                    var ping = task.ping;
                    x.then(ping, ping);
                    task.thenableState =
                      thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                  } else {
                    task.replay.pendingTasks--;
                    task.abortSet.delete(task);
                    var errorInfo = getThrownInfo(task.componentStack);
                    request = void 0;
                    var request$jscomp$1 = request$jscomp$0,
                      boundary = task.blockedBoundary,
                      error$jscomp$0 =
                        12 === request$jscomp$0.status ? request$jscomp$0.fatalError : x,
                      replayNodes = task.replay.nodes,
                      resumeSlots = task.replay.slots;
                    request = logRecoverableError(request$jscomp$1, error$jscomp$0, errorInfo);
                    abortRemainingReplayNodes(
                      request$jscomp$1,
                      boundary,
                      replayNodes,
                      resumeSlots,
                      error$jscomp$0,
                      request,
                    );
                    request$jscomp$0.pendingRootTasks--;
                    0 === request$jscomp$0.pendingRootTasks && completeShell(request$jscomp$0);
                    request$jscomp$0.allPendingTasks--;
                    0 === request$jscomp$0.allPendingTasks && completeAll(request$jscomp$0);
                  }
                }
              }
            } else if (
              ((request$jscomp$0 = void 0),
              (request$jscomp$1 = segment),
              0 === request$jscomp$1.status)
            ) {
              request$jscomp$1.status = 6;
              switchContext(task.context);
              var childrenLength = request$jscomp$1.children.length,
                chunkLength = request$jscomp$1.chunks.length;
              try {
                (retryNode(request, task),
                  pushSegmentFinale(
                    request$jscomp$1.chunks,
                    request.renderState,
                    request$jscomp$1.lastPushedText,
                    request$jscomp$1.textEmbedded,
                  ),
                  task.abortSet.delete(task),
                  (request$jscomp$1.status = 1),
                  finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1));
              } catch (thrownValue) {
                resetHooksState();
                request$jscomp$1.children.length = childrenLength;
                request$jscomp$1.chunks.length = chunkLength;
                var x$jscomp$0 =
                  thrownValue === SuspenseException
                    ? getSuspendedThenable()
                    : 12 === request.status
                      ? request.fatalError
                      : thrownValue;
                if (12 === request.status && null !== request.trackedPostpones) {
                  var trackedPostpones = request.trackedPostpones,
                    thrownInfo = getThrownInfo(task.componentStack);
                  task.abortSet.delete(task);
                  logRecoverableError(request, x$jscomp$0, thrownInfo);
                  trackPostpone(request, trackedPostpones, task, request$jscomp$1);
                  finishedTask(request, task.blockedBoundary, task.row, request$jscomp$1);
                } else if (
                  "object" === typeof x$jscomp$0 &&
                  null !== x$jscomp$0 &&
                  "function" === typeof x$jscomp$0.then
                ) {
                  request$jscomp$1.status = 0;
                  task.thenableState =
                    thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
                  var ping$jscomp$0 = task.ping;
                  x$jscomp$0.then(ping$jscomp$0, ping$jscomp$0);
                } else {
                  var errorInfo$jscomp$0 = getThrownInfo(task.componentStack);
                  task.abortSet.delete(task);
                  request$jscomp$1.status = 4;
                  var boundary$jscomp$0 = task.blockedBoundary,
                    row = task.row;
                  null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
                  request.allPendingTasks--;
                  request$jscomp$0 = logRecoverableError(request, x$jscomp$0, errorInfo$jscomp$0);
                  if (null === boundary$jscomp$0) fatalError(request, x$jscomp$0);
                  else if ((boundary$jscomp$0.pendingTasks--, 4 !== boundary$jscomp$0.status)) {
                    boundary$jscomp$0.status = 4;
                    boundary$jscomp$0.errorDigest = request$jscomp$0;
                    untrackBoundary(request, boundary$jscomp$0);
                    var boundaryRow = boundary$jscomp$0.row;
                    null !== boundaryRow &&
                      0 === --boundaryRow.pendingTasks &&
                      finishSuspenseListRow(request, boundaryRow);
                    boundary$jscomp$0.parentFlushed &&
                      request.clientRenderedBoundaries.push(boundary$jscomp$0);
                    0 === request.pendingRootTasks &&
                      null === request.trackedPostpones &&
                      null !== boundary$jscomp$0.contentPreamble &&
                      preparePreamble(request);
                  }
                  0 === request.allPendingTasks && completeAll(request);
                }
              }
            }
          }
          pingedTasks.splice(0, i);
          null !== request$jscomp$2.destination &&
            flushCompletedQueues(request$jscomp$2, request$jscomp$2.destination);
        } catch (error) {
          (logRecoverableError(request$jscomp$2, error, {}), fatalError(request$jscomp$2, error));
        } finally {
          ((currentResumableState = prevResumableState),
            (ReactSharedInternals.H = prevDispatcher),
            (ReactSharedInternals.A = prevAsyncDispatcher),
            prevDispatcher === HooksDispatcher && switchContext(prevContext),
            (currentRequest = prevRequest));
        }
      }
    }
    function preparePreambleFromSubtree(request, segment, collectedPreambleSegments) {
      segment.preambleChildren.length && collectedPreambleSegments.push(segment.preambleChildren);
      for (var pendingPreambles = !1, i = 0; i < segment.children.length; i++)
        pendingPreambles =
          preparePreambleFromSegment(request, segment.children[i], collectedPreambleSegments) ||
          pendingPreambles;
      return pendingPreambles;
    }
    function preparePreambleFromSegment(request, segment, collectedPreambleSegments) {
      var boundary = segment.boundary;
      if (null === boundary)
        return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
      var preamble = boundary.contentPreamble,
        fallbackPreamble = boundary.fallbackPreamble;
      if (null === preamble || null === fallbackPreamble) return !1;
      switch (boundary.status) {
        case 1:
          hoistPreambleState(request.renderState, preamble);
          request.byteSize += boundary.byteSize;
          segment = boundary.completedSegments[0];
          if (!segment) throw Error(formatProdErrorMessage(391));
          return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
        case 5:
          if (null !== request.trackedPostpones) return !0;
        case 4:
          if (1 === segment.status)
            return (
              hoistPreambleState(request.renderState, fallbackPreamble),
              preparePreambleFromSubtree(request, segment, collectedPreambleSegments)
            );
        default:
          return !0;
      }
    }
    function preparePreamble(request) {
      if (request.completedRootSegment && null === request.completedPreambleSegments) {
        var collectedPreambleSegments = [],
          originalRequestByteSize = request.byteSize,
          hasPendingPreambles = preparePreambleFromSegment(
            request,
            request.completedRootSegment,
            collectedPreambleSegments,
          ),
          preamble = request.renderState.preamble;
        !1 === hasPendingPreambles || (preamble.headChunks && preamble.bodyChunks)
          ? (request.completedPreambleSegments = collectedPreambleSegments)
          : (request.byteSize = originalRequestByteSize);
      }
    }
    function flushSubtree(request, destination, segment, hoistableState) {
      segment.parentFlushed = !0;
      switch (segment.status) {
        case 0:
          segment.id = request.nextSegmentId++;
        case 5:
          return (
            (hoistableState = segment.id),
            (segment.lastPushedText = !1),
            (segment.textEmbedded = !1),
            (request = request.renderState),
            destination.push('<template id="'),
            destination.push(request.placeholderPrefix),
            (request = hoistableState.toString(16)),
            destination.push(request),
            destination.push('"></template>')
          );
        case 1:
          segment.status = 2;
          var r = !0,
            chunks = segment.chunks,
            chunkIdx = 0;
          segment = segment.children;
          for (var childIdx = 0; childIdx < segment.length; childIdx++) {
            for (r = segment[childIdx]; chunkIdx < r.index; chunkIdx++)
              destination.push(chunks[chunkIdx]);
            r = flushSegment(request, destination, r, hoistableState);
          }
          for (; chunkIdx < chunks.length - 1; chunkIdx++) destination.push(chunks[chunkIdx]);
          chunkIdx < chunks.length && (r = destination.push(chunks[chunkIdx]));
          return r;
        case 3:
          return !0;
        default:
          throw Error(formatProdErrorMessage(390));
      }
    }
    var flushedByteSize = 0;
    function flushSegment(request, destination, segment, hoistableState) {
      var boundary = segment.boundary;
      if (null === boundary) return flushSubtree(request, destination, segment, hoistableState);
      boundary.parentFlushed = !0;
      if (4 === boundary.status) {
        var row = boundary.row;
        null !== row && 0 === --row.pendingTasks && finishSuspenseListRow(request, row);
        request.renderState.generateStaticMarkup ||
          ((boundary = boundary.errorDigest),
          destination.push("<!--$!-->"),
          destination.push("<template"),
          boundary &&
            (destination.push(' data-dgst="'),
            (boundary = escapeTextForBrowser(boundary)),
            destination.push(boundary),
            destination.push('"')),
          destination.push("></template>"));
        flushSubtree(request, destination, segment, hoistableState);
        request = request.renderState.generateStaticMarkup ? !0 : destination.push("<!--/$-->");
        return request;
      }
      if (1 !== boundary.status)
        return (
          0 === boundary.status && (boundary.rootSegmentID = request.nextSegmentId++),
          0 < boundary.completedSegments.length && request.partialBoundaries.push(boundary),
          writeStartPendingSuspenseBoundary(
            destination,
            request.renderState,
            boundary.rootSegmentID,
          ),
          hoistableState && hoistHoistables(hoistableState, boundary.fallbackState),
          flushSubtree(request, destination, segment, hoistableState),
          destination.push("<!--/$-->")
        );
      if (
        !flushingPartialBoundaries &&
        isEligibleForOutlining(request, boundary) &&
        flushedByteSize + boundary.byteSize > request.progressiveChunkSize
      )
        return (
          (boundary.rootSegmentID = request.nextSegmentId++),
          request.completedBoundaries.push(boundary),
          writeStartPendingSuspenseBoundary(
            destination,
            request.renderState,
            boundary.rootSegmentID,
          ),
          flushSubtree(request, destination, segment, hoistableState),
          destination.push("<!--/$-->")
        );
      flushedByteSize += boundary.byteSize;
      hoistableState && hoistHoistables(hoistableState, boundary.contentState);
      segment = boundary.row;
      null !== segment &&
        isEligibleForOutlining(request, boundary) &&
        0 === --segment.pendingTasks &&
        finishSuspenseListRow(request, segment);
      request.renderState.generateStaticMarkup || destination.push("<!--$-->");
      segment = boundary.completedSegments;
      if (1 !== segment.length) throw Error(formatProdErrorMessage(391));
      flushSegment(request, destination, segment[0], hoistableState);
      request = request.renderState.generateStaticMarkup ? !0 : destination.push("<!--/$-->");
      return request;
    }
    function flushSegmentContainer(request, destination, segment, hoistableState) {
      writeStartSegment(destination, request.renderState, segment.parentFormatContext, segment.id);
      flushSegment(request, destination, segment, hoistableState);
      return writeEndSegment(destination, segment.parentFormatContext);
    }
    function flushCompletedBoundary(request, destination, boundary) {
      flushedByteSize = boundary.byteSize;
      for (
        var completedSegments = boundary.completedSegments, i = 0;
        i < completedSegments.length;
        i++
      )
        flushPartiallyCompletedSegment(request, destination, boundary, completedSegments[i]);
      completedSegments.length = 0;
      completedSegments = boundary.row;
      null !== completedSegments &&
        isEligibleForOutlining(request, boundary) &&
        0 === --completedSegments.pendingTasks &&
        finishSuspenseListRow(request, completedSegments);
      writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
      completedSegments = request.resumableState;
      request = request.renderState;
      i = boundary.rootSegmentID;
      boundary = boundary.contentState;
      var requiresStyleInsertion = request.stylesToHoist;
      request.stylesToHoist = !1;
      destination.push(request.startInlineScript);
      destination.push(">");
      requiresStyleInsertion
        ? (0 === (completedSegments.instructions & 4) &&
            ((completedSegments.instructions |= 4),
            destination.push(
              '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};',
            )),
          0 === (completedSegments.instructions & 2) &&
            ((completedSegments.instructions |= 2),
            destination.push(
              '$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};',
            )),
          0 === (completedSegments.instructions & 8)
            ? ((completedSegments.instructions |= 8),
              destination.push(
                '$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll("link[data-precedence],style[data-precedence]"),v=[],k=0;b=e[k++];)"not all"===b.getAttribute("media")?v.push(b):("LINK"===b.tagName&&$RM.set(b.getAttribute("href"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement("link");a.href=d;a.rel=\n"stylesheet";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute("media");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n"$~";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,"CSS failed to load"))};$RR("',
              ))
            : destination.push('$RR("'))
        : (0 === (completedSegments.instructions & 2) &&
            ((completedSegments.instructions |= 2),
            destination.push(
              '$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};',
            )),
          destination.push('$RC("'));
      completedSegments = i.toString(16);
      destination.push(request.boundaryPrefix);
      destination.push(completedSegments);
      destination.push('","');
      destination.push(request.segmentPrefix);
      destination.push(completedSegments);
      requiresStyleInsertion
        ? (destination.push('",'), writeStyleResourceDependenciesInJS(destination, boundary))
        : destination.push('"');
      boundary = destination.push(")<\/script>");
      return writeBootstrap(destination, request) && boundary;
    }
    function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
      if (2 === segment.status) return !0;
      var hoistableState = boundary.contentState,
        segmentID = segment.id;
      if (-1 === segmentID) {
        if (-1 === (segment.id = boundary.rootSegmentID)) throw Error(formatProdErrorMessage(392));
        return flushSegmentContainer(request, destination, segment, hoistableState);
      }
      if (segmentID === boundary.rootSegmentID)
        return flushSegmentContainer(request, destination, segment, hoistableState);
      flushSegmentContainer(request, destination, segment, hoistableState);
      boundary = request.resumableState;
      request = request.renderState;
      destination.push(request.startInlineScript);
      destination.push(">");
      0 === (boundary.instructions & 1)
        ? ((boundary.instructions |= 1),
          destination.push(
            '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("',
          ))
        : destination.push('$RS("');
      destination.push(request.segmentPrefix);
      segmentID = segmentID.toString(16);
      destination.push(segmentID);
      destination.push('","');
      destination.push(request.placeholderPrefix);
      destination.push(segmentID);
      destination = destination.push('")<\/script>');
      return destination;
    }
    var flushingPartialBoundaries = !1;
    function flushCompletedQueues(request, destination) {
      try {
        if (!(0 < request.pendingRootTasks)) {
          var i,
            completedRootSegment = request.completedRootSegment;
          if (null !== completedRootSegment) {
            if (5 === completedRootSegment.status) return;
            var completedPreambleSegments = request.completedPreambleSegments;
            if (null === completedPreambleSegments) return;
            flushedByteSize = request.byteSize;
            var resumableState = request.resumableState,
              renderState = request.renderState,
              preamble = renderState.preamble,
              htmlChunks = preamble.htmlChunks,
              headChunks = preamble.headChunks,
              i$jscomp$0;
            if (htmlChunks) {
              for (i$jscomp$0 = 0; i$jscomp$0 < htmlChunks.length; i$jscomp$0++)
                destination.push(htmlChunks[i$jscomp$0]);
              if (headChunks)
                for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
                  destination.push(headChunks[i$jscomp$0]);
              else {
                var chunk = startChunkForTag("head");
                destination.push(chunk);
                destination.push(">");
              }
            } else if (headChunks)
              for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
                destination.push(headChunks[i$jscomp$0]);
            var charsetChunks = renderState.charsetChunks;
            for (i$jscomp$0 = 0; i$jscomp$0 < charsetChunks.length; i$jscomp$0++)
              destination.push(charsetChunks[i$jscomp$0]);
            charsetChunks.length = 0;
            renderState.preconnects.forEach(flushResource, destination);
            renderState.preconnects.clear();
            var viewportChunks = renderState.viewportChunks;
            for (i$jscomp$0 = 0; i$jscomp$0 < viewportChunks.length; i$jscomp$0++)
              destination.push(viewportChunks[i$jscomp$0]);
            viewportChunks.length = 0;
            renderState.fontPreloads.forEach(flushResource, destination);
            renderState.fontPreloads.clear();
            renderState.highImagePreloads.forEach(flushResource, destination);
            renderState.highImagePreloads.clear();
            currentlyFlushingRenderState = renderState;
            renderState.styles.forEach(flushStylesInPreamble, destination);
            currentlyFlushingRenderState = null;
            var importMapChunks = renderState.importMapChunks;
            for (i$jscomp$0 = 0; i$jscomp$0 < importMapChunks.length; i$jscomp$0++)
              destination.push(importMapChunks[i$jscomp$0]);
            importMapChunks.length = 0;
            renderState.bootstrapScripts.forEach(flushResource, destination);
            renderState.scripts.forEach(flushResource, destination);
            renderState.scripts.clear();
            renderState.bulkPreloads.forEach(flushResource, destination);
            renderState.bulkPreloads.clear();
            resumableState.instructions |= 32;
            var hoistableChunks = renderState.hoistableChunks;
            for (i$jscomp$0 = 0; i$jscomp$0 < hoistableChunks.length; i$jscomp$0++)
              destination.push(hoistableChunks[i$jscomp$0]);
            for (
              resumableState = hoistableChunks.length = 0;
              resumableState < completedPreambleSegments.length;
              resumableState++
            ) {
              var segments = completedPreambleSegments[resumableState];
              for (renderState = 0; renderState < segments.length; renderState++)
                flushSegment(request, destination, segments[renderState], null);
            }
            var preamble$jscomp$0 = request.renderState.preamble,
              headChunks$jscomp$0 = preamble$jscomp$0.headChunks;
            if (preamble$jscomp$0.htmlChunks || headChunks$jscomp$0) {
              var chunk$jscomp$0 = endChunkForTag("head");
              destination.push(chunk$jscomp$0);
            }
            var bodyChunks = preamble$jscomp$0.bodyChunks;
            if (bodyChunks)
              for (
                completedPreambleSegments = 0;
                completedPreambleSegments < bodyChunks.length;
                completedPreambleSegments++
              )
                destination.push(bodyChunks[completedPreambleSegments]);
            flushSegment(request, destination, completedRootSegment, null);
            request.completedRootSegment = null;
            var renderState$jscomp$0 = request.renderState;
            if (
              0 !== request.allPendingTasks ||
              0 !== request.clientRenderedBoundaries.length ||
              0 !== request.completedBoundaries.length ||
              (null !== request.trackedPostpones &&
                (0 !== request.trackedPostpones.rootNodes.length ||
                  null !== request.trackedPostpones.rootSlots))
            ) {
              var resumableState$jscomp$0 = request.resumableState;
              if (0 === (resumableState$jscomp$0.instructions & 64)) {
                resumableState$jscomp$0.instructions |= 64;
                destination.push(renderState$jscomp$0.startInlineScript);
                if (0 === (resumableState$jscomp$0.instructions & 32)) {
                  resumableState$jscomp$0.instructions |= 32;
                  var shellId = "_" + resumableState$jscomp$0.idPrefix + "R_";
                  destination.push(' id="');
                  var chunk$jscomp$1 = escapeTextForBrowser(shellId);
                  destination.push(chunk$jscomp$1);
                  destination.push('"');
                }
                destination.push(">");
                destination.push("requestAnimationFrame(function(){$RT=performance.now()});");
                destination.push("<\/script>");
              }
            }
            writeBootstrap(destination, renderState$jscomp$0);
          }
          var renderState$jscomp$1 = request.renderState;
          completedRootSegment = 0;
          var viewportChunks$jscomp$0 = renderState$jscomp$1.viewportChunks;
          for (
            completedRootSegment = 0;
            completedRootSegment < viewportChunks$jscomp$0.length;
            completedRootSegment++
          )
            destination.push(viewportChunks$jscomp$0[completedRootSegment]);
          viewportChunks$jscomp$0.length = 0;
          renderState$jscomp$1.preconnects.forEach(flushResource, destination);
          renderState$jscomp$1.preconnects.clear();
          renderState$jscomp$1.fontPreloads.forEach(flushResource, destination);
          renderState$jscomp$1.fontPreloads.clear();
          renderState$jscomp$1.highImagePreloads.forEach(flushResource, destination);
          renderState$jscomp$1.highImagePreloads.clear();
          renderState$jscomp$1.styles.forEach(preloadLateStyles, destination);
          renderState$jscomp$1.scripts.forEach(flushResource, destination);
          renderState$jscomp$1.scripts.clear();
          renderState$jscomp$1.bulkPreloads.forEach(flushResource, destination);
          renderState$jscomp$1.bulkPreloads.clear();
          var hoistableChunks$jscomp$0 = renderState$jscomp$1.hoistableChunks;
          for (
            completedRootSegment = 0;
            completedRootSegment < hoistableChunks$jscomp$0.length;
            completedRootSegment++
          )
            destination.push(hoistableChunks$jscomp$0[completedRootSegment]);
          hoistableChunks$jscomp$0.length = 0;
          var clientRenderedBoundaries = request.clientRenderedBoundaries;
          for (i = 0; i < clientRenderedBoundaries.length; i++) {
            var boundary = clientRenderedBoundaries[i];
            renderState$jscomp$1 = destination;
            var resumableState$jscomp$1 = request.resumableState,
              renderState$jscomp$2 = request.renderState,
              id = boundary.rootSegmentID,
              errorDigest = boundary.errorDigest;
            renderState$jscomp$1.push(renderState$jscomp$2.startInlineScript);
            renderState$jscomp$1.push(">");
            0 === (resumableState$jscomp$1.instructions & 4)
              ? ((resumableState$jscomp$1.instructions |= 4),
                renderState$jscomp$1.push(
                  '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX("',
                ))
              : renderState$jscomp$1.push('$RX("');
            renderState$jscomp$1.push(renderState$jscomp$2.boundaryPrefix);
            var chunk$jscomp$2 = id.toString(16);
            renderState$jscomp$1.push(chunk$jscomp$2);
            renderState$jscomp$1.push('"');
            if (errorDigest) {
              renderState$jscomp$1.push(",");
              var chunk$jscomp$3 = escapeJSStringsForInstructionScripts(errorDigest || "");
              renderState$jscomp$1.push(chunk$jscomp$3);
            }
            var JSCompiler_inline_result = renderState$jscomp$1.push(")<\/script>");
            if (!JSCompiler_inline_result) {
              request.destination = null;
              i++;
              clientRenderedBoundaries.splice(0, i);
              return;
            }
          }
          clientRenderedBoundaries.splice(0, i);
          var completedBoundaries = request.completedBoundaries;
          for (i = 0; i < completedBoundaries.length; i++)
            if (!flushCompletedBoundary(request, destination, completedBoundaries[i])) {
              request.destination = null;
              i++;
              completedBoundaries.splice(0, i);
              return;
            }
          completedBoundaries.splice(0, i);
          flushingPartialBoundaries = !0;
          var partialBoundaries = request.partialBoundaries;
          for (i = 0; i < partialBoundaries.length; i++) {
            var boundary$69 = partialBoundaries[i];
            a: {
              clientRenderedBoundaries = request;
              boundary = destination;
              flushedByteSize = boundary$69.byteSize;
              var completedSegments = boundary$69.completedSegments;
              for (
                JSCompiler_inline_result = 0;
                JSCompiler_inline_result < completedSegments.length;
                JSCompiler_inline_result++
              )
                if (
                  !flushPartiallyCompletedSegment(
                    clientRenderedBoundaries,
                    boundary,
                    boundary$69,
                    completedSegments[JSCompiler_inline_result],
                  )
                ) {
                  JSCompiler_inline_result++;
                  completedSegments.splice(0, JSCompiler_inline_result);
                  var JSCompiler_inline_result$jscomp$0 = !1;
                  break a;
                }
              completedSegments.splice(0, JSCompiler_inline_result);
              var row = boundary$69.row;
              null !== row &&
                row.together &&
                1 === boundary$69.pendingTasks &&
                (1 === row.pendingTasks
                  ? unblockSuspenseListRow(clientRenderedBoundaries, row, row.hoistables)
                  : row.pendingTasks--);
              JSCompiler_inline_result$jscomp$0 = writeHoistablesForBoundary(
                boundary,
                boundary$69.contentState,
                clientRenderedBoundaries.renderState,
              );
            }
            if (!JSCompiler_inline_result$jscomp$0) {
              request.destination = null;
              i++;
              partialBoundaries.splice(0, i);
              return;
            }
          }
          partialBoundaries.splice(0, i);
          flushingPartialBoundaries = !1;
          var largeBoundaries = request.completedBoundaries;
          for (i = 0; i < largeBoundaries.length; i++)
            if (!flushCompletedBoundary(request, destination, largeBoundaries[i])) {
              request.destination = null;
              i++;
              largeBoundaries.splice(0, i);
              return;
            }
          largeBoundaries.splice(0, i);
        }
      } finally {
        ((flushingPartialBoundaries = !1),
          0 === request.allPendingTasks &&
            0 === request.clientRenderedBoundaries.length &&
            0 === request.completedBoundaries.length &&
            ((request.flushScheduled = !1),
            (i = request.resumableState),
            i.hasBody &&
              ((partialBoundaries = endChunkForTag("body")), destination.push(partialBoundaries)),
            i.hasHtml && ((i = endChunkForTag("html")), destination.push(i)),
            (request.status = 14),
            destination.push(null),
            (request.destination = null)));
      }
    }
    function enqueueFlush(request) {
      if (
        !1 === request.flushScheduled &&
        0 === request.pingedTasks.length &&
        null !== request.destination
      ) {
        request.flushScheduled = !0;
        var destination = request.destination;
        destination ? flushCompletedQueues(request, destination) : (request.flushScheduled = !1);
      }
    }
    function startFlowing(request, destination) {
      if (13 === request.status) ((request.status = 14), destination.destroy(request.fatalError));
      else if (14 !== request.status && null === request.destination) {
        request.destination = destination;
        try {
          flushCompletedQueues(request, destination);
        } catch (error) {
          (logRecoverableError(request, error, {}), fatalError(request, error));
        }
      }
    }
    function abort(request, reason) {
      if (11 === request.status || 10 === request.status) request.status = 12;
      try {
        var abortableTasks = request.abortableTasks;
        if (0 < abortableTasks.size) {
          var error =
            void 0 === reason
              ? Error(formatProdErrorMessage(432))
              : "object" === typeof reason && null !== reason && "function" === typeof reason.then
                ? Error(formatProdErrorMessage(530))
                : reason;
          request.fatalError = error;
          abortableTasks.forEach(function (task) {
            return abortTask(task, request, error);
          });
          abortableTasks.clear();
        }
        null !== request.destination && flushCompletedQueues(request, request.destination);
      } catch (error$71) {
        (logRecoverableError(request, error$71, {}), fatalError(request, error$71));
      }
    }
    function addToReplayParent(node, parentKeyPath, trackedPostpones) {
      if (null === parentKeyPath) trackedPostpones.rootNodes.push(node);
      else {
        var workingMap = trackedPostpones.workingMap,
          parentNode = workingMap.get(parentKeyPath);
        void 0 === parentNode &&
          ((parentNode = [parentKeyPath[1], parentKeyPath[2], [], null]),
          workingMap.set(parentKeyPath, parentNode),
          addToReplayParent(parentNode, parentKeyPath[0], trackedPostpones));
        parentNode[2].push(node);
      }
    }
    function onError() {}
    function renderToStringImpl(children, options, generateStaticMarkup, abortReason) {
      var didFatal = !1,
        fatalError = null,
        result = "",
        readyToStream = !1;
      options = createResumableState(options ? options.identifierPrefix : void 0);
      children = createRequest(
        children,
        options,
        createRenderState(options, generateStaticMarkup),
        createFormatContext(0, null, 0, null),
        Infinity,
        onError,
        void 0,
        function () {
          readyToStream = !0;
        },
        void 0,
        void 0,
        void 0,
      );
      children.flushScheduled = null !== children.destination;
      performWork(children);
      10 === children.status && (children.status = 11);
      null === children.trackedPostpones &&
        safelyEmitEarlyPreloads(children, 0 === children.pendingRootTasks);
      abort(children, abortReason);
      startFlowing(children, {
        push: function (chunk) {
          null !== chunk && (result += chunk);
          return !0;
        },
        destroy: function (error) {
          didFatal = !0;
          fatalError = error;
        },
      });
      if (didFatal && fatalError !== abortReason) throw fatalError;
      if (!readyToStream) throw Error(formatProdErrorMessage(426));
      return result;
    }
    exports.renderToStaticMarkup = function (children, options) {
      return renderToStringImpl(
        children,
        options,
        !0,
        'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server',
      );
    };
    exports.renderToString = function (children, options) {
      return renderToStringImpl(
        children,
        options,
        !1,
        'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server',
      );
    };
    exports.version = "19.2.4";
  },
);
//#endregion
//#region ../../node_modules/.bun/react-dom@19.2.4+b1ab299f0a400331/node_modules/react-dom/server.edge.js
const require_server_edge = /* @__PURE__ */ __commonJSMin((exports) => {
  var b;
  var l;
  b = require_react_dom_server_edge_production();
  l = require_react_dom_server_legacy_browser_production();
  exports.version = b.version;
  exports.renderToReadableStream = b.renderToReadableStream;
  exports.renderToString = l.renderToString;
  exports.renderToStaticMarkup = l.renderToStaticMarkup;
  exports.resume = b.resume;
});
//#endregion
//#region ../../node_modules/.bun/@astrojs+react@5.0.2+a751bdad789b034d/node_modules/@astrojs/react/dist/context.js
const import_react = /* @__PURE__ */ __toESM(require_react(), 1);
const import_server_edge = /* @__PURE__ */ __toESM(require_server_edge(), 1);
const contexts = /* @__PURE__ */ new WeakMap();
const ID_PREFIX = "r";
function getContext(rendererContextResult) {
  if (contexts.has(rendererContextResult)) return contexts.get(rendererContextResult);
  const ctx = {
    currentIndex: 0,
    get id() {
      return ID_PREFIX + this.currentIndex.toString();
    },
  };
  contexts.set(rendererContextResult, ctx);
  return ctx;
}
function incrementId(rendererContextResult) {
  const ctx = getContext(rendererContextResult);
  const id = ctx.id;
  ctx.currentIndex++;
  return id;
}
//#endregion
//#region ../../node_modules/.bun/@astrojs+react@5.0.2+a751bdad789b034d/node_modules/@astrojs/react/dist/static-html.js
const StaticHtml = ({ value, name, hydrate = true }) => {
  if (value == null || value.trim() === "") return null;
  return (0, import_react.createElement)(hydrate ? "astro-slot" : "astro-static-slot", {
    name,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: value },
  });
};
const static_html_default = (0, import_react.memo)(StaticHtml, () => true);
//#endregion
//#region ../../node_modules/.bun/picomatch@4.0.4/node_modules/picomatch/lib/constants.js
const require_constants = /* @__PURE__ */ __commonJSMin((exports, module) => {
  var WIN_SLASH = "\\\\/";
  var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
  var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
  /**
   * Posix glob regex
   */
  var DOT_LITERAL = "\\.";
  var PLUS_LITERAL = "\\+";
  var QMARK_LITERAL = "\\?";
  var SLASH_LITERAL = "\\/";
  var ONE_CHAR = "(?=.)";
  var QMARK = "[^/]";
  var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  var POSIX_CHARS = {
    DOT_LITERAL,
    PLUS_LITERAL,
    QMARK_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    QMARK,
    END_ANCHOR,
    DOTS_SLASH,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!${START_ANCHOR}${DOTS_SLASH})`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`,
    NO_DOTS_SLASH: `(?!${DOTS_SLASH})`,
    QMARK_NO_DOT: `[^.${SLASH_LITERAL}]`,
    STAR: `${QMARK}*?`,
    START_ANCHOR,
    SEP: "/",
  };
  /**
   * Windows glob regex
   */
  var WINDOWS_CHARS = {
    ...POSIX_CHARS,
    SLASH_LITERAL: `[${WIN_SLASH}]`,
    QMARK: WIN_NO_SLASH,
    STAR: `${WIN_NO_SLASH}*?`,
    DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
    NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
    START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
    END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
    SEP: "\\",
  };
  module.exports = {
    DEFAULT_MAX_EXTGLOB_RECURSION,
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE: {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9",
    },
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    REPLACEMENTS: {
      __proto__: null,
      "***": "*",
      "**/**": "**",
      "**/**/**": "**",
    },
    CHAR_0: 48,
    CHAR_9: 57,
    CHAR_UPPERCASE_A: 65,
    CHAR_LOWERCASE_A: 97,
    CHAR_UPPERCASE_Z: 90,
    CHAR_LOWERCASE_Z: 122,
    CHAR_LEFT_PARENTHESES: 40,
    CHAR_RIGHT_PARENTHESES: 41,
    CHAR_ASTERISK: 42,
    CHAR_AMPERSAND: 38,
    CHAR_AT: 64,
    CHAR_BACKWARD_SLASH: 92,
    CHAR_CARRIAGE_RETURN: 13,
    CHAR_CIRCUMFLEX_ACCENT: 94,
    CHAR_COLON: 58,
    CHAR_COMMA: 44,
    CHAR_DOT: 46,
    CHAR_DOUBLE_QUOTE: 34,
    CHAR_EQUAL: 61,
    CHAR_EXCLAMATION_MARK: 33,
    CHAR_FORM_FEED: 12,
    CHAR_FORWARD_SLASH: 47,
    CHAR_GRAVE_ACCENT: 96,
    CHAR_HASH: 35,
    CHAR_HYPHEN_MINUS: 45,
    CHAR_LEFT_ANGLE_BRACKET: 60,
    CHAR_LEFT_CURLY_BRACE: 123,
    CHAR_LEFT_SQUARE_BRACKET: 91,
    CHAR_LINE_FEED: 10,
    CHAR_NO_BREAK_SPACE: 160,
    CHAR_PERCENT: 37,
    CHAR_PLUS: 43,
    CHAR_QUESTION_MARK: 63,
    CHAR_RIGHT_ANGLE_BRACKET: 62,
    CHAR_RIGHT_CURLY_BRACE: 125,
    CHAR_RIGHT_SQUARE_BRACKET: 93,
    CHAR_SEMICOLON: 59,
    CHAR_SINGLE_QUOTE: 39,
    CHAR_SPACE: 32,
    CHAR_TAB: 9,
    CHAR_UNDERSCORE: 95,
    CHAR_VERTICAL_LINE: 124,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
    extglobChars(chars) {
      return {
        "!": {
          type: "negate",
          open: "(?:(?!(?:",
          close: `))${chars.STAR})`,
        },
        "?": {
          type: "qmark",
          open: "(?:",
          close: ")?",
        },
        "+": {
          type: "plus",
          open: "(?:",
          close: ")+",
        },
        "*": {
          type: "star",
          open: "(?:",
          close: ")*",
        },
        "@": {
          type: "at",
          open: "(?:",
          close: ")",
        },
      };
    },
    globChars(win32) {
      return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
    },
  };
});
//#endregion
//#region ../../node_modules/.bun/picomatch@4.0.4/node_modules/picomatch/lib/utils.js
const require_utils = /* @__PURE__ */ __commonJSMin((exports) => {
  var { REGEX_BACKSLASH, REGEX_REMOVE_BACKSLASH, REGEX_SPECIAL_CHARS, REGEX_SPECIAL_CHARS_GLOBAL } =
    require_constants();
  exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
  exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
  exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
  exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
  exports.isWindows = () => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      const platform = navigator.platform.toLowerCase();
      return platform === "win32" || platform === "windows";
    }
    if (typeof process !== "undefined" && process.platform) return process.platform === "win32";
    return false;
  };
  exports.removeBackslashes = (str) => {
    return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
      return match === "\\" ? "" : match;
    });
  };
  exports.escapeLast = (input, char, lastIdx) => {
    const idx = input.lastIndexOf(char, lastIdx);
    if (idx === -1) return input;
    if (input[idx - 1] === "\\") return exports.escapeLast(input, char, idx - 1);
    return `${input.slice(0, idx)}\\${input.slice(idx)}`;
  };
  exports.removePrefix = (input, state = {}) => {
    let output = input;
    if (output.startsWith("./")) {
      output = output.slice(2);
      state.prefix = "./";
    }
    return output;
  };
  exports.wrapOutput = (input, state = {}, options = {}) => {
    let output = `${options.contains ? "" : "^"}(?:${input})${options.contains ? "" : "$"}`;
    if (state.negated === true) output = `(?:^(?!${output}).*$)`;
    return output;
  };
  exports.basename = (path, { windows } = {}) => {
    const segs = path.split(windows ? /[\\/]/ : "/");
    const last = segs[segs.length - 1];
    if (last === "") return segs[segs.length - 2];
    return last;
  };
});
//#endregion
//#region ../../node_modules/.bun/picomatch@4.0.4/node_modules/picomatch/lib/scan.js
const require_scan = /* @__PURE__ */ __commonJSMin((exports, module) => {
  var utils = require_utils();
  var {
    CHAR_ASTERISK,
    CHAR_AT,
    CHAR_BACKWARD_SLASH,
    CHAR_COMMA,
    CHAR_DOT,
    CHAR_EXCLAMATION_MARK,
    CHAR_FORWARD_SLASH,
    CHAR_LEFT_CURLY_BRACE,
    CHAR_LEFT_PARENTHESES,
    CHAR_LEFT_SQUARE_BRACKET,
    CHAR_PLUS,
    CHAR_QUESTION_MARK,
    CHAR_RIGHT_CURLY_BRACE,
    CHAR_RIGHT_PARENTHESES,
    CHAR_RIGHT_SQUARE_BRACKET,
  } = require_constants();
  var isPathSeparator = (code) => {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };
  var depth = (token) => {
    if (token.isPrefix !== true) token.depth = token.isGlobstar ? Infinity : 1;
  };
  /**
   * Quickly scans a glob pattern and returns an object with a handful of
   * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
   * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
   * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
   *
   * ```js
   * const pm = require('picomatch');
   * console.log(pm.scan('foo/bar/*.js'));
   * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
   * ```
   * @param {String} `str`
   * @param {Object} `options`
   * @return {Object} Returns an object with tokens and regex source string.
   * @api public
   */
  var scan = (input, options) => {
    const opts = options || {};
    const length = input.length - 1;
    const scanToEnd = opts.parts === true || opts.scanToEnd === true;
    const slashes = [];
    const tokens = [];
    const parts = [];
    let str = input;
    let index = -1;
    let start = 0;
    let lastIndex = 0;
    let isBrace = false;
    let isBracket = false;
    let isGlob = false;
    let isExtglob = false;
    let isGlobstar = false;
    let braceEscaped = false;
    let backslashes = false;
    let negated = false;
    let negatedExtglob = false;
    let finished = false;
    let braces = 0;
    let prev;
    let code;
    let token = {
      value: "",
      depth: 0,
      isGlob: false,
    };
    const eos = () => index >= length;
    const peek = () => str.charCodeAt(index + 1);
    const advance = () => {
      prev = code;
      return str.charCodeAt(++index);
    };
    while (index < length) {
      code = advance();
      let next;
      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token.backslashes = true;
        code = advance();
        if (code === CHAR_LEFT_CURLY_BRACE) braceEscaped = true;
        continue;
      }
      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }
          if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) continue;
            break;
          }
          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) continue;
            break;
          }
          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;
            if (braces === 0) {
              braceEscaped = false;
              isBrace = token.isBrace = true;
              finished = true;
              break;
            }
          }
        }
        if (scanToEnd === true) continue;
        break;
      }
      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token);
        token = {
          value: "",
          depth: 0,
          isGlob: false,
        };
        if (finished === true) continue;
        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }
        lastIndex = index + 1;
        continue;
      }
      if (opts.noext !== true) {
        if (
          (code === CHAR_PLUS ||
            code === CHAR_AT ||
            code === CHAR_ASTERISK ||
            code === CHAR_QUESTION_MARK ||
            code === CHAR_EXCLAMATION_MARK) === true &&
          peek() === CHAR_LEFT_PARENTHESES
        ) {
          isGlob = token.isGlob = true;
          isExtglob = token.isExtglob = true;
          finished = true;
          if (code === CHAR_EXCLAMATION_MARK && index === start) negatedExtglob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob = token.isGlob = true;
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
      }
      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
        isGlob = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) continue;
        break;
      }
      if (code === CHAR_QUESTION_MARK) {
        isGlob = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) continue;
        break;
      }
      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token.isBracket = true;
            isGlob = token.isGlob = true;
            finished = true;
            break;
          }
        }
        if (scanToEnd === true) continue;
        break;
      }
      if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
        negated = token.negated = true;
        start++;
        continue;
      }
      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
      if (isGlob === true) {
        finished = true;
        if (scanToEnd === true) continue;
        break;
      }
    }
    if (opts.noext === true) {
      isExtglob = false;
      isGlob = false;
    }
    let base = str;
    let prefix = "";
    let glob = "";
    if (start > 0) {
      prefix = str.slice(0, start);
      str = str.slice(start);
      lastIndex -= start;
    }
    if (base && isGlob === true && lastIndex > 0) {
      base = str.slice(0, lastIndex);
      glob = str.slice(lastIndex);
    } else if (isGlob === true) {
      base = "";
      glob = str;
    } else base = str;
    if (base && base !== "" && base !== "/" && base !== str) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) base = base.slice(0, -1);
    }
    if (opts.unescape === true) {
      if (glob) glob = utils.removeBackslashes(glob);
      if (base && backslashes === true) base = utils.removeBackslashes(base);
    }
    const state = {
      prefix,
      input,
      start,
      base,
      glob,
      isBrace,
      isBracket,
      isGlob,
      isExtglob,
      isGlobstar,
      negated,
      negatedExtglob,
    };
    if (opts.tokens === true) {
      state.maxDepth = 0;
      if (!isPathSeparator(code)) tokens.push(token);
      state.tokens = tokens;
    }
    if (opts.parts === true || opts.tokens === true) {
      let prevIndex;
      for (let idx = 0; idx < slashes.length; idx++) {
        const n = prevIndex ? prevIndex + 1 : start;
        const i = slashes[idx];
        const value = input.slice(n, i);
        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else tokens[idx].value = value;
          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }
        if (idx !== 0 || value !== "") parts.push(value);
        prevIndex = i;
      }
      if (prevIndex && prevIndex + 1 < input.length) {
        const value = input.slice(prevIndex + 1);
        parts.push(value);
        if (opts.tokens) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }
      state.slashes = slashes;
      state.parts = parts;
    }
    return state;
  };
  module.exports = scan;
});
//#endregion
//#region ../../node_modules/.bun/picomatch@4.0.4/node_modules/picomatch/lib/parse.js
const require_parse = /* @__PURE__ */ __commonJSMin((exports, module) => {
  var constants = require_constants();
  var utils = require_utils();
  /**
   * Constants
   */
  var {
    MAX_LENGTH,
    POSIX_REGEX_SOURCE,
    REGEX_NON_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_BACKREF,
    REPLACEMENTS,
  } = constants;
  /**
   * Helpers
   */
  var expandRange = (args, options) => {
    if (typeof options.expandRange === "function") return options.expandRange(...args, options);
    args.sort();
    const value = `[${args.join("-")}]`;
    try {
      new RegExp(value);
    } catch (ex) {
      return args.map((v) => utils.escapeRegex(v)).join("..");
    }
    return value;
  };
  /**
   * Create the message for a syntax error
   */
  var syntaxError = (type, char) => {
    return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
  };
  var splitTopLevel = (input) => {
    const parts = [];
    let bracket = 0;
    let paren = 0;
    let quote = 0;
    let value = "";
    let escaped = false;
    for (const ch of input) {
      if (escaped === true) {
        value += ch;
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        value += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        quote = quote === 1 ? 0 : 1;
        value += ch;
        continue;
      }
      if (quote === 0) {
        if (ch === "[") bracket++;
        else if (ch === "]" && bracket > 0) bracket--;
        else if (bracket === 0) {
          if (ch === "(") paren++;
          else if (ch === ")" && paren > 0) paren--;
          else if (ch === "|" && paren === 0) {
            parts.push(value);
            value = "";
            continue;
          }
        }
      }
      value += ch;
    }
    parts.push(value);
    return parts;
  };
  var isPlainBranch = (branch) => {
    let escaped = false;
    for (const ch of branch) {
      if (escaped === true) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (/[?*+@!()[\]{}]/.test(ch)) return false;
    }
    return true;
  };
  var normalizeSimpleBranch = (branch) => {
    let value = branch.trim();
    let changed = true;
    while (changed === true) {
      changed = false;
      if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
        value = value.slice(2, -1);
        changed = true;
      }
    }
    if (!isPlainBranch(value)) return;
    return value.replace(/\\(.)/g, "$1");
  };
  var hasRepeatedCharPrefixOverlap = (branches) => {
    const values = branches.map(normalizeSimpleBranch).filter(Boolean);
    for (let i = 0; i < values.length; i++)
      for (let j = i + 1; j < values.length; j++) {
        const a = values[i];
        const b = values[j];
        const char = a[0];
        if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) continue;
        if (a === b || a.startsWith(b) || b.startsWith(a)) return true;
      }
    return false;
  };
  var parseRepeatedExtglob = (pattern, requireEnd = true) => {
    if ((pattern[0] !== "+" && pattern[0] !== "*") || pattern[1] !== "(") return;
    let bracket = 0;
    let paren = 0;
    let quote = 0;
    let escaped = false;
    for (let i = 1; i < pattern.length; i++) {
      const ch = pattern[i];
      if (escaped === true) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        quote = quote === 1 ? 0 : 1;
        continue;
      }
      if (quote === 1) continue;
      if (ch === "[") {
        bracket++;
        continue;
      }
      if (ch === "]" && bracket > 0) {
        bracket--;
        continue;
      }
      if (bracket > 0) continue;
      if (ch === "(") {
        paren++;
        continue;
      }
      if (ch === ")") {
        paren--;
        if (paren === 0) {
          if (requireEnd === true && i !== pattern.length - 1) return;
          return {
            type: pattern[0],
            body: pattern.slice(2, i),
            end: i,
          };
        }
      }
    }
  };
  var getStarExtglobSequenceOutput = (pattern) => {
    let index = 0;
    const chars = [];
    while (index < pattern.length) {
      const match = parseRepeatedExtglob(pattern.slice(index), false);
      if (!match || match.type !== "*") return;
      const branches = splitTopLevel(match.body).map((branch) => branch.trim());
      if (branches.length !== 1) return;
      const branch = normalizeSimpleBranch(branches[0]);
      if (!branch || branch.length !== 1) return;
      chars.push(branch);
      index += match.end + 1;
    }
    if (chars.length < 1) return;
    return `${chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`}*`;
  };
  var repeatedExtglobRecursion = (pattern) => {
    let depth = 0;
    let value = pattern.trim();
    let match = parseRepeatedExtglob(value);
    while (match) {
      depth++;
      value = match.body.trim();
      match = parseRepeatedExtglob(value);
    }
    return depth;
  };
  var analyzeRepeatedExtglob = (body, options) => {
    if (options.maxExtglobRecursion === false) return { risky: false };
    const max =
      typeof options.maxExtglobRecursion === "number"
        ? options.maxExtglobRecursion
        : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
    const branches = splitTopLevel(body).map((branch) => branch.trim());
    if (branches.length > 1) {
      if (
        branches.some((branch) => branch === "") ||
        branches.some((branch) => /^[*?]+$/.test(branch)) ||
        hasRepeatedCharPrefixOverlap(branches)
      )
        return { risky: true };
    }
    for (const branch of branches) {
      const safeOutput = getStarExtglobSequenceOutput(branch);
      if (safeOutput)
        return {
          risky: true,
          safeOutput,
        };
      if (repeatedExtglobRecursion(branch) > max) return { risky: true };
    }
    return { risky: false };
  };
  /**
   * Parse the given input string.
   * @param {String} input
   * @param {Object} options
   * @return {Object}
   */
  var parse = (input, options) => {
    if (typeof input !== "string") throw new TypeError("Expected a string");
    input = REPLACEMENTS[input] || input;
    const opts = { ...options };
    const max =
      typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    let len = input.length;
    if (len > max)
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    const bos = {
      type: "bos",
      value: "",
      output: opts.prepend || "",
    };
    const tokens = [bos];
    const capture = opts.capture ? "" : "?:";
    const PLATFORM_CHARS = constants.globChars(opts.windows);
    const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
    const {
      DOT_LITERAL,
      PLUS_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR,
    } = PLATFORM_CHARS;
    const globstar = (opts) => {
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const nodot = opts.dot ? "" : NO_DOT;
    const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    let star = opts.bash === true ? globstar(opts) : STAR;
    if (opts.capture) star = `(${star})`;
    if (typeof opts.noext === "boolean") opts.noextglob = opts.noext;
    const state = {
      input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: "",
      output: "",
      prefix: "",
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens,
    };
    input = utils.removePrefix(input, state);
    len = input.length;
    const extglobs = [];
    const braces = [];
    const stack = [];
    let prev = bos;
    let value;
    /**
     * Tokenizing helpers
     */
    const eos = () => state.index === len - 1;
    const peek = (state.peek = (n = 1) => input[state.index + n]);
    const advance = (state.advance = () => input[++state.index] || "");
    const remaining = () => input.slice(state.index + 1);
    const consume = (value = "", num = 0) => {
      state.consumed += value;
      state.index += num;
    };
    const append = (token) => {
      state.output += token.output != null ? token.output : token.value;
      consume(token.value);
    };
    const negate = () => {
      let count = 1;
      while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
        advance();
        state.start++;
        count++;
      }
      if (count % 2 === 0) return false;
      state.negated = true;
      state.start++;
      return true;
    };
    const increment = (type) => {
      state[type]++;
      stack.push(type);
    };
    const decrement = (type) => {
      state[type]--;
      stack.pop();
    };
    /**
     * Push tokens onto the tokens array. This helper speeds up
     * tokenizing by 1) helping us avoid backtracking as much as possible,
     * and 2) helping us avoid creating extra tokens when consecutive
     * characters are plain text. This improves performance and simplifies
     * lookbehinds.
     */
    const push = (tok) => {
      if (prev.type === "globstar") {
        const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
        const isExtglob =
          tok.extglob === true ||
          (extglobs.length && (tok.type === "pipe" || tok.type === "paren"));
        if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "star";
          prev.value = "*";
          prev.output = star;
          state.output += prev.output;
        }
      }
      if (extglobs.length && tok.type !== "paren") extglobs[extglobs.length - 1].inner += tok.value;
      if (tok.value || tok.output) append(tok);
      if (prev && prev.type === "text" && tok.type === "text") {
        prev.output = (prev.output || prev.value) + tok.value;
        prev.value += tok.value;
        return;
      }
      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };
    const extglobOpen = (type, value) => {
      const token = {
        ...EXTGLOB_CHARS[value],
        conditions: 1,
        inner: "",
      };
      token.prev = prev;
      token.parens = state.parens;
      token.output = state.output;
      token.startIndex = state.index;
      token.tokensIndex = tokens.length;
      const output = (opts.capture ? "(" : "") + token.open;
      increment("parens");
      push({
        type,
        value,
        output: state.output ? "" : ONE_CHAR,
      });
      push({
        type: "paren",
        extglob: true,
        value: advance(),
        output,
      });
      extglobs.push(token);
    };
    const extglobClose = (token) => {
      const literal = input.slice(token.startIndex, state.index + 1);
      const analysis = analyzeRepeatedExtglob(input.slice(token.startIndex + 2, state.index), opts);
      if ((token.type === "plus" || token.type === "star") && analysis.risky) {
        const safeOutput = analysis.safeOutput
          ? (token.output ? "" : ONE_CHAR) +
            (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput)
          : void 0;
        const open = tokens[token.tokensIndex];
        open.type = "text";
        open.value = literal;
        open.output = safeOutput || utils.escapeRegex(literal);
        for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
          tokens[i].value = "";
          tokens[i].output = "";
          delete tokens[i].suffix;
        }
        state.output = token.output + open.output;
        state.backtrack = true;
        push({
          type: "paren",
          extglob: true,
          value,
          output: "",
        });
        decrement("parens");
        return;
      }
      let output = token.close + (opts.capture ? ")" : "");
      let rest;
      if (token.type === "negate") {
        let extglobStar = star;
        if (token.inner && token.inner.length > 1 && token.inner.includes("/"))
          extglobStar = globstar(opts);
        if (extglobStar !== star || eos() || /^\)+$/.test(remaining()))
          output = token.close = `)$))${extglobStar}`;
        if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest))
          output = token.close = `)${
            parse(rest, {
              ...options,
              fastpaths: false,
            }).output
          })${extglobStar})`;
        if (token.prev.type === "bos") state.negatedExtglob = true;
      }
      push({
        type: "paren",
        extglob: true,
        value,
        output,
      });
      decrement("parens");
    };
    /**
     * Fast paths
     */
    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      let backslashes = false;
      let output = input.replace(
        REGEX_SPECIAL_CHARS_BACKREF,
        (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            if (index === 0) return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            return QMARK.repeat(chars.length);
          }
          if (first === ".") return DOT_LITERAL.repeat(chars.length);
          if (first === "*") {
            if (esc) return esc + first + (rest ? star : "");
            return star;
          }
          return esc ? m : `\\${m}`;
        },
      );
      if (backslashes === true)
        if (opts.unescape === true) output = output.replace(/\\/g, "");
        else
          output = output.replace(/\\+/g, (m) => {
            return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
          });
      if (output === input && opts.contains === true) {
        state.output = input;
        return state;
      }
      state.output = utils.wrapOutput(output, state, options);
      return state;
    }
    /**
     * Tokenize input until we reach end-of-string
     */
    while (!eos()) {
      value = advance();
      if (value === "\0") continue;
      /**
       * Escaped characters
       */
      if (value === "\\") {
        const next = peek();
        if (next === "/" && opts.bash !== true) continue;
        if (next === "." || next === ";") continue;
        if (!next) {
          value += "\\";
          push({
            type: "text",
            value,
          });
          continue;
        }
        const match = /^\\+/.exec(remaining());
        let slashes = 0;
        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;
          if (slashes % 2 !== 0) value += "\\";
        }
        if (opts.unescape === true) value = advance();
        else value += advance();
        if (state.brackets === 0) {
          push({
            type: "text",
            value,
          });
          continue;
        }
      }
      /**
       * If we're inside a regex character class, continue
       * until we reach the closing bracket.
       */
      if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
        if (opts.posix !== false && value === ":") {
          const inner = prev.value.slice(1);
          if (inner.includes("[")) {
            prev.posix = true;
            if (inner.includes(":")) {
              const idx = prev.value.lastIndexOf("[");
              const pre = prev.value.slice(0, idx);
              const posix = POSIX_REGEX_SOURCE[prev.value.slice(idx + 2)];
              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();
                if (!bos.output && tokens.indexOf(prev) === 1) bos.output = ONE_CHAR;
                continue;
              }
            }
          }
        }
        if ((value === "[" && peek() !== ":") || (value === "-" && peek() === "]"))
          value = `\\${value}`;
        if (value === "]" && (prev.value === "[" || prev.value === "[^")) value = `\\${value}`;
        if (opts.posix === true && value === "!" && prev.value === "[") value = "^";
        prev.value += value;
        append({ value });
        continue;
      }
      /**
       * If we're inside a quoted string, continue
       * until we reach the closing double quote.
       */
      if (state.quotes === 1 && value !== '"') {
        value = utils.escapeRegex(value);
        prev.value += value;
        append({ value });
        continue;
      }
      /**
       * Double quotes
       */
      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;
        if (opts.keepQuotes === true)
          push({
            type: "text",
            value,
          });
        continue;
      }
      /**
       * Parentheses
       */
      if (value === "(") {
        increment("parens");
        push({
          type: "paren",
          value,
        });
        continue;
      }
      if (value === ")") {
        if (state.parens === 0 && opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("opening", "("));
        const extglob = extglobs[extglobs.length - 1];
        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }
        push({
          type: "paren",
          value,
          output: state.parens ? ")" : "\\)",
        });
        decrement("parens");
        continue;
      }
      /**
       * Square brackets
       */
      if (value === "[") {
        if (opts.nobracket === true || !remaining().includes("]")) {
          if (opts.nobracket !== true && opts.strictBrackets === true)
            throw new SyntaxError(syntaxError("closing", "]"));
          value = `\\${value}`;
        } else increment("brackets");
        push({
          type: "bracket",
          value,
        });
        continue;
      }
      if (value === "]") {
        if (
          opts.nobracket === true ||
          (prev && prev.type === "bracket" && prev.value.length === 1)
        ) {
          push({
            type: "text",
            value,
            output: `\\${value}`,
          });
          continue;
        }
        if (state.brackets === 0) {
          if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("opening", "["));
          push({
            type: "text",
            value,
            output: `\\${value}`,
          });
          continue;
        }
        decrement("brackets");
        const prevValue = prev.value.slice(1);
        if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/"))
          value = `/${value}`;
        prev.value += value;
        append({ value });
        if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) continue;
        const escaped = utils.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length);
        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        }
        prev.value = `(${capture}${escaped}|${prev.value})`;
        state.output += prev.value;
        continue;
      }
      /**
       * Braces
       */
      if (value === "{" && opts.nobrace !== true) {
        increment("braces");
        const open = {
          type: "brace",
          value,
          output: "(",
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length,
        };
        braces.push(open);
        push(open);
        continue;
      }
      if (value === "}") {
        const brace = braces[braces.length - 1];
        if (opts.nobrace === true || !brace) {
          push({
            type: "text",
            value,
            output: value,
          });
          continue;
        }
        let output = ")";
        if (brace.dots === true) {
          const arr = tokens.slice();
          const range = [];
          for (let i = arr.length - 1; i >= 0; i--) {
            tokens.pop();
            if (arr[i].type === "brace") break;
            if (arr[i].type !== "dots") range.unshift(arr[i].value);
          }
          output = expandRange(range, opts);
          state.backtrack = true;
        }
        if (brace.comma !== true && brace.dots !== true) {
          const out = state.output.slice(0, brace.outputIndex);
          const toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = "\\{";
          value = output = "\\}";
          state.output = out;
          for (const t of toks) state.output += t.output || t.value;
        }
        push({
          type: "brace",
          value,
          output,
        });
        decrement("braces");
        braces.pop();
        continue;
      }
      /**
       * Pipes
       */
      if (value === "|") {
        if (extglobs.length > 0) extglobs[extglobs.length - 1].conditions++;
        push({
          type: "text",
          value,
        });
        continue;
      }
      /**
       * Commas
       */
      if (value === ",") {
        let output = value;
        const brace = braces[braces.length - 1];
        if (brace && stack[stack.length - 1] === "braces") {
          brace.comma = true;
          output = "|";
        }
        push({
          type: "comma",
          value,
          output,
        });
        continue;
      }
      /**
       * Slashes
       */
      if (value === "/") {
        if (prev.type === "dot" && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = "";
          state.output = "";
          tokens.pop();
          prev = bos;
          continue;
        }
        push({
          type: "slash",
          value,
          output: SLASH_LITERAL,
        });
        continue;
      }
      /**
       * Dots
       */
      if (value === ".") {
        if (state.braces > 0 && prev.type === "dot") {
          if (prev.value === ".") prev.output = DOT_LITERAL;
          const brace = braces[braces.length - 1];
          prev.type = "dots";
          prev.output += value;
          prev.value += value;
          brace.dots = true;
          continue;
        }
        if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
          push({
            type: "text",
            value,
            output: DOT_LITERAL,
          });
          continue;
        }
        push({
          type: "dot",
          value,
          output: DOT_LITERAL,
        });
        continue;
      }
      /**
       * Question marks
       */
      if (value === "?") {
        if (
          !(prev && prev.value === "(") &&
          opts.noextglob !== true &&
          peek() === "(" &&
          peek(2) !== "?"
        ) {
          extglobOpen("qmark", value);
          continue;
        }
        if (prev && prev.type === "paren") {
          const next = peek();
          let output = value;
          if (
            (prev.value === "(" && !/[!=<:]/.test(next)) ||
            (next === "<" && !/<([!=]|\w+>)/.test(remaining()))
          )
            output = `\\${value}`;
          push({
            type: "text",
            value,
            output,
          });
          continue;
        }
        if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
          push({
            type: "qmark",
            value,
            output: QMARK_NO_DOT,
          });
          continue;
        }
        push({
          type: "qmark",
          value,
          output: QMARK,
        });
        continue;
      }
      /**
       * Exclamation
       */
      if (value === "!") {
        if (opts.noextglob !== true && peek() === "(") {
          if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
            extglobOpen("negate", value);
            continue;
          }
        }
        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }
      /**
       * Plus
       */
      if (value === "+") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("plus", value);
          continue;
        }
        if ((prev && prev.value === "(") || opts.regex === false) {
          push({
            type: "plus",
            value,
            output: PLUS_LITERAL,
          });
          continue;
        }
        if (
          (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace")) ||
          state.parens > 0
        ) {
          push({
            type: "plus",
            value,
          });
          continue;
        }
        push({
          type: "plus",
          value: PLUS_LITERAL,
        });
        continue;
      }
      /**
       * Plain text
       */
      if (value === "@") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          push({
            type: "at",
            extglob: true,
            value,
            output: "",
          });
          continue;
        }
        push({
          type: "text",
          value,
        });
        continue;
      }
      /**
       * Plain text
       */
      if (value !== "*") {
        if (value === "$" || value === "^") value = `\\${value}`;
        const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
        if (match) {
          value += match[0];
          state.index += match[0].length;
        }
        push({
          type: "text",
          value,
        });
        continue;
      }
      /**
       * Stars
       */
      if (prev && (prev.type === "globstar" || prev.star === true)) {
        prev.type = "star";
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }
      let rest = remaining();
      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen("star", value);
        continue;
      }
      if (prev.type === "star") {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }
        const prior = prev.prev;
        const before = prior.prev;
        const isStart = prior.type === "slash" || prior.type === "bos";
        const afterStar = before && (before.type === "star" || before.type === "globstar");
        if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== "/"))) {
          push({
            type: "star",
            value,
            output: "",
          });
          continue;
        }
        const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
        const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
        if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
          push({
            type: "star",
            value,
            output: "",
          });
          continue;
        }
        while (rest.slice(0, 3) === "/**") {
          const after = input[state.index + 4];
          if (after && after !== "/") break;
          rest = rest.slice(3);
          consume("/**", 3);
        }
        if (prior.type === "bos" && eos()) {
          prev.type = "globstar";
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
          const end = rest[1] !== void 0 ? "|$" : "";
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
          prev.value += value;
          state.output += prior.output + prev.output;
          state.globstar = true;
          consume(value + advance());
          push({
            type: "slash",
            value: "/",
            output: "",
          });
          continue;
        }
        if (prior.type === "bos" && rest[0] === "/") {
          prev.type = "globstar";
          prev.value += value;
          prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({
            type: "slash",
            value: "/",
            output: "",
          });
          continue;
        }
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = "globstar";
        prev.output = globstar(opts);
        prev.value += value;
        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      const token = {
        type: "star",
        value,
        output: star,
      };
      if (opts.bash === true) {
        token.output = ".*?";
        if (prev.type === "bos" || prev.type === "slash") token.output = nodot + token.output;
        push(token);
        continue;
      }
      if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
        token.output = value;
        push(token);
        continue;
      }
      if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
        if (prev.type === "dot") {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }
        if (peek() !== "*") {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }
      push(token);
    }
    while (state.brackets > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
      state.output = utils.escapeLast(state.output, "[");
      decrement("brackets");
    }
    while (state.parens > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
      state.output = utils.escapeLast(state.output, "(");
      decrement("parens");
    }
    while (state.braces > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
      state.output = utils.escapeLast(state.output, "{");
      decrement("braces");
    }
    if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket"))
      push({
        type: "maybe_slash",
        value: "",
        output: `${SLASH_LITERAL}?`,
      });
    if (state.backtrack === true) {
      state.output = "";
      for (const token of state.tokens) {
        state.output += token.output != null ? token.output : token.value;
        if (token.suffix) state.output += token.suffix;
      }
    }
    return state;
  };
  /**
   * Fast paths for creating regular expressions for common glob patterns.
   * This can significantly speed up processing and has very little downside
   * impact when none of the fast paths match.
   */
  parse.fastpaths = (input, options) => {
    const opts = { ...options };
    const max =
      typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    const len = input.length;
    if (len > max)
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    input = REPLACEMENTS[input] || input;
    const {
      DOT_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOTS_SLASH,
      STAR,
      START_ANCHOR,
    } = constants.globChars(opts.windows);
    const nodot = opts.dot ? NO_DOTS : NO_DOT;
    const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    const capture = opts.capture ? "" : "?:";
    const state = {
      negated: false,
      prefix: "",
    };
    let star = opts.bash === true ? ".*?" : STAR;
    if (opts.capture) star = `(${star})`;
    const globstar = (opts) => {
      if (opts.noglobstar === true) return star;
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const create = (str) => {
      switch (str) {
        case "*":
          return `${nodot}${ONE_CHAR}${star}`;
        case ".*":
          return `${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*.*":
          return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*/*":
          return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
        case "**":
          return nodot + globstar(opts);
        case "**/*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
        case "**/*.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "**/.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
        default: {
          const match = /^(.*?)\.(\w+)$/.exec(str);
          if (!match) return;
          const source = create(match[1]);
          if (!source) return;
          return source + DOT_LITERAL + match[2];
        }
      }
    };
    let source = create(utils.removePrefix(input, state));
    if (source && opts.strictSlashes !== true) source += `${SLASH_LITERAL}?`;
    return source;
  };
  module.exports = parse;
});
//#endregion
//#region ../../node_modules/.bun/picomatch@4.0.4/node_modules/picomatch/lib/picomatch.js
const require_picomatch$1 = /* @__PURE__ */ __commonJSMin((exports, module) => {
  var scan = require_scan();
  var parse = require_parse();
  var utils = require_utils();
  var constants = require_constants();
  var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
  /**
   * Creates a matcher function from one or more glob patterns. The
   * returned function takes a string to match as its first argument,
   * and returns true if the string is a match. The returned matcher
   * function also takes a boolean as the second argument that, when true,
   * returns an object with additional information.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch(glob[, options]);
   *
   * const isMatch = picomatch('*.!(*a)');
   * console.log(isMatch('a.a')); //=> false
   * console.log(isMatch('a.b')); //=> true
   * ```
   * @name picomatch
   * @param {String|Array} `globs` One or more glob patterns.
   * @param {Object=} `options`
   * @return {Function=} Returns a matcher function.
   * @api public
   */
  var picomatch = (glob, options, returnState = false) => {
    if (Array.isArray(glob)) {
      const fns = glob.map((input) => picomatch(input, options, returnState));
      const arrayMatcher = (str) => {
        for (const isMatch of fns) {
          const state = isMatch(str);
          if (state) return state;
        }
        return false;
      };
      return arrayMatcher;
    }
    const isState = isObject(glob) && glob.tokens && glob.input;
    if (glob === "" || (typeof glob !== "string" && !isState))
      throw new TypeError("Expected pattern to be a non-empty string");
    const opts = options || {};
    const posix = opts.windows;
    const regex = isState
      ? picomatch.compileRe(glob, options)
      : picomatch.makeRe(glob, options, false, true);
    const state = regex.state;
    delete regex.state;
    let isIgnored = () => false;
    if (opts.ignore) {
      const ignoreOpts = {
        ...options,
        ignore: null,
        onMatch: null,
        onResult: null,
      };
      isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
    }
    const matcher = (input, returnObject = false) => {
      const { isMatch, match, output } = picomatch.test(input, regex, options, {
        glob,
        posix,
      });
      const result = {
        glob,
        state,
        regex,
        posix,
        input,
        output,
        match,
        isMatch,
      };
      if (typeof opts.onResult === "function") opts.onResult(result);
      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (isIgnored(input)) {
        if (typeof opts.onIgnore === "function") opts.onIgnore(result);
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (typeof opts.onMatch === "function") opts.onMatch(result);
      return returnObject ? result : true;
    };
    if (returnState) matcher.state = state;
    return matcher;
  };
  /**
   * Test `input` with the given `regex`. This is used by the main
   * `picomatch()` function to test the input string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.test(input, regex[, options]);
   *
   * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
   * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp} `regex`
   * @return {Object} Returns an object with matching info.
   * @api public
   */
  picomatch.test = (input, regex, options, { glob, posix } = {}) => {
    if (typeof input !== "string") throw new TypeError("Expected input to be a string");
    if (input === "")
      return {
        isMatch: false,
        output: "",
      };
    const opts = options || {};
    const format = opts.format || (posix ? utils.toPosixSlashes : null);
    let match = input === glob;
    let output = match && format ? format(input) : input;
    if (match === false) {
      output = format ? format(input) : input;
      match = output === glob;
    }
    if (match === false || opts.capture === true)
      if (opts.matchBase === true || opts.basename === true)
        match = picomatch.matchBase(input, regex, options, posix);
      else match = regex.exec(output);
    return {
      isMatch: Boolean(match),
      match,
      output,
    };
  };
  /**
   * Match the basename of a filepath.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.matchBase(input, glob[, options]);
   * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
   * @return {Boolean}
   * @api public
   */
  picomatch.matchBase = (input, glob, options) => {
    return (glob instanceof RegExp ? glob : picomatch.makeRe(glob, options)).test(
      utils.basename(input),
    );
  };
  /**
   * Returns true if **any** of the given glob `patterns` match the specified `string`.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.isMatch(string, patterns[, options]);
   *
   * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
   * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
   * ```
   * @param {String|Array} str The string to test.
   * @param {String|Array} patterns One or more glob patterns to use for matching.
   * @param {Object} [options] See available [options](#options).
   * @return {Boolean} Returns true if any patterns match `str`
   * @api public
   */
  picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
  /**
   * Parse a glob pattern to create the source string for a regular
   * expression.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const result = picomatch.parse(pattern[, options]);
   * ```
   * @param {String} `pattern`
   * @param {Object} `options`
   * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
   * @api public
   */
  picomatch.parse = (pattern, options) => {
    if (Array.isArray(pattern)) return pattern.map((p) => picomatch.parse(p, options));
    return parse(pattern, {
      ...options,
      fastpaths: false,
    });
  };
  /**
   * Scan a glob pattern to separate the pattern into segments.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.scan(input[, options]);
   *
   * const result = picomatch.scan('!./foo/*.js');
   * console.log(result);
   * { prefix: '!./',
   *   input: '!./foo/*.js',
   *   start: 3,
   *   base: 'foo',
   *   glob: '*.js',
   *   isBrace: false,
   *   isBracket: false,
   *   isGlob: true,
   *   isExtglob: false,
   *   isGlobstar: false,
   *   negated: true }
   * ```
   * @param {String} `input` Glob pattern to scan.
   * @param {Object} `options`
   * @return {Object} Returns an object with
   * @api public
   */
  picomatch.scan = (input, options) => scan(input, options);
  /**
   * Compile a regular expression from the `state` object returned by the
   * [parse()](#parse) method.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const state = picomatch.parse('*.js');
   * // picomatch.compileRe(state[, options]);
   *
   * console.log(picomatch.compileRe(state));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {Object} `state`
   * @param {Object} `options`
   * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
   * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
   * @return {RegExp}
   * @api public
   */
  picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
    if (returnOutput === true) return state.output;
    const opts = options || {};
    const prepend = opts.contains ? "" : "^";
    const append = opts.contains ? "" : "$";
    let source = `${prepend}(?:${state.output})${append}`;
    if (state && state.negated === true) source = `^(?!${source}).*$`;
    const regex = picomatch.toRegex(source, options);
    if (returnState === true) regex.state = state;
    return regex;
  };
  /**
   * Create a regular expression from a parsed glob pattern.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.makeRe(state[, options]);
   *
   * const result = picomatch.makeRe('*.js');
   * console.log(result);
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `state` The object returned from the `.parse` method.
   * @param {Object} `options`
   * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
   * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
   * @return {RegExp} Returns a regex created from the given pattern.
   * @api public
   */
  picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
    if (!input || typeof input !== "string") throw new TypeError("Expected a non-empty string");
    let parsed = {
      negated: false,
      fastpaths: true,
    };
    if (options.fastpaths !== false && (input[0] === "." || input[0] === "*"))
      parsed.output = parse.fastpaths(input, options);
    if (!parsed.output) parsed = parse(input, options);
    return picomatch.compileRe(parsed, options, returnOutput, returnState);
  };
  /**
   * Create a regular expression from the given regex source string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.toRegex(source[, options]);
   *
   * const { output } = picomatch.parse('*.js');
   * console.log(picomatch.toRegex(output));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `source` Regular expression source string.
   * @param {Object} `options`
   * @return {RegExp}
   * @api public
   */
  picomatch.toRegex = (source, options) => {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
    } catch (err) {
      if (options && options.debug === true) throw err;
      return /$^/;
    }
  };
  /**
   * Picomatch constants.
   * @return {Object}
   */
  picomatch.constants = constants;
  /**
   * Expose "picomatch"
   */
  module.exports = picomatch;
});
//#endregion
//#region ../../node_modules/.bun/@astrojs+internal-helpers@0.8.0/node_modules/@astrojs/internal-helpers/dist/create-filter.js
const import_picomatch = /* @__PURE__ */ __toESM(
  /* @__PURE__ */ __commonJSMin((exports, module) => {
    var pico = require_picomatch$1();
    var utils = require_utils();
    function picomatch(glob, options, returnState = false) {
      if (options && (options.windows === null || options.windows === void 0))
        options = {
          ...options,
          windows: utils.isWindows(),
        };
      return pico(glob, options, returnState);
    }
    Object.assign(picomatch, pico);
    module.exports = picomatch;
  })(),
  1,
);
function ensureArray(thing) {
  if (Array.isArray(thing)) return thing;
  if (thing == null) return [];
  return [thing];
}
function toMatcher(pattern) {
  if (pattern instanceof RegExp) return pattern;
  const fn = (0, import_picomatch.default)(slash(pattern), { dot: true });
  return { test: (what) => fn(what) };
}
function createFilter(include, exclude) {
  const includeMatchers = ensureArray(include).map(toMatcher);
  const excludeMatchers = ensureArray(exclude).map(toMatcher);
  if (!includeMatchers.length && !excludeMatchers.length)
    return (id) => typeof id === "string" && !id.includes("\0");
  return function (id) {
    if (typeof id !== "string") return false;
    if (id.includes("\0")) return false;
    const pathId = slash(id);
    for (const matcher of excludeMatchers) {
      if (matcher instanceof RegExp) matcher.lastIndex = 0;
      if (matcher.test(pathId)) return false;
    }
    for (const matcher of includeMatchers) {
      if (matcher instanceof RegExp) matcher.lastIndex = 0;
      if (matcher.test(pathId)) return true;
    }
    return !includeMatchers.length;
  };
}
//#endregion
//#region ../../node_modules/.bun/@astrojs+react@5.0.2+a751bdad789b034d/node_modules/@astrojs/react/dist/server.js
const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = /* @__PURE__ */ Symbol.for("react.element");
const reactTransitionalTypeof = /* @__PURE__ */ Symbol.for("react.transitional.element");
const filter =
  _astro_react_opts_default?.include || _astro_react_opts_default?.exclude
    ? createFilter(_astro_react_opts_default.include, _astro_react_opts_default.exclude)
    : null;
async function check$1(Component, props, children, metadata) {
  if (typeof Component === "object")
    return Component["$$typeof"].toString().slice(7).startsWith("react");
  if (typeof Component !== "function") return false;
  if (Component.name === "QwikComponent") return false;
  if (
    typeof Component === "function" &&
    Component["$$typeof"] === /* @__PURE__ */ Symbol.for("react.forward_ref")
  )
    return false;
  if (Component.prototype != null && typeof Component.prototype.render === "function")
    return (
      import_react.Component.isPrototypeOf(Component) ||
      import_react.PureComponent.isPrototypeOf(Component)
    );
  if (filter && metadata?.componentUrl && !filter(metadata.componentUrl)) return false;
  let isReactComponent = false;
  function Tester(...args) {
    try {
      const vnode = Component(...args);
      if (
        vnode &&
        (vnode["$$typeof"] === reactTypeof || vnode["$$typeof"] === reactTransitionalTypeof)
      )
        isReactComponent = true;
    } catch {}
    return import_react.createElement("div");
  }
  await renderToStaticMarkup$1.call(this, Tester, props, children);
  return isReactComponent;
}
async function getNodeWritable() {
  const { Writable } = await import("node:stream");
  return Writable;
}
function needsHydration(metadata) {
  return metadata?.astroStaticSlot ? !!metadata.hydrate : true;
}
async function renderToStaticMarkup$1(
  Component,
  props,
  { default: children, ...slotted },
  metadata,
) {
  let prefix;
  if (this && this.result) prefix = incrementId(this.result);
  const attrs = { prefix };
  delete props["class"];
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName$1(key);
    slots[name] = import_react.createElement(static_html_default, {
      hydrate: needsHydration(metadata),
      value,
      name,
    });
  }
  const newProps = {
    ...props,
    ...slots,
  };
  const newChildren = children ?? props.children;
  if (children && _astro_react_opts_default.experimentalReactChildren) {
    attrs["data-react-children"] = true;
    newProps.children = (
      await import("./chunks/vnode-children_DujCEseK.mjs").then((mod) => mod.default)
    )(children);
  } else if (newChildren != null)
    newProps.children = import_react.createElement(static_html_default, {
      hydrate: needsHydration(metadata),
      value: newChildren,
    });
  const formState = this ? await getFormState(this) : void 0;
  if (formState) {
    attrs["data-action-result"] = JSON.stringify(formState[0]);
    attrs["data-action-key"] = formState[1];
    attrs["data-action-name"] = formState[2];
  }
  const vnode = import_react.createElement(Component, newProps);
  const renderOptions = {
    identifierPrefix: prefix,
    formState,
  };
  let html;
  if (_astro_react_opts_default.experimentalDisableStreaming)
    html = import_server_edge.renderToString(vnode);
  else if ("renderToReadableStream" in import_server_edge.default)
    html = await renderToReadableStreamAsync(vnode, renderOptions);
  else html = await renderToPipeableStreamAsync(vnode, renderOptions);
  return {
    html,
    attrs,
  };
}
async function getFormState({ result }) {
  const { request, actionResult } = result;
  if (!actionResult) return void 0;
  if (!isFormRequest(request.headers.get("content-type"))) return void 0;
  const { searchParams } = new URL(request.url);
  const actionKey = (await request.clone().formData()).get("$ACTION_KEY")?.toString();
  const actionName = searchParams.get("_action");
  if (!actionKey || !actionName) return void 0;
  return [actionResult, actionKey, actionName];
}
async function renderToPipeableStreamAsync(vnode, options) {
  const Writable = await getNodeWritable();
  let html = "";
  return new Promise((resolve, reject) => {
    let error = void 0;
    const stream = import_server_edge.default.renderToPipeableStream(vnode, {
      ...options,
      onError(err) {
        error = err;
        reject(error);
      },
      onAllReady() {
        stream.pipe(
          new Writable({
            write(chunk, _encoding, callback) {
              html += chunk.toString("utf-8");
              callback();
            },
            destroy() {
              resolve(html);
            },
          }),
        );
      },
    });
  });
}
async function readResult(stream) {
  const reader = stream.getReader();
  let result = "";
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (value) result += decoder.decode(value);
      else decoder.decode(new Uint8Array());
      return result;
    }
    result += decoder.decode(value, { stream: true });
  }
}
async function renderToReadableStreamAsync(vnode, options) {
  return await readResult(await import_server_edge.renderToReadableStream(vnode, options));
}
const formContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data"];
function isFormRequest(contentType) {
  const type = contentType?.split(";")[0].toLowerCase();
  return formContentTypes.some((t) => type === t);
}
const server_default$2 = {
  name: "@astrojs/react",
  check: check$1,
  renderToStaticMarkup: renderToStaticMarkup$1,
  supportsAstroStaticSlot: true,
};
//#endregion
//#region ../../node_modules/.bun/@astrojs+mdx@5.0.3+40b04f1f8bfb5179/node_modules/@astrojs/mdx/dist/server.js
const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function") return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    return (
      await Component({
        ...props,
        ...slots,
        children,
      })
    )[AstroJSX];
  } catch (e) {
    throwEnhancedErrorIfMdxComponent(e, Component);
  }
  return false;
}
async function renderToStaticMarkup(
  Component,
  props = {},
  { default: children = null, ...slotted } = {},
) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  try {
    return {
      html: await renderJSX(
        result,
        createVNode(Component, {
          ...props,
          ...slots,
          children,
        }),
      ),
    };
  } catch (e) {
    throwEnhancedErrorIfMdxComponent(e, Component);
    throw e;
  }
}
function throwEnhancedErrorIfMdxComponent(error, Component) {
  if (Component[/* @__PURE__ */ Symbol.for("mdx-component")]) {
    if (AstroUserError.is(error)) return;
    error.title = error.name;
    error.hint = `This issue often occurs when your MDX component encounters runtime errors.`;
    throw error;
  }
}
const server_default$1 = {
  name: "astro:jsx",
  check,
  renderToStaticMarkup,
};
//#endregion
//#region \0virtual:astro:renderers
const renderers = [
  Object.assign(
    {
      name: "@astrojs/react",
      clientEntrypoint: "@astrojs/react/client.js",
      serverEntrypoint: "@astrojs/react/server.js",
    },
    { ssr: server_default$2 },
  ),
  Object.assign(
    {
      name: "astro:jsx",
      serverEntrypoint:
        "file:///home/nchartiot/Code/shiru/node_modules/.bun/@astrojs+mdx@5.0.3+40b04f1f8bfb5179/node_modules/@astrojs/mdx/dist/server.js",
    },
    { ssr: server_default$1 },
  ),
];
[
  {
    file: "",
    links: [],
    scripts: [],
    styles: [],
    routeData: {
      type: "page",
      component: "_server-islands.astro",
      params: ["name"],
      segments: [
        [
          {
            content: "_server-islands",
            dynamic: false,
            spread: false,
          },
        ],
        [
          {
            content: "name",
            dynamic: true,
            spread: false,
          },
        ],
      ],
      pattern: "^\\/_server-islands\\/([^/]+?)\\/?$",
      prerender: false,
      isIndex: false,
      fallbackRoutes: [],
      route: "/_server-islands/[name]",
      origin: "internal",
      distURL: [],
      _meta: { trailingSlash: "ignore" },
    },
  },
  {
    file: "",
    links: [],
    scripts: [],
    styles: [],
    routeData: {
      route: "/_image",
      component:
        "../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-transform-endpoint.js",
      params: [],
      pathname: "/_image",
      pattern: "^\\/_image\\/?$",
      segments: [
        [
          {
            content: "_image",
            dynamic: false,
            spread: false,
          },
        ],
      ],
      type: "endpoint",
      prerender: false,
      fallbackRoutes: [],
      distURL: [],
      isIndex: false,
      origin: "internal",
      _meta: { trailingSlash: "ignore" },
    },
  },
  {
    file: "",
    links: [],
    scripts: [],
    styles: [],
    routeData: {
      route: "/404",
      isIndex: false,
      type: "page",
      pattern: "^\\/404\\/?$",
      segments: [
        [
          {
            content: "404",
            dynamic: false,
            spread: false,
          },
        ],
      ],
      params: [],
      component: "src/pages/404.astro",
      pathname: "/404",
      prerender: false,
      fallbackRoutes: [],
      distURL: [],
      origin: "project",
      _meta: { trailingSlash: "ignore" },
    },
  },
  {
    file: "",
    links: [],
    scripts: [],
    styles: [],
    routeData: {
      route: "/api/revalidate",
      isIndex: false,
      type: "endpoint",
      pattern: "^\\/api\\/revalidate\\/?$",
      segments: [
        [
          {
            content: "api",
            dynamic: false,
            spread: false,
          },
        ],
        [
          {
            content: "revalidate",
            dynamic: false,
            spread: false,
          },
        ],
      ],
      params: [],
      component: "src/pages/api/revalidate.ts",
      pathname: "/api/revalidate",
      prerender: false,
      fallbackRoutes: [],
      distURL: [],
      origin: "project",
      _meta: { trailingSlash: "ignore" },
    },
  },
  {
    file: "",
    links: [],
    scripts: [],
    styles: [],
    routeData: {
      route: "/[...slug]",
      isIndex: false,
      type: "page",
      pattern: "^(?:\\/(.*?))?\\/?$",
      segments: [
        [
          {
            content: "...slug",
            dynamic: true,
            spread: true,
          },
        ],
      ],
      params: ["...slug"],
      component: "src/pages/[...slug].astro",
      prerender: false,
      fallbackRoutes: [],
      distURL: [],
      origin: "project",
      _meta: { trailingSlash: "ignore" },
    },
  },
].map(deserializeRouteInfo);
//#endregion
//#region \0virtual:astro:pages
const _page0 = () => import("./chunks/image-transform-endpoint_Dnkp-iwb.mjs");
const _page1 = () => import("./chunks/404_B79ZyZRi.mjs");
const _page2 = () => import("./chunks/revalidate_TTbDbx5D.mjs");
const _page3 = () => import("./chunks/_.._B_Y6uF5d.mjs");
const pageMap = new Map([
  [
    "../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-transform-endpoint.js",
    _page0,
  ],
  ["src/pages/404.astro", _page1],
  ["src/pages/api/revalidate.ts", _page2],
  ["src/pages/[...slug].astro", _page3],
]);
//#endregion
//#region \0virtual:astro:manifest
const _manifest = deserializeManifest({
  rootDir: "file:///home/nchartiot/Code/shiru/apps/docs/",
  cacheDir: "file:///home/nchartiot/Code/shiru/apps/docs/node_modules/.astro/",
  outDir: "file:///home/nchartiot/Code/shiru/apps/docs/dist/",
  srcDir: "file:///home/nchartiot/Code/shiru/apps/docs/src/",
  publicDir: "file:///home/nchartiot/Code/shiru/apps/docs/public/",
  buildClientDir: "file:///home/nchartiot/Code/shiru/apps/docs/dist/client/",
  buildServerDir: "file:///home/nchartiot/Code/shiru/apps/docs/dist/server/",
  adapterName: "@astrojs/cloudflare",
  assetsDir: "_astro",
  routes: [
    {
      file: "",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        type: "page",
        component: "_server-islands.astro",
        params: ["name"],
        segments: [
          [{ content: "_server-islands", dynamic: false, spread: false }],
          [{ content: "name", dynamic: true, spread: false }],
        ],
        pattern: "^\\/_server-islands\\/([^/]+?)\\/?$",
        prerender: false,
        isIndex: false,
        fallbackRoutes: [],
        route: "/_server-islands/[name]",
        origin: "internal",
        distURL: [],
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        route: "/_image",
        component:
          "../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-transform-endpoint.js",
        params: [],
        pathname: "/_image",
        pattern: "^\\/_image\\/?$",
        segments: [[{ content: "_image", dynamic: false, spread: false }]],
        type: "endpoint",
        prerender: false,
        fallbackRoutes: [],
        distURL: [],
        isIndex: false,
        origin: "internal",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "",
      links: [],
      scripts: [],
      styles: [{ type: "external", src: "_astro/DocsLayout.DIQrVE-b.css" }],
      routeData: {
        route: "/404",
        isIndex: false,
        type: "page",
        pattern: "^\\/404\\/?$",
        segments: [[{ content: "404", dynamic: false, spread: false }]],
        params: [],
        component: "src/pages/404.astro",
        pathname: "/404",
        prerender: false,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        route: "/api/revalidate",
        isIndex: false,
        type: "endpoint",
        pattern: "^\\/api\\/revalidate\\/?$",
        segments: [
          [{ content: "api", dynamic: false, spread: false }],
          [{ content: "revalidate", dynamic: false, spread: false }],
        ],
        params: [],
        component: "src/pages/api/revalidate.ts",
        pathname: "/api/revalidate",
        prerender: false,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "",
      links: [],
      scripts: [],
      styles: [{ type: "external", src: "_astro/DocsLayout.DIQrVE-b.css" }],
      routeData: {
        route: "/[...slug]",
        isIndex: false,
        type: "page",
        pattern: "^(?:\\/(.*?))?\\/?$",
        segments: [[{ content: "...slug", dynamic: true, spread: true }]],
        params: ["...slug"],
        component: "src/pages/[...slug].astro",
        prerender: false,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
  ],
  serverLike: true,
  middlewareMode: "classic",
  base: "/",
  trailingSlash: "ignore",
  compressHTML: true,
  experimentalQueuedRendering: { enabled: false, poolSize: 0, contentCache: false },
  componentMetadata: [
    [
      "/home/nchartiot/Code/shiru/apps/docs/src/pages/404.astro",
      { propagation: "none", containsHead: true },
    ],
    [
      "/home/nchartiot/Code/shiru/apps/docs/src/pages/[...slug].astro",
      { propagation: "none", containsHead: true },
    ],
  ],
  renderers: [],
  clientDirectives: [
    [
      "idle",
      '(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();',
    ],
    [
      "load",
      '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();',
    ],
    [
      "media",
      '(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener("change",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event("astro:media"));})();',
    ],
    [
      "only",
      '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();',
    ],
    [
      "visible",
      '(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event("astro:visible"));})();',
    ],
  ],
  entryModules: {
    "virtual:cloudflare/worker-entry": "entry.mjs",
    "\u0000virtual:astro:middleware": "virtual_astro_middleware.mjs",
    "\u0000virtual:astro:server-island-manifest":
      "chunks/_virtual_astro_server-island-manifest_DgzZrNwZ.mjs",
    "\u0000virtual:astro:session-driver": "chunks/_virtual_astro_session-driver_BAccMEGs.mjs",
    "\u0000virtual:astro:actions/noop-entrypoint": "chunks/noop-entrypoint_BJ_1eHeh.mjs",
    "/home/nchartiot/Code/shiru/node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/utils/static-image-collection.js":
      "chunks/static-image-collection_Da8YYW3t.mjs",
    "/home/nchartiot/Code/shiru/node_modules/.bun/@astrojs+react@5.0.2+a751bdad789b034d/node_modules/@astrojs/react/dist/vnode-children.js":
      "chunks/vnode-children_DujCEseK.mjs",
    "\u0000virtual:astro:page:src/pages/404@_@astro": "chunks/404_B79ZyZRi.mjs",
    "\u0000virtual:astro:page:src/pages/[...slug]@_@astro": "chunks/_.._B_Y6uF5d.mjs",
    "/home/nchartiot/Code/shiru/node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-service-workerd.js":
      "chunks/image-service-workerd_D2eClwoY.mjs",
    "\u0000virtual:astro:page:../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-transform-endpoint@_@js":
      "chunks/image-transform-endpoint_Dnkp-iwb.mjs",
    "\u0000virtual:astro:page:src/pages/api/revalidate@_@ts": "chunks/revalidate_TTbDbx5D.mjs",
    "@astrojs/react/client.js": "_astro/client.DxJ9a1Ii.js",
    "astro:scripts/before-hydration.js": "",
  },
  inlinedScripts: [],
  assets: ["/_astro/client.DxJ9a1Ii.js"],
  buildFormat: "directory",
  checkOrigin: true,
  actionBodySizeLimit: 1048576,
  serverIslandBodySizeLimit: 1048576,
  allowedDomains: [],
  key: "ccnf+WtfpLM9IDglAM2F9wIUowYQm4ZLIE5lT4zw5P4=",
  sessionConfig: {
    driver: "unstorage/drivers/cloudflare-kv-binding",
    options: { binding: "SESSION" },
  },
  image: {},
  devToolbar: { enabled: false, debugInfoOutput: "" },
  logLevel: "info",
  shouldInjectCspMetaTags: false,
});
const manifestRoutes = _manifest.routes;
const manifest = Object.assign(_manifest, {
  renderers,
  actions: () => import("./chunks/noop-entrypoint_BJ_1eHeh.mjs"),
  middleware: () => import("./virtual_astro_middleware.mjs"),
  sessionDriver: () => import("./chunks/_virtual_astro_session-driver_BAccMEGs.mjs"),
  serverIslandMappings: () => import("./chunks/_virtual_astro_server-island-manifest_DgzZrNwZ.mjs"),
  routes: manifestRoutes,
  pageMap,
});
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/entrypoints/virtual/prod.js
const createApp$1 = ({ streaming } = {}) => {
  return new App(manifest, streaming);
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/entrypoints/virtual/index.js
const createApp = createApp$1;
function setGetEnv(fn) {
  _onSetGetEnv();
}
const _onSetGetEnv = () => {};
//#endregion
//#region ../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/utils/env.js
const createGetEnv = (env) => (key) => {
  const v = env[key];
  if (typeof v === "undefined" || typeof v === "string") return v;
  if (typeof v === "boolean" || typeof v === "number") return v.toString();
};
//#endregion
//#region ../../node_modules/.bun/@astrojs+internal-helpers@0.8.0/node_modules/@astrojs/internal-helpers/dist/request.js
function getFirstForwardedValue(multiValueHeader) {
  return multiValueHeader
    ?.toString()
    ?.split(",")
    .map((e) => e.trim())?.[0];
}
const IP_RE = /^[0-9a-fA-F.:]{1,45}$/;
function isValidIpAddress(value) {
  return IP_RE.test(value);
}
function getValidatedIpFromHeader(headerValue) {
  const raw = getFirstForwardedValue(headerValue);
  if (raw && isValidIpAddress(raw)) return raw;
}
//#endregion
//#region ../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/utils/handler.js
setGetEnv(createGetEnv(env));
const app = createApp();
async function handle(request, env, context) {
  const { pathname: requestPathname } = new URL(request.url);
  if (env["SESSION"]) {
    const sessionConfigOptions = app.manifest.sessionConfig?.options ?? {};
    Object.assign(sessionConfigOptions, { binding: env[sessionKVBindingName] });
  }
  if (app.manifest.assets.has(requestPathname))
    return env.ASSETS.fetch(request.url.replace(/\.html$/, ""));
  let routeData = void 0;
  if (app.isDev()) {
    const result = await app.devMatch(app.getPathnameFromRequest(request));
    if (result) routeData = result.routeData;
  } else routeData = app.match(request);
  if (!routeData) {
    const asset = await env.ASSETS.fetch(
      request.url.replace(/index.html$/, "").replace(/\.html$/, ""),
    );
    if (asset.status !== 404) return asset;
  }
  const locals = { cfContext: context };
  Object.defineProperty(locals, "runtime", {
    enumerable: false,
    value: {
      get env() {
        throw new Error(
          `Astro.locals.runtime.env has been removed in Astro v6. Use 'import { env } from "cloudflare:workers"' instead.`,
        );
      },
      get cf() {
        throw new Error(
          `Astro.locals.runtime.cf has been removed in Astro v6. Use 'Astro.request.cf' instead.`,
        );
      },
      get caches() {
        throw new Error(
          `Astro.locals.runtime.caches has been removed in Astro v6. Use the global 'caches' object instead.`,
        );
      },
      get ctx() {
        throw new Error(
          `Astro.locals.runtime.ctx has been removed in Astro v6. Use 'Astro.locals.cfContext' instead.`,
        );
      },
    },
  });
  const response = await app.render(request, {
    routeData,
    locals,
    prerenderedErrorPageFetch: async (url) => {
      return env.ASSETS.fetch(url.replace(/\.html$/, ""));
    },
    clientAddress: getValidatedIpFromHeader(request.headers.get("cf-connecting-ip")),
  });
  if (app.setCookieHeaders)
    for (const setCookieHeader of app.setCookieHeaders(response))
      response.headers.append("Set-Cookie", setCookieHeader);
  return response;
}
//#endregion
//#region \0virtual:cloudflare/worker-entry
const worker_entry_default = { fetch: handle };
//#endregion
export { worker_entry_default as default };
