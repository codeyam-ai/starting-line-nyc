---
title: "Show official source links and last-verified dates, label unknown or tentative dates, and keep each annual edition separate"
mode: backend
createdAt: "2026-10-27T14:57:42Z"
source: proposed-plan
---

## Summary

Show official source links and last-verified dates, label unknown or tentative dates, and keep each annual edition separate

This was deferred from the project's deliverables in an earlier build cycle. Investigate the current code before planning the implementation.
## What already exists

- Race pages show a Sources panel with the official link and "last checked" date for the edition.
- Tentative race days and milestones show "(tentative)"; untimed dates show the day only; an unpublished opening date shows "Opening date not announced".
- Each annual race is its own edition record, and Key dates says "For the <year> race only".

## What this round adds (user picked all four on 2026-11-04)

1. **Flag old checks.** When an edition was last checked more than 30 days ago (or never), the race page's Sources panel and the race's row in the list / My Races show "May be out of date — last checked <date>. Confirm on the official site."
2. **Checked date everywhere.** Race list rows (home and My Races) show a small "Checked <date> · <source host>" line under the race identity.
3. **Source per key date.** Registration milestones gain an optional official link and last-checked date. Each Key dates entry shows "Source: <host> · checked <date>"; when a milestone has no own source it falls back to the edition's source and checked date. Race day uses the edition source.
4. **Keep past years visible.** When no upcoming edition exists but a past one does, the race page shows "The <year> race is over" with that edition's key dates marked past, its source, and "<next year> not announced yet — check the organizer", instead of the plain empty state. My Races keeps saying the race has no upcoming date.

## Implementation

- `prisma/schema.prisma`: `RegistrationMilestone.sourceUrl String?`, `RegistrationMilestone.lastVerifiedAt DateTime?` (nullable, no data invented; existing data keeps falling back to the edition).
- `app/lib/raceList.ts`: `latestPastEdition(editions, now)`; `isStale(lastVerifiedAt, now, days = 30)`; list items carry `sourceUrl`, `lastVerifiedAt`.
- `app/lib/raceDetail.ts`: timeline entries carry their resolved `sourceUrl` / `lastVerifiedAt` (own, else edition's).
- `app/lib/races.ts`: `findRaceDetail` returns `pastEdition` + its timeline when no upcoming edition.
- Components: `SourcesPanel` (stale warning), `TimelineItem` (per-date source line), new `VerifiedLine` on `RaceRow`, new `PastEditionNotice` replacing `NoUpcomingEdition` when a past edition exists.

## Tests

- `isStale`: never checked → stale; 29 days → fresh; exactly 30 days → fresh; 31 days → stale.
- `latestPastEdition`: picks the most recent past year; null when an upcoming edition exists.
- Timeline source fallback: milestone with own source keeps it; without falls back to the edition's.
- Scenarios: race page with stale check, race page with per-date sources, race page after race day (past edition), home list rows with checked line and stale flag.
