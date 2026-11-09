// The reminder choices for the .ics download: presets, a custom time, and
// a note when the date has no stated time.
import AllDayReminderNote from '@/app/components/AllDayReminderNote';
import CustomReminderField from '@/app/components/CustomReminderField';
import ReminderPresetOption from '@/app/components/ReminderPresetOption';

export default function ReminderPicker({
  presets,
  defaults,
  timeKnown,
}: {
  presets: { id: string; label: string }[];
  // Preset ids that start ticked.
  defaults: string[];
  timeKnown: boolean;
}) {
  return (
    <fieldset>
      <legend>Apple / Outlook: remind me</legend>
      {presets.map((p) => (
        <ReminderPresetOption key={p.id} id={p.id} label={p.label} checked={defaults.includes(p.id)} />
      ))}
      <CustomReminderField />
      {!timeKnown && <AllDayReminderNote />}
    </fieldset>
  );
}
