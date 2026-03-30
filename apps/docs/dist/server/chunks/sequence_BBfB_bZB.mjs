globalThis.process ??= {};
globalThis.process.env ??= {};
import {
  g as trimSlashes,
  l as joinPaths,
  m as removeTrailingForwardSlash,
  n as collapseDuplicateLeadingSlashes,
  r as collapseDuplicateSlashes,
  t as appendForwardSlash,
  u as prependForwardSlash,
} from "./path_DI6zaT7z.mjs";
import {
  A as NOOP_MIDDLEWARE_HEADER,
  C as escape,
  F as ROUTE_TYPE_HEADER,
  L as originPathnameSymbol,
  N as REROUTE_DIRECTIVE_HEADER,
  R as pipelineSymbol,
  _ as isRenderInstruction,
  d as decodeKey,
  f as decryptString,
  i as renderComponent,
  k as DEFAULT_404_COMPONENT,
  l as renderSlotToString,
  o as chunkToString,
  r as renderJSX,
  s as createSlotValueFromString,
  u as renderTemplate,
  v as isAstroComponentFactory,
  x as HTMLString,
} from "./server_COv7-vJj.mjs";
import {
  B as ReservedSlotName,
  H as RewriteWithBodyUsed,
  I as PageNumberParamNotFound,
  P as NoMatchingStaticPathFound,
  R as PrerenderDynamicEndpointPathCollide,
  X as AstroError,
  Y as i18nNoLocaleFoundInPath,
  b as InvalidGetStaticPathsEntry,
  g as GetStaticPathsRequired,
  h as GetStaticPathsInvalidRouteParam,
  m as GetStaticPathsExpectedParams,
  n as ActionNotFoundError,
  p as ForbiddenRewrite,
  x as InvalidGetStaticPathsReturn,
} from "./shorthash_DX7y3U4-.mjs";
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/build/util.js
function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore":
      switch (buildFormat) {
        case "directory":
          return true;
        case "preserve":
        case "file":
          return false;
      }
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/i18n/fallback.js
function computeFallbackRoute(options) {
  const {
    pathname,
    responseStatus,
    fallback,
    fallbackType,
    locales,
    defaultLocale,
    strategy,
    base,
  } = options;
  if (responseStatus !== 404) return { type: "none" };
  if (!fallback || Object.keys(fallback).length === 0) return { type: "none" };
  const urlLocale = pathname.split("/").find((segment) => {
    for (const locale of locales)
      if (typeof locale === "string") {
        if (locale === segment) return true;
      } else if (locale.path === segment) return true;
    return false;
  });
  if (!urlLocale) return { type: "none" };
  if (!Object.keys(fallback).includes(urlLocale)) return { type: "none" };
  const fallbackLocale = fallback[urlLocale];
  const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
  let newPathname;
  if (pathFallbackLocale === defaultLocale && strategy === "pathname-prefix-other-locales")
    if (pathname.includes(`${base}`)) newPathname = pathname.replace(`/${urlLocale}`, ``);
    else newPathname = pathname.replace(`/${urlLocale}`, `/`);
  else newPathname = pathname.replace(`/${urlLocale}`, `/${pathFallbackLocale}`);
  return {
    type: fallbackType,
    pathname: newPathname,
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/i18n/router.js
const I18nRouter = class {
  #strategy;
  #defaultLocale;
  #locales;
  #base;
  #domains;
  constructor(options) {
    this.#strategy = options.strategy;
    this.#defaultLocale = options.defaultLocale;
    this.#locales = options.locales;
    this.#base = options.base === "/" ? "/" : removeTrailingForwardSlash(options.base || "");
    this.#domains = options.domains;
  }
  /**
   * Evaluate routing strategy for a pathname.
   * Returns decision object (not HTTP Response).
   */
  match(pathname, context) {
    if (this.shouldSkipProcessing(pathname, context)) return { type: "continue" };
    switch (this.#strategy) {
      case "manual":
        return { type: "continue" };
      case "pathname-prefix-always":
        return this.matchPrefixAlways(pathname, context);
      case "domains-prefix-always":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain))
          return { type: "continue" };
        return this.matchPrefixAlways(pathname, context);
      case "pathname-prefix-other-locales":
        return this.matchPrefixOtherLocales(pathname, context);
      case "domains-prefix-other-locales":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain))
          return { type: "continue" };
        return this.matchPrefixOtherLocales(pathname, context);
      case "pathname-prefix-always-no-redirect":
        return this.matchPrefixAlwaysNoRedirect(pathname, context);
      case "domains-prefix-always-no-redirect":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain))
          return { type: "continue" };
        return this.matchPrefixAlwaysNoRedirect(pathname, context);
      default:
        return { type: "continue" };
    }
  }
  /**
   * Check if i18n processing should be skipped for this request
   */
  shouldSkipProcessing(pathname, context) {
    if (pathname.includes("/404") || pathname.includes("/500")) return true;
    if (pathname.includes("/_server-islands/")) return true;
    if (context.isReroute) return true;
    if (context.routeType && context.routeType !== "page" && context.routeType !== "fallback")
      return true;
    return false;
  }
  /**
   * Strategy: pathname-prefix-always
   * All locales must have a prefix, including the default locale.
   */
  matchPrefixAlways(pathname, _context) {
    if (pathname === this.#base + "/" || pathname === this.#base)
      return {
        type: "redirect",
        location: `${this.#base === "/" ? "" : this.#base}/${this.#defaultLocale}`,
      };
    if (!pathHasLocale(pathname, this.#locales)) return { type: "notFound" };
    return { type: "continue" };
  }
  /**
   * Strategy: pathname-prefix-other-locales
   * Default locale has no prefix, other locales must have a prefix.
   */
  matchPrefixOtherLocales(pathname, _context) {
    let pathnameContainsDefaultLocale = false;
    for (const segment of pathname.split("/"))
      if (normalizeTheLocale(segment) === normalizeTheLocale(this.#defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    if (pathnameContainsDefaultLocale)
      return {
        type: "notFound",
        location: pathname.replace(`/${this.#defaultLocale}`, ""),
      };
    return { type: "continue" };
  }
  /**
   * Strategy: pathname-prefix-always-no-redirect
   * Like prefix-always but allows root to serve instead of redirecting
   */
  matchPrefixAlwaysNoRedirect(pathname, _context) {
    if (pathname === this.#base + "/" || pathname === this.#base) return { type: "continue" };
    if (!pathHasLocale(pathname, this.#locales)) return { type: "notFound" };
    return { type: "continue" };
  }
  /**
   * Check if the current locale doesn't belong to the configured domain.
   * Used for domain-based routing strategies.
   */
  localeHasntDomain(currentLocale, currentDomain) {
    if (!this.#domains || !currentDomain) return false;
    if (!currentLocale) return false;
    const localesForDomain = this.#domains[currentDomain];
    if (!localesForDomain) return true;
    return !localesForDomain.includes(currentLocale);
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/i18n/middleware.js
function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n) return (_, next) => next();
  const i18nRouter = new I18nRouter({
    strategy: i18n.strategy,
    defaultLocale: i18n.defaultLocale,
    locales: i18n.locales,
    base,
    domains: i18n.domainLookupTable
      ? Object.keys(i18n.domainLookupTable).reduce((acc, domain) => {
          const locale = i18n.domainLookupTable[domain];
          if (!acc[domain]) acc[domain] = [];
          acc[domain].push(locale);
          return acc;
        }, {})
      : void 0,
  });
  return async (context, next) => {
    const response = await next();
    const typeHeader = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") return response;
    if (typeHeader !== "page" && typeHeader !== "fallback") return response;
    const routerContext = {
      currentLocale: context.currentLocale,
      currentDomain: context.url.hostname,
      routeType: typeHeader,
      isReroute: isReroute === "yes",
    };
    const routeDecision = i18nRouter.match(context.url.pathname, routerContext);
    switch (routeDecision.type) {
      case "redirect": {
        let location = routeDecision.location;
        if (shouldAppendForwardSlash(trailingSlash, format))
          location = appendForwardSlash(location);
        return context.redirect(location, routeDecision.status);
      }
      case "notFound": {
        if (context.isPrerendered) {
          const prerenderedRes = new Response(response.body, {
            status: 404,
            headers: response.headers,
          });
          prerenderedRes.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
          if (routeDecision.location)
            prerenderedRes.headers.set("Location", routeDecision.location);
          return prerenderedRes;
        }
        const headers = new Headers();
        if (routeDecision.location) headers.set("Location", routeDecision.location);
        return new Response(null, {
          status: 404,
          headers,
        });
      }
      case "continue":
        break;
    }
    if (i18n.fallback && i18n.fallbackType) {
      const fallbackDecision = computeFallbackRoute({
        pathname: context.url.pathname,
        responseStatus: response.status,
        currentLocale: context.currentLocale,
        fallback: i18n.fallback,
        fallbackType: i18n.fallbackType,
        locales: i18n.locales,
        defaultLocale: i18n.defaultLocale,
        strategy: i18n.strategy,
        base,
      });
      switch (fallbackDecision.type) {
        case "redirect":
          return context.redirect(fallbackDecision.pathname + context.url.search);
        case "rewrite":
          return await context.rewrite(fallbackDecision.pathname + context.url.search);
        case "none":
          break;
      }
    }
    return response;
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/i18n/index.js
function pathHasLocale(path, locales) {
  const segments = path.split("/").map(normalizeThePath);
  for (const segment of segments)
    for (const locale of locales)
      if (typeof locale === "string") {
        if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) return true;
      } else if (segment === locale.path) return true;
  return false;
}
function getPathByLocale(locale, locales) {
  for (const loopLocale of locales)
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) return loopLocale;
    } else for (const code of loopLocale.codes) if (code === locale) return loopLocale.path;
  throw new AstroError(i18nNoLocaleFoundInPath);
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function normalizeThePath(path) {
  return path.endsWith(".html") ? path.slice(0, -5) : path;
}
function getAllCodes(locales) {
  const result = [];
  for (const loopLocale of locales)
    if (typeof loopLocale === "string") result.push(loopLocale);
    else result.push(...loopLocale.codes);
  return result;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/request-body.js
async function readBodyWithLimit(request, limit) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > limit)
      throw new BodySizeLimitError(limit);
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > limit) throw new BodySizeLimitError(limit);
      chunks.push(value);
    }
  }
  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer;
}
const BodySizeLimitError = class extends Error {
  limit;
  constructor(limit) {
    super(`Request body exceeds the configured limit of ${limit} bytes`);
    this.name = "BodySizeLimitError";
    this.limit = limit;
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/request.js
function createRequest({
  url,
  headers,
  method = "GET",
  body = void 0,
  logger,
  isPrerendered = false,
  routePattern,
  init,
}) {
  const headersObj = isPrerendered
    ? void 0
    : headers instanceof Headers
      ? headers
      : new Headers(Object.entries(headers).filter(([name]) => !name.startsWith(":")));
  if (typeof url === "string") url = new URL(url);
  if (isPrerendered) url.search = "";
  const request = new Request(url, {
    method,
    headers: headersObj,
    body: isPrerendered ? null : body,
    ...init,
  });
  if (isPrerendered) {
    let _headers = request.headers;
    const { value, writable, ...headersDesc } =
      Object.getOwnPropertyDescriptor(request, "headers") || {};
    Object.defineProperty(request, "headers", {
      ...headersDesc,
      get() {
        logger.warn(
          null,
          `\`Astro.request.headers\` was used when rendering the route \`${routePattern}'\`. \`Astro.request.headers\` is not available on prerendered pages. If you need access to request headers, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default.`,
        );
        return _headers;
      },
      set(newHeaders) {
        _headers = newHeaders;
      },
    });
  }
  return request;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/template/4xx.js
function template({ title, pathname, statusCode = 404, tabTitle, body }) {
  return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>${tabTitle}</title>
		<style>
			:root {
				--gray-10: hsl(258, 7%, 10%);
				--gray-20: hsl(258, 7%, 20%);
				--gray-30: hsl(258, 7%, 30%);
				--gray-40: hsl(258, 7%, 40%);
				--gray-50: hsl(258, 7%, 50%);
				--gray-60: hsl(258, 7%, 60%);
				--gray-70: hsl(258, 7%, 70%);
				--gray-80: hsl(258, 7%, 80%);
				--gray-90: hsl(258, 7%, 90%);
				--black: #13151A;
				--accent-light: #E0CCFA;
			}

			* {
				box-sizing: border-box;
			}

			html {
				background: var(--black);
				color-scheme: dark;
				accent-color: var(--accent-light);
			}

			body {
				background-color: var(--gray-10);
				color: var(--gray-80);
				font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
				line-height: 1.5;
				margin: 0;
			}

			a {
				color: var(--accent-light);
			}

			.center {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100vh;
				width: 100vw;
			}

			h1 {
				margin-bottom: 8px;
				color: white;
				font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
				font-weight: 700;
				margin-top: 1rem;
				margin-bottom: 0;
			}

			.statusCode {
				color: var(--accent-light);
			}

			.astro-icon {
				height: 124px;
				width: 124px;
			}

			pre, code {
				padding: 2px 8px;
				background: rgba(0,0,0, 0.25);
				border: 1px solid rgba(255,255,255, 0.25);
				border-radius: 4px;
				font-size: 1.2em;
				margin-top: 0;
				max-width: 60em;
			}
		</style>
	</head>
	<body>
		<main class="center">
			<svg class="astro-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none"> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="white"/> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="url(#paint0_linear_738_686)"/> <path d="M0 51.6401C0 51.6401 10.6488 46.4654 21.3274 46.4654L29.3786 21.6102C29.6801 20.4082 30.5602 19.5913 31.5538 19.5913C32.5474 19.5913 33.4275 20.4082 33.7289 21.6102L41.7802 46.4654C54.4274 46.4654 63.1076 51.6401 63.1076 51.6401C63.1076 51.6401 45.0197 2.48776 44.9843 2.38914C44.4652 0.935933 43.5888 0 42.4073 0H20.7022C19.5206 0 18.6796 0.935933 18.1251 2.38914C18.086 2.4859 0 51.6401 0 51.6401Z" fill="white"/> <defs> <linearGradient id="paint0_linear_738_686" x1="31.554" y1="75.4423" x2="39.7462" y2="48.376" gradientUnits="userSpaceOnUse"> <stop stop-color="#D83333"/> <stop offset="1" stop-color="#F041FF"/> </linearGradient> </defs> </svg>
			<h1>${statusCode ? `<span class="statusCode">${statusCode}: </span> ` : ""}<span class="statusMessage">${title}</span></h1>
			${
        body ||
        `
				<pre>Path: ${escape(pathname)}</pre>
			`
      }
			</main>
	</body>
</html>`;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/internal/astro-designed-error-pages.js
const DEFAULT_404_ROUTE = {
  component: DEFAULT_404_COMPONENT,
  params: [],
  pattern: /^\/404\/?$/,
  prerender: false,
  pathname: "/404",
  segments: [
    [
      {
        content: "404",
        dynamic: false,
        spread: false,
      },
    ],
  ],
  type: "page",
  route: "/404",
  fallbackRoutes: [],
  isIndex: false,
  origin: "internal",
  distURL: [],
};
async function default404Page({ pathname }) {
  return new Response(
    template({
      statusCode: 404,
      title: "Not found",
      tabTitle: "404: Not Found",
      pathname,
    }),
    {
      status: 404,
      headers: { "Content-Type": "text/html" },
    },
  );
}
default404Page.isAstroComponentFactory = true;
const default404Instance = { default: default404Page };
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/internal/route-errors.js
const ROUTE404_RE = /^\/404\/?$/;
const ROUTE500_RE = /^\/500\/?$/;
function isRoute404(route) {
  return ROUTE404_RE.test(route);
}
function isRoute500(route) {
  return ROUTE500_RE.test(route);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/rewrite.js
function findRouteToRewrite({
  payload,
  routes,
  request,
  trailingSlash,
  buildFormat,
  base,
  outDir,
}) {
  let newUrl = void 0;
  if (payload instanceof URL) newUrl = payload;
  else if (payload instanceof Request) newUrl = new URL(payload.url);
  else newUrl = new URL(collapseDuplicateSlashes(payload), new URL(request.url).origin);
  const { pathname, resolvedUrlPathname } = normalizeRewritePathname(
    newUrl.pathname,
    base,
    trailingSlash,
    buildFormat,
  );
  newUrl.pathname = resolvedUrlPathname;
  const decodedPathname = decodeURI(pathname);
  if (isRoute404(decodedPathname)) {
    const errorRoute = routes.find((route) => route.route === "/404");
    if (errorRoute)
      return {
        routeData: errorRoute,
        newUrl,
        pathname: decodedPathname,
      };
  }
  if (isRoute500(decodedPathname)) {
    const errorRoute = routes.find((route) => route.route === "/500");
    if (errorRoute)
      return {
        routeData: errorRoute,
        newUrl,
        pathname: decodedPathname,
      };
  }
  let foundRoute;
  for (const route of routes)
    if (route.pattern.test(decodedPathname)) {
      if (
        route.params &&
        route.params.length !== 0 &&
        route.distURL &&
        route.distURL.length !== 0
      ) {
        if (
          !route.distURL.some(
            (url) =>
              url.href.replace(outDir.toString(), "").replace(/(?:\/index\.html|\.html)$/, "") ===
              trimSlashes(pathname),
          )
        )
          continue;
      }
      foundRoute = route;
      break;
    }
  if (foundRoute)
    return {
      routeData: foundRoute,
      newUrl,
      pathname: decodedPathname,
    };
  else {
    const custom404 = routes.find((route) => route.route === "/404");
    if (custom404)
      return {
        routeData: custom404,
        newUrl,
        pathname,
      };
    else
      return {
        routeData: DEFAULT_404_ROUTE,
        newUrl,
        pathname,
      };
  }
}
function copyRequest(newUrl, oldRequest, isPrerendered, logger, routePattern) {
  if (oldRequest.bodyUsed) throw new AstroError(RewriteWithBodyUsed);
  return createRequest({
    url: newUrl,
    method: oldRequest.method,
    body: oldRequest.body,
    isPrerendered,
    logger,
    headers: isPrerendered ? {} : oldRequest.headers,
    routePattern,
    init: {
      referrer: oldRequest.referrer,
      referrerPolicy: oldRequest.referrerPolicy,
      mode: oldRequest.mode,
      credentials: oldRequest.credentials,
      cache: oldRequest.cache,
      redirect: oldRequest.redirect,
      integrity: oldRequest.integrity,
      signal: oldRequest.signal,
      keepalive: oldRequest.keepalive,
      duplex: "half",
    },
  });
}
function setOriginPathname(request, pathname, trailingSlash, buildFormat) {
  if (!pathname) pathname = "/";
  const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
  let finalPathname;
  if (pathname === "/") finalPathname = "/";
  else if (shouldAppendSlash) finalPathname = appendForwardSlash(pathname);
  else finalPathname = removeTrailingForwardSlash(pathname);
  Reflect.set(request, originPathnameSymbol, encodeURIComponent(finalPathname));
}
function getOriginPathname(request) {
  const origin = Reflect.get(request, originPathnameSymbol);
  if (origin) return decodeURIComponent(origin);
  return new URL(request.url).pathname;
}
function normalizeRewritePathname(urlPathname, base, trailingSlash, buildFormat) {
  let pathname = collapseDuplicateSlashes(urlPathname);
  const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
  if (base !== "/") {
    if (urlPathname === base || urlPathname === removeTrailingForwardSlash(base))
      pathname = shouldAppendSlash ? "/" : "";
    else if (urlPathname.startsWith(base)) {
      pathname = shouldAppendSlash
        ? appendForwardSlash(urlPathname)
        : removeTrailingForwardSlash(urlPathname);
      pathname = pathname.slice(base.length);
    }
  }
  if (!pathname.startsWith("/") && shouldAppendSlash && urlPathname.endsWith("/"))
    pathname = prependForwardSlash(pathname);
  if (pathname === "/" && base !== "/" && !shouldAppendSlash) pathname = "";
  if (buildFormat === "file") pathname = pathname.replace(/\.html$/, "");
  let resolvedUrlPathname;
  if (base !== "/" && (pathname === "" || pathname === "/") && !shouldAppendSlash)
    resolvedUrlPathname = removeTrailingForwardSlash(base);
  else resolvedUrlPathname = joinPaths(...[base, pathname].filter(Boolean));
  return {
    pathname,
    resolvedUrlPathname,
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/actions/noop-actions.js
const NOOP_ACTIONS_MOD = { server: {} };
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/middleware/defineMiddleware.js
function defineMiddleware(fn) {
  return fn;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/middlewares.js
const FORM_CONTENT_TYPES = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"];
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url, isPrerendered } = context;
    if (isPrerendered) return next();
    if (SAFE_METHODS.includes(request.method)) return next();
    const isSameOrigin = request.headers.get("origin") === url.origin;
    if (request.headers.has("content-type")) {
      if (hasFormLikeHeader(request.headers.get("content-type")) && !isSameOrigin)
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403,
        });
    } else if (!isSameOrigin)
      return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
        status: 403,
      });
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES)
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) return true;
  }
  return false;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/middleware/noop-middleware.js
const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/redirects/component.js
const RedirectComponentInstance = {
  default() {
    return new Response(null, { status: 301 });
  },
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/generator.js
function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string")
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      return [key, value];
    }),
  );
}
function getParameter(part, params) {
  if (part.spread) return params[part.content.slice(3)] || "";
  if (part.dynamic) {
    if (!params[part.content]) throw new TypeError(`Missing parameter: ${part.content}`);
    return params[part.content];
  }
  return part.content
    .normalize()
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23")
    .replace(/%5B/g, "[")
    .replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? collapseDuplicateLeadingSlashes("/" + segmentPath) : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) trailing = "/";
    return (
      segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing || "/"
    );
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/internal/validation.js
const VALID_PARAM_TYPES = ["string", "undefined"];
function validateGetStaticPathsParameter([key, value], route) {
  if (!VALID_PARAM_TYPES.includes(typeof value))
    throw new AstroError({
      ...GetStaticPathsInvalidRouteParam,
      message: GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
      location: { file: route },
    });
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/params.js
function stringifyParams(params, route, trailingSlash) {
  const validatedParams = {};
  for (const [key, value] of Object.entries(params)) {
    validateGetStaticPathsParameter([key, value], route.component);
    if (value !== void 0) validatedParams[key] = trimSlashes(value);
  }
  return getRouteGenerator(route.segments, trailingSlash)(validatedParams);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/validation.js
function validateDynamicRouteModule(mod, { ssr, route }) {
  if ((!ssr || route.prerender) && !mod.getStaticPaths)
    throw new AstroError({
      ...GetStaticPathsRequired,
      location: { file: route.component },
    });
}
function validateGetStaticPathsResult(result, route) {
  if (!Array.isArray(result))
    throw new AstroError({
      ...InvalidGetStaticPathsReturn,
      message: InvalidGetStaticPathsReturn.message(typeof result),
      location: { file: route.component },
    });
  result.forEach((pathObject) => {
    if ((typeof pathObject === "object" && Array.isArray(pathObject)) || pathObject === null)
      throw new AstroError({
        ...InvalidGetStaticPathsEntry,
        message: InvalidGetStaticPathsEntry.message(
          Array.isArray(pathObject) ? "array" : typeof pathObject,
        ),
      });
    if (
      pathObject.params === void 0 ||
      pathObject.params === null ||
      (pathObject.params && Object.keys(pathObject.params).length === 0)
    )
      throw new AstroError({
        ...GetStaticPathsExpectedParams,
        location: { file: route.component },
      });
  });
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/render/paginate.js
function generatePaginateFunction(routeMatch, base, trailingSlash) {
  return function paginateUtility(data, args = {}) {
    const generate = getRouteGenerator(routeMatch.segments, trailingSlash);
    const { pageSize: _pageSize, params: _params, props: _props } = args;
    const pageSize = _pageSize || 10;
    const paramName = "page";
    const additionalParams = _params || {};
    const additionalProps = _props || {};
    let includesFirstPageNumber;
    if (routeMatch.params.includes(`...${paramName}`)) includesFirstPageNumber = false;
    else if (routeMatch.params.includes(`${paramName}`)) includesFirstPageNumber = true;
    else
      throw new AstroError({
        ...PageNumberParamNotFound,
        message: PageNumberParamNotFound.message(paramName),
      });
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    return [...Array(lastPage).keys()].map((num) => {
      const pageNum = num + 1;
      const start = pageSize === Number.POSITIVE_INFINITY ? 0 : (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const params = {
        ...additionalParams,
        [paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0,
      };
      const current = addRouteBase(generate({ ...params }), base);
      const next =
        pageNum === lastPage
          ? void 0
          : addRouteBase(
              generate({
                ...params,
                page: String(pageNum + 1),
              }),
              base,
            );
      const prev =
        pageNum === 1
          ? void 0
          : addRouteBase(
              generate({
                ...params,
                page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1),
              }),
              base,
            );
      const first =
        pageNum === 1
          ? void 0
          : addRouteBase(
              generate({
                ...params,
                page: includesFirstPageNumber ? "1" : void 0,
              }),
              base,
            );
      const last =
        pageNum === lastPage
          ? void 0
          : addRouteBase(
              generate({
                ...params,
                page: String(lastPage),
              }),
              base,
            );
      return {
        params,
        props: {
          ...additionalProps,
          page: {
            data: data.slice(start, end),
            start,
            end: end - 1,
            size: pageSize,
            total: data.length,
            currentPage: pageNum,
            lastPage,
            url: {
              current,
              next,
              prev,
              first,
              last,
            },
          },
        },
      };
    });
  };
}
function addRouteBase(route, base) {
  let routeWithBase = joinPaths(base, route);
  if (routeWithBase === "") routeWithBase = "/";
  return routeWithBase;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/render/route-cache.js
async function callGetStaticPaths({ mod, route, routeCache, ssr, base, trailingSlash }) {
  const cached = routeCache.get(route);
  if (!mod)
    throw new Error("This is an error caused by Astro and not your code. Please file an issue.");
  if (cached?.staticPaths) return cached.staticPaths;
  validateDynamicRouteModule(mod, {
    ssr,
    route,
  });
  if (ssr && !route.prerender) {
    const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
    routeCache.set(route, {
      ...cached,
      staticPaths: entry,
    });
    return entry;
  }
  let staticPaths = [];
  if (!mod.getStaticPaths) throw new Error("Unexpected Error.");
  staticPaths = await mod.getStaticPaths({
    paginate: generatePaginateFunction(route, base, trailingSlash),
    routePattern: route.route,
  });
  validateGetStaticPathsResult(staticPaths, route);
  const keyedStaticPaths = staticPaths;
  keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
  for (const sp of keyedStaticPaths) {
    const paramsKey = stringifyParams(sp.params, route, trailingSlash);
    keyedStaticPaths.keyed.set(paramsKey, sp);
  }
  routeCache.set(route, {
    ...cached,
    staticPaths: keyedStaticPaths,
  });
  return keyedStaticPaths;
}
const RouteCache = class {
  logger;
  cache = {};
  runtimeMode;
  constructor(logger, runtimeMode = "production") {
    this.logger = logger;
    this.runtimeMode = runtimeMode;
  }
  /** Clear the cache. */
  clearAll() {
    this.cache = {};
  }
  set(route, entry) {
    const key = this.key(route);
    if (this.runtimeMode === "production" && this.cache[key]?.staticPaths)
      this.logger.warn(null, `Internal Warning: route cache overwritten. (${key})`);
    this.cache[key] = entry;
  }
  get(route) {
    return this.cache[this.key(route)];
  }
  key(route) {
    return `${route.route}_${route.component}`;
  }
};
function findPathItemByKey(staticPaths, params, route, logger, trailingSlash) {
  const paramsKey = stringifyParams(params, route, trailingSlash);
  const matchedStaticPath = staticPaths.keyed.get(paramsKey);
  if (matchedStaticPath) return matchedStaticPath;
  logger.debug("router", `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/pattern.js
function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments
    .map((segment) => {
      if (segment.length === 1 && segment[0].spread) return "(?:\\/(.*?))?";
      else
        return (
          "\\/" +
          segment
            .map((part) => {
              if (part.spread) return "(.*?)";
              else if (part.dynamic) return "([^/]+?)";
              else
                return part.content
                  .normalize()
                  .replace(/\?/g, "%3F")
                  .replace(/#/g, "%23")
                  .replace(/%5B/g, "[")
                  .replace(/%5D/g, "]")
                  .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            })
            .join("")
        );
    })
    .join("");
  const trailing =
    addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/") initial = "";
  return new RegExp(`^${pathname || initial}${trailing}`);
}
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") return "\\/$";
  if (addTrailingSlash === "never") return "$";
  return "\\/?$";
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/server-islands/endpoint.js
const SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
const SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function badRequest(reason) {
  return new Response(null, {
    status: 400,
    statusText: "Bad request: " + reason,
  });
}
const DEFAULT_BODY_SIZE_LIMIT = 1024 * 1024;
async function getRequestData(request, bodySizeLimit = DEFAULT_BODY_SIZE_LIMIT) {
  switch (request.method) {
    case "GET": {
      const params = new URL(request.url).searchParams;
      if (!params.has("s") || !params.has("e") || !params.has("p"))
        return badRequest("Missing required query parameters.");
      const encryptedSlots = params.get("s");
      return {
        encryptedComponentExport: params.get("e"),
        encryptedProps: params.get("p"),
        encryptedSlots,
      };
    }
    case "POST":
      try {
        const body = await readBodyWithLimit(request, bodySizeLimit);
        const raw = new TextDecoder().decode(body);
        const data = JSON.parse(raw);
        if (Object.hasOwn(data, "slots") && typeof data.slots === "object")
          return badRequest("Plaintext slots are not allowed. Slots must be encrypted.");
        if (Object.hasOwn(data, "componentExport") && typeof data.componentExport === "string")
          return badRequest(
            "Plaintext componentExport is not allowed. componentExport must be encrypted.",
          );
        return data;
      } catch (e) {
        if (e instanceof BodySizeLimitError)
          return new Response(null, {
            status: 413,
            statusText: e.message,
          });
        if (e instanceof SyntaxError) return badRequest("Request format is invalid.");
        throw e;
      }
    default:
      return new Response(null, { status: 405 });
  }
}
function createEndpoint(manifest) {
  const page = async (result) => {
    const params = result.params;
    if (!params.name)
      return new Response(null, {
        status: 400,
        statusText: "Bad request",
      });
    const componentId = params.name;
    const data = await getRequestData(result.request, manifest.serverIslandBodySizeLimit);
    if (data instanceof Response) return data;
    const imp = (await (await manifest.serverIslandMappings?.())?.serverIslandMap)?.get(componentId);
    if (!imp)
      return new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    const key = await manifest.key;
    let componentExport;
    try {
      componentExport = await decryptString(key, data.encryptedComponentExport);
    } catch (_e) {
      return badRequest("Encrypted componentExport value is invalid.");
    }
    const encryptedProps = data.encryptedProps;
    let props = {};
    if (encryptedProps !== "")
      try {
        const propString = await decryptString(key, encryptedProps);
        props = JSON.parse(propString);
      } catch (_e) {
        return badRequest("Encrypted props value is invalid.");
      }
    let decryptedSlots = {};
    const encryptedSlots = data.encryptedSlots;
    if (encryptedSlots !== "")
      try {
        const slotsString = await decryptString(key, encryptedSlots);
        decryptedSlots = JSON.parse(slotsString);
      } catch (_e) {
        return badRequest("Encrypted slots value is invalid.");
      }
    let Component = (await imp())[componentExport];
    const slots = {};
    for (const prop in decryptedSlots)
      slots[prop] = createSlotValueFromString(decryptedSlots[prop]);
    result.response.headers.set("X-Robots-Tag", "noindex");
    if (isAstroComponentFactory(Component)) {
      const ServerIsland = Component;
      Component = function (...args) {
        return ServerIsland.apply(this, args);
      };
      Object.assign(Component, ServerIsland);
      Component.propagation = "self";
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  };
  page.isAstroComponentFactory = true;
  return {
    default: page,
    partial: true,
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/default.js
function createDefaultRoutes(manifest) {
  const root = new URL(manifest.rootDir);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT,
    },
    {
      instance: createEndpoint(manifest),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT,
    },
  ];
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/app/manifest.js
function deserializeManifest(serializedManifest, routesList) {
  const routes = [];
  if (serializedManifest.routes)
    for (const serializedRoute of serializedManifest.routes) {
      routes.push({
        ...serializedRoute,
        routeData: deserializeRouteData(serializedRoute.routeData),
      });
      const route = serializedRoute;
      route.routeData = deserializeRouteData(serializedRoute.routeData);
    }
  if (routesList)
    for (const route of routesList?.routes)
      routes.push({
        file: "",
        links: [],
        scripts: [],
        styles: [],
        routeData: route,
      });
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const key = decodeKey(serializedManifest.key);
  return {
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    rootDir: new URL(serializedManifest.rootDir),
    srcDir: new URL(serializedManifest.srcDir),
    publicDir: new URL(serializedManifest.publicDir),
    outDir: new URL(serializedManifest.outDir),
    cacheDir: new URL(serializedManifest.cacheDir),
    buildClientDir: new URL(serializedManifest.buildClientDir),
    buildServerDir: new URL(serializedManifest.buildServerDir),
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    key,
  };
}
function serializeRouteData(routeData, trailingSlash) {
  return {
    ...routeData,
    pattern: routeData.pattern.source,
    redirectRoute: routeData.redirectRoute
      ? serializeRouteData(routeData.redirectRoute, trailingSlash)
      : void 0,
    fallbackRoutes: routeData.fallbackRoutes.map((fallbackRoute) => {
      return serializeRouteData(fallbackRoute, trailingSlash);
    }),
    _meta: { trailingSlash },
  };
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute
      ? deserializeRouteData(rawRouteData.redirectRoute)
      : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin,
    distURL: rawRouteData.distURL,
  };
}
function deserializeRouteInfo(rawRouteInfo) {
  return {
    styles: rawRouteInfo.styles,
    file: rawRouteInfo.file,
    links: rawRouteInfo.links,
    scripts: rawRouteInfo.scripts,
    routeData: deserializeRouteData(rawRouteInfo.routeData),
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/render/queue/pool.js
const NodePool = class {
  textPool = [];
  htmlStringPool = [];
  componentPool = [];
  instructionPool = [];
  maxSize;
  enableStats;
  stats = {
    acquireFromPool: 0,
    acquireNew: 0,
    released: 0,
    releasedDropped: 0,
  };
  /**
   * Creates a new object pool for queue nodes.
   *
   * @param maxSize - Maximum number of nodes to keep in the pool (default: 1000).
   *   The cap is shared across all typed sub-pools.
   * @param enableStats - Enable statistics tracking (default: false for performance)
   */
  constructor(maxSize = 1e3, enableStats = false) {
    this.maxSize = maxSize;
    this.enableStats = enableStats;
  }
  /**
   * Acquires a queue node from the pool or creates a new one if the pool is empty.
   * Pops from the type-specific sub-pool to reuse an existing object when available.
   *
   * @param type - The type of queue node to acquire
   * @param content - Optional content to set on the node (for text or html-string types)
   * @returns A queue node ready to be populated with data
   */
  acquire(type, content) {
    const pooledNode = this.popFromTypedPool(type);
    if (pooledNode) {
      if (this.enableStats) this.stats.acquireFromPool = this.stats.acquireFromPool + 1;
      this.resetNodeContent(pooledNode, type, content);
      return pooledNode;
    }
    if (this.enableStats) this.stats.acquireNew = this.stats.acquireNew + 1;
    return this.createNode(type, content);
  }
  /**
   * Creates a new node of the specified type with the given content.
   * Helper method to reduce branching in acquire().
   */
  createNode(type, content = "") {
    switch (type) {
      case "text":
        return {
          type: "text",
          content,
        };
      case "html-string":
        return {
          type: "html-string",
          html: content,
        };
      case "component":
        return {
          type: "component",
          instance: void 0,
        };
      case "instruction":
        return {
          type: "instruction",
          instruction: void 0,
        };
    }
  }
  /**
   * Pops a node from the type-specific sub-pool.
   * Returns undefined if the sub-pool for the requested type is empty.
   */
  popFromTypedPool(type) {
    switch (type) {
      case "text":
        return this.textPool.pop();
      case "html-string":
        return this.htmlStringPool.pop();
      case "component":
        return this.componentPool.pop();
      case "instruction":
        return this.instructionPool.pop();
    }
  }
  /**
   * Resets the content/value field on a reused pooled node.
   * The type discriminant is already correct since we pop from the matching sub-pool.
   */
  resetNodeContent(node, type, content) {
    switch (type) {
      case "text":
        node.content = content ?? "";
        break;
      case "html-string":
        node.html = content ?? "";
        break;
      case "component":
        node.instance = void 0;
        break;
      case "instruction":
        node.instruction = void 0;
        break;
    }
  }
  /**
   * Returns the total number of nodes across all typed sub-pools.
   */
  totalPoolSize() {
    return (
      this.textPool.length +
      this.htmlStringPool.length +
      this.componentPool.length +
      this.instructionPool.length
    );
  }
  /**
   * Releases a queue node back to the pool for reuse.
   * If the pool is at max capacity, the node is discarded (will be GC'd).
   *
   * @param node - The node to release back to the pool
   */
  release(node) {
    if (this.totalPoolSize() >= this.maxSize) {
      if (this.enableStats) this.stats.releasedDropped = this.stats.releasedDropped + 1;
      return;
    }
    switch (node.type) {
      case "text":
        node.content = "";
        this.textPool.push(node);
        break;
      case "html-string":
        node.html = "";
        this.htmlStringPool.push(node);
        break;
      case "component":
        node.instance = void 0;
        this.componentPool.push(node);
        break;
      case "instruction":
        node.instruction = void 0;
        this.instructionPool.push(node);
        break;
    }
    if (this.enableStats) this.stats.released = this.stats.released + 1;
  }
  /**
   * Releases all nodes in an array back to the pool.
   * This is a convenience method for releasing multiple nodes at once.
   *
   * @param nodes - Array of nodes to release
   */
  releaseAll(nodes) {
    for (const node of nodes) this.release(node);
  }
  /**
   * Clears all typed sub-pools, discarding all cached nodes.
   * This can be useful if you want to free memory after a large render.
   */
  clear() {
    this.textPool.length = 0;
    this.htmlStringPool.length = 0;
    this.componentPool.length = 0;
    this.instructionPool.length = 0;
  }
  /**
   * Gets the current total number of nodes across all typed sub-pools.
   * Useful for monitoring pool usage and tuning maxSize.
   *
   * @returns Number of nodes currently available in the pool
   */
  size() {
    return this.totalPoolSize();
  }
  /**
   * Gets pool statistics for debugging.
   *
   * @returns Pool usage statistics including computed metrics
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.totalPoolSize(),
      maxSize: this.maxSize,
      hitRate:
        this.stats.acquireFromPool + this.stats.acquireNew > 0
          ? (this.stats.acquireFromPool / (this.stats.acquireFromPool + this.stats.acquireNew)) *
            100
          : 0,
    };
  }
  /**
   * Resets pool statistics.
   */
  resetStats() {
    this.stats = {
      acquireFromPool: 0,
      acquireNew: 0,
      released: 0,
      releasedDropped: 0,
    };
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/html-string-cache.js
const HTMLStringCache = class {
  cache = /* @__PURE__ */ new Map();
  maxSize;
  constructor(maxSize = 1e3) {
    this.maxSize = maxSize;
    this.warm(COMMON_HTML_PATTERNS);
  }
  /**
   * Get or create an HTMLString for the given content.
   * If cached, the existing object is returned and moved to end (most recently used).
   * If not cached, a new HTMLString is created, cached, and returned.
   *
   * @param content - The HTML string content
   * @returns HTMLString object (cached or newly created)
   */
  getOrCreate(content) {
    const cached = this.cache.get(content);
    if (cached) {
      this.cache.delete(content);
      this.cache.set(content, cached);
      return cached;
    }
    const htmlString = new HTMLString(content);
    this.cache.set(content, htmlString);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) this.cache.delete(firstKey);
    }
    return htmlString;
  }
  /**
   * Get current cache size
   */
  size() {
    return this.cache.size;
  }
  /**
   * Pre-warms the cache with common HTML patterns.
   * This ensures first-render cache hits for frequently used tags.
   *
   * @param patterns - Array of HTML strings to pre-cache
   */
  warm(patterns) {
    for (const pattern of patterns)
      if (!this.cache.has(pattern)) this.cache.set(pattern, new HTMLString(pattern));
  }
  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }
};
const COMMON_HTML_PATTERNS = [
  "<div>",
  "</div>",
  "<span>",
  "</span>",
  "<p>",
  "</p>",
  "<section>",
  "</section>",
  "<article>",
  "</article>",
  "<header>",
  "</header>",
  "<footer>",
  "</footer>",
  "<nav>",
  "</nav>",
  "<main>",
  "</main>",
  "<aside>",
  "</aside>",
  "<ul>",
  "</ul>",
  "<ol>",
  "</ol>",
  "<li>",
  "</li>",
  "<br>",
  "<hr>",
  "<br/>",
  "<hr/>",
  "<h1>",
  "</h1>",
  "<h2>",
  "</h2>",
  "<h3>",
  "</h3>",
  "<h4>",
  "</h4>",
  "<a>",
  "</a>",
  "<strong>",
  "</strong>",
  "<em>",
  "</em>",
  "<code>",
  "</code>",
  " ",
  "\n",
];
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/base-pipeline.js
const Pipeline = class {
  constructor(
    logger,
    manifest,
    runtimeMode,
    renderers,
    resolve,
    streaming,
    adapterName = manifest.adapterName,
    clientDirectives = manifest.clientDirectives,
    inlinedScripts = manifest.inlinedScripts,
    compressHTML = manifest.compressHTML,
    i18n = manifest.i18n,
    middleware = manifest.middleware,
    routeCache = new RouteCache(logger, runtimeMode),
    site = manifest.site ? new URL(manifest.site) : void 0,
    defaultRoutes = createDefaultRoutes(manifest),
    actions = manifest.actions,
    sessionDriver = manifest.sessionDriver,
    cacheProvider = manifest.cacheProvider,
    cacheConfig = manifest.cacheConfig,
    serverIslands = manifest.serverIslandMappings,
  ) {
    this.logger = logger;
    this.manifest = manifest;
    this.runtimeMode = runtimeMode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.actions = actions;
    this.sessionDriver = sessionDriver;
    this.cacheProvider = cacheProvider;
    this.cacheConfig = cacheConfig;
    this.serverIslands = serverIslands;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual")
      this.internalMiddleware.push(
        createI18nMiddleware(i18n, manifest.base, manifest.trailingSlash, manifest.buildFormat),
      );
    if (manifest.experimentalQueuedRendering.enabled) {
      this.nodePool = this.createNodePool(
        manifest.experimentalQueuedRendering.poolSize ?? 1e3,
        false,
      );
      if (manifest.experimentalQueuedRendering.contentCache)
        this.htmlStringCache = this.createStringCache();
    }
  }
  internalMiddleware;
  resolvedMiddleware = void 0;
  resolvedActions = void 0;
  resolvedSessionDriver = void 0;
  resolvedCacheProvider = void 0;
  compiledCacheRoutes = void 0;
  nodePool;
  htmlStringCache;
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) return this.resolvedMiddleware;
    if (this.middleware) {
      const internalMiddlewares = [(await this.middleware()).onRequest ?? NOOP_MIDDLEWARE_FN];
      if (this.manifest.checkOrigin) internalMiddlewares.unshift(createOriginCheckMiddleware());
      this.resolvedMiddleware = sequence(...internalMiddlewares);
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
  /**
   * Clears the cached middleware so it is re-resolved on the next request.
   * Called via HMR when middleware files change during development.
   */
  clearMiddleware() {
    this.resolvedMiddleware = void 0;
  }
  async getActions() {
    if (this.resolvedActions) return this.resolvedActions;
    else if (this.actions) return this.actions();
    return NOOP_ACTIONS_MOD;
  }
  async getSessionDriver() {
    if (this.resolvedSessionDriver !== void 0) return this.resolvedSessionDriver;
    if (this.sessionDriver) {
      this.resolvedSessionDriver = (await this.sessionDriver())?.default || null;
      return this.resolvedSessionDriver;
    }
    this.resolvedSessionDriver = null;
    return null;
  }
  async getCacheProvider() {
    if (this.resolvedCacheProvider !== void 0) return this.resolvedCacheProvider;
    if (this.cacheProvider) {
      const factory = (await this.cacheProvider())?.default || null;
      this.resolvedCacheProvider = factory ? factory(this.cacheConfig?.options) : null;
      return this.resolvedCacheProvider;
    }
    this.resolvedCacheProvider = null;
    return null;
  }
  async getServerIslands() {
    if (this.serverIslands) return this.serverIslands();
    return {
      serverIslandMap: /* @__PURE__ */ new Map(),
      serverIslandNameMap: /* @__PURE__ */ new Map(),
    };
  }
  async getAction(path) {
    const pathKeys = path.split(".").map((key) => decodeURIComponent(key));
    let { server } = await this.getActions();
    if (!server || !(typeof server === "object"))
      throw new TypeError(
        `Expected \`server\` export in actions file to be an object. Received ${typeof server}.`,
      );
    for (const key of pathKeys) {
      if (!Object.hasOwn(server, key))
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join(".")),
        });
      server = server[key];
    }
    if (typeof server !== "function")
      throw new TypeError(
        `Expected handler for action ${pathKeys.join(".")} to be a function. Received ${typeof server}.`,
      );
    return server;
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes)
      if (route.component === defaultRoute.component)
        return { page: () => Promise.resolve(defaultRoute.instance) };
    if (route.type === "redirect") return RedirectSinglePageBuiltModule;
    else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
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
  }
  createNodePool(poolSize, stats) {
    return new NodePool(poolSize, stats);
  }
  createStringCache() {
    return new HTMLStringCache(1e3);
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/routing/helpers.js
function routeIsRedirect(route) {
  return route?.type === "redirect";
}
function routeIsFallback(route) {
  return route?.type === "fallback";
}
function getFallbackRoute(route, routeList) {
  const fallbackRoute = routeList.find((r) => {
    if (route.route === "/" && r.routeData.route === "/") return true;
    return r.routeData.fallbackRoutes.find((f) => {
      return f.route === route.route;
    });
  });
  if (!fallbackRoute) throw new Error(`No fallback route found for route ${route.route}`);
  return fallbackRoute.routeData;
}
function routeHasHtmlExtension(route) {
  return route.segments.some((segment) =>
    segment.some((part) => !part.dynamic && part.content.includes(".html")),
  );
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/render/params-and-props.js
async function getProps(opts) {
  const {
    logger,
    mod,
    routeData: route,
    routeCache,
    pathname,
    serverLike,
    base,
    trailingSlash,
  } = opts;
  if (!route || route.pathname) return {};
  if (
    routeIsRedirect(route) ||
    routeIsFallback(route) ||
    route.component === "astro-default-404.astro"
  )
    return {};
  const staticPaths = await callGetStaticPaths({
    mod,
    route,
    routeCache,
    ssr: serverLike,
    base,
    trailingSlash,
  });
  const params = getParams(route, pathname);
  const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger, trailingSlash);
  if (!matchedStaticPath && (serverLike ? route.prerender : true))
    throw new AstroError({
      ...NoMatchingStaticPathFound,
      message: NoMatchingStaticPathFound.message(pathname),
      hint: NoMatchingStaticPathFound.hint([route.component]),
    });
  if (mod) validatePrerenderEndpointCollision(route, mod, params);
  return matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
}
function getParams(route, pathname) {
  if (!route.params.length) return {};
  const path =
    pathname.endsWith(".html") && !routeHasHtmlExtension(route) ? pathname.slice(0, -5) : pathname;
  const paramsMatch = [route, ...route.fallbackRoutes]
    .map((r) => r.pattern)
    .map((pattern) => pattern.exec(path))
    .find((x) => x);
  if (!paramsMatch) return {};
  const params = {};
  route.params.forEach((key, i) => {
    if (key.startsWith("..."))
      params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : void 0;
    else params[key] = paramsMatch[i + 1];
  });
  return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
  if (route.type === "endpoint" && mod.getStaticPaths) {
    const lastSegment = route.segments[route.segments.length - 1];
    const paramValues = Object.values(params);
    const lastParam = paramValues[paramValues.length - 1];
    if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0)
      throw new AstroError({
        ...PrerenderDynamicEndpointPathCollide,
        message: PrerenderDynamicEndpointPathCollide.message(route.route),
        hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
        location: { file: route.component },
      });
  }
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/render/slots.js
function getFunctionExpression(slot) {
  if (!slot) return;
  const expressions = slot?.expressions?.filter((e) => isRenderInstruction(e) === false);
  if (expressions?.length !== 1) return;
  return expressions[0];
}
const Slots = class {
  #result;
  #slots;
  #logger;
  constructor(result, slots, logger) {
    this.#result = result;
    this.#slots = slots;
    this.#logger = logger;
    if (slots)
      for (const key of Object.keys(slots)) {
        if (this[key] !== void 0)
          throw new AstroError({
            ...ReservedSlotName,
            message: ReservedSlotName.message(key),
          });
        Object.defineProperty(this, key, {
          get() {
            return true;
          },
          enumerable: true,
        });
      }
  }
  has(name) {
    if (!this.#slots) return false;
    return Boolean(this.#slots[name]);
  }
  async render(name, args = []) {
    if (!this.#slots || !this.has(name)) return;
    const result = this.#result;
    if (!Array.isArray(args))
      this.#logger.warn(
        null,
        `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as an item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`,
      );
    else if (args.length > 0) {
      const slotValue = this.#slots[name];
      const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
      const expression = getFunctionExpression(component);
      if (expression) {
        const slot = async () =>
          typeof expression === "function" ? expression(...args) : expression;
        return await renderSlotToString(result, slot).then((res) => {
          return res;
        });
      }
      if (typeof component === "function")
        return await renderJSX(result, component(...args)).then((res) =>
          res != null ? String(res) : res,
        );
    }
    return chunkToString(result, await renderSlotToString(result, this.#slots[name]));
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/middleware/sequence.js
function sequence(...handlers) {
  const filtered = handlers.filter((h) => !!h);
  const length = filtered.length;
  if (!length)
    return defineMiddleware((_context, next) => {
      return next();
    });
  return defineMiddleware((context, next) => {
    let carriedPayload = void 0;
    return applyHandle(0, context);
    function applyHandle(i, handleContext) {
      const handle = filtered[i];
      return handle(handleContext, async (payload) => {
        if (i < length - 1) {
          if (payload) {
            let newRequest;
            if (payload instanceof Request) newRequest = payload;
            else if (payload instanceof URL)
              newRequest = new Request(payload, handleContext.request.clone());
            else
              newRequest = new Request(
                new URL(payload, handleContext.url.origin),
                handleContext.request.clone(),
              );
            const oldPathname = handleContext.url.pathname;
            const pipeline = Reflect.get(handleContext, pipelineSymbol);
            const { routeData, pathname } = await pipeline.tryRewrite(
              payload,
              handleContext.request,
            );
            if (
              pipeline.manifest.serverLike === true &&
              handleContext.isPrerendered === false &&
              routeData.prerender === true
            )
              throw new AstroError({
                ...ForbiddenRewrite,
                message: ForbiddenRewrite.message(
                  handleContext.url.pathname,
                  pathname,
                  routeData.component,
                ),
                hint: ForbiddenRewrite.hint(routeData.component),
              });
            carriedPayload = payload;
            handleContext.request = newRequest;
            handleContext.url = new URL(newRequest.url);
            handleContext.params = getParams(routeData, pathname);
            handleContext.routePattern = routeData.route;
            setOriginPathname(
              handleContext.request,
              oldPathname,
              pipeline.manifest.trailingSlash,
              pipeline.manifest.buildFormat,
            );
          }
          return applyHandle(i + 1, handleContext);
        } else return next(payload ?? carriedPayload);
      });
    }
  });
}
//#endregion
export {
  normalizeThePath as A,
  isRoute404 as C,
  readBodyWithLimit as D,
  BodySizeLimitError as E,
  getAllCodes as O,
  setOriginPathname as S,
  DEFAULT_404_ROUTE as T,
  RedirectSinglePageBuiltModule as _,
  getFallbackRoute as a,
  findRouteToRewrite as b,
  routeIsRedirect as c,
  deserializeRouteData as d,
  deserializeRouteInfo as f,
  getRouteGenerator as g,
  getPattern as h,
  getProps as i,
  shouldAppendForwardSlash as j,
  normalizeTheLocale as k,
  Pipeline as l,
  SERVER_ISLAND_COMPONENT as m,
  Slots as n,
  routeHasHtmlExtension as o,
  serializeRouteData as p,
  getParams as r,
  routeIsFallback as s,
  sequence as t,
  deserializeManifest as u,
  defineMiddleware as v,
  isRoute500 as w,
  getOriginPathname as x,
  copyRequest as y,
};
