# User Flows

## F1 Onboarding
```
Launch (first run)
  -> Philosophy 1: "Not anti-AI"
  -> Philosophy 2: "Dependency is behavior, not time"
  -> Philosophy 3: "Your data stays on your device"
  -> (optional) Pick focus capabilities [skippable]
  -> Home
```
Re-entry: onboarding never shown again (flag in local settings).

## F2 AI Gate
```
Home -> [About to use AI]
  -> Intention: "What are you about to ask AI?" + category pick
  -> "Have you tried it yourself?"
       yes -> Outcome
       no  -> Offer attempt timer (3 min default)
               -> [Attempt] -> Outcome
               -> [Skip]    -> Outcome (recorded as immediate)
  -> Outcome: Solved myself | Proceeding to AI | Got a hint, thinking more
  -> (optional) one-line reflection
  -> Home (event recorded)
```
Rule: "Proceed to AI" is reachable from every gate step, styled as a normal
secondary action (never hidden, never guilt-labeled).

## F3 Daily Challenge
```
Home (today's challenge card)
  -> Challenge detail (instructions, duration, success condition)
  -> [Start] -> optional in-app work area (writing) or external work
  -> Mark outcome: Completed | Attempted | Skipped
  -> Reflection questions (optional, 2)
  -> Result: affirmation + XP + streak
  -> Home
```

## F4 Detox Session
```
Home -> Detox
  -> Pick duration (25/50/90) + intention (one line)
  -> Running (timer; pause/resume available)
  -> [Complete] or [End early]
  -> Neutral summary + optional reflection
  -> Home
```

## F5 Brain Report
```
Home (score dial) -> Brain Report
  -> Score + band explanation
  -> Factor breakdown (each factor: bar + plain-language sentence)
  -> "What this means" section + link to methodology (docs)
```

## F6 Progress
```
Tab/Home -> Progress
  -> This week: challenges done, independent attempts
  -> Capability spread (9 categories)
  -> Streak + XP + level (additive copy)
  -> History list
```

## F7 Settings & Privacy
```
Tab/Home -> Settings
  -> Focus capabilities
  -> Philosophy / About
  -> Privacy: Export data (JSON share) | Delete all data (double confirm)
  -> Reset scoring config to defaults
```

## Navigation model

Bottom tabs: **Home · Progress · Settings**. Gate, Detox, Challenge,
Reflection, Report are stack screens pushed from Home. Onboarding is a
one-time modal stack before tabs.
