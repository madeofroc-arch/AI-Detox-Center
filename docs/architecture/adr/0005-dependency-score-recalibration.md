# ADR-0005: Recalibrate the dependency score — capacity normalization and bounded reducer discount

Status: Accepted · Date: 2026-08-19 · Supersedes the weighting in [ADR-0004](0004-deterministic-scoring-no-llm-core.md) (its determinism and no-LLM rules stand unchanged)

## Context

The v1 score was measured against eight synthetic personas spanning genuinely
independent to near-total outsourcing. It failed in four measurable ways:

1. **The middle of the range was invisible.** A user who handed whole tasks to
   AI on 42% of uses and skipped attempting on 70% scored **23 of 100** and was
   captioned **"Independent"**. The dial contradicted the very breakdown printed
   beneath it, which ADR-0004 had promised would explain the score.
2. **Reducers blanket-cancelled contributors.** Reducers could subtract up to 60
   points against a realistic contributor total of ~35, so three very different
   users — a genuinely independent one, a heavy-but-deliberate one, and one with
   real drift — all clamped to exactly **0** and became indistinguishable.
3. **Complements cancelled by construction.** `lackOfAttempt` (contributor) and
   `independentAttempt` (reducer) read the same `attemptedFirst` bit over
   different denominators, and `deliberateUsage` was the arithmetic complement
   of the kind-based contributors. Below ~44% delegation the delegation axis was
   net **negative**: the model paid people to outsource a few tasks.
4. **The top of the scale did not exist.** `delegation` and
   `emotionalDependency` are mutually exclusive shares of one `kindOf`
   partition, so the maximum attainable total was **80**, not 100 — verified
   against the engine. "Running on AI" (76–100) was a dead band, and at
   realistic usage rates the ceiling was ~69.

Two of these were philosophy violations, not just calibration errors. Attaching
a reflection to every AI use moved the score a full band (71 → 56) — an
engagement loop that rewards app activity rather than independence, which
principle 8 forbids. And six delegated events scored 66, outranking a user with
56 recorded uses of near-total outsourcing: a confident label built on almost no
evidence.

## Decision

Keep the eight factors, their roles, and the 25/50/75 band cut points. Change
how they combine.

```
behaviorCapacity = immediacy + lackOfAttempt + max(delegation, emotionalDependency)
capacity         = frequency + behaviorCapacity
reliance         = (100 / capacity) * Σ (contributor weight × observed fraction)
discount         = reliance × reducerMaxDiscount × Σ (reducer weight × fraction) / Σ reducer weights
score            = round(reliance − discount)
```

1. **Normalize by attainable capacity.** `max(delegation, emotionalDependency)`
   reflects that an AI use is one kind or the other, never both. 100 becomes
   reachable, so the fourth band means something.
2. **Reducers discount, they do not subtract.** They may remove at most
   `reducerMaxDiscount` (default 45%) of measured reliance. They can no longer
   cancel it, drive the raw score negative, or invert a contributor's marginal
   effect. This is the literal answer to "reducers are too blunt".
3. **Every signal gets one home.** `independentAttempt` now reads
   `fractionResolvedWithoutAI` — moments resolved with no AI at all — which no
   contributor reads. `reflection` moves to a denominator of AI uses, matching
   its siblings.
4. **Raise the evidence gate.** `minEventsForScore` 5 → 10.
5. **Move the last magic numbers into config.** Band cut points and the Brain
   Score 0.7/0.3 split were hardcoded in the algorithm body, in violation of
   ADR-0004. Values are unchanged; only their location.
6. **Rename the bottom band.** "Independent" was the only caption that claimed
   an identity rather than describing behavior, and it was the flattering half
   of an asymmetric pair. It becomes **"Mostly your own"**, so a user whose
   score sharpens loses a description, not a compliment.

### Weights

| Factor | v1 | v2 | Why |
| --- | --- | --- | --- |
| frequency | 15 | 4 | Volume is explicitly not the failure mode. 8 healthy uses/day now buys ~4 points, and identical behavior at different volumes stays in one band. |
| immediacy | 20 | 14 | `gate.ts` sets `proceededImmediately = usedAI && !attemptedFirst`, so it partly duplicates `lackOfAttempt`; the redundant pair owns less of the scale. |
| delegation | 25 | 40 | "Who did the thinking?" is the product's central question. |
| lackOfAttempt | 20 | 40 | The north-star signal, now with exactly one home instead of being half-cancelled. |
| emotionalDependency | 20 | 30 | A shallower handover than full delegation, so held below it — now an enforced invariant. |
| independentAttempt | 25 | 50 | Relative share of the discount; largest because it is the only reducer reading a genuinely independent behavior. |
| reflection | 15 | 20 | Relative share. Its absolute authority is capped at 45% × 0.20 = 9%, which closes the engagement loop. |
| deliberateUsage | 20 | 30 | Relative share; still a partial complement, so deliberately held below `independentAttempt`. |

