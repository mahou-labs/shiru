globalThis.process ??= {};
globalThis.process.env ??= {};
import { env } from "cloudflare:workers";

import { r as getImage$1 } from "./assets_6rrI5y4F.mjs";
import { n as __exportAll } from "./chunk_B-gkxaTK.mjs";
import { c as isRemotePath } from "./path_DI6zaT7z.mjs";
import {
  a as isRemoteAllowed,
  i as resolveSrc,
  n as isESMImportedImage,
} from "./remoteProbe_BM9BtsPs.mjs";
import {
  S as unescapeHTML,
  T as createComponent,
  g as addAttribute,
  m as maybeRenderHead,
  t as spreadAttributes,
  u as renderTemplate,
  w as createAstro,
} from "./server_COv7-vJj.mjs";
import "./compiler_C0TtrD-Z.mjs";
import {
  X as AstroError,
  _ as ImageMissingAlt,
  f as FontFamilyNotFound,
} from "./shorthash_DX7y3U4-.mjs";
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/components/Image.astro
createAstro();
const $$Image = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$Image;
    const props = Astro2.props;
    if (props.alt === void 0 || props.alt === null) throw new AstroError(ImageMissingAlt);
    if (typeof props.width === "string") props.width = Number.parseInt(props.width);
    if (typeof props.height === "string") props.height = Number.parseInt(props.height);
    if ((props.layout ?? imageConfig.layout ?? "none") !== "none") {
      props.layout ??= imageConfig.layout;
      props.fit ??= imageConfig.objectFit ?? "cover";
      props.position ??= imageConfig.objectPosition ?? "center";
    } else if (imageConfig.objectFit || imageConfig.objectPosition) {
      props.fit ??= imageConfig.objectFit;
      props.position ??= imageConfig.objectPosition;
    }
    const image = await getImage(props);
    const additionalAttributes = {};
    if (image.srcSet.values.length > 0) additionalAttributes.srcset = image.srcSet.attribute;
    const { class: className, ...attributes } = {
      ...additionalAttributes,
      ...image.attributes,
    };
    return renderTemplate`${maybeRenderHead($$result)}<img${addAttribute(image.src, "src")}${spreadAttributes(attributes)}${addAttribute(className, "class")}>`;
  },
  "/home/nchartiot/Code/shiru/node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/components/Image.astro",
  void 0,
);
//#endregion
//#region ../../node_modules/.bun/mrmime@2.0.1/node_modules/mrmime/index.mjs
const mimes = {
  "3g2": "video/3gpp2",
  "3gp": "video/3gpp",
  "3gpp": "video/3gpp",
  "3mf": "model/3mf",
  aac: "audio/aac",
  ac: "application/pkix-attr-cert",
  adp: "audio/adpcm",
  adts: "audio/aac",
  ai: "application/postscript",
  aml: "application/automationml-aml+xml",
  amlx: "application/automationml-amlx+zip",
  amr: "audio/amr",
  apng: "image/apng",
  appcache: "text/cache-manifest",
  appinstaller: "application/appinstaller",
  appx: "application/appx",
  appxbundle: "application/appxbundle",
  asc: "application/pgp-keys",
  atom: "application/atom+xml",
  atomcat: "application/atomcat+xml",
  atomdeleted: "application/atomdeleted+xml",
  atomsvc: "application/atomsvc+xml",
  au: "audio/basic",
  avci: "image/avci",
  avcs: "image/avcs",
  avif: "image/avif",
  aw: "application/applixware",
  bdoc: "application/bdoc",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bpk: "application/octet-stream",
  btf: "image/prs.btif",
  btif: "image/prs.btif",
  buffer: "application/octet-stream",
  ccxml: "application/ccxml+xml",
  cdfx: "application/cdfx+xml",
  cdmia: "application/cdmi-capability",
  cdmic: "application/cdmi-container",
  cdmid: "application/cdmi-domain",
  cdmio: "application/cdmi-object",
  cdmiq: "application/cdmi-queue",
  cer: "application/pkix-cert",
  cgm: "image/cgm",
  cjs: "application/node",
  class: "application/java-vm",
  coffee: "text/coffeescript",
  conf: "text/plain",
  cpl: "application/cpl+xml",
  cpt: "application/mac-compactpro",
  crl: "application/pkix-crl",
  css: "text/css",
  csv: "text/csv",
  cu: "application/cu-seeme",
  cwl: "application/cwl",
  cww: "application/prs.cww",
  davmount: "application/davmount+xml",
  dbk: "application/docbook+xml",
  deb: "application/octet-stream",
  def: "text/plain",
  deploy: "application/octet-stream",
  dib: "image/bmp",
  "disposition-notification": "message/disposition-notification",
  dist: "application/octet-stream",
  distz: "application/octet-stream",
  dll: "application/octet-stream",
  dmg: "application/octet-stream",
  dms: "application/octet-stream",
  doc: "application/msword",
  dot: "application/msword",
  dpx: "image/dpx",
  drle: "image/dicom-rle",
  dsc: "text/prs.lines.tag",
  dssc: "application/dssc+der",
  dtd: "application/xml-dtd",
  dump: "application/octet-stream",
  dwd: "application/atsc-dwd+xml",
  ear: "application/java-archive",
  ecma: "application/ecmascript",
  elc: "application/octet-stream",
  emf: "image/emf",
  eml: "message/rfc822",
  emma: "application/emma+xml",
  emotionml: "application/emotionml+xml",
  eps: "application/postscript",
  epub: "application/epub+zip",
  exe: "application/octet-stream",
  exi: "application/exi",
  exp: "application/express",
  exr: "image/aces",
  ez: "application/andrew-inset",
  fdf: "application/fdf",
  fdt: "application/fdt+xml",
  fits: "image/fits",
  g3: "image/g3fax",
  gbr: "application/rpki-ghostbusters",
  geojson: "application/geo+json",
  gif: "image/gif",
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  gml: "application/gml+xml",
  gpx: "application/gpx+xml",
  gram: "application/srgs",
  grxml: "application/srgs+xml",
  gxf: "application/gxf",
  gz: "application/gzip",
  h261: "video/h261",
  h263: "video/h263",
  h264: "video/h264",
  heic: "image/heic",
  heics: "image/heic-sequence",
  heif: "image/heif",
  heifs: "image/heif-sequence",
  hej2: "image/hej2k",
  held: "application/atsc-held+xml",
  hjson: "application/hjson",
  hlp: "application/winhlp",
  hqx: "application/mac-binhex40",
  hsj2: "image/hsj2",
  htm: "text/html",
  html: "text/html",
  ics: "text/calendar",
  ief: "image/ief",
  ifb: "text/calendar",
  iges: "model/iges",
  igs: "model/iges",
  img: "application/octet-stream",
  in: "text/plain",
  ini: "text/plain",
  ink: "application/inkml+xml",
  inkml: "application/inkml+xml",
  ipfix: "application/ipfix",
  iso: "application/octet-stream",
  its: "application/its+xml",
  jade: "text/jade",
  jar: "application/java-archive",
  jhc: "image/jphc",
  jls: "image/jls",
  jp2: "image/jp2",
  jpe: "image/jpeg",
  jpeg: "image/jpeg",
  jpf: "image/jpx",
  jpg: "image/jpeg",
  jpg2: "image/jp2",
  jpgm: "image/jpm",
  jpgv: "video/jpeg",
  jph: "image/jph",
  jpm: "image/jpm",
  jpx: "image/jpx",
  js: "text/javascript",
  json: "application/json",
  json5: "application/json5",
  jsonld: "application/ld+json",
  jsonml: "application/jsonml+json",
  jsx: "text/jsx",
  jt: "model/jt",
  jxl: "image/jxl",
  jxr: "image/jxr",
  jxra: "image/jxra",
  jxrs: "image/jxrs",
  jxs: "image/jxs",
  jxsc: "image/jxsc",
  jxsi: "image/jxsi",
  jxss: "image/jxss",
  kar: "audio/midi",
  ktx: "image/ktx",
  ktx2: "image/ktx2",
  less: "text/less",
  lgr: "application/lgr+xml",
  list: "text/plain",
  litcoffee: "text/coffeescript",
  log: "text/plain",
  lostxml: "application/lost+xml",
  lrf: "application/octet-stream",
  m1v: "video/mpeg",
  m21: "application/mp21",
  m2a: "audio/mpeg",
  m2t: "video/mp2t",
  m2ts: "video/mp2t",
  m2v: "video/mpeg",
  m3a: "audio/mpeg",
  m4a: "audio/mp4",
  m4p: "application/mp4",
  m4s: "video/iso.segment",
  ma: "application/mathematica",
  mads: "application/mads+xml",
  maei: "application/mmt-aei+xml",
  man: "text/troff",
  manifest: "text/cache-manifest",
  map: "application/json",
  mar: "application/octet-stream",
  markdown: "text/markdown",
  mathml: "application/mathml+xml",
  mb: "application/mathematica",
  mbox: "application/mbox",
  md: "text/markdown",
  mdx: "text/mdx",
  me: "text/troff",
  mesh: "model/mesh",
  meta4: "application/metalink4+xml",
  metalink: "application/metalink+xml",
  mets: "application/mets+xml",
  mft: "application/rpki-manifest",
  mid: "audio/midi",
  midi: "audio/midi",
  mime: "message/rfc822",
  mj2: "video/mj2",
  mjp2: "video/mj2",
  mjs: "text/javascript",
  mml: "text/mathml",
  mods: "application/mods+xml",
  mov: "video/quicktime",
  mp2: "audio/mpeg",
  mp21: "application/mp21",
  mp2a: "audio/mpeg",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mp4a: "audio/mp4",
  mp4s: "application/mp4",
  mp4v: "video/mp4",
  mpd: "application/dash+xml",
  mpe: "video/mpeg",
  mpeg: "video/mpeg",
  mpf: "application/media-policy-dataset+xml",
  mpg: "video/mpeg",
  mpg4: "video/mp4",
  mpga: "audio/mpeg",
  mpp: "application/dash-patch+xml",
  mrc: "application/marc",
  mrcx: "application/marcxml+xml",
  ms: "text/troff",
  mscml: "application/mediaservercontrol+xml",
  msh: "model/mesh",
  msi: "application/octet-stream",
  msix: "application/msix",
  msixbundle: "application/msixbundle",
  msm: "application/octet-stream",
  msp: "application/octet-stream",
  mtl: "model/mtl",
  mts: "video/mp2t",
  musd: "application/mmt-usd+xml",
  mxf: "application/mxf",
  mxmf: "audio/mobile-xmf",
  mxml: "application/xv+xml",
  n3: "text/n3",
  nb: "application/mathematica",
  nq: "application/n-quads",
  nt: "application/n-triples",
  obj: "model/obj",
  oda: "application/oda",
  oga: "audio/ogg",
  ogg: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  omdoc: "application/omdoc+xml",
  onepkg: "application/onenote",
  onetmp: "application/onenote",
  onetoc: "application/onenote",
  onetoc2: "application/onenote",
  opf: "application/oebps-package+xml",
  opus: "audio/ogg",
  otf: "font/otf",
  owl: "application/rdf+xml",
  oxps: "application/oxps",
  p10: "application/pkcs10",
  p7c: "application/pkcs7-mime",
  p7m: "application/pkcs7-mime",
  p7s: "application/pkcs7-signature",
  p8: "application/pkcs8",
  pdf: "application/pdf",
  pfr: "application/font-tdpfr",
  pgp: "application/pgp-encrypted",
  pkg: "application/octet-stream",
  pki: "application/pkixcmp",
  pkipath: "application/pkix-pkipath",
  pls: "application/pls+xml",
  png: "image/png",
  prc: "model/prc",
  prf: "application/pics-rules",
  provx: "application/provenance+xml",
  ps: "application/postscript",
  pskcxml: "application/pskc+xml",
  pti: "image/prs.pti",
  qt: "video/quicktime",
  raml: "application/raml+yaml",
  rapd: "application/route-apd+xml",
  rdf: "application/rdf+xml",
  relo: "application/p2p-overlay+xml",
  rif: "application/reginfo+xml",
  rl: "application/resource-lists+xml",
  rld: "application/resource-lists-diff+xml",
  rmi: "audio/midi",
  rnc: "application/relax-ng-compact-syntax",
  rng: "application/xml",
  roa: "application/rpki-roa",
  roff: "text/troff",
  rq: "application/sparql-query",
  rs: "application/rls-services+xml",
  rsat: "application/atsc-rsat+xml",
  rsd: "application/rsd+xml",
  rsheet: "application/urc-ressheet+xml",
  rss: "application/rss+xml",
  rtf: "text/rtf",
  rtx: "text/richtext",
  rusd: "application/route-usd+xml",
  s3m: "audio/s3m",
  sbml: "application/sbml+xml",
  scq: "application/scvp-cv-request",
  scs: "application/scvp-cv-response",
  sdp: "application/sdp",
  senmlx: "application/senml+xml",
  sensmlx: "application/sensml+xml",
  ser: "application/java-serialized-object",
  setpay: "application/set-payment-initiation",
  setreg: "application/set-registration-initiation",
  sgi: "image/sgi",
  sgm: "text/sgml",
  sgml: "text/sgml",
  shex: "text/shex",
  shf: "application/shf+xml",
  shtml: "text/html",
  sieve: "application/sieve",
  sig: "application/pgp-signature",
  sil: "audio/silk",
  silo: "model/mesh",
  siv: "application/sieve",
  slim: "text/slim",
  slm: "text/slim",
  sls: "application/route-s-tsid+xml",
  smi: "application/smil+xml",
  smil: "application/smil+xml",
  snd: "audio/basic",
  so: "application/octet-stream",
  spdx: "text/spdx",
  spp: "application/scvp-vp-response",
  spq: "application/scvp-vp-request",
  spx: "audio/ogg",
  sql: "application/sql",
  sru: "application/sru+xml",
  srx: "application/sparql-results+xml",
  ssdl: "application/ssdl+xml",
  ssml: "application/ssml+xml",
  stk: "application/hyperstudio",
  stl: "model/stl",
  stpx: "model/step+xml",
  stpxz: "model/step-xml+zip",
  stpz: "model/step+zip",
  styl: "text/stylus",
  stylus: "text/stylus",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  swidtag: "application/swid+xml",
  t: "text/troff",
  t38: "image/t38",
  td: "application/urc-targetdesc+xml",
  tei: "application/tei+xml",
  teicorpus: "application/tei+xml",
  text: "text/plain",
  tfi: "application/thraud+xml",
  tfx: "image/tiff-fx",
  tif: "image/tiff",
  tiff: "image/tiff",
  toml: "application/toml",
  tr: "text/troff",
  trig: "application/trig",
  ts: "video/mp2t",
  tsd: "application/timestamped-data",
  tsv: "text/tab-separated-values",
  ttc: "font/collection",
  ttf: "font/ttf",
  ttl: "text/turtle",
  ttml: "application/ttml+xml",
  txt: "text/plain",
  u3d: "model/u3d",
  u8dsn: "message/global-delivery-status",
  u8hdr: "message/global-headers",
  u8mdn: "message/global-disposition-notification",
  u8msg: "message/global",
  ubj: "application/ubjson",
  uri: "text/uri-list",
  uris: "text/uri-list",
  urls: "text/uri-list",
  vcard: "text/vcard",
  vrml: "model/vrml",
  vtt: "text/vtt",
  vxml: "application/voicexml+xml",
  war: "application/java-archive",
  wasm: "application/wasm",
  wav: "audio/wav",
  weba: "audio/webm",
  webm: "video/webm",
  webmanifest: "application/manifest+json",
  webp: "image/webp",
  wgsl: "text/wgsl",
  wgt: "application/widget",
  wif: "application/watcherinfo+xml",
  wmf: "image/wmf",
  woff: "font/woff",
  woff2: "font/woff2",
  wrl: "model/vrml",
  wsdl: "application/wsdl+xml",
  wspolicy: "application/wspolicy+xml",
  x3d: "model/x3d+xml",
  x3db: "model/x3d+fastinfoset",
  x3dbz: "model/x3d+binary",
  x3dv: "model/x3d-vrml",
  x3dvz: "model/x3d+vrml",
  x3dz: "model/x3d+xml",
  xaml: "application/xaml+xml",
  xav: "application/xcap-att+xml",
  xca: "application/xcap-caps+xml",
  xcs: "application/calendar+xml",
  xdf: "application/xcap-diff+xml",
  xdssc: "application/dssc+xml",
  xel: "application/xcap-el+xml",
  xenc: "application/xenc+xml",
  xer: "application/patch-ops-error+xml",
  xfdf: "application/xfdf",
  xht: "application/xhtml+xml",
  xhtml: "application/xhtml+xml",
  xhvml: "application/xv+xml",
  xlf: "application/xliff+xml",
  xm: "audio/xm",
  xml: "text/xml",
  xns: "application/xcap-ns+xml",
  xop: "application/xop+xml",
  xpl: "application/xproc+xml",
  xsd: "application/xml",
  xsf: "application/prs.xsf+xml",
  xsl: "application/xml",
  xslt: "application/xml",
  xspf: "application/xspf+xml",
  xvm: "application/xv+xml",
  xvml: "application/xv+xml",
  yaml: "text/yaml",
  yang: "application/yang",
  yin: "application/yin+xml",
  yml: "text/yaml",
  zip: "application/zip",
};
function lookup(extn) {
  const tmp = ("" + extn).trim().toLowerCase();
  let idx = tmp.lastIndexOf(".");
  return mimes[!~idx ? tmp : tmp.substring(++idx)];
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/components/Picture.astro
createAstro();
const $$Picture = createComponent(
  async ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$Picture;
    const defaultFormats = ["webp"];
    const defaultFallbackFormat = "png";
    const specialFormatsFallback = ["gif", "svg", "jpg", "jpeg"];
    const {
      formats = defaultFormats,
      pictureAttributes = {},
      fallbackFormat,
      ...props
    } = Astro2.props;
    if (props.alt === void 0 || props.alt === null) throw new AstroError(ImageMissingAlt);
    const scopedStyleClass = props.class?.match(/\bastro-\w{8}\b/)?.[0];
    if (scopedStyleClass)
      if (pictureAttributes.class)
        pictureAttributes.class = `${pictureAttributes.class} ${scopedStyleClass}`;
      else pictureAttributes.class = scopedStyleClass;
    const useResponsive = (props.layout ?? imageConfig.layout ?? "none") !== "none";
    if (useResponsive) {
      props.layout ??= imageConfig.layout;
      props.fit ??= imageConfig.objectFit ?? "cover";
      props.position ??= imageConfig.objectPosition ?? "center";
    } else if (imageConfig.objectFit || imageConfig.objectPosition) {
      props.fit ??= imageConfig.objectFit;
      props.position ??= imageConfig.objectPosition;
    }
    for (const key in props)
      if (key.startsWith("data-astro-cid")) pictureAttributes[key] = props[key];
    const originalSrc = await resolveSrc(props.src);
    const optimizedImages = await Promise.all(
      formats.map(
        async (format) =>
          await getImage({
            ...props,
            src: originalSrc,
            format,
            widths: props.widths,
            densities: props.densities,
          }),
      ),
    );
    const clonedSrc = isESMImportedImage(originalSrc)
      ? (originalSrc.clone ?? originalSrc)
      : originalSrc;
    let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat;
    if (
      !fallbackFormat &&
      isESMImportedImage(clonedSrc) &&
      specialFormatsFallback.includes(clonedSrc.format)
    )
      resultFallbackFormat = clonedSrc.format;
    const fallbackImage = await getImage({
      ...props,
      format: resultFallbackFormat,
      widths: props.widths,
      densities: props.densities,
    });
    const imgAdditionalAttributes = {};
    const sourceAdditionalAttributes = {};
    if (props.sizes) sourceAdditionalAttributes.sizes = props.sizes;
    if (fallbackImage.srcSet.values.length > 0)
      imgAdditionalAttributes.srcset = fallbackImage.srcSet.attribute;
    const { class: className, ...attributes } = {
      ...imgAdditionalAttributes,
      ...fallbackImage.attributes,
    };
    return renderTemplate`${maybeRenderHead($$result)}<picture${spreadAttributes(pictureAttributes)}> ${Object.entries(
      optimizedImages,
    ).map(([_, image]) => {
      return renderTemplate`<source${addAttribute(props.densities || (!props.densities && !props.widths && !useResponsive) ? `${image.src}${image.srcSet.values.length > 0 ? ", " + image.srcSet.attribute : ""}` : image.srcSet.attribute, "srcset")}${addAttribute(lookup(image.options.format ?? image.src) ?? `image/${image.options.format}`, "type")}${spreadAttributes(sourceAdditionalAttributes)}>`;
    })}  <img${addAttribute(fallbackImage.src, "src")}${spreadAttributes(attributes)}${addAttribute(className, "class")}> </picture>`;
  },
  "/home/nchartiot/Code/shiru/node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/components/Picture.astro",
  void 0,
);
//#endregion
//#region \0virtual:astro:assets/fonts/internal
const componentDataByCssVariable = /* @__PURE__ */ new Map([]);
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/dist/assets/fonts/core/filter-preloads.js
function filterPreloads(data, preload) {
  if (!preload) return null;
  if (preload === true) return data;
  return data.filter(({ weight, style, subset }) =>
    preload.some((p) => {
      if (p.weight !== void 0 && weight !== void 0 && !checkWeight(p.weight.toString(), weight))
        return false;
      if (p.style !== void 0 && p.style !== style) return false;
      if (p.subset !== void 0 && p.subset !== subset) return false;
      return true;
    }),
  );
}
function checkWeight(input, target) {
  const trimmedInput = input.trim();
  if (trimmedInput.includes(" ")) return trimmedInput === target;
  if (target.includes(" ")) {
    const [a, b] = target.split(" ");
    const parsedInput = Number.parseInt(input);
    return parsedInput >= Number.parseInt(a) && parsedInput <= Number.parseInt(b);
  }
  return input === target;
}
//#endregion
//#region ../../node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/components/Font.astro
createAstro();
const $$Font = createComponent(
  ($$result, $$props, $$slots) => {
    const Astro2 = $$result.createAstro($$props, $$slots);
    Astro2.self = $$Font;
    const { cssVariable, preload = false } = Astro2.props;
    const data = componentDataByCssVariable.get(cssVariable);
    if (!data)
      throw new AstroError({
        ...FontFamilyNotFound,
        message: FontFamilyNotFound.message(cssVariable),
      });
    const filteredPreloadData = filterPreloads(data.preloads, preload);
    return renderTemplate`<style>${unescapeHTML(data.css)}</style>${filteredPreloadData?.map(({ url, type }) => renderTemplate`<link rel="preload"${addAttribute(url, "href")} as="font"${addAttribute(`font/${type}`, "type")} crossorigin>`)}`;
  },
  "/home/nchartiot/Code/shiru/node_modules/.bun/astro@6.1.1+8d300e549c9e9730/node_modules/astro/components/Font.astro",
  void 0,
);
(function () {
  const regexes = [
    /^(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)\/)\.env)$/i,
    /^(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)\/)\.env\.[^/]*?\/?)$/i,
    /^(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)\/)(?!\.{1,2}(?:\/|$))(?=.)[^/]*?\.(crt|pem))$/i,
    /^(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)\/)\.git(?:\/(?!\.{1,2}(?:\/|$))(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)|$))$/i,
    /^(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)\/)\.dev\.vars)$/i,
    /^(?:(?:^|\/|(?:(?:(?!(?:^|\/)\.{1,2}(?:\/|$)).)*?)\/)\.dev\.vars\.[^/]*?\/?)$/i,
  ];
  return function fsDenyGlob(testPath) {
    return regexes.some((re) => re.test(testPath));
  };
})();
const assetQueryParams = void 0;
const imageConfig = {
  endpoint: {
    route: "/_image",
    entrypoint: "@astrojs/cloudflare/image-transform-endpoint",
  },
  service: {
    entrypoint: "@astrojs/cloudflare/image-service-workerd",
    config: {},
  },
  domains: [],
  remotePatterns: [],
  responsiveStyles: false,
};
Object.defineProperty(imageConfig, "assetQueryParams", {
  value: assetQueryParams,
  enumerable: false,
  configurable: true,
});
const getImage = async (options) => await getImage$1(options, imageConfig);
//#endregion
//#region ../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/utils/image-binding-transform.js
const qualityTable = {
  low: 25,
  mid: 50,
  high: 80,
  max: 100,
};
async function transform(rawUrl, images, assets) {
  const url = new URL(rawUrl);
  const href = url.searchParams.get("href");
  if (!href || (isRemotePath(href) && !isRemoteAllowed(href, imageConfig)))
    return new Response("Forbidden", { status: 403 });
  const imageSrc = new URL(href, url.origin);
  const content = await (isRemotePath(href) ? fetch(imageSrc) : assets.fetch(imageSrc));
  if (!content.body) return new Response(null, { status: 404 });
  const input = images.input(content.body);
  const outputFormat = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
  }[url.searchParams.get("f") ?? ""];
  if (!outputFormat)
    return new Response(`Unsupported format: ${url.searchParams.get("f")}`, { status: 400 });
  return (
    await input
      .transform({
        width: url.searchParams.has("w") ? Number.parseInt(url.searchParams.get("w")) : void 0,
        height: url.searchParams.has("h") ? Number.parseInt(url.searchParams.get("h")) : void 0,
        fit: url.searchParams.get("fit"),
      })
      .output({
        quality: url.searchParams.get("q")
          ? (qualityTable[url.searchParams.get("q")] ?? Number.parseInt(url.searchParams.get("q")))
          : void 0,
        format: outputFormat,
      })
  ).response();
}
//#endregion
//#region ../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-transform-endpoint.js
const image_transform_endpoint_exports = /* @__PURE__ */ __exportAll({
  GET: () => GET,
  prerender: () => false,
});
const GET = async (ctx) => {
  const cache = caches.default;
  if (cache) {
    const cached = await cache.match(ctx.request.url);
    if (cached) return cached;
  }
  const response = await transform(ctx.request.url, env.IMAGES, env.ASSETS);
  if (!response.ok) return response;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  const cachedResponse = new Response(response.body, {
    status: response.status,
    headers,
  });
  if (cache) {
    const cfContext = ctx.locals.cfContext;
    if (cfContext) cfContext.waitUntil(cache.put(ctx.request.url, cachedResponse.clone()));
  }
  return cachedResponse;
};
//#endregion
//#region \0virtual:astro:page:../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-transform-endpoint@_@js
const page = () => image_transform_endpoint_exports;
//#endregion
export { page };
