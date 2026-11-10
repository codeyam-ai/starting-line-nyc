import { weeksToTrainLabel } from '@/app/lib/raceList';

export default function WeeksToTrain({ weeks }: { weeks: number | null }) {
  return (
    <div className="c-wk">
      {weeks !== null && (
        <div className="wk">
          {weeks}
          <small>{weeksToTrainLabel(weeks)}</small>
        </div>
      )}
    </div>
  );
}
