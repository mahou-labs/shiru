/// <reference types="astro/client" />

type ENV = {
  PUBLISH_ARTIFACTS: R2Bucket;
  DOCS_KV: KVNamespace;
  REVALIDATION_SECRET?: string;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
  interface Locals extends Runtime {}
}
