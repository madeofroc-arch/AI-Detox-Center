# The Adversary

A three-minute game where you commit to an answer, a confident opponent argues
against it — sometimes honestly, sometimes not — and you win by knowing when to
hold your ground.

## Problem

AI produces fluent, confident, mostly-right output, and people have lost the
reflex to notice when it is wrong, because nothing in an ordinary day ever tells
them they were fooled. The feedback never arrives, so the reflex never forms.

## Who

Someone who reviews generated output all day and has already been burned by it:
approved the agent's PR without really reading it and found the bug in
production; shipped the memo with a number they never checked. They are not
looking for self-improvement and would not download a wellness app. They are
worried about looking stupid, which is a stronger and more durable motivation.

The audience that actually drives installs is adjacent: people who already play
Wordle- and Connections-shaped things, and anyone forecasting-curious who has
heard of calibration and never had somewhere to practise it. **They come for the
game; the capability is the side effect.** That is the correct order, and
reversing it is what produced the previous product.

## The moment

22:40, on the sofa, phone in one hand, thumb hovering over Instagram. Or four
minutes in a queue.

The competitive set is **scrolling**, not "instead of asking AI". Nobody will
interrupt themselves at 16:40 with a red test, and the previous design died on
believing they would. Everything follows from this moment: one-handed, portrait,
no typing, no setup, no brief to read, resumable after an interruption, and
genuinely finished in three minutes.

## The session

Five rounds. The count is stated before the first one. It ends itself; there is
no "one more". No streak, no daily obligation, no notification. (Principle 8.)

## Round type A — The Number

The only round type in v1. Types B (The Chain) and C (Two Stories) are specified
in "Later" below and are deliberately not built yet.

### 1. Commit

One question, large: *"Roughly how many commercial airline flights take off
worldwide on an average day?"*

