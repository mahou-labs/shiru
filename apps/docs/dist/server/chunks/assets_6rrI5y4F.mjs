globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as isRemotePath, l as joinPaths, p as removeQueryString } from "./path_DI6zaT7z.mjs";
import {
  a as isRemoteAllowed,
  i as resolveSrc,
  n as isESMImportedImage,
  r as isRemoteImage,
  t as inferRemoteSize,
} from "./remoteProbe_BM9BtsPs.mjs";
import {
  C as LocalImageUsedWrongly,
  J as UnsupportedImageFormat,
  O as MissingImageDimension,
  S as InvalidImageService,
  X as AstroError,
  c as ExpectedImage,
  l as ExpectedImageOptions,
  q as UnsupportedImageConversion,
  t as shorthash,
  u as ExpectedNotESMImage,
  v as IncompatibleDescriptorOptions,
  z as RemoteImageNotAllowed,
} from "./shorthash_DX7y3U4-.mjs";
const VALID_SUPPORTED_FORMATS = ["jpeg", "jpg", "png", "tiff", "webp", "gif", "svg", "avif"];
const DEFAULT_OUTPUT_FORMAT = "webp";
const DEFAULT_HASH_PROPS = [
  "src",
  "width",
  "height",
  "format",
  "quality",
  "fit",
  "position",
  "background",
];
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/layout.js
const DEFAULT_RESOLUTIONS = [
  640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560, 3200, 3840, 4480, 5120, 6016,
];
const LIMITED_RESOLUTIONS = [640, 750, 828, 1080, 1280, 1668, 2048, 2560];
const getWidths = ({ width, layout, breakpoints = DEFAULT_RESOLUTIONS, originalWidth }) => {
  const smallerThanOriginal = (w) => !originalWidth || w <= originalWidth;
  if (layout === "full-width") return breakpoints.filter(smallerThanOriginal);
  if (!width) return [];
  const doubleWidth = width * 2;
  const maxSize = originalWidth ? Math.min(doubleWidth, originalWidth) : doubleWidth;
  if (layout === "fixed")
    return originalWidth && width > originalWidth ? [originalWidth] : [width, maxSize];
  if (layout === "constrained")
    return [width, doubleWidth, ...breakpoints].filter((w) => w <= maxSize).sort((a, b) => a - b);
  return [];
};
const getSizesAttribute = ({ width, layout }) => {
  if (!width || !layout) return;
  switch (layout) {
    case "constrained":
      return `(min-width: ${width}px) ${width}px, 100vw`;
    case "fixed":
      return `${width}px`;
    case "full-width":
      return `100vw`;
    default:
      return;
  }
};
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/services/service.js
function isLocalService(service) {
  if (!service) return false;
  return "transform" in service;
}
const sortNumeric = (a, b) => a - b;
function verifyOptions(options) {
  if (!options.src || (!isRemoteImage(options.src) && !isESMImportedImage(options.src)))
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(
        JSON.stringify(options.src),
        typeof options.src,
        JSON.stringify(options, (_, v) => (v === void 0 ? null : v)),
      ),
    });
  if (!isESMImportedImage(options.src)) {
    if (
      options.src.startsWith("/@fs/") ||
      (!isRemotePath(options.src) && !options.src.startsWith("/"))
    )
      throw new AstroError({
        ...LocalImageUsedWrongly,
        message: LocalImageUsedWrongly.message(options.src),
      });
    let missingDimension;
    if (!options.width && !options.height) missingDimension = "both";
    else if (!options.width && options.height) missingDimension = "width";
    else if (options.width && !options.height) missingDimension = "height";
    if (missingDimension)
      throw new AstroError({
        ...MissingImageDimension,
        message: MissingImageDimension.message(missingDimension, options.src),
      });
  } else {
    if (!VALID_SUPPORTED_FORMATS.includes(options.src.format))
      throw new AstroError({
        ...UnsupportedImageFormat,
        message: UnsupportedImageFormat.message(
          options.src.format,
          options.src.src,
          VALID_SUPPORTED_FORMATS,
        ),
      });
    if (options.widths && options.densities) throw new AstroError(IncompatibleDescriptorOptions);
    if (options.src.format !== "svg" && options.format === "svg")
      throw new AstroError(UnsupportedImageConversion);
  }
}
const baseService = {
  propertiesToHash: DEFAULT_HASH_PROPS,
  validateOptions(options) {
    verifyOptions(options);
    if (!options.format)
      if (isESMImportedImage(options.src) && options.src.format === "svg") options.format = "svg";
      else options.format = DEFAULT_OUTPUT_FORMAT;
    if (options.width) options.width = Math.round(options.width);
    if (options.height) options.height = Math.round(options.height);
    if (options.layout) delete options.layout;
    if (options.fit === "none") delete options.fit;
    return options;
  },
  getHTMLAttributes(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const {
      src,
      width,
      height,
      format,
      quality,
      densities,
      widths,
      formats,
      layout,
      priority,
      fit,
      position,
      background,
      ...attributes
    } = options;
    return {
      ...attributes,
      width: targetWidth,
      height: targetHeight,
      loading: attributes.loading ?? "lazy",
      decoding: attributes.decoding ?? "async",
    };
  },
  getSrcSet(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const aspectRatio = targetWidth / targetHeight;
    const { widths, densities } = options;
    const targetFormat = options.format ?? "webp";
    let transformedWidths = (widths ?? []).sort(sortNumeric);
    let imageWidth = options.width;
    let maxWidth = Number.POSITIVE_INFINITY;
    if (isESMImportedImage(options.src)) {
      imageWidth = options.src.width;
      maxWidth = imageWidth;
      if (transformedWidths.length > 0 && transformedWidths.at(-1) > maxWidth) {
        transformedWidths = transformedWidths.filter((width) => width <= maxWidth);
        transformedWidths.push(maxWidth);
      }
    }
    transformedWidths = Array.from(new Set(transformedWidths));
    const {
      width: transformWidth,
      height: transformHeight,
      ...transformWithoutDimensions
    } = options;
    let allWidths = [];
    if (densities) {
      const densityValues = densities.map((density) => {
        if (typeof density === "number") return density;
        else return Number.parseFloat(density);
      });
      allWidths = densityValues
        .sort(sortNumeric)
        .map((density) => Math.round(targetWidth * density))
        .map((width, index) => ({
          width,
          descriptor: `${densityValues[index]}x`,
        }));
    } else if (transformedWidths.length > 0)
      allWidths = transformedWidths.map((width) => ({
        width,
        descriptor: `${width}w`,
      }));
    return allWidths.map(({ width, descriptor }) => {
      const height = Math.round(width / aspectRatio);
      return {
        transform: {
          ...transformWithoutDimensions,
          width,
          height,
        },
        descriptor,
        attributes: { type: `image/${targetFormat}` },
      };
    });
  },
  getURL(options, imageConfig) {
    const searchParams = new URLSearchParams();
    if (isESMImportedImage(options.src)) searchParams.append("href", options.src.src);
    else if (isRemoteAllowed(options.src, imageConfig)) searchParams.append("href", options.src);
    else return options.src;
    Object.entries({
      w: "width",
      h: "height",
      q: "quality",
      f: "format",
      fit: "fit",
      position: "position",
      background: "background",
    }).forEach(([param, key]) => {
      options[key] && searchParams.append(param, options[key].toString());
    });
    let url = `${joinPaths("/", imageConfig.endpoint.route)}?${searchParams}`;
    if (imageConfig.assetQueryParams) {
      const assetQueryString = imageConfig.assetQueryParams.toString();
      if (assetQueryString) url += "&" + assetQueryString;
    }
    return url;
  },
  parseURL(url) {
    const params = url.searchParams;
    if (!params.has("href")) return;
    return {
      src: params.get("href"),
      width: params.has("w") ? Number.parseInt(params.get("w")) : void 0,
      height: params.has("h") ? Number.parseInt(params.get("h")) : void 0,
      format: params.get("f"),
      quality: params.get("q"),
      fit: params.get("fit"),
      position: params.get("position") ?? void 0,
      background: params.get("background") ?? void 0,
    };
  },
  getRemoteSize(url, imageConfig) {
    return inferRemoteSize(url, imageConfig);
  },
};
function getTargetDimensions(options) {
  let targetWidth = options.width;
  let targetHeight = options.height;
  if (isESMImportedImage(options.src)) {
    const aspectRatio = options.src.width / options.src.height;
    if (targetHeight && !targetWidth) targetWidth = Math.round(targetHeight * aspectRatio);
    else if (targetWidth && !targetHeight) targetHeight = Math.round(targetWidth / aspectRatio);
    else if (!targetWidth && !targetHeight) {
      targetWidth = options.src.width;
      targetHeight = options.src.height;
    }
  }
  return {
    targetWidth,
    targetHeight,
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/types.js
function isImageMetadata(src) {
  return src.fsPath && !("fsPath" in src);
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/utils/url.js
const PLACEHOLDER_BASE = "astro://placeholder";
function createPlaceholderURL(pathOrUrl) {
  return new URL(pathOrUrl, PLACEHOLDER_BASE);
}
function stringifyPlaceholderURL(url) {
  return url.href.replace(PLACEHOLDER_BASE, "");
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/internal.js
const cssFitValues = ["fill", "contain", "cover", "scale-down"];
async function getConfiguredImageService() {
  if (!globalThis?.astroAsset?.imageService) {
    const { default: service } = await import("./image-service-workerd_D2eClwoY.mjs").catch((e) => {
      const error = new AstroError(InvalidImageService);
      error.cause = e;
      throw error;
    });
    if (!globalThis.astroAsset) globalThis.astroAsset = {};
    globalThis.astroAsset.imageService = service;
    return service;
  }
  return globalThis.astroAsset.imageService;
}
async function getImage(options, imageConfig) {
  if (!options || typeof options !== "object")
    throw new AstroError({
      ...ExpectedImageOptions,
      message: ExpectedImageOptions.message(JSON.stringify(options)),
    });
  if (typeof options.src === "undefined")
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(options.src, "undefined", JSON.stringify(options)),
    });
  if (isImageMetadata(options)) throw new AstroError(ExpectedNotESMImage);
  const service = await getConfiguredImageService();
  const resolvedOptions = {
    ...options,
    src: await resolveSrc(options.src),
  };
  let originalWidth;
  let originalHeight;
  if (resolvedOptions.inferSize) {
    delete resolvedOptions.inferSize;
    if (isRemoteImage(resolvedOptions.src) && isRemotePath(resolvedOptions.src)) {
      if (!isRemoteAllowed(resolvedOptions.src, imageConfig))
        throw new AstroError({
          ...RemoteImageNotAllowed,
          message: RemoteImageNotAllowed.message(resolvedOptions.src),
        });
      const getRemoteSize = (url) =>
        service.getRemoteSize?.(url, imageConfig) ?? inferRemoteSize(url, imageConfig);
      const result = await getRemoteSize(resolvedOptions.src);
      resolvedOptions.width ??= result.width;
      resolvedOptions.height ??= result.height;
      originalWidth = result.width;
      originalHeight = result.height;
    }
  }
  const originalFilePath = isESMImportedImage(resolvedOptions.src)
    ? resolvedOptions.src.fsPath
    : void 0;
  const clonedSrc = isESMImportedImage(resolvedOptions.src)
    ? (resolvedOptions.src.clone ?? resolvedOptions.src)
    : resolvedOptions.src;
  if (isESMImportedImage(clonedSrc)) {
    originalWidth = clonedSrc.width;
    originalHeight = clonedSrc.height;
  }
  if (originalWidth && originalHeight) {
    const aspectRatio = originalWidth / originalHeight;
    if (resolvedOptions.height && !resolvedOptions.width)
      resolvedOptions.width = Math.round(resolvedOptions.height * aspectRatio);
    else if (resolvedOptions.width && !resolvedOptions.height)
      resolvedOptions.height = Math.round(resolvedOptions.width / aspectRatio);
    else if (!resolvedOptions.width && !resolvedOptions.height) {
      resolvedOptions.width = originalWidth;
      resolvedOptions.height = originalHeight;
    }
  }
  resolvedOptions.src = clonedSrc;
  const layout = options.layout ?? imageConfig.layout ?? "none";
  if (resolvedOptions.priority) {
    resolvedOptions.loading ??= "eager";
    resolvedOptions.decoding ??= "sync";
    resolvedOptions.fetchpriority ??= "high";
    delete resolvedOptions.priority;
  } else {
    resolvedOptions.loading ??= "lazy";
    resolvedOptions.decoding ??= "async";
    resolvedOptions.fetchpriority ??= void 0;
  }
  if (layout !== "none") {
    resolvedOptions.widths ||= getWidths({
      width: resolvedOptions.width,
      layout,
      originalWidth,
      breakpoints: imageConfig.breakpoints?.length
        ? imageConfig.breakpoints
        : isLocalService(service)
          ? LIMITED_RESOLUTIONS
          : DEFAULT_RESOLUTIONS,
    });
    resolvedOptions.sizes ||= getSizesAttribute({
      width: resolvedOptions.width,
      layout,
    });
    delete resolvedOptions.densities;
    resolvedOptions["data-astro-image"] = layout;
    if (resolvedOptions.fit && cssFitValues.includes(resolvedOptions.fit))
      resolvedOptions["data-astro-image-fit"] = resolvedOptions.fit;
    if (resolvedOptions.position)
      resolvedOptions["data-astro-image-pos"] = resolvedOptions.position.replace(/\s+/g, "-");
  }
  const validatedOptions = service.validateOptions
    ? await service.validateOptions(resolvedOptions, imageConfig)
    : resolvedOptions;
  const srcSetTransforms = service.getSrcSet
    ? await service.getSrcSet(validatedOptions, imageConfig)
    : [];
  const lazyImageURLFactory = (getValue) => {
    let cached = null;
    return () => (cached ??= getValue());
  };
  const initialImageURL = await service.getURL(validatedOptions, imageConfig);
  let lazyImageURL = lazyImageURLFactory(() => initialImageURL);
  const matchesValidatedTransform = (transform) =>
    transform.width === validatedOptions.width &&
    transform.height === validatedOptions.height &&
    transform.format === validatedOptions.format;
  let srcSets = await Promise.all(
    srcSetTransforms.map(async (srcSet) => {
      return {
        transform: srcSet.transform,
        url: matchesValidatedTransform(srcSet.transform)
          ? initialImageURL
          : await service.getURL(srcSet.transform, imageConfig),
        descriptor: srcSet.descriptor,
        attributes: srcSet.attributes,
      };
    }),
  );
  if (
    isLocalService(service) &&
    globalThis.astroAsset.addStaticImage &&
    !(isRemoteImage(validatedOptions.src) && initialImageURL === validatedOptions.src)
  ) {
    const propsToHash = service.propertiesToHash ?? DEFAULT_HASH_PROPS;
    lazyImageURL = lazyImageURLFactory(() =>
      globalThis.astroAsset.addStaticImage(validatedOptions, propsToHash, originalFilePath),
    );
    srcSets = srcSetTransforms.map((srcSet) => {
      return {
        transform: srcSet.transform,
        url: matchesValidatedTransform(srcSet.transform)
          ? lazyImageURL()
          : globalThis.astroAsset.addStaticImage(srcSet.transform, propsToHash, originalFilePath),
        descriptor: srcSet.descriptor,
        attributes: srcSet.attributes,
      };
    });
  } else if (imageConfig.assetQueryParams) {
    const imageURLObj = createPlaceholderURL(initialImageURL);
    imageConfig.assetQueryParams.forEach((value, key) => {
      imageURLObj.searchParams.set(key, value);
    });
    lazyImageURL = lazyImageURLFactory(() => stringifyPlaceholderURL(imageURLObj));
    srcSets = srcSets.map((srcSet) => {
      const urlObj = createPlaceholderURL(srcSet.url);
      imageConfig.assetQueryParams.forEach((value, key) => {
        urlObj.searchParams.set(key, value);
      });
      return {
        ...srcSet,
        url: stringifyPlaceholderURL(urlObj),
      };
    });
  }
  return {
    rawOptions: resolvedOptions,
    options: validatedOptions,
    get src() {
      return lazyImageURL();
    },
    srcSet: {
      values: srcSets,
      attribute: srcSets.map((srcSet) => `${srcSet.url} ${srcSet.descriptor}`).join(", "),
    },
    attributes:
      service.getHTMLAttributes !== void 0
        ? await service.getHTMLAttributes(validatedOptions, imageConfig)
        : {},
  };
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/utils/deterministic-string.js
const objConstructorString = Function.prototype.toString.call(Object);
function isPlainObject(value) {
  if (
    typeof value !== "object" ||
    value === null ||
    Object.prototype.toString.call(value) !== "[object Object]"
  )
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  if (!Object.prototype.hasOwnProperty.call(proto, "constructor")) return false;
  return (
    typeof proto.constructor === "function" &&
    proto.constructor instanceof proto.constructor &&
    Function.prototype.toString.call(proto.constructor) === objConstructorString
  );
}
function deterministicString(input) {
  if (typeof input === "string") return JSON.stringify(input);
  else if (typeof input === "symbol" || typeof input === "function") return input.toString();
  else if (typeof input === "bigint") return `${input}n`;
  else if (
    input === globalThis ||
    input === void 0 ||
    input === null ||
    typeof input === "boolean" ||
    typeof input === "number" ||
    typeof input !== "object"
  )
    return `${input}`;
  else if (input instanceof Date) return `(${input.constructor.name}:${input.getTime()})`;
  else if (
    input instanceof RegExp ||
    input instanceof Error ||
    input instanceof WeakMap ||
    input instanceof WeakSet
  )
    return `(${input.constructor.name}:${input.toString()})`;
  else if (input instanceof Set) {
    let ret2 = `(${input.constructor.name}:[`;
    for (const val of input.values()) ret2 += `${deterministicString(val)},`;
    ret2 += "])";
    return ret2;
  } else if (
    Array.isArray(input) ||
    input instanceof Int8Array ||
    input instanceof Uint8Array ||
    input instanceof Uint8ClampedArray ||
    input instanceof Int16Array ||
    input instanceof Uint16Array ||
    input instanceof Int32Array ||
    input instanceof Uint32Array ||
    input instanceof Float32Array ||
    input instanceof Float64Array ||
    input instanceof BigInt64Array ||
    input instanceof BigUint64Array
  ) {
    let ret2 = `(${input.constructor.name}:[`;
    for (const [k, v] of input.entries()) ret2 += `(${k}:${deterministicString(v)}),`;
    ret2 += "])";
    return ret2;
  } else if (input instanceof ArrayBuffer || input instanceof SharedArrayBuffer)
    if (input.byteLength % 8 === 0) return deterministicString(new BigUint64Array(input));
    else if (input.byteLength % 4 === 0) return deterministicString(new Uint32Array(input));
    else if (input.byteLength % 2 === 0) return deterministicString(new Uint16Array(input));
    else {
      let ret2 = "(";
      for (let i = 0; i < input.byteLength; i++)
        ret2 += `${deterministicString(new Uint8Array(input.slice(i, i + 1)))},`;
      ret2 += ")";
      return ret2;
    }
  else if (input instanceof Map || isPlainObject(input)) {
    const sortable = [];
    const entries = input instanceof Map ? input.entries() : Object.entries(input);
    for (const [k, v] of entries) sortable.push([deterministicString(k), deterministicString(v)]);
    if (!(input instanceof Map)) {
      const symbolKeys2 = Object.getOwnPropertySymbols(input);
      for (let i = 0; i < symbolKeys2.length; i++)
        sortable.push([
          deterministicString(symbolKeys2[i]),
          deterministicString(input[symbolKeys2[i]]),
        ]);
    }
    sortable.sort(([a], [b]) => a.localeCompare(b));
    let ret2 = `(${input.constructor.name}:[`;
    for (const [k, v] of sortable) ret2 += `(${k}:${v}),`;
    ret2 += "])";
    return ret2;
  }
  const allEntries = [];
  for (const k in input) allEntries.push([deterministicString(k), deterministicString(input[k])]);
  const symbolKeys = Object.getOwnPropertySymbols(input);
  for (let i = 0; i < symbolKeys.length; i++)
    allEntries.push([
      deterministicString(symbolKeys[i]),
      deterministicString(input[symbolKeys[i]]),
    ]);
  allEntries.sort(([a], [b]) => a.localeCompare(b));
  let ret = `(${input.constructor.name}:[`;
  for (const [k, v] of allEntries) ret += `(${k}:${v}),`;
  ret += "])";
  return ret;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/utils/hash.js
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$%&*+,:;<=>?[\]^`{|}\u007F]/g;
function basename(filePath, ext) {
  let end = filePath.length;
  while (end > 0 && filePath[end - 1] === "/") end--;
  const stripped = filePath.slice(0, end);
  const lastSlash = stripped.lastIndexOf("/");
  const base = lastSlash === -1 ? stripped : stripped.slice(lastSlash + 1);
  if (ext && base.endsWith(ext)) return base.slice(0, base.length - ext.length);
  return base;
}
function dirname(filePath) {
  const lastSlash = filePath.lastIndexOf("/");
  if (lastSlash === -1) return ".";
  if (lastSlash === 0) return "/";
  return filePath.slice(0, lastSlash);
}
function extname(filePath) {
  const base = basename(filePath);
  const dotIndex = base.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return base.slice(dotIndex);
}
function propsToFilename(filePath, transform, hash) {
  let filename = decodeURIComponent(removeQueryString(filePath));
  const ext = extname(filename);
  if (filePath.startsWith("data:")) filename = shorthash(filePath);
  else filename = basename(filename, ext).replace(INVALID_CHAR_REGEX, "_");
  const prefixDirname = isESMImportedImage(transform.src) ? dirname(filePath) : "";
  const outputExt = transform.format ? `.${transform.format}` : ext;
  return `${prefixDirname}/${filename}_${hash}${outputExt}`;
}
function hashTransform(transform, imageService, propertiesToHash) {
  return shorthash(
    deterministicString(
      propertiesToHash.reduce(
        (acc, prop) => {
          acc[prop] = transform[prop];
          return acc;
        },
        { imageService },
      ),
    ),
  );
}
//#endregion
export { baseService as i, propsToFilename as n, getImage as r, hashTransform as t };
