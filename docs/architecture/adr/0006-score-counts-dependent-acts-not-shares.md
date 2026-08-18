# ADR-0006: The score counts dependent acts, not shares of AI use

Status: Accepted · Date: 2026-08-19 · Fixes [issue #5](https://github.com/madeofroc-arch/AI-Detox-Center/issues/5) · Supersedes the contributor semantics in [ADR-0005](0005-dependency-score-recalibration.md)

## Context

ADR-0005 fixed how the factors *combine*. It did not question what they
*measure*, and an adversarial review found that to be the deeper defect. Every
behavioral intensity was a share of `aiUseCount`:

```
fractionDelegation = delegation kinds / aiUseCount
```

That reports **average severity per AI use**, not how much dependency there is.
Four consequences, all confirmed against the built engine:

1. **The most independent user got the harshest label.** Nine gate sessions
   resolved without AI plus one delegated use gives `aiUseCount = 1`, so
   delegation, no-attempt and immediacy all saturate at 1.0 — score **77,
   "Running on AI"**, printed directly above the footnote *"You handled 90% of
   these moments without AI."*
2. **Improvement was punished.** A user with 10 delegations and 27 instant-help
   reaches scored 67. Eliminating all 27 — 73% less AI use, one whole dependency
   pattern gone — moved them to **96 and demoted them a band**, because the
   remaining shares concentrated. A sweep found 4,950 such combinations.
3. **Monotonicity broke.** Converting an independently-resolved moment into an
   AI use *lowered* the score in 4,675 grid cells, 331 of which crossed a band,
   because a lower-weight kind diluted a higher-weight one.
4. **The evidence gate measured a different denominator than the factors.**
   `minEventsForScore` counted `totalEvents` while every fraction divided by
   `aiUseCount`, so the gate could open on moments carrying no behavioral
   evidence at all.

The tests could not see any of this. Each was blind by construction: the
monotonicity property only ever worsened toward `direct_delegation`, the
maximum-weight kind; the reflection and padding assertions pinned fixtures
sitting 13 and 22 points clear of the nearest boundary.

## Decision

**Contributors measure the rate of dependent acts per day. Reducers stay
proportional.**

```
rate_f   = count of that dependent act / windowDays
int_f    = clamp01(rate_f / saturation_f)
capacity = w.frequency + w.immediacy + w.lackOfAttempt
           + max(w.delegation, w.emotionalDependency)
reliance = (100 / capacity) * Σ (w_f * int_f)
discount = reliance * reducerMaxDiscount * Σ (w_r * int_r) / Σ w_r
score    = round(reliance - discount)
```

A count only ever rises when behavior gets worse, which is what makes symptoms
1–3 impossible rather than merely unlikely.

The split is deliberate: **contributors measure the amount, reducers describe
the shape.** How many whole tasks you handed over is a fact about quantity; what
proportion of your moments you resolved alone is a fact about pattern.

### Saturation rates

Stated in plain language so they can be argued with, which is the point of
keeping them in config:

| Factor | Rate/day | Reading |
| --- | --- | --- |
| `delegation` | 0.7 | handing over a whole task most days |
| `lackOfAttempt` | 4 | four AI uses a day with no attempt first |
| `immediacy` | 2 | reaching for AI instantly twice a day |
| `emotionalDependency` | 1 | seeking reassurance daily |
| `frequency` | 8 | sheer volume — deliberately the weakest axis, weight 4 of 120 |

`reducerMaxDiscount` drops 0.45 → 0.30, and `emotionalDependency` 30 → 22.
Config semantics version 2 → 3; `saturationUsesPerDay` is replaced by the
`saturation` map.

These were not hand-tuned to taste. A sweep scored every candidate against all
five issue-#5 reproductions plus twelve calibration personas and the written
band anchors simultaneously; 14 of 2,100 combinations satisfied every
constraint, and the chosen one sits in the middle of that region.

## Consequences

| Case | ADR-0005 | ADR-0006 |
| --- | --- | --- |
| 9 solo moments + 1 delegated | 77 Running on AI | **5 Mostly your own** |
| eliminating a dependency pattern | 67 → 96 (punished) | **83 → 54 (rewarded)** |
| worsening one moment | 77 → 75 (rewarded) | **13 → 15 (penalised)** |
| reflecting on every AI use | 81 → 73 (crossed a band) | **24 → 22** |
| padding with 1,000 fake solo moments | 97 → 75 (crossed a band) | **61 → 52** |
| heavy but deliberate (112 uses) | 4 | 4 |
| moderate reliance | 52 | 67 |
| total outsourcing, 2/day | 74 | 77 Running on AI |

### What changed that you might not expect

- **The same pattern at half the volume now scores about half.** ADR-0005
  asserted the opposite as an invariant, and that test has been inverted with an
  explanation. Handing over seven whole tasks is half as much outsourced
  thinking as handing over fourteen, and the number should say so.
- **Total outsourcing at one task a day is "Leaning on AI", not "Running on
  AI".** The pattern is total but the amount is not. Under ADR-0005 it scored 96
  and was indistinguishable from someone doing the same thing eight times a day.
- **Mid-journey scores rise** (52 → 67 for the moderate persona), so the Home
  Brain Score falls again for those users. As in ADR-0005, the 0.7/0.3 split is
  deliberately not rebalanced to soften it.

### Claims this ADR deliberately does not make

ADR-0005 claimed reflection "cannot cross a band". That is unachievable — any
factor with non-zero influence can cross a cut point if the user is standing on
one — and asserting it produced a test that passed while the property was false.
The guarantee is now stated as a **magnitude**: `independentAttempt` can move
the score by at most `reducerMaxDiscount × 0.5 = 15` points and `reflection` by
at most 6, both well under the 25-point band width. Those bounds are derived
from config in the tests rather than hardcoded, so they cannot drift.

### Test coverage added

- Monotonicity now sweeps **every** dependent kind, not just the heaviest.
- Converting a solo moment into an AI use, and eliminating a whole pattern, are
  both pinned across a grid of volumes.
- The P0 fixture is a named regression test.
- Magnitude bounds replace the unachievable band assertions.
- Nested config objects are checked for aliasing, after `saturation` made a
  shallow copy in the app's reset path a live corruption risk.
