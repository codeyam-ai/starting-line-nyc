import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  STORAGE_KEY,
  parseSavedRaces,
  nameFromSlug,
  readSavedRacesRaw,
  recordRegistrationBaselines,
  setSaveNote,
  setSaveStatus,
  storageAvailable,
  subscribeSavedRaces,
  withNote,
  withRegistrationBaseline,
  withSaveStatus,
} from '@/app/lib/savedRaces';

// A minimal browser: an in-memory localStorage plus event dispatch.
function fakeWindow({ blocked = false }: { blocked?: boolean } = {}) {
  const store = new Map<string, string>();
  const target = new EventTarget();
  const localStorage = {
    getItem: (k: string) => (blocked ? fail() : (store.get(k) ?? null)),
    setItem: (k: string, v: string) => (blocked ? fail() : void store.set(k, v)),
    removeItem: (k: string) => void store.delete(k),
  };
  function fail(): never {
    throw new Error('SecurityError: storage blocked');
  }
  const win = {
    localStorage,
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  };
  vi.stubGlobal('window', win);
  return { store, win };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parseSavedRaces', () => {
  // Nothing stored, or storage written by something else, reads as nothing saved.
  it('treats missing or corrupt storage as nothing saved', () => {
    expect(parseSavedRaces(null)).toEqual({});
    expect(parseSavedRaces('not json')).toEqual({});
    expect(parseSavedRaces('[1,2]')).toEqual({});
    expect(parseSavedRaces('"text"')).toEqual({});
  });

  // Only the three known statuses survive; anything else is dropped, not guessed.
  it('keeps known statuses and drops unknown ones', () => {
    const raw = JSON.stringify({
      'big-apple': { status: 'signed-up', savedAt: '2026-10-20T14:00:00.000Z' },
      'go-nuts': { status: 'maybe', savedAt: '2026-10-20T14:00:00.000Z' },
      escarpment: { status: 'interested' },
      broken: 'considering',
    });
    expect(parseSavedRaces(raw)).toEqual({
      'big-apple': { status: 'signed-up', savedAt: '2026-10-20T14:00:00.000Z' },
      escarpment: { status: 'interested', savedAt: '' },
    });
  });
});

describe('withSaveStatus', () => {
  const now = new Date('2026-10-27T12:00:00.000Z');

  // Saving a race records its status and when it was saved.
  it('adds a race with the time it was saved', () => {
    expect(withSaveStatus({}, 'big-apple', 'considering', now)).toEqual({
      'big-apple': { status: 'considering', savedAt: '2026-10-27T12:00:00.000Z' },
    });
  });

  // Changing the status is a new save; choosing the same status keeps the original time.
  it('restamps a changed status and keeps the time for an unchanged one', () => {
    const saved = { 'big-apple': { status: 'considering' as const, savedAt: '2026-10-01T00:00:00.000Z' } };
    expect(withSaveStatus(saved, 'big-apple', 'signed-up', now)['big-apple'].savedAt).toBe(
      '2026-10-27T12:00:00.000Z',
    );
    expect(withSaveStatus(saved, 'big-apple', 'considering', now)['big-apple'].savedAt).toBe(
      '2026-10-01T00:00:00.000Z',
    );
  });

  // Remove takes the race out entirely and leaves the input untouched.
  it('removes a race without mutating the input', () => {
    const saved = { 'big-apple': { status: 'interested' as const, savedAt: '' } };
    expect(withSaveStatus(saved, 'big-apple', null, now)).toEqual({});
    expect(saved).toEqual({ 'big-apple': { status: 'interested', savedAt: '' } });
  });
});

describe('setSaveStatus', () => {
  // A save lands in this browser's storage and tells listeners on the page.
  it('stores the status and notifies subscribers', () => {
    const { store } = fakeWindow();
    const onChange = vi.fn();
    const unsubscribe = subscribeSavedRaces(onChange);

    expect(setSaveStatus('big-apple', 'signed-up')).toBe(true);
    expect(parseSavedRaces(store.get(STORAGE_KEY) ?? null)['big-apple'].status).toBe('signed-up');
    expect(readSavedRacesRaw()).toBe(store.get(STORAGE_KEY));
    expect(onChange).toHaveBeenCalledTimes(1);

    unsubscribe();
    setSaveStatus('big-apple', null);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(parseSavedRaces(readSavedRacesRaw())).toEqual({});
  });

  // When the browser blocks storage (private browsing), saving reports failure instead of throwing.
  it('reports failure when storage is blocked', () => {
    fakeWindow({ blocked: true });
    expect(storageAvailable()).toBe(false);
    expect(setSaveStatus('big-apple', 'interested')).toBe(false);
    expect(readSavedRacesRaw()).toBeNull();
  });

  // On the server there is no browser at all.
  it('reports nothing saved and no storage outside a browser', () => {
    expect(readSavedRacesRaw()).toBeNull();
    expect(storageAvailable()).toBe(false);
    expect(setSaveStatus('big-apple', 'interested')).toBe(false);
  });
});

