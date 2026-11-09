import { describe, expect, it } from 'vitest';
import {
  chosenReminders,
  customReminder,
  defaultReminders,
  reminderAlarms,
  reminderLabel,
  reminderPresetsFor,
  reminderTrigger,
  resolveReminders,
} from '@/app/lib/reminders';

// Jan 9 2027, 11:59 pm ET (a deadline at the end of the day).
const DEADLINE = new Date('2027-01-10T04:59:00Z');
// Nov 10 2026, 12:00 pm ET.
const NOON = new Date('2026-11-10T17:00:00Z');
// An all-day date: midnight ET on Nov 10 2026.
const ALL_DAY = new Date('2026-11-10T05:00:00Z');

describe('defaultReminders', () => {
  // Registration openings remind a day ahead and again at opening time.
  it('gives openings a day-before and an at-the-time reminder', () => {
    expect(defaultReminders('registration_opens')).toEqual(['1d', '0']);
  });

  // Lottery openings count as openings too.
  it('treats lottery openings like registration openings', () => {
    expect(defaultReminders('lottery_opens')).toEqual(['1d', '0']);
  });

  // Race day reminds the day before.
  it('gives race day a day-before reminder', () => {
    expect(defaultReminders('race_day')).toEqual(['1d']);
  });

  // Deadlines and any other kind remind three days ahead.
  it('gives deadlines and unknown kinds a three-day reminder', () => {
    expect(defaultReminders('registration_closes')).toEqual(['3d']);
    expect(defaultReminders('something_else')).toEqual(['3d']);
  });
});

describe('customReminder', () => {
  // A day count and a time become an N-days-at-time token.
  it('builds a token from days and time', () => {
    expect(customReminder('2', '18:30')).toBe('2d@18:30');
  });

  // A missing or malformed time falls back to 9 am.
  it('defaults a bad or missing time to 09:00', () => {
    expect(customReminder('2', 'later')).toBe('2d@09:00');
    expect(customReminder('5', null)).toBe('5d@09:00');
  });

  // No day count means no custom reminder.
  it('returns null when days are empty', () => {
    expect(customReminder(null, '18:30')).toBeNull();
    expect(customReminder('', '18:30')).toBeNull();
  });

  // Days must be a whole number from 1 to 90.
  it('rejects zero, fractional and too-large day counts', () => {
    expect(customReminder('0', '09:00')).toBeNull();
    expect(customReminder('1.5', '09:00')).toBeNull();
    expect(customReminder('91', '09:00')).toBeNull();
    expect(customReminder('90', '09:00')).toBe('90d@09:00');
  });
});

describe('resolveReminders', () => {
  // With no choice made, the kind's defaults apply.
  it('uses the defaults when nothing was chosen', () => {
    expect(resolveReminders(null, 'registration_opens')).toEqual(['1d', '0']);
  });

  // An empty choice is a deliberate no reminders.
  it('keeps an empty choice empty', () => {
    expect(resolveReminders([], 'registration_opens')).toEqual([]);
  });

  // Unknown tokens and duplicates are dropped, order kept.
  it('drops invalid and duplicate tokens', () => {
    expect(resolveReminders(['1d', 'bogus', '1d', '3d', '0d@09:00', '2d@25:00'], 'deadline')).toEqual(['1d', '3d']);
  });

  // At most six reminders are kept.
  it('caps the list at six reminders', () => {
    const many = ['0', '1h', '1d', '3d', '1w', '2d@09:00', '4d@09:00'];
    expect(resolveReminders(many, 'deadline')).toEqual(many.slice(0, 6));
  });
});

