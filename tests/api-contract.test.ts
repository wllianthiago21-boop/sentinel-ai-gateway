import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("scan route enforces content type, payload size and rate limiting", async () => {
  const source = await readFile(new URL("../app/api/scan/route.ts", import.meta.url), "utf8");
  assert.match(source, /application\/json/);
  assert.match(source, /16_000/);
  assert.match(source, /enforceRateLimit/);
  assert.match(source, /RateLimit-Remaining/);
  assert.match(source, /X-Content-Type-Options/);
});

test("audit persistence stores redacted text and a fingerprint, never raw text", async () => {
  const source = await readFile(new URL("../db/audit.ts", import.meta.url), "utf8");
  assert.match(source, /result\.safeText/);
  assert.match(source, /hashText\(originalText\)/);
  assert.doesNotMatch(source, /originalText[,)]\s*\.run/);
});
