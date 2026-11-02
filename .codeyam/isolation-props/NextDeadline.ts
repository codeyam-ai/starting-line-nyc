import type Component from "../../app/components/NextDeadline";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  UrgentPriceRise: { status: "open", milestone: { kind: "price_increase", at: "2026-10-27T03:59:00.000Z", timeKnown: false, tentative: false }, urgent: true, calendarHref: "/api/races/nycruns-central-park-half-marathon/calendar" },
  ExactTime: { status: "open", milestone: { kind: "price_increase", at: "2027-01-01T04:59:00.000Z", timeKnown: true, tentative: false }, urgent: false, calendarHref: "/api/races/big-bear-squatch-north-half/calendar" },
  NotAnnounced: { status: "not_announced", milestone: { kind: "registration_closes", at: "2027-07-14T03:59:00.000Z", timeKnown: false, tentative: false }, urgent: false, calendarHref: "/api/races/escarpment-trail-run/calendar" },
  NoUpcomingDate: { status: "not_announced", milestone: null, urgent: false, calendarHref: "/api/races/escarpment-trail-run/calendar" },
  // My Races: Add to calendar offered for a deadline that is not urgent yet.
  AlwaysOfferCalendar: { status: "open", milestone: { kind: "price_increase", at: "2027-01-01T04:59:00.000Z", timeKnown: true, tentative: false }, urgent: false, calendarHref: "/api/races/big-bear-squatch-north-half/calendar", alwaysOfferCalendar: true },
};

// Capture width matches the component's container on the home page.
export const captureWidth: number | undefined = 306;
