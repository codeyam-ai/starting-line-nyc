import { NextResponse, type NextRequest } from 'next/server';
import { parseSummarySlugs } from '@/app/lib/myRaces';
import { findRaceSummaries } from '@/app/lib/races';

export const dynamic = 'force-dynamic';

// GET /api/races/summaries?slugs=a,b,c — list summaries for the races saved
// in a browser. Unknown slugs come back as "not-listed", never dropped.
export async function GET(request: NextRequest) {
  const slugs = parseSummarySlugs(request.nextUrl.searchParams.get('slugs'));
  const summaries = slugs.length ? await findRaceSummaries(slugs) : [];
  return NextResponse.json({ summaries });
}
