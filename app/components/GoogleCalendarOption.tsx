// The Google Calendar choice in the add-to-calendar menu. Google's
// create-event link can't carry reminders, so the note says what happens.
import { googleCalendarHref } from '@/app/lib/raceCalendar';

export default function GoogleCalendarOption({ href }: { href: string }) {
  return (
    <>
      <a href={googleCalendarHref(href)} target="_blank" rel="noopener noreferrer">
        Google Calendar
      </a>
      <p className="addcal-note">Google uses your usual notification settings.</p>
    </>
  );
}
