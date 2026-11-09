import PhotoCredit from '@/app/components/PhotoCredit';
import { HERO_PHOTO_PATH } from '@/app/lib/photos';

// Photo hero: one headline and the one race search.
export default function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="hero" aria-labelledby="h">
      <PhotoCredit path={HERO_PHOTO_PATH} />
      <div className="hero-in">
        <h1 id="h">Races around New York, and when to enter.</h1>
        <p className="lede">
          Road and trail races, registration dates in Eastern Time, and how many weeks you have to train.
        </p>
        {children}
      </div>
    </section>
  );
}
