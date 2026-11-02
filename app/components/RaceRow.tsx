import NextDeadline from '@/app/components/NextDeadline';
import RaceDayCell from '@/app/components/RaceDayCell';
import RaceIdentity from '@/app/components/RaceIdentity';
import RaceThumb from '@/app/components/RaceThumb';
import SaveRaceButton from '@/app/components/SaveRaceButton';
import WeeksToTrain from '@/app/components/WeeksToTrain';
import type { RaceListItem } from '@/app/lib/raceList';

// alwaysOfferCalendar: My Races offers Add to calendar for any dated deadline, not only urgent ones.
export default function RaceRow({
  race,
  urgent,
  alwaysOfferCalendar = false,
}: {
  race: RaceListItem;
  urgent: boolean;
  alwaysOfferCalendar?: boolean;
}) {
  return (
    <div className="row">
      <RaceThumb photoUrl={race.photoUrl} photoAlt={race.photoAlt} distanceMiles={race.distanceMiles} />
      <RaceIdentity
        name={race.name}
        terrain={race.terrain}
        distanceMiles={race.distanceMiles}
        elevationGainFt={race.elevationGainFt}
        organizer={race.organizer}
        href={`/races/${race.slug}`}
      />
      <RaceDayCell raceDate={race.raceDate} tentative={race.raceDateTentative} locationName={race.locationName} />
      <NextDeadline
        status={race.registrationStatus}
        milestone={race.nextMilestone}
        urgent={urgent}
        calendarHref={`/api/races/${race.slug}/calendar`}
        alwaysOfferCalendar={alwaysOfferCalendar}
      />
      <WeeksToTrain weeks={race.weeksToTrain} />
      <SaveRaceButton slug={race.slug} raceName={race.name} registrationStatus={race.registrationStatus} />
    </div>
  );
}
