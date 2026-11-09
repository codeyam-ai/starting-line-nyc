import type Component from "../../app/components/RaceHero";
import type { ComponentProps } from "react";
import RaceTitle from "../../app/components/RaceTitle";
import { createElement } from "react";

type Props = ComponentProps<typeof Component>;

// Scenario data for this component's isolation route.
export const scenarios: Record<string, Props> = {
  WithPhoto: {
    photoUrl: "/images/harriman-ramapo-dunderberg-trail.jpg", photoAlt: "The Ramapo-Dunderberg Trail through forest in Harriman State Park",
    children: createElement(RaceTitle, { name: "Big Bear Squatch North Half Marathon", terrain: "trail", organizer: "Sassquad & NY-NJ Trail Conference", place: "Anthony Wayne Recreation Area, Harriman State Park, Bear Mountain, NY" }),
  },
  NoPhoto: {
    photoUrl: null, photoAlt: null,
    children: createElement(RaceTitle, { name: "Brooklyn Experience Half Marathon", terrain: "road", organizer: "NYCRUNS", place: "North Brooklyn to Prospect Park, Brooklyn" }),
  },
};

// Capture width matches the component's container on the race page.
export const captureWidth: number | undefined = 1200;
