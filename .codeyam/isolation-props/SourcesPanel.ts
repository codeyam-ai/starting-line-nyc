import type Component from "../../app/components/SourcesPanel";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const reportHref = "https://github.com/nseldeib/starting-line-nyc/issues/new?title=Race+detail%3A+Big+Bear+Squatch+North+Half+Marathon+%282027%29&labels=race-data";

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  Verified: { sourceUrl: "https://www.sassquadtrailrunning.com/bigbearsquatchnorth", lastVerifiedAt: "2026-10-26T20:00:00.000Z", stale: false, reportHref },
  CheckedLongAgo: { sourceUrl: "https://www.sassquadtrailrunning.com/bigbearsquatchnorth", lastVerifiedAt: "2026-10-26T20:00:00.000Z", stale: true, reportHref },
  NoSource: { sourceUrl: null, lastVerifiedAt: null, stale: true, reportHref },
};

// Capture width matches the component's container on the race page.
export const captureWidth: number | undefined = 520;
