---
title: "Reminder presets on calendar events"
mode: ui
createdAt: "2026-10-26T21:39:36Z"
order: 4
source: manual
dependsOn: ["google-calendar-first-for-add-to-calendar"]
---

## Summary

Add reminders to calendar events: when adding a registration date or race day, a runner picks when to be reminded (presets or a custom time), and the reminder travels with the event.

## What the runner gets

- Presets: 1 hour, 1 day, 3 days, 1 week before, or a custom number of days and time of day (Eastern Time).
- Registration openings default to a reminder 1 day before plus one at opening time; deadlines default to 3 days before.
- Reminders work in Apple Calendar and Outlook (.ics alarms) and, where Google supports it, in the Google link.

## Key Decisions

- Reminders live in the runner's own calendar; no emails, push notifications or accounts (those need a backend and are a later plan).
- Copy is plain about this: "Your calendar app will remind you."

## Implementation

- `app/lib/ics.ts`: VALARM support with one or more triggers.
- `app/api/races/[slug]/calendar/route.ts`: accept reminder choices.
- Reminder picker in the add-to-calendar control.

## Scenarios

Default reminders for an opening date; custom reminder; deadline with no time stated (all-day); phone layout.

## Merged in

This plan also covers the deferred deliverable "Reminders for registration openings and deadlines with custom times and presets" (merged 2026-11-07). That plan asked for the same thing: reminders for openings and deadlines, with presets and custom times.
