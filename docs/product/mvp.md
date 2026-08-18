# MVP Scope

The first shippable version. Under-build rather than over-build.

## In scope (10 features)

| # | Feature | Acceptance criteria |
| --- | --- | --- |
| 1 | Onboarding | 3 philosophy screens + optional focus pick; lands on Home; no account, no network |
| 2 | AI Dependency Score | Deterministic score 0-100 from usage events with per-factor breakdown; configurable weights; unit-tested |
| 3 | AI Gate | Self-directed gate flow: intention -> attempt-first (skippable) -> outcome; emits usage events; never blocks |
| 4 | Detox Timer | Start/pause/resume/end session with intention; neutral recording of early end |
| 5 | Daily Human Challenge | One deterministic challenge per day across 9 categories; adaptive difficulty; catalog of 27+ |
| 6 | Reflection | Optional short reflections attached to gate/challenge/detox; stored locally only |
| 7 | Progress Dashboard | Challenge history, capability spread, streak, XP; additive framing |
| 8 | Local data storage | All data in on-device storage; schema versioned with migration hook |
| 9 | Settings | Focus capabilities, scoring config reset, about/philosophy |
| 10 | Privacy controls | Data export (JSON) and full deletion, both user-triggered |

## Explicitly out of scope for MVP

- Social leaderboards, friends, public profiles
- NFT / tokens / web3 anything
- Ads
- AI chatbot inside the app
- Complex backend; any backend at all
- Account system / login
- OS-level AI-app interception (post-MVP research)
- Notifications (post-MVP; must be non-manipulative if ever added)

## MVP quality bar

- Core (`packages/core`) fully works without network and without any LLM API.
- Lint + typecheck + unit tests + build green in CI.
- All 10 screens navigable end-to-end on web and native.
