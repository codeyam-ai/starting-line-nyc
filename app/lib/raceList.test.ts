import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, type RaceFilters } from '@/app/lib/filters';
import {
  filterAndSortRaces,
  isStale,
  isUrgent,
  latestPastEdition,
  milestoneEnd,
  nextMilestone,
  sortRaces,
  summarizeSavedRaces,
  toListItem,
  upcomingEdition,
  weeksToTrain,
  weeksToTrainLabel,
  type RaceRecord,
} from '@/app/lib/raceList';

const NOW = new Date('2026-10-26T14:00:00Z');
const d = (iso: string) => new Date(iso);

function race(over: Partial<RaceRecord> & { slug: string }): RaceRecord {
  return {
    name: over.slug,
    terrain: 'road',
    distanceMiles: 13.1,
    elevationGainFt: null,
    locationName: 'Central Park',
    area: 'Manhattan',
    photoUrl: null,
    photoAlt: null,
    organizer: { name: 'NYRR' },
    editions: [
      {
        year: 2027,
        raceDate: d('2027-01-24T12:00:00Z'),
        raceDateTentative: false,
        registrationStatus: 'open',
        entryMethod: 'open',
        isSample: true,
        milestones: [],
      },
    ],
    ...over,
  };
}

const withEdition = (r: RaceRecord, e: Partial<RaceRecord['editions'][number]>): RaceRecord => ({
  ...r,
  editions: [{ ...r.editions[0], ...e }],
});

describe('summarizeSavedRaces', () => {
  // A race with an upcoming edition comes back as a full list row.
  it('summarizes a listed race as its list item', () => {
    const [s] = summarizeSavedRaces(['a'], [race({ slug: 'a', name: 'A Half' })], NOW);
    expect(s).toMatchObject({ slug: 'a', state: 'listed', race: { slug: 'a', name: 'A Half' } });
  });

  // A race that has already run keeps its name so the runner can recognise it.
  it('marks a race with no upcoming edition and keeps its name', () => {
    const past = withEdition(race({ slug: 'old', name: 'Old Race' }), { raceDate: d('2026-01-01T12:00:00Z') });
    expect(summarizeSavedRaces(['old'], [past], NOW)).toEqual([{ slug: 'old', state: 'no-upcoming', name: 'Old Race' }]);
  });

  // A slug the database doesn't know is reported, never dropped.
  it('marks an unknown slug as not listed', () => {
    expect(summarizeSavedRaces(['gone'], [], NOW)).toEqual([{ slug: 'gone', state: 'not-listed' }]);
  });

  // Results follow the requested order, not the database order.
  it('keeps the requested slug order', () => {
    const out = summarizeSavedRaces(['b', 'x', 'a'], [race({ slug: 'a' }), race({ slug: 'b' })], NOW);
    expect(out.map((s) => `${s.slug}:${s.state}`)).toEqual(['b:listed', 'x:not-listed', 'a:listed']);
  });
});

describe('upcomingEdition', () => {
  // Last year's finished edition is skipped in favour of the next one.
  it('skips editions whose race day has passed', () => {
    const editions = [
      { year: 2026, raceDate: d('2026-01-25T12:00:00Z') },
      { year: 2027, raceDate: d('2027-01-24T12:00:00Z') },
    ];
    expect(upcomingEdition(editions, NOW)?.year).toBe(2027);
  });

  // An edition with no announced date still counts as upcoming.
  it('treats an unannounced date as upcoming', () => {
    expect(upcomingEdition([{ year: 2027, raceDate: null }], NOW)?.year).toBe(2027);
  });

  // Editions are considered in year order even if stored out of order.
  it('picks the earliest upcoming year regardless of input order', () => {
    const editions = [
      { year: 2028, raceDate: d('2028-01-23T12:00:00Z') },
      { year: 2027, raceDate: d('2027-01-24T12:00:00Z') },
    ];
    expect(upcomingEdition(editions, NOW)?.year).toBe(2027);
  });

  // With only past editions there is nothing to enter.
  it('returns null when every edition is past', () => {
    expect(upcomingEdition([{ year: 2026, raceDate: d('2026-01-25T12:00:00Z') }], NOW)).toBeNull();
  });
});

