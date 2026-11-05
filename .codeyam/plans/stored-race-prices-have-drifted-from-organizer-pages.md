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