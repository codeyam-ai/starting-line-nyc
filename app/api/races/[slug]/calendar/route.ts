// Downloadable calendar event (.ics) for a race's next registration
// milestone, one milestone with ?milestone=<id>, or race day with ?event=raceday.
// ?target=google redirects to Google Calendar's create-event page instead.
// Reminders: ?r=1 marks a choice made in the reminder picker, carried in
// ?remind=<token> (repeatable) plus ?customDays=N&customTime=HH:MM. Without
// ?r the date's default reminders apply.
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { buildIcs } from '@/app/lib/ics';
import { chosenReminders, reminderAlarms, resolveReminders } from '@/app/lib/reminders';
import {
  calendarFileName,
  googleCalendarUrl,
  raceCalendarEvent,
  type CalendarEventKind,
} from '@/app/lib/raceCalendar';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const search = new URL(request.url).searchParams;
  const milestoneId = Number(search.get('milestone'));
  const kind: CalendarEventKind =
    search.get('event') === 'raceday' ? 'raceday' : Number.isInteger(milestoneId) && milestoneId > 0 ? milestoneId : 'next';

  const race = await prisma.race.findUnique({ where: { slug }, include: { editions: { include: { milestones: true } } } });
  if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 });

  const result = raceCalendarEvent(race, kind, new Date());
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 404 });

  if (search.get('target') === 'google') return NextResponse.redirect(googleCalendarUrl(result.event));

  const alarms = reminderAlarms(resolveReminders(chosenReminders(search), result.dateKind), {
    title: result.event.title,
    start: result.event.start,
    allDay: !!result.event.allDayDate,
  });

  return new NextResponse(buildIcs({ ...result.event, alarms }), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${calendarFileName(race.slug, kind)}"`,
    },
  });
}
