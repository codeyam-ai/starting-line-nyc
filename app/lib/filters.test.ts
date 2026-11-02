import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  SORTS,
  activeFilterChips,
  filterHref,
  parseFilters,
  raceCountLabel,
  resultsHeading,
  toggleStatus,
} from '@/app/lib/filters';

describe('parseFilters', () => {
  // No query string gives the default search: half marathons, next 6 months.
  it('returns the defaults for empty params', () => {
    expect(parseFilters({})).toEqual(DEFAULT_FILTERS);
  });

  // Recognised values are read and the search text is trimmed.
  it('reads valid values and trims the query', () => {
    expect(parseFilters({ q: '  Brooklyn ', distance: 'ultra', when: 'any', terrain: 'trail', sort: 'raceday' })).toEqual({
      q: 'Brooklyn',
      distance: 'ultra',
      when: 'any',
      terrain: 'trail',
      status: [],
      sort: 'raceday',
    });
  });

  // Unknown values fall back to defaults instead of breaking the page.
  it('falls back to defaults for unknown values', () => {
    const f = parseFilters({ distance: 'mile', when: '2y', terrain: 'track', sort: 'price' });
    expect(f.distance).toBe('half');
    expect(f.when).toBe('6m');
    expect(f.terrain).toBe('any');
    expect(f.sort).toBe('deadline');
  });

  // Every sort the toggle offers can be read back from the address.
  it('accepts each of the four sorts', () => {
    for (const sort of ['deadline', 'raceday', 'opens', 'distance'] as const) {
      expect(parseFilters({ sort }).sort).toBe(sort);
    }
  });

  // Status chips come comma-separated; unknown and repeated chips are dropped.
  it('parses comma separated status chips, dropping unknown and duplicates', () => {
    expect(parseFilters({ status: 'open,bogus,lottery,open' }).status).toEqual(['open', 'lottery']);
  });

  // Repeated query keys arrive as arrays; the first value wins for single fields.
  it('uses the first value of repeated single fields and all values of status', () => {
    const f = parseFilters({ distance: ['10k', 'half'], status: ['open', 'train12'] });
    expect(f.distance).toBe('10k');
    expect(f.status).toEqual(['open', 'train12']);
  });
});

describe('filterHref', () => {
  // Defaults still write distance and window so "any" can be expressed.
  it('always writes distance and window and omits defaults otherwise', () => {
    expect(filterHref(DEFAULT_FILTERS)).toBe('/?distance=half&when=6m');
  });

  // A change is applied on top of the current filters.
  it('applies a change over the current filters', () => {
    const href = filterHref({ ...DEFAULT_FILTERS, q: 'park', terrain: 'trail' }, { sort: 'raceday', status: ['open', 'lottery'] });
    expect(href).toBe('/?q=park&distance=half&when=6m&terrain=trail&status=open%2Clottery&sort=raceday');
  });

  // Parsing the built URL gives back the same filters.
  it('round trips through parseFilters', () => {
    const filters = { q: 'Half', distance: 'any', when: 'any', terrain: 'road', status: ['train12'], sort: 'raceday' } as const;
    const params = Object.fromEntries(new URLSearchParams(filterHref({ ...filters, status: [...filters.status] }).slice(2)));
    expect(parseFilters(params)).toEqual(filters);
  });
});

describe('resultsHeading', () => {
  // The default search reads like the mockup heading.
  it('names the distance and the window', () => {
    expect(resultsHeading(DEFAULT_FILTERS)).toBe('Half marathons, next 6 months');
  });

  // With no time window only the distance is named.
  it('omits the window when it is any time', () => {
    expect(resultsHeading({ ...DEFAULT_FILTERS, distance: 'any', when: 'any' })).toBe('Races');
  });
});

describe('activeFilterChips', () => {
  // The default search shows the distance and window as removable chips.
  it('lists distance and window for the defaults', () => {
    expect(activeFilterChips(DEFAULT_FILTERS)).toEqual([
      { label: 'Half marathon', clear: { distance: 'any' } },
      { label: 'Next 6 months', clear: { when: 'any' } },
    ]);
  });

  // Search text and terrain also become chips; nothing shows when all are any.
  it('includes query and terrain, and is empty when nothing narrows', () => {
    const chips = activeFilterChips({ ...DEFAULT_FILTERS, q: 'Beacon', terrain: 'trail' });
    expect(chips.map((c) => c.label)).toEqual(['“Beacon”', 'Half marathon', 'Next 6 months', 'Trail']);
    expect(activeFilterChips({ ...DEFAULT_FILTERS, distance: 'any', when: 'any' })).toEqual([]);
  });
});

describe('toggleStatus', () => {
  // Toggling adds a chip that is off.
  it('adds a chip that is not selected', () => {
    expect(toggleStatus(['open'], 'lottery')).toEqual(['open', 'lottery']);
  });

  // Toggling removes a chip that is on, without touching the input array.
  it('removes a selected chip without mutating the input', () => {
    const input = ['open', 'lottery'] as const;
    const copy = [...input];
    expect(toggleStatus(copy, 'open')).toEqual(['lottery']);
    expect(copy).toEqual(['open', 'lottery']);
  });
});

describe('raceCountLabel', () => {
  // Singular and plural wording for the count.
  it('pluralises correctly', () => {
    expect(raceCountLabel(0)).toBe('0 races');
    expect(raceCountLabel(1)).toBe('1 race');
    expect(raceCountLabel(5)).toBe('5 races');
  });
});

describe('SORTS', () => {
  // The sort toggle shows these labels in this order, next deadline first.
  it('lists the four sorts in display order', () => {
    expect(Object.entries(SORTS)).toEqual([
      ['deadline', 'Next deadline'],
      ['raceday', 'Race day'],
      ['opens', 'Registration opens'],
      ['distance', 'Distance'],
    ]);
  });

  // The default sort is one of the offered sorts.
  it('includes the default sort', () => {
    expect(Object.keys(SORTS)).toContain(DEFAULT_FILTERS.sort);
  });
});
