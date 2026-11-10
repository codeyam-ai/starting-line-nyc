---
title: "Saved races follow your account across devices"
mode: ui
createdAt: "2026-11-10T22:48:39Z"
source: manual
dependsOn: ["sign-up-and-log-in-with-free-accounts"]
---

## Summary

Saved races live only in the browser's localStorage (`app/lib/savedRaces.ts`, key `starting-line:saved-races`). A runner who saves races on their phone sees an empty My Races on their laptop. Once accounts exist (plan *Sign up and log in with free accounts*), a signed-in runner's saves, notes and "changed since you saved" baselines are stored with their account. They show up on every device, and saves made before signing in are merged into the account.

## Key decisions

- **Store saves in the same free Supabase project** (a `saved_races` table: user id, race slug, status, note, saved at, registration status at save). Row-level security lets each runner read and write only their own rows. Race data stays in the bundled SQLite file, and only per-runner data moves to Supabase.
- **Keep the existing data shape and seams.** `SavedRace` / `SavedRaces`, `parseSavedRaces`, `withSaveStatus`, `withNote` and `withRegistrationBaseline` stay as they are. Only the storage layer behind `readSavedRacesRaw` / `subscribeSavedRaces` / `setSaveStatus` / `setSaveNote` / `recordRegistrationBaselines` gains an account-backed path. Components and the `useSavedRaces` / `useSaveStatus` hooks don't change.
- **Merge on first sign-in, newest `savedAt` wins per race.** Device saves get uploaded, notes are kept, and nothing is lost if both sides have the race. After the merge, the account is the source of truth while signed in.
- **Signed out works exactly as today** (device only). Signing out keeps a local copy so My Races isn't suddenly empty.
- **Writes go through a small API route** (`app/api/saved-races/route.ts`) that uses `getSession()` from `app/lib/auth.ts`. Client code doesn't talk to Supabase directly, and scenarios can mock one route.

## Implementation

### 1. Table and access rules

**New file**: `supabase/saved_races.sql`, the table plus row-level-security policies, for the site owner to run once in the Supabase SQL editor. Document this in `DEPLOY.md`.

### 2. Account-backed storage

**New file**: `app/api/saved-races/route.ts`. GET returns the signed-in runner's `SavedRaces`. PUT upserts one race and DELETE removes one. Responds 401 when signed out.

**File**: `app/lib/savedRaces.ts`. Add a pure `mergeSavedRaces(device, account)` (newest `savedAt` wins, keep any note). When a session is present, the write helpers also send the change to the API and the read path hydrates from it. localStorage stays as the offline cache.

### 3. Copy that tells the truth

**File**: `app/components/MyRacesHeader.tsx`. "Saved on this device only" becomes "Saved to your account" when signed in. When signed out it says "Saved on this device. Log in to keep them everywhere", with a link to `/login?next=/my-races`.

**File**: `app/components/SeasonTeaser.tsx`. Drop "this timeline is a preview" where it no longer applies.

## Reused existing code

- `parseSavedRaces`, `withSaveStatus`, `withNote`, `withRegistrationBaseline`, `subscribeSavedRaces` from `app/lib/savedRaces.ts` (covered by `app/lib/savedRaces.test.ts`)
- `useSavedRaces` from `app/lib/useSavedRaces.ts`, `useSaveStatus` from `app/lib/useSaveStatus.ts`
- `MyRacesSection` from `app/components/MyRacesSection.tsx`

## Scenarios to demonstrate

- Signed in with saves from two devices merged (one race with a note on each side)
- Signed in with no saves (empty My Races, account wording)
- Signed out with device saves (prompt to log in)
- Network error while saving when signed in (save kept locally, quiet retry message)