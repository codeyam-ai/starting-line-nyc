// Shown when the organizer gave a date but no time: when reminders go off.
import { ALL_DAY_REMINDER_HOUR } from '@/app/lib/reminders';

export default function AllDayReminderNote() {
  return <p className="addcal-note">No time is stated, so reminders go off at {ALL_DAY_REMINDER_HOUR} am.</p>;
}
