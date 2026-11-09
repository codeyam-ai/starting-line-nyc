// The custom reminder row: "Also [N] days before at [time] ET".
export default function CustomReminderField() {
  return (
    <label className="addcal-custom">
      Also
      <input type="number" name="customDays" min={1} max={90} inputMode="numeric" aria-label="Days before" />
      days before at
      <input type="time" name="customTime" defaultValue="09:00" aria-label="Time, Eastern" />
      ET
    </label>
  );
}
