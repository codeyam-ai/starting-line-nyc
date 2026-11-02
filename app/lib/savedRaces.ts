// Saved races live in this browser only (localStorage), keyed by race slug.
// Accounts aren't live yet, so nothing is sent to a server. Every read
// tolerates missing, blocked or corrupt storage and falls back to "nothing saved".

export type SaveStatus = 'interested' | 'considering' | 'signed-up';

// name: the race's name when saved, shown if the race is later unlisted.
// note: the runner's private note. registrationAtSave: the race's registration
// status when it was first saved, so My Races can flag a change since then.
export type SavedRace = {
  status: SaveStatus;
  savedAt: string;
  name?: string;
  note?: string;
  registrationAtSave?: string;
};

// What a save button knows about the race, recorded alongside the status.
export type SaveRaceInfo = { name?: string; registrationStatus?: string };

export type SavedRaces = Record<string, SavedRace>;

export const STORAGE_KEY = 'starting-line:saved-races';

export const SAVE_STATUSES: SaveStatus[] = ['interested', 'considering', 'signed-up'];

export const SAVE_STATUS_LABELS: Record<SaveStatus, string> = {
  interested: 'Interested',
  considering: 'Considering',
  'signed-up': 'Signed up',
};

const CHANGE_EVENT = 'starting-line:saved-races-changed';

function isSaveStatus(value: unknown): value is SaveStatus {
  return typeof value === 'string' && (SAVE_STATUSES as string[]).includes(value);
}

// Parses the stored JSON, dropping any entry that isn't a known status.
export function parseSavedRaces(raw: string | null): SavedRaces {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const saved: SavedRaces = {};
  for (const [slug, entry] of Object.entries(parsed as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object') continue;
    const { status, savedAt, name, note, registrationAtSave } = entry as Record<string, unknown>;
    if (!isSaveStatus(status)) continue;
    const race: SavedRace = { status, savedAt: typeof savedAt === 'string' ? savedAt : '' };
    if (typeof name === 'string' && name) race.name = name;
    if (typeof note === 'string' && note) race.note = note;
    if (typeof registrationAtSave === 'string' && registrationAtSave) race.registrationAtSave = registrationAtSave;
    saved[slug] = race;
  }
  return saved;
}

// Returns the next saved set: the race's status set, or the race removed when status is null.
// A status change keeps the note and the registration status recorded at the first save.
export function withSaveStatus(
  saved: SavedRaces,
  slug: string,
  status: SaveStatus | null,
  now: Date = new Date(),
  info: SaveRaceInfo = {},
): SavedRaces {
  const next = { ...saved };
  const prev = next[slug];
  if (status === null) {
    delete next[slug];
    return next;
  }
  const race: SavedRace = { status, savedAt: prev?.status === status ? prev.savedAt : now.toISOString() };
  const name = info.name ?? prev?.name;
  if (name) race.name = name;
  if (prev?.note) race.note = prev.note;
  const atSave = prev ? prev.registrationAtSave : info.registrationStatus;
  if (atSave) race.registrationAtSave = atSave;
  next[slug] = race;
  return next;
}

// Returns the next saved set with the race's note replaced; a blank note is dropped.
// A race that isn't saved is left alone.
export function withNote(saved: SavedRaces, slug: string, note: string): SavedRaces {
  const prev = saved[slug];
  if (!prev) return saved;
  const race: SavedRace = { ...prev };
  if (note.trim()) race.note = note;
  else delete race.note;
  return { ...saved, [slug]: race };
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

// Raw stored string, so useSyncExternalStore gets a stable snapshot between changes.
export function readSavedRacesRaw(): string | null {
  try {
    return storage()?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function update(change: (saved: SavedRaces) => SavedRaces): boolean {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(change(parseSavedRaces(store.getItem(STORAGE_KEY)))));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

// Saves the status (or removes the race), recording the race's name and its
// registration status at the first save. Returns false when storage is unavailable.
export function setSaveStatus(slug: string, status: SaveStatus | null, info?: SaveRaceInfo): boolean {
  return update((saved) => withSaveStatus(saved, slug, status, new Date(), info));
}

// A readable name from a slug, for races saved before names were recorded.
export function nameFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => (/^\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

// Saves the race's private note. Returns false when storage is unavailable.
export function setSaveNote(slug: string, note: string): boolean {
  return update((saved) => withNote(saved, slug, note));
}

// Notifies on saves from this tab and from other tabs.
export function subscribeSavedRaces(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function storageAvailable(): boolean {
  const store = storage();
  if (!store) return false;
  try {
    const probe = `${STORAGE_KEY}:probe`;
    store.setItem(probe, '1');
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
