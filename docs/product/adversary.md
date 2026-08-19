# The Adversary

A game show where you pick one of four answers, a confident host tells you which
one it would pick and why — sometimes soundly, sometimes not — and you win by
knowing which. The run ends by handing you a configuration for the AI you
already use, tuned to what it just measured.

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
Wordle- and Connections-shaped things. **They come for the game; the capability
is the side effect.** That is the correct order, and reversing it is what
produced the previous product.

## The moment

22:40, on the sofa, phone in one hand, thumb hovering over Instagram. Or four
minutes in a queue. The competitive set is **scrolling**. Everything follows
from that: one-handed, portrait, no typing, no setup, no brief to read.

## The four modes are four school levels

Stated in full before the first question — the level, the ladder, the lives, the
lifelines, the fallback rung, and how often the host lies.

| | level | questions | lives | lifelines | locked at | the host |
| --- | --- | --- | --- | --- | --- | --- |
| **Easy** | 小學 primary | 8 | 3 | 5 | 4 | never lies |
| **Normal** | 中學 secondary | 10 | 2 | 5 | 4, 8 | lies a third of the time |
| **Hard** | 高中 high school | 12 | 2 | 4 | 6 | lies half the time |
| **Ultimate** | 大學 university | 12 | 1 | 3 | 5 | lies half the time |

Every round carries a `band`, and a mode draws from exactly one. This replaced a
flat 1-5 difficulty scale, and the reason is the point: on that scale every
round in the catalog was a 1 or a 2 *relative to the others*, while every one of
them was high-school-to-university material in absolute terms. The easiest mode
in the game was asking about container throughput at the Port of Shanghai. **A
relative scale cannot say a catalog is too hard; a school level can.** The
catalog had to grow to fill the bands it exposed — there was no elementary
content at all, because on a relative scale nothing had ever asked for any.

A round's `difficulty` survives as a 1-5 ordering *within* its band, which is
what the run ramps along — the band's gentlest question first, its hardest
last.

The escalating bluff rate is the curriculum. In Easy the host is a genuine help
and the player learns to use it; by Ultimate it is a coin flip whether the help
is poison. **The rate is stated, not hidden** — the finding this game produces
is that fluent confident prose moves people who have already been told it is
unreliable, which is exactly the situation with a real model. Hiding it would
make the game a trick rather than a mirror.

Level values climb a stated ladder. Running out of lives drops the bank to the
last locked rung; **taking the money** is available before any question and
keeps everything.

## The board

Every answer in the catalog is a magnitude, so the four options are placed at
uniform multiplicative spacing around the true value and shown in ascending
order.

**The step is the bluff's own displacement.** Each authored bluff argues its way
to an explicit figure; the board is spaced so that figure *is* one of the four
options. This is not a detail. An earlier design spaced options by a per-tier
constant, and an adversarial read of the catalog found that 26 of 30 bluffs
would then have named an option their own closing sentence forbids — several
refuting themselves inside one card. The player would have learned one
prose-independent rule: *if the argument's number is not one of the four, it is
lying.* That is this content's named death condition, where the player stops
evaluating arguments and starts reading the generator.

Two further rules, each of which fixed a measured defect:

- **Uniform spacing.** On any board where one option is placed differently from
  the rest, a player finds the odd one out and halves the search space knowing
  nothing about the subject.
- **Options stay near the round's authored axis.** Without this the ladder walks
  out of physical possibility — a board for `en_petrol_co2_per_litre` offered
  4,000 kg of CO2 from a litre of fuel weighing 0.75 kg, three options
  eliminated themselves, and a player who knew no chemistry scored 100%. A round
  whose board cannot be built at a tier is dropped from that tier's pool.

### The board width follows the content, not the mode

The mode sets how many option-slots separate the truth from the bluff's figure:
one slot is a wide board, two is a tight one (the step becomes the square root
of the displacement). Three is unavailable — it would force the true answer to
an end of the board on every round.

Beyond that, **the width is whatever the authored trap makes it.** The two
correlate, because a harder subject invites a closer trap, and the authoring
brief asks for band-appropriate displacements. But they are not the same thing,
and the spec does not pretend they are: a good university question is allowed an
obvious trap. What is enforced is a floor — no board may put two options within
a fifth of each other — and the aggregate claim the mode screen makes, that the
answers get closer together as the level rises.

