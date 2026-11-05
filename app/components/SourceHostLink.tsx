// A link to an official source page, labelled with just its site name
// ("nyrr.org"). Renders nothing when the URL has no readable host.
import { sourceHost } from '@/app/lib/raceDetail';

export default function SourceHostLink({ sourceUrl }: { sourceUrl: string | null }) {
  const host = sourceHost(sourceUrl);
  if (!host || !sourceUrl) return null;
  return (
    <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
      {host}
    </a>
  );
}
