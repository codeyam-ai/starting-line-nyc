import type Component from "../../app/components/SavedRaceItem";
import type { ComponentProps } from "react";
import { NOW, bigAppleHalf, brooklynExperienceHalf } from "./_fixtures";

type Props = ComponentProps<typeof Component>;

export const scenarios: Record<string, Props> = {
  // Saved while registration was "Opening soon"; it has since opened.
  RegistrationChanged: {
    slug: bigAppleHalf.slug,
    saved: { status: "considering", savedAt: "2026-10-01T14:00:00.000Z", registrationAtSave: "opening_soon", note: "Waiting to hear about the work trip that weekend." },
    summary: { slug: bigAppleHalf.slug, state: "listed", race: bigAppleHalf },
    now: NOW,
  },
  ListedWithNote: {
    slug: brooklynExperienceHalf.slug,
    saved: { status: "signed-up", savedAt: "2026-10-20T14:00:00.000Z", registrationAtSave: "open", note: "Goal 1:55. Wave B, bib pickup at the Brooklyn expo the Friday before." },
    summary: { slug: brooklynExperienceHalf.slug, state: "listed", race: brooklynExperienceHalf },
    now: NOW,
  },
  NoUpcomingDate: {
    slug: "nycruns-queens-half-marathon",
    saved: { status: "interested", savedAt: "2026-09-01T14:00:00.000Z", name: "Queens Half Marathon", note: "Maybe next year." },
    summary: { slug: "nycruns-queens-half-marathon", state: "no-upcoming", name: "Queens Half Marathon" },
    now: NOW,
  },
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
