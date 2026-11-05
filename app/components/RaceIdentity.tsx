import { formatDistance } from '@/app/lib/format';

export default function RaceIdentity({
  name,
  terrain,
  distanceMiles,
  elevationGainFt,
  organizer,
  href,
  children,
}: {
  // Extra lines under the meta row (e.g. where the details come from).
  children?: React.ReactNode;
  name: string;
  terrain: string;
  distanceMiles: number;
  elevationGainFt: number | null;
  organizer: string;
  // When set, the name links to the race page and the link covers the whole row.
  href?: string;
}) {
  return (
    <div>
      <div className="name">
        {href ? (
          <a className="row-link" href={href}>
            {name}
          </a>
        ) : (
          name
        )}
      </div>
      <div className="meta">
        <span className="type">{terrain === 'trail' ? 'Trail' : 'Road'}</span>
        <span>{formatDistance(distanceMiles, elevationGainFt)}</span>
        <span className="org">{organizer}</span>
      </div>
      {children}
    </div>
  );
}