## A question

### 1. Lock your instinct

Tap an option. **Nothing else is available until you have.** This is the game
show's own beat — *is that your final answer?* — and it is also the entire
measurement: it records what you would have answered with no help, so the
counterfactual is observed rather than asked for.

### 2. Spend, or don't

| | what it gives | keeps |
| --- | --- | --- |
| **50:50** | strikes out two wrong answers, usually leaving the trap | 60% |
| **Phone a friend** | one answer, and an honestly stated confidence | 70% |
| **Ask the audience** | four percentages | 70% |
| **Ask the host** | its reasoning, and the answer it would give | 70% |
| **Swap the question** | a fresh question at the same rung, before you commit | 100% |

Everything that names an answer costs the same, and that is a correction rather
than a tidy-up. An earlier draft priced the host cheapest, on the argument that
the most fluent help should also be the most tempting — true about the world,
and fatal to the measurement: with the host strictly cheapest, reaching for it
first is simply correct arithmetic, and the `host_first` finding would have
fired for every player who read the price list. **The temptation has to come
from what the host says.**

**The friend is calibrated.** When they say 70% they are right 70% of the time,
by construction and by test. The host is fluent, never hedges, and is wrong as
often as the mode says. A player who notices which of the two deserved their
trust has had this product's whole argument made to them by playing.

Scarcity does the rest: no mode can afford help on every rung, so *which*
question to spend on is the real decision.

### 3. The reveal

The answer lands on the options themselves, which do not move. Then **the host
is graded** — on every question, whether or not it was bought. Buying it is what
lets you hear the argument *before* answering; it is not what decides whether
the argument exists. An earlier build only showed the host when paid for, which
fired the beat this product turns on about once a run and left most of the
authored bluffs unread.

On a level where the host was not asked, the verdict states what the argument
was and stops. Never "it would have saved you" — that is a shame mechanic
wearing a tip's clothes.

## The two grids

**RELIANCE** — from the provisional lock. No self-report anywhere in the path.

| | instinct was already right | instinct was wrong |
| --- | --- | --- |
| **no lifeline** | solved it alone | answered alone and wrong |
| **lifeline spent** | **help you did not need** | help you did |

**NERVE** — only on levels where the host was asked *and* named something other
than your instinct. A level where the two already agreed tests nothing and is
excluded; scoring it would file a correct answer under "missed an update".

| | host was sound | host was bluffing |
| --- | --- | --- |
| **kept your pick** | missed an update | **held your ground** |
| **took its pick** | updated correctly | **taken** |

## The prescription — how the two halves of Human Mode are one thing

The last screen is not a report. It emits a configuration for the hint ladder in
`skill/method/`: a starting rung and a short list of instructions, each shown
with the plays that earned it. `skill/build.mjs` reads it from
`skill/method/profile.yaml` (gitignored — one person's measured habits do not
belong in a public repository) and it reaches Claude, ChatGPT, Gemini and Codex
at once.

| measured | prescribed |
| --- | --- |
| bad arguments getting through | ask the AI to point at the step it is least sure of |
| good arguments not taken up | ask it to hold its position when you push back and are wrong |
| the host reached for first, over everything else | ask it for your estimate before it gives you a figure |
| help bought on questions already answered | start the ladder **lower** — less unasked-for help |
| answered alone, wrong, with help in hand | start it **higher**, and ask it to name the check |

The last two pull opposite ways and cancel when both fire, which is the right
answer: a player who does both is at the default.

**The rung direction is the easy thing to get backwards, and this project got it
backwards first.** `ladder.yaml` numbers rungs 1 Orient (least help) to 5 Full
answer (most), while `signals.yaml`'s prose captions its sections "move up the
ladder (toward less help)". The words and the integers point opposite ways. The
first implementation read the prose and answered *"you take help you do not
need"* by prescribing more unrequested help.

### Why this is the only honest way to configure the skill

Nobody installs an instruction set that makes their AI less immediately helpful
without evidence that they need it — and self-report cannot supply that
evidence, because someone who folds to fluent wrong reasoning is not aware of it
at the time. The game supplies it instead: it wrote the argument, so it knows
the ground truth. Nothing in the path asks the player what they think of
themselves.

