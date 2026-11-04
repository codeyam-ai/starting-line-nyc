import { describe, expect, it } from 'vitest';
import {
  etDate,
  formatDay,
  formatDistance,
  formatEt,
  formatLongDay,
  formatPrice,
  formatTime,
  formatWhen,
  milestoneLabel,
  milestoneVerb,
} from '@/app/lib/format';

describe('etDate', () => {
  // The calendar date is taken in Eastern Time, not UTC.
  it('gives the ET calendar date', () => {
    expect(etDate('2027-01-01T04:59:00Z')).toBe('2026-12-31');
    expect(etDate('2026-11-09T17:00:00Z')).toBe('2026-11-09');
  });
});

describe('formatLongDay', () => {
  // The race page spells the day out in full with the year.
  it('spells out weekday, month and year', () => {
    expect(formatLongDay('2027-04-03T13:00:00Z')).toBe('Saturday, April 3, 2027');
  });
});

describe('formatWhen', () => {
  // A stated time is shown; an unstated one says so instead of inventing one.
  it('shows the time only when it is known', () => {
    expect(formatWhen('2027-01-01T04:59:00Z', true)).toBe('Thu, Dec 31, 11:59 pm ET');
    expect(formatWhen('2026-11-09T17:00:00Z', false)).toBe('Mon, Nov 9 (time not stated)');
  });
});

describe('formatPrice', () => {
  // Whole dollars drop the cents; other prices keep two decimals.
  it('formats cents as dollars', () => {
    expect(formatPrice(6000)).toBe('$60');
    expect(formatPrice(7520)).toBe('$75.20');
    expect(formatPrice(13950)).toBe('$139.50');
  });
});

describe('formatDay', () => {
  // Days are shown in New York time, which can differ from the UTC date.
  it('formats in Eastern Time even across a UTC date boundary', () => {
    expect(formatDay('2027-02-01T04:59:00Z')).toBe('Sun, Jan 31');
    expect(formatDay(new Date('2027-01-24T12:00:00Z'))).toBe('Sun, Jan 24');
  });
});

describe('formatTime', () => {
  // Standard time in November: 17:00 UTC is noon ET.
  it('formats standard time with a lowercase meridiem and ET', () => {
    expect(formatTime('2026-11-10T17:00:00Z')).toBe('12:00 pm ET');
  });

  // Daylight time in April: 03:59 UTC is 11:59 pm the previous evening.
  it('handles daylight saving time', () => {
    expect(formatTime('2027-04-03T03:59:00Z')).toBe('11:59 pm ET');
  });
});

describe('formatEt', () => {
  // Day and time combine into one line.
  it('joins day and time', () => {
    expect(formatEt('2026-11-18T04:59:00Z')).toBe('Tue, Nov 17, 11:59 pm ET');
  });
});

describe('milestoneVerb', () => {
  // Each milestone kind reads as a short verb in the deadline column.
  it('maps known kinds to verbs', () => {
    expect(milestoneVerb('registration_opens')).toBe('Opens');
    expect(milestoneVerb('lottery_closes')).toBe('Closes');
    expect(milestoneVerb('qualification_deadline')).toBe('Qualify by');
  });

  // An unknown kind is shown as-is rather than hidden.
  it('falls back to the raw kind', () => {
    expect(milestoneVerb('something_new')).toBe('something_new');
  });
});

describe('formatDistance', () => {
  // Distances keep one decimal, whole numbers stay whole.
  it('formats miles', () => {
    expect(formatDistance(13.1, null)).toBe('13.1 mi');
    expect(formatDistance(5, null)).toBe('5 mi');
  });

  // Elevation gain is appended with a thousands separator.
  it('appends elevation gain', () => {
    expect(formatDistance(13.1, 3100)).toBe('13.1 mi, 3,100 ft climb');
  });
});

describe('milestoneLabel', () => {
  // Upcoming milestones use the present-tense timeline label.
  it('uses the present-tense label by default', () => {
    expect(milestoneLabel('registration_opens')).toBe('Registration opens');
    expect(milestoneLabel('lottery_closes', false)).toBe('Lottery closes');
  });

  // A milestone that already happened reads in the past tense.
  it('uses the past-tense label for passed milestones', () => {
    expect(milestoneLabel('registration_opens', true)).toBe('Registration opened');
    expect(milestoneLabel('registration_closes', true)).toBe('Registration closed');
    expect(milestoneLabel('charity_closes', true)).toBe('Charity sign-up closed');
  });

  // Race day keeps the same wording whether or not it has passed.
  it('always calls race day Race day', () => {
    expect(milestoneLabel('race_day')).toBe('Race day');
    expect(milestoneLabel('race_day', true)).toBe('Race day');
  });

  // A kind with no past-tense wording falls back to its normal label.
  it('falls back to the present label when no past wording exists', () => {
    expect(milestoneLabel('price_increase', true)).toBe(milestoneLabel('price_increase'));
  });

  // An unknown kind is shown as-is rather than hidden.
  it('falls back to the raw kind', () => {
    expect(milestoneLabel('something_new')).toBe('something_new');
    expect(milestoneLabel('something_new', true)).toBe('something_new');
  });
});
