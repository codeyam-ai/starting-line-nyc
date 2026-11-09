// The .ics download with reminders: a plain GET form to the calendar route,
// so no client JS. Hidden inputs carry the link's own query (milestone or
// race day); r=1 marks that the runner made a reminder choice.
import ReminderPicker from '@/app/components/ReminderPicker';
import { calendarFormTarget } from '@/app/lib/raceCalendar';
import { defaultReminders, reminderPresetsFor } from '@/app/lib/reminders';

export default function ReminderForm({
  href,
  dateKind,
  timeKnown,
}: {
  href: string;
  dateKind: string;
  timeKnown: boolean;
}) {
  const { action, params } = calendarFormTarget(href);
  return (
    <form className="addcal-remind" action={action} method="get">
      {params.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input type="hidden" name="r" value="1" />
      <ReminderPicker presets={reminderPresetsFor(timeKnown)} defaults={defaultReminders(dateKind)} timeKnown={timeKnown} />
      <button type="submit" className="btn btn-sm">
        Download .ics with reminders
      </button>
      <p className="addcal-note">Your calendar app will remind you.</p>
    </form>
  );
}
