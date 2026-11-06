import Link from 'next/link';

export default function RaceNotFound() {
  return (
    <section className="empty race-missing">
      <h2>We couldn’t find that race.</h2>
      <p>It may have been renamed, or it isn’t listed yet. Browse all races, or tell us about one we’re missing.</p>
      <Link className="btn btn-ink" href="/?distance=any&when=any">
        Show all races
      </Link>
    </section>
  );
}
