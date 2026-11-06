import { describe, expect, it } from 'vitest';
import {
  allSummariesLoaded,
  goneRaceMessage,
  goneRaceName,
  groupSavedRaces,
  listedRegistrationStatuses,
  parseSummarySlugs,
  raceDay,
  registrationChange,
  savedCountLabel,
  summariesKey,
  summariesUrl,
} from '@/app/lib/myRaces';
import type { RaceListItem, SavedRaceSummary } from '@/app/lib/raceList';
import type { SavedRace, SavedRaces } from '@/app/lib/savedRaces';

function listed(slug: string, raceDate: string | null): SavedRaceSummary {
  const race = { slug, name: slug, raceDate, registrationStatus: 'open' } as RaceListItem;
  return { slug, state: 'listed', race };
}

const save = (status: SavedRace['status'], extra: Partial<SavedRace> = {}): SavedRace => ({
  status,
  savedAt: '2026-10-01T00:00:00.000Z',
  ...extra,
});

describe('raceDay', () => {
  // A listed race sorts by its race day.
  it('returns the race day in ms for a listed race', () => {
    expect(raceDay(listed('a', '2026-11-08T14:00:00.000Z'))).toBe(Date.parse('2026-11-08T14:00:00.000Z'));
  });
  // Undated, unlisted and unknown races sort last.
  it('returns Infinity when there is no date to sort by', () => {
    expect(raceDay(listed('a', null))).toBe(Infinity);
    expect(raceDay({ slug: 'a', state: 'not-listed' })).toBe(Infinity);
    expect(raceDay({ slug: 'a', state: 'no-upcoming', name: 'A' })).toBe(Infinity);
    expect(raceDay(undefined)).toBe(Infinity);
  });
  // A garbled date sorts last rather than breaking the sort with NaN.
  it('returns Infinity for an unparseable date', () => {
    expect(raceDay(listed('a', 'not a date'))).toBe(Infinity);
  });
});

describe('groupSavedRaces', () => {
  // Groups run Signed up, Considering, Interested, each soonest first.
  it('orders groups by status and races by race day', () => {
    const saved: SavedRaces = {
      late: save('interested'),
      soon: save('interested'),
      mine: save('signed-up'),
      maybe: save('considering'),
    };
    const summaries = {
      late: listed('late', '2027-03-01T00:00:00.000Z'),
      soon: listed('soon', '2026-12-01T00:00:00.000Z'),
      mine: listed('mine', '2027-01-01T00:00:00.000Z'),
      maybe: listed('maybe', null),
    };
    expect(groupSavedRaces(saved, summaries)).toEqual([
      { status: 'signed-up', slugs: ['mine'] },
      { status: 'considering', slugs: ['maybe'] },
      { status: 'interested', slugs: ['soon', 'late'] },
    ]);
  });
  // A status nobody picked gets no group.
  it('leaves out empty groups', () => {
    const groups = groupSavedRaces({ a: save('considering') }, { a: listed('a', null) });
    expect(groups.map((g) => g.status)).toEqual(['considering']);
  });
  // Races with no date, or no listing, follow the dated ones, by slug.
  it('puts undated races after dated ones in slug order', () => {
    const saved: SavedRaces = { zed: save('interested'), abe: save('interested'), dated: save('interested') };
    const summaries: Record<string, SavedRaceSummary> = {
      zed: { slug: 'zed', state: 'not-listed' },
      abe: listed('abe', null),
      dated: listed('dated', '2027-01-01T00:00:00.000Z'),
    };
    expect(groupSavedRaces(saved, summaries)[0].slugs).toEqual(['dated', 'abe', 'zed']);
  });
  // Nothing saved means no groups.
  it('returns no groups for nothing saved', () => {
    expect(groupSavedRaces({}, {})).toEqual([]);
  });
});

describe('savedCountLabel', () => {
  // One race reads singular.
  it('uses the singular for one', () => {
    expect(savedCountLabel(1)).toBe('1 race');
  });
  // Any other count reads plural.
  it('uses the plural otherwise', () => {
    expect(savedCountLabel(0)).toBe('0 races');
    expect(savedCountLabel(4)).toBe('4 races');
  });
});

describe('goneRaceName', () => {
  // A race that still exists shows its current name.
  it('prefers the current name of a race with no upcoming edition', () => {
    expect(goneRaceName('x', save('interested', { name: 'Old' }), { slug: 'x', state: 'no-upcoming', name: 'New' })).toBe(
      'New',
    );
  });
  // A delisted race shows the name recorded at save.
  it('uses the saved name for a race no longer listed', () => {
    expect(goneRaceName('x', save('interested', { name: 'Saved Name' }), { slug: 'x', state: 'not-listed' })).toBe(
      'Saved Name',
    );
  });
  // Saves made before names were recorded fall back to the slug.
  it('falls back to a name made from the slug', () => {
    expect(goneRaceName('queens-10k', save('interested'), { slug: 'queens-10k', state: 'not-listed' })).toBe(
      'Queens 10K',
    );
  });
});

