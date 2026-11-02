// Turns stored races into the home page's filtered, sorted list. Pure — the
// database read lives in races.ts.
import { DISTANCES, WINDOWS, type RaceFilters } from '@/app/lib/filters';

export type MilestoneRecord = { kind: string; at: Date; timeKnown: boolean; tentative: boolean; note?: string | null };

export type EditionRecord = {
  year: number;
  raceDate: Date | null;
  raceDateTentative: boolean;
  registrationStatus: string;
  entryMethod: string;
  isSample: boolean;
  milestones: MilestoneRecord[];
};

export type RaceRecord = {
  slug: string;
  name: string;
  terrain: string;
  distanceMiles: number;
  elevationGainFt: number | null;
  locationName: string;
  area: string;
  photoUrl: string | null;
  photoAlt: string | null;
  organizer: { name: string };
  editions: EditionRecord[];
};

export type RaceListItem = {
  slug: string;
  name: string;
  terrain: string;
  distanceMiles: number;
  elevationGainFt: number | null;
  locationName: string;
  organizer: string;
  photoUrl: string | null;
  photoAlt: string | null;
  raceDate: string | null;
  raceDateTentative: boolean;
  registrationStatus: string;
  entryMethod: string;
  isSample: boolean;
  nextMilestone: { kind: string; at: string; timeKnown: boolean; tentative: boolean } | null;
  weeksToTrain: number | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const URGENT_DAYS = 21;

// The edition a runner can still enter: the earliest whose race day hasn't
// passed. An edition with no announced date counts as upcoming.
export function upcomingEdition<E extends { year: number; raceDate: Date | null }>(
  editions: E[],
  now: Date,
): E | null {
  const sorted = [...editions].sort((a, b) => a.year - b.year);
  return sorted.find((e) => !e.raceDate || e.raceDate >= now) ?? null;
}

// A deadline with no stated time is stored at noon ET on its day; it stays
// upcoming until that ET day ends.
const DATE_ONLY_GRACE_MS = 12 * 60 * 60 * 1000 - 60 * 1000;

export function milestoneEnd(m: { at: Date; timeKnown?: boolean }): Date {
  return m.timeKnown === false ? new Date(m.at.getTime() + DATE_ONLY_GRACE_MS) : m.at;
}

export function nextMilestone<M extends { at: Date; timeKnown?: boolean }>(milestones: M[], now: Date): M | null {
  const future = milestones.filter((m) => milestoneEnd(m) >= now).sort((a, b) => a.at.getTime() - b.at.getTime());
  return future[0] ?? null;
}

// Whole weeks from now until race day, rounded down; null when the date is unknown.
export function weeksToTrain(raceDate: Date | null, now: Date): number | null {
  return raceDate ? Math.floor((raceDate.getTime() - now.getTime()) / (7 * MS_PER_DAY)) : null;
}

// True when a deadline is within the next three weeks (and not past).
export function isUrgent(at: string | null | undefined, now: Date, timeKnown = true): boolean {
  if (!at) return false;
  const end = milestoneEnd({ at: new Date(at), timeKnown }).getTime();
  return end >= now.getTime() && Date.parse(at) - now.getTime() <= URGENT_DAYS * MS_PER_DAY;
}

function windowEnd(months: number | null, now: Date): Date | null {
  if (!months) return null;
  const end = new Date(now.getTime());
  end.setMonth(end.getMonth() + months);
  return end;
}

export function toListItem(race: RaceRecord, now: Date): RaceListItem | null {
  const edition = upcomingEdition(race.editions, now);
  if (!edition) return null;
  const next = nextMilestone(edition.milestones, now);
  return {
    slug: race.slug,
    name: race.name,
    terrain: race.terrain,
    distanceMiles: race.distanceMiles,
    elevationGainFt: race.elevationGainFt,
    locationName: race.locationName,
    organizer: race.organizer.name,
    photoUrl: race.photoUrl,
    photoAlt: race.photoAlt,
    raceDate: edition.raceDate?.toISOString() ?? null,
    raceDateTentative: edition.raceDateTentative,
    registrationStatus: edition.registrationStatus,
    entryMethod: edition.entryMethod,
    isSample: edition.isSample,
    nextMilestone: next
      ? { kind: next.kind, at: next.at.toISOString(), timeKnown: next.timeKnown, tentative: next.tentative }
      : null,
    weeksToTrain: weeksToTrain(edition.raceDate, now),
  };
}

// What My Races shows for one saved race: its list summary, or why there is
// none (no upcoming edition, or no longer listed at all).
export type SavedRaceSummary =
  | { slug: string; state: 'listed'; race: RaceListItem }
  | { slug: string; state: 'no-upcoming'; name: string }
  | { slug: string; state: 'not-listed' };

// One summary per requested slug, in request order. Unknown slugs are never dropped.
export function summarizeSavedRaces(slugs: string[], races: RaceRecord[], now: Date): SavedRaceSummary[] {
  const bySlug = new Map(races.map((r) => [r.slug, r]));
  return slugs.map((slug): SavedRaceSummary => {
    const race = bySlug.get(slug);
    if (!race) return { slug, state: 'not-listed' };
    const item = toListItem(race, now);
    return item ? { slug, state: 'listed', race: item } : { slug, state: 'no-upcoming', name: race.name };
  });
}

function matches(race: RaceRecord, item: RaceListItem, filters: RaceFilters, until: Date | null): boolean {
  const dist = DISTANCES[filters.distance];
  if (race.distanceMiles < dist.min || race.distanceMiles > dist.max) return false;
  if (filters.terrain !== 'any' && race.terrain !== filters.terrain) return false;
  if (until && item.raceDate && Date.parse(item.raceDate) > until.getTime()) return false;
  const q = filters.q.toLowerCase();
  if (q && ![race.name, race.locationName, race.area, race.organizer.name].some((s) => s.toLowerCase().includes(q)))
    return false;
  if (filters.status.includes('open') && item.registrationStatus !== 'open') return false;
  if (filters.status.includes('opening_soon') && item.registrationStatus !== 'opening_soon') return false;
  if (filters.status.includes('lottery') && item.entryMethod !== 'lottery') return false;
  if (filters.status.includes('train12') && (item.weeksToTrain === null || item.weeksToTrain < 12)) return false;
  return true;
}

const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) : Infinity);

// Sort by next deadline: unknown deadlines go last, ties fall back to race day.
export function sortRaces(items: RaceListItem[], sort: RaceFilters['sort']): RaceListItem[] {
  return [...items].sort((a, b) =>
    sort === 'raceday'
      ? time(a.raceDate) - time(b.raceDate)
      : time(a.nextMilestone?.at) - time(b.nextMilestone?.at) || time(a.raceDate) - time(b.raceDate),
  );
}

export function filterAndSortRaces(races: RaceRecord[], filters: RaceFilters, now: Date): RaceListItem[] {
  const until = windowEnd(WINDOWS[filters.when].months, now);
  const items: RaceListItem[] = [];
  for (const race of races) {
    const item = toListItem(race, now);
    if (item && matches(race, item, filters, until)) items.push(item);
  }
  return sortRaces(items, filters.sort);
}
