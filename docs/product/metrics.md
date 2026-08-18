# Product Metrics

Success metrics must match the philosophy: we measure growing independence,
not growing engagement.

## North-star

**Independent Attempt Rate** — share of AI-usage events where the user
attempted first (self-reported via gate/tracking). Success = trending up.

This is deliberately the most responsive lever in the dependency score: it has
exactly one home in the model (`lackOfAttempt`) and carries the largest single
weight alongside delegation. Sweeping it from 0% to 100% moves the score by more
than a band. See [ADR-0005](../architecture/adr/0005-dependency-score-recalibration.md).

## Supporting metrics (all computed locally, shown to the user)

- AI Dependency Score trend (down or stable-low = healthy)
- Factor mix: delegation and reassurance shrinking as a share of usage
- Challenge completion consistency (weekly active practice, not daily guilt)
- Capability spread: number of categories practiced per month
- Reflection rate: share of sessions with a reflection attached — an awareness
  signal, never a proxy for independence. Its authority in the score is capped
  precisely so that logging reflections cannot buy a better band.

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
