import type Component from "../../app/components/SavedRaceGroup";
import type { ComponentProps } from "react";
import { NOW, bigAppleHalf, bigBearHalf } from "./_fixtures";

type Props = ComponentProps<typeof Component>;

export const scenarios: Record<string, Props> = {
  ConsideringTwo: {
    status: "considering",
    slugs: [bigAppleHalf.slug, bigBearHalf.slug],
    saved: {
      [bigAppleHalf.slug]: { status: "considering", savedAt: "2026-10-01T14:00:00.000Z", registrationAtSave: "opening_soon", note: "Waiting to hear about the work trip that weekend." },
      [bigBearHalf.slug]: { status: "considering", savedAt: "2026-10-12T14:00:00.000Z", registrationAtSave: "open" },
    },
    summaries: {
      [bigAppleHalf.slug]: { slug: bigAppleHalf.slug, state: "listed", race: bigAppleHalf },
      [bigBearHalf.slug]: { slug: bigBearHalf.slug, state: "listed", race: bigBearHalf },
    },
    now: NOW,
  },
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
