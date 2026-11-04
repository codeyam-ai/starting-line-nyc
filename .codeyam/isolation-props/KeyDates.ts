import type Component from "../../app/components/KeyDates";
import type { ComponentProps } from "react";
import { bigBearTimeline, centralParkTimelineDec10, escarpmentTimeline, statenIslandTimeline } from "./_raceDetail";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Upcoming: { year: 2027, timeline: bigBearTimeline, calendarBase: "/api/races/big-bear-squatch-north-half/calendar", registrationStatus: "open" },
  SomePassed: { year: 2027, timeline: centralParkTimelineDec10, calendarBase: "/api/races/nycruns-central-park-half-marathon/calendar", registrationStatus: "open" },
  OpeningPublished: { year: 2027, timeline: statenIslandTimeline, calendarBase: "/api/races/unforgettable-staten-island-half-marathon/calendar", registrationStatus: "open" },
  NothingAnnounced: { year: 2027, timeline: [], calendarBase: "/api/races/escarpment-trail-run/calendar", registrationStatus: "not_announced" },
};

// Capture width matches the component's container on the race page.
export const captureWidth: number | undefined = 660;
