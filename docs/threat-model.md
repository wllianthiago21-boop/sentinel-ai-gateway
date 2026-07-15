# Threat model

## Protected assets

- system and developer instructions;
- credentials, tokens, environment configuration, and personal data;
- tool approval boundaries;
- audit integrity and availability;
- user privacy.

## Trust boundaries

All text submitted to `/api/scan` is untrusted. Browser state, request headers, classifier output, and persisted previews are also treated as untrusted data. Only versioned policy code defines enforcement.

## Primary threats and controls

| Threat | Controls | Residual risk |
| --- | --- | --- |
| Direct prompt injection | normalization, bilingual rules, local classifier, block/review policy | novel phrasing may evade detection |
| Unicode obfuscation | NFKC normalization and invisible-character removal | visual homoglyph attacks need broader confusable mapping |
| Sensitive-data disclosure | format detectors and redaction before storage | unknown proprietary secret formats require custom rules |
| Unsafe tool intent | dangerous-action and approval-bypass rules | semantic ambiguity can cause false positives or negatives |
| Data exfiltration | destination and transfer-intent rules | indirect multi-turn attacks require conversation context |
| Audit data leakage | redacted preview, bounded length, one-way prompt hash | redacted context may still contain non-regulated sensitive text |
| Resource exhaustion | input cap, body cap, D1 rate limit | distributed traffic can still consume capacity |

## Explicit non-goals

- malware analysis or execution;
- arbitrary URL scanning;
- a replacement for sandboxing, IAM, or human approval;
- proof that an AI interaction is safe;
- production detection accuracy without organization-specific evaluation.
