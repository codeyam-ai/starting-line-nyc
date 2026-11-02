import type Component from "../../app/components/SortToggle";
import type { ComponentProps } from "react";
import { defaultFilters } from "./_fixtures";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  NextDeadline: { filters: defaultFilters },
  RaceDay: { filters: { ...defaultFilters, sort: "raceday" } },
  RegistrationOpens: { filters: { ...defaultFilters, sort: "opens" } },
  Distance: { filters: { ...defaultFilters, sort: "distance" } },
};

// Capture width matches the component's container on the home page.
export const captureWidth: number | undefined = undefined;
