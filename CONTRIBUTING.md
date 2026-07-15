# Contributing

1. Open an issue describing the proposed detector, policy change, or defect.
2. Use only synthetic, non-operational test content.
3. Add or update tests for every policy behavior change.
4. Run `npm run lint`, `npm test`, and `npm run test:site`.
5. Keep classifier output advisory and enforcement deterministic.

Detector changes should document false-positive risk and include both suspicious and benign regression cases. Do not submit secrets, personal data, weaponized payloads, or changes that connect public input to executable tools.
