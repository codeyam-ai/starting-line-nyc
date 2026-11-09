# Extraction plan — Reminder presets on calendar events (step 11 Deconstruct)

Sources read: app/components/AddToCalendar.tsx, app/components/TimelineItem.tsx,
app/components/NextDeadline.tsx, app/api/races/[slug]/calendar/route.ts, app/lib/reminders.ts (new),
app/lib/ics.ts, app/lib/raceCalendar.ts, app/globals.css (.addcal-* rules).
Glossary: AddToCalendar, TimelineItem, NextDeadline, buildIcs, raceCalendarEvent, googleCalendarHref exist;
nothing reminder-related exists yet. No page file changed in this feature, so the job is the component tree.

## Components out of AddToCalendar.tsx (one per file)
AddToCalendar stays the `<details>`/summary shell and composes items 1 and 2 only.
1. **GoogleCalendarOption** (component). Holds the Google Calendar link plus the "Google uses your usual
   notification settings" note (lines ~27-30). Goes to app/components/GoogleCalendarOption.tsx, prop `href`.
2. **ReminderForm** (component). Holds the GET `<form>`: the hidden inputs copied from href, `r=1`, the submit button,
   and the "Your calendar app will remind you" note (lines ~31-59). Goes to app/components/ReminderForm.tsx,
   props `href, dateKind, timeKnown`. Composes item 3.
3. **ReminderPicker** (component). Holds the `<fieldset>` with its legend, the preset options, the custom row and the
   all-day note (lines ~36-55). Goes to app/components/ReminderPicker.tsx, props `presets, defaults, timeKnown`.
   Composes items 4, 5 and 6.
4. **ReminderPresetOption** (component). One checkbox + label (lines ~38-43). Goes to
   app/components/ReminderPresetOption.tsx, props `id, label, checked`.
5. **CustomReminderField** (component). The "Also [N] days before at [time] ET" row (lines ~44-50). Goes to
   app/components/CustomReminderField.tsx.
6. **AllDayReminderNote** (component). "No time is stated, so reminders go off at 9 am." (lines ~51-53). Goes to
   app/components/AllDayReminderNote.tsx.

## Pure functions (co-located modules, unit-tested)
7. **reminderPresetsFor(timeKnown)** (function). The `REMINDER_PRESETS.filter(timedOnly)` in AddToCalendar.
   Goes to app/lib/reminders.ts.
8. **calendarFormTarget(href)** (function). Splits href into `{ action, params }` for the GET form (the
   `new URL(href,'http://local')` logic in AddToCalendar). Goes to app/lib/raceCalendar.ts.
9. **chosenReminders(searchParams)** (function). Lifted from the route: returns null without `r`, otherwise the remind
   tokens plus the custom token. Goes to app/lib/reminders.ts.
10. **reminderAlarms(tokens, event)** (function). Lifted from the route: tokens → `{trigger, description}[]`,
    dropping null triggers and handling all-day events. Goes to app/lib/reminders.ts. The route then becomes:
    `alarms = reminderAlarms(resolveReminders(chosenReminders(search), dateKind), event)`.

## Tests (step 12, TDD)
11. New app/lib/reminders.test.ts: defaultReminders, customReminder, resolveReminders (null vs [] vs invalid/dupes/cap),
    reminderTrigger (timed, all-day, custom 2d@18:30 before 23:59 = -PT3209M, all-day 3d = -PT3780M, after-start → null),
    reminderLabel, reminderPresetsFor, chosenReminders, reminderAlarms.
12. app/lib/ics.test.ts: VALARM block(s) emitted and escaped; none when `alarms` absent.
13. app/lib/raceCalendar.test.ts: `dateKind` = 'race_day' / milestone kind; calendarFormTarget. (Existing whole-result
    `toEqual` checks are error cases only, so the new `dateKind` field breaks none of them.)
14. Glossary entries for every new component/function (none removed, so no pre-deletion sweep needed).

TimelineItem and NextDeadline only pass two props through, so there is nothing to extract from them. The CSS stays in globals.css.
