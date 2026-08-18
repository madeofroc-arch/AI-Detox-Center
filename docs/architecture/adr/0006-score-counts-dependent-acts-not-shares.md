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
int_f       = (count of that dependent act / windowDays) / saturation_f   -- NOT clamped
capacity    = Σ all contributor weights
raw         = (100 / capacity) * Σ (w_f * int_f)
points_f    = (100 / capacity) * w_f * int_f * min(1, 100/raw)
reliance    = Σ points_f                       -- summed, never recomputed
discount    = reliance * reducerMaxDiscount * Σ (w_r * int_r) / Σ w_r
score       = round(reliance - discount)
```

Four details in that formula are load-bearing, and each was learned by getting
it wrong first:

- **Intensities are not clamped per factor.** Clamping each axis breaks
  monotonicity: once the heavier axis pins at 1.0, converting an act into it
  gains nothing while the lighter axis loses its entire weight. Measured:
  converting instant-help uses into whole-task delegations *lowered* the score
  by up to 15 points and promoted a band. Only the total is bounded.
- **Capacity is the full sum, not `max(delegation, emotional)`.** That max was
  correct while those were shares of one partition; as independent rates a user
  can saturate both, and reliance reached 122.
- **`immediacy` counts the `proceededImmediately` flag only.** Counting the
  `instant_help` *category* as well meant converting such an act into a
  delegation removed it from the axis — the same monotonicity break by a
  different route.
- **Everything downstream derives from the summed points.** Adding the same
  quantities in a different association order differs in the last bits, which
  was enough to make the dial disagree with its own breakdown by a point
  whenever the total landed near a .5 boundary.

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
| `delegation` | 1 | handing over a whole task every day |
| `lackOfAttempt` | 2 | two AI uses a day with no attempt first |
| `immediacy` | 3 | reaching for AI instantly three times a day |
| `emotionalDependency` | 1 | seeking reassurance daily |
| `frequency` | 8 | sheer volume — deliberately the weakest axis, weight 4 of 120 |

Exceeding a saturation rate keeps adding — these are the rate at which a factor
claims its full weight, not a cap.

`reducerMaxDiscount` drops 0.45 → 0.30, and `emotionalDependency` 30 → 22. All
three reducers now share one denominator (all moments); mixing denominators let
a strictly worse change — turning an independently-resolved moment into a
deliberate AI use — raise a reducer faster than it raised reliance, and so lower
the score. Config semantics version 2 → 3; `saturationUsesPerDay` is replaced by
the `saturation` map.

These were not hand-tuned to taste. A sweep scored every candidate against all
five issue-#5 reproductions plus twelve calibration personas, the written band
anchors, and the requirement that the north-star lever stay visible rather than
saturating — all simultaneously. 20 of 400 combinations satisfied every
constraint, and the chosen one sits inside that region.

## Consequences

| Case | ADR-0005 | ADR-0006 |
| --- | --- | --- |
| 9 solo moments + 1 delegated | 77 Running on AI | **3 Mostly your own** |
| eliminating a dependency pattern | 67 → 96 (punished) | **79 → 39 (rewarded)** |
| worsening one moment | 77 → 75 (rewarded) | **14 → 16 (penalised)** |
| reflecting on every AI use | 81 → 73, a whole band | **26 → 24, two points** |
| padding with 1,000 fake solo moments | 97 → 75, a whole band | **62 → 53** |
| genuinely independent | 0 | 0 Mostly your own |
| heavy but deliberate (112 uses) | 4 | 3 Mostly your own |
| mild drift | 15 | 14 Mostly your own |
| moderate reliance | 52 | 66 Leaning on AI |
| heavy dependency | 77 | 99 Running on AI |
| near-total outsourcing | 92 | 100 Running on AI |
| total outsourcing, 1/day | 96 | 54 Leaning on AI |
| total outsourcing, 2/day | 74 | 100 Running on AI |

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

Measured, reflection moves a delegating profile by 2 points — which can still
straddle a cut point if the user happens to sit on one. That is the point of
stating a magnitude instead: the claim is now true.

### The denominator is the fixed window, and that is a deliberate trade

Rates divide by `windowDays`, never by the observed span of the user's history.
A span-based denominator is tempting — it stops a brand-new user's number
climbing for two weeks at constant behavior — but it is not a function of
behavior: removing events shrinks the span, which shrinks the denominator and
therefore *raises* every rate. It was implemented, and it broke the very
property this ADR exists to establish. Monotonicity is a correctness property
and wins. The cost is that early numbers read low while the window fills, which
the Brain Report now says plainly.

### Test coverage added

A dedicated `scoring-monotonicity.test.ts` enumerates, against the real engine:
every conversion between every pair of categories in a range of bulk contexts
and volumes; converting an independently-resolved moment into every kind of AI
use under every flag combination; dropping the attempt before a use; adding one
more dependent act; and eliminating a whole pattern. Roughly 8,800 comparisons.

Two successive models shipped monotonicity breaks their own tests could not see
— the first only ever worsened toward the single heaviest category, the second
swept categories but held the flags fixed — so the sweep is deliberately
exhaustive rather than sampled.

Also:

- The breakdown-sums-to-the-dial property is now checked **unclamped**. Applying
  the same clamp to the sum before comparing is what let it pass while the two
  disagreed by up to 14 points in 4.7% of corpora.
- Magnitude bounds, derived from config, replace every "cannot cross a band"
  assertion — including one that survived the first draft of this ADR by sitting
  6 points clear of a cut point.
- Nested config objects are checked for aliasing, after `saturation` made a
  shallow copy in the app's reset path a live corruption risk.
