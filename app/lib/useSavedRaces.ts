'use client';

// Every race saved in this browser, kept in sync with saves made elsewhere on
// the page and in other tabs. Null on the server and before hydration, so the
// first render matches the server's.
import { useSyncExternalStore } from 'react';
import { parseSavedRaces, readSavedRacesRaw, subscribeSavedRaces, type SavedRaces } from '@/app/lib/savedRaces';

const notHydrated = () => undefined;

export function useSavedRaces(): SavedRaces | null {
  const raw = useSyncExternalStore(subscribeSavedRaces, readSavedRacesRaw, notHydrated);
  return raw === undefined ? null : parseSavedRaces(raw);
}
