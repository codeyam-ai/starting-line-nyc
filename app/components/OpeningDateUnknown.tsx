// Key-dates row shown when the organizer hasn't published a registration opening date.
// We never guess a date; we say it isn't announced.
export default function OpeningDateUnknown({ alreadyOpened }: { alreadyOpened: boolean }) {
  return (
    <li className="tl unknown">
      <span className="dot" aria-hidden="true">
        ?
      </span>
      <div>
        <div className="when">Opening date not announced</div>
        <div className="sub">
          {alreadyOpened
            ? "Registration has already opened; the organizer doesn't say when."
            : "The organizer hasn't published when registration opens."}
        </div>
      </div>
    </li>
  );
}
