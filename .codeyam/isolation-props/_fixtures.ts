// Shared data for isolated component scenarios: the real races in
// prisma/race-data.json (researched from organizers' pages on 2026-10-26),
// as the home page shows them on that date.
import type { RaceFilters } from "../../app/lib/filters";
import type { RaceListItem } from "../../app/lib/raceList";

export const NOW = new Date("2026-10-26T20:00:00Z");

export const defaultFilters: RaceFilters = { q: "", distance: "half", when: "6m", terrain: "any", status: [], sort: "deadline" };

const base = { elevationGainFt: null, photoUrl: null, photoAlt: null, raceDateTentative: false, entryMethod: "open", isSample: false, registrationOpens: null, sourceUrl: null as string | null, lastVerifiedAt: "2026-10-26T20:00:00.000Z" as string | null };

export const bigAppleHalf: RaceListItem = {
  ...base, slug: "nycruns-big-apple-half-marathon", name: "Big Apple Half Marathon", terrain: "road", distanceMiles: 13.1,
  locationName: "Central Park", organizer: "NYCRUNS", photoUrl: "/images/central-park-drive.jpg", photoAlt: "Runners on the Central Park drive",
  raceDate: "2026-12-13T13:00:00.000Z", registrationStatus: "open",
  nextMilestone: { kind: "price_increase", at: "2026-11-10T04:59:00.000Z", timeKnown: false, tentative: false }, weeksToTrain: 6,
};
export const centralParkHalf: RaceListItem = {
  ...base, slug: "nycruns-central-park-half-marathon", name: "Central Park Half Marathon", terrain: "road", distanceMiles: 13.1,
  locationName: "Central Park", organizer: "NYCRUNS", photoUrl: "/images/central-park-drive.jpg", photoAlt: "Runners on the Central Park drive",
  raceDate: "2027-02-28T13:30:00.000Z", registrationStatus: "open",
  nextMilestone: { kind: "price_increase", at: "2026-10-27T03:59:00.000Z", timeKnown: false, tentative: false }, weeksToTrain: 17,
};
export const bigBearHalf: RaceListItem = {
  ...base, slug: "big-bear-squatch-north-half", name: "Big Bear Squatch North Half Marathon", terrain: "trail", distanceMiles: 13.1, elevationGainFt: 2600,
  locationName: "Anthony Wayne Recreation Area, Harriman State Park", organizer: "Sassquad & NY-NJ Trail Conference",
  photoUrl: "/images/harriman-ramapo-dunderberg-trail.jpg", photoAlt: "The Ramapo-Dunderberg Trail through forest in Harriman State Park",
  raceDate: "2027-04-03T13:00:00.000Z", registrationStatus: "open",
  nextMilestone: { kind: "price_increase", at: "2027-01-01T04:59:00.000Z", timeKnown: true, tentative: false }, weeksToTrain: 22,
};
export const brooklynExperienceHalf: RaceListItem = {
  ...base, slug: "nycruns-brooklyn-experience-half-marathon", name: "Brooklyn Experience Half Marathon", terrain: "road", distanceMiles: 13.1,
  locationName: "North Brooklyn to Prospect Park", organizer: "NYCRUNS", photoUrl: "/images/prospect-park-drive.jpg", photoAlt: "Runners on the Prospect Park drive",
  raceDate: "2027-04-25T11:00:00.000Z", registrationStatus: "open",
  nextMilestone: { kind: "price_increase", at: "2026-10-29T03:59:00.000Z", timeKnown: false, tentative: false }, weeksToTrain: 25,
};
export const escarpment: RaceListItem = {
  ...base, slug: "escarpment-trail-run", name: "Escarpment Trail Run", terrain: "trail", distanceMiles: 18.6, elevationGainFt: 4800,
  locationName: "Windham to North/South Lake", organizer: "Escarpment Trail Run", entryMethod: "qualification",
  photoUrl: "/images/catskill-mountain-house-view.jpg", photoAlt: "The view from the Catskill Mountain House site at North-South Lake, near the finish",
  raceDate: "2027-07-25T13:00:00.000Z", registrationStatus: "not_announced",
  nextMilestone: { kind: "registration_closes", at: "2027-07-14T03:59:00.000Z", timeKnown: false, tentative: false }, weeksToTrain: 38,
};
export const donuts10k: RaceListItem = {
  ...base, slug: "nycruns-go-nuts-for-donuts-10k", name: "Go Nuts for Donuts 10K", terrain: "road", distanceMiles: 6.2,
  locationName: "Governors Island", organizer: "NYCRUNS",
  photoUrl: "/images/governors-island-colonels-row.jpg", photoAlt: "Colonels Row on Governors Island, by the start and finish",
  raceDate: "2026-11-14T14:30:00.000Z", registrationStatus: "open",
  nextMilestone: { kind: "price_increase", at: "2026-11-10T04:59:00.000Z", timeKnown: false, tentative: false }, weeksToTrain: 2,
};

export const defaultResults: RaceListItem[] = [centralParkHalf, brooklynExperienceHalf, bigAppleHalf, bigBearHalf];
