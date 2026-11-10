---
title: "Code that joins tested pieces together has no test of its own"
mode: backend
createdAt: "2026-11-10T17:29:29Z"
source: proposed-plan
---

## Root cause
The project tests pure helpers in app/lib thoroughly, but the thin layers that call them, an API route and a component effect, have no test that exercises the call. A wrong argument, a missing await or a dropped header in that glue would pass the whole suite.

## Evidence
- fnd-19427ceb0f91 / fnd-ea3951fd8e4f (Reminder presets, 2026-11-09): no test calls the calendar route end to end. The route is app/api/races/[slug]/calendar/route.ts:20 and no *.test.* file under app/api exists on HEAD.
- fnd-240dba60a77b (Changed since you saved, 2026-11-06): the My Races list records starting registration statuses on load at app/components/MyRacesList.tsx:21-22 (recordRegistrationBaselines), and no test renders MyRacesList to show it happens.

## Smallest fix
Add one route test that calls the calendar GET with a seeded race and a reminder preset and asserts the .ics body and headers, and one component test that renders MyRacesList with summaries and asserts recordRegistrationBaselines stored the statuses.

## Cost of leaving it
The calendar download and the 'changed since you saved' notice can break silently on a refactor of either side; only a manual check or a screenshot would catch it, and the calendar file is not screenshotted at all.