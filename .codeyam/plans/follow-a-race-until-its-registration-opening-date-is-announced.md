---
title: "Follow a race until its registration opening date is announced"
mode: ui
createdAt: "2026-11-05T14:41:02Z"
source: proposed-plan
---

## Who benefits
Runners planning their season who want to enter a race the moment registration opens, especially popular races that sell out.

## Evidence
- obs-d57f8bac499d (More ways to sort the race list): only 4 seeded races had a registration-opens date, so sorting by opening date left most races grouped at the end.
- obs-352015877879 (Real registration-opening dates for every race): after researching every race, 17 of 24 organizers still had not published an opening date, so a runner still can't tell when to be ready.

## Smallest useful version
On a saved race with no announced opening date, show "Opening date not announced yet", plus what is known (for example, last year's opening date as a labelled hint). Show a "newly announced" badge in My Races when a date appears after the race was saved. This reuses the existing "changed since you saved" notice.

## Case against
It overlaps the deferred Reminders deliverable, which would notify rather than show a badge. Its value depends on someone rechecking organizer sites often enough to catch announcements, and today there is no automated refresh. Last year's date as a hint could mislead if organizers change their schedule.