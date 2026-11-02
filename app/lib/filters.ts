// Race search filters: the options, URL parsing, and the URLs/labels the
// home page builds from them. Pure — safe to import anywhere.

export const DISTANCES = {
  any: { label: 'Any distance', plural: 'Races', min: 0, max: Infinity },
  '5k': { label: '5K', plural: '5Ks', min: 3.0, max: 3.2 },
  '10k': { label: '10K', plural: '10Ks', min: 6.1, max: 6.3 },
  '15k': { label: '15K', plural: '15Ks', min: 9.2, max: 9.4 },
  half: { label: 'Half marathon', plural: 'Half marathons', min: 13.0, max: 13.2 },
  '30k': { label: '30K', plural: '30Ks', min: 18.5, max: 18.7 },
  marathon: { label: 'Marathon', plural: 'Marathons', min: 26.1, max: 26.3 },
  ultra: { label: 'Ultra', plural: 'Ultras', min: 26.3, max: Infinity },
} as const;

export const WINDOWS = {
  any: { label: 'Any time', months: null },
  '3m': { label: 'Next 3 months', months: 3 },
  '6m': { label: 'Next 6 months', months: 6 },
  '12m': { label: 'Next 12 months', months: 12 },
} as const;

export const TERRAINS = {
  any: 'Road or trail',
  road: 'Road',
  trail: 'Trail',
} as const;

export const STATUS_CHIPS = {
  open: 'Registration open',
  opening_soon: 'Opening soon',
  lottery: 'Lottery',
  train12: '12+ weeks to train',
} as const;

export type DistanceKey = keyof typeof DISTANCES;
export type WindowKey = keyof typeof WINDOWS;
export type TerrainKey = keyof typeof TERRAINS;
export type StatusChip = keyof typeof STATUS_CHIPS;
export const SORTS = {
  deadline: 'Next deadline',
  raceday: 'Race day',
  opens: 'Registration opens',
  distance: 'Distance',
} as const;

export type SortKey = keyof typeof SORTS;

export type RaceFilters = {
  q: string;
  distance: DistanceKey;
  when: WindowKey;
  terrain: TerrainKey;
  status: StatusChip[];
  sort: SortKey;
};

export const DEFAULT_FILTERS: RaceFilters = {
  q: '',
  distance: 'half',
  when: '6m',
  terrain: 'any',
  status: [],
  sort: 'deadline',
};

export type SearchParams = Record<string, string | string[] | undefined>;

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function parseFilters(params: SearchParams): RaceFilters {
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const statusRaw = params.status;
  const statusList = (Array.isArray(statusRaw) ? statusRaw : statusRaw ? statusRaw.split(',') : []).filter(
    (s): s is StatusChip => s in STATUS_CHIPS,
  );
  return {
    q: (one('q') ?? '').trim(),
    distance: pick(one('distance'), Object.keys(DISTANCES) as DistanceKey[], DEFAULT_FILTERS.distance),
    when: pick(one('when'), Object.keys(WINDOWS) as WindowKey[], DEFAULT_FILTERS.when),
    terrain: pick(one('terrain'), Object.keys(TERRAINS) as TerrainKey[], DEFAULT_FILTERS.terrain),
    status: Array.from(new Set(statusList)),
    sort: pick(one('sort'), Object.keys(SORTS) as SortKey[], DEFAULT_FILTERS.sort),
  };
}

// The home-page URL for `filters` with `change` applied. Distance and window
// are always written so "any" survives a round trip past the defaults.
export function filterHref(filters: RaceFilters, change: Partial<RaceFilters> = {}): string {
  const f = { ...filters, ...change };
  const params = new URLSearchParams();
  if (f.q) params.set('q', f.q);
  params.set('distance', f.distance);
  params.set('when', f.when);
  if (f.terrain !== 'any') params.set('terrain', f.terrain);
  if (f.status.length) params.set('status', f.status.join(','));
  if (f.sort !== DEFAULT_FILTERS.sort) params.set('sort', f.sort);
  return `/?${params.toString()}`;
}

export function resultsHeading(filters: RaceFilters): string {
  const what = DISTANCES[filters.distance].plural;
  return filters.when === 'any' ? what : `${what}, ${WINDOWS[filters.when].label.toLowerCase()}`;
}

export type ActiveChip = { label: string; clear: Partial<RaceFilters> };

// Chips for the search-bar choices currently narrowing the results, each
// with the change that removes it.
export function activeFilterChips(filters: RaceFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, clear: { q: '' } });
  if (filters.distance !== 'any') chips.push({ label: DISTANCES[filters.distance].label, clear: { distance: 'any' } });
  if (filters.when !== 'any') chips.push({ label: WINDOWS[filters.when].label, clear: { when: 'any' } });
  if (filters.terrain !== 'any') chips.push({ label: TERRAINS[filters.terrain], clear: { terrain: 'any' } });
  return chips;
}

export function toggleStatus(status: StatusChip[], chip: StatusChip): StatusChip[] {
  return status.includes(chip) ? status.filter((s) => s !== chip) : [...status, chip];
}

export function raceCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'race' : 'races'}`;
}
