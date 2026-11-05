import { describe, expect, it } from 'vitest';
import {
  REPO_URL,
  buildTimeline,
  editionSources,
  entryMethod,
  nextDeadline,
  officialLink,
  openingDateUnknown,
  pageUrlFrom,
  registrationHasOpened,
  reportIssueUrl,
  sourceHost,
  timelineCalendarHref,
} from '@/app/lib/raceDetail';

const NOW = new Date('2026-10-26T20:00:00Z');
const m = (id: number, kind: string, at: string, timeKnown = true, note: string | null = null) => ({
  id,
  kind,
  at: new Date(at),
  timeKnown,
  tentative: false,
  note,
});

describe('buildTimeline', () => {
  // Milestones come out in date order with race day appended last.
  it('sorts milestones by date and appends race day', () => {
    const t = buildTimeline(
      [m(2, 'registration_closes', '2026-12-12T17:00:00Z', false), m(1, 'price_increase', '2026-11-09T17:00:00Z', false)],
      new Date('2026-12-13T13:00:00Z'),
      false,
      NOW,
    );
    expect(t.map((e) => e.kind)).toEqual(['price_increase', 'registration_closes', 'race_day']);
    expect(t[2]).toMatchObject({ id: null, timeKnown: true });
  });

  // Passed dates are past, the first remaining one is next, the rest upcoming.
  it('marks past, next and upcoming', () => {
    const t = buildTimeline(
      [m(1, 'price_increase', '2026-10-01T17:00:00Z'), m(2, 'price_increase', '2026-11-09T17:00:00Z'), m(3, 'registration_closes', '2026-12-12T17:00:00Z')],
      null,
      false,
      NOW,
    );
    expect(t.map((e) => e.state)).toEqual(['past', 'next', 'upcoming']);
  });

  // A date-only deadline on today's date is still next until the ET day ends.
  it('keeps a date-only deadline for today as next', () => {
    const t = buildTimeline([m(1, 'price_increase', '2026-10-26T16:00:00Z', false)], null, false, NOW);
    expect(t[0].state).toBe('next');
  });

  // With no source passed, every entry has no source.
  it('leaves source empty when none is given', () => {
    const t = buildTimeline([m(1, 'price_increase', '2026-11-09T17:00:00Z')], new Date('2026-12-13T13:00:00Z'), false, NOW);
    expect(t.map((e) => [e.sourceUrl, e.lastVerifiedAt])).toEqual([
      [null, null],
      [null, null],
    ]);
  });

  // Dates without their own source, race day included, fall back to the edition source.
  it('falls back to the edition source', () => {
    const source = { sourceUrl: 'https://nyrr.org/half', lastVerifiedAt: new Date('2026-10-28T15:00:00Z') };
    const t = buildTimeline(
      [m(1, 'price_increase', '2026-11-09T17:00:00Z')],
      new Date('2026-12-13T13:00:00Z'),
      false,
      NOW,
      true,
      source,
    );
    expect(t).toHaveLength(2);
    for (const e of t) {
      expect(e).toMatchObject({ sourceUrl: 'https://nyrr.org/half', lastVerifiedAt: '2026-10-28T15:00:00.000Z' });
    }
  });

  // A date with its own source keeps it instead of the edition source.
  it('prefers the date own source', () => {
    const source = { sourceUrl: 'https://nyrr.org/half', lastVerifiedAt: new Date('2026-10-28T15:00:00Z') };
    const own = {
      ...m(1, 'price_increase', '2026-11-09T17:00:00Z'),
      sourceUrl: 'https://nyrr.org/prices',
      lastVerifiedAt: new Date('2026-09-01T15:00:00Z'),
    };
    expect(buildTimeline([own], null, false, NOW, true, source)[0]).toMatchObject({
      sourceUrl: 'https://nyrr.org/prices',
      lastVerifiedAt: '2026-09-01T15:00:00.000Z',
    });
  });

  // A date with its own source but no check date does not borrow the edition check date.
  it('keeps a missing check date on a date with its own source', () => {
    const source = { sourceUrl: 'https://nyrr.org/half', lastVerifiedAt: new Date('2026-10-28T15:00:00Z') };
    const own = { ...m(1, 'price_increase', '2026-11-09T17:00:00Z'), sourceUrl: 'https://nyrr.org/prices', lastVerifiedAt: null };
    expect(buildTimeline([own], null, false, NOW, true, source)[0].lastVerifiedAt).toBeNull();
  });

  // With no race date and no milestones the timeline is empty.
  it('is empty when nothing is announced', () => {
    expect(buildTimeline([], null, false, NOW)).toEqual([]);
  });
});

