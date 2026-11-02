import MyRacesHeader from '@/app/components/MyRacesHeader';
import MyRacesList from '@/app/components/MyRacesList';
import TimezoneNote from '@/app/components/TimezoneNote';

// The main area of My Races: title, timezone note, and the saved races.
export default function MyRacesSection() {
  return (
    <main className="results mr" aria-labelledby="mr-title">
      <MyRacesHeader />
      <TimezoneNote />
      <MyRacesList />
    </main>
  );
}
