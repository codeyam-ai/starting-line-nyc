// The placeholder line while saves and race details load, or when loading failed.
export default function MyRacesLoading({ failed = false }: { failed?: boolean }) {
  return (
    <p className="mr-loading">
      {failed ? 'We couldn’t load race details. Try reloading the page.' : 'Loading your saved races…'}
    </p>
  );
}
