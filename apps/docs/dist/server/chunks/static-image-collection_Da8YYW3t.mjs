globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as propsToFilename, t as hashTransform } from "./assets_6rrI5y4F.mjs";
import { d as removeBase, l as joinPaths, u as prependForwardSlash } from "./path_DI6zaT7z.mjs";
import "./utils_DdMENcZJ.mjs";
import { n as isESMImportedImage } from "./remoteProbe_BM9BtsPs.mjs";
//#region ../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/utils/static-image-collection.js
function installAddStaticImage(config) {
  if (globalThis.astroAsset?.addStaticImage) return;
  if (!globalThis.astroAsset)
    globalThis.astroAsset = { referencedImages: /* @__PURE__ */ new Set() };
  globalThis.astroAsset.addStaticImage = (options, hashProperties, _originalFSPath) => {
    if (!globalThis.astroAsset.staticImages)
      globalThis.astroAsset.staticImages = /* @__PURE__ */ new Map();
    const finalOriginalPath = removeBase(
      removeBase(isESMImportedImage(options.src) ? options.src.src : options.src, config.base),
      config.assetsPrefix ?? "",
    );
    const hash = hashTransform(options, config.imageServiceEntrypoint, hashProperties);
    let finalFilePath;
    let transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
    const transformForHash = transformsForPath?.transforms.get(hash);
    if (transformsForPath && transformForHash) finalFilePath = transformForHash.finalPath;
    else {
      finalFilePath = prependForwardSlash(
        joinPaths(
          isESMImportedImage(options.src) ? "" : config.buildAssets,
          prependForwardSlash(propsToFilename(finalOriginalPath, options, hash)),
        ),
      );
      if (!transformsForPath) {
        globalThis.astroAsset.staticImages.set(finalOriginalPath, {
          originalSrcPath: _originalFSPath,
          transforms: /* @__PURE__ */ new Map(),
        });
        transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
      }
      transformsForPath.transforms.set(hash, {
        finalPath: finalFilePath,
        transform: options,
      });
    }
    if (config.assetsPrefix) return encodeURI(joinPaths(config.assetsPrefix, finalFilePath));
    return encodeURI(prependForwardSlash(joinPaths(config.base, finalFilePath)));
  };
}
//#endregion
export { installAddStaticImage };
