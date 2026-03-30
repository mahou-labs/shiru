import { createRouterClient } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("@/utils/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { createMockContext } from "../test-utils/helpers";
import type { RpcContext } from "../utils/context";
import { onboardingRouter } from "./onboarding-router";

afterEach(() => vi.clearAllMocks());

function createClient(context: RpcContext) {
  return createRouterClient(onboardingRouter, { context });
}

describe("scrapeWebsite", () => {
  describe("URL security validation", () => {
    it("rejects http:// URLs (returns empty result)", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "http://example.com" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects localhost", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://localhost/admin" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects .local domains", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://internal.local/secret" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects 10.x.x.x private range", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://10.0.0.1" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects 172.16-31.x.x private range", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://172.16.0.1" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects 192.168.x.x private range", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://192.168.1.1" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects 127.x.x.x loopback", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://127.0.0.1" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("rejects 0.x.x.x", async () => {
      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://0.0.0.0" });
      expect(result).toEqual({ name: null, description: null, logo: null, suggestedSlug: "" });
    });

    it("accepts valid HTTPS URL and extracts metadata", async () => {
      const html = `<html><head>
        <meta property="og:site_name" content="Example">
        <meta property="og:description" content="A test site">
        <link rel="apple-touch-icon" href="/logo.png">
        <title>Example - Home</title>
      </head></html>`;

      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://example.com" });

      expect(result.name).toBe("Example");
      expect(result.description).toBe("A test site");
      expect(result.logo).toBe("https://example.com/logo.png");
      expect(result.suggestedSlug).toBe("example");

      vi.unstubAllGlobals();
    });
  });

  describe("extractWebsiteMetadata", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("falls back to application-name when og:site_name missing", async () => {
      const html = `<html><head><meta name="application-name" content="MyApp"></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://myapp.com" });
      expect(result.name).toBe("MyApp");
    });

    it("falls back to og:title split on separator", async () => {
      const html = `<html><head><meta property="og:title" content="Blog Post - MySite"></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://mysite.com" });
      expect(result.name).toBe("Blog Post");
    });

    it("falls back to <title> as last resort", async () => {
      const html = `<html><head><title>Simple Title</title></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://simple.com" });
      expect(result.name).toBe("Simple Title");
    });

    it("decodes HTML entities in names", async () => {
      const html = `<html><head><title>Tom &amp; Jerry&#39;s</title></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://tomandjerry.com" });
      expect(result.name).toContain("Tom & Jerry");
    });

    it("extracts og:description, falls back to meta description", async () => {
      const html = `<html><head><meta name="description" content="Fallback desc"></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://desc.com" });
      expect(result.description).toBe("Fallback desc");
    });

    it("resolves relative logo URLs against base URL", async () => {
      const html = `<html><head><link rel="icon" href="/favicon.ico"></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://logos.com/page" });
      expect(result.logo).toBe("https://logos.com/favicon.ico");
    });

    it("generates slug from hostname (strips www, special chars)", async () => {
      const html = `<html><head><title>Test</title></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://www.my-company.com" });
      expect(result.suggestedSlug).toBe("my-company");
    });

    it("returns empty slug when result < 4 chars", async () => {
      const html = `<html><head><title>Test</title></head></html>`;
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(html, { status: 200 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://ab.com" });
      expect(result.suggestedSlug).toBe("");
    });

    it("returns null fields on fetch failure", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://failing.com" });
      expect(result.name).toBeNull();
      expect(result.description).toBeNull();
      expect(result.logo).toBeNull();
    });

    it("returns null fields when response is not ok", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 })));

      const client = createClient(createMockContext());
      const result = await client.scrapeWebsite({ url: "https://notfound.com" });
      expect(result.name).toBeNull();
    });
  });
});
