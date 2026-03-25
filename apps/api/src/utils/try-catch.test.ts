import { describe, expect, it } from "vite-plus/test";
import { tryCatch } from "./try-catch";

describe("tryCatch", () => {
  it("returns { data, error: null } when promise resolves", async () => {
    const result = await tryCatch(Promise.resolve("hello"));
    expect(result).toEqual({ data: "hello", error: null });
  });

  it("returns { data: null, error } when promise rejects", async () => {
    const error = new Error("test error");
    const result = await tryCatch(Promise.reject(error));
    expect(result).toEqual({ data: null, error });
  });

  it("preserves the error type on rejection", async () => {
    class CustomError extends Error {
      code = "CUSTOM";
    }
    const error = new CustomError("custom");
    const result = await tryCatch<string, CustomError>(Promise.reject(error));
    expect(result.error).toBeInstanceOf(CustomError);
    expect(result.error?.code).toBe("CUSTOM");
  });

  it("handles non-Error thrown values", async () => {
    const result = await tryCatch(Promise.reject("string error"));
    expect(result).toEqual({ data: null, error: "string error" });
  });
});
