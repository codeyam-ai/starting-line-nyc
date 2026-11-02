// Race discovery read path shared by the home page and /api/races.
// Server-only: it talks to the database. The filtering itself is pure and
// lives in raceList.ts.
import { prisma } from '@/app/lib/prisma';
import type { RaceFilters } from '@/app/lib/filters';
import { buildTimeline } from '@/app/lib/raceDetail';
import { filterAndSortRaces, upcomingEdition, weeksToTrain, type RaceListItem } from '@/app/lib/raceList';

export async function findRaces(filters: RaceFilters, now = new Date()): Promise<RaceListItem[]> {
  const races = await prisma.race.findMany({
    include: { organizer: true, editions: { include: { milestones: true } } },
  });
  return filterAndSortRaces(races, filters, now);
}

// One race for its page: the upcoming edition and its timeline.
export async function findRaceDetail(slug: string, now = new Date()) {
  const race = await prisma.race.findUnique({
    where: { slug },
    include: { organizer: true, editions: { include: { milestones: true } } },
  });
  if (!race) return null;
  const edition = upcomingEdition(race.editions, now);
  return {
    race,
    edition,
    weeksToTrain: edition ? weeksToTrain(edition.raceDate, now) : null,
    timeline: edition ? buildTimeline(edition.milestones, edition.raceDate, edition.raceDateTentative, now, edition.raceTimeKnown) : [],
  };
}

export type RaceDetail = NonNullable<Awaited<ReturnType<typeof findRaceDetail>>>;
