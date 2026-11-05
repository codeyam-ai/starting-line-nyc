import type Component from "../../app/components/SourceHostLink";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  // An official page shows as just its site name, without "www.".
  OfficialSite: {
    sourceUrl: "https://www.nyrr.org/races/2027-united-airlines-nyc-half",
  },
};

// Inline link; sized like the Sources panel in the race page sidebar.
export const captureWidth: number | undefined = 320;
