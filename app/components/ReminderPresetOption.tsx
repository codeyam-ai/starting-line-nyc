// One reminder preset checkbox ("1 day before", …) in the reminder picker.
export default function ReminderPresetOption({ id, label, checked }: { id: string; label: string; checked: boolean }) {
  return (
    <label className="addcal-opt">
      <input type="checkbox" name="remind" value={id} defaultChecked={checked} />
      {label}
    </label>
  );
}
