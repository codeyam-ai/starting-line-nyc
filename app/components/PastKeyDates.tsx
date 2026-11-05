// A finished edition's key dates, kept for reference and labelled with their
// year so they can never be read as next year's.
import TimelineItem from '@/app/components/TimelineItem';
import { timelineCalendarHref, type TimelineEntry } from '@/app/lib/raceDetail';

export default function PastKeyDates({
  year,
  timeline,
  calendarBase,
}: {
  year: number;
  timeline: TimelineEntry[];
  calendarBase: string;
}) {
  return (
    <section className="timeline" aria-labelledby="past-dates">
      <h2 id="past-dates">{year} key dates</h2>
      <p className="tz">
        The {year} race, kept for reference. These dates won’t carry over to {year + 1}.
      </p>
      <ol>
        {timeline.map((t) => (
          <TimelineItem key={`${t.kind}-${t.at}`} entry={t} calendarHref={timelineCalendarHref(calendarBase, t)} />
        ))}
      </ol>
    </section>
  );
}