describe('parseSavedRaces extras', () => {
  // Name, note and the status at save survive a round trip; blanks and wrong types are dropped.
  it('keeps the name note and registration status at save', () => {
    const raw = JSON.stringify({
      a: { status: 'interested', savedAt: 'x', name: 'A Race', note: 'goal 2:05', registrationAtSave: 'open' },
      b: { status: 'interested', savedAt: 'x', name: '', note: 7, registrationAtSave: null },
    });
    expect(parseSavedRaces(raw)).toEqual({
      a: { status: 'interested', savedAt: 'x', name: 'A Race', note: 'goal 2:05', registrationAtSave: 'open' },
      b: { status: 'interested', savedAt: 'x' },
    });
  });
});

describe('withSaveStatus info', () => {
  const now = new Date('2026-10-27T12:00:00.000Z');

  // The first save records the race name and its registration status.
  it('records name and registration status on the first save', () => {
    expect(withSaveStatus({}, 'a', 'interested', now, { name: 'A Race', registrationStatus: 'open' })).toEqual({
      a: { status: 'interested', savedAt: '2026-10-27T12:00:00.000Z', name: 'A Race', registrationAtSave: 'open' },
    });
  });

  // A status change keeps the note and the ORIGINAL registration status, so a change stays visible.
  it('keeps the note and first registration status on a status change', () => {
    const saved = {
      a: { status: 'interested' as const, savedAt: 's', name: 'A', note: 'hi', registrationAtSave: 'not_announced' },
    };
    const next = withSaveStatus(saved, 'a', 'signed-up', now, { name: 'A', registrationStatus: 'open' });
    expect(next.a).toMatchObject({ status: 'signed-up', note: 'hi', registrationAtSave: 'not_announced' });
  });

  // Without info the stored name is kept.
  it('keeps the stored name when no info is passed', () => {
    const saved = { a: { status: 'interested' as const, savedAt: 's', name: 'A' } };
    expect(withSaveStatus(saved, 'a', 'considering', now).a.name).toBe('A');
  });
});

describe('withNote', () => {
  const saved = { a: { status: 'interested' as const, savedAt: 's' } };

  // A note is stored on the saved race without touching the input.
  it('sets a note', () => {
    expect(withNote(saved, 'a', 'goal 2:05').a.note).toBe('goal 2:05');
    expect(saved.a).toEqual({ status: 'interested', savedAt: 's' });
  });

  // Clearing the note removes it rather than storing whitespace.
  it('drops a blank note', () => {
    expect(withNote({ a: { ...saved.a, note: 'x' } }, 'a', '   ').a).toEqual(saved.a);
  });

  // A note for a race that isn't saved is ignored.
  it('ignores a race that is not saved', () => {
    expect(withNote(saved, 'b', 'note')).toBe(saved);
  });
});

