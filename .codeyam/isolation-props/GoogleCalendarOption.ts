import type Component from "../../app/components/GoogleCalendarOption";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Default: { href: "/api/races/escarpment-trail-run/calendar?milestone=1" },
};

// Width of the open add-to-calendar menu it sits in (.addcal-menu min-width).
export const captureWidth: number | undefined = 380;
