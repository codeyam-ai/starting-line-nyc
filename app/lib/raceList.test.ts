import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, type RaceFilters } from '@/app/lib/filters';
import {
  filterAndSortRaces,
  isUrgent,
  milestoneEnd,
  nextMilestone,
  sortRaces,
  summarizeSavedRaces,
  toListItem,
  upcomingEdition,
  weeksToTrain,
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
