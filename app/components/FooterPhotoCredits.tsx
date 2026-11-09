import { PHOTOS } from '@/app/lib/photos';

// "Photos via Wikimedia Commons: <author> (<license>), …" — one Commons link
// for every photo the site shows, taken from the single photo list.
export default function FooterPhotoCredits() {
  return (
    <span className="credit">
      Not affiliated with any race organizer. Photos via Wikimedia Commons:{' '}
      {PHOTOS.map((photo, i) => (
        <span key={photo.path}>
          <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
            {photo.author}
          </a>{' '}
          ({photo.license}){i < PHOTOS.length - 1 ? ', ' : '.'}
        </span>
      ))}
    </span>
  );
}
