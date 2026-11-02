'use client';

// A saved race with no row to show: why, and a way to remove it.
import { goneRaceMessage } from '@/app/lib/myRaces';
import { setSaveStatus } from '@/app/lib/savedRaces';

export default function GoneRaceNotice({
  slug,
  name,
  reason,
}: {
  slug: string;
  name: string;
  reason: 'no-upcoming' | 'not-listed';
}) {
  return (
    <div className="mr-gone">
      <div>
        <div className="name">{name}</div>
        <p className="sub">{goneRaceMessage(reason)}</p>
      </div>
      <button type="button" className="btn btn-sm" onClick={() => setSaveStatus(slug, null)}>
        Remove
      </button>
    </div>
  );
}
