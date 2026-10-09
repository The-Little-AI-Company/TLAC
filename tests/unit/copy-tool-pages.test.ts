/**
 * SPEC section 8, "/callout/" and "/vivary/": the rebuilt tool hero, then the sections that
 * carry over the previous copy.
 */
import { describe, expect, it } from 'vitest';
import { tool } from '../../src/data/tools';
import { all, attr, classesOf, inOrder, one, type El } from '../helpers/dom';
import { page, parsePage } from '../helpers/dist';
import { badges, buttons, headings, lanes, links, paragraph, proseParagraphs, sectionOf } from '../helpers/sections';
import { CALLOUT_PAGE, RELEASED_PATTERN, VIVARY_PAGE, type SectionExpectation } from '../helpers/spec';
import { textOf } from '../helpers/text';

const callout = () => parsePage(page('callout'));
const vivary = () => parsePage(page('vivary'));
const heroOf = (doc: El): El => {
  const section = one(doc, 'main h1').closest('section');
  if (!section) throw new Error('the h1 is not inside a <section>');
  return section;
};

function expectSection(doc: El, expected: SectionExpectation): void {
  const section = sectionOf(one(doc, 'main'), expected.heading);
  expect(one(section, 'h2').rawTagName.toLowerCase()).toBe('h2');
  expect(proseParagraphs(section)).toEqual([...expected.paragraphs]);
  expect(lanes(section).map(({ term, detail }) => ({ term, detail }))).toEqual(expected.lanes.map(({ term, detail }) => ({ term, detail })));
}

describe('callout: hero', () => {
  const hero = () => heroOf(callout());

  it('opens with the shipped badge reading "Released · vX.Y.Z"', () => {
    const found = badges(hero());
    expect(found).toHaveLength(1);
    expect(found[0]?.tone).toBe('shipped');
    expect(found[0]?.label).toMatch(RELEASED_PATTERN);
    expect(attr(one(hero(), '.status i'), 'aria-hidden')).toBe('true');
  });

  it('has the display-l h1 "Callout"', () => {
    const h1 = one(hero(), 'h1');
    expect(classesOf(h1)).toContain('display-l');
    expect(textOf(h1)).toBe(CALLOUT_PAGE.h1);
  });

  it('has the tagline as its lede and the tools.ts summary under it', () => {
    expect(textOf(one(hero(), 'p.lede'))).toBe(CALLOUT_PAGE.lede);
    expect(CALLOUT_PAGE.lede).toBe(tool('callout').tagline);
    expect(textOf(paragraph(hero(), tool('callout').summary))).toBe(tool('callout').summary);
  });

  it('has Download for Windows (primary, the installer) and Source on GitHub (secondary)', () => {
    expect(buttons(hero()).map((b) => ({ label: b.label, href: b.href, variant: b.variant }))).toEqual(
      CALLOUT_PAGE.buttons.map((b) => ({ label: b.label, href: b.href, variant: b.variant })),
    );
    expect(tool('callout').primary.href).toBe(CALLOUT_PAGE.buttons[0].href);
    expect(tool('callout').repo).toBe(CALLOUT_PAGE.buttons[1].href);
  });

  it('has the facts line under the buttons', () => {
    expect(textOf(paragraph(hero(), CALLOUT_PAGE.facts))).toBe(CALLOUT_PAGE.facts);
  });

  it('runs badge, h1, tagline, summary, buttons, facts', () => {
    const els = [
      one(hero(), '.status'),
      one(hero(), 'h1'),
      one(hero(), 'p.lede'),
      paragraph(hero(), tool('callout').summary),
      one(hero(), '.actions'),
      paragraph(hero(), CALLOUT_PAGE.facts),
    ];
    expect(inOrder(callout(), els)).toBe(true);
  });
});

describe('callout: sections', () => {
  it('has the h2s What it does, How it works, What stays on your machine, Get it', () => {
    expect(headings(one(callout(), 'main')).filter(([level]) => level === 2).map(([, text]) => text)).toEqual([
      ...CALLOUT_PAGE.sections.map((s) => s.heading),
      CALLOUT_PAGE.get.heading,
    ]);
  });

  it.each(CALLOUT_PAGE.sections.map((s) => [s.heading, s] as const))('carries over the copy of "%s"', (_heading, expected) => {
    expectSection(callout(), expected);
  });

  describe('Get it', () => {
    const section = () => sectionOf(one(callout(), 'main'), CALLOUT_PAGE.get.heading);

    it('has the lede, the download button, and the SmartScreen note', () => {
      expect(textOf(one(section(), 'p.lede'))).toBe(CALLOUT_PAGE.get.lede);
      expect(buttons(section()).map((b) => [b.label, b.href, b.variant])).toEqual([[CALLOUT_PAGE.get.button.label, CALLOUT_PAGE.get.button.href, 'primary']]);
      expect(textOf(paragraph(section(), CALLOUT_PAGE.get.note))).toBe(CALLOUT_PAGE.get.note);
    });

    it('runs lede, button, note', () => {
      expect(inOrder(callout(), [one(section(), 'p.lede'), one(section(), '.btn'), paragraph(section(), CALLOUT_PAGE.get.note)])).toBe(true);
    });
  });
});

