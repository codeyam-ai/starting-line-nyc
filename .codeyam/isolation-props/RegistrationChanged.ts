import type Component from "../../app/components/RegistrationChanged";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

export const scenarios: Record<string, Props> = {
  OpenedSinceSave: { from: "Opening soon", to: "Open" },
  SoldOutSinceSave: { from: "Open", to: "Sold out" },
};

// Capture width matches the My Races content column (the same 1200px results container as the home page).
export const captureWidth: number | undefined = 1200;
