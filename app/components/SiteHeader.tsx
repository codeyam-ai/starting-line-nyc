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
      <a className="brand" href="/" aria-label="Starting Line home">
        <Logo />
        <b>Starting Line</b>
      </a>
      <nav aria-label="Main">
        <a className={active === 'races' ? 'on' : undefined} href="/">
          Races
        </a>
        <a href={deadlinesHref}>Deadlines</a>
        <a className={active === 'my-races' ? 'on' : undefined} href="/my-races">
          My Races
        </a>
        <a href="/#how-entry-works">How entry works</a>
      </nav>
      <div className="right">
        <a className={active === 'my-races' ? 'mine-m on' : 'mine-m'} href="/my-races">
          My Races
        </a>
        <a href="/#season">Log in</a>
        <a className="btn btn-ink btn-sm" href="/#season">
          Sign up free
        </a>
      </div>
    </header>
  );
}