describe('vivary: hero', () => {
  const hero = () => heroOf(vivary());

  it('opens with the wip badge and the unsigned preview date', () => {
    expect(badges(hero()).map((b) => [b.tone, b.label])).toEqual([['wip', VIVARY_PAGE.status]]);
    expect(attr(one(hero(), '.status i'), 'aria-hidden')).toBe('true');
  });

  it('has the display-l h1 "Vivary"', () => {
    const h1 = one(hero(), 'h1');
    expect(classesOf(h1)).toContain('display-l');
    expect(textOf(h1)).toBe(VIVARY_PAGE.h1);
  });

  it('has the tagline as its lede and the tools.ts summary under it', () => {
    expect(textOf(one(hero(), 'p.lede'))).toBe(VIVARY_PAGE.lede);
    expect(VIVARY_PAGE.lede).toBe(tool('vivary').tagline);
    expect(textOf(paragraph(hero(), tool('vivary').summary))).toBe(tool('vivary').summary);
  });

  it('has Visit vivaryagent.xyz (primary) and Release queue on GitHub (secondary)', () => {
    expect(buttons(hero()).map((b) => ({ label: b.label, href: b.href, variant: b.variant }))).toEqual(
      VIVARY_PAGE.buttons.map((b) => ({ label: b.label, href: b.href, variant: b.variant })),
    );
  });

  it('shows the vivaryagent.xyz screenshot in an eager Plate with its caption', () => {
    const plate = one(hero(), 'figure.plate');
    const img = one(plate, 'img');
    const p = VIVARY_PAGE.plate;
    expect(attr(img, 'src')).toBe(p.src);
    expect(attr(img, 'width')).toBe(String(p.width));
    expect(attr(img, 'height')).toBe(String(p.height));
    expect(attr(img, 'alt')).toBe(p.alt);
    expect(attr(img, 'fetchpriority')).toBe('high');
    expect(attr(img, 'loading')).not.toBe('lazy');
    expect(attr(img, 'decoding')).toBe('async');
    expect(textOf(one(plate, 'figcaption'))).toBe(p.caption);
  });

  it('runs badge, h1, tagline, summary, buttons, plate', () => {
    const els = [one(hero(), '.status'), one(hero(), 'h1'), one(hero(), 'p.lede'), paragraph(hero(), tool('vivary').summary), one(hero(), '.actions'), one(hero(), 'figure.plate')];
    expect(inOrder(vivary(), els)).toBe(true);
  });
});

describe('vivary: sections', () => {
  it('has the h2s What it is, What it asks of you, Status', () => {
    expect(headings(one(vivary(), 'main')).filter(([level]) => level === 2).map(([, text]) => text)).toEqual([
      ...VIVARY_PAGE.sections.map((s) => s.heading),
      VIVARY_PAGE.statusSection.heading,
    ]);
  });

  it.each(VIVARY_PAGE.sections.map((s) => [s.heading, s] as const))('carries over the copy of "%s"', (_heading, expected) => {
    expectSection(vivary(), expected);
  });

  describe('Status', () => {
    const section = () => sectionOf(one(vivary(), 'main'), VIVARY_PAGE.statusSection.heading);
    const s = VIVARY_PAGE.statusSection;

    it('says what came out on Sept 22, 2026', () => {
      expect(textOf(paragraph(section(), s.lede))).toBe(s.lede);
    });

    it('links "release queue" to the milestone and "pre-release" to the releases page', () => {
      expect(links(paragraph(section(), s.lede))).toEqual(s.links.map((l) => ({ label: l.label, href: l.href })));
    });

    it('keeps the paragraph about the command-line tools, with its npm and PyPI links', () => {
      const cli = paragraph(section(), s.cli);
      expect(textOf(cli)).toBe(s.cli);
      expect(links(cli)).toEqual(s.cliLinks.map((l) => ({ label: l.label, href: l.href })));
    });

    it('runs the status lede, then the command-line note', () => {
      expect(inOrder(vivary(), [paragraph(section(), s.lede), paragraph(section(), s.cli)])).toBe(true);
    });
  });

  it('no longer says a Windows candidate was tested privately', () => {
    expect(textOf(one(vivary(), 'main'))).not.toMatch(/candidate|tested privately|Watch the release queue/);
  });
});

describe('tool pages agree with each other', () => {
  it('shows the same Callout version on the home page and the Callout page', () => {
    const fromHome = badges(one(parsePage(page('home')), '#work')).find((b) => b.tone === 'shipped')?.label;
    const fromPage = badges(heroOf(callout()))[0]?.label;
    expect(fromPage).toMatch(RELEASED_PATTERN);
    expect(fromPage).toBe(fromHome);
  });

  it('shows the same Vivary status on the home page and the Vivary page', () => {
    const fromHome = badges(one(parsePage(page('home')), '#work')).find((b) => b.tone === 'wip')?.label;
    expect(badges(heroOf(vivary()))[0]?.label).toBe(fromHome);
  });

  it('links both tool pages from the home page buttons', () => {
    const hrefs = all(parsePage(page('home')), 'main a.btn').map((a) => attr(a, 'href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/callout/', '/vivary/']));
  });
});