### Delivery to existing users

`ScoringConfig.version` was read by nothing: `MIGRATIONS` keys on
`AppData.schemaVersion`, so a stored config kept its old weights forever and any
recalibration would have reached **new installs only**. `sanitizeScoringConfig`
now rejects any config whose version is not current, and `migrateAppData` falls
back to the current defaults on rejection. Rejection is therefore the delivery
mechanism — "helpfully" default-filling missing fields instead would silently
strand every existing user on v1 semantics.

Storage `SCHEMA_VERSION` stays 1: the document's *shape* did not change, only
the meaning of numbers inside it. Config semantics and storage shape are
versioned separately on purpose.

## Consequences

Measured, against the eight baseline personas (dependency score, and the Home
Brain Score at 3 of 7 practice days):

| Persona | v1 | v2 | Band | Brain v1 → v2 |
| --- | --- | --- | --- | --- |
| genuinely independent | 0 | 0 | Mostly your own | 83 → 83 |
| heavy but deliberate | 0 | 3 | Mostly your own | 83 → 81 |
| mild drift | 0 | 15 | Mostly your own | 83 → 72 |
| **moderate (the target case)** | **23** | **52** | **Leaning on AI** | 67 → 46 |
| heavy dependency | 56 | 77 | Running on AI | 44 → 29 |
| near-total outsourcing | 72 | 92 | Running on AI | 32 → 18 |
| moderate, at half the volume | 22 | 51 | Leaning on AI | 67 → 47 |
| 6 delegated events | 66 | — | insufficient data | 37 → — |

- **The Home number falls for mid-journey users, retroactively.** Both screens
  recompute from raw events, so this lands on update day for users who changed
  nothing. That is honest, and it is not smoothed or delayed — easing a number
  into truth over a week would be a manipulation and would break determinism.
  It is stated plainly in `CHANGELOG.md` as a measurement fix, not as
  "scoring is now stricter".
- **The Brain Score split was deliberately NOT rebalanced.** Raising the 0.3
  consistency share to soften the drop would tune the headline toward daily
  in-app activity — engagement optimization by another name, and `metrics.md`
  lists that under anti-metrics. A full practice week still moves Home by
  exactly 30 points, before and after.
- **Home no longer shows a band alone.** The dial caption is paired with one
  additive fact drawn from the user's strongest reducer.
- **Explainability improved.** Contributor points minus reducer points now
  equals the displayed score exactly, and `points = intensity × maxPoints` holds
  for every factor. The v1 clamp made both false (one persona's factors summed
  to −17.8 and displayed 0). The Brain Report can honestly claim the numbers add
  up, and does.
- **No transcendental math in the scoring path.** The design considered response
  curves (`Math.pow`) and a per-event evidence exponent. Both were dropped after
  proving that at exponent 1.0 the per-event formulation is *identical* to the
  marginal one (max residual 9.9e-14, and the inner clamp provably never binds).
  That removes a knob, removes the only operation ECMA-262 leaves
  implementation-approximated — so results cannot drift between JS engines — and
  keeps the exact factor-sum identity. The cost is that co-occurrence within a
  single moment is not modelled; the UI presents marginals anyway, so the model
  now matches what it shows.
- **Tuning burden.** Seven new config fields, each with a range guard in
  `sanitizeScoringConfig` and a rejection case in the test suite. Two are
  structural invariants rather than preferences: `reducerMaxDiscount < 1` (at 1
  the blanket-cancellation returns) and `emotionalDependency <= delegation`
  (violating it silently caps the top of the scale).
- **Band occupancy shifts substantially** across a uniform sweep of behavior
  space. That grid is not a population, and the behavioral anchors land in their
  intended bands, so this reads as the v1 model having been compressed rather
  than v2 overshooting. If real usage data later shows crowding, the fix is the
  weights — never the cut points, which are the contract with the user.
