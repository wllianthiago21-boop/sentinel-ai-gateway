import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at").notNull(),
    decision: text("decision").notNull(),
    severity: text("severity").notNull(),
    riskScore: integer("risk_score").notNull(),
    categories: text("categories").notNull(),
    redactedPreview: text("redacted_preview").notNull(),
    promptHash: text("prompt_hash").notNull(),
    modelVersion: text("model_version").notNull(),
    policyVersion: text("policy_version").notNull(),
    processingMs: integer("processing_ms").notNull(),
  },
  (table) => [
    index("audit_events_created_at_idx").on(table.createdAt),
    index("audit_events_decision_idx").on(table.decision),
  ],
);

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    clientHash: text("client_hash").notNull(),
    bucket: integer("bucket").notNull(),
    requestCount: integer("request_count").notNull().default(1),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.clientHash, table.bucket] }),
    index("rate_limits_expires_at_idx").on(table.expiresAt),
  ],
);
