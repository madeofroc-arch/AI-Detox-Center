# Product Metrics

Success metrics must match the philosophy: we measure growing independence,
not growing engagement.

## North-star

**Independent Attempt Rate** — share of AI-usage events where the user
attempted first (self-reported via gate/tracking). Success = trending up.

This is deliberately one of the most responsive levers in the dependency score:
it has exactly one home in the model (`lackOfAttempt`) and carries the largest
single weight alongside delegation. How far it moves the score depends on how
much AI use there is to attempt first — the factor counts acts per day, so a
light user has less of it to move. See
[ADR-0006](../architecture/adr/0006-score-counts-dependent-acts-not-shares.md).

## Supporting metrics (all computed locally, shown to the user)

- AI Dependency Score trend (down or stable-low = healthy)
- Factor mix: delegation and reassurance shrinking as a share of usage
- Challenge completion consistency (weekly active practice, not daily guilt)
- Capability spread: number of categories practiced per month
- Reflection rate: share of sessions with a reflection attached — an awareness
  signal, never a proxy for independence. Its authority in the score is bounded
  to a small fraction of a band width, so logging reflections cannot
  meaningfully improve the number. It is deliberately *not* claimed that it can
  never cross a cut point: any factor with non-zero influence can, if the user
  happens to be standing on one, and asserting otherwise once produced a test
  that passed while the property was false.

## Anti-metrics (we explicitly do NOT optimize these)

- Daily active users / session length / opens per day
- Streak length maximization
- Notification click-through (no notifications in MVP)

A change that improves engagement numbers but worsens the north-star is a
regression. The healthiest cohort may use the app *less* over time — the
product must report that as success (see J6 in user-journeys.md).

## Instrumentation policy

All metrics are computed on-device from local data and displayed to the
user. No metric leaves the device. There is no analytics backend.
