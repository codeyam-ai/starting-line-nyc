---
title: "How entry works page"
mode: ui
createdAt: "2026-11-10T22:48:39Z"
source: manual
---

## Summary

"How entry works" in the header links to `/#how-entry-works`. That anchor is the site footer (`app/components/SiteFooter.tsx`), which only says where race details come from. Nothing on the site explains how race entry works. Add a short **How entry works** page. It explains the five ways to get into a race, plus the basics a runner needs to read the race list. The header link and each race page's "How to enter" box point to it.

## Key decisions

- **One plain page at `/how-entry-works`**, built from the `ENTRY_METHODS` table in `app/lib/raceDetail.ts`: open registration, lottery, qualifying standard, charity entry and membership. Race pages and this page then always use the same wording. Each method gets its own anchor (`#lottery` etc.) so race pages can deep-link.
- **Add the short reading guide the list assumes:** dates and times are Eastern Time, what "weeks to train" counts, what "Opening soon" means, and "confirm on the organizer's official page before you register". This reuses the footer's sourcing sentence, so the footer can keep it too.
- **The footer stops pretending to be the target.** Remove `id="how-entry-works"` from the footer.
- **Overlap:** the queued plan `distinguish-open-registration-lotteries-time-qualification-charity-and-membership-entry-with-qualification-windows-per.md` may add per-edition qualification windows. This page reads from `ENTRY_METHODS`, so whichever lands second extends the same table, with no conflict.

## Implementation

### 1. The page

**New file**: `app/how-entry-works/page.tsx`, built with `PageShell`, `SiteHeader` (active on the new link), one section per entry method from `ENTRY_METHODS`, the reading-guide section, a "Browse races" button and `SiteFooter`. Static, with page metadata ("How entry works · Starting Line").

### 2. Header link

**File**: `app/components/SiteHeader.tsx`. The link goes to `/how-entry-works`, and `active` gains `'how-entry'` so the link is underlined on this page.

### 3. Footer anchor

**File**: `app/components/SiteFooter.tsx`. Remove the misleading `id`.

### 4. Link from a race's "How to enter" box

**File**: `app/components/HowToEnter.tsx`. After the method explanation, add "How entry types work" linking to `/how-entry-works#<method>`. The race page (`app/races/[slug]/page.tsx`) passes the edition's `entryMethod` key.

## Reused existing code

- `ENTRY_METHODS` / `entryMethod` from `app/lib/raceDetail.ts` (tested in `app/lib/raceDetail.test.ts`)
- `PageShell`, `SiteHeader`, `SiteFooter` (glossary entries of the same names)
- `TimezoneNote` from `app/components/TimezoneNote.tsx` for the Eastern Time wording

## Scenarios to demonstrate

- The page at desktop width, with the header link active
- The page at phone width
- A race detail page whose "How to enter" box links to `#lottery`