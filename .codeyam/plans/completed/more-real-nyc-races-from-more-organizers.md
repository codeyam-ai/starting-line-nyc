---
title: "More real NYC races from more organizers"
mode: ui
createdAt: "2026-10-26T21:39:36Z"
order: 5
source: manual
---

## Summary

Grow the race list with more real NYC-area races researched from official organizer pages, so browsing has range across distances, boroughs, trails and entry methods.

## What the runner gets

- Roughly 15 more upcoming races from organizers beyond NYCRUNS (for example local running clubs, park conservancies and trail series), each with an official link, source and last-verified date.
- At least one each of lottery, time-qualifier, charity and membership entry, where real races use them.

## Key Decisions

- Research only from official pages; anything unconfirmed is left out and labelled, never guessed. Organizers whose sites block automated reading are noted in the README rather than filled in by hand-waving.
- Photos only when properly licensed (with credit); otherwise the distance tile. No invented course maps.
- Each annual edition stays separate.

## Implementation

- `prisma/race-data.json` (via the existing generator) and photo credits in `SiteFooter.tsx`.
- Check filters and the season preview still read well with the larger list.

## Scenarios

Home page with the larger list; a membership-entry race page; a charity-entry race page; a race with no photo.