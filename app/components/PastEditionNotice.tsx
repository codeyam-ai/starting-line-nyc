// A race whose latest edition has already been run: says that year's race is
// over, keeps its dates visible (all marked passed) so they can never be read
// as next year's, and points to the organizer for the next edition.
import PastKeyDates from '@/app/components/PastKeyDates';
import RaceOverNotice from '@/app/components/RaceOverNotice';
import type { TimelineEntry } from '@/app/lib/raceDetail';

export default function PastEditionNotice({
  year,
  raceDate,
  timeline,
  calendarBase,
  organizerUrl,
}: {
  year: number;
  raceDate: string;
  timeline: TimelineEntry[];
  calendarBase: string;
  organizerUrl: string | null;
}) {
  return (
    <>
      <RaceOverNotice year={year} raceDate={raceDate} organizerUrl={organizerUrl} />
      <PastKeyDates year={year} timeline={timeline} calendarBase={calendarBase} />
    </>
  );
}
