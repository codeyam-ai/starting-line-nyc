import type Component from "../../app/components/SourceLine";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Checked: { sourceUrl: "https://nycruns.com/race/nycruns-great-gobble-5k", lastVerifiedAt: "2026-10-26T20:00:00.000Z" },
  CheckedLongAgo: { sourceUrl: "https://nycruns.com/race/nycruns-great-gobble-5k", lastVerifiedAt: "2026-10-26T20:00:00.000Z", stale: true, label: "From" },
  NoSource: { sourceUrl: null, lastVerifiedAt: null },
};

export const captureWidth: number | undefined = 480;
