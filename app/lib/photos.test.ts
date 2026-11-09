import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HERO_PHOTO_PATH, PHOTOS, photoFor } from '@/app/lib/photos';

const root = process.cwd();
const raceData = JSON.parse(readFileSync(join(root, 'prisma/race-data.json'), 'utf8')) as {
  race: { slug: string; photoUrl: string | null }[];
};
const racePhotoPaths = raceData.race.map((r) => r.photoUrl).filter((p): p is string => !!p);

describe('photoFor', () => {
  // A known image path returns that photo's credit.
  it('returns the credit for a listed photo', () => {
    expect(photoFor('/images/prospect-park-drive.jpg')).toMatchObject({
      author: 'Epicgenius',
      license: 'CC BY-SA 4.0',
    });
  });

  // A race with no photo gets no credit.
  it('returns null for a missing path', () => {
    expect(photoFor(null)).toBeNull();
    expect(photoFor(undefined)).toBeNull();
    expect(photoFor('')).toBeNull();
  });

  // A path that is not in the list is never credited by guesswork.
  it('returns null for an unlisted path', () => {
    expect(photoFor('/images/breakneck-ridge.jpg')).toBeNull();
  });
});

describe('PHOTOS', () => {
  // Every race photo has a credit, so no photo can appear uncredited.
  it('credits every photo a race shows', () => {
    const missing = racePhotoPaths.filter((p) => !photoFor(p));
    expect(missing).toEqual([]);
  });

  // The home page hero photo is credited too.
  it('credits the home hero photo', () => {
    expect(photoFor(HERO_PHOTO_PATH)).not.toBeNull();
  });

  // Every credited photo is actually shown somewhere, so the footer credits nothing extra.
  it('lists only photos that are shown', () => {
    const shown = new Set([HERO_PHOTO_PATH, ...racePhotoPaths]);
    expect(PHOTOS.map((p) => p.path).filter((p) => !shown.has(p))).toEqual([]);
  });

  // Every credited photo exists in public/images.
  it('points at image files that exist', () => {
    const missing = PHOTOS.filter((p) => !existsSync(join(root, 'public', p.path)));
    expect(missing).toEqual([]);
  });

  // Every image file shipped in public/images has a credit.
  it('credits every image file in public/images', () => {
    const files = readdirSync(join(root, 'public/images')).map((f) => `/images/${f}`);
    expect(files.filter((f) => !photoFor(f))).toEqual([]);
  });

  // Each credit names an author, a license and a Wikimedia Commons file page, once per photo.
  it('has a complete Commons credit for each photo', () => {
    for (const p of PHOTOS) {
      expect(p.author.trim()).not.toBe('');
      expect(p.license.trim()).not.toBe('');
      expect(p.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
    expect(new Set(PHOTOS.map((p) => p.path)).size).toBe(PHOTOS.length);
  });

  // The hero background in the stylesheet is the same photo the hero credits.
  it('matches the hero background image in globals.css', () => {
    const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
    expect(css).toContain(`url('${HERO_PHOTO_PATH}')`);
  });
});
