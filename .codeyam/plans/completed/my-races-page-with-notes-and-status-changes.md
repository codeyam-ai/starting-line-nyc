---
title: "My Races page with notes and status changes"
mode: ui
createdAt: "2026-10-26T21:39:36Z"
order: 2
source: manual
dependsOn: ["save-races-on-this-device"]
---

## Summary

Add a My Races page listing the races a runner has saved, with each race's upcoming registration milestones and a private note.

## What the runner gets

- `/my-races`: saved races grouped by status (Signed up, Considering, Interested), soonest race first.
- Each race shows its next registration milestone with Add to calendar, weeks to train, and a link to its race page.
- A note field per race ("waiting on lottery email", "pace 2:05"), saved on the device.
- "Changed since you saved" highlight when a race's registration status differs from the status when it was saved.
- An empty state that points back to the race list.

## Key Decisions

- Builds on device-only saving; no accounts. Race facts come from the server by slug; saves and notes stay in the browser.
- A saved race that no longer exists shows a clear "no longer listed" row rather than disappearing.

## Implementation

- `app/my-races/page.tsx` plus an API route that returns race summaries for a list of slugs.
- `app/lib/savedRaces.ts`: store a note and the status-at-save per race.
- Header link to My Races.

## Scenarios

No saved races; several races across all three statuses; a race whose status changed since saving; a removed race; phone layout.