import type Component from "../../app/components/RaceRow";
import type { ComponentProps } from "react";
import { centralParkHalf, bigBearHalf, escarpment, donuts10k } from "./_fixtures";
import { THANKSGIVING, TODAY } from "./_raceDetail";

type Props = ComponentProps<typeof Component>;

const bigBearWithSource = { ...bigBearHalf, sourceUrl: "https://www.sassquadtrailrunning.com/bigbearsquatchnorth" };

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  UrgentDeadline: { race: centralParkHalf, urgent: true },
  ExactTimeTrail: { race: bigBearHalf, urgent: false },
  QualifierNotAnnounced: { race: escarpment, urgent: false },
  NoPhotoRoad: { race: donuts10k, urgent: true },
  // My Races: Add to calendar shows for a deadline that isn't urgent yet.
  AlwaysOfferCalendar: { race: bigBearHalf, urgent: false, alwaysOfferCalendar: true },
  // Where the row's details come from: checked recently vs. more than 30 days ago.
  SourceChecked: { race: bigBearWithSource, urgent: false, now: TODAY },
  SourceCheckedLongAgo: { race: bigBearWithSource, urgent: false, now: THANKSGIVING },
};

// Capture width matches the component's container on the home page.
export const captureWidth: number | undefined = 1200;
