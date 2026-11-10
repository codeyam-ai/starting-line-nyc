---
title: "No dead ends: every page and link lands somewhere useful"
mode: ui
createdAt: "2026-11-10T22:49:24Z"
source: manual
---

## Summary

Three places leave a runner stuck:

1. **Any mistyped or old URL** (for example `https://startinglinenyc.com/nope`, checked live: it returns 404 with the title "404: This page could not be found.") shows Next.js's bare default page. It has no header, no footer and no way back. Only unknown race slugs get the friendly `app/races/[slug]/not-found.tsx`.
2. That friendly race 404 (`app/components/RaceNotFound.tsx`) says "tell us about one we're missing", but nothing on it is a link.
3. The dashed **"More filters"** chip (`app/components/FilterChips.tsx` line 27) only jumps to the search box above it (`href="#q"`). It offers no extra filters.

Make every one of these land somewhere useful.

## Key decisions

- **A root `app/not-found.tsx`**, not `global-not-found.js`. The app has a single root layout, so the regular convention covers unmatched URLs and keeps the layout and `globals.css` (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`). It uses the same shell as the race 404: `PageShell`, `SiteHeader`, a short "We couldn't find that page" message with "Show all races" and "My Races" buttons, and `SiteFooter`.
- **"Tell us about a missing race" opens a prefilled GitHub issue**, matching the existing "Report an issue" link on race pages (`reportIssueUrl` / `REPO_URL` in `app/lib/raceDetail.ts`). Add a sibling helper `missingRaceIssueUrl()` with the `race-data` label.
- **Remove the "More filters" chip.** The search form with distance, time and terrain sits directly above the toolbar, so the chip duplicates it while promising filters that don't exist. Removing it also takes care of the queued stub plan `save-log-in-sign-up-and-more-filters-do-not-work-yet-there-are-no-accounts-and-the-page-says-so.md`'s More filters item. If real extra filters (price, borough) are wanted later, that's a new feature plan.
- Dev-only routes (`app/isolated-components/**`, `app/scenario/[slug]`) are already blocked in production (both call `notFound()` when `NODE_ENV === 'production'`; checked live, both 404). No change is needed, and they'll show the new not-found page.

## Implementation

### 1. Site-wide not-found page

**New file**: `app/not-found.tsx`, which reuses `PageShell`, `SiteHeader`, `SiteFooter` and the `.empty` styles that `RaceNotFound` uses.

### 2. Wire the "tell us" promise

**File**: `app/lib/raceDetail.ts`. Add `missingRaceIssueUrl()` next to `reportIssueUrl`.

**File**: `app/components/RaceNotFound.tsx`. Turn "tell us about one we're missing" into a link (new tab, `noopener`) to that URL.

### 3. Drop the dead chip

**File**: `app/components/FilterChips.tsx`. Remove the "More filters" anchor.

**File**: `app/globals.css`. Remove the unused `.chip.more` rule (line 80).

## Reused existing code

- `reportIssueUrl`, `REPO_URL` from `app/lib/raceDetail.ts` (tested in `app/lib/raceDetail.test.ts`)
- `RaceNotFound` from `app/components/RaceNotFound.tsx`, and `NotFound` from `app/races/[slug]/not-found.tsx` as the layout model
- `PageShell`, `SiteHeader`, `SiteFooter`

## Reproduction test

Routing and visual dead ends, with no isolatable unit repro for the missing 404 page or the dead chip. Demonstrate them with the scenarios below. `missingRaceIssueUrl` gets a normal unit test next to the existing `reportIssueUrl` tests.

## Scenarios to demonstrate

- An unknown URL (`/nope`) shows the site 404 with header, footer and both buttons
- An unknown race (`/races/not-a-race`) shows the race 404 with a working "tell us" link
- The home page toolbar without the More filters chip (default filters, and with status chips on)