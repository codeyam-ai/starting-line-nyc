import OpeningDateUnknown from '@/app/components/OpeningDateUnknown';
import TimelineItem from '@/app/components/TimelineItem';
import {
  openingDateUnknown,
  registrationHasOpened,
  timelineCalendarHref,
  type TimelineEntry,
} from '@/app/lib/raceDetail';

export default function KeyDates({
  year,
  timeline,
  calendarBase,
  registrationStatus,
}: {
  year: number;
  timeline: TimelineEntry[];
  calendarBase: string;
  registrationStatus: string;
}) {
  return (
    <section className="timeline" aria-labelledby="dates">
      <h2 id="dates">Key dates</h2>
      <p className="tz">
        For the {year} race only. All times in Eastern Time (ET).
      </p>
      <ol>
        {/* Never guess an opening date: when the organizer has not published one, say so. */}
        {openingDateUnknown(timeline) && <OpeningDateUnknown alreadyOpened={registrationHasOpened(registrationStatus)} />}
        {timeline.map((t) => (
          <TimelineItem key={`${t.kind}-${t.at}`} entry={t} calendarHref={timelineCalendarHref(calendarBase, t)} />
        ))}
      </ol>
    </section>
  );
}
