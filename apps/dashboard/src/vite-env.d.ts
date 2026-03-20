declare module "*.css" {
  const content: string;
  export default content;
}

type ViteTypeOptions = {};

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly MODE: string;
  readonly VITE_API_URL: string;
  readonly VITE_POSTHOG_KEY: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_USERJOT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
