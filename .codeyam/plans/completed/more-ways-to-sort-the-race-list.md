---
title: "More ways to sort the race list"
mode: ui
createdAt: "2026-10-26T21:39:36Z"
order: 6
source: manual
---

## Summary

Let runners sort the race list by race date, registration opening date, entry deadline or distance, not just "next deadline" and "race day".

## What the runner gets

- The sort toggle on the home page offers: Next deadline (default), Race day, Registration opens, Distance.
- Races with no date for the chosen sort (for example, registration opening not announced) go last, with their "not announced" label still showing.
- The chosen sort survives searching and filtering, and is kept in the URL so a link reproduces the same list.

## Key Decisions

- Sorting stays server-side in the existing GET form, so it works without JavaScript.
- Ties break by race date, then name, so the order is stable.

## Implementation

- `app/lib/filters.ts`: add the new sort values and parse them from the URL.
- `app/lib/raceList.ts`: comparators for registration opening and distance, with unknown dates last.
- `app/components/SortToggle.tsx`: show the four options; keep it readable at phone width.

## Scenarios

Sorted by registration opening (with an unannounced race last); sorted by distance; phone layout of the sort control.