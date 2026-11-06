import Link from 'next/link';
import Logo from '@/app/components/Logo';

export default function SiteHeader({
  deadlinesHref,
  active = 'races',
}: {
  deadlinesHref: string;
  active?: 'races' | 'my-races';
}) {
  return (
    <header className="bar">
      <Link className="brand" href="/" aria-label="Starting Line home">
        <Logo />
        <b>Starting Line</b>
      </Link>
      <nav aria-label="Main">
        <Link className={active === 'races' ? 'on' : undefined} href="/">
          Races
        </Link>
        <a href={deadlinesHref}>Deadlines</a>
        <Link className={active === 'my-races' ? 'on' : undefined} href="/my-races">
          My Races
        </Link>
        <Link href="/#how-entry-works">How entry works</Link>
      </nav>
      <div className="right">
        <Link className={active === 'my-races' ? 'mine-m on' : 'mine-m'} href="/my-races">
          My Races
        </Link>
        <Link href="/#season">Log in</Link>
        <Link className="btn btn-ink btn-sm" href="/#season">
          Sign up free
        </Link>
      </div>
    </header>
  );
}
