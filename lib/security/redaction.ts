import type { Finding, Severity } from "./types.ts";

interface SensitivePattern {
  title: string;
  label: string;
  severity: Severity;
  regex: RegExp;
}

const SENSITIVE_PATTERNS: SensitivePattern[] = [
  { title: "Private key", label: "PRIVATE_KEY", severity: "critical", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi },
  { title: "GitHub token", label: "GITHUB_TOKEN", severity: "critical", regex: /\bgh[pousr]_[A-Za-z0-9]{20,255}\b/g },
  { title: "AWS access key", label: "AWS_ACCESS_KEY", severity: "critical", regex: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { title: "JWT", label: "JWT", severity: "high", regex: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g },
  { title: "Bearer token", label: "BEARER_TOKEN", severity: "high", regex: /\bBearer\s+[A-Za-z0-9._~+\/-]{16,}=*/gi },
  { title: "Password assignment", label: "PASSWORD", severity: "high", regex: /\b(?:password|passwd|pwd|senha)\s*[:=]\s*[^\s,;]{6,}/gi },
  { title: "Brazilian CPF", label: "CPF", severity: "medium", regex: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g },
  { title: "Email address", label: "EMAIL", severity: "low", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
];

export function redactSensitiveData(text: string): { redacted: string; findings: Finding[] } {
  let redacted = text;
  const findings: Finding[] = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const count = [...redacted.matchAll(pattern.regex)].length;
    pattern.regex.lastIndex = 0;
    if (count === 0) continue;

    redacted = redacted.replace(pattern.regex, `[REDACTED:${pattern.label}]`);
    findings.push({
      category: "SENSITIVE_DATA",
      severity: pattern.severity,
      title: `${pattern.title} detected`,
      evidence: `${count} occurrence${count === 1 ? "" : "s"} redacted`,
      recommendation: "Remove secrets and personal data before sending content to any model.",
      confidence: 0.99,
    });
  }

  return { redacted, findings };
}
