import MyRacesSection from '@/app/components/MyRacesSection';
import PageShell from '@/app/components/PageShell';
import SiteFooter from '@/app/components/SiteFooter';
import SiteHeader from '@/app/components/SiteHeader';

export const metadata = { title: 'My Races · Starting Line' };

export default function MyRacesPage() {
  return (
    <PageShell>
      <SiteHeader deadlinesHref="/?distance=any&when=any&sort=deadline" active="my-races" />
      <MyRacesSection />
      <SiteFooter />
    </PageShell>
  );
}
