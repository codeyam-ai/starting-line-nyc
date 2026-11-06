---
title: "Races saved before this update never show the "changed since you saved" note, because their registration status at save time was not recorded."
mode: backend
createdAt: "2026-11-02T19:34:03Z"
source: proposed-plan
---

## Summary

Races saved before this update never show the "changed since you saved" note, because their registration status at save time was not recorded.

At the approval gate for "My Races page with notes and status changes" the user approved the built work past this gap: it differs from what the plan asked for. Built from plan `my-races-page-with-notes-and-status-changes` (now at `.codeyam/plans/completed/my-races-page-with-notes-and-status-changes.md`).

You now have a My Races page that gathers every race you've saved, with your own notes and a heads-up when a race changes.

## What you can now do
- Open **My Races** from the header to see all your saved races in one place, grouped by upcoming and past
- Add or edit a personal note on any saved race
- Spot races whose date or status changed since you saved them
- See a clear notice and remove a race that's no longer listed

Read that plan and the code it changed before planning how to close the gap.
## Proposed approach

We can't recover what a race's registration status really was on the day an older save happened, and we won't guess. Instead, the first time My Races sees an older save, it records the race's current status as a starting point. After that, any change shows the "Changed since you saved" note, just as it does for newer saves.

1. **Start tracking older saves.** `app/lib/savedRaces.ts`: add a pure `withRegistrationBaseline(saved, statuses)` function that fills in `registrationAtSave` only for saved races that have none. It never overwrites a value that is already recorded. Add a `recordRegistrationBaselines(statuses)` function that writes to storage only when something changed, so it can't loop.
2. **Fill gaps on re-save.** `withSaveStatus`: when an older save gets a new status, use `prev.registrationAtSave ?? info.registrationStatus` so that changing the status also starts tracking.
3. **Hook it up.** When the My Races summaries load (`app/lib/useRaceSummaries.ts` or the My Races page), call `recordRegistrationBaselines` with the current status of each listed race. Races that are unlisted or have no upcoming date are skipped.
4. **Limitation:** the note can't appear for changes that happened before the starting point was recorded. It appears for any change after that.

## Tests
- Unit: `withRegistrationBaseline` fills only missing entries, keeps existing ones, ignores unknown slugs, and returns the same object when nothing changes.
- Unit: `withSaveStatus` fills a missing `registrationAtSave` when an older save changes status.
