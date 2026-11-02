import GoneRaceNotice from '@/app/components/GoneRaceNotice';
import RaceNote from '@/app/components/RaceNote';
import RaceRow from '@/app/components/RaceRow';
import RegistrationChanged from '@/app/components/RegistrationChanged';
import { goneRaceName, registrationChange } from '@/app/lib/myRaces';
import { isUrgent, type SavedRaceSummary } from '@/app/lib/raceList';
import type { SavedRace } from '@/app/lib/savedRaces';

// One saved race: its list row (or why there is none), any registration change, and the note.
export default function SavedRaceItem({
  slug,
  saved,
  summary,
  now,
}: {
  slug: string;
  saved: SavedRace;
  summary: SavedRaceSummary;
  now: Date;
}) {
  const note = <RaceNote slug={slug} note={saved.note ?? ''} />;
  if (summary.state !== 'listed') {
    return (
      <div className="mr-item is-gone">
        <GoneRaceNotice slug={slug} name={goneRaceName(slug, saved, summary)} reason={summary.state} />
        {note}
      </div>
    );
  }
  const race = summary.race;
  const m = race.nextMilestone;
  const change = registrationChange(saved, race.registrationStatus);
  return (
    <div className="mr-item">
      <RaceRow race={race} urgent={isUrgent(m?.at, now, m?.timeKnown)} alwaysOfferCalendar />
      {change && <RegistrationChanged from={change.from} to={change.to} />}
      {note}
    </div>
  );
}
