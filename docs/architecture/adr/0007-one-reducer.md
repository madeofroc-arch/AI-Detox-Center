# ADR-0007: One reducer, and it counts moments with no AI in them

Status: Accepted · Date: 2026-08-19 · Fixes the third incarnation of [issue #5](https://github.com/madeofroc-arch/AI-Detox-Center/issues/5) · Amends [ADR-0006](0006-score-counts-dependent-acts-not-shares.md)

## Context

ADR-0006 fixed what the contributors measure and claimed the result made a
whole class of defect "impossible rather than merely unlikely". An independent
adversarial review refuted that claim, and the counter-example is embarrassingly
ordinary:

> 18 reassurance-seeking uses score **51, "Leaning on AI"**. The same 18, plus
> one honest attempted-first lookup, score **50, "Balanced"**.

Nothing was removed. No count fell. Reliance rose. The dial went down and the
band improved, and the cheapest route out of "Running on AI" was to log one more
AI use.

The arithmetic:

| | contributes | discounts |
| --- | --- | --- |
| one deliberate, attempted-first AI use | ~0.03 pts (`frequency`, weight 4 of 120, saturating at 8/day) | ~0.24 pts (raises `deliberateUsage` by 1/(n+1) at n=19) |

A sweep found 140 regressions in 2,080 comparisons and 15 that crossed a band.
`reflection` had the same shape, worth up to 3 points. Both were bounded — the
bound was even asserted in tests — and the bound was the wrong guarantee: it
constrained how far the dial could move, not which direction it moved in.

A second, smaller defect came from the same review. Above the clamp, reliance
pins to 100 within one ULP, so worsening behavior moves the true score by
exactly 0.0. When that value lands on x.5, `Math.round` sent two mathematically
identical scores to different integers, and the user saw the worse behavior
score a point lower. 280 confirmed instances.

## Decision

**There is exactly one reducer: `independentAttempt`, the share of moments
resolved with no AI at all.**

```
score = reliance * (1 - reducerMaxDiscount * fractionResolvedWithoutAI)
```

`reflection` and `deliberateUsage` are removed from the config, the factor
breakdown and the dial. They are still computed, still shown in the Brain
Report, and now carry the denominator the sentence beside them actually claims.

Two supporting changes:

- `reducerMaxDiscount` drops 0.30 → 0.15, so the surviving reducer keeps
  exactly the 15-point ceiling it had as 0.30 × 50/100. No persona moves.
- The score is rounded as `Math.round(exact + 1e-9)`. The epsilon is far below
  the smallest difference the model can express (~0.03 points) and far above
  float noise (~1e-14), so mathematically equal scores round the same way.
- `sanitizeScoringConfig` no longer rejects `emotionalDependency > delegation`.
  That rule existed because the ceiling used to be
  `max(delegation, emotionalDependency)`; ADR-0006 made it the plain sum, so the
  consequence it guarded against cannot occur. A test now pins the retraction.

Config semantics version 3 → 4.

### Why zero weight and not a small one

The obvious repair is to keep both reducers and shrink their weights until the
inversion is smaller than a point. It does not work. The displayed score is
rounded, so a swing of any size can tip an integer boundary, and a user standing
on a cut point crosses a band. There is no positive weight at which "adding an
AI use never lowers the score" becomes true — only zero.

Stated generally, and this is the rule to check any future reducer against:

> **A reducer whose numerator can be raised by an AI use inverts that use's
> marginal effect, because the use itself contributes almost no reliance.**

`independentAttempt` passes: its numerator counts moments where AI was *not*
used, so an AI use can only ever lower it.

### What this costs

Reflecting no longer improves the number. That reads like a loss and is
actually the point: reflection is in-app activity, and the product's own
prohibition list already said in-app activity must not buy a better label. A
score you can improve without changing your behavior outside the app is worth
less than one you cannot. The Brain Report says so in as many words, under a
heading that reads *Not counted, worth knowing*.

The Brain Score on Home still rewards practice consistency, which is the right
place for it: that number is explicitly a measure of what you are doing, not an
estimate of how much thinking you handed over.

## Consequences

Every row of ADR-0006's consequence table is unchanged, because dropping the two
terms only affects profiles that had reflections or deliberate uses, and their
`independentAttempt` term is untouched:

| Case | ADR-0006 | ADR-0007 |
| --- | --- | --- |
| 9 solo moments + 1 delegated | 3 | **3 Mostly your own** |
| eliminating a dependency pattern | 79 → 39 | **79 → 39** |
| padding with 1,000 fake solo moments | 62 → 53 | **62 → 53** |
| total outsourcing, 1/day | 54 | **54 Leaning on AI** |
| total outsourcing, 2/day | 100 | **100 Running on AI** |
| heavy but deliberate (112 uses) | 3 | **3 Mostly your own** |
| 18 reassurance uses | 51 Leaning | **51 Leaning** |
| …plus one honest lookup | 50 Balanced (bug) | **51 Leaning** |
| reflecting on every AI use | −2 pts | **no change** |

The proof that replaces the sweeps, in three lines:

- **Adding an AI use** raises `reliance` weakly (at minimum through
  `frequency`) and strictly lowers `fractionResolvedWithoutAI`, so the discount
  factor rises. The score cannot fall.
- **Worsening a flag or a category** raises one of the five counts and touches
  no reducer. The score cannot fall.
- **Only a moment resolved without AI** can lower the score, by at most
  `reducerMaxDiscount`.

### Test coverage

`scoring-monotonicity.test.ts` was rewritten rather than extended, because it
had been blind three times in three different ways: the first version only ever
worsened behavior toward the heaviest category; the second varied categories but
built every event with identical flags; the third varied both but only ever
*converted* one act into another — and this defect only appears when you *add*
one alongside.

It no longer hand-picks the changes it tests. It enumerates all 108
distinguishable event variants, derives "strictly worse" from a dominance
relation over the six signals the engine actually reads, and sweeps all 4,060
ordered pairs as conversions *and* as additions. About 29,600 comparisons, with
the per-block counts asserted so the figure quoted here cannot drift from the
code.

For the record, the previous version of that file was described in ADR-0006 and
in the changelog as "roughly 8,800 comparisons". Enumerating its loop bounds
gives 3,258. That number was wrong and has been corrected there too.
