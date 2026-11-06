---
title: "One of 46 component screenshots kept an older capture showing the Next.js dev badge."
mode: backend
createdAt: "2026-11-02T19:34:05Z"
source: proposed-plan
---

## Summary

One of 46 component screenshots kept an older capture showing the Next.js dev badge.

Disclosed at the approval gate: the built work differs from the plan here.

## What we found (2026-11-06)

- The dev badge was switched off in `next.config.ts` (`devIndicators: false`) on 2026-10-26.
- All 157 saved screenshots have been retaken since then. A corner-by-corner check of every screenshot found no badge, so the stale capture is already gone.
- Nothing stops the setting from being removed by accident later. Every scenario capture is taken from the dev server, so removing it would put the badge back into every new screenshot.

## Decision

The user chose to add a guard rather than close the plan as already fixed.

## Implementation

- Add `next.config.test.ts` at the project root. It imports the project's Next.js config and asserts that `devIndicators` is `false`, with a comment explaining why (scenario captures come from the dev server).
- No app source or UI changes. No screenshots need recapturing.

## Tests

- `next.config.test.ts`: "hides the Next.js dev badge so scenario captures stay clean". It fails if `devIndicators` is removed or set to anything other than `false`.
