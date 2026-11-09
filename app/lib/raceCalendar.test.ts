import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '@/app/lib/ics';
import {
  calendarFileName,
  calendarFormTarget,
  googleCalendarHref,
  googleCalendarUrl,
  raceCalendarEvent,
  type CalendarRace,
} from '@/app/lib/raceCalendar';

const NOW = new Date('2026-10-26T14:00:00Z');

const race: CalendarRace = {
  slug: 'fred-lebow-manhattan-half',
  name: 'Fred Lebow Manhattan Half',
  locationName: 'Central Park',
  editions: [
    {
      year: 2027,
      raceDate: new Date('2027-01-24T12:00:00Z'),
      registrationUrl: 'https://www.nyrr.org',
      isSample: true,
      milestones: [
        { kind: 'registration_closes', at: new Date('2027-01-10T04:59:00Z'), timeKnown: true, tentative: false },
        { kind: 'registration_opens', at: new Date('2026-11-10T17:00:00Z'), timeKnown: true, tentative: false },
      ],
    },
  ],
};

describe('raceCalendarEvent', () => {
  // The default event is the next registration milestone, titled by its kind.
  it('builds the next milestone event', () => {
    const result = raceCalendarEvent(race, 'next', NOW);
    if ('error' in result) throw new Error(result.error);
    expect(result.event.title).toBe('Fred Lebow Manhattan Half: Registration opens');
    expect(result.event.start.toISOString()).toBe('2026-11-10T17:00:00.000Z');
    expect(result.event.durationMinutes).toBe(30);
    expect(result.event.uid).toBe('fred-lebow-manhattan-half-2027-next@startingline');
  });

  // The description restates the time in ET, links the official site and flags sample data.
  it('describes the time in ET with the official link and sample notice', () => {
    const result = raceCalendarEvent(race, 'next', NOW);
    if ('error' in result) throw new Error(result.error);
    expect(result.event.description).toBe(
      'Tue, Nov 10, 12:00 pm ET (Eastern Time).\nOfficial registration: https://www.nyrr.org\nSample data from Starting Line. Confirm on the official site.',
    );
  });

  // Race day events use the race date and a longer block.
  it('builds a race day event', () => {
    const result = raceCalendarEvent(race, 'raceday', NOW);
    if ('error' in result) throw new Error(result.error);
    expect(result.event.title).toBe('Fred Lebow Manhattan Half (race day)');
    expect(result.event.start.toISOString()).toBe('2027-01-24T12:00:00.000Z');
    expect(result.event.durationMinutes).toBe(240);
    expect(result.dateKind).toBe('race_day');
  });

  // A race day export is refused when the date has not been announced.
  it('refuses race day when the date is unannounced', () => {
    const tbd = { ...race, editions: [{ ...race.editions[0], raceDate: null }] };
    expect(raceCalendarEvent(tbd, 'raceday', NOW)).toEqual({ error: 'Race date not announced' });
  });

  // With no future milestone there is nothing to remind about.
  it('refuses when no registration date is upcoming', () => {
    const none = { ...race, editions: [{ ...race.editions[0], milestones: [] }] };
    expect(raceCalendarEvent(none, 'next', NOW)).toEqual({ error: 'No upcoming registration date' });
  });

  // A race whose editions are all past has nothing to export.
  it('refuses when there is no upcoming edition', () => {
    const past = { ...race, editions: [{ ...race.editions[0], raceDate: new Date('2026-01-25T12:00:00Z') }] };
    expect(raceCalendarEvent(past, 'next', NOW)).toEqual({ error: 'No upcoming edition' });
  });
});

describe('raceCalendarEvent for one milestone', () => {
  const withIds: CalendarRace = {
    ...race,
    editions: [
      {
        ...race.editions[0],
        milestones: [
          { id: 1, kind: 'price_increase', at: new Date('2026-10-01T16:00:00Z'), timeKnown: false, tentative: false },
          { id: 2, kind: 'price_increase', at: new Date('2026-11-09T17:00:00Z'), timeKnown: false, tentative: false, note: 'Rises to $65' },
          { id: 3, kind: 'charity_closes', at: new Date('2027-01-10T14:00:00Z'), timeKnown: true, tentative: false },
        ],
      },
    ],
  };

  // A date-only milestone becomes an all-day event on its ET date, with its note.
  it('exports a date-only milestone as all day', () => {
    const r = raceCalendarEvent(withIds, 2, NOW);
    if ('error' in r) throw new Error(r.error);
    expect(r.event.allDayDate).toBe('2026-11-09');
    expect(r.event.title).toBe('Fred Lebow Manhattan Half: Last day at the current price');
    expect(r.event.description).toContain('Mon, Nov 9 (time not stated) (Eastern Time).');
    expect(r.event.description).toContain('Rises to $65');
  });

  // A milestone with a stated time keeps that time.
  it('exports a timed milestone at its time', () => {
    const r = raceCalendarEvent(withIds, 3, NOW);
    if ('error' in r) throw new Error(r.error);
    expect(r.event.allDayDate).toBeUndefined();
    expect(r.event.start.toISOString()).toBe('2027-01-10T14:00:00.000Z');
  });

  // A milestone event reports its kind, which picks the default reminders.
  it('reports the milestone kind as the date kind', () => {
    const r = raceCalendarEvent(withIds, 3, NOW);
    if ('error' in r) throw new Error(r.error);
    expect(r.dateKind).toBe('charity_closes');
  });

  // Unknown or already-passed milestones are refused.
  it('refuses missing or past milestones', () => {
    expect(raceCalendarEvent(withIds, 99, NOW)).toEqual({ error: 'Registration date not found' });
    expect(raceCalendarEvent(withIds, 1, NOW)).toEqual({ error: 'That registration date has passed' });
  });
});