A two-thumb band on a **log axis**, opening wide. You drag it inward. The claim
is fixed and stated: **you are saying you are 90% sure the answer is in here.**
The width is not your confidence — your confidence is always 90% — the width is
how much you are willing to stake on it. Two things move live under your thumb:
what a hit pays, and how wide your claim is as a multiple ("somewhere in a 12×
range"). Not a risk score; see below for why that number cannot honestly exist.

The tension is in the narrowing, before any answer exists. That is deliberate:
it means the game is enjoyable in the act rather than in the payout.

### 2. The pushback

You lock it in. The opponent speaks — a distinct card, its own type weight,
clearly someone else:

> *"That seems high. There are about 40,000 airports worldwide, and the great
> majority handle a handful of flights a day at most. Your range assumes several
> flights per airport per hour, which is only true at major hubs."*

**HOLD** or **MOVE**. Moving reopens the band; a moved band pays less. Holding
asserts that the argument is bad, or true but irrelevant.

### 3. The reveal, in two beats

**Beat one — the number lands.** A marker slides along the same axis your band
lives on and either clicks inside it or does not. Binary, physical, about 0.4
seconds. If it misses, it says by how much ("you were 6× low").

**Beat two — the opponent is graded.** This is the beat the product turns on:

> *"That was a bluff. Air traffic is hub-concentrated by design; the airport
> count does not constrain the flight count. You held."*

Catching the bluff and doing the thinking are the same act. There is no reward
bolted onto the reasoning.

## Scoring

### The payout must be a proper scoring rule

**Non-negotiable.** If the rule can be beaten by stating something other than
your true belief, the game trains the wrong reflex — and a calibration game that
teaches you to game it is worse than no game.

v1 uses the **Winkler interval score**, computed in log space, for a 90%
interval `[lo, hi]` with outcome `y` and `α = 0.10`:

```
width   = log10(hi) − log10(lo)
penalty = 0                                    if lo ≤ y ≤ hi
          (2/α) · (log10(lo) − log10(y))       if y < lo
          (2/α) · (log10(y) − log10(hi))       if y > hi
loss    = width + penalty          # lower is better
```

Points are an affine, decreasing function of `loss`, normalised against the axis
span so every question is on the same scale.

**A missed band scores below zero, and it has to.** The first version of this
floored the score at zero on the reasoning that a negative number is a
punishment. The properness test failed on the first run: with a floor, a badly
missed narrow band costs no more than a barely missed one, the tail penalty
disappears, and stating an **80% band beats stating your honest 90% one**. A
player would find that. No bounded rule can price interval width and stay
proper, because arbitrarily bad misses must cost arbitrarily much — so the floor
went. It is a claim about a band, not about the player; principle 7 is intact.

`MOVE` applies a fixed, stated multiplier — but **to winnings only**. Scaling a
loss down too would make moving a hedge that buys cheaper downside, and "move
whenever unsure" would dominate. Moving costs you upside; it does not buy
safety.

### The second number under the thumb is the claim, not a risk score

The design called for "a payout that climbs and a risk that climbs with it".
Under a proper rule the second number does not exist: narrowing raises the
*probability* of missing, not the penalty for a miss. In points, a tighter band
that misses by a fixed distance actually scores slightly **better**, because the
width term is smaller. A risk figure derived from the scoring rule would fall as
you narrowed, and a player reading it would conclude that tightening reduces
their downside.

So the fear is stated as the claim: **"somewhere in a 12× range, and you are 90%
sure."** It tightens visibly under the thumb, it is exactly what the player is
asserting, and it is something a person can reason about.

### The two numbers on the record

**CALIBRATION.** Of the bands you called 90% sure, how many contained the
answer? One number, against a stated target of 90%.

The first time someone reads *"you said 90%, you were right 61% of the time"* is
the moment this product exists for. It is legal under principle 7 because its
subject is a claim the player made, it is bounded to the game, and it is
actionable in one move: widen your bands.

A reliability plot across several confidence levels is a later addition. v1
fixes the claim at 90% so the number means exactly one thing.

**NERVE.** What you did when pushed, as a 2×2 the player can read at a glance:

| | argument was honest | argument was a bluff |
| --- | --- | --- |
| **you held** | missed an update | **held your ground** |
| **you moved** | **updated correctly** | got taken |

The bottom-right and top-left cells are the interesting ones. Nerve requires no
self-reporting, cannot be gamed by lying — the app knows the ground truth and
the app wrote the argument — and is a by-product of play. Everything the old
dependency score wanted to be and could not.

**The ones that got you.** Every bluff you moved on, kept and re-readable. The
only genuinely re-readable artifact in the product, and the natural thing to
show someone.

## Content

The content is the product, and it is the risk. A bluff must clear two bars at
once: plausible enough to catch a smart, awake person, and fair enough that the
reveal lands as *"damn, got me"* rather than *"that's a gotcha"* or *"that's
ambiguous"*. A bluff is a **fallacy, not a wrong number** — a real constraint
applied where it does not bind, a stock confused with a flow, an average hiding
a skew, a sample that is not the population.

**The failure mode to design against is legibility.** Template-generated
rhetoric clears bar one and fails bar two within about thirty rounds, because
the player stops evaluating the argument and starts pattern-matching the
generator. At that point they are beating the engine, not practising the
capability, and the product is dead while still appearing to work. Therefore:
**an authored core, with generation as variation rather than as the engine.**
Every authoring pass is reviewed by a reader whose only job is to find a rule
like *"whenever it cites a total count, it is the constraint-that-does-not-bind
template"*.

### Authoring with a model is allowed. Inference at runtime is not.

ADR-0004's claim splits in two, and only one half was ever load-bearing:

- **The shipped product performs no inference and requires no key.** Keep,
  absolutely. It is the strongest verifiable claim in the repo and CI already
  proves it.
- *The shipped content was authored without a model.* Never actually claimed,
  not worth claiming. Generating candidates with a model and hand-grading them
  down to a shipped static set leaves the product 100% offline, key-free and
  auditable.

Dropping the second half is what makes this affordable for one maintainer.

### 繁體中文 is a second authoring effort, not a translation

The repo's i18n architecture — id-matched overlays that fail the build on a
missing key — is right for strings whose *meaning* is stable and wrong for
content whose *persuasiveness* lives in idiom. An argument that is seductive in
English can be transparent in Chinese.

Questions, units and true values are portable and use the existing machinery.
**Pushbacks and verdicts are authored independently per language**, against the
same two bars, and are allowed to differ in substance. This is a real departure
from CLAUDE.md rule 6 and is limited to adversarial argument.

## Acceptance criteria

1. A session is exactly five rounds, states so before round one, and ends. No
   affordance anywhere offers a sixth.
2. Payout is the Winkler interval score in log space, unfloored; a property
   test asserts the rule is proper over a lattice of beliefs — no misstated
   band, at any coverage or any shift, scores better in expectation than the
   honest one. This test has already caught two real defects and is the single
   check the game rests on.
3. Round selection is deterministic from `(seed, index)`: the same seed yields
   the same five rounds, so a bug report is a seed and a shared daily round
   needs no server. No `Date.now()` or `Math.random()` in core.
4. Calibration is `hits / bands`, displayed against the stated 90%, and is the
   only ratio in the product whose subject is the player's own claims.
5. Nerve's four cells are derived from `(held|moved) × (honest|bluff)` with no
   self-report anywhere in the path.
6. Every number shown to the player is reproducible from stored round results;
   nothing is a running total that cannot be recomputed.
7. No streak, no notification, no variable reward, no session that does not end.
8. No copy anywhere addresses the player rather than the argument. "That one got
   you", never "you fell for it".
9. The app works fully offline with no key. CI's no-network grep still passes.

## Later, and deliberately not now

- **Round type B — The Chain.** A four-step derivation, confident and clean,
  arriving at a number; exactly one step is wrong, or none are. You tap the step
  that breaks; tapping nothing is also a bet. Every parameter generated, so it
  is never the same puzzle twice. This is the type that survives parameterisation
  best — structural arithmetic errors are language-portable and machine-checkable.
- **Round type C — Two Stories.** Two fluent explanations for the same real
  fact, same register; one is the actual reason. Trains the single sentence the
  product is about. Authored, never generated, and used as seasoning.
- Multiple confidence levels and a real reliability plot.
- A shareable artifact. Nothing in the ten principles forbids one — "no
  surveillance" bans telemetry, not a screenshot — and every product that has
  won this shape in a decade won on a small thing the player chose to show
  someone. Currently unclaimed ground.

## The risk this is being built despite

Calibration training transfers unevenly: people become well-calibrated on trivia
fairly quickly and it does not reliably carry into judgement about their own
work. This could end up a good game that improves trivia calibration and changes
nobody's review behaviour.

**Nerve is the counter-hypothesis** — it measures resistance to rhetorical
pressure rather than fact knowledge, and pressure-resistance plausibly transfers
better. That is a hope, not evidence, and it is the thing to watch first rather
than to build past.

A two-weekend falsifiable probe was proposed — 40 hand-authored bluffs on one
static page, no app — and was deliberately skipped in favour of building. The
concern is therefore addressed by sequencing instead: **content and mechanics
first, motion design and store last**, so the bluffs are readable in week one
rather than month three.
