import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useSavedRaces } from '@/app/lib/useSavedRaces';

function Probe() {
  const saved = useSavedRaces();
  return createElement('span', null, saved === null ? 'not hydrated' : Object.keys(saved).join(','));
}

describe('useSavedRaces', () => {
  // The server can't see this browser's saves, so it renders the not-yet-hydrated state.
  it('reports null during server rendering', () => {
    expect(renderToString(createElement(Probe))).toBe('<span>not hydrated</span>');
  });
});