describe('nextMilestone', () => {
  // The soonest future milestone wins; past ones are ignored.
  it('returns the earliest future milestone', () => {
    const ms = [{ at: d('2026-12-01T00:00:00Z') }, { at: d('2026-10-01T00:00:00Z') }, { at: d('2026-11-10T17:00:00Z') }];
    expect(nextMilestone(ms, NOW)?.at.toISOString()).toBe('2026-11-10T17:00:00.000Z');
  });

  // No future milestones means no next deadline.
  it('returns null when nothing is upcoming', () => {
    expect(nextMilestone([{ at: d('2026-10-01T00:00:00Z') }], NOW)).toBeNull();
    expect(nextMilestone([], NOW)).toBeNull();
  });
});

describe('weeksToTrain', () => {
  // Whole weeks are counted, rounding down.
  it('rounds down to whole weeks', () => {
    expect(weeksToTrain(d('2027-01-24T12:00:00Z'), NOW)).toBe(12);
    expect(weeksToTrain(d('2026-11-02T14:00:00Z'), NOW)).toBe(1);
  });

  // An unknown race date gives no week count.
  it('returns null for an unknown date', () => {
    expect(weeksToTrain(null, NOW)).toBeNull();
  });
});

describe('weeksToTrainLabel', () => {
  // A single week reads in the singular.
  it('says week for exactly one week', () => {
    expect(weeksToTrainLabel(1)).toBe('week to train');
  });

  // Any other count reads in the plural.
  it('says weeks for other counts', () => {
    expect(weeksToTrainLabel(2)).toBe('weeks to train');
    expect(weeksToTrainLabel(12)).toBe('weeks to train');
  });

  // Zero weeks left is still plural.
  it('says weeks for zero', () => {
    expect(weeksToTrainLabel(0)).toBe('weeks to train');
  });
});

describe('isUrgent', () => {
  // Deadlines inside three weeks are urgent, including exactly 21 days out.
  it('is true within three weeks', () => {
    expect(isUrgent('2026-11-10T17:00:00Z', NOW)).toBe(true);
    expect(isUrgent('2026-11-16T14:00:00Z', NOW)).toBe(true);
  });

  // Later deadlines, past deadlines and missing deadlines are not urgent.
  it('is false beyond three weeks, in the past, or missing', () => {
    expect(isUrgent('2026-11-18T04:59:00Z', NOW)).toBe(false);
    expect(isUrgent('2026-10-25T00:00:00Z', NOW)).toBe(false);
    expect(isUrgent(null, NOW)).toBe(false);
    expect(isUrgent(undefined, NOW)).toBe(false);
  });

  // A date-only deadline stored at noon ET is still urgent later the same day.
  it('keeps a date-only deadline urgent until its ET day ends', () => {
    const evening = new Date('2026-10-26T23:00:00Z');
    expect(isUrgent('2026-10-26T16:00:00Z', evening, false)).toBe(true);
    expect(isUrgent('2026-10-26T16:00:00Z', evening, true)).toBe(false);
  });
});

describe('milestoneEnd', () => {
  // Exact-time milestones end at their time; date-only ones at the end of that ET day.
  it('extends date-only milestones to the end of the day', () => {
    const at = new Date('2026-11-09T17:00:00Z');
    expect(milestoneEnd({ at, timeKnown: true })).toEqual(at);
    expect(milestoneEnd({ at, timeKnown: false }).toISOString()).toBe('2026-11-10T04:59:00.000Z');
  });
});

describe('nextMilestone with date-only deadlines', () => {
  // A date-only deadline for today is still the next milestone in the evening.
  it('keeps today as next until the day ends', () => {
    const ms = [
      { at: d('2026-10-26T16:00:00Z'), timeKnown: false },
      { at: d('2026-11-16T17:00:00Z'), timeKnown: false },
    ];
    expect(nextMilestone(ms, new Date('2026-10-26T23:00:00Z'))?.at.toISOString()).toBe('2026-10-26T16:00:00.000Z');
  });
});

