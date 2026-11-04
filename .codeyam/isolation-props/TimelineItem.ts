import type Component from "../../app/components/TimelineItem";
import type { ComponentProps } from "react";
import { bigBearTimeline, centralParkTimelineDec10, escarpmentTimeline, statenIslandTimeline } from "./_raceDetail";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Next: { entry: bigBearTimeline[0], calendarHref: "/api/races/big-bear-squatch-north-half/calendar?milestone=16" },
  UpcomingTimed: { entry: bigBearTimeline[1], calendarHref: "/api/races/big-bear-squatch-north-half/calendar?milestone=17" },
  PassedDateOnly: { entry: centralParkTimelineDec10[0], calendarHref: "/api/races/nycruns-central-park-half-marathon/calendar?milestone=9" },
  RegistrationOpened: { entry: statenIslandTimeline[0], calendarHref: "/api/races/unforgettable-staten-island-half-marathon/calendar?milestone=35" },
  RaceDay: { entry: bigBearTimeline[2], calendarHref: "/api/races/big-bear-squatch-north-half/calendar?event=raceday" },
};

// Capture width matches the component's container on the race page.
export const captureWidth: number | undefined = 640;