describe('calendarFileName', () => {
  // Race day and single-milestone downloads get distinct file names.
  it('names next, race day and milestone files', () => {
    expect(calendarFileName('brooklyn-half', 'next')).toBe('brooklyn-half.ics');
    expect(calendarFileName('brooklyn-half', 'raceday')).toBe('brooklyn-half-raceday.ics');
    expect(calendarFileName('brooklyn-half', 4)).toBe('brooklyn-half-deadline-4.ics');
  });
});

describe('googleCalendarUrl', () => {
  const base: CalendarEvent = {
    uid: 'x@startingline',
    title: 'Big Apple Half (race day)',
    start: new Date('2026-12-13T13:00:00Z'),
    durationMinutes: 240,
    location: 'Central Park',
    description: 'Sun, Dec 13, 8:00 am ET (Eastern Time).\nOfficial registration: https://nycruns.com',
    stamp: new Date('2026-10-26T14:00:00Z'),
  };
  const params = (url: string) => new URL(url).searchParams;

  // The link opens Google's create-event page in Eastern Time.
  it('points at the Google create-event page', () => {
    const url = googleCalendarUrl(base);
    expect(url.startsWith('https://calendar.google.com/calendar/render?')).toBe(true);
    expect(params(url).get('action')).toBe('TEMPLATE');
    expect(params(url).get('ctz')).toBe('America/New_York');
  });

  // A timed event carries its UTC start and end, matching the .ics times.
  it('encodes a timed event in UTC', () => {
    expect(params(googleCalendarUrl(base)).get('dates')).toBe('20261213T130000Z/20261213T170000Z');
  });

  // A summer start is in daylight time: 9 am EDT is 13:00 UTC, while 8 am EST in December is also 13:00 UTC.
  it('keeps a summer start correct across daylight saving', () => {
    const summer = { ...base, start: new Date('2027-07-25T13:00:00Z'), durationMinutes: 30 };
    expect(params(googleCalendarUrl(summer)).get('dates')).toBe('20270725T130000Z/20270725T133000Z');
  });

  // A date-only deadline is an all-day event whose end is the following day.
  it('encodes a date-only deadline as all day', () => {
    const allDay = { ...base, allDayDate: '2026-11-09' };
    expect(params(googleCalendarUrl(allDay)).get('dates')).toBe('20261109/20261110');
  });

  // An all-day event at the end of a month rolls into the next month.
  it('rolls an all-day end date over a month boundary', () => {
    const allDay = { ...base, allDayDate: '2026-11-30' };
    expect(params(googleCalendarUrl(allDay)).get('dates')).toBe('20261130/20261201');
  });

  // Title, location and description are carried over and safely encoded.
  it('carries the title, location and details', () => {
    const p = params(googleCalendarUrl(base));
    expect(p.get('text')).toBe('Big Apple Half (race day)');
    expect(p.get('location')).toBe('Central Park');
    expect(p.get('details')).toBe(base.description);
  });

  // Missing location or description are left out rather than sent empty.
  it('omits absent location and details', () => {
    const p = params(googleCalendarUrl({ ...base, location: undefined, description: undefined }));
    expect(p.has('location')).toBe(false);
    expect(p.has('details')).toBe(false);
  });

  // The Google link and the .ics come from the same event, so they agree on the times.
  it('matches the event built for the ics file', () => {
    const r = raceCalendarEvent(race, 'raceday', NOW);
    if ('error' in r) throw new Error(r.error);
    const p = params(googleCalendarUrl(r.event));
    expect(p.get('dates')).toBe('20270124T120000Z/20270124T160000Z');
    expect(p.get('text')).toBe('Fred Lebow Manhattan Half (race day)');
  });
});

describe('googleCalendarHref', () => {
  // A plain calendar link gains the Google target as its only query.
  it('adds the Google target to a bare link', () => {
    expect(googleCalendarHref('/api/races/brooklyn-half/calendar')).toBe(
      '/api/races/brooklyn-half/calendar?target=google',
    );
  });

  // A milestone or race-day link keeps its query and adds the target.
  it('keeps an existing query', () => {
    expect(googleCalendarHref('/api/races/brooklyn-half/calendar?milestone=4')).toBe(
      '/api/races/brooklyn-half/calendar?milestone=4&target=google',
    );
    expect(googleCalendarHref('/api/races/brooklyn-half/calendar?event=raceday')).toBe(
      '/api/races/brooklyn-half/calendar?event=raceday&target=google',
    );
  });
});

describe('calendarFormTarget', () => {
  // A bare link becomes the form action with nothing to carry.
  it('splits a bare link into an action with no params', () => {
    expect(calendarFormTarget('/api/races/brooklyn-half/calendar')).toEqual({
      action: '/api/races/brooklyn-half/calendar',
      params: [],
    });
  });

  // A milestone or race-day query is carried as hidden fields, since a GET form drops the action's query.
  it('carries the link query as hidden params', () => {
    expect(calendarFormTarget('/api/races/brooklyn-half/calendar?milestone=4')).toEqual({
      action: '/api/races/brooklyn-half/calendar',
      params: [['milestone', '4']],
    });
    expect(calendarFormTarget('/api/races/brooklyn-half/calendar?event=raceday').params).toEqual([['event', 'raceday']]);
  });
});
