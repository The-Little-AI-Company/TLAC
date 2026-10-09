/**
 * The /about/, /contact/ and 404 pages: headings, copy, lanes, links and buttons.
 */
import { describe, expect, it } from 'vitest';
import { callout, vivary } from '../../src/data/tools';
import { all, attr, classesOf, inOrder, one } from '../helpers/dom';
import { page, parsePage } from '../helpers/dist';
import { buttons, headings, lanes, links, proseParagraphs, sectionOf } from '../helpers/sections';
import { ABOUT_PAGE, CONTACT_PAGE, NOT_FOUND_PAGE } from '../helpers/spec';
import { textOf } from '../helpers/text';

describe('about', () => {
  const doc = () => parsePage(page('about'));
  const main = () => one(doc(), 'main');

  it('has the display-l h1 "About" and the lede in my voice', () => {
    const h1 = one(main(), 'h1');
    expect(classesOf(h1)).toContain('display-l');
    expect(textOf(h1)).toBe(ABOUT_PAGE.h1);
    expect(textOf(one(main(), 'p.lede'))).toBe(ABOUT_PAGE.lede);
    expect(inOrder(doc(), [h1, one(main(), 'p.lede')])).toBe(true);
  });

  it('has the h2s The position and What I don\'t do, in that order', () => {
    expect(headings(main())).toEqual([[1, ABOUT_PAGE.h1], [2, ABOUT_PAGE.position.heading], [2, ABOUT_PAGE.dont.heading]]);
  });

  describe('The position', () => {
    const paragraphs = () => proseParagraphs(sectionOf(main(), ABOUT_PAGE.position.heading));

    it('has the three paragraphs, in first person singular, one idea to a sentence', () => {
      expect(paragraphs()).toEqual([...ABOUT_PAGE.position.paragraphs]);
    });

    it('sets them as an article, with the larger, looser text of the design system', () => {
      const article = one(sectionOf(main(), ABOUT_PAGE.position.heading), '.article');
      expect(all(article, 'p.text')).toHaveLength(ABOUT_PAGE.position.paragraphs.length);
    });
  });

  describe("What I don't do", () => {
    const section = () => sectionOf(main(), ABOUT_PAGE.dont.heading);

    it('has the four lanes', () => {
      expect(lanes(section()).map(({ term, detail }) => ({ term, detail }))).toEqual(ABOUT_PAGE.dont.lanes.map(({ term, detail }) => ({ term, detail })));
    });

    it('links github.com/Jeff-Kazzee from the lane about courses', () => {
      const courses = lanes(section()).find((l) => l.term === 'No courses');
      expect(courses).toBeDefined();
      expect(links(courses!.dd)).toEqual([ABOUT_PAGE.dont.link]);
    });
  });
});

describe('contact', () => {
  const doc = () => parsePage(page('contact'));
  const main = () => one(doc(), 'main');

  it('has the display-l h1 "Contact" and the lede', () => {
    const h1 = one(main(), 'h1');
    expect(classesOf(h1)).toContain('display-l');
    expect(textOf(h1)).toBe(CONTACT_PAGE.h1);
    expect(textOf(one(main(), 'p.lede'))).toBe(CONTACT_PAGE.lede);
  });

  it('has the h2 How to reach me over the lanes', () => {
    expect(headings(main())).toEqual([[1, CONTACT_PAGE.h1], [2, CONTACT_PAGE.heading]]);
    expect(one(sectionOf(main(), CONTACT_PAGE.heading), 'dl.lanes')).toBeDefined();
  });

  it('has four lanes in order: Email, Bugs, Security, Elsewhere', () => {
    expect(lanes(main()).map(({ term, detail }) => ({ term, detail }))).toEqual(CONTACT_PAGE.lanes.map(({ term, detail }) => ({ term, detail })));
  });

  it.each(CONTACT_PAGE.lanes.map((l) => [l.term, l] as const))('links the right places from the %s lane', (_term, expected) => {
    const lane = lanes(main()).find((l) => l.term === expected.term);
    expect(lane, `no ${expected.term} lane`).toBeDefined();
    expect(links(lane!.dd)).toEqual(expected.links.map((l) => ({ label: l.label, href: l.href })));
  });

  it('points the bug links at each tool repository issues page from tools.ts', () => {
    const bugs = lanes(main()).find((l) => l.term === 'Bugs');
    expect(links(bugs!.dd).map((l) => l.href)).toEqual([`${callout.repo}/issues`, `${vivary.repo}/issues`]);
  });
});

describe('404', () => {
  const doc = () => parsePage(page('not-found'));
  const main = () => one(doc(), 'main');

  it('has the display-l h1 "Page not found" and the lede', () => {
    const h1 = one(main(), 'h1');
    expect(classesOf(h1)).toContain('display-l');
    expect(textOf(h1)).toBe(NOT_FOUND_PAGE.h1);
    expect(textOf(one(main(), 'p.lede'))).toBe(NOT_FOUND_PAGE.lede);
  });

  it('offers the home page (primary) and Contact (secondary)', () => {
    expect(buttons(main()).map((b) => ({ label: b.label, href: b.href, variant: b.variant }))).toEqual(
      NOT_FOUND_PAGE.buttons.map((b) => ({ label: b.label, href: b.href, variant: b.variant })),
    );
  });

  it('runs h1, lede, buttons', () => {
    expect(inOrder(doc(), [one(main(), 'h1'), one(main(), 'p.lede'), one(main(), '.actions')])).toBe(true);
  });

  it('tells search engines not to index it', () => {
    const robots = all(doc(), 'meta[name="robots"]');
    expect(robots.map((m) => attr(m, 'content'))).toEqual(['noindex']);
  });

  it('has the same header and footer as every other page', () => {
    expect(all(doc(), 'nav[aria-label="Main"] a')).toHaveLength(5);
    expect(all(doc(), 'footer a')).toHaveLength(3);
  });
});
