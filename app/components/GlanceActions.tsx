// The race page's two actions side by side: enter on the organizer's site,
// and save the race on this device.
import OfficialLinkButton from '@/app/components/OfficialLinkButton';
import SaveRaceButton from '@/app/components/SaveRaceButton';

export default function GlanceActions({
  official,
  save,
}: {
  official: { href: string; label: string } | null;
  save?: { slug: string; raceName: string; registrationStatus?: string };
}) {
  if (!official && !save) return null;
  return (
    <div className="glance-actions">
      {official && <OfficialLinkButton href={official.href} label={official.label} />}
      {save && <SaveRaceButton slug={save.slug} raceName={save.raceName} registrationStatus={save.registrationStatus} />}
    </div>
  );
}
