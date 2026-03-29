globalThis.process ??= {};
globalThis.process.env ??= {};
import { n as __exportAll } from "./chunk_B-gkxaTK.mjs";
import { t as $$DocsLayout } from "./DocsLayout_Bhuvc4MS.mjs";
import "./compiler_C0TtrD-Z.mjs";
import {
  T as createComponent,
  i as renderComponent,
  m as maybeRenderHead,
  u as renderTemplate,
} from "./server_COv7-vJj.mjs";
//#region src/pages/404.astro
const _404_exports = /* @__PURE__ */ __exportAll({
  default: () => $$404,
  file: () => $$file,
  url: () => $$url,
});
const $$404 = createComponent(
  ($$result, $$props, $$slots) => {
    return renderTemplate`${renderComponent(
      $$result,
      "DocsLayout",
      $$DocsLayout,
      {
        title: "Page Not Found",
        description: "The page you're looking for doesn't exist.",
      },
      {
        default: ($$result2) =>
          renderTemplate` ${maybeRenderHead($$result2)}<div class="not-found"> <h1>404</h1> <p>The page you're looking for doesn't exist.</p> <a href="/">Go to homepage</a> </div> `,
      },
    )}`;
  },
  "/home/nchartiot/Code/shiru/apps/docs/src/pages/404.astro",
  void 0,
);
const $$file = "/home/nchartiot/Code/shiru/apps/docs/src/pages/404.astro";
const $$url = "/404";
//#endregion
//#region \0virtual:astro:page:src/pages/404@_@astro
const page = () => _404_exports;
//#endregion
export { page };
