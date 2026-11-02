# Extraction plan — My Races page (step 11 Deconstruct)

Sources: app/my-races/page.tsx, app/components/MyRacesList.tsx (3 components + logic),
app/lib/savedRaces.ts, app/lib/races.ts, app/api/races/summaries/route.ts.

## Page
1. **MyRacesHeader** (component) — page.tsx `<div className="mr-head">` h1 + "Saved on this device only" line
   → app/components/MyRacesHeader.tsx. Page becomes PageShell/SiteHeader/<main>/MyRacesHeader/TimezoneNote/MyRacesList/SiteFooter.
   (`<main>` wrapper stays, matching app/page.tsx / races page convention.)

## Components out of MyRacesList.tsx (one per file)
2. **MyRacesLoading** (component) — the two `<p className="mr-loading">` messages (loading / couldn't load)
   → app/components/MyRacesLoading.tsx, prop `failed?: boolean`.
3. **MyRacesEmpty** (component) — "No saved races yet." empty state (lines ~62-73)
   → app/components/MyRacesEmpty.tsx.
4. **SavedRaceGroup** (component) — `<section className="mr-group">` per status
   → app/components/SavedRaceGroup.tsx, props: status, items.
5. **SavedRaceGroupHeading** (component) — h2 label + "N races" count
   → app/components/SavedRaceGroupHeading.tsx.
6. **SavedRaceItem** (component) — dispatches listed vs gone → app/components/SavedRaceItem.tsx.
7. **GoneRaceNotice** (component) — "no upcoming date" / "no longer listed" + Remove button
   → app/components/GoneRaceNotice.tsx.
8. **RegistrationChanged** (component) — "Changed since you saved" line
   → app/components/RegistrationChanged.tsx.
9. **RaceNote** (component) — note textarea + storage-failure message → app/components/RaceNote.tsx.
10. **Reuse RaceRow** — SavedRaceItem's listed row duplicates RaceRow exactly except
    `alwaysOfferCalendar`. Add optional `alwaysOfferCalendar` prop to RaceRow
    (app/components/RaceRow.tsx) and drop the duplicate JSX.

## Pure functions → app/lib/myRaces.ts (+ app/lib/myRaces.test.ts)
11. **groupSavedRaces(saved, summaries)** — GROUP_ORDER filter + raceDay sort → ordered, non-empty groups.
12. **raceDay(summary)** — sort key (Infinity for unlisted / undated).
13. **goneRaceName(slug, saved, summary)** + **goneRaceMessage(state)** — name/message choice for unlisted rows.
14. **registrationChange(saved, race)** — `{from, to}` labels or null (uses STATUS_LABELS).
15. **raceCountLabel**-style "1 race / N races" → `savedCountLabel(n)`.
16. **summariesUrl(slugKey)** + **parseSummariesSlugs(param, max)** — URL build (client) and
    the route's split/trim/dedup/cap (route.ts) → testable; route keeps only request/response.

## Hooks
17. **useSavedRaces()** → app/lib/useSavedRaces.ts — useSyncExternalStore + parse (undefined until hydrated).
18. **useRaceSummaries(slugKey)** → app/lib/useRaceSummaries.ts — fetch effect, merge, failed flag.

## Tests for functions already added in the prototype
19. savedRaces.test.ts: withNote, nameFromSlug, withSaveStatus `info` (name, registrationAtSave kept on status change), parse of new fields.
20. NextDeadline `alwaysOfferCalendar`, SiteHeader `active` — covered by scenarios.

## Scenario gaps to add during extraction
- no-upcoming / not-listed race rows, loading & failed-fetch states (isolated-component scenarios), phone recapture.

## Deletions: none (MyRacesList.tsx stays as the composer; `noStorageSnapshot` local dup moves into useSavedRaces).
