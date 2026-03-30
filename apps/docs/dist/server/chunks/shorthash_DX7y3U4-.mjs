globalThis.process ??= {};
globalThis.process.env ??= {};
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/errors/utils.js
function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/errors/printer.js
function codeFrame(src, loc) {
  if (!loc || loc.line === void 0 || loc.column === void 0) return "";
  const lines = normalizeLF(src)
    .split("\n")
    .map((ln) => ln.replace(/\t/g, "  "));
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) if (lines[loc.line + n]) visibleLines.push(loc.line + n);
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    const w = `> ${lineNo}`;
    if (w.length > gutterWidth) gutterWidth = w.length;
  }
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}
`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(" ")}  | ${Array.from({ length: loc.column }).join(" ")}^
`;
  }
  return output;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/errors/errors.js
const AstroError = class extends Error {
  loc;
  title;
  hint;
  frame;
  type = "AstroError";
  constructor(props, options) {
    const { name, title, message, stack, location, hint, frame } = props;
    super(message, options);
    this.title = title;
    this.name = name;
    if (message) this.message = message;
    this.stack = stack ? stack : this.stack;
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }
  setLocation(location) {
    this.loc = location;
  }
  setName(name) {
    this.name = name;
  }
  setMessage(message) {
    this.message = message;
  }
  setHint(hint) {
    this.hint = hint;
  }
  setFrame(source, location) {
    this.frame = codeFrame(source, location);
  }
  static is(err) {
    return err?.type === "AstroError";
  }
};
const AstroUserError = class extends Error {
  type = "AstroUserError";
  /**
   * A message that explains to the user how they can fix the error.
   */
  hint;
  name = "AstroUserError";
  constructor(message, hint) {
    super();
    this.message = message;
    this.hint = hint;
  }
  static is(err) {
    return err?.type === "AstroUserError";
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/core/errors/errors-data.js
const ClientAddressNotAvailable = {
  name: "ClientAddressNotAvailable",
  title: "`Astro.clientAddress` is not available in current adapter.",
  message: (adapterName) =>
    `\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`,
};
const PrerenderClientAddressNotAvailable = {
  name: "PrerenderClientAddressNotAvailable",
  title: "`Astro.clientAddress` cannot be used inside prerendered routes.",
  message: (name) => `\`Astro.clientAddress\` cannot be used inside prerendered route ${name}`,
};
const StaticClientAddressNotAvailable = {
  name: "StaticClientAddressNotAvailable",
  title: "`Astro.clientAddress` is not available in prerendered pages.",
  message: "`Astro.clientAddress` is only available on pages that are server-rendered.",
  hint: "See https://docs.astro.build/en/guides/on-demand-rendering/ for more information on how to enable SSR.",
};
const NoMatchingStaticPathFound = {
  name: "NoMatchingStaticPathFound",
  title: "No static path found for requested path.",
  message: (pathName) =>
    `A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
  hint: (possibleRoutes) => `Possible dynamic routes being matched: ${possibleRoutes.join(", ")}.`,
};
const OnlyResponseCanBeReturned = {
  name: "OnlyResponseCanBeReturned",
  title: "Invalid type returned by Astro page.",
  message: (route, returnedValue) =>
    `Route \`${route ? route : ""}\` returned a \`${returnedValue}\`. Only a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned from Astro files.`,
  hint: "See https://docs.astro.build/en/guides/on-demand-rendering/#response for more information.",
};
const MissingMediaQueryDirective = {
  name: "MissingMediaQueryDirective",
  title: "Missing value for `client:media` directive.",
  message:
    'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided',
};
const NoMatchingRenderer = {
  name: "NoMatchingRenderer",
  title: "No matching renderer found.",
  message: (
    componentName,
    componentExtension,
    plural,
    validRenderersCount,
  ) => `Unable to render \`${componentName}\`.

${
  validRenderersCount > 0
    ? `There ${plural ? "are" : "is"} ${validRenderersCount} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render \`${componentName}\`.`
    : `No valid renderer was found ${componentExtension ? `for the \`.${componentExtension}\` file extension.` : `for this file extension.`}`
}`,
  hint: (probableRenderers) => `Did you mean to enable the ${probableRenderers} integration?

See https://docs.astro.build/en/guides/framework-components/ for more information on how to install and configure integrations.`,
};
const NoClientOnlyHint = {
  name: "NoClientOnlyHint",
  title: "Missing hint on client:only directive.",
  message: (componentName) =>
    `Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
  hint: (probableRenderers) =>
    `Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`,
};
const InvalidGetStaticPathsEntry = {
  name: "InvalidGetStaticPathsEntry",
  title: "Invalid entry inside getStaticPath's return value",
  message: (entryType) =>
    `Invalid entry returned by getStaticPaths. Expected an object, got \`${entryType}\``,
  hint: "If you're using a `.map` call, you might be looking for `.flatMap()` instead. See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.",
};
const InvalidGetStaticPathsReturn = {
  name: "InvalidGetStaticPathsReturn",
  title: "Invalid value returned by getStaticPaths.",
  message: (returnType) =>
    `Invalid type returned by \`getStaticPaths\`. Expected an \`array\`, got \`${returnType}\``,
  hint: "See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.",
};
const GetStaticPathsExpectedParams = {
  name: "GetStaticPathsExpectedParams",
  title: "Missing params property on `getStaticPaths` route.",
  message: "Missing or empty required `params` property on `getStaticPaths` route.",
  hint: "See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.",
};
const GetStaticPathsInvalidRouteParam = {
  name: "GetStaticPathsInvalidRouteParam",
  title: "Invalid route parameter returned by `getStaticPaths()`.",
  message: (key, value, valueType) =>
    `Invalid \`getStaticPaths()\` route parameter for \`${key}\`. Expected a string or undefined, received \`${valueType}\` (\`${value}\`)`,
  hint: "See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.",
};
const GetStaticPathsRequired = {
  name: "GetStaticPathsRequired",
  title: "`getStaticPaths()` function required for dynamic routes.",
  message:
    "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.",
  hint: `See https://docs.astro.build/en/guides/routing/#dynamic-routes for more information on dynamic routes.

	If you meant for this route to be server-rendered, set \`export const prerender = false;\` in the page.`,
};
const ReservedSlotName = {
  name: "ReservedSlotName",
  title: "Invalid slot name.",
  message: (slotName) =>
    `Unable to create a slot named \`${slotName}\`. \`${slotName}\` is a reserved slot name. Please update the name of this slot.`,
};
const NoMatchingImport = {
  name: "NoMatchingImport",
  title: "No import found for component.",
  message: (componentName) =>
    `Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
  hint: "Please make sure the component is properly imported.",
};
const InvalidComponentArgs = {
  name: "InvalidComponentArgs",
  title: "Invalid component arguments.",
  message: (name) => `Invalid arguments passed to${name ? ` <${name}>` : ""} component.`,
  hint: "Astro components cannot be rendered directly via function call, such as `Component()` or `{items.map(Component)}`.",
};
const PageNumberParamNotFound = {
  name: "PageNumberParamNotFound",
  title: "Page number param not found.",
  message: (paramName) =>
    `[paginate()] page number param \`${paramName}\` not found in your filepath.`,
  hint: "Rename your file to `[page].astro` or `[...page].astro`.",
};
const ImageMissingAlt = {
  name: "ImageMissingAlt",
  title: 'Image missing required "alt" property.',
  message:
    'Image missing "alt" property. "alt" text is required to describe important images on the page.',
  hint: 'Use an empty string ("") for decorative images.',
};
const InvalidImageService = {
  name: "InvalidImageService",
  title: "Error while loading image service.",
  message:
    "There was an error loading the configured image service. Please see the stack trace for more information.",
};
const MissingImageDimension = {
  name: "MissingImageDimension",
  title: "Missing image dimensions",
  message: (missingDimension, imageURL) =>
    `Missing ${missingDimension === "both" ? "width and height attributes" : `${missingDimension} attribute`} for ${imageURL}. When using remote images, both dimensions are required in order to avoid CLS.`,
  hint: "If your image is inside your `src` folder, you probably meant to import it instead. See [the Imports guide for more information](https://docs.astro.build/en/guides/imports/#other-assets). You can also use `inferSize={true}` for remote images to get the original dimensions.",
};
const FailedToFetchRemoteImageDimensions = {
  name: "FailedToFetchRemoteImageDimensions",
  title: "Failed to retrieve remote image dimensions",
  message: (imageURL) => `Failed to get the dimensions for ${imageURL}.`,
  hint: "Verify your remote image URL is accurate, and that you are not using `inferSize` with a file located in your `public/` folder.",
};
const RemoteImageNotAllowed = {
  name: "RemoteImageNotAllowed",
  title: "Remote image is not allowed",
  message: (imageURL) => `Remote image ${imageURL} is not allowed by your image configuration.`,
  hint: "Update `image.domains` or `image.remotePatterns`, or remove `inferSize` for this image.",
};
const UnsupportedImageFormat = {
  name: "UnsupportedImageFormat",
  title: "Unsupported image format",
  message: (format, imagePath, supportedFormats) =>
    `Received unsupported format \`${format}\` from \`${imagePath}\`. Currently only ${supportedFormats.join(", ")} are supported by our image services.`,
  hint: "Using an `img` tag directly instead of the `Image` component might be what you're looking for.",
};
const UnsupportedImageConversion = {
  name: "UnsupportedImageConversion",
  title: "Unsupported image conversion",
  message:
    "Converting between vector (such as SVGs) and raster (such as PNGs and JPEGs) images is not currently supported.",
};
const PrerenderDynamicEndpointPathCollide = {
  name: "PrerenderDynamicEndpointPathCollide",
  title: "Prerendered dynamic endpoint has path collision.",
  message: (pathname) =>
    `Could not render \`${pathname}\` with an \`undefined\` param as the generated path will collide during prerendering. Prevent passing \`undefined\` as \`params\` for the endpoint's \`getStaticPaths()\` function, or add an additional extension to the endpoint's filename.`,
  hint: (filename) =>
    `Rename \`${filename}\` to \`${filename.replace(/\.(?:js|ts)/, (m) => `.json` + m)}\``,
};
const ExpectedImage = {
  name: "ExpectedImage",
  title: "Expected src to be an image.",
  message: (
    src,
    typeofOptions,
    fullOptions,
  ) => `Expected \`src\` property for \`getImage\` or \`<Image />\` to be either an ESM imported image or a string with the path of a remote image. Received \`${src}\` (type: \`${typeofOptions}\`).

Full serialized options received: \`${fullOptions}\`.`,
  hint: "This error can often happen because of a wrong path. Make sure the path to your image is correct. If you're passing an async function, make sure to call and await it.",
};
const ExpectedImageOptions = {
  name: "ExpectedImageOptions",
  title: "Expected image options.",
  message: (options) => `Expected getImage() parameter to be an object. Received \`${options}\`.`,
};
const ExpectedNotESMImage = {
  name: "ExpectedNotESMImage",
  title: "Expected image options, not an ESM-imported image.",
  message:
    "An ESM-imported image cannot be passed directly to `getImage()`. Instead, pass an object with the image in the `src` property.",
  hint: "Try changing `getImage(myImage)` to `getImage({ src: myImage })`",
};
const IncompatibleDescriptorOptions = {
  name: "IncompatibleDescriptorOptions",
  title: "Cannot set both `densities` and `widths`",
  message:
    "Only one of `densities` or `widths` can be specified. In most cases, you'll probably want to use only `widths` if you require specific widths.",
  hint: "Those attributes are used to construct a `srcset` attribute, which cannot have both `x` and `w` descriptors.",
};
const NoImageMetadata = {
  name: "NoImageMetadata",
  title: "Could not process image metadata.",
  message: (imagePath) =>
    `Could not process image metadata${imagePath ? ` for \`${imagePath}\`` : ""}.`,
  hint: "This is often caused by a corrupted or malformed image. Re-exporting the image from your image editor may fix this issue.",
};
const ResponseSentError = {
  name: "ResponseSentError",
  title: "Unable to set response.",
  message: "The response has already been sent to the browser and cannot be altered.",
};
const MiddlewareNoDataOrNextCalled = {
  name: "MiddlewareNoDataOrNextCalled",
  title: "The middleware didn't return a `Response`.",
  message:
    "Make sure your middleware returns a `Response` object, either directly or by returning the `Response` from calling the `next` function.",
};
const MiddlewareNotAResponse = {
  name: "MiddlewareNotAResponse",
  title: "The middleware returned something that is not a `Response` object.",
  message: "Any data returned from middleware must be a valid `Response` object.",
};
const EndpointDidNotReturnAResponse = {
  name: "EndpointDidNotReturnAResponse",
  title: "The endpoint did not return a `Response`.",
  message:
    "An endpoint must return either a `Response`, or a `Promise` that resolves with a `Response`.",
};
const LocalsNotAnObject = {
  name: "LocalsNotAnObject",
  title: "Value assigned to `locals` is not accepted.",
  message:
    "`locals` can only be assigned to an object. Other values like numbers, strings, etc. are not accepted.",
  hint: "If you tried to remove some information from the `locals` object, try to use `delete` or set the property to `undefined`.",
};
const LocalsReassigned = {
  name: "LocalsReassigned",
  title: "`locals` must not be reassigned.",
  message: "`locals` cannot be assigned directly.",
  hint: "Set a `locals` property instead.",
};
const AstroResponseHeadersReassigned = {
  name: "AstroResponseHeadersReassigned",
  title: "`Astro.response.headers` must not be reassigned.",
  message:
    "Individual headers can be added to and removed from `Astro.response.headers`, but it must not be replaced with another instance of `Headers` altogether.",
  hint: "Consider using `Astro.response.headers.add()`, and `Astro.response.headers.delete()`.",
};
const LocalImageUsedWrongly = {
  name: "LocalImageUsedWrongly",
  title: "Local images must be imported.",
  message: (imageFilePath) =>
    `\`Image\`'s and \`getImage\`'s \`src\` parameter must be an imported image or an URL, it cannot be a string filepath. Received \`${imageFilePath}\`.`,
  hint: "If you want to use an image from your `src` folder, you need to either import it or if the image is coming from a content collection, use the [image() schema helper](https://docs.astro.build/en/guides/images/#images-in-content-collections). See https://docs.astro.build/en/guides/images/#src-required for more information on the `src` property.",
};
const i18nNoLocaleFoundInPath = {
  name: "i18nNoLocaleFoundInPath",
  title: "The path doesn't contain any locale",
  message:
    "You tried to use an i18n utility on a path that doesn't contain any locale. You can use `pathHasLocale` first to determine if the path has a locale.",
};
const RewriteWithBodyUsed = {
  name: "RewriteWithBodyUsed",
  title: "Cannot use Astro.rewrite after the request body has been read",
  message:
    "Astro.rewrite() cannot be used if the request body has already been read. If you need to read the body, first clone the request.",
};
const ForbiddenRewrite = {
  name: "ForbiddenRewrite",
  title: "Forbidden rewrite to a static route.",
  message: (
    from,
    to,
    component,
  ) => `You tried to rewrite the on-demand route '${from}' with the static route '${to}', when using the 'server' output. 

The static route '${to}' is rendered by the component
'${component}', which is marked as prerendered. This is a forbidden operation because during the build, the component '${component}' is compiled to an
HTML file, which can't be retrieved at runtime by Astro.`,
  hint: (component) =>
    `Add \`export const prerender = false\` to the component '${component}', or use a Astro.redirect().`,
};
const FontFamilyNotFound = {
  name: "FontFamilyNotFound",
  title: "Font family not found",
  message: (family) =>
    `No data was found for the \`"${family}"\` family passed to the \`<Font>\` component.`,
  hint: "This is often caused by a typo. Check that the `<Font />` component is using a `cssVariable` specified in your config.",
};
const UnavailableAstroGlobal = {
  name: "UnavailableAstroGlobal",
  title: "Unavailable Astro global in getStaticPaths()",
  message: (name) =>
    `The Astro global is not available in this scope. Please remove "Astro.${name}" from your getStaticPaths() function.`,
};
const ActionsReturnedInvalidDataError = {
  name: "ActionsReturnedInvalidDataError",
  title: "Action handler returned invalid data.",
  message: (error) =>
    `Action handler returned invalid data. Handlers should return serializable data types like objects, arrays, strings, and numbers. Parse error: ${error}`,
  hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue",
};
const ActionNotFoundError = {
  name: "ActionNotFoundError",
  title: "Action not found.",
  message: (actionName) =>
    `The server received a request for an action named \`${actionName}\` but could not find a match. If you renamed an action, check that you've updated your \`actions/index\` file and your calling code to match.`,
  hint: "You can run `astro check` to detect type errors caused by mismatched action names.",
};
const SessionStorageInitError = {
  name: "SessionStorageInitError",
  title: "Session storage could not be initialized.",
  message: (error, driver) =>
    `Error when initializing session storage${driver ? ` with driver \`${driver}\`` : ""}. \`${error ?? ""}\``,
  hint: "For more information, see https://docs.astro.build/en/guides/sessions/",
};
const SessionStorageSaveError = {
  name: "SessionStorageSaveError",
  title: "Session data could not be saved.",
  message: (error, driver) =>
    `Error when saving session data${driver ? ` with driver \`${driver}\`` : ""}. \`${error ?? ""}\``,
  hint: "For more information, see https://docs.astro.build/en/guides/sessions/",
};
const CacheNotEnabled = {
  name: "CacheNotEnabled",
  title: "Cache is not enabled.",
  message:
    "`Astro.cache` is not available because the cache feature is not enabled. To use caching, configure a cache provider in your Astro config under `experimental.cache`.",
  hint: 'Use an adapter that provides a default cache provider, or set one explicitly: `experimental: { cache: { provider: "..." } }`. See https://docs.astro.build/en/reference/experimental-flags/route-caching/.',
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/runtime/server/shorthash.js
/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = 61;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) result = dictionary[integer] + result;
  return sign + result;
}
//#endregion
export {
  NoClientOnlyHint as A,
  ReservedSlotName as B,
  LocalImageUsedWrongly as C,
  MiddlewareNotAResponse as D,
  MiddlewareNoDataOrNextCalled as E,
  OnlyResponseCanBeReturned as F,
  StaticClientAddressNotAvailable as G,
  RewriteWithBodyUsed as H,
  PageNumberParamNotFound as I,
  UnsupportedImageFormat as J,
  UnavailableAstroGlobal as K,
  PrerenderClientAddressNotAvailable as L,
  NoMatchingImport as M,
  NoMatchingRenderer as N,
  MissingImageDimension as O,
  NoMatchingStaticPathFound as P,
  PrerenderDynamicEndpointPathCollide as R,
  InvalidImageService as S,
  LocalsReassigned as T,
  SessionStorageInitError as U,
  ResponseSentError as V,
  SessionStorageSaveError as W,
  AstroError as X,
  i18nNoLocaleFoundInPath as Y,
  AstroUserError as Z,
  ImageMissingAlt as _,
  CacheNotEnabled as a,
  InvalidGetStaticPathsEntry as b,
  ExpectedImage as c,
  FailedToFetchRemoteImageDimensions as d,
  FontFamilyNotFound as f,
  GetStaticPathsRequired as g,
  GetStaticPathsInvalidRouteParam as h,
  AstroResponseHeadersReassigned as i,
  NoImageMetadata as j,
  MissingMediaQueryDirective as k,
  ExpectedImageOptions as l,
  GetStaticPathsExpectedParams as m,
  ActionNotFoundError as n,
  ClientAddressNotAvailable as o,
  ForbiddenRewrite as p,
  UnsupportedImageConversion as q,
  ActionsReturnedInvalidDataError as r,
  EndpointDidNotReturnAResponse as s,
  shorthash as t,
  ExpectedNotESMImage as u,
  IncompatibleDescriptorOptions as v,
  LocalsNotAnObject as w,
  InvalidGetStaticPathsReturn as x,
  InvalidComponentArgs as y,
  RemoteImageNotAllowed as z,
};
