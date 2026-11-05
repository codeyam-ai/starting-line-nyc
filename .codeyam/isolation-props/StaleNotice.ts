import type Component from "../../app/components/StaleNotice";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  CheckedLongAgo: { lastVerifiedAt: "2026-10-26T20:00:00.000Z" },
  NeverChecked: { lastVerifiedAt: null },
};

export const captureWidth: number | undefined = 520;
