'use client';

// A private note, saved to this browser as you type.
import { useState } from 'react';
import { setSaveNote } from '@/app/lib/savedRaces';

export default function RaceNote({ slug, note }: { slug: string; note: string }) {
  const [draft, setDraft] = useState(note);
  const [failed, setFailed] = useState(false);
  const id = `note-${slug}`;
  return (
    <div className="mr-note">
      <label htmlFor={id} className="label">
        Your note
      </label>
      <textarea
        id={id}
        rows={1}
        value={draft}
        placeholder="e.g. waiting on lottery email, goal pace 2:05"
        onChange={(e) => {
          setDraft(e.target.value);
          setFailed(!setSaveNote(slug, e.target.value));
        }}
      />
      {failed && <p className="sub">This browser isn’t letting us save notes (private browsing can block it).</p>}
    </div>
  );
}
