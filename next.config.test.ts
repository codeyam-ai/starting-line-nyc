import { describe, expect, it } from 'vitest';
import nextConfig from './next.config';

describe('next.config', () => {
  // Every scenario screenshot is captured from the dev server, so the Next.js
  // dev badge (the "N" in the bottom-left corner) shows up in each new capture
  // unless `devIndicators` is switched off. This fails if that line is deleted
  // or changed, before any screenshot is retaken with the badge in it.
  it('hides the Next.js dev badge so scenario captures stay clean', () => {
    expect(nextConfig.devIndicators).toBe(false);
  });
});
