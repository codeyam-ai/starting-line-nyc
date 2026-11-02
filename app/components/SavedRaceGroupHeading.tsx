import { savedCountLabel } from '@/app/lib/myRaces';
import { SAVE_STATUS_LABELS, type SaveStatus } from '@/app/lib/savedRaces';

export default function SavedRaceGroupHeading({ status, count }: { status: SaveStatus; count: number }) {
  return (
    <div className="mr-group-h">
      <h2 id={`mr-${status}`}>{SAVE_STATUS_LABELS[status]}</h2>
      <span className="count">{savedCountLabel(count)}</span>
    </div>
  );
}