describe('nextDeadline', () => {
  // The first non-past registration date is the next deadline; race day never is.
  it('skips past entries and race day', () => {
    const t = buildTimeline(
      [m(1, 'price_increase', '2026-10-01T17:00:00Z'), m(2, 'charity_closes', '2027-03-30T13:00:00Z')],
      new Date('2027-04-03T13:00:00Z'),
      false,
      NOW,
    );
    expect(nextDeadline(t)?.kind).toBe('charity_closes');
    expect(nextDeadline(buildTimeline([], new Date('2027-04-03T13:00:00Z'), false, NOW))).toBeNull();
  });
});

describe('timelineCalendarHref', () => {
  // Race day and milestones link to their own calendar downloads.
  it('builds race day and milestone links', () => {
    const [ms, rd] = buildTimeline([m(7, 'price_increase', '2026-11-09T17:00:00Z')], new Date('2026-12-13T13:00:00Z'), false, NOW);
    expect(timelineCalendarHref('/api/races/x/calendar', ms)).toBe('/api/races/x/calendar?milestone=7');
    expect(timelineCalendarHref('/api/races/x/calendar', rd)).toBe('/api/races/x/calendar?event=raceday');
  });
});

describe('entryMethod', () => {
  // Known methods get a plain-language title and explanation.
  it('explains known entry methods', () => {
    expect(entryMethod('qualification').title).toBe('Qualifying standard');
    expect(entryMethod('lottery').explain).toMatch(/drawn at random/);
  });

  // An unknown method is shown as-is rather than hidden.
  it('falls back to the raw method', () => {
    expect(entryMethod('invite')).toEqual({ title: 'invite', explain: '' });
  });
});

describe('officialLink', () => {
  // The registration page wins and is labelled Register.
  it('prefers the registration link', () => {
    expect(officialLink({ registrationUrl: 'https://r', sourceUrl: 'https://s' }, 'https://o')).toEqual({
      href: 'https://r',
      label: 'Register on the official site',
    });
  });

  // Without one it falls back to the source, then the organizer, labelled Visit.
  it('falls back to the source then the organizer', () => {
    expect(officialLink({ registrationUrl: null, sourceUrl: 'https://s' }, 'https://o')?.href).toBe('https://s');
    expect(officialLink({ registrationUrl: null, sourceUrl: null }, 'https://o')).toEqual({
      href: 'https://o',
      label: 'Visit the official site',
    });
    expect(officialLink({ registrationUrl: null, sourceUrl: null }, null)).toBeNull();
  });
});

describe('sourceHost', () => {
  // The host is shown without www.
  it('strips www and handles missing or bad URLs', () => {
    expect(sourceHost('https://www.sassquadtrailrunning.com/bigbearsquatchnorth')).toBe('sassquadtrailrunning.com');
    expect(sourceHost(null)).toBeNull();
    expect(sourceHost('not a url')).toBeNull();
  });
});

describe('pageUrlFrom', () => {
  // Forwarded headers from the Codespaces proxy are respected.
  it('uses forwarded host and protocol', () => {
    const h = new Map([['x-forwarded-host', 'app.example.dev'], ['x-forwarded-proto', 'https']]);
    expect(pageUrlFrom({ get: (k) => h.get(k) ?? null }, 'escarpment-trail-run')).toBe('https://app.example.dev/races/escarpment-trail-run');
  });

  // Plain localhost requests become http URLs.
  it('defaults to http on localhost', () => {
    const h = new Map([['host', 'localhost:3000']]);
    expect(pageUrlFrom({ get: (k) => h.get(k) ?? null }, 'x')).toBe('http://localhost:3000/races/x');
  });
});

