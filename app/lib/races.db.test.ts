// Runs findRaceSummaries against a real SQLite database, so the query itself
// (which rows it selects and which relations it loads) is exercised — the
// pure shaping in summarizeSavedRaces is covered separately in raceList.test.ts.
//
// Each run builds a throwaway database in a temp directory: the schema is
// pushed with the Prisma CLI, then the Prisma client is imported only after
// DATABASE_URL points at that file (app/lib/prisma.ts reads it at import time).
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

const NOW = new Date('2026-06-01T12:00:00Z');

let dir: string;
let prisma: PrismaClient;
let findRaceSummaries: typeof import('@/app/lib/races').findRaceSummaries;
const savedUrl = process.env.DATABASE_URL;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), 'races-db-test-'));
  const url = `file:${path.join(dir, 'test.db')}`;
  execSync(`npx prisma db push --url "${url}"`, { cwd: process.cwd(), stdio: 'pipe' });

  process.env.DATABASE_URL = url;
  delete (globalThis as { prisma?: unknown }).prisma;
  vi.resetModules();
  ({ prisma } = await import('@/app/lib/prisma'));
  ({ findRaceSummaries } = await import('@/app/lib/races'));

  const organizer = await prisma.organizer.create({ data: { slug: 'nyrr', name: 'New York Road Runners' } });
  const race = (slug: string, name: string) => ({
    slug,
    name,
    terrain: 'road',
    distanceMiles: 13.1,
    locationName: 'Central Park',
    area: 'Manhattan',
    organizerId: organizer.id,
  });

  await prisma.race.create({
    data: {
      ...race('park-half', 'Park Half'),
      editions: {
        create: {
          year: 2026,
          raceDate: new Date('2026-09-20T11:00:00Z'),
          registrationStatus: 'opening_soon',
          entryMethod: 'open',
          milestones: {
            create: [
              { kind: 'registration_opens', at: new Date('2026-07-01T14:00:00Z') },
              { kind: 'registration_closes', at: new Date('2026-09-01T03:59:00Z') },
            ],
          },
        },
      },
    },
  });
  await prisma.race.create({
    data: {
      ...race('winter-10k', 'Winter 10K'),
      editions: {
        create: {
          year: 2026,
          raceDate: new Date('2026-01-15T14:00:00Z'),
          registrationStatus: 'closed',
          entryMethod: 'open',
        },
      },
    },
  });
  // In the database but never asked for: must not appear in the result.
  await prisma.race.create({ data: race('unrequested-mile', 'Unrequested Mile') });
}, 60_000);

afterAll(async () => {
  await prisma?.$disconnect();
  delete (globalThis as { prisma?: unknown }).prisma;
  if (savedUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = savedUrl;
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe('findRaceSummaries against a real database', () => {
  // Pins the query's include: the organizer name and the milestone-derived fields
  // only exist if those relations are loaded, and each state needs real rows behind it.
  it('returns one summary per requested slug, in request order, with relations loaded', async () => {
    const result = await findRaceSummaries(['winter-10k', 'gone-race', 'park-half'], NOW);

    expect(result.map((r) => [r.slug, r.state])).toEqual([
      ['winter-10k', 'no-upcoming'],
      ['gone-race', 'not-listed'],
      ['park-half', 'listed'],
    ]);
    expect(result[0]).toEqual({ slug: 'winter-10k', state: 'no-upcoming', name: 'Winter 10K' });

    const listed = result[2];
    if (listed.state !== 'listed') throw new Error('expected park-half to be listed');
    // organizer comes from the organizer relation; the milestone fields from editions.milestones.
    expect(listed.race.organizer).toBe('New York Road Runners');
    expect(listed.race.raceDate).toBe('2026-09-20T11:00:00.000Z');
    expect(listed.race.registrationOpens).toBe('2026-07-01T14:00:00.000Z');
    expect(listed.race.nextMilestone).toMatchObject({ kind: 'registration_opens', at: '2026-07-01T14:00:00.000Z' });
  });

  // A stored race nobody asked for must not leak into a browser's saved list.
  it('returns only the requested races, not everything stored', async () => {
    const result = await findRaceSummaries(['park-half'], NOW);
    expect(result.map((r) => r.slug)).toEqual(['park-half']);
  });

  // A browser with no saved races asks with an empty list; the query must not fail on `in: []`.
  it('returns an empty list when nothing is requested', async () => {
    expect(await findRaceSummaries([], NOW)).toEqual([]);
  });
});
