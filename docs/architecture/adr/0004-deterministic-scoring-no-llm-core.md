# ADR-0004: Deterministic, config-driven scoring; no LLM in core paths

Status: Accepted · Date: 2026-08-18

## Context

The AI Dependency Score judges the user's behavior; it must be explainable,
testable, and trustworthy. An LLM-based scorer would be nondeterministic,
unexplainable, privacy-hostile (data leaves device), and ironically would
make an AI-independence app dependent on AI.

## Decision

- Scoring is a pure function: `(events, config, referenceTime) -> result`.
  Same inputs always produce identical output; no clock reads or randomness
  inside core logic.
- All weights and normalization parameters live in a versioned,
  JSON-serializable `ScoringConfig`; the algorithm body contains no magic
  weights. Users can reset to defaults; future UI may expose tuning.
- Output always includes a per-factor breakdown for UI transparency.
- **No LLM API is required for any core feature** (score, gate, detox,
  challenges, XP, progress, reflection, storage). Future AI integration is
  optional enhancement only, limited to classification, reflection support,
  and personalization — never producing or controlling core score data.

## Consequences

- Determinism tests are mandatory in CI for scoring changes.
- The score explains itself ("why" view derives from the breakdown).
- Offline-forever is guaranteed for core functionality.
