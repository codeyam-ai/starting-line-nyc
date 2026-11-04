// Shared data for the race page's isolated components: real timelines from
// prisma/race-data.json (researched 2026-10-26). Central Park's is shown as
// it will look on Dec 10, 2026, after two of its price tiers have passed.
import { buildTimeline } from "../../app/lib/raceDetail";

const ms = (id: number, kind: string, at: string, timeKnown: boolean, note: string | null) => ({ id, kind, at: new Date(at), timeKnown, tentative: false, note });

export const TODAY = new Date("2026-10-26T20:00:00Z");

export const bigBearTimeline = buildTimeline(
  [
    ms(16, "price_increase", "2027-01-01T04:59:00Z", true, "After this the price goes up; the new price is not listed yet"),
    ms(17, "charity_closes", "2027-03-30T13:00:00Z", true, "For charity bib entries; regular sign-up has no stated close date"),
  ],
  new Date("2027-04-03T13:00:00Z"), false, TODAY,
);

export const centralParkTimelineDec10 = buildTimeline(
  [
    ms(9, "price_increase", "2026-10-26T16:00:00Z", false, "Rises to $100 (non-member)"),
    ms(10, "price_increase", "2026-12-08T17:00:00Z", false, "Rises to $110 (non-member)"),
    ms(11, "price_increase", "2027-01-25T17:00:00Z", false, "Rises to $125 (non-member)"),
    ms(12, "price_increase", "2027-02-22T17:00:00Z", false, "Rises to $135 (non-member)"),
    ms(13, "registration_closes", "2027-02-27T17:00:00Z", false, "Or earlier if it sells out"),
  ],
  new Date("2027-02-28T13:30:00Z"), false, new Date("2026-12-10T15:00:00Z"),
);

// Staten Island Half: a race whose organizer did publish when registration opened.
export const statenIslandTimeline = buildTimeline(
  [
    ms(35, "registration_opens", "2026-08-12T18:11:00Z", true, "Start of the registration period on RunSignup"),
    ms(29, "registration_closes", "2027-03-20T03:00:00Z", true, "Registration ends 11:00pm Mar 19"),
  ],
  new Date("2027-03-20T13:00:00Z"), false, TODAY,
);

export const escarpmentTimeline = buildTimeline(
  [ms(18, "registration_closes", "2027-07-13T16:00:00Z", false, "Or when 275 entries are reached, whichever comes first")],
  new Date("2027-07-25T13:00:00Z"), false, TODAY,
);
