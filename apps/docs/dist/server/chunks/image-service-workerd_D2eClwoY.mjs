globalThis.process ??= {};
globalThis.process.env ??= {};
import { i as baseService } from "./assets_6rrI5y4F.mjs";
//#region ../../node_modules/.bun/@astrojs+cloudflare@13.1.4+f2f17aa0f475739e/node_modules/@astrojs/cloudflare/dist/entrypoints/image-service-workerd.js
const image_service_workerd_default = {
  ...baseService,
  async transform(inputBuffer, transform) {
    return {
      data: inputBuffer,
      format: transform.format,
    };
  },
};
//#endregion
export { image_service_workerd_default as default };
