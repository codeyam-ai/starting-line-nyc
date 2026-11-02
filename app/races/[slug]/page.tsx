import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AtAGlance from '@/app/components/AtAGlance';
import BackLink from '@/app/components/BackLink';
import CourseNote from '@/app/components/CourseNote';
import HowToEnter from '@/app/components/HowToEnter';
import KeyDates from '@/app/components/KeyDates';
import NoUpcomingEdition from '@/app/components/NoUpcomingEdition';
import PageShell from '@/app/components/PageShell';
import RaceDetailBody from '@/app/components/RaceDetailBody';
import RaceHero from '@/app/components/RaceHero';
import RaceTitle from '@/app/components/RaceTitle';
import SiteFooter from '@/app/components/SiteFooter';
import SiteHeader from '@/app/components/SiteHeader';
import SourcesPanel from '@/app/components/SourcesPanel';
import { entryMethod, nextDeadline, officialLink, pageUrlFrom, reportIssueUrl } from '@/app/lib/raceDetail';
import { findRaceDetail } from '@/app/lib/races';

export const dynamic = 'force-dynamic';

export default async function RacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await findRaceDetail(slug);
  if (!detail) notFound();
  const { race, edition, timeline, weeksToTrain } = detail;
  const entry = edition ? entryMethod(edition.entryMethod) : null;
  const calendarBase = `/api/races/${race.slug}/calendar`;
  const reportHref = reportIssueUrl(race, edition?.year ?? null, pageUrlFrom(await headers(), race.slug));

  return (
    <PageShell>
      <SiteHeader deadlinesHref="/?distance=any&when=any" />
      <BackLink href="/" label="All races" />
      <RaceHero photoUrl={race.photoUrl} photoAlt={race.photoAlt} photoCredit={race.photoCredit}>
        <RaceTitle
          name={race.name}
          terrain={race.terrain}
          organizer={race.organizer.name}
          place={`${race.locationName}, ${race.area}`}
        />
      </RaceHero>
      {edition && entry ? (
        <>
          <AtAGlance
            raceDate={edition.raceDate?.toISOString() ?? null}
            raceTimeKnown={edition.raceTimeKnown}
            distanceMiles={race.distanceMiles}
            elevationGainFt={race.elevationGainFt}
            entryTitle={entry.title}
            status={edition.registrationStatus}
            priceCents={edition.priceCents}
            nextDeadline={nextDeadline(timeline)}
            weeksToTrain={weeksToTrain}
            official={officialLink(edition, race.organizer.websiteUrl)}
            save={{ slug: race.slug, raceName: race.name }}
          />
          <RaceDetailBody
            main={<KeyDates year={edition.year} timeline={timeline} calendarBase={calendarBase} />}
            aside={
              <>
                <HowToEnter
                  title={entry.title}
                  explain={entry.explain}
                  entryNote={edition.entryNote}
                  priceCents={edition.priceCents}
                  priceNote={edition.priceNote}
                  raceDayCalendarHref={edition.raceDate ? `${calendarBase}?event=raceday` : null}
                />
                {race.courseNote && <CourseNote text={race.courseNote} />}
                <SourcesPanel
                  sourceUrl={edition.sourceUrl}
                  lastVerifiedAt={edition.lastVerifiedAt?.toISOString() ?? null}
                  reportHref={reportHref}
                />
              </>
            }
          />
        </>
      ) : (
        <NoUpcomingEdition organizerUrl={race.organizer.websiteUrl} />
      )}
      <SiteFooter />
    </PageShell>
  );
}
