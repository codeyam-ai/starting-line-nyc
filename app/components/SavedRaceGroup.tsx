import SavedRaceGroupHeading from '@/app/components/SavedRaceGroupHeading';
import SavedRaceItem from '@/app/components/SavedRaceItem';
import type { SavedRaceSummary } from '@/app/lib/raceList';
import type { SaveStatus, SavedRaces } from '@/app/lib/savedRaces';

// One status's saved races, in the order given.
export default function SavedRaceGroup({
  status,
  slugs,
  saved,
  summaries,
  now,
}: {
  status: SaveStatus;
  slugs: string[];
  saved: SavedRaces;
  summaries: Record<string, SavedRaceSummary>;
  now: Date;
}) {
  return (
    <section className="mr-group" aria-labelledby={`mr-${status}`}>
      <SavedRaceGroupHeading status={status} count={slugs.length} />
      {slugs.map((slug) => (
        <SavedRaceItem key={slug} slug={slug} saved={saved[slug]} summary={summaries[slug]} now={now} />
      ))}
    </section>
  );
}