describe('setSaveNote', () => {
  // A note lands in storage and tells listeners.
  it('stores the note and notifies subscribers', () => {
    const { store } = fakeWindow();
    setSaveStatus('a', 'interested');
    const onChange = vi.fn();
    const unsubscribe = subscribeSavedRaces(onChange);
    expect(setSaveNote('a', 'goal 2:05')).toBe(true);
    expect(parseSavedRaces(store.get(STORAGE_KEY) ?? null).a.note).toBe('goal 2:05');
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  // Blocked storage reports failure instead of throwing.
  it('reports failure when storage is blocked', () => {
    fakeWindow({ blocked: true });
    expect(setSaveNote('a', 'x')).toBe(false);
  });
});

describe('nameFromSlug', () => {
  // Words are capitalised and joined with spaces.
  it('turns a slug into a title', () => {
    expect(nameFromSlug('brooklyn-half-marathon')).toBe('Brooklyn Half Marathon');
  });

  // Distance tokens like 10k read as 10K.
  it('uppercases tokens that start with a digit', () => {
    expect(nameFromSlug('queens-10k')).toBe('Queens 10K');
  });

  // Stray dashes do not produce double spaces.
  it('ignores empty segments', () => {
    expect(nameFromSlug('-a--b-')).toBe('A B');
  });
});

describe('withSaveStatus legacy save', () => {
  const now = new Date('2026-11-06T12:00:00.000Z');

  // A save made before registration status was recorded starts tracking from this status change.
  it('records the current registration status for an older save that has none', () => {
    const saved = { a: { status: 'interested' as const, savedAt: 's' } };
    const next = withSaveStatus(saved, 'a', 'considering', now, { registrationStatus: 'open' });
    expect(next.a.registrationAtSave).toBe('open');
  });
});

describe('withRegistrationBaseline', () => {
  // An older save without a recorded status gets today's status as its starting point.
  it('fills a missing registration status', () => {
    const saved = { a: { status: 'interested' as const, savedAt: 's' } };
    expect(withRegistrationBaseline(saved, { a: 'open' }).a).toEqual({
      status: 'interested',
      savedAt: 's',
      registrationAtSave: 'open',
    });
    expect(saved.a).toEqual({ status: 'interested', savedAt: 's' });
  });

  // A status recorded at save is the real baseline and must never be overwritten.
  it('keeps a recorded registration status', () => {
    const saved = { a: { status: 'interested' as const, savedAt: 's', registrationAtSave: 'not_announced' } };
    expect(withRegistrationBaseline(saved, { a: 'open' })).toBe(saved);
  });

  // Races with no known current status are left alone rather than given an invented one.
  it('leaves races with no known status alone', () => {
    const saved = {
      a: { status: 'interested' as const, savedAt: 's' },
      b: { status: 'considering' as const, savedAt: 's' },
    };
    const next = withRegistrationBaseline(saved, { a: 'open', other: 'closed' });
    expect(next.a.registrationAtSave).toBe('open');
    expect(next.b).toBe(saved.b);
    expect(next.other).toBeUndefined();
  });

  // Returning the same object when nothing changed lets callers skip a write, avoiding a re-render loop.
  it('returns the same object when nothing needs filling', () => {
    const saved = { a: { status: 'interested' as const, savedAt: 's' } };
    expect(withRegistrationBaseline(saved, {})).toBe(saved);
    expect(withRegistrationBaseline({}, { a: 'open' })).toEqual({});
  });
});

describe('recordRegistrationBaselines', () => {
  // Missing baselines are stored and listeners are told, so the list re-reads them.
  it('stores filled baselines and notifies subscribers', () => {
    const { store } = fakeWindow();
    store.set(STORAGE_KEY, JSON.stringify({ a: { status: 'interested', savedAt: 's' } }));
    const onChange = vi.fn();
    const unsubscribe = subscribeSavedRaces(onChange);
    expect(recordRegistrationBaselines({ a: 'open' })).toBe(true);
    expect(parseSavedRaces(store.get(STORAGE_KEY) ?? null).a.registrationAtSave).toBe('open');
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  // Nothing to fill means no write and no event, otherwise the list's effect would loop.
  it('does not write or notify when nothing needs filling', () => {
    const { store, win } = fakeWindow();
    const raw = JSON.stringify({ a: { status: 'interested', savedAt: 's', registrationAtSave: 'open' } });
    store.set(STORAGE_KEY, raw);
    const setItem = vi.spyOn(win.localStorage, 'setItem');
    const onChange = vi.fn();
    const unsubscribe = subscribeSavedRaces(onChange);
    expect(recordRegistrationBaselines({ a: 'closed' })).toBe(true);
    expect(setItem).not.toHaveBeenCalled();
    expect(store.get(STORAGE_KEY)).toBe(raw);
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });

  // Blocked storage reports failure instead of throwing.
  it('reports failure when storage is blocked', () => {
    fakeWindow({ blocked: true });
    expect(recordRegistrationBaselines({ a: 'open' })).toBe(false);
  });
});

describe('setSaveNote for an unsaved race', () => {
  // A note for a race that isn't saved changes nothing, so nothing is written, yet storage still worked.
  it('skips the write for a race that is not saved and still reports success', () => {
    fakeWindow();
    const onChange = vi.fn();
    const unsubscribe = subscribeSavedRaces(onChange);
    expect(setSaveNote('missing', 'x')).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    unsubscribe();
  });
});
