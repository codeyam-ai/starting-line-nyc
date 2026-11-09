import { photoFor } from '@/app/lib/photos';

// "Photo: <author>, <license>" over a hero, linked to the photo's Commons page.
export default function PhotoCredit({ path }: { path: string | null }) {
  const photo = photoFor(path);
  if (!photo) return null;
  return (
    <p className="credit">
      Photo:{' '}
      <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
        {photo.author}, {photo.license}
      </a>
    </p>
  );
}
