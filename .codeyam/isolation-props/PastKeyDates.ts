import type Component from "../../app/components/PastKeyDates";
import type { ComponentProps } from "react";
import { greatGobblePastTimeline } from "./_raceDetail";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  // Great Gobble 5K's 2026 dates, all passed, each with its source line.
  AllPassed: {
    year: 2026,
    timeline: greatGobblePastTimeline,
    calendarBase: "/api/races/nycruns-great-gobble-5k/calendar",
  },
};

// Capture width matches the main column on the race page.
export const captureWidth: number | undefined = 640;
