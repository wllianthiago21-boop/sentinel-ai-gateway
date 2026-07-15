export type ScanContext = "prompt" | "response" | "tool_call";

export type Decision = "ALLOW" | "REVIEW" | "REDACT" | "BLOCK";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type SecurityCategory =
  | "PROMPT_INJECTION"
  | "JAILBREAK"
  | "SENSITIVE_DATA"
  | "SECRET_EXTRACTION"
  | "UNSAFE_TOOL_INTENT"
  | "DATA_EXFILTRATION";

export interface ScanRequest {
  text: string;
  context?: ScanContext;
  store?: boolean;
}

export interface Finding {
  category: SecurityCategory;
  severity: Severity;
  title: string;
  evidence: string;
  recommendation: string;
  confidence: number;
}

export interface MlClassification {
  label: "benign" | "suspicious";
  probability: number;
  modelVersion: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  context: ScanContext;
  decision: Decision;
  severity: Severity;
  riskScore: number;
  categories: SecurityCategory[];
  findings: Finding[];
  safeText: string;
  wasRedacted: boolean;
  ml: MlClassification;
  policyVersion: string;
  processingMs: number;
}

export interface StoredIncident {
  id: string;
  timestamp: string;
  decision: Decision;
  severity: Severity;
  riskScore: number;
  categories: SecurityCategory[];
  redactedPreview: string;
  modelVersion: string;
  policyVersion: string;
  processingMs: number;
}
