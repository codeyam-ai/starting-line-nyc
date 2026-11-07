---
title: "There is no lottery race: none of the races I could verify uses a lottery, and New York Road Runners races are missing because their site blocks automated reading."
mode: backend
createdAt: "2026-10-27T18:40:01Z"
source: proposed-plan
---

## Summary

Add New York Road Runners (NYRR) races to the race data, including at least one
lottery race, so the site shows every entry method the brief calls for.

**Run this in a LOCAL session with a browser connected** (Claude in Chrome or the
Claude desktop app's built-in browser). nyrr.org turns away command-line requests,
and getting around that block is off the table. The browser reads the pages in the
user's own session, so NYRR can be cited as the source.

## Races to add (user picked "all" of these on 2026-11-06)

- TCS New York City Marathon: lottery, time qualifier, 9+1, charity
- United Airlines NYC Half: lottery, time qualifier, charity
- 2–3 NYRR races open to anyone, for example the RBC Brooklyn Half and the
  Mini 10K, so NYRR appears across several distances

## How

- Add an NYRR organizer and the races, editions and registration milestones to
  `prisma/race-data.json` (lottery opens, closes and drawing, plus registration
  opens and closes).
- Use `entryMethod: "lottery"` and `registrationStatus: "lottery_open"` only
  where NYRR's own page supports it.
- Every edition gets NYRR's `sourceUrl` and a `lastVerifiedAt`. Dates NYRR hasn't
  published yet stay "not announced"; never guess them. Treat each annual edition
  separately.
- Tests: extend `prisma/raceData.test.ts` so the data includes at least one
  lottery edition and at least one NYRR race, and each NYRR edition has a source
  link.
- Afterwards, update the `entry-requirements` deliverable note, which currently
  says no verified race uses a lottery.
