'use client';

// Race facts for the saved races, fetched by slug. Keeps earlier results while
// a new set loads, and flags a failed load.
import { useEffect, useState } from 'react';
import { summariesUrl } from '@/app/lib/myRaces';
import type { SavedRaceSummary } from '@/app/lib/raceList';

export type Summaries = Record<string, SavedRaceSummary>;

// One request to the summaries route, keyed by slug. Rejects on a non-OK response.
export async function fetchRaceSummaries(key: string, fetchImpl: typeof fetch = fetch): Promise<Summaries> {
  const res = await fetchImpl(summariesUrl(key));
  if (!res.ok) throw new Error(`summaries request failed: ${res.status}`);
  const body = (await res.json()) as { summaries?: SavedRaceSummary[] };
  return Object.fromEntries((body.summaries ?? []).map((s) => [s.slug, s]));
}

// key: the sorted slug list from summariesKey; null or empty means nothing to fetch.
export function useRaceSummaries(key: string | null): { summaries: Summaries | null; failed: boolean } {
  const [summaries, setSummaries] = useState<Summaries | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetchRaceSummaries(key)
      .then((loaded) => {
        if (cancelled) return;
        setSummaries((prev) => ({ ...prev, ...loaded }));
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { summaries, failed };
}