describe('toListItem', () => {
  // A race flattens into a row with its next milestone and weeks to train.
  it('flattens the upcoming edition into a list item', () => {
    const r = withEdition(race({ slug: 'manhattan-half', name: 'Manhattan Half' }), {
      registrationStatus: 'opening_soon',
      milestones: [{ kind: 'registration_opens', at: d('2026-11-10T17:00:00Z'), timeKnown: true, tentative: false }],
    });
    expect(toListItem(r, NOW)).toMatchObject({
      slug: 'manhattan-half',
      organizer: 'NYRR',
      raceDate: '2027-01-24T12:00:00.000Z',
      registrationStatus: 'opening_soon',
      nextMilestone: { kind: 'registration_opens', at: '2026-11-10T17:00:00.000Z', tentative: false },
      weeksToTrain: 12,
    });
  });

  // The opening date is kept even once it has passed, using the earliest one.
  it('keeps the earliest registration opening, past or future', () => {
    const r = withEdition(race({ slug: 'r' }), {
      milestones: [
        { kind: 'registration_closes', at: d('2026-12-01T17:00:00Z'), timeKnown: true, tentative: false },
        { kind: 'registration_opens', at: d('2026-11-20T17:00:00Z'), timeKnown: true, tentative: false },
        { kind: 'registration_opens', at: d('2026-09-01T17:00:00Z'), timeKnown: true, tentative: false },
      ],
    });
    expect(toListItem(r, NOW)?.registrationOpens).toBe('2026-09-01T17:00:00.000Z');
  });

  // No opening milestone means the opening date is not announced.
  it('sets registration opens to null when no opening is announced', () => {
    expect(toListItem(race({ slug: 'r' }), NOW)?.registrationOpens).toBeNull();
  });

  // The row carries the edition source and its check date.
  it('carries the edition source and check date', () => {
    const r = withEdition(race({ slug: 'r' }), {
      sourceUrl: 'https://nyrr.org/half',
      lastVerifiedAt: d('2026-10-28T15:00:00Z'),
    });
    expect(toListItem(r, NOW)).toMatchObject({
      sourceUrl: 'https://nyrr.org/half',
      lastVerifiedAt: '2026-10-28T15:00:00.000Z',
    });
  });

  // Without a source on file, both fields are null.
  it('sets source fields to null when absent', () => {
    expect(toListItem(race({ slug: 'r' }), NOW)).toMatchObject({ sourceUrl: null, lastVerifiedAt: null });
  });

  // A race with no upcoming edition is left off the list.
  it('returns null when the race has no upcoming edition', () => {
    expect(toListItem(withEdition(race({ slug: 'old' }), { raceDate: d('2026-01-01T12:00:00Z') }), NOW)).toBeNull();
  });
});

