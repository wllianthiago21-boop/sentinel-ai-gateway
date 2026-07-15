# Model card: Transparent NB 1.0.0

## Intended use

The built-in multinomial Naive Bayes classifier provides a lightweight suspicious-language signal for the SentinelAI policy engine. It runs locally with no external inference service.

## Training data

The repository includes a small, human-readable bilingual corpus of benign defensive requests and suspicious AI-agent instructions. The corpus is synthetic and intentionally safe to publish.

## Decision role

The classifier is advisory. It cannot directly authorize a tool call or override a deterministic block. Policy combines classifier probability with explicit detector evidence.

## Limitations

- The dataset is small and not representative of all languages or domains.
- Probability is a model score, not a calibrated real-world likelihood.
- Novel obfuscation, multi-turn context, and organization-specific terminology may reduce accuracy.
- Users must evaluate false positives and false negatives on their own reviewed dataset before production use.

## Responsible evaluation

Use synthetic or properly sanitized text. Do not add real passwords, access tokens, personal data, exploit payloads, or confidential system prompts to tests or issues.
