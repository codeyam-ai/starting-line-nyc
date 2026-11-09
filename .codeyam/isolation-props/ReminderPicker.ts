import type Component from "../../app/components/ReminderPicker";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const ALL = [
  { id: "0", label: "At the time" },
  { id: "1h", label: "1 hour before" },
  { id: "1d", label: "1 day before" },
  { id: "3d", label: "3 days before" },
  { id: "1w", label: "1 week before" },
];

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  // A registration opening with a stated time.
  Opening: { presets: ALL, defaults: ["1d", "0"], timeKnown: true },
  // A date with no stated time: "1 hour before" is not offered.
  NoTimeStated: { presets: ALL.filter((p) => p.id !== "1h"), defaults: ["3d"], timeKnown: false },
};

// Width of the open add-to-calendar menu it sits in (.addcal-menu min-width).
export const captureWidth: number | undefined = 380;
