import type Component from "../../app/components/GoneRaceNotice";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

export const scenarios: Record<string, Props> = {
  NoUpcomingDate: { slug: "nycruns-queens-half-marathon", name: "Queens Half Marathon", reason: "no-upcoming" },
  NoLongerListed: { slug: "staten-island-half", name: "Staten Island Half", reason: "not-listed" },
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
