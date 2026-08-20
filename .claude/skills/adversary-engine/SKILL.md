---
name: adversary-engine
description: The domain engine of Human Mode - The Adversary. Use when working on the round catalog, board construction, run planning, the run reducer, lifelines, the diagnosis that configures the skill, or the 繁體中文 localisation of any of it - anything under packages/core/src/adversary/ or packages/core/src/i18n/. Also use to review any change that touches content, because content is the product here and the failure modes are not the ones a type checker sees.
---

# adversary-engine

The domain engine. It replaced two: `ai-detox-engine` (scoring, gate, detox,
tracking, reflection) and `human-challenge-engine` (catalog, selection,
difficulty, progression), which were deleted with the tracker in schema v4.

**The game is the diagnosis; the skill is the prescription.** The player is
never asked what they think of themselves. Every finding is earned by something
that happened in a run, and the app wrote the argument, so it knows the ground
truth.

## What it owns

| Path | What lives there |
| --- | --- |
| `adversary/catalog.ts` | The 56 rounds. Content, and the riskiest file in the repo. |
| `adversary/types.ts` | `AdversaryRound`, `Pushback`, `SchoolBand`, `NerveCell` |
| `adversary/quiz-config.ts` | Four tiers: band, board width, lives, lifelines, ladder |
| `adversary/quiz-board.ts` | Option placement, lifeline outputs, the axis clamp |
| `adversary/quiz-selection.ts` | `planRun` — the whole run, fixed by the seed |
| `adversary/quiz-run.ts` | The reducer. Pure; invalid transitions are no-ops |
| `adversary/quiz-diagnosis.ts` | `diagnose` — run records to a rung and instructions |
| `i18n/*` | `RoundText` per round, and `localizeRound` |

Does NOT own: screen UI (ux-ui-designer), product scope (product-architect),
CI and community files (open-source-engineer).

## Binding rules

1. **Determinism.** No `Date.now()`, `new Date()`, `Math.random()`. Randomness
   enters as a seed string through `hashString` (FNV-1a via `Math.imul`, which
   is exact 32-bit and therefore identical on every engine). The same seed
   deals the same board on a phone, in a browser and in CI.
2. **The board is built from the bluff's own arithmetic.** Options sit at
   `trueValue x step^k` where the step is that round's own displacement, so the
   option a bluffing host names IS the figure its argument reasons to. Asserted
   over the whole catalog in `quiz-board.test.ts`.
3. **Spacing is uniform and the axis is clamped.** A non-uniform board lets a
   player find the odd one out and halve the search space knowing nothing about
   the subject; an unclamped one offered 4,000 kg of CO2 from a 0.75 kg litre
   of petrol.
4. **One band per tier.** Difficulty is a school level (elementary, middle,
   high, university), not a rank relative to whatever else is in the catalog.
   `difficulty: 1-5` is within-band ordering only.
5. **Localisation swaps text and nothing else.** The true value, the axis, the
   band, both directions and the bluff's figure stay canonical, or the same
   seed would deal different questions in two languages (CLAUDE.md rule 6).
6. **The rung direction is a trap, and it has already been fallen into.** In
   `ladder.yaml` a HIGHER number means MORE help (1 Orient, 5 Full answer)
   while the prose everywhere calls the less-help direction "up". An earlier
   draft prescribed MORE unrequested help to someone who takes help they do not
   need. Read `quiz-diagnosis.ts`'s comment on `rungShift` before touching it.
7. **A finding below its minimum observations is reported as pending, never
   prescribed.** A threshold crossed on a denominator of two is noise wearing a
   prescription's clothes.

## Content is the product, and it is the risk

Every bluff clears two bars, and the second is the hard one:

1. plausible enough to catch a smart, awake person;
2. the reveal lands as *"damn, got me"* — never *"that's a gotcha"* or
   *"that's ambiguous"*.

A bluff is a **fallacy, not a wrong number**: a real constraint applied where it
does not bind, a stock confused with a flow, an average hiding a skew.

**The failure mode to design against is LEGIBILITY** — the player stops
evaluating the argument and starts reading the generator. It has happened once
already: honest arguments opened by correcting an anchor and bluffs did not, so
a rule that never read past the first sentence won 12 rounds and lost 0.
`legibility.test.ts` now measures that shape on every commit. It watches ONE
shape; a register shift or a length difference would pass it untouched.

### Process for any content change

- A verdict's own arithmetic must reach the round's true value. Three shipped
  verdicts did not, and all three were caught by redoing the sums by hand.
- A new round needs `band`, `difficulty`, `axisMin`/`axisMax`, and a
  `bluffValue` consistent with `direction`. Six of fourteen drafted rounds were
  rejected by these checks.
- A round never addresses the player. No "you", no 「你」, no 「您」.
- Adding a round in English without 繁體中文 fails `zh-catalog.test.ts`.
- A translation is a re-say, not a gloss: if a literal rendering makes the flaw
  obvious in Chinese where it was hidden in English, move the phrasing so the
  flaw is hidden again. The reasoning does not move.
- **A content edit after a translation is dispatched desyncs the two catalogs
  silently.** Nothing in the type system can see it, because both files are
  individually well-formed. Two rounds shipped that way. Re-read, or re-send.

## Prohibitions

- Never make the run adapt to how the player is doing. A ladder whose
  difficulty responds to the player is a ladder whose score means something
  different for every player, and the record has to be comparable to itself
  across runs or the diagnosis is worthless.
- Never grant a lifeline at random. The player chooses; a random drop is the
  variable-reward mechanic principle 8 bans by name.
- Never price one lifeline below the others "for balance" — that made reaching
  for the host first correct arithmetic rather than a preference, and corrupted
  the `host_first` finding.
- Never let a run offer one more question. Every run states its length before
  it starts and ends.
- Never add a network call or an inference call. The shipped product performs
  no inference and needs no key (ADR-0004), and CI proves it.

## Done criteria

- `npm test -w @ai-detox/core` green, including the determinism, board,
  zh-catalog and legibility gates.
- A change to scoring or selection semantics carries a determinism test: same
  inputs, deep-equal outputs.
- A content change has had its arithmetic redone by hand, in both languages.
- Anything the change makes untrue in `catalog.ts`'s header or
  `docs/product/adversary.md` is corrected in the same commit — those two files
  are where this engine's known defects are recorded, and a stale record is
  worse than none.
