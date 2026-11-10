---
title: "Back link returns you to where you came from"
mode: ui
createdAt: "2026-11-10T22:49:07Z"
source: manual
---

## Summary

Every race page's back link is hardcoded to "← All races" pointing to `/` (`app/races/[slug]/page.tsx` line 44, `BackLink`). Going to `/` resets the search to the defaults (half marathons, next 6 months). A runner who searched for trail 10Ks, opened a race and pressed back loses their search. A runner who opened a race from **My Races** gets sent to the home page instead of back to My Races. The back link should return the runner to where they came from, labelled to match.

## Key decisions

- **Carry the origin in the race link (`?from=`), not the browser's Referer header.** Referer is dropped by privacy settings and isn't available to a cached render. A query parameter works without JavaScript and survives a reload. Home-page rows link to `/races/<slug>?from=<the current filter query>`, and My Races rows link with `?from=my-races`.
- **Never trust `from` as a URL.** A pure helper `backLinkFor(from)` in `app/lib/raceDetail.ts` accepts only `my-races` or a filter query. It runs the query through `parseFilters` → `filterHref`, so it can only ever produce a link to the home page or `/my-races` (no open redirect). Anything else falls back to "All races" / `/`.
- **Labels:** "← My Races"; "← Back to results" for a filtered search; "← All races" as the fallback.
- Add a canonical URL in the race page metadata (`/races/<slug>`), so `?from=` variants aren't treated as duplicate pages.

## Implementation

### 1. Helper

**File**: `app/lib/raceDetail.ts`. Add `backLinkFor(from: string | undefined): { href: string; label: string }`.

### 2. Links into a race carry their origin

**File**: `app/components/RaceRow.tsx`. Take an optional `from` and append it to the `/races/${race.slug}` href passed to `RaceIdentity`.

**Files**: `app/components/RaceList.tsx` (pass the filters as a query via `filterHref`), and the My Races list path (`app/components/MyRacesList.tsx` / `app/components/SavedRaceItem.tsx`, whichever renders `RaceRow` or `RaceIdentity`) to pass `my-races`.

### 3. Race page

**File**: `app/races/[slug]/page.tsx`. Read `searchParams.from` and render `BackLink` with `backLinkFor(from)`. Add the canonical URL to metadata.

## Reused existing code

- `BackLink` from `app/components/BackLink.tsx` (glossary entry: `BackLink`)
- `parseFilters`, `filterHref` from `app/lib/filters.ts`
- `RaceIdentity` from `app/components/RaceIdentity.tsx`

## Reproduction test

A race opened from My Races offers a way back to the home page, not to My Races.

**Target**: `app/lib/raceDetail.test.ts`, run with `codeyam-editor editor refresh-tests --test backLinkFor`.

```ts
// A runner who opened a race from My Races is offered a way back to My Races, and a hostile "from" can't leave the site.
it('links back to where the race was opened from', () => {
  expect(backLinkFor('my-races')).toEqual({ href: '/my-races', label: 'My Races' });
  expect(backLinkFor('https://evil.example')).toEqual({ href: '/', label: 'All races' });
});
```

Status: PROPOSED, confirm red at execution. Expected failure: `backLinkFor` is not exported from `app/lib/raceDetail.ts`, so the call throws a TypeError.

## Scenarios to demonstrate

- Race opened from a filtered search (trail, 10K): back link reads "Back to results" and restores the search
- Race opened from My Races: back link reads "My Races"
- Race opened directly (shared link, no `from`): "All races"
- A tampered `from` value: falls back to "All races"