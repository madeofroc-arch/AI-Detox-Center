# ADR-0001: TypeScript + Expo (React Native + Web)

Status: Accepted · Date: 2026-08-18

## Context

We need one codebase that ships to Android, iOS, and web; is approachable for
open-source contributors; and runs on maintainers' machines without platform
lock-in (primary dev machine is Windows, so Mac-only toolchains are out).

## Decision

TypeScript everywhere. Expo (managed workflow) with expo-router for the app;
react-native-web gives a web target from the same code. Domain logic lives in
a separate pure-TS package (see ADR-0002), so the UI framework choice remains
replaceable.

## Alternatives considered

- **Web-first PWA (Vite/Next)**: fastest DX, but weak fit for the on-phone
  AI-usage moments the product targets; would demand a second codebase later.
- **Flutter**: strong cross-platform, but Dart shrinks the OSS contributor
  pool relative to TS and forecloses sharing the domain layer with future
  web/extension surfaces.
- **Native (Swift/Kotlin)**: two codebases; out of budget for an OSS MVP.

## Consequences

- One TS skill-set spans core, app, and future browser extension.
- Windows-friendly development (Expo Go + web) without a Mac; iOS builds via
  EAS when needed.
- We accept Expo SDK upgrade churn as maintenance cost.
