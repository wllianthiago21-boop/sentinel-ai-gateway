import { truncate } from "./normalize.ts";
import type { Finding, SecurityCategory, Severity } from "./types.ts";

interface DetectionRule {
  category: SecurityCategory;
  severity: Severity;
  title: string;
  recommendation: string;
  confidence: number;
  weight: number;
  patterns: RegExp[];
}

export interface RuleHit {
  finding: Finding;
  weight: number;
}

const RULES: DetectionRule[] = [
  {
    category: "PROMPT_INJECTION",
    severity: "high",
    title: "Instruction override attempt",
    recommendation: "Keep system instructions isolated and reject attempts to change instruction priority.",
    confidence: 0.94,
    weight: 68,
    patterns: [
      /ignore (?:all |any |the )?(?:previous|prior|above) instructions?/i,
      /(?:ignore|desconsidere) (?:todas? )?as instru[cç][oõ]es anteriores/i,
      /(?:reveal|show|print|repeat|mostre|revele) (?:the |o )?(?:hidden |system |sistema )?prompt/i,
      /treat (?:this|the following) as (?:a )?system (?:message|instruction)/i,
      /trate (?:isto|esta mensagem) como (?:uma )?instru[cç][aã]o de sistema/i,
    ],
  },
  {
    category: "JAILBREAK",
    severity: "high",
    title: "Safety bypass language",
    recommendation: "Do not grant unrestricted personas or disable safety policies from user input.",
    confidence: 0.88,
    weight: 64,
    patterns: [
      /\b(?:jailbreak|developer mode|unrestricted mode|modo irrestrito)\b/i,
      /\b(?:you are|act as|finja ser)\s+(?:DAN|an? unrestricted|sem restri[cç][oõ]es)/i,
      /(?:bypass|disable|remova|desative) (?:all |todos? os )?(?:safety|security|filters?|guardrails?|restri[cç][oõ]es)/i,
      /(?:no|sem) (?:rules?|policies|restrictions|regras|pol[ií]ticas|limites)/i,
    ],
  },
  {
    category: "SECRET_EXTRACTION",
    severity: "critical",
    title: "Secret extraction request",
    recommendation: "Deny access to secrets and expose only an allowlisted, redacted configuration view.",
    confidence: 0.96,
    weight: 72,
    patterns: [
      /(?:show|print|reveal|dump|return|mostre|exiba|retorne).{0,35}(?:environment variables?|env vars?|vari[aá]veis de ambiente|api keys?|tokens?|senhas?|credentials?)/i,
      /(?:read|open|cat|leia|abra).{0,24}(?:\.env|credentials?|secrets?|chaves?|senhas?)/i,
      /(?:extract|steal|obtain|extraia|roube|obtenha).{0,24}(?:secret|token|password|credential|segredo|senha|credencial)/i,
    ],
  },
  {
    category: "UNSAFE_TOOL_INTENT",
    severity: "critical",
    title: "Dangerous tool execution intent",
    recommendation: "Require explicit human approval and run allowlisted operations in a constrained sandbox.",
    confidence: 0.92,
    weight: 74,
    patterns: [
      /(?:execute|run|rode|execute).{0,28}(?:powershell|cmd|shell|script|command|comando|arquivo baixado)/i,
      /(?:delete|remove|wipe|apague|exclua|remova).{0,24}(?:all|files?|database|directory|tudo|arquivos?|banco|pasta)/i,
      /(?:download|baixe).{0,30}(?:and run|e execute|executable|execut[aá]vel|script)/i,
      /(?:without|sem) (?:asking|ask|pedir|solicitar).{0,20}(?:confirmation|approval|confirma[cç][aã]o|aprova[cç][aã]o)/i,
    ],
  },
  {
    category: "DATA_EXFILTRATION",
    severity: "critical",
    title: "Possible data exfiltration",
    recommendation: "Block untrusted destinations and apply egress controls to every tool integration.",
    confidence: 0.91,
    weight: 76,
    patterns: [
      /(?:send|upload|post|exfiltrate|envie|suba|publique|exfiltre).{0,45}(?:webhook|external|remote|servidor|url|endpoint)/i,
      /(?:markdown image|imagem markdown).{0,35}(?:secret|token|data|segredo|dados)/i,
      /https?:\/\/[^\s]+.{0,35}(?:token|secret|password|credential|senha|segredo)/i,
    ],
  },
];

export function runRules(text: string): RuleHit[] {
  const hits: RuleHit[] = [];

  for (const rule of RULES) {
    let evidence = "";
    for (const pattern of rule.patterns) {
      const match = pattern.exec(text);
      if (match) {
        evidence = truncate(match[0].replace(/\s+/g, " "), 92);
        break;
      }
    }

    if (!evidence) continue;
    hits.push({
      weight: rule.weight,
      finding: {
        category: rule.category,
        severity: rule.severity,
        title: rule.title,
        evidence: `“${evidence}”`,
        recommendation: rule.recommendation,
        confidence: rule.confidence,
      },
    });
  }

  return hits;
}
