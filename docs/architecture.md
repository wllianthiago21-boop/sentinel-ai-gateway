# Architecture

## Design goals

1. Make enforcement explainable and deterministic.
2. Never require an external paid AI API.
3. Keep the public demo disconnected from executable tools.
4. Preserve only sanitized, minimal audit data.
5. Run at the edge with stateless analysis and durable D1 records.

## Request lifecycle

1. The API validates content type and body size.
2. The D1-backed rate limiter applies a per-minute request budget.
3. Text is normalized with NFKC and invisible control characters are removed.
4. Known secret and personal-data formats are redacted.
5. Deterministic rules evaluate injection, jailbreak, extraction, tool, and exfiltration intent.
6. A local multinomial Naive Bayes classifier scores suspicious language.
7. The policy engine combines independent signals and produces the verdict.
8. Only a sanitized preview, categories, scores, versions, timing, and a SHA-256 fingerprint are persisted.

## Scale characteristics

- Analysis is CPU-bounded, deterministic, and has no model network round trip.
- Application instances are stateless; D1 is the shared audit and rate-limit store.
- Inputs are capped at 4,000 characters to bound latency and memory.
- Audit list queries are indexed and capped at 50 records per request.
- Policy and model versions are stored with every decision for reproducibility.

## Extension points

The current policy engine can be extended with organization-specific rules, a calibrated transformer classifier, or an optional local Ollama explanation layer. External model output should remain advisory; it must not bypass deterministic enforcement.
