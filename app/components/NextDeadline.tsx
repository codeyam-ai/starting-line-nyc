// Registration status and the next dated milestone in ET. Deadlines within
// three weeks are highlighted and offer an Add to calendar menu.
import AddToCalendar from '@/app/components/AddToCalendar';
import { LIVE_STATUSES, STATUS_LABELS, formatDay, formatTime, milestoneVerb } from '@/app/lib/format';

export default function NextDeadline({
  status,
  milestone,
  urgent,
  calendarHref,
  alwaysOfferCalendar = false,
}: {
  status: string;
  milestone: { kind: string; at: string; timeKnown: boolean; tentative: boolean } | null;
  urgent: boolean;
  calendarHref: string;
  // My Races offers Add to calendar for any dated milestone, not only urgent ones.
  alwaysOfferCalendar?: boolean;
}) {
  const offerCalendar = urgent || (alwaysOfferCalendar && milestone !== null);
  return (
    <div className={urgent ? 'next urgent' : 'next'}>
      <span className={LIVE_STATUSES.has(status) ? 'state live' : 'state'}>{STATUS_LABELS[status] ?? status}</span>
      {milestone ? (
        <div className={urgent ? 'v' : 'v quiet'}>
          {milestoneVerb(milestone.kind)} {formatDay(milestone.at)}
          {milestone.timeKnown ? (
            <>
              , <span className="nw">{formatTime(milestone.at)}</span>
            </>
          ) : (
            <span className="sub"> (time not stated)</span>
          )}
          {milestone.tentative && <span className="sub"> (tentative)</span>}
        </div>
      ) : (
        <div className="v quiet">Registration date to come</div>
      )}
      {offerCalendar && (
        <AddToCalendar href={calendarHref} dateKind={milestone?.kind} timeKnown={milestone?.timeKnown} />
      )}
    </div>
  );
}
