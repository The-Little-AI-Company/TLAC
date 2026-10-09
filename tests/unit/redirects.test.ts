/**
 * The redirects in astro.config.mjs keep every address the site has ever published working: the
 * guides go to Jeff's account on GitHub and the retired pages go home.
 */
import { describe, expect, it } from 'vitest';
import { GUIDE_PAGES, GUIDE_REDIRECT_TARGET, RETIRED_PAGES } from '../helpers/spec';
import { readDist } from '../helpers/dist';

const target = (path: string): string | undefined => readDist(`${path}/index.html`).match(/url=([^"]+)"/)?.[1];

describe('redirects', () => {
  it.each(GUIDE_PAGES)("send %s to Jeff's account", (path) => {
    expect(target(path)).toBe(GUIDE_REDIRECT_TARGET);
  });

  it.each(RETIRED_PAGES)('send the retired page /%s home', (path) => {
    expect(target(path)).toBe('/');
  });

  it('are plain meta refreshes, with no script', () => {
    for (const path of [...GUIDE_PAGES, ...RETIRED_PAGES]) {
      const html = readDist(`${path}/index.html`);
      expect(html, path).toMatch(/<meta http-equiv="refresh" content="0;url=/);
      expect(html, path).not.toMatch(/<script/i);
    }
  });
});