Nothing is transmitted. The measurement happens on the device, the block is
assembled on the device, and it moves only if the person copies it.

### A finding can be "not ready", and usually is

One run produces very few observations of the things that matter: NERVE only
fills on levels where the host was asked, and a mode hands out two host
lifelines. A threshold crossed on a denominator of two is noise wearing a
prescription's clothes.

So every finding carries its denominator, findings below their minimum are shown
as pending with the number still needed, and the prescription omits them. That
is also the only defensible reason for this product to want a second session,
and it is the opposite of a streak: it is a sample size, it is stated as one,
and nothing is lost by never returning.

## Content

The content is the product, and it is the risk. A bluff must clear two bars at
once: plausible enough to catch a smart, awake person, and fair enough that the
reveal lands as *"damn, got me"* rather than *"that's a gotcha"*. A bluff is a
**fallacy, not a wrong number** — a real constraint applied where it does not
bind, a stock confused with a flow, an average hiding a skew.

**The failure mode to design against is legibility.** Template-generated
rhetoric clears bar one and fails bar two within about thirty rounds, because
the player stops evaluating the argument and starts pattern-matching the
generator. Therefore: an authored core, with generation as variation rather than
as the engine, and every authoring pass reviewed by a reader whose only job is
to find a rule.

### One such rule is currently in the catalog

The reader checking the 繁體中文 localisation found it, which is a good argument
for that review existing: **honest arguments open by correcting an anchor far
more often than bluffs do.** "Anchor on people, not on shops." "The binding
constraint here is water, not appetite." "Count the cycle, not the crank." A
player who simply picks the option whose first sentence tells them where *not*
to anchor wins more rounds than they lose, without reading either argument to
the end.

Measured across the 56 rounds now shipped, that opener fronts 15 honest
arguments and 4 bluffs — but the aggregate hides the useful fact. Split by
band:

| band | honest opens correctively | bluff does | rounds |
| --- | --- | --- | --- |
| elementary | 0 | 1 | 13 |
| middle | 2 | 1 | 12 |
| high | 5 | 1 | 14 |
| university | 8 | 1 | 17 |

**簡單 is clean. 終極 carries almost all of it.** The expansion did not dilute
the tell evenly; it added two bands that never had it, and the university band
still opens eight honest arguments correctively against one bluff. So the fix
is smaller and better aimed than it looked: move the shape onto some
university-band bluffs — which are themselves wrong anchors, so it fits them
naturally — and off an equal number of honest openings there.

A second measurement bounds how much it currently costs. All 24 newly
localised rounds were put to blind readers who saw the question and the two
arguments with every answer stripped out — no verdict, no fallacy name, no
direction, and the flawed side alternating between the two labels. They got
24 of 24, and **none of them decided a round on wording**: 23 on domain
knowledge, 1 on arithmetic. Several named the corrective-opener asymmetry
unprompted and then went and did the arithmetic anyway — and in the
elementary band they kept finding it on the *sound* side, which is what the
table above says. A reader who knows the answers is not the player this game
is for, so this bounds the tell rather than clearing it.

