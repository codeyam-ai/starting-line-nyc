'use client';

// The races saved in this browser, grouped Signed up → Considering →
// Interested, soonest race first. Saves and notes come from this browser;
// race facts come from the server by slug.
import { useEffect, useState } from 'react';
import MyRacesEmpty from '@/app/components/MyRacesEmpty';
import MyRacesLoading from '@/app/components/MyRacesLoading';
import SavedRaceGroup from '@/app/components/SavedRaceGroup';
import { allSummariesLoaded, groupSavedRaces, listedRegistrationStatuses, summariesKey } from '@/app/lib/myRaces';
import { recordRegistrationBaselines } from '@/app/lib/savedRaces';
import { useRaceSummaries } from '@/app/lib/useRaceSummaries';
import { useSavedRaces } from '@/app/lib/useSavedRaces';

export default function MyRacesList() {
  const saved = useSavedRaces();
  const { summaries, failed } = useRaceSummaries(summariesKey(saved));
  const [now] = useState(() => new Date());

  // Older saves have no registration status recorded; start tracking them from today.
  useEffect(() => {
    if (summaries) recordRegistrationBaselines(listedRegistrationStatuses(summaries));
  }, [summaries]);

  if (!saved) return <MyRacesLoading />;
  if (Object.keys(saved).length === 0) return <MyRacesEmpty />;
  if (failed && !summaries) return <MyRacesLoading failed />;
  if (!allSummariesLoaded(saved, summaries)) return <MyRacesLoading />;

  return (
    <>
      {groupSavedRaces(saved, summaries).map((g) => (
        <SavedRaceGroup key={g.status} status={g.status} slugs={g.slugs} saved={saved} summaries={summaries} now={now} />
      ))}
    </>
  );
}
