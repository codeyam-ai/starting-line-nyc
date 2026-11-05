// Where the race's details come from, when they were checked, and a way to
// report something missing or wrong. Old checks are flagged as possibly out of date.
import SourceHostLink from '@/app/components/SourceHostLink';
import StaleNotice from '@/app/components/StaleNotice';
import { formatCheckedDate } from '@/app/lib/format';
import { sourceHost } from '@/app/lib/raceDetail';

export default function SourcesPanel({
  sourceUrl,
  lastVerifiedAt,
  stale,
  reportHref,
}: {
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  // True when the details were last checked too long ago (or never).
  stale: boolean;
  reportHref: string;
}) {
  return (
    <section className="sources" aria-labelledby="sources">
      <h2 id="sources">Sources</h2>
      {stale && <StaleNotice lastVerifiedAt={lastVerifiedAt} />}
      <p>
        {sourceHost(sourceUrl) ? <SourceHostLink sourceUrl={sourceUrl} /> : 'No official source on file yet.'}
        {lastVerifiedAt && <span className="sub"> · last checked {formatCheckedDate(lastVerifiedAt)}</span>}
      </p>
      <p className="sub">Anything we couldn’t confirm is left out. Confirm on the official site before you register.</p>
      <a className="report" href={reportHref} target="_blank" rel="noopener noreferrer">
        Report a missing or wrong detail ↗
      </a>
    </section>
  );
}
