import type Component from "../../app/components/RaceNote";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

export const scenarios: Record<string, Props> = {
  Empty: { slug: "nycruns-big-apple-half-marathon", note: "" },
  WithNote: { slug: "nycruns-brooklyn-experience-half-marathon", note: "Goal 1:55. Wave B, bib pickup at the Brooklyn expo the Friday before." },
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
