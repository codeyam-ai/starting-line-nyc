import type Component from "../../app/components/PastEditionNotice";
import type { ComponentProps } from "react";
import { greatGobblePastTimeline } from "./_raceDetail";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  // Great Gobble 5K on Thanksgiving 2026, five days after it was run.
  RaceIsOver: {
    year: 2026,
    raceDate: "2026-11-21T14:00:00.000Z",
    timeline: greatGobblePastTimeline,
    calendarBase: "/api/races/nycruns-great-gobble-5k/calendar",
    organizerUrl: "https://nycruns.com",
  },
};

// Capture width matches the main column on the race page.
export const captureWidth: number | undefined = 640;
