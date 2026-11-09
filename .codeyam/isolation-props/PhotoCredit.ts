import type Component from "../../app/components/PhotoCredit";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route. It lives here, under
// `.codeyam/`, rather than in the app's source tree — anything under the app's
// source tree compiles into the app and ships with it.
//
// TODO: fill in one entry per scenario, then register each with:
//   codeyam-editor editor register '{"name":"<Name> - <Scenario>","componentName":"<Name>","url":"/isolated-components/<Name>?s=<Scenario>","dimensions":["Desktop"]}'
// SEED data that exercises the component — populate lists with realistic rows,
// fill optional fields, trigger pluralization. All-empty props ([] / null)
// render an empty shell and is a bug; put empty / loading / error in their own
// separate scenarios.
export const scenarios: Record<string, Props> = {
  RacePhoto: { path: "/images/catskill-mountain-house-view.jpg" },
  HomeHeroPhoto: { path: "/images/central-park-drive.jpg" },
};

// Capture width, in pixels, or `undefined` for a full-width surface.
//
// CENTERING is handled by the route layout (flex + min-height:100vh), so never
// re-wrap in min-h-screen / items-center / justify-center — that fights the
// layout and produces an off-center capture.
//
// WIDTH should match the component's real container, read from its usage site.
// Leave this `undefined` for a full-width surface, or set it to the number
// from the real grid/column for a bounded card. Never a fabricated width.
//
// It lives here rather than in the route file so the route stays fully
// derived — a width hand-edited into the route would be lost on regeneration.
export const captureWidth: number | undefined = undefined;
