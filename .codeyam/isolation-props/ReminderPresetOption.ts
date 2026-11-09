import type Component from "../../app/components/ReminderPresetOption";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Ticked: { id: "1d", label: "1 day before", checked: true },
  Unticked: { id: "1w", label: "1 week before", checked: false },
};

// Width of the open add-to-calendar menu it sits in (.addcal-menu min-width).
export const captureWidth: number | undefined = 380;
