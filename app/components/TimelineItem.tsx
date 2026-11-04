// One date on the race's key-dates timeline: passed (checked off), next
// (highlighted) or upcoming, each upcoming one with its own calendar event.
import AddToCalendar from '@/app/components/AddToCalendar';
import { formatWhen, milestoneLabel } from '@/app/lib/format';
import type { TimelineEntry } from '@/app/lib/raceDetail';

export default function TimelineItem({ entry, calendarHref }: { entry: TimelineEntry; calendarHref: string }) {
  const label = milestoneLabel(entry.kind, entry.state === 'past');
  return (
    <li className={`tl ${entry.state}`}>
      <span className="dot" aria-hidden="true">
        {entry.state === 'past' ? '✓' : ''}
      </span>
      <div>
        <div className="when">
          {formatWhen(entry.at, entry.timeKnown)}
          {entry.tentative && <span className="sub"> (tentative)</span>}
          {entry.state === 'next' && <span className="pill">Next</span>}
          {entry.state === 'past' && <span className="sub"> · passed</span>}
        </div>
        <div className="what">{label}</div>
        {entry.note && <div className="sub">{entry.note}</div>}
        {entry.state !== 'past' && <AddToCalendar href={calendarHref} />}
      </div>
    </li>
  );
}
