import type { RpcContext } from "@/utils/context";
import { TEST_ORG, TEST_SESSION, TEST_USER } from "./fixtures";

export function createMockUser(overrides?: Partial<typeof TEST_USER>) {
  return { ...TEST_USER, ...overrides };
}

export function createMockSession(overrides?: Partial<typeof TEST_SESSION>) {
  return { ...TEST_SESSION, ...overrides };
}

export function createMockContext(overrides?: Partial<RpcContext>): RpcContext {
  return {
    headers: new Headers(),
    session: createMockSession(),
    user: createMockUser(),
    resHeaders: new Headers(),
    ...overrides,
  };
}

export function createAuthenticatedContext(overrides?: Partial<RpcContext>): RpcContext {
  return createMockContext(overrides);
}

export function createUnauthenticatedContext(overrides?: Partial<RpcContext>): RpcContext {
  return createMockContext({
    session: undefined,
    user: undefined,
    ...overrides,
  });
}

interface MockHtmlOptions {
  ogSiteName?: string;
  applicationName?: string;
  ogTitle?: string;
  title?: string;
  ogDescription?: string;
  metaDescription?: string;
  ogImage?: string;
  appleTouchIcon?: string;
  favicon?: string;
}

export function createMockHtml(options: MockHtmlOptions = {}): string {
  const metaTags: string[] = [];

  if (options.ogSiteName) {
    metaTags.push(`<meta property="og:site_name" content="${options.ogSiteName}">`);
  }
  if (options.applicationName) {
    metaTags.push(`<meta name="application-name" content="${options.applicationName}">`);
  }
  if (options.ogTitle) {
    metaTags.push(`<meta property="og:title" content="${options.ogTitle}">`);
  }
  if (options.ogDescription) {
    metaTags.push(`<meta property="og:description" content="${options.ogDescription}">`);
  }
  if (options.metaDescription) {
    metaTags.push(`<meta name="description" content="${options.metaDescription}">`);
  }
  if (options.ogImage) {
    metaTags.push(`<meta property="og:image" content="${options.ogImage}">`);
  }
  if (options.appleTouchIcon) {
    metaTags.push(`<link rel="apple-touch-icon" href="${options.appleTouchIcon}">`);
  }
  if (options.favicon) {
    metaTags.push(`<link rel="icon" href="${options.favicon}">`);
  }

  const titleTag = options.title ? `<title>${options.title}</title>` : "";

  return `<!DOCTYPE html><html><head>${metaTags.join("\n")}${titleTag}</head><body></body></html>`;
}

export function createMockOrg(overrides?: Partial<typeof TEST_ORG>) {
  return { ...TEST_ORG, ...overrides };
}
