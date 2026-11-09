import type Component from "../../app/components/AddToCalendar";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route. The open state is
// reached by the scenario's `interactions` (click "Add to calendar").
export const scenarios: Record<string, Props> = {
  Closed: { href: "/api/races/big-bear-squatch-north-half/calendar?milestone=16" },
  // A deadline with a stated time: 3 days before starts ticked.
  OpenDeadline: { href: "/api/races/escarpment-trail-run/calendar?milestone=1", dateKind: "registration_closes" },
  // A registration opening: 1 day before and at opening time start ticked.
  OpenOpening: { href: "/api/races/escarpment-trail-run/calendar?milestone=2", dateKind: "registration_opens" },
  // A deadline with no time stated: no "1 hour before", reminders at 9 am.
  OpenAllDay: {
    href: "/api/races/big-bear-squatch-north-half/calendar?milestone=16",
    dateKind: "price_increase",
    timeKnown: false,
  },
  // A custom reminder typed in ("Also 2 days before at 6:30 pm ET").
  OpenCustom: { href: "/api/races/escarpment-trail-run/calendar?milestone=1", dateKind: "registration_closes" },
};

// Capture width matches the timeline column on the race page.
export const captureWidth: number | undefined = 640;
