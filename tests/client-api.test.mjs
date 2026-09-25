import test from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/admin/api.js";

test("cancelling an in-flight list cannot become successful invalid data", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => {
        throw new DOMException("Aborted", "AbortError");
      },
    });
    await assert.rejects(api("/media"), { name: "AbortError" });
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("Invalid JSON");
      },
    });
    await assert.rejects(api("/media"), /beklenmeyen yanıt/);
  } finally {
    globalThis.fetch = original;
  }
});
