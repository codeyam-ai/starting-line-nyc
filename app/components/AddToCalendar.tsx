// "Add to calendar" menu: Google Calendar first, then the .ics download for
// Apple Calendar and Outlook with a reminder picker. Both come from the same
// calendar route, so the event details always match. A <details> disclosure
// and a plain GET form, so no client JS.
import GoogleCalendarOption from '@/app/components/GoogleCalendarOption';
import ReminderForm from '@/app/components/ReminderForm';

export default function AddToCalendar({
  href,
  dateKind = 'deadline',
  timeKnown = true,
}: {
  href: string;
  // The milestone kind ('registration_opens', 'deadline', …) or 'race_day';
  // picks which reminders start ticked.
  dateKind?: string;
  // False when the organizer gave a date but no time.
  timeKnown?: boolean;
}) {
  return (
    <details className="addcal">
      <summary className="cal">Add to calendar</summary>
      <div className="addcal-menu">
        <GoogleCalendarOption href={href} />
        <ReminderForm href={href} dateKind={dateKind} timeKnown={timeKnown} />
      </div>
    </details>
  );
}
