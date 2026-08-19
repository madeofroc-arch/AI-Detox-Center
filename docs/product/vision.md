# Vision

**Human Mode** is an open-source project about keeping your own judgement in a
world of fluent machines.

It ships two things:

- **The skill** — an installable instruction set for Claude, ChatGPT, Gemini and
  Codex that answers on a hint ladder instead of handing over finished work. It
  intervenes at the moment the outsourcing happens, inside the tool where it
  happens.
- **The Adversary** — a three-minute game where you commit to an answer, a
  confident opponent argues against it, and you win by knowing when to hold your
  ground.

> Fluency is not evidence.

## What changed, and why (2026-08-19)

The first version of this product was an AI-dependency tracker: a score, a
gate you opened before using AI, a daily challenge, ten screens. It was
abandoned after being built. Two structural reasons, both worth keeping written
down because they are easy to rebuild by accident:

**1. The spec treated being wanted as a hazard.** Of the ten binding
principles, five were prohibitions and none required the thing to be good to
use. `metrics.md` listed daily actives and session length as *anti*-metrics.
This document's success sentence was "opens this app less than they used to".
A product instructed not to be wanted was not wanted. That is not a design
failure downstream of the spec — it *was* the spec.

**2. The data source demanded more discipline than the discipline it trained.**
The dependency score was fed by self-reported gate visits. Logging one AI use
meant interrupting yourself, leaving the tool you were in, opening another app
and declaring an intention *before* doing the thing you wanted to do. Anyone who
can do that reliably does not need the product. The scoring engine was careful,
deterministic and well tested; it was attached to a stream that would be empty.

Five independent product directions were worked up and judged. All five killed
the same things: the app as a destination, the self-reported gate, the
dependency score, the daily-challenge format, and "detox" as the frame. All
five kept the skill. The current shape follows from that.

## The problem

AI produces fluent, confident, mostly-right output all day. The dangerous part
is not the volume — it is that **nothing in an ordinary day ever tells you that
you were fooled.** You approve the agent's PR, ship the memo with the unchecked
number, accept the explanation that sounded right. The feedback never arrives,
so the reflex never forms.

What atrophies is not "thinking" in the abstract. It is the specific muscle
that notices when a confident argument does not hold.

## The solution

**The skill** changes what you get while you work: a nudge instead of a patch,
descending to the full answer whenever you ask, instantly and without a lecture.
It leaves room for the thinking. It does not, and cannot, make you better at
catching a wrong answer.

**The Adversary** trains that directly. You state a belief precisely enough to
be wrong about it, something argues back, and then you find out — about the
answer *and* about the argument. It is a game because a game is a thing people
choose to do at 22:40 with a thumb over Instagram, and that is the only moment
this product can realistically compete for.

Specification: [adversary.md](adversary.md).

## Core principles (bind every skill, doc, and line of code)

1. The goal is not to eliminate AI.
2. **The goal is to keep your judgement.** Specifically: to notice when fluent,
   confident output is wrong. That is the failure that AI dependence actually
   produces, and it is the one worth training.
3. AI should augment human intelligence, not replace human thinking.
4. **The product must not need the user.** Success is measured by what a person
   can do when the product is not in front of them — never by how little they
   use it. Being wanted is not a hazard. What is banned is *extracted* return;
   *chosen* return is the goal.
5. Privacy comes before personalization.
6. Local-first by default.
7. **No shame-based design.** A number may measure a claim the person made; it
   may never measure the person.
8. **No manipulative engagement loops.** Four mechanics are banned by name.
9. No fear-based messaging.
10. The product should train a portable capability, not a dependence on itself.

### The rules attached to 4, 7 and 8

Principles 4, 7 and 8 previously existed as values, and as values they failed —
the built product satisfied all three and was still unusable. Each now carries a
rule that can be checked in review.

**Principle 4 — what replaced it and why.** The old wording was "the best
outcome is that users eventually need the app less". It was operationalised as
anti-metrics on opens per day and as a success sentence about using the product
less. That is a written instruction not to be wanted, and it is upstream of
everything that went wrong. Daily actives and session length are no longer sins.
They are also not goals: they are simply not the measurement.

**Principle 7 — the rule.** The subject of a number must be a claim, never a
person. "Of the bands you called 90% sure, 61% contained the answer" is legal:
its subject is a claim you made, it is actionable in one move (widen your
bands), and it is bounded to the game. "Your AI reliance is 61" was not: its
subject was how you live, and there was no move.

The built app already ran the experiment where careful copy protects a falling
number — band labels paired with an additive line that always resolves, a
largest-remainder apportionment so the rows reconcile with the dial — and it
still produced something that reads as a grade. Copy rules lose. This one is
architectural.

**Principle 8 — the four banned mechanics.** Naming them stops "engaging" being
read as "manipulative", which is the conflation that produced ten screens of
which three were read-only reports and the rest were forms:

1. **Variable reward schedules.** Payouts are deterministic and stated in
   advance.
2. **Loss aversion.** No streaks, no decay, no "you will lose X", no penalty for
   not returning.
3. **Notifications.** None. The product never initiates contact.
4. **Unbounded sessions.** A session announces its length before it starts and
   ends itself. There is no "one more".

A session people enjoy and choose to repeat is compliant. A session that will
not let them leave is not.

## What Human Mode is not

- Not a Screen Time blocker, an AI blocker, or an abstinence tool.
- Not a tracker. It never observes your AI usage, because it cannot do so
  honestly and the version that asked you to report it yourself did not work.
- Not a medical or clinical product; it makes no health claims.
- Not a habit product. There is no daily obligation and nothing to keep up.

## Naming

The product is **Human Mode**. "Detox" is retired from all user-facing copy: it
framed AI as a substance and the goal as abstinence, and neither is true of what
this now is.

The repository and plugin identifiers (`AI-Detox-Center`, `human-mode@ai-detox`)
are unchanged for now — renaming them breaks every install instruction in the
wild, and that is a separate migration with its own cost. Nothing user-facing
depends on them.

## Success, in one sentence

A player who, three months in, reads a confident paragraph and notices the step
that does not hold — in a pull request, a memo, or a model's output — without
thinking about this product at all.