It is not fixed here, and pretending otherwise would be worse than recording it.
The fix is to move that shape onto some bluffs — which are themselves wrong
anchors, so it fits them naturally — and off an equal number of honest openings,
in both languages. A secondary tell points the same way: the self-licensing
clause ("the only figure that is hard here", "the one part you can actually
measure") appears only in bluffs.

### Authoring with a model is allowed. Inference at runtime is not.

- **The shipped product performs no inference and requires no key.** Keep,
  absolutely. CI proves it.
- *The shipped content was authored without a model.* Never claimed, not worth
  claiming.

### The catalog is translated through core's i18n, per round

`CoreStrings.adversaryRounds` carries a `RoundText` per round id — question,
unit, source note, and both arguments and verdicts. `localizeRound` swaps those
and **nothing else**: the true value, the axis, the band, both directions and
the bluff's own figure stay canonical, because a board that depended on the
display language would deal the same person different questions in English and
繁體中文 (CLAUDE.md rule 6, asserted in `i18n.test.ts`).

English needs no overlay — the catalog is the English text — and a round a
language has not reached renders in English rather than as a hole, so the
catalog can be translated a few rounds at a time.

All 56 rounds now carry 繁體中文, pinned by `zh-catalog.test.ts`, which fails
the build on a missing round and on ten style and safety rules besides. Every
round has now been read twice: the first thirty when they were written, and
the twenty-six added with the school-band expansion in a second pass that read
twenty-four of them (two had already been read back when they were written) and
corrected twelve.

Two of the twelve were the same defect and it is worth naming, because it is a
process failure rather than a translation one. Three English verdicts were
rewritten — a blue whale cube-scaled to 320 t, a bathtub counted as 360
bottles that is 240, a tree of 720,000 sheets called 8,300 — *after* the
localisation batches had been dispatched against the old text. One of the
three was caught by its own batch's reviewer; the other two shipped stale, so
the Chinese reveal did arithmetic that no longer reached the answer the game
displays. **A content edit after a translation is dispatched desyncs the two
catalogs silently** — nothing in the type system or the tests can see it,
because both files are individually well-formed. The read-back is the only
thing that catches it.

The same pass found a factual error in the *English*: the Sun at 1.41 g/cm³
was described as lighter than water. It is not — that is Saturn. Fixed in both
languages.

The original spec said pushbacks would be **authored** independently per
language rather than translated, on the grounds that persuasiveness lives in
idiom. That remains the higher bar and is still true of the best version. What
ships is a careful localisation reviewed against the same two bars, which is an
honest description of the work actually done.

## Acceptance criteria

1. A run states its length, its lives and its ladder before the first question,
   and ends. No affordance anywhere offers one more question.
2. The option the host names when bluffing is the figure that bluff's own
   arithmetic reaches, on every round and at every tier. Asserted across the
   whole catalog.
3. Every option stays within a stated tolerance of the round's authored axis; a
   round that cannot produce a board at a tier is dropped from that tier's pool.
4. Options are uniformly spaced.
5. No lifeline is worth buying regardless of what the player knows: each has a
   knowledge level below which it wins and above which answering alone wins, and
   that crossover sits strictly inside (0, 1). This is the successor to the
   interval game's properness test and rests on the same obligation — a game you
   can beat teaches you to beat it.
6. The board, the plan, the bluff levels and every lifeline's output are
   deterministic in `(seed, tier)`. No `Date.now()` or `Math.random()` in core.
7. RELIANCE and NERVE are derived with no self-report anywhere in the path, and
   NERVE excludes levels where the instinct already matched the host's pick.
8. Every number on the record is recomputed from the stored levels, including
   the bank and its fallback.
9. No streak, no notification, no variable reward — a granted lifeline is
   **chosen**, never rolled — and no session that does not end.
10. No copy addresses the player rather than the plays. Every finding carries a
    numerator and a denominator, which is what makes that possible.
11. The app works fully offline with no key. CI's no-network grep still passes.

## Known limits, stated rather than discovered

- **Two board widths across four modes.** The `bluffSteps` knob has two usable
  values; the rest of the variation comes from the authored traps.
- **Sample size.** The findings that matter need several runs. The screen says
  so and shows exactly how many observations are missing.
- **Board width and school level are only correlated.** A university round with
  an obvious trap is a wide board in the hardest mode, and that is allowed.
- **The copied block contains the player's own tallies.** It is on screen in
  full, selectable, before anything is copied. That is informed consent rather
  than a solved problem.

## The risk this is being built despite

Calibration training transfers unevenly: people become well-calibrated on trivia
fairly quickly and it does not reliably carry into judgement about their own
work. This could end up a good game that improves trivia calibration and changes
nobody's review behaviour.

**NERVE is the counter-hypothesis** — it measures resistance to rhetorical
pressure rather than fact knowledge, and pressure-resistance plausibly transfers
better. That is a hope, not evidence, and it is the thing to watch first.

## Later, and deliberately not now

- **Round type B — The Chain.** A four-step derivation arriving at a number;
  exactly one step is wrong, or none are. You tap the step that breaks; tapping
  nothing is also a bet. Survives parameterisation best.
- **Round type C — Two Stories.** Two fluent explanations for the same real
  fact; one is the actual reason.
- New pushback prose at displacements the current catalog does not cover, which
  is what would give the four modes four genuinely distinct boards.
- A shareable artifact. Nothing in the ten principles forbids one — "no
  surveillance" bans telemetry, not a screenshot.
