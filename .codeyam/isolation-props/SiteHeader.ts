import type Component from "../../app/components/SiteHeader";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Default: { deadlinesHref: "/?distance=any&when=any" },
  // On the My Races page the My Races nav link is the highlighted one.
  MyRacesActive: { deadlinesHref: "/?distance=any&when=any&sort=deadline", active: "my-races" },
};

// Capture width matches the component's container on the home page.
export const captureWidth: number | undefined = 1200;