describe('reportIssueUrl', () => {
  // The issue is pre-filled with the race, edition, page link and a label.
  it('pre-fills a GitHub issue', () => {
    const url = new URL(reportIssueUrl({ name: 'Great Gobble 5K' }, 2026, 'https://site/races/g'));
    expect(url.origin + url.pathname).toBe(`${REPO_URL}/issues/new`);
    expect(url.searchParams.get('title')).toBe('Race detail: Great Gobble 5K (2026)');
    expect(url.searchParams.get('body')).toContain('https://site/races/g');
    expect(url.searchParams.get('labels')).toBe('race-data');
  });
});

const entry = (kind: string) => ({
  id: 1,
  kind,
  at: '2026-12-01T17:00:00Z',
  timeKnown: true,
  tentative: false,
  note: null,
  sourceUrl: null,
  lastVerifiedAt: null,
  state: 'upcoming' as const,
});

describe('openingDateUnknown', () => {
  // With no dates at all, the opening date is unknown.
  it('is true for an empty timeline', () => {
    expect(openingDateUnknown([])).toBe(true);
  });

  // Other dates do not count as an opening date.
  it('is true when only non-opening dates are listed', () => {
    expect(openingDateUnknown([entry('price_increase'), entry('registration_closes'), entry('race_day')])).toBe(true);
  });

  // A published registration opening is a known opening date.
  it('is false when registration opening is listed', () => {
    expect(openingDateUnknown([entry('registration_opens'), entry('race_day')])).toBe(false);
  });

  // For lottery races, the lottery opening counts as the opening date.
  it('is false when the lottery opening is listed', () => {
    expect(openingDateUnknown([entry('lottery_opens')])).toBe(false);
  });
});

describe('registrationHasOpened', () => {
  // Every status that can only follow an opening counts as already opened.
  it('is true for statuses after registration opened', () => {
    for (const s of ['open', 'lottery_open', 'waitlist', 'sold_out', 'closed']) {
      expect(registrationHasOpened(s)).toBe(true);
    }
  });

  // Statuses before opening do not count.
  it('is false before registration opens', () => {
    expect(registrationHasOpened('opening_soon')).toBe(false);
    expect(registrationHasOpened('not_announced')).toBe(false);
  });

  // An unrecognized status is not assumed to be open.
  it('is false for an unknown status', () => {
    expect(registrationHasOpened('')).toBe(false);
    expect(registrationHasOpened('something_new')).toBe(false);
  });
});

describe('editionSources', () => {
  const CHECKED = new Date('2026-10-28T15:00:00Z');

  // No edition at all means no sources panel.
  it('returns null without an edition', () => {
    expect(editionSources(null, NOW)).toBeNull();
    expect(editionSources(undefined, NOW)).toBeNull();
  });

  // A recent check passes through as an ISO date and is not stale.
  it('passes a recent check through', () => {
    expect(editionSources({ sourceUrl: 'https://nyrr.org', lastVerifiedAt: CHECKED }, NOW)).toEqual({
      sourceUrl: 'https://nyrr.org',
      lastVerifiedAt: '2026-10-28T15:00:00.000Z',
      stale: false,
    });
  });

  // A check more than 30 days old is flagged stale.
  it('flags an old check as stale', () => {
    const later = new Date('2026-12-15T00:00:00Z');
    expect(editionSources({ sourceUrl: 'https://nyrr.org', lastVerifiedAt: CHECKED }, later)?.stale).toBe(true);
  });

  // Never checked counts as stale, with no check date.
  it('flags a never-checked edition as stale', () => {
    expect(editionSources({ sourceUrl: null, lastVerifiedAt: null }, NOW)).toEqual({
      sourceUrl: null,
      lastVerifiedAt: null,
      stale: true,
    });
  });
});