describe('sortRaces', () => {
  const item = (slug: string, raceDate: string | null, next: string | null) =>
    ({ slug, raceDate, nextMilestone: next ? { kind: 'registration_closes', at: next, tentative: false } : null }) as never;

  // By next deadline, unknown deadlines go last and ties fall back to race day.
  it('sorts by next deadline with unknown last', () => {
    const sorted = sortRaces(
      [item('a', '2027-05-01', null), item('b', '2027-03-01', '2026-12-01'), item('c', '2027-02-01', '2026-12-01'), item('d', '2027-04-01', '2026-11-01')],
      'deadline',
    );
    expect(sorted.map((s: { slug: string }) => s.slug)).toEqual(['d', 'c', 'b', 'a']);
  });

  // By race day, unknown race dates go last.
  it('sorts by race day with unknown last', () => {
    const sorted = sortRaces([item('a', null, null), item('b', '2027-03-01', null), item('c', '2027-02-01', null)], 'raceday');
    expect(sorted.map((s: { slug: string }) => s.slug)).toEqual(['c', 'b', 'a']);
  });

  const opener = (slug: string, raceDate: string, opens: string | null, registrationStatus = 'not_announced') =>
    ({ slug, name: slug, raceDate, registrationOpens: opens, registrationStatus, nextMilestone: null, distanceMiles: 13.1 }) as never;
  const slugs = (xs: { slug: string }[]) => xs.map((s) => s.slug);

  // Openings still ahead come first, soonest first, even when the race is later.
  it('puts upcoming registration openings first, soonest first', () => {
    const sorted = sortRaces(
      [opener('late', '2027-01-01', '2026-12-20T17:00:00Z'), opener('soon', '2027-06-01', '2026-11-05T17:00:00Z')],
      'opens',
      NOW,
    );
    expect(slugs(sorted)).toEqual(['soon', 'late']);
  });

  // Races already open sit after upcoming openings and before unannounced ones.
  it('places already open races between upcoming and unannounced', () => {
    const sorted = sortRaces(
      [
        opener('unannounced', '2026-11-20', null),
        opener('open-now', '2027-03-01', null, 'open'),
        opener('opened-earlier', '2027-02-01', '2026-09-01T17:00:00Z', 'opening_soon'),
        opener('upcoming', '2027-05-01', '2026-11-30T17:00:00Z'),
      ],
      'opens',
      NOW,
    );
    expect(slugs(sorted)).toEqual(['upcoming', 'opened-earlier', 'open-now', 'unannounced']);
  });

  // Lottery and waitlist races count as already enterable.
  it('treats lottery open and waitlist as already enterable', () => {
    const sorted = sortRaces(
      [opener('closed', '2026-12-01', null, 'closed'), opener('lottery', '2027-04-01', null, 'lottery_open'), opener('waitlist', '2027-03-01', null, 'waitlist')],
      'opens',
      NOW,
    );
    expect(slugs(sorted)).toEqual(['waitlist', 'lottery', 'closed']);
  });

  // Sold out, closed and opening soon with no date all go last, by race day.
  it('orders races with no opening date by race day at the end', () => {
    const sorted = sortRaces(
      [opener('b', '2027-02-01', null, 'sold_out'), opener('a', '2026-12-01', null, 'opening_soon'), opener('c', '2027-03-01', null, 'closed')],
      'opens',
      NOW,
    );
    expect(slugs(sorted)).toEqual(['a', 'b', 'c']);
  });

  // The cutoff between upcoming and past openings is the given time, not the real clock.
  it('uses the passed in time to decide which openings are ahead', () => {
    const items = [opener('x', '2027-03-01', '2026-11-05T17:00:00Z'), opener('y', '2027-01-01', null, 'open')];
    expect(slugs(sortRaces(items, 'opens', NOW))).toEqual(['x', 'y']);
    expect(slugs(sortRaces(items, 'opens', new Date('2026-12-01T00:00:00Z')))).toEqual(['y', 'x']);
  });

  // By distance, shortest first; equal distances fall back to race day.
  it('sorts by distance shortest first with race day as tie break', () => {
    const run = (slug: string, miles: number, raceDate: string) =>
      ({ slug, name: slug, raceDate, distanceMiles: miles, nextMilestone: null, registrationOpens: null, registrationStatus: 'open' }) as never;
    const sorted = sortRaces(
      [run('ultra', 31.1, '2027-01-01'), run('half-late', 13.1, '2027-04-01'), run('5k', 3.1, '2027-06-01'), run('half-early', 13.1, '2027-02-01')],
      'distance',
    );
    expect(slugs(sorted)).toEqual(['5k', 'half-early', 'half-late', 'ultra']);
  });

  // Full ties fall back to name so the order never jumps around.
  it('breaks full ties by name', () => {
    const sorted = sortRaces([opener('Zebra Run', '2027-01-01', null), opener('Apple Run', '2027-01-01', null)], 'opens', NOW);
    expect(slugs(sorted)).toEqual(['Apple Run', 'Zebra Run']);
  });

  // Sorting never mutates the list it was given.
  it('returns a new array and leaves the input untouched', () => {
    const items = [opener('b', '2027-02-01', null), opener('a', '2027-01-01', null)];
    const sorted = sortRaces(items, 'raceday');
    expect(sorted).not.toBe(items);
    expect(slugs(items)).toEqual(['b', 'a']);
  });
});

