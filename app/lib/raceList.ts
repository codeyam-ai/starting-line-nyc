// Turns stored races into the home page's filtered, sorted list. Pure — the
// database read lives in races.ts.
import { DISTANCES, WINDOWS, type RaceFilters, type SortKey } from '@/app/lib/filters';

export type MilestoneRecord = { kind: string; at: Date; timeKnown: boolean; tentative: boolean; note?: string | null };

export type EditionRecord = {
  year: number;
  raceDate: Date | null;
  raceDateTentative: boolean;
  registrationStatus: string;
  entryMethod: string;
  isSample: boolean;
  sourceUrl?: string | null;
  lastVerifiedAt?: Date | null;
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
  // Where this edition's details come from and when they were last checked.
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  nextMilestone: { kind: string; at: string; timeKnown: boolean; tentative: boolean } | null;
  // When this edition's registration opens; null when not announced.
  registrationOpens: string | null;
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

// The most recent edition whose race day has passed — shown when there is no
// upcoming edition, so a finished race stays visible as over, never as next.
export function latestPastEdition<E extends { year: number; raceDate: Date | null }>(
  editions: E[],
  now: Date,
): E | null {
  const past = editions.filter((e) => e.raceDate && e.raceDate < now).sort((a, b) => b.year - a.year);
  return past[0] ?? null;
}

// Details last checked more than this many days ago are flagged as possibly out of date.
export const STALE_AFTER_DAYS = 30;

// True when the details were never checked, or last checked more than STALE_AFTER_DAYS ago.
export function isStale(lastVerifiedAt: string | Date | null | undefined, now: Date, days = STALE_AFTER_DAYS): boolean {
  if (!lastVerifiedAt) return true;
  return now.getTime() - new Date(lastVerifiedAt).getTime() > days * MS_PER_DAY;
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
    sourceUrl: edition.sourceUrl ?? null,
    lastVerifiedAt: edition.lastVerifiedAt?.toISOString() ?? null,
    nextMilestone: next
      ? { kind: next.kind, at: next.at.toISOString(), timeKnown: next.timeKnown, tentative: next.tentative }
      : null,
    registrationOpens:
      edition.milestones
        .filter((m) => m.kind === 'registration_opens')
        .sort((a, b) => a.at.getTime() - b.at.getTime())[0]
        ?.at.toISOString() ?? null,
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

const ALREADY_OPEN = new Set(['open', 'lottery_open', 'waitlist']);

// Openings still ahead come first (soonest first), then races you can
// already enter, then everything with no opening date announced. Races in
// the last two groups fall through to race day.
function opensRank(item: RaceListItem, now: Date): [number, number] {
  const at = item.registrationOpens ? Date.parse(item.registrationOpens) : null;
  if (at !== null && at >= now.getTime()) return [0, at];
  if (at !== null || ALREADY_OPEN.has(item.registrationStatus)) return [1, 0];
  return [2, 0];
}

function compareBy(sort: SortKey, a: RaceListItem, b: RaceListItem, now: Date): number {
  switch (sort) {
    case 'raceday':
      return 0;
    case 'distance':
      return a.distanceMiles - b.distanceMiles;
    case 'opens': {
      const [ra, ta] = opensRank(a, now);
      const [rb, tb] = opensRank(b, now);
      return ra - rb || ta - tb;
    }
    default:
      return time(a.nextMilestone?.at) - time(b.nextMilestone?.at);
  }
}

// Unknown dates go last; ties fall back to race day, then name, so the order is stable.
export function sortRaces(items: RaceListItem[], sort: SortKey, now: Date = new Date()): RaceListItem[] {
  return [...items].sort(
    (a, b) => compareBy(sort, a, b, now) || time(a.raceDate) - time(b.raceDate) || a.name.localeCompare(b.name),
  );
}

export function filterAndSortRaces(races: RaceRecord[], filters: RaceFilters, now: Date): RaceListItem[] {
  const until = windowEnd(WINDOWS[filters.when].months, now);
  const items: RaceListItem[] = [];
  for (const race of races) {
    const item = toListItem(race, now);
    if (item && matches(race, item, filters, until)) items.push(item);
  }
  return sortRaces(items, filters.sort, now);
}
