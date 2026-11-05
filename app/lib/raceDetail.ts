// The race page's view of one race: the registration timeline with
// past/next state, plain-language entry info, and the links it shows.
// Pure — the database read lives in races.ts.
import { isStale, milestoneEnd } from '@/app/lib/raceList';

export const REPO_URL = 'https://github.com/nseldeib/starting-line-nyc';

export const ENTRY_METHODS: Record<string, { title: string; explain: string }> = {
  open: { title: 'Open registration', explain: 'First come, first served until it fills or registration closes.' },
  lottery: { title: 'Lottery', explain: 'Apply during the application window; entrants are drawn at random.' },
  qualification: { title: 'Qualifying standard', explain: 'You have to meet a qualifying standard to be accepted.' },
  charity: { title: 'Charity entry', explain: 'A guaranteed place in exchange for fundraising for a partner charity.' },
  membership: { title: 'Membership', explain: 'Entry depends on club or program membership.' },
};

export function entryMethod(method: string): { title: string; explain: string } {
  return ENTRY_METHODS[method] ?? { title: method, explain: '' };
}

export type TimelineEntry = {
  id: number | null; // null for race day
  kind: string;
  at: string;
  timeKnown: boolean;
  tentative: boolean;
  note: string | null;
  // The official page this date came from and when it was checked: the
  // date's own, else the edition's.
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  state: 'past' | 'next' | 'upcoming';
};

const OPENING_KINDS = new Set(['registration_opens', 'lottery_opens']);
const OPENED_STATUSES = new Set(['open', 'lottery_open', 'waitlist', 'sold_out', 'closed']);

// True when the organizer has not published when registration (or the lottery) opens.
export function openingDateUnknown(timeline: TimelineEntry[]): boolean {
  return !timeline.some((t) => OPENING_KINDS.has(t.kind));
}

// True when the status means registration has already opened at some point.
export function registrationHasOpened(registrationStatus: string): boolean {
  return OPENED_STATUSES.has(registrationStatus);
}

type MilestoneInput = {
  id: number;
  kind: string;
  at: Date;
  timeKnown: boolean;
  tentative: boolean;
  note: string | null;
  sourceUrl?: string | null;
  lastVerifiedAt?: Date | null;
};

type EditionSource = { sourceUrl: string | null; lastVerifiedAt: Date | null };

// Milestones in date order with race day last; the first not-yet-passed entry is "next".
// Each entry carries its own source, else the edition's.
export function buildTimeline(
  milestones: MilestoneInput[],
  raceDate: Date | null,
  raceDateTentative: boolean,
  now: Date,
  raceTimeKnown = true,
  source: EditionSource = { sourceUrl: null, lastVerifiedAt: null },
): TimelineEntry[] {
  const editionSource = { sourceUrl: source.sourceUrl, lastVerifiedAt: source.lastVerifiedAt?.toISOString() ?? null };
  const rows: Omit<TimelineEntry, 'state'>[] = [...milestones]
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .map((m) => ({
      id: m.id,
      kind: m.kind,
      at: m.at.toISOString(),
      timeKnown: m.timeKnown,
      tentative: m.tentative,
      note: m.note,
      ...(m.sourceUrl
        ? { sourceUrl: m.sourceUrl, lastVerifiedAt: m.lastVerifiedAt?.toISOString() ?? null }
        : editionSource),
    }));
  if (raceDate) {
    rows.push({
      id: null,
      kind: 'race_day',
      at: raceDate.toISOString(),
      timeKnown: raceTimeKnown,
      tentative: raceDateTentative,
      note: null,
      ...editionSource,
    });
  }
  let nextFound = false;
  return rows.map((r) => {
    if (milestoneEnd({ at: new Date(r.at), timeKnown: r.timeKnown }) < now) return { ...r, state: 'past' };
    if (!nextFound) {
      nextFound = true;
      return { ...r, state: 'next' };
    }
    return { ...r, state: 'upcoming' };
  });
}

// The highlighted registration deadline (race day itself doesn't count).
export function nextDeadline(timeline: TimelineEntry[]): TimelineEntry | null {
  return timeline.find((t) => t.state !== 'past' && t.kind !== 'race_day') ?? null;
}

// The .ics download for one timeline entry.
export function timelineCalendarHref(calendarBase: string, entry: TimelineEntry): string {
  return entry.kind === 'race_day' ? `${calendarBase}?event=raceday` : `${calendarBase}?milestone=${entry.id}`;
}

// Where "Register" should go: the registration page, else the source page,
// else the organizer's site. The label says which it is.
export function officialLink(
  edition: { registrationUrl: string | null; sourceUrl: string | null },
  organizerUrl: string | null,
): { href: string; label: string } | null {
  if (edition.registrationUrl) return { href: edition.registrationUrl, label: 'Register on the official site' };
  const href = edition.sourceUrl ?? organizerUrl;
  return href ? { href, label: 'Visit the official site' } : null;
}

// What the Sources panel shows for the edition on screen: its source, when it
// was checked, and whether that check is old. Null when there is no edition.
export function editionSources(
  edition: EditionSource | null | undefined,
  now: Date,
): { sourceUrl: string | null; lastVerifiedAt: string | null; stale: boolean } | null {
  if (!edition) return null;
  return {
    sourceUrl: edition.sourceUrl,
    lastVerifiedAt: edition.lastVerifiedAt?.toISOString() ?? null,
    stale: isStale(edition.lastVerifiedAt, now),
  };
}

export function sourceHost(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// The absolute URL of a race page, from the incoming request's headers.
export function pageUrlFrom(headers: { get(name: string): string | null }, slug: string): string {
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  const proto = headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}/races/${slug}`;
}

// A pre-filled GitHub issue for a missing or wrong detail on this race.
export function reportIssueUrl(race: { name: string }, year: number | null, pageUrl: string): string {
  const params = new URLSearchParams({
    title: `Race detail: ${race.name}${year ? ` (${year})` : ''}`,
    body: [
      `**Race:** ${race.name}${year ? ` — ${year} edition` : ''}`,
      `**Page:** ${pageUrl}`,
      '',
      '**What is missing or wrong?**',
      '',
      '',
      "**Where did you see the correct information? (link to the organizer's page if you can)**",
      '',
    ].join('\n'),
    labels: 'race-data',
  });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}
