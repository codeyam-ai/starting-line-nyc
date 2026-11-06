// Data-consistency checks for the race prices re-checked against the
// organizers' pages on 2026-11-06 (Brooklyn Experience Half, Jersey City
// Marathon and Jersey City Half). The seed file is the source of truth the
// app shows, so a drifted price or deadline is a user-visible bug.
import { describe, expect, it } from 'vitest';
import data from './race-data.json';
import { etDate, formatPrice } from '@/app/lib/format';

type Edition = (typeof data.raceEdition)[number];
type Milestone = (typeof data.registrationMilestone)[number];

const BROOKLYN = 5;
const JC_MARATHON = 20;
const JC_HALF = 21;

function edition(id: number): Edition {
  const found = data.raceEdition.find((e) => e.id === id);
  if (!found) throw new Error(`edition ${id} missing`);
  return found;
}

function priceIncreases(editionId: number): Milestone[] {
  return data.registrationMilestone
    .filter((m) => m.editionId === editionId && m.kind === 'price_increase')
    .sort((a, b) => a.at.localeCompare(b.at));
}

describe('re-checked race prices', () => {
  // Each edition stores the price its organizer page lists today.
  it('stores the current organizer price', () => {
    expect(edition(BROOKLYN).priceCents).toBe(16000);
    expect(edition(JC_MARATHON).priceCents).toBe(22000);
    expect(edition(JC_HALF).priceCents).toBe(17500);
  });

  // The Jersey City price notes quote the same amount the edition stores.
  it('quotes the stored price in the Jersey City notes', () => {
    for (const id of [JC_MARATHON, JC_HALF]) {
      const e = edition(id);
      expect(e.priceCents).not.toBeNull();
      expect(e.priceNote).toContain(formatPrice(e.priceCents as number));
    }
  });

  // The Brooklyn note names the member price and the next price step.
  it('describes the Brooklyn price steps', () => {
    const note = edition(BROOKLYN).priceNote;
    expect(note).toContain('through Dec 17');
    expect(note).toContain('$144');
    expect(note).toContain('$170 through Jan 27');
  });

  // Every re-checked edition carries the re-check date.
  it('marks the editions as verified on the re-check date', () => {
    for (const id of [BROOKLYN, JC_MARATHON, JC_HALF]) {
      expect(etDate(edition(id).lastVerifiedAt)).toBe('2026-11-06');
    }
  });

  // None of the replaced prices or deadlines survive in the notes.
  it('drops the old prices and deadlines', () => {
    const notes = [BROOKLYN, JC_MARATHON, JC_HALF]
      .flatMap((id) => [edition(id).priceNote, ...priceIncreases(id).map((m) => m.note)])
      .join(' ');
    for (const stale of ['$155', '$165', '$139.50', '$200', '$150', '$180', 'Oct 28', 'Dec 31']) {
      expect(notes).not.toContain(stale);
    }
  });
});

describe('re-checked price-increase milestones', () => {
  // Brooklyn rises after Dec 17 and again after Jan 27, both date-only.
  it('dates the Brooklyn increases to the days in the note', () => {
    const rises = priceIncreases(BROOKLYN);
    expect(rises.map((m) => etDate(m.at))).toEqual(['2026-12-17', '2027-01-27']);
    expect(rises.every((m) => m.timeKnown === false)).toBe(true);
    expect(rises[0].note).toContain('$170');
  });

  // The Jersey City increases land at Nov 30, 11:59 PM Eastern.
  it('dates the Jersey City increases to the Nov 30 deadline', () => {
    for (const id of [JC_MARATHON, JC_HALF]) {
      const rises = priceIncreases(id);
      expect(rises).toHaveLength(1);
      expect(rises[0].at).toBe('2026-12-01T04:59:00.000Z');
      expect(etDate(rises[0].at)).toBe('2026-11-30');
      expect(rises[0].timeKnown).toBe(true);
      expect(edition(id).priceNote).toContain('Nov 30, 2026 11:59 PM EST');
    }
  });

  // The marathon names its later price; the half does not state one.
  it('names a later price only where the organizer publishes it', () => {
    expect(priceIncreases(JC_MARATHON)[0].note).toContain('$225');
    expect(priceIncreases(JC_HALF)[0].note).toContain('not published');
    expect(edition(JC_HALF).priceNote).toContain("isn't published");
  });
});
