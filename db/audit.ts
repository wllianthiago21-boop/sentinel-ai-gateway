import { env } from "cloudflare:workers";
import { hashText } from "../lib/security/analyze.ts";
import { truncate } from "../lib/security/normalize.ts";
import type { AnalysisResult, StoredIncident } from "../lib/security/types.ts";

let schemaReady: Promise<void> | undefined;

function getD1(): D1Database {
  if (!env.DB) throw new Error("D1 binding DB is unavailable.");
  return env.DB;
}

async function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = getD1();
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY NOT NULL,
        created_at INTEGER NOT NULL,
        decision TEXT NOT NULL,
        severity TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        categories TEXT NOT NULL,
        redacted_preview TEXT NOT NULL,
        prompt_hash TEXT NOT NULL,
        model_version TEXT NOT NULL,
        policy_version TEXT NOT NULL,
        processing_ms INTEGER NOT NULL
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events (created_at)"),
      db.prepare("CREATE INDEX IF NOT EXISTS audit_events_decision_idx ON audit_events (decision)"),
      db.prepare(`CREATE TABLE IF NOT EXISTS rate_limits (
        client_hash TEXT NOT NULL,
        bucket INTEGER NOT NULL,
        request_count INTEGER DEFAULT 1 NOT NULL,
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (client_hash, bucket)
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS rate_limits_expires_at_idx ON rate_limits (expires_at)"),
    ]);
  })().catch((error) => {
    schemaReady = undefined;
    throw error;
  });

  return schemaReady;
}

export async function saveIncident(result: AnalysisResult, originalText: string): Promise<void> {
  await ensureSchema();
  const db = getD1();
  const promptHash = await hashText(originalText);
  const preview = truncate(result.safeText.replace(/\s+/g, " "), 240);

  await db.prepare(`INSERT INTO audit_events (
      id, created_at, decision, severity, risk_score, categories,
      redacted_preview, prompt_hash, model_version, policy_version, processing_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      result.id,
      Date.parse(result.timestamp),
      result.decision,
      result.severity,
      result.riskScore,
      JSON.stringify(result.categories),
      preview,
      promptHash,
      result.ml.modelVersion,
      result.policyVersion,
      Math.round(result.processingMs),
    )
    .run();
}

interface IncidentRow {
  id: string;
  created_at: number;
  decision: StoredIncident["decision"];
  severity: StoredIncident["severity"];
  risk_score: number;
  categories: string;
  redacted_preview: string;
  model_version: string;
  policy_version: string;
  processing_ms: number;
}

export async function listIncidents(limit = 20): Promise<StoredIncident[]> {
  await ensureSchema();
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const result = await getD1()
    .prepare(`SELECT id, created_at, decision, severity, risk_score, categories,
      redacted_preview, model_version, policy_version, processing_ms
      FROM audit_events ORDER BY created_at DESC LIMIT ?`)
    .bind(safeLimit)
    .all<IncidentRow>();

  return result.results.map((row) => ({
    id: row.id,
    timestamp: new Date(row.created_at).toISOString(),
    decision: row.decision,
    severity: row.severity,
    riskScore: row.risk_score,
    categories: JSON.parse(row.categories),
    redactedPreview: row.redacted_preview,
    modelVersion: row.model_version,
    policyVersion: row.policy_version,
    processingMs: row.processing_ms,
  }));
}

export async function enforceRateLimit(request: Request, limit = 30): Promise<{ allowed: boolean; remaining: number }> {
  await ensureSchema();
  const now = Date.now();
  const bucket = Math.floor(now / 60_000);
  const rawClient = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const clientHash = await hashText(`sentinel-rate-v1:${rawClient.trim()}`);
  const expiresAt = now + 120_000;

  const row = await getD1()
    .prepare(`INSERT INTO rate_limits (client_hash, bucket, request_count, expires_at)
      VALUES (?, ?, 1, ?)
      ON CONFLICT (client_hash, bucket)
      DO UPDATE SET request_count = request_count + 1, expires_at = excluded.expires_at
      RETURNING request_count`)
    .bind(clientHash, bucket, expiresAt)
    .first<{ request_count: number }>();

  const count = row?.request_count ?? limit + 1;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
