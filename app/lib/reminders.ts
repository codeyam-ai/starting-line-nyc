// Reminders that travel with a calendar event: presets, a custom "N days
// before at a time (ET)", and the defaults for each kind of date. Pure — the
// calendar route turns the chosen reminders into .ics alarms.

// A reminder token: a preset id ('0', '1h', '1d', '3d', '1w') or a custom
// 'Nd@HH:MM' (N days before, at that Eastern time).
export type ReminderToken = string;

export const REMINDER_PRESETS: { id: ReminderToken; label: string; timedOnly?: boolean }[] = [
  { id: '0', label: 'At the time' },
  { id: '1h', label: '1 hour before', timedOnly: true },
  { id: '1d', label: '1 day before' },
  { id: '3d', label: '3 days before' },
  { id: '1w', label: '1 week before' },
];

const OPENING_KINDS = new Set(['registration_opens', 'lottery_opens']);

// When no time is stated, reminders go off at this Eastern hour.
export const ALL_DAY_REMINDER_HOUR = 9;

const MAX_REMINDERS = 6;
const MAX_CUSTOM_DAYS = 90;
const CUSTOM = /^(\d{1,2})d@([01]\d|2[0-3]):([0-5]\d)$/;

// Openings: a day ahead plus one at the moment they open. Race day: the day
// before. Deadlines and everything else: three days ahead.
export function defaultReminders(kind: string): ReminderToken[] {
  if (OPENING_KINDS.has(kind)) return ['1d', '0'];
  if (kind === 'race_day') return ['1d'];
  return ['3d'];
}

export function customReminder(days: string | null, time: string | null): ReminderToken | null {
  const n = Number(days);
  if (!days || !Number.isInteger(n) || n < 1 || n > MAX_CUSTOM_DAYS) return null;
  const t = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time ?? '') ? (time as string) : '09:00';
  return `${n}d@${t}`;
}

function isValid(token: ReminderToken): boolean {
  if (REMINDER_PRESETS.some((p) => p.id === token)) return true;
  const m = CUSTOM.exec(token);
  return !!m && Number(m[1]) >= 1 && Number(m[1]) <= MAX_CUSTOM_DAYS;
}

// The reminders for one request. `chosen` is null when the request made no
// choice (a plain download link): the kind's defaults apply. An empty list is
// a deliberate "no reminders".
export function resolveReminders(chosen: ReminderToken[] | null, kind: string): ReminderToken[] {
  const tokens = chosen ?? defaultReminders(kind);
  return [...new Set(tokens.filter(isValid))].slice(0, MAX_REMINDERS);
}

function minutesToTrigger(minutesAfterStart: number): string {
  if (minutesAfterStart === 0) return 'PT0M';
  const sign = minutesAfterStart < 0 ? '-' : '';
  return `${sign}PT${Math.abs(minutesAfterStart)}M`;
}

const PRESET_MINUTES_BEFORE: Record<string, number> = { '0': 0, '1h': 60, '1d': 1440, '3d': 3 * 1440, '1w': 7 * 1440 };

// Minutes from midnight ET to `at`, on its own Eastern calendar day.
function etMinutesOfDay(at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get('hour') * 60 + get('minute');
}

// The .ics TRIGGER for a reminder, relative to the event's start, or null
// when it would go off after the event begins.
//  - Timed events: presets count back from the start time; a custom
//    reminder fires N days before, at that Eastern time.
//  - All-day events (no time stated): the start is midnight, so presets fire
//    at 9 am on the day or N days before, and "1 hour before" is skipped.
export function reminderTrigger(token: ReminderToken, event: { start: Date; allDay: boolean }): string | null {
  const custom = CUSTOM.exec(token);
  let minutesAfterStart: number;
  if (custom) {
    const days = Number(custom[1]);
    const clock = Number(custom[2]) * 60 + Number(custom[3]);
    const startClock = event.allDay ? 0 : etMinutesOfDay(event.start);
    minutesAfterStart = -days * 1440 + (clock - startClock);
  } else {
    if (!(token in PRESET_MINUTES_BEFORE)) return null;
    if (event.allDay) {
      if (token === '1h') return null;
      minutesAfterStart = -PRESET_MINUTES_BEFORE[token] + ALL_DAY_REMINDER_HOUR * 60;
    } else {
      minutesAfterStart = -PRESET_MINUTES_BEFORE[token];
    }
  }
  if (minutesAfterStart > (event.allDay ? 1440 : 0)) return null;
  return minutesToTrigger(minutesAfterStart);
}

// A short plain-language label for a reminder, used in the alarm text.
export function reminderLabel(token: ReminderToken): string {
  const preset = REMINDER_PRESETS.find((p) => p.id === token);
  if (preset) return preset.label;
  const m = CUSTOM.exec(token);
  if (!m) return token;
  const days = Number(m[1]);
  const hour = Number(m[2]);
  const time = `${hour % 12 || 12}:${m[3]} ${hour < 12 ? 'am' : 'pm'}`;
  return `${days} day${days === 1 ? '' : 's'} before at ${time} ET`;
}

// The presets offered for a date: "1 hour before" only when a time is stated.
export function reminderPresetsFor(timeKnown: boolean): typeof REMINDER_PRESETS {
  return REMINDER_PRESETS.filter((p) => timeKnown || !p.timedOnly);
}

// The reminders a calendar request chose, read from its query. Null when the
// request carries no picker choice (no `r`), so the date's defaults apply.
export function chosenReminders(search: URLSearchParams): ReminderToken[] | null {
  if (!search.has('r')) return null;
  const custom = customReminder(search.get('customDays'), search.get('customTime'));
  return [...search.getAll('remind'), ...(custom ? [custom] : [])];
}

// The .ics alarms for an event's reminders. A reminder that would go off
// after the event begins is dropped.
export function reminderAlarms(
  tokens: ReminderToken[],
  event: { title: string; start: Date; allDay: boolean },
): { trigger: string; description: string }[] {
  return tokens.flatMap((token) => {
    const trigger = reminderTrigger(token, event);
    return trigger ? [{ trigger, description: `${reminderLabel(token)}: ${event.title}` }] : [];
  });
}
