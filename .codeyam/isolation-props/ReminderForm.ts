import type Component from "../../app/components/ReminderForm";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  // Race day: 1 day before starts ticked.
  RaceDay: { href: "/api/races/escarpment-trail-run/calendar?event=raceday", dateKind: "race_day", timeKnown: true },
};

// Width of the open add-to-calendar menu it sits in (.addcal-menu min-width).
export const captureWidth: number | undefined = 380;
