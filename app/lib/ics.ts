// Builds a single-event iCalendar (.ics) file that Google, Apple and Outlook
// calendars all import. Times are written in UTC so each client converts
// them to the viewer's zone correctly.

export type CalendarEvent = {
  uid: string;
  title: string;
  start: Date;
  durationMinutes: number;
  location?: string;
  description?: string;
  stamp: Date;
  // When the organizer gave a date but no time: an all-day event on this
  // calendar date (YYYY-MM-DD, already in Eastern Time). Overrides start.
  allDayDate?: string;
  // Reminders (VALARM), each a TRIGGER duration relative to the start, e.g.
  // '-PT1440M'. The calendar app shows them; nothing is sent from here.
  alarms?: { trigger: string; description: string }[];
};

function nextDay(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Escapes text per RFC 5545: backslash, comma and semicolon, and newlines.
export function icsEscape(s: string): string {
  return s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');
}

export function buildIcs(event: CalendarEvent): string {
  const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Starting Line//Races//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${icsDate(event.stamp)}`,
    ...(event.allDayDate
      ? [
          `DTSTART;VALUE=DATE:${event.allDayDate.replace(/-/g, '')}`,
          `DTEND;VALUE=DATE:${nextDay(event.allDayDate).replace(/-/g, '')}`,
        ]
      : [`DTSTART:${icsDate(event.start)}`, `DTEND:${icsDate(end)}`]),
    `SUMMARY:${icsEscape(event.title)}`,
    ...(event.location ? [`LOCATION:${icsEscape(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${icsEscape(event.description)}`] : []),
    ...(event.alarms ?? []).flatMap((alarm) => [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsEscape(alarm.description)}`,
      `TRIGGER:${alarm.trigger}`,
      'END:VALARM',
    ]),
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ];
  return lines.join('\r\n');
}
