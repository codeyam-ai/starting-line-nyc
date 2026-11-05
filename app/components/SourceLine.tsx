// One compact "where this came from" line: the official site's host as a
// link and when it was last checked. Used per key date and per race row.
import SourceHostLink from '@/app/components/SourceHostLink';
import { checkedPhrase } from '@/app/lib/format';
import { sourceHost } from '@/app/lib/raceDetail';

export default function SourceLine({
  sourceUrl,
  lastVerifiedAt,
  stale = false,
  label = 'Source',
}: {
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  // Flags the check date as old.
  stale?: boolean;
  label?: string;
}) {
  const host = sourceHost(sourceUrl);
  if (!host && !lastVerifiedAt) return <div className="src is-stale">No official source on file</div>;
  return (
    <div className={`src${stale ? ' is-stale' : ''}`}>
      {host && (
        <>
          {label}: <SourceHostLink sourceUrl={sourceUrl} />
        </>
      )}
      {host && lastVerifiedAt && ' · '}
      {lastVerifiedAt && <span>{checkedPhrase(lastVerifiedAt, stale)}</span>}
    </div>
  );
}
