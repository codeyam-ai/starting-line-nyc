import FooterPhotoCredits from '@/app/components/FooterPhotoCredits';

// Where race details come from, and credits for exactly the photos the site shows.
export default function SiteFooter() {
  return (
    <footer className="site-footer" id="how-entry-works">
      <span>
        Race details come from organizers’ official pages, with the date we last checked on each race page. Details
        change, so confirm on the official site before you register.
      </span>
      <FooterPhotoCredits />
    </footer>
  );
}
