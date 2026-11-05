import type Component from "../../app/components/RaceOverNotice";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  // Great Gobble 5K, run Nov 21 2026, with a link to the organizer.
  RaceIsOver: {
    year: 2026,
    raceDate: "2026-11-21T14:00:00.000Z",
    organizerUrl: "https://nycruns.com",
  },
  // Same race when no organizer website is on file: no button.
  NoOrganizerSite: {
    year: 2026,
    raceDate: "2026-11-21T14:00:00.000Z",
    organizerUrl: null,
  },
};

// Capture width matches the main column on the race page.
export const captureWidth: number | undefined = 640;
