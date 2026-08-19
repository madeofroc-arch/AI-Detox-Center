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

## The four modes

Stated in full before the first question — the ladder, the lives, the lifelines,
the fallback rung, and how often the host lies.

| | questions | lives | lifelines | locked at | the host |
| --- | --- | --- | --- | --- | --- |
| **Easy** | 8 | 3 | 5 | 4 | never lies |
| **Normal** | 10 | 2 | 5 | 4, 8 | lies a third of the time |
| **Hard** | 12 | 2 | 4 | 6 | lies half the time |
| **Ultimate** | 12 | 1 | 3 | 5 | lies half the time |

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

### What the modes actually vary, honestly

The tier sets how many option-slots separate the truth from the bluff's figure:
one slot is a wide board, two is a tight one (the step becomes the square root
of the displacement). Three is unavailable — it would force the true answer to
an end of the board on every round.

**So the four modes differ mainly by question pool, economy and how often the
host lies, rather than by four distinct option spacings.** The authored bluffs
support two. Widening that needs new pushback prose, not a new multiplier, and
that is a content project rather than a config change.

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

### Authoring with a model is allowed. Inference at runtime is not.

- **The shipped product performs no inference and requires no key.** Keep,
  absolutely. CI proves it.
- *The shipped content was authored without a model.* Never claimed, not worth
  claiming.

### 繁體中文 is a second authoring effort, not a translation

Questions, units and true values are portable. **Pushbacks and verdicts are
authored independently per language** against the same two bars, and are allowed
to differ in substance. This is a deliberate departure from CLAUDE.md rule 6 and
is limited to adversarial argument. The chrome is translated; the arguments are
not yet, and the mode screen says so.

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

- **Four modes, two board widths.** See above. Fixing it is a content project.
- **Sample size.** The findings that matter need several runs. The screen says
  so and shows exactly how many observations are missing.
- **Ultimate's pool skews easier on question difficulty** than its name
  suggests, because the rounds with the tightest boards are not the hardest
  questions. Its difficulty is the board, and the copy says so.
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
