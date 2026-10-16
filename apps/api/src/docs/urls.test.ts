import { afterEach, describe, expect, it } from "vite-plus/test";

import { env } from "../test/bindings";
import { DRAFT, LIVE, TargetLabel } from "./names";
import { targetUrl } from "./urls";

describe("targetUrl", () => {
  afterEach(() => {
    env.ENVIRONMENT = "development";
  });

  it("serves docs through the local dispatch Worker in development", () => {
    expect(targetUrl("acme", LIVE)).toBe("http://acme.docs.localhost:3003");
    expect(targetUrl("acme", DRAFT)).toBe("http://draft--acme.preview.docs.localhost:3003");
  });

  it("serves docs over https otherwise, previews under the preview domain", () => {
    env.ENVIRONMENT = "production";
    expect(targetUrl("acme", LIVE)).toBe("https://acme.docs.localhost");
    expect(targetUrl("acme", TargetLabel.parse("pr-12"))).toBe(
      "https://pr-12--acme.preview.docs.localhost",
    );
  });
});
