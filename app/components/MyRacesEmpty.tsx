export default function MyRacesEmpty() {
  return (
    <div className="empty">
      <h2>No saved races yet.</h2>
      <p>
        Tap Save on any race to keep it here with its registration dates and your notes. Saves stay on this device.
      </p>
      <a className="btn btn-ink" href="/">
        Browse races
      </a>
    </div>
  );
}
