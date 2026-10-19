import { afterEach, describe, expect, it } from "vite-plus/test";

import { env } from "../test/bindings";
import { DRAFT, TargetLabel } from "./names";
import { previewUrl } from "./urls";

describe("previewUrl", () => {
  afterEach(() => {
    env.ENVIRONMENT = "development";
  });

  it("serves previews through the local dispatch Worker in development", () => {
    expect(previewUrl("acme", DRAFT)).toBe("http://draft--acme.preview.docs.localhost:3003");
  });

  it("serves previews over https under the preview domain otherwise", () => {
    env.ENVIRONMENT = "production";
    expect(previewUrl("acme", TargetLabel.parse("pr-12"))).toBe(
      "https://pr-12--acme.preview.docs.localhost",
    );
  });
});
