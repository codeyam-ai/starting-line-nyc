// Says the latest edition has already been run, when it was, that next
// year's date isn't out yet, and links to the organizer for news.
import { formatLongDay } from '@/app/lib/format';

export default function RaceOverNotice({
  year,
  raceDate,
  organizerUrl,
}: {
  year: number;
  raceDate: string;
  organizerUrl: string | null;
}) {
  return (
    <section className="empty past-edition">
      <h2>The {year} race is over.</h2>
      <p>
        It was run on {formatLongDay(raceDate)}. The {year + 1} date hasn’t been announced yet — check the organizer for
        news.
      </p>
      {organizerUrl && (
        <a className="btn" href={organizerUrl} target="_blank" rel="noopener noreferrer">
          Visit the organizer ↗
        </a>
      )}
    </section>
  );
}
