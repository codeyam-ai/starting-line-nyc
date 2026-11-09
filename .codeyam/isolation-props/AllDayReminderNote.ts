import type Component from "../../app/components/AllDayReminderNote";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route. It takes no props.
export const scenarios: Record<string, Props> = {
  Default: {},
};

// Width of the open add-to-calendar menu it sits in (.addcal-menu min-width).
export const captureWidth: number | undefined = 380;
