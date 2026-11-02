'use client';

// Save a race as Interested, Considering or Signed up. Kept in this browser
// only — accounts aren't live yet, and the menu says so.
import { useEffect, useId, useRef, useState } from 'react';
import SaveMenu from '@/app/components/SaveMenu';
import { SAVE_STATUS_LABELS, setSaveStatus, storageAvailable, type SaveStatus } from '@/app/lib/savedRaces';
import { useSaveStatus } from '@/app/lib/useSaveStatus';

// registrationStatus is recorded on the first save so My Races can flag a later change.
export default function SaveRaceButton({
  slug,
  raceName,
  registrationStatus,
}: {
  slug: string;
  raceName: string;
  registrationStatus?: string;
}) {
  const status = useSaveStatus(slug);
  const [open, setOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) setUnavailable(!storageAvailable());
    setOpen(!open);
  };

  const choose = (next: SaveStatus | null) => {
    if (!setSaveStatus(slug, next, { name: raceName, registrationStatus })) {
      setUnavailable(true);
      return;
    }
    setOpen(false);
  };

  return (
    <div className="save" ref={rootRef}>
      <button
        type="button"
        className={status ? `btn btn-sm save-btn is-saved is-${status}` : 'btn btn-sm save-btn'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={status ? `${raceName}: ${SAVE_STATUS_LABELS[status]}. Change` : `Save ${raceName}`}
        onClick={toggle}
      >
        {status ? `✓ ${SAVE_STATUS_LABELS[status]}` : 'Save'}
      </button>
      {open && <SaveMenu id={menuId} raceName={raceName} status={status} unavailable={unavailable} onChoose={choose} />}
    </div>
  );
}
