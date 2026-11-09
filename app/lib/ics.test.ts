import { describe, expect, it } from 'vitest';
import { buildIcs, icsDate, icsEscape } from '@/app/lib/ics';

describe('icsDate', () => {
  // Dates are written as compact UTC timestamps without milliseconds.
  it('formats as basic UTC', () => {
    expect(icsDate(new Date('2026-11-10T17:00:00.123Z'))).toBe('20261110T170000Z');
  });
});

describe('icsEscape', () => {
  // Commas, semicolons, backslashes and newlines are escaped per the spec.
  it('escapes special characters and newlines', () => {
    expect(icsEscape('a,b;c\\d\ne\r\nf')).toBe('a\\,b\\;c\\\\d\\ne\\nf');
  });

  // Plain text passes through unchanged.
  it('leaves plain text alone', () => {
    expect(icsEscape('Central Park')).toBe('Central Park');
  });
});

describe('buildIcs', () => {
  const event = {
    uid: 'manhattan-half-2027-next@startingline',
    title: 'Manhattan Half: Registration opens',
    start: new Date('2026-11-10T17:00:00Z'),
    durationMinutes: 30,
    location: 'Central Park',
    description: 'Tue, Nov 10, 12:00 pm ET.',
    stamp: new Date('2026-10-26T14:00:00Z'),
  };

  // The event starts and ends at the right UTC times, with CRLF line endings.
  it('writes a single event with start, end and CRLF endings', () => {
    const ics = buildIcs(event);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics).toContain('DTSTART:20261110T170000Z\r\n');
    expect(ics).toContain('DTEND:20261110T173000Z\r\n');
    expect(ics).toContain('UID:manhattan-half-2027-next@startingline\r\n');
    expect(ics.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n')).toBe(true);
  });

  // Text fields are escaped so commas in descriptions do not break parsing.
  it('escapes text fields', () => {
    expect(buildIcs(event)).toContain('DESCRIPTION:Tue\\, Nov 10\\, 12:00 pm ET.\r\n');
  });

  // A date with no stated time becomes an all-day event on that date.
  it('writes all-day events with a next-day end', () => {
    const ics = buildIcs({ ...event, allDayDate: '2026-12-31' });
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231\r\n');
    expect(ics).toContain('DTEND;VALUE=DATE:20270101\r\n');
    expect(ics).not.toContain('DTSTART:2026');
  });

  // Location and description lines are omitted when not provided.
  it('omits optional fields when absent', () => {
    const ics = buildIcs({ ...event, location: undefined, description: undefined });
    expect(ics).not.toContain('LOCATION:');
    expect(ics).not.toContain('DESCRIPTION:');
  });

  // Each reminder becomes a display alarm inside the event, with escaped text.
  it('writes one VALARM per reminder', () => {
    const ics = buildIcs({
      ...event,
      alarms: [
        { trigger: '-PT1440M', description: '1 day before: Half, opens' },
        { trigger: 'PT0M', description: 'At the time: Half' },
      ],
    });
    expect(ics).toContain(
      'BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:1 day before: Half\\, opens\r\nTRIGGER:-PT1440M\r\nEND:VALARM\r\n',
    );
    expect(ics).toContain('TRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT\r\n');
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
  });

  // Without reminders there are no alarms.
  it('writes no VALARM when there are no reminders', () => {
    expect(buildIcs(event)).not.toContain('VALARM');
    expect(buildIcs({ ...event, alarms: [] })).not.toContain('VALARM');
  });
});
