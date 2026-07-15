import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("production build contains the SentinelAI product surface", async () => {
  const [page, layout, app] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sentinel-app.tsx", import.meta.url), "utf8"),
    access(new URL("../dist/server/index.js", import.meta.url)),
  ]);

  assert.match(page, /SentinelAI Gateway — Segurança para agentes de IA/i);
  assert.match(layout, /Proteção open source e explicável/i);
  assert.match(app, /Bloqueie instruções inseguras de IA/i);
  assert.match(app, /Executar análise de segurança/i);
  assert.match(app, /AUDITORIA SANITIZADA/i);
  assert.doesNotMatch(`${page}\n${layout}\n${app}`, /react-loading-skeleton|Your site is taking shape/i);
});
