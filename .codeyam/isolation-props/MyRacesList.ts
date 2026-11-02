import type Component from "../../app/components/MyRacesList";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// No props: saves come from this browser's storage (set per scenario via
// browserState) and race facts from the seeded database via the summaries API.
export const scenarios: Record<string, Props> = {
  Default: {},
  Empty: {},
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
