// The five facts a runner needs first, plus the way to enter and save.
import GlanceActions from '@/app/components/GlanceActions';
import GlanceItem from '@/app/components/GlanceItem';
import { MILESTONE_LABELS, STATUS_LABELS, formatDay, formatDistance, formatPrice, formatTime } from '@/app/lib/format';
import type { TimelineEntry } from '@/app/lib/raceDetail';

export default function AtAGlance({
  raceDate,
  raceTimeKnown = true,
  distanceMiles,
  elevationGainFt,
  entryTitle,
  status,
  priceCents,
  nextDeadline,
  weeksToTrain,
  official,
  save,
}: {
  raceDate: string | null;
  raceTimeKnown?: boolean;
  distanceMiles: number;
  elevationGainFt: number | null;
  entryTitle: string;
  status: string;
  priceCents: number | null;
  nextDeadline: TimelineEntry | null;
  weeksToTrain: number | null;
  official: { href: string; label: string } | null;
  save?: { slug: string; raceName: string };
}) {
  return (
    <section className="glance" aria-label="At a glance">
      <dl>
        <GlanceItem
          label="Race day"
          value={raceDate ? formatDay(raceDate) : 'Not announced'}
          sub={raceDate ? (raceTimeKnown ? `${formatTime(raceDate)} start` : 'start time not stated') : null}
        />
        <GlanceItem
          label="Distance"
          value={formatDistance(distanceMiles, null)}
          sub={elevationGainFt ? `${elevationGainFt.toLocaleString('en-US')} ft climb` : null}
        />
        <GlanceItem label="Entry" value={STATUS_LABELS[status] ?? status} sub={entryTitle} />
        <GlanceItem
          label="Price"
          value={priceCents !== null ? formatPrice(priceCents) : 'Not listed'}
          sub={priceCents !== null ? 'current price' : 'check the official site'}
        />
        <GlanceItem
          label="Next deadline"
          value={nextDeadline ? formatDay(nextDeadline.at) : 'None announced'}
          sub={nextDeadline ? (MILESTONE_LABELS[nextDeadline.kind] ?? nextDeadline.kind) : null}
          emphasis={!!nextDeadline}
        />
        {weeksToTrain !== null && <GlanceItem label="Weeks to train" value={String(weeksToTrain)} />}
      </dl>
      <GlanceActions official={official} save={save} />
    </section>
  );
}
