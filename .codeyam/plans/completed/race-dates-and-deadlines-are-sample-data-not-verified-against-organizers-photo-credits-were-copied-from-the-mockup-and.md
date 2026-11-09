---
title: "Race dates and deadlines are sample data, not verified against organizers; photo credits were copied from the mockup, and only the hero photo has its own credit."
mode: ui
createdAt: "2026-10-27T16:47:05Z"
source: proposed-plan
---

## Summary

Give every photo the site shows its own correct credit, linked to where it came
from, and make the footer credit exactly the photos in use.

**Race dates: already done.** All 24 races were checked against their organizers'
own pages, and each shows its source link and when it was last checked
(26 Oct to 6 Nov). Nothing left to build for that half of the title.

## What is wrong today

- The Prospect Park photo (Great Gobble 5K, Brooklyn Experience Half) has no credit.
- The footer credits seven photographers, a list copied from the mockup. Only four
  of them took a photo the site shows; Jim Henderson and ScubaBear68 took none of
  them, and Epicgenius, who took the Prospect Park photo, is credited only by luck.
- The home hero's credit is typed into the page by hand.
- Two image files are never shown (`breakneck-ridge.jpg`, `nyc-half-manhattan.jpg`).

## Where each photo came from (matched against Wikimedia Commons)

| Photo | Photographer | License | Used on |
|---|---|---|---|
| Central Park drive (NYC Marathon 2017) | Mike Peel | CC BY-SA 4.0 | Home hero, Big Apple Half, Central Park Half |
| Prospect Park drive | Epicgenius | CC BY-SA 4.0 | Great Gobble 5K, Brooklyn Experience Half |
| Colonels Row, Governors Island | Brian W. Schaller | Free Art License | Go Nuts for Donuts 10K |
| Ramapo-Dunderberg Trail, Harriman | Daniel Case | CC BY-SA 4.0 | Big Bear Squatch North Half |
| Catskill Mountain House view | Mwanner | CC BY-SA 3.0 | Escarpment Trail Run |

## What changes

- One list of the site's photos, each with photographer, license and its Commons
  page. Races point at a photo; the credit comes from that list, so a race can't
  show a photo without its credit.
- Race page and home page heroes: "Photo: <name>, <license>", linking to the
  photo's Commons page.
- Footer: credits exactly the photos the site shows, each linked, built from the
  same list.
- Remove the two unused image files and the hand-typed credits.

## Tests

- Every race photo has an entry in the photo list, and every entry is a real file
  that the site uses.
- Every image file in the site's images folder is in the photo list.
- The footer shows one linked credit per photo in use, and none for unused ones.
- The race hero shows the linked credit, and no credit when a race has no photo.

## Scenarios

Footer with the corrected credits; race page with the Prospect Park photo and its
new credit; race page with no photo (no credit line); phone layout of the hero
credit.
