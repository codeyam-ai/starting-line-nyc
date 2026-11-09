// Every photo the site shows, with who took it, its license and the
// Wikimedia Commons page it came from. Races point at a photo by its path;
// the credit always comes from here, so a photo can't appear uncredited.

export type Photo = {
  path: string;
  author: string;
  license: string;
  sourceUrl: string;
};

export const PHOTOS: Photo[] = [
  {
    path: '/images/central-park-drive.jpg',
    author: 'Mike Peel',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:At_New_York,_USA_2017_397.jpg',
  },
  {
    path: '/images/prospect-park-drive.jpg',
    author: 'Epicgenius',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Prospect_Park_Brooklyn_Mar_2019_105.jpg',
  },
  {
    path: '/images/governors-island-colonels-row.jpg',
    author: 'Brian W. Schaller',
    license: 'Free Art License',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:A630,_Colonels_Row,_Governors_Island,_New_York_City,_July_2019.jpg',
  },
  {
    path: '/images/harriman-ramapo-dunderberg-trail.jpg',
    author: 'Daniel Case',
    license: 'CC BY-SA 4.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Ramapo-Dunderberg_Trail_on_slopes_of_Black_Rock,_Harriman_State_Park,_Southfields,_NY.jpg',
  },
  {
    path: '/images/catskill-mountain-house-view.jpg',
    author: 'Mwanner',
    license: 'CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Catskill_Mountain_House_View2.jpg',
  },
];

// The home page hero photo (also set as the hero background in globals.css).
export const HERO_PHOTO_PATH = '/images/central-park-drive.jpg';

export function photoFor(path: string | null | undefined): Photo | null {
  if (!path) return null;
  return PHOTOS.find((p) => p.path === path) ?? null;
}
