import { classifyPrompt } from "./classifier.ts";
import { normalizeText } from "./normalize.ts";
import { redactSensitiveData } from "./redaction.ts";
import { runRules } from "./rules.ts";
import type { AnalysisResult, Decision, ScanContext, Severity } from "./types.ts";

export const POLICY_VERSION = "sentinel-policy-1.0.0";
export const MAX_INPUT_LENGTH = 4_000;

function scoreSensitiveFinding(severity: Severity): number {
  return { info: 0, low: 24, medium: 38, high: 56, critical: 72 }[severity];
}

function severityForScore(score: number): Severity {
  if (score >= 90) return "critical";
  if (score >= 72) return "high";
  if (score >= 48) return "medium";
  if (score >= 20) return "low";
  return "info";
}

function decisionFor(score: number, hasSensitiveData: boolean, hasSecurityRule: boolean): Decision {
  if (hasSensitiveData && !hasSecurityRule) return "REDACT";
  if (score >= 78) return "BLOCK";
  if (score >= 52) return "REVIEW";
  if (hasSensitiveData) return "REDACT";
  return "ALLOW";
}

export async function hashText(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function analyzeText(text: string, context: ScanContext = "prompt"): Promise<AnalysisResult> {
  const startedAt = performance.now();
  const normalized = normalizeText(text);
  if (!normalized) throw new Error("Text is required.");
  if (normalized.length > MAX_INPUT_LENGTH) throw new Error(`Text must have at most ${MAX_INPUT_LENGTH} characters.`);

  const { redacted, findings: sensitiveFindings } = redactSensitiveData(normalized);
  const ruleHits = runRules(redacted);
  const ml = classifyPrompt(redacted);
  const weightedScores = [
    ...ruleHits.map((hit) => hit.weight),
    ...sensitiveFindings.map((finding) => scoreSensitiveFinding(finding.severity)),
  ].sort((a, b) => b - a);

  let riskScore = weightedScores[0] ?? 0;
  for (const additionalScore of weightedScores.slice(1)) riskScore += additionalScore * 0.22;
  if (ml.label === "suspicious") riskScore = Math.max(riskScore, 38 + ml.probability * 38);
  if (ruleHits.length > 0 && ml.label === "suspicious") riskScore += 8 * ml.probability;
  riskScore = Math.min(100, Math.round(riskScore));

  const findings = [...ruleHits.map((hit) => hit.finding), ...sensitiveFindings];
  const categories = [...new Set(findings.map((finding) => finding.category))];
  const decision = decisionFor(riskScore, sensitiveFindings.length > 0, ruleHits.length > 0);

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    context,
    decision,
    severity: severityForScore(riskScore),
    riskScore,
    categories,
    findings,
    safeText: redacted,
    wasRedacted: redacted !== normalized,
    ml,
    policyVersion: POLICY_VERSION,
    processingMs: Math.max(1, Math.round((performance.now() - startedAt) * 100) / 100),
  };
}
