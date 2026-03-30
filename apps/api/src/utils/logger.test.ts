import { describe, expect, it, vi } from "vite-plus/test";

import { log } from "./logger";

describe("log", () => {
  describe("info", () => {
    it("calls console.log with structured event + data", () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      log.info("test.event", { key: "value" });
      expect(spy).toHaveBeenCalledWith({ level: "info", event: "test.event", key: "value" });
    });

    it("works without additional data", () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});
      log.info("test.event");
      expect(spy).toHaveBeenCalledWith({ level: "info", event: "test.event" });
    });
  });

  describe("warn", () => {
    it("calls console.warn with structured event", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      log.warn("test.warning", { detail: "something" });
      expect(spy).toHaveBeenCalledWith({
        level: "warn",
        event: "test.warning",
        detail: "something",
      });
    });
  });

  describe("error", () => {
    it("formats Error instances (message, name, stack)", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("test error");
      log.error("test.error", error);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "error",
          event: "test.error",
          errorMessage: "test error",
          errorName: "Error",
          stack: expect.any(String),
        }),
      );
    });

    it("JSON-stringifies non-Error values", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      log.error("test.error", "string error");
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "error",
          event: "test.error",
          errorMessage: '"string error"',
        }),
      );
    });

    it("merges additional data alongside error fields", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      log.error("test.error", new Error("fail"), { userId: "123" });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "error",
          event: "test.error",
          errorMessage: "fail",
          userId: "123",
        }),
      );
    });
  });

  describe("debug", () => {
    it("calls console.debug with structured event", () => {
      const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
      log.debug("test.debug", { trace: true });
      expect(spy).toHaveBeenCalledWith({ level: "debug", event: "test.debug", trace: true });
    });
  });
});
