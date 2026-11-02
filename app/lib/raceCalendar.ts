// Chooses the calendar event for a race: its next registration milestone,
// one specific milestone, or its race day. Pure — the route loads the race
// and serves the file.
import { etDate, formatWhen, MILESTONE_LABELS } from '@/app/lib/format';
import { icsDate, type CalendarEvent } from '@/app/lib/ics';
import { milestoneEnd, nextMilestone, upcomingEdition, type MilestoneRecord } from '@/app/lib/raceList';

export type CalendarRace = {
  slug: string;
  name: string;
  locationName: string;
  editions: {
    year: number;
    raceDate: Date | null;
    raceTimeKnown?: boolean;
    registrationUrl: string | null;
    isSample: boolean;
    milestones: (MilestoneRecord & { id?: number })[];
  }[];
};

// 'next' = the next upcoming milestone; a number = that milestone's id.
export type CalendarEventKind = 'next' | 'raceday' | number;

export type CalendarEventResult = { event: CalendarEvent } | { error: string };

const RACE_DAY_MINUTES = 240;
const MILESTONE_MINUTES = 30;

export function raceCalendarEvent(race: CalendarRace, kind: CalendarEventKind, now: Date): CalendarEventResult {
  const edition = upcomingEdition(race.editions, now);
  if (!edition) return { error: 'No upcoming edition' };

  let title: string;
  let start: Date;
  let durationMinutes: number;
  let timeKnown = true;
  let note: string | null | undefined;
  if (kind === 'raceday') {
    if (!edition.raceDate) return { error: 'Race date not announced' };
    title = `${race.name} (race day)`;
    start = edition.raceDate;
    durationMinutes = RACE_DAY_MINUTES;
    timeKnown = edition.raceTimeKnown ?? true;
  } else {
    const m =
      kind === 'next'
        ? nextMilestone(edition.milestones, now)
        : (edition.milestones.find((x) => x.id === kind) ?? null);
    if (!m) return { error: kind === 'next' ? 'No upcoming registration date' : 'Registration date not found' };
    if (milestoneEnd(m) < now) return { error: 'That registration date has passed' };
    title = `${race.name}: ${MILESTONE_LABELS[m.kind] ?? m.kind}`;
    start = m.at;
    durationMinutes = MILESTONE_MINUTES;
    timeKnown = m.timeKnown;
    note = m.note;
  }

  const description = [
    `${formatWhen(start, timeKnown)} (Eastern Time).`,
    note ?? null,
    edition.registrationUrl ? `Official registration: ${edition.registrationUrl}` : null,
    edition.isSample ? 'Sample data from Starting Line. Confirm on the official site.' : null,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    event: {
      uid: `${race.slug}-${edition.year}-${kind}@startingline`,
      title,
      start,
      durationMinutes,
      location: race.locationName,
      description,
      stamp: now,
      ...(timeKnown ? {} : { allDayDate: etDate(start) }),
    },
  };
}

// Google Calendar's public "create event" link for the same event the .ics
// carries. Timed events go in UTC; all-day events use the Eastern date with
// Google's exclusive end date (the following day).
export function googleCalendarUrl(event: CalendarEvent): string {
  let dates: string;
  if (event.allDayDate) {
    const day = event.allDayDate.replace(/-/g, '');
    const next = new Date(`${event.allDayDate}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    dates = `${day}/${next.toISOString().slice(0, 10).replace(/-/g, '')}`;
  } else {
    const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
    dates = `${icsDate(event.start)}/${icsDate(end)}`;
  }
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates, ctz: 'America/New_York' });
  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// The calendar route link that redirects to Google Calendar instead of
// downloading the .ics, keeping any milestone or race-day query.
export function googleCalendarHref(calendarHref: string): string {
  return `${calendarHref}${calendarHref.includes('?') ? '&' : '?'}target=google`;
}

export function calendarFileName(slug: string, kind: CalendarEventKind): string {
  if (kind === 'raceday') return `${slug}-raceday.ics`;
  if (typeof kind === 'number') return `${slug}-deadline-${kind}.ics`;
  return `${slug}.ics`;
}
