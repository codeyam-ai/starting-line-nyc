import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { fetchRaceSummaries, useRaceSummaries } from '@/app/lib/useRaceSummaries';

function reply(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

describe('fetchRaceSummaries', () => {
  // Summaries come back keyed by slug, from the encoded summaries URL.
  it('keys the response by slug', async () => {
    const fetchImpl = reply(200, {
      summaries: [
        { slug: 'a', state: 'not-listed' },
        { slug: 'b', state: 'no-upcoming', name: 'B' },
      ],
    });
    await expect(fetchRaceSummaries('a,b', fetchImpl)).resolves.toEqual({
      a: { slug: 'a', state: 'not-listed' },
      b: { slug: 'b', state: 'no-upcoming', name: 'B' },
    });
    expect(fetchImpl).toHaveBeenCalledWith('/api/races/summaries?slugs=a%2Cb');
  });

  // A server error rejects so the page can show the failure message.
  it('rejects on a failed response', async () => {
    await expect(fetchRaceSummaries('a', reply(500, {}))).rejects.toThrow('500');
  });

  // A body without summaries reads as none rather than crashing.
  it('treats a missing summaries list as empty', async () => {
    await expect(fetchRaceSummaries('a', reply(200, {}))).resolves.toEqual({});
  });
});

function Probe({ k }: { k: string | null }) {
  const { summaries, failed } = useRaceSummaries(k);
  return createElement('span', null, `${summaries === null ? 'none' : 'some'}/${failed}`);
}

describe('useRaceSummaries', () => {
  // Before any request lands there are no summaries and no failure.
  it('starts with nothing loaded and no failure', () => {
    expect(renderToString(createElement(Probe, { k: 'a,b' }))).toBe('<span>none/false</span>');
  });
});
