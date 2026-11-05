// A warning that a race's details may be out of date because they were last
// checked a while ago (or never).
import { formatCheckedDate } from '@/app/lib/format';
import { STALE_AFTER_DAYS } from '@/app/lib/raceList';

export default function StaleNotice({ lastVerifiedAt }: { lastVerifiedAt: string | null }) {
  return (
    <p className="stale" role="note">
      <strong>May be out of date.</strong>{' '}
      {lastVerifiedAt
        ? `Last checked ${formatCheckedDate(lastVerifiedAt)}, more than ${STALE_AFTER_DAYS} days ago.`
        : 'These details have never been checked against the official site.'}{' '}
      Confirm on the official site before you register.
    </p>
  );
}
