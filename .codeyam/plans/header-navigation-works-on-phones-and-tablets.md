---
title: "Header navigation works on phones and tablets"
mode: ui
createdAt: "2026-11-10T22:49:07Z"
source: manual
---

## Summary

Below 1050px wide (tablets and phones), `app/globals.css` hides the whole header nav (`.bar nav { display: none; }`, around line 277). Only the logo, My Races and the account links remain, so **Deadlines** and **How entry works** can't be reached on a phone at all. On desktop, the nav never shows that you're on Deadlines: the home page always underlines "Races", even on the all-races-by-deadline view the Deadlines link opens. Each page also builds the Deadlines link by hand, and they don't match: My Races adds `&sort=deadline`, race pages don't. Give the header a compact menu on small screens, and mark Deadlines as the current page when it is.

## Key decisions

- **A "Menu" disclosure built on `<details>`/`<summary>`** below 1050px, listing Races, Deadlines, My Races and How entry works. It works without JavaScript, like the rest of the site (filters and sort are plain links), and needs no client component.
- **"Deadlines" is a view of the home page, not a separate page.** It's active when the filters are any distance, any time and sorted by next deadline. A pure helper in `app/lib/filters.ts` decides this, so it can be unit-tested and the home page can pass `active="deadlines"`.
- **One source for the Deadlines URL.** `app/my-races/page.tsx`, `app/races/[slug]/page.tsx` and `app/races/[slug]/not-found.tsx` each hardcode a string. Replace them with a shared constant built through `filterHref`, so they can't drift apart again.
- Sequencing: the plans *Sign up and log in with free accounts* and *How entry works page* also touch `SiteHeader.tsx` (the right-hand account links and the How entry works href). This plan only touches the nav list and active state, so any order works. The menu just has to include whatever links exist when it lands.

## Implementation

### 1. Deadlines helpers

**File**: `app/lib/filters.ts`. Add `isDeadlinesView(filters)` and a `DEADLINES_HREF` constant (via `filterHref(DEFAULT_FILTERS, { distance: 'any', when: 'any', sort: 'deadline' })`).

### 2. Header

**File**: `app/components/SiteHeader.tsx`. `active` gains `'deadlines'`. Add the small-screen menu. Make the `deadlinesHref` prop optional, defaulting to `DEADLINES_HREF`. The home page still passes its filter-preserving version.

**File**: `app/page.tsx`. Pass `active={isDeadlinesView(filters) ? 'deadlines' : 'races'}`.

**Files**: `app/my-races/page.tsx`, `app/races/[slug]/page.tsx`, `app/races/[slug]/not-found.tsx`. Drop the hardcoded Deadlines strings.

### 3. Styles

**File**: `app/globals.css`. Show the menu button only at 1050px and below. Style the open panel to match the `.bar` look, and keep the 560px rules for the right-hand links.

## Reused existing code

- `filterHref`, `DEFAULT_FILTERS`, `parseFilters` from `app/lib/filters.ts` (tested in `app/lib/filters.test.ts`)
- `SiteHeader` from `app/components/SiteHeader.tsx` (glossary entry: `SiteHeader`)

## Reproduction test

The nav never marks Deadlines as the current page, because nothing can tell when the home page is showing the Deadlines view.

**Target**: `app/lib/filters.test.ts`, run with `codeyam-editor editor refresh-tests --test isDeadlinesView`.

```ts
// The Deadlines nav link is current exactly when the list shows every race by next deadline.
it('recognises the Deadlines view', () => {
  expect(isDeadlinesView(parseFilters({ distance: 'any', when: 'any' }))).toBe(true);
  expect(isDeadlinesView(DEFAULT_FILTERS)).toBe(false);
});
```

Status: PROPOSED, confirm red at execution. Expected failure: `isDeadlinesView` is not exported from `app/lib/filters.ts`, so the call throws a TypeError.

## Scenarios to demonstrate

- Phone width with the menu closed, then open
- Tablet width (about 900px) with the menu open
- Desktop home page on the Deadlines view with Deadlines underlined
- Desktop race detail page (Races underlined, Deadlines link goes to the shared URL)