describe('filterAndSortRaces', () => {
  const half = race({ slug: 'half' });
  const trail = race({ slug: 'trail-half', terrain: 'trail', locationName: 'Beacon, NY', area: 'Hudson Valley', organizer: { name: 'Hudson Valley Trail Co.' } });
  const k15 = race({ slug: 'k15', distanceMiles: 9.3 });
  const ultra = race({ slug: 'ultra', distanceMiles: 31.1 });
  const far = withEdition(race({ slug: 'far-half' }), { raceDate: d('2027-05-15T11:00:00Z') });
  const lottery = withEdition(race({ slug: 'lottery-half' }), { entryMethod: 'lottery', registrationStatus: 'lottery_open' });
  const soon = withEdition(race({ slug: 'soon-half' }), { registrationStatus: 'opening_soon', raceDate: d('2026-12-12T13:00:00Z') });
  const all = [half, trail, k15, ultra, far, lottery, soon];
  const run = (f: Partial<RaceFilters>) => filterAndSortRaces(all, { ...DEFAULT_FILTERS, ...f }, NOW).map((r) => r.slug).sort();

  // The default search keeps halves inside six months and drops the May race.
  it('applies distance and six month window by default', () => {
    expect(run({})).toEqual(['half', 'lottery-half', 'soon-half', 'trail-half']);
  });

  // Any distance and any time returns every race.
  it('returns everything with any distance and any time', () => {
    expect(run({ distance: 'any', when: 'any' })).toHaveLength(all.length);
  });

  // Ultras are anything longer than a marathon.
  it('matches ultras beyond marathon distance', () => {
    expect(run({ distance: 'ultra', when: 'any' })).toEqual(['ultra']);
  });

  // Terrain and free-text search narrow by trail and by place or organizer.
  it('filters by terrain and by search text across name, place and organizer', () => {
    expect(run({ terrain: 'trail' })).toEqual(['trail-half']);
    expect(run({ q: 'hudson' })).toEqual(['trail-half']);
    expect(run({ q: 'nowhere' })).toEqual([]);
  });

  // Status chips combine: lottery entry, opening soon, open, and 12 plus weeks.
  it('filters by status chips', () => {
    expect(run({ status: ['lottery'] })).toEqual(['lottery-half']);
    expect(run({ status: ['opening_soon'] })).toEqual(['soon-half']);
    expect(run({ status: ['open'] })).toEqual(['half', 'trail-half']);
    expect(run({ status: ['train12'] })).toEqual(['half', 'lottery-half', 'trail-half']);
  });
});

describe('latestPastEdition', () => {
  const ed = (year: number, raceDate: string | null) => ({ year, raceDate: raceDate ? d(raceDate) : null });

  // With no editions there is nothing past.
  it('returns null for no editions', () => {
    expect(latestPastEdition([], NOW)).toBeNull();
  });

  // Only future editions means nothing past.
  it('returns null when every edition is upcoming', () => {
    expect(latestPastEdition([ed(2027, '2027-01-24T12:00:00Z')], NOW)).toBeNull();
  });

  // An undated edition is never treated as past.
  it('ignores editions without a race date', () => {
    expect(latestPastEdition([ed(2026, null)], NOW)).toBeNull();
  });

  // Of several past editions, the most recent year wins regardless of order.
  it('picks the most recent past year', () => {
    const list = [
      ed(2024, '2024-11-03T12:00:00Z'),
      ed(2026, '2026-03-15T12:00:00Z'),
      ed(2025, '2025-03-16T12:00:00Z'),
      ed(2027, '2027-03-14T12:00:00Z'),
    ];
    expect(latestPastEdition(list, NOW)?.year).toBe(2026);
  });
});

describe('isStale', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const ago = (days: number) => new Date(NOW.getTime() - days * DAY);

  // A check 29 days ago is fresh.
  it('is false at 29 days', () => {
    expect(isStale(ago(29), NOW)).toBe(false);
  });

  // Exactly 30 days is still fresh; only older than 30 days is stale.
  it('is false at exactly 30 days', () => {
    expect(isStale(ago(30), NOW)).toBe(false);
  });

  // A check 31 days ago is stale.
  it('is true at 31 days', () => {
    expect(isStale(ago(31), NOW)).toBe(true);
  });

  // Never checked is always stale.
  it('is true when never checked', () => {
    expect(isStale(null, NOW)).toBe(true);
    expect(isStale(undefined, NOW)).toBe(true);
  });

  // ISO strings work the same as dates.
  it('accepts an ISO string', () => {
    expect(isStale(ago(31).toISOString(), NOW)).toBe(true);
    expect(isStale(ago(1).toISOString(), NOW)).toBe(false);
  });

  // The threshold can be overridden.
  it('honours a custom threshold', () => {
    expect(isStale(ago(8), NOW, 7)).toBe(true);
  });
});