describe('goneRaceMessage', () => {
  // Each missing-listing reason has its own explanation.
  it('explains each reason differently', () => {
    expect(goneRaceMessage('no-upcoming')).toMatch(/no upcoming date/);
    expect(goneRaceMessage('not-listed')).toMatch(/no longer listed/);
  });
});

describe('registrationChange', () => {
  // A changed status reads as labels, before and after.
  it('reports the change in plain labels', () => {
    expect(registrationChange(save('interested', { registrationAtSave: 'not_announced' }), 'open')).toEqual({
      from: 'Not open yet',
      to: 'Open',
    });
  });
  // No change, nothing to flag.
  it('returns null when the status is unchanged', () => {
    expect(registrationChange(save('interested', { registrationAtSave: 'open' }), 'open')).toBeNull();
  });
  // Old saves without a recorded status never flag a change.
  it('returns null when no status was recorded at save', () => {
    expect(registrationChange(save('interested'), 'open')).toBeNull();
  });
  // Unknown status codes show as-is instead of disappearing.
  it('shows unknown status codes verbatim', () => {
    expect(registrationChange(save('interested', { registrationAtSave: 'mystery' }), 'open')).toEqual({
      from: 'mystery',
      to: 'Open',
    });
  });
});

describe('summariesKey', () => {
  // The key ignores save order, so reordering never refetches.
  it('sorts and joins the saved slugs', () => {
    expect(summariesKey({ b: save('interested'), a: save('considering') })).toBe('a,b');
  });
  // Before hydration there is no key.
  it('returns null before saves are read', () => {
    expect(summariesKey(null)).toBeNull();
  });
  // Nothing saved gives an empty key, which needs no fetch.
  it('returns an empty key for nothing saved', () => {
    expect(summariesKey({})).toBe('');
  });
});

describe('summariesUrl', () => {
  // The slug list is URL-encoded into the query.
  it('builds the summaries request URL', () => {
    expect(summariesUrl('a,b')).toBe('/api/races/summaries?slugs=a%2Cb');
  });
});

describe('parseSummarySlugs', () => {
  // Blanks and repeats are dropped, whitespace trimmed.
  it('splits trims and dedupes', () => {
    expect(parseSummarySlugs(' a, b,,a ,c')).toEqual(['a', 'b', 'c']);
  });
  // A missing parameter means no slugs.
  it('returns nothing for a missing parameter', () => {
    expect(parseSummarySlugs(null)).toEqual([]);
    expect(parseSummarySlugs('')).toEqual([]);
  });
  // The request is capped so one URL cannot ask for the whole table.
  it('caps the number of slugs', () => {
    expect(parseSummarySlugs('a,b,c,d', 2)).toEqual(['a', 'b']);
    expect(parseSummarySlugs(Array.from({ length: 150 }, (_, i) => `r${i}`).join(','))).toHaveLength(100);
  });
});

describe('allSummariesLoaded', () => {
  // Not loaded until every saved race has a summary.
  it('is false while any saved race lacks a summary', () => {
    expect(allSummariesLoaded({ a: save('interested'), b: save('interested') }, { a: listed('a', null) })).toBe(false);
    expect(allSummariesLoaded({ a: save('interested') }, null)).toBe(false);
  });
  // Loaded once every saved race has one.
  it('is true when every saved race has a summary', () => {
    expect(allSummariesLoaded({ a: save('interested') }, { a: listed('a', null), extra: listed('extra', null) })).toBe(
      true,
    );
  });
});

describe('listedRegistrationStatuses', () => {
  // Each listed race maps to its current registration status, keyed by slug.
  it('maps listed races to their registration status', () => {
    const closed: SavedRaceSummary = {
      slug: 'b',
      state: 'listed',
      race: { slug: 'b', registrationStatus: 'closed' } as RaceListItem,
    };
    expect(listedRegistrationStatuses({ a: listed('a', null), b: closed })).toEqual({ a: 'open', b: 'closed' });
  });

  // A race with no listing has no status to record, so it is left out rather than guessed.
  it('leaves out races that are not listed or have no upcoming date', () => {
    expect(
      listedRegistrationStatuses({
        a: listed('a', null),
        gone: { slug: 'gone', state: 'not-listed' },
        past: { slug: 'past', state: 'no-upcoming', name: 'Past' },
      }),
    ).toEqual({ a: 'open' });
  });

  // No summaries means nothing to record.
  it('returns an empty map for no summaries', () => {
    expect(listedRegistrationStatuses({})).toEqual({});
  });
});