describe('reminderTrigger', () => {
  // Presets on a timed event count back from the start.
  it('counts presets back from a timed start', () => {
    const event = { start: NOON, allDay: false };
    expect(reminderTrigger('0', event)).toBe('PT0M');
    expect(reminderTrigger('1h', event)).toBe('-PT60M');
    expect(reminderTrigger('1d', event)).toBe('-PT1440M');
    expect(reminderTrigger('1w', event)).toBe('-PT10080M');
  });

  // A custom reminder fires N days before at that Eastern time.
  it('places a custom reminder at its Eastern time', () => {
    expect(reminderTrigger('2d@18:30', { start: DEADLINE, allDay: false })).toBe('-PT3209M');
  });

  // On an all-day date, presets go off at 9 am ET.
  it('fires all-day presets at 9 am', () => {
    const event = { start: ALL_DAY, allDay: true };
    expect(reminderTrigger('0', event)).toBe('PT540M');
    expect(reminderTrigger('1d', event)).toBe('-PT900M');
    expect(reminderTrigger('3d', event)).toBe('-PT3780M');
  });

  // An hour before a date with no time is meaningless, so it is skipped.
  it('skips one hour before on an all-day date', () => {
    expect(reminderTrigger('1h', { start: ALL_DAY, allDay: true })).toBeNull();
  });

  // A custom reminder on an all-day date counts from midnight.
  it('counts all-day custom reminders from midnight', () => {
    expect(reminderTrigger('1d@09:00', { start: ALL_DAY, allDay: true })).toBe('-PT900M');
  });

  // Unknown tokens produce no trigger.
  it('returns null for an unknown token', () => {
    expect(reminderTrigger('bogus', { start: NOON, allDay: false })).toBeNull();
  });
});

describe('reminderLabel', () => {
  // Presets use their picker label.
  it('labels presets', () => {
    expect(reminderLabel('1d')).toBe('1 day before');
    expect(reminderLabel('0')).toBe('At the time');
  });

  // Custom reminders read as days before at a 12-hour ET time.
  it('labels custom reminders in plain language', () => {
    expect(reminderLabel('2d@18:30')).toBe('2 days before at 6:30 pm ET');
    expect(reminderLabel('1d@00:15')).toBe('1 day before at 12:15 am ET');
  });

  // Anything else is shown as-is.
  it('passes unknown tokens through', () => {
    expect(reminderLabel('bogus')).toBe('bogus');
  });
});

describe('reminderPresetsFor', () => {
  // A date with a time offers every preset.
  it('offers all presets when the time is known', () => {
    expect(reminderPresetsFor(true).map((p) => p.id)).toEqual(['0', '1h', '1d', '3d', '1w']);
  });

  // A date without a time drops one hour before.
  it('drops one hour before when no time is stated', () => {
    expect(reminderPresetsFor(false).map((p) => p.id)).toEqual(['0', '1d', '3d', '1w']);
  });
});

describe('chosenReminders', () => {
  // A plain download link made no choice.
  it('returns null without the picker marker', () => {
    expect(chosenReminders(new URLSearchParams('remind=1d'))).toBeNull();
  });

  // Ticked presets and the custom row are combined.
  it('combines ticked presets with the custom reminder', () => {
    const search = new URLSearchParams('r=1&remind=1d&remind=0&customDays=2&customTime=18:30');
    expect(chosenReminders(search)).toEqual(['1d', '0', '2d@18:30']);
  });

  // Submitting the picker with nothing ticked means no reminders.
  it('returns an empty list when nothing was ticked', () => {
    expect(chosenReminders(new URLSearchParams('r=1&customDays='))).toEqual([]);
  });
});

describe('reminderAlarms', () => {
  // Each reminder becomes an alarm labeled with the event title.
  it('builds labeled alarms', () => {
    expect(reminderAlarms(['1d', '0'], { title: 'Half: Registration opens', start: NOON, allDay: false })).toEqual([
      { trigger: '-PT1440M', description: '1 day before: Half: Registration opens' },
      { trigger: 'PT0M', description: 'At the time: Half: Registration opens' },
    ]);
  });

  // Reminders with no valid trigger are left out.
  it('drops reminders that have no trigger', () => {
    expect(reminderAlarms(['1h', '1d'], { title: 'Deadline', start: ALL_DAY, allDay: true })).toEqual([
      { trigger: '-PT900M', description: '1 day before: Deadline' },
    ]);
  });

  // No reminders, no alarms.
  it('returns no alarms for no reminders', () => {
    expect(reminderAlarms([], { title: 'Deadline', start: NOON, allDay: false })).toEqual([]);
  });
});
