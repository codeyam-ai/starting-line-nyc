// Race discovery read path shared by the home page and /api/races.
// Server-only: it talks to the database. The filtering itself is pure and
// lives in raceList.ts.
import { prisma } from '@/app/lib/prisma';
import type { RaceFilters } from '@/app/lib/filters';
import { buildTimeline } from '@/app/lib/raceDetail';
import {
  filterAndSortRaces,
  latestPastEdition,
  summarizeSavedRaces,
  upcomingEdition,
  weeksToTrain,
  type RaceListItem,
  type SavedRaceSummary,
} from '@/app/lib/raceList';

export async function findRaces(filters: RaceFilters, now = new Date()): Promise<RaceListItem[]> {
  const races = await prisma.race.findMany({
    include: { organizer: true, editions: { include: { milestones: true } } },
  });
  return filterAndSortRaces(races, filters, now);
}

// Summaries for the races saved in a browser. The shaping is pure and lives in raceList.ts.
export async function findRaceSummaries(slugs: string[], now = new Date()): Promise<SavedRaceSummary[]> {
  const races = await prisma.race.findMany({
    where: { slug: { in: slugs } },
    include: { organizer: true, editions: { include: { milestones: true } } },
  });
  return summarizeSavedRaces(slugs, races, now);
}

type StoredEdition = {
  raceDate: Date | null;
  raceDateTentative: boolean;
  raceTimeKnown: boolean;
  sourceUrl: string | null;
  lastVerifiedAt: Date | null;
  milestones: Parameters<typeof buildTimeline>[0];
};

function editionTimeline(edition: StoredEdition, now: Date) {
  return buildTimeline(edition.milestones, edition.raceDate, edition.raceDateTentative, now, edition.raceTimeKnown, {
    sourceUrl: edition.sourceUrl,
    lastVerifiedAt: edition.lastVerifiedAt,
  });
}

// One race for its page: the upcoming edition and its timeline, or — when
// none is upcoming — the most recent finished edition, shown as over.
export async function findRaceDetail(slug: string, now = new Date()) {
  const race = await prisma.race.findUnique({
    where: { slug },
    include: { organizer: true, editions: { include: { milestones: true } } },
  });
  if (!race) return null;
  const edition = upcomingEdition(race.editions, now);
  const pastEdition = edition ? null : latestPastEdition(race.editions, now);
  return {
    race,
    edition,
    pastEdition,
    weeksToTrain: edition ? weeksToTrain(edition.raceDate, now) : null,
    timeline: edition ? editionTimeline(edition, now) : [],
    pastTimeline: pastEdition ? editionTimeline(pastEdition, now) : [],
  };
}

export type RaceDetail = NonNullable<Awaited<ReturnType<typeof findRaceDetail>>>;
