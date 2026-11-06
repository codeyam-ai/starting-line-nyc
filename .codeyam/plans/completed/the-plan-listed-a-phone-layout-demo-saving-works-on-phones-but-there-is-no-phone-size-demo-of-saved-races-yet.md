---
title: "The plan listed a phone-layout demo; saving works on phones, but there is no phone-size demo of saved races yet."
mode: ui
createdAt: "2026-11-02T19:34:15Z"
source: proposed-plan
---

## Summary

The plan listed a phone-layout demo; saving works on phones, but there is no phone-size demo of saved races yet.

Disclosed at the approval gate: the built work differs from the plan here.

## Current state (checked 2026-11-06)

"My Races - Phone Layout" already shows the My Races page on a phone (added 2026-11-02,
after this plan was written). What is still missing is a phone-size demo of the act of
saving: the Save menu on a phone, and the race list with saved races marked on a phone.

## Implementation

No app code changes. Two new phone-size (Mobile) application scenarios:

1. **Race - Phone Save Menu Open** — `/races/nycruns-big-apple-half-marathon`, same seed as
   "Race - Phone Layout", with a click on Save so the menu (Interested / Considering /
   Signed up, plus the "saved on this device" note) is open on a phone-width screen.
2. **Home - Phone Races Saved** — `/?distance=any&when=12m`, same seed and browser storage
   as "Home - Races Saved On This Device" (three races saved as Signed up, Considering,
   Interested), shown at phone width so the saved markers on the race rows are visible.

If either capture shows a layout problem (menu clipped off-screen, saved marker wrapping
badly), report it at the demo rather than silently fixing it.

## Tests

Scenario captures only; no new unit tests, since no logic changes.
