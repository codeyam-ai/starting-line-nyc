---
title: "Stored race prices have drifted from organizer pages"
mode: backend
createdAt: "2026-11-05T14:41:04Z"
source: proposed-plan
---

## Root cause
Race data is a hand-verified snapshot in prisma/race-data.json. Organizers changed their price tiers after the last check, and nothing re-verifies or flags the stored schedule, so the race pages keep showing the old tiers as current.

## Evidence
fnd-b945703ca96b (wrong-result) and fnd-c7f5b6fc4daa. On HEAD 5eade58 the stale values are still stored: prisma/race-data.json:980 (Brooklyn Experience Half, 'Rises to $165', tier date 2026-10-28; the site shows Dec 17 / Jan 27), prisma/race-data.json:1133 (Jersey City Marathon, '$200 to $225 after Dec 31'; the site shows $220 to $225 after Nov 30), prisma/race-data.json:1142 (Jersey City Half, '$150 to $180 after Dec 31'; the site shows $175 to $180 after Nov 30).

## Smallest fix
Update those three price schedules from the organizer pages and bump their lastVerifiedAt.

## Cost of leaving it
Runners see wrong prices and wrong price-rise deadlines. The Jersey City increases happen a month earlier than shown, so someone waiting for the 'Dec 31' deadline pays more.

## Re-checked on 2026-11-06 (organizer pages)
- Jersey City Marathon (runsignup.com/Race/NJ/JerseyCity/TheJerseyCityMarathon): $220, struck-through $225; "Price increases after November 30, 2026 at 11:59pm EST".
- Jersey City Half (same page): $175; "Price increases after November 30, 2026 at 11:59pm EST". The later price is NOT published (the earlier $180 is no longer shown), so we don't state one.
- Brooklyn Experience Half (nycruns.com/race/nycruns-brooklyn-experience-half-marathon): members $144 / non-members $160 through December 17; $153 / $170 through January 27. Prices after Jan 27 are not listed.

## Implementation
Mode: UI (the corrected prices show on the race pages, and the user asked for refreshed screenshots).

1. `prisma/race-data.json`
   - Edition 20 (Jersey City Marathon): priceCents 22000; priceNote "Marathon $220 until Nov 30, 2026 11:59 PM EST. The struck-through $225 is the later price. Fees may be extra."; lastVerifiedAt 2026-11-06.
   - Milestone 31: at 2026-12-01T04:59:00.000Z (Nov 30 11:59 PM EST), note "Price rises from $220 to $225 after Nov 30, 2026 11:59 PM EST".
   - Edition 21 (Jersey City Half): priceCents 17500; priceNote "Half marathon $175 until Nov 30, 2026 11:59 PM EST. The later price isn't published yet. Fees may be extra."; lastVerifiedAt 2026-11-06.
   - Milestone 32: at 2026-12-01T04:59:00.000Z, note "Price rises from $175 after Nov 30, 2026 11:59 PM EST (new price not published)".
   - Edition 5 (Brooklyn Experience Half): priceCents 16000; priceNote "Non-member price through Dec 17 (members $144). Then $170 through Jan 27 (members $153); later prices are not listed yet."; lastVerifiedAt 2026-11-06.
   - Milestone 14: price_increase on Dec 17 (date only, timeKnown false), note "Rises to $170 (non-member)". Add a date-only price_increase milestone after Jan 27, note "Price rises after Jan 27; new price not listed yet".
2. Scenario seeds that embed copies of this data (about 25 scenarios): apply the same values, re-register each one, and keep any pinned clock (re-registering has dropped clocks before).
3. Recapture the affected screenshots.

## Tests
A data-consistency test over `prisma/race-data.json`: for these three editions, the stored price matches the price named in the note and the price-increase milestone date matches the date in the note. This is a regression guard against the drift recurring silently.