import type Component from "../../app/components/OpeningDateUnknown";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  NotYetOpen: { alreadyOpened: false },
  AlreadyOpen: { alreadyOpened: true },
};

// Capture width matches the key-dates list on the race page.
export const captureWidth: number | undefined = 660;
