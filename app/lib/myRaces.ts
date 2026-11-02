// Pure helpers for My Races: grouping saved races, naming races that are no
// longer listed, and spotting a registration change since the save.
// Client-safe — no database imports.
import { STATUS_LABELS } from '@/app/lib/format';
import type { SavedRaceSummary } from '@/app/lib/raceList';
import { nameFromSlug, type SaveStatus, type SavedRace, type SavedRaces } from '@/app/lib/savedRaces';

export const GROUP_ORDER: SaveStatus[] = ['signed-up', 'considering', 'interested'];

export const MAX_SUMMARY_SLUGS = 100;

export type SavedRaceGroupData = { status: SaveStatus; slugs: string[] };

// Sort key: the race day in ms, or Infinity when the race has no date to show.
export function raceDay(summary: SavedRaceSummary | undefined): number {
  if (summary?.state !== 'listed' || !summary.race.raceDate) return Infinity;
  const t = Date.parse(summary.race.raceDate);
  return Number.isNaN(t) ? Infinity : t;
}

// Saved races grouped Signed up → Considering → Interested, soonest race first.
// Empty groups are left out.
export function groupSavedRaces(
  saved: SavedRaces,
  summaries: Record<string, SavedRaceSummary>,
): SavedRaceGroupData[] {
  const slugs = Object.keys(saved);
  return GROUP_ORDER.map((status) => ({
    status,
    slugs: slugs
      .filter((s) => saved[s].status === status)
      .sort((a, b) => raceDay(summaries[a]) - raceDay(summaries[b]) || a.localeCompare(b)),
  })).filter((g) => g.slugs.length > 0);
}

// "1 race" / "3 races".
export function savedCountLabel(n: number): string {
  return `${n} ${n === 1 ? 'race' : 'races'}`;
}

// The name to show for a race with no listing: the current name when the race
// still exists, else the name recorded at save, else one made from the slug.
export function goneRaceName(slug: string, saved: SavedRace, summary: SavedRaceSummary): string {
  if (summary.state === 'no-upcoming') return summary.name;
  return saved.name ?? nameFromSlug(slug);
}

// Why a saved race has no row.
export function goneRaceMessage(state: 'no-upcoming' | 'not-listed'): string {
  return state === 'no-upcoming'
    ? 'This race has no upcoming date listed. It may have already run this year.'
    : 'This race is no longer listed on Starting Line.';
}

// The registration status at save and now, as labels — or null when unchanged or unknown.
export function registrationChange(
  saved: SavedRace,
  currentStatus: string,
): { from: string; to: string } | null {
  const at = saved.registrationAtSave;
  if (!at || at === currentStatus) return null;
  return { from: STATUS_LABELS[at] ?? at, to: STATUS_LABELS[currentStatus] ?? currentStatus };
}

// The sorted, comma-joined slug list — a stable key for refetching summaries.
export function summariesKey(saved: SavedRaces | null): string | null {
  return saved ? Object.keys(saved).sort().join(',') : null;
}

export function summariesUrl(key: string): string {
  return `/api/races/summaries?slugs=${encodeURIComponent(key)}`;
}

// The route's ?slugs= value as distinct, trimmed, non-empty slugs, capped at max.
export function parseSummarySlugs(param: string | null, max = MAX_SUMMARY_SLUGS): string[] {
  return [
    ...new Set(
      (param ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].slice(0, max);
}

// Every saved race has a summary loaded.
export function allSummariesLoaded(
  saved: SavedRaces,
  summaries: Record<string, SavedRaceSummary> | null,
): summaries is Record<string, SavedRaceSummary> {
  return summaries !== null && Object.keys(saved).every((s) => summaries[s] !== undefined);
}
