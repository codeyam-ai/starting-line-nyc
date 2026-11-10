import type Component from "../../app/components/WeeksToTrain";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Default: { weeks: 12 },
  "One Week": { weeks: 1 },
};

// Capture width matches the component's container on the home page.
export const captureWidth: number | undefined = 130;
