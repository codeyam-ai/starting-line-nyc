import type Component from "../../app/components/SavedRaceGroupHeading";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

export const scenarios: Record<string, Props> = {
  SignedUpOne: { status: "signed-up", count: 1 },
  InterestedSeveral: { status: "interested", count: 3 },
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
