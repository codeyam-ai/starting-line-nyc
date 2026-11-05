// Display helpers. Every user-facing time is shown in America/New_York.
const TZ = 'America/New_York';

export const MILESTONE_LABELS: Record<string, string> = {
  registration_opens: 'Registration opens',
  registration_closes: 'Registration closes',
  lottery_opens: 'Lottery opens',
  lottery_closes: 'Lottery closes',
  lottery_draw: 'Lottery drawing',
  qualification_deadline: 'Qualifying deadline',
  price_increase: 'Last day at the current price',
  charity_closes: 'Charity sign-up closes',
};

// Past-tense wording for milestones that have already happened.
const PAST_MILESTONE_LABELS: Record<string, string> = {
  registration_opens: 'Registration opened',
  registration_closes: 'Registration closed',
  lottery_opens: 'Lottery opened',
  lottery_closes: 'Lottery closed',
  charity_closes: 'Charity sign-up closed',
};

export function milestoneLabel(kind: string, past = false): string {
  if (kind === 'race_day') return 'Race day';
  return (past && PAST_MILESTONE_LABELS[kind]) || MILESTONE_LABELS[kind] || kind;
}

const MILESTONE_VERBS: Record<string, string> = {
  registration_opens: 'Opens',
  registration_closes: 'Closes',
  lottery_opens: 'Opens',
  lottery_closes: 'Closes',
  lottery_draw: 'Drawing',
  qualification_deadline: 'Qualify by',
  price_increase: 'Price rises after',
  charity_closes: 'Charity closes',
};

export const STATUS_LABELS: Record<string, string> = {
  opening_soon: 'Opening soon',
  open: 'Open',
  lottery_open: 'Lottery open',
  waitlist: 'Waitlist',
  sold_out: 'Sold out',
  closed: 'Closed',
  not_announced: 'Not open yet',
};

export const LIVE_STATUSES = new Set(['opening_soon', 'open', 'lottery_open', 'waitlist']);

export function formatDay(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' }).format(
    new Date(iso),
  );
}

export function formatTime(iso: string | Date): string {
  const t = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
    .format(new Date(iso))
    .replace(' AM', ' am')
    .replace(' PM', ' pm');
  return `${t} ET`;
}

export function formatEt(iso: string | Date): string {
  return `${formatDay(iso)}, ${formatTime(iso)}`;
}

// The calendar date in Eastern Time, as YYYY-MM-DD.
export function etDate(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(iso),
  );
}

export function formatLongDay(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

// A "last checked" date: "Oct 28, 2026", in Eastern Time.
export function formatCheckedDate(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(iso),
  );
}

// How a check date reads next to a source: plain when recent, a warning when old.
export function checkedPhrase(iso: string | Date, stale: boolean): string {
  const date = formatCheckedDate(iso);
  return stale ? `last checked ${date} — may be out of date` : `checked ${date}`;
}

// The time of day only when the organizer actually stated one.
export function formatWhen(iso: string | Date, timeKnown: boolean): string {
  return timeKnown ? formatEt(iso) : `${formatDay(iso)} (time not stated)`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function milestoneVerb(kind: string): string {
  return MILESTONE_VERBS[kind] ?? MILESTONE_LABELS[kind] ?? kind;
}

export function formatDistance(miles: number, elevationGainFt: number | null): string {
  const d = `${Number.isInteger(miles) ? miles : miles.toFixed(1)} mi`;
  return elevationGainFt ? `${d}, ${elevationGainFt.toLocaleString('en-US')} ft climb` : d;
}
