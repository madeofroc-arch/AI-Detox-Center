# Screen Specifications

All screens: bg token background, 20pt gutters, single column. Every screen
lists its empty/error/loading state. Copy shown is canonical.

## 1. Onboarding (`/onboarding`)
- 3 swipeable panels + optional capability picker.
- Panel copy:
  1. "Human Mode is not anti-AI. It helps you use AI on purpose."
  2. "Dependency is behavior, not screen time. We look at how, not how much."
  3. "Your thinking data stays on your device. No account. No cloud."
- Capability picker: 9 tags, pick up to 3, "Skip" ghost button equally visible.
- CTA: primary "Begin". No loading/error states (fully local).

## 2. Home (`/`)
- Header: date + short greeting (time-of-day, neutral).
- ScoreDial card: Brain Score + caption "Tap to see why" -> Brain Report.
  When a band is shown here it must be paired with one additive line. That line
  MUST always resolve — a reducer-only version of it goes blank for exactly the
  users facing the highest band and the lowest headline, leaving a bare verdict
  for the people the rule exists to protect. Order: strongest reducer with any
  signal ("You handled 34% of these moments without AI."), else recent practice
  ("You practised on 3 of the last 7 days."), else the next concrete step ("One
  gate where you try first will start moving this."). A band label alone on the
  first screen reads as a verdict.
- Today's Challenge card: category tag, title, duration, difficulty dots,
  primary action "Open".
- Quick actions row: "AI Gate" and "Detox" secondary buttons.
- Empty (no events yet): dial shows "—" with caption "Your score appears
  after your first few gates and challenges."
- Loading: skeleton cards. Error: ErrorState card with retry (storage read).

## 3. AI Gate (`/gate`)
- Step 1: TextArea "What are you about to ask AI?" (optional but encouraged),
  category select (9 usage categories as tags).
- Step 2: "Have you tried it yourself yet?" — buttons: "Yes, I tried" /
  "Not yet". If "Not yet": attempt timer card (3:00, start/skip).
- Step 3 outcome: three equal buttons: "Solved it myself" / "Got a hint,
  thinking more" / "Proceeding to AI". All same visual weight.
- Confirmation: one quiet line ("Noted. Nice pause.") then auto-return.
- Error: storage write failure -> ErrorState with retry; event kept in memory.

## 4. Detox Session (`/detox`)
- Setup: duration segmented control (25/50/90), intention input, "Begin".
- Running: TimerDisplay, intention shown, ghost "Pause", secondary "End session".
- End: summary line ("52 focused minutes." / "18 minutes — noted.") +
  optional reflection link. Identical layout for complete vs early end.

## 5. Daily Challenge (`/challenge`)
- Category tag + difficulty dots (1-5) + duration.
- Title (title type), instructions (body), success condition in a
  surfaceAlt well.
- Writing-type challenges: TextArea work area (local only, autosaved).
- Actions: primary "Mark outcome" -> sheet: Completed / Attempted / Skipped
  (equal styling; no crown on Completed).

## 6. Challenge Result (`/challenge/result`)
- Quiet affirmation by outcome:
  - Completed: "Good thinking. That was all you."
  - Attempted: "You showed up and tried. That counts."
  - Skipped: "Skipped today. Tomorrow brings a new one."
- XP line ("+30 XP · Creativity"), streak line (additive only).
- CTA: ghost "Add a reflection", primary "Done".

## 7. Reflection (`/reflection`)
- Context line (which challenge/gate/detox).
- 2 prompt questions (from core catalog), one TextArea each, both optional.
- "Save" primary; "Skip" ghost. Footer note: "Reflections never leave your
  device."

## 8. Brain Report (`/report`)
- ScoreDial large + band label: Mostly your own / Balanced / Leaning on AI /
  Running on AI (calm wording, no colors-of-doom; all bands in ink/accent).
  The bottom band describes behavior rather than claiming an identity — an
  identity compliment there makes losing it feel like demotion when a score
  sharpens (see ADR-0005).
  Band anchors are about the AMOUNT of outsourced thinking, not only its
  pattern (ADR-0006): "Mostly your own" is little dependent behavior of any
  kind; "Balanced" is some, most days; "Leaning on AI" is a whole task handed
  over most days; "Running on AI" is several a day, never attempted first.
  Handing over one task a day is Leaning, not Running — the pattern is total
  but the amount is not, and someone doing it eight times a day is doing eight
  times as much of it.
- FactorBar list: each factor with plain sentence, e.g. "Delegation — 3 of
  12 uses this week handed the whole task to AI."
- "How this is calculated" -> methodology text derived from core config. It must
  state what the formula actually does: factors add up to reliance, and the
  lowering factors discount that reliance by at most `reducerMaxDiscount`,
  never erase it. The factor numbers add up to the score on the dial in
  unrounded points; the UI rounds each row, so the copy must not promise the
  displayed integers reconcile exactly.
- Empty: "Not enough data yet — the report unlocks after about N recorded uses"
  where N is `minEventsForScore` read from config (never hardcoded in copy).

## 9. Progress (`/progress`)
- Week summary card: challenges + independent attempts (additive copy).
- Capability spread: 9 rows with small ProgressBars.
- Streak card: "Active streak: N days · Total active days: M". A gap shows
  as "Streak paused" — never "lost".
- History: reverse-chron ListItems merging challenge attempts, resolved AI
  Gate sessions, and ended detox sessions. Each row: glyph (challenge ◆ /
  gate ◈ / detox ◉) + kind in words (never glyph-only meaning) + one-line
  title + relative day (Today / Yesterday / Mon, 18 Aug). Capped at the 20
  most recent — a record to glance at, never an infinite feed.
  Ordering: gates and detox sessions carry real timestamps; challenges record
  only a day, so they sort at end-of-day rather than implying a precision we
  do not have. In-flight records (unresolved gate, running detox) are omitted
  until they end.
  Row copy is neutral by construction: "Skipped · Writing", "Went to AI ·
  Do it for me", "18 focused minutes · ended early".
- Empty: invitation copy per section; history empty reads "Moments you record
  — challenges, gates, detox sessions — collect here." 

## 10. Settings (`/settings`)
- Sections: Focus (capability tags) · About (philosophy summary, version,
  license, link to repo) · Data & Privacy.
- Data & Privacy: "Export my data" (JSON via share sheet/download) ·
  "Delete all data" (danger button, double confirm modal: "This erases
  everything on this device. There is no cloud copy.") · "Reset scoring
  config".
