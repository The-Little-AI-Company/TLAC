/**
 * SPEC section 8, "/ home": every exact string, link, image and attribute of the home page.
 */
import { describe, expect, it } from 'vitest';
import { tool } from '../../src/data/tools';
import { all, attr, classesOf, inOrder, one } from '../helpers/dom';
import { page, parsePage } from '../helpers/dist';
import { badges, buttons, headings, lanes, links, paragraph, sectionOf } from '../helpers/sections';
import { HOME, PROJECTS, RELEASED_PATTERN, VERSION_PATTERN } from '../helpers/spec';
import { textOf } from '../helpers/text';

const home = () => parsePage(page('home'));
const main = () => one(home(), 'main');
const hero = () => one(main(), 'section.hero', 'main');

describe('home: outline', () => {
  it('lists the sections in order: hero, #work, #other, #how', () => {
    const sections = all(main(), 'section.hero, section#work, section#other, section#how');
    expect(sections.map((s) => attr(s, 'id') ?? 'hero')).toEqual(['hero', 'work', 'other', 'how']);
  });

  it('has exactly this heading outline', () => {
    expect(headings(main())).toEqual([
      [1, HOME.h1],
      [2, HOME.vivary.title],
      [2, HOME.callout.title],
      [2, HOME.other.heading],
      ...PROJECTS.map((p) => [3, p.title] as [number, string]),
      [2, HOME.how.heading],
    ]);
  });
});

describe('home: hero', () => {
  it('opens with the now line, tone wip', () => {
    const now = one(hero(), 'p.now');
    expect(classesOf(now)).toContain('now--wip');
    expect(textOf(now)).toBe(HOME.now);
  });

  it('has the display-xl h1', () => {
    const h1 = one(hero(), 'h1');
    expect(classesOf(h1)).toContain('display-xl');
    expect(textOf(h1)).toBe(HOME.h1);
  });

  it('has the lede under it', () => {
    const lede = all(hero(), 'p.lede');
    expect(lede).toHaveLength(1);
    expect(textOf(lede[0]!)).toBe(HOME.lede);
  });

  it('has the two buttons, primary then secondary, in an .actions row', () => {
    const row = all(hero(), '.actions');
    expect(row).toHaveLength(1);
    expect(buttons(row[0]!).map((b) => ({ label: b.label, href: b.href, variant: b.variant }))).toEqual(
      HOME.buttons.map((b) => ({ label: b.label, href: b.href, variant: b.variant })),
    );
    expect(all(hero(), '.btn')).toHaveLength(2);
  });

  describe('mascot', () => {
    const picture = () => one(hero(), 'picture', 'the hero');

    it('is a <picture> with a phone <source> and a desktop <img>', () => {
      const sources = all(picture(), 'source');
      expect(sources).toHaveLength(1);
      const source = sources[0]!;
      expect(attr(source, 'media')).toBe(HOME.mascot.phoneMedia);
      expect(attr(source, 'srcset')?.trim()).toBe(HOME.mascot.phone.src);
      expect(attr(source, 'width')).toBe(String(HOME.mascot.phone.width));
      expect(attr(source, 'height')).toBe(String(HOME.mascot.phone.height));
    });

    it('has the 760px image, with its size, alt text and loading hints', () => {
      const imgs = all(picture(), 'img');
      expect(imgs).toHaveLength(1);
      const img = imgs[0]!;
      expect(attr(img, 'src')).toBe(HOME.mascot.desktop.src);
      expect(attr(img, 'width')).toBe(String(HOME.mascot.desktop.width));
      expect(attr(img, 'height')).toBe(String(HOME.mascot.desktop.height));
      expect(attr(img, 'alt')).toBe(HOME.mascot.alt);
      expect(attr(img, 'fetchpriority')).toBe('high');
      expect(attr(img, 'decoding')).toBe('async');
      expect(attr(img, 'loading')).not.toBe('lazy');
    });

    it('puts the source before the img', () => {
      expect(inOrder(home(), [one(picture(), 'source'), one(picture(), 'img')])).toBe(true);
    });

    it('is the only image in the hero and has no box around it', () => {
      expect(all(hero(), 'img')).toHaveLength(1);
      expect(picture().closest('figure, .plate'), 'no frame around the mascot').toBeNull();
    });
  });

  it('runs now line, h1, lede, buttons, mascot', () => {
    const els = [one(hero(), 'p.now'), one(hero(), 'h1'), one(hero(), 'p.lede'), one(hero(), '.actions'), one(hero(), 'picture')];
    expect(inOrder(home(), els)).toBe(true);
  });
});

describe('home: #work', () => {
  const work = () => one(main(), 'section#work', 'main');
  const features = () => all(work(), 'article.feature');

  it('has two features, Vivary then Callout', () => {
    expect(features()).toHaveLength(2);
    expect(features().map((f) => textOf(one(f, 'h2')))).toEqual(['Vivary', 'Callout']);
  });

  describe('Vivary', () => {
    const feature = () => features()[0]!;
    const v = HOME.vivary;

    it('has the numeral and the display-l title', () => {
      expect(textOf(one(feature(), 'p.numeral'))).toBe(v.numeral);
      const h2 = one(feature(), 'h2');
      expect(classesOf(h2)).toContain('display-l');
      expect(textOf(h2)).toBe(v.title);
    });

    it('shows the workspace screenshot in a Plate with its caption', () => {
      const plate = one(feature(), 'figure.plate');
      const img = one(plate, 'img');
      expect(attr(img, 'src')).toBe(v.plate.src);
      expect(attr(img, 'width')).toBe(String(v.plate.width));
      expect(attr(img, 'height')).toBe(String(v.plate.height));
      expect(attr(img, 'alt')).toBe(v.plate.alt);
      expect(attr(img, 'loading')).toBe('lazy');
      expect(attr(img, 'decoding')).toBe('async');
      expect(textOf(one(plate, 'figcaption'))).toBe(v.plate.caption);
    });

    it('has the body paragraph', () => {
      expect(textOf(paragraph(feature(), v.body))).toBe(v.body);
    });

    it('has the wip badge with its date', () => {
      expect(badges(feature()).map((b) => [b.tone, b.label])).toEqual([[v.tone, v.status]]);
      expect(attr(one(feature(), '.status i'), 'aria-hidden')).toBe('true');
    });

    it('has one secondary button to /vivary/', () => {
      expect(buttons(feature()).map((b) => [b.label, b.href, b.variant])).toEqual([[v.button.label, v.button.href, 'secondary']]);
    });

    it('runs numeral, title, body, badge, button', () => {
      const els = [one(feature(), 'p.numeral'), one(feature(), 'h2'), paragraph(feature(), v.body), one(feature(), '.status'), one(feature(), '.btn')];
      expect(inOrder(home(), els)).toBe(true);
    });
  });

  describe('Callout', () => {
    const feature = () => features()[1]!;
    const c = HOME.callout;

    it('has the numeral and the display-l title', () => {
      expect(textOf(one(feature(), 'p.numeral'))).toBe(c.numeral);
      const h2 = one(feature(), 'h2');
      expect(classesOf(h2)).toContain('display-l');
      expect(textOf(h2)).toBe(c.title);
    });

    it('has a spec plate with Runs on, Version, License and Price, in that order', () => {
      const rows = lanes(feature(), 'dl');
      expect(rows.map((r) => r.term)).toEqual(c.rows.map((r) => r.term));
      expect(rows[0]?.detail).toBe('Windows 10 and 11');
      expect(rows[1]?.detail).toMatch(VERSION_PATTERN);
      expect(rows[2]?.detail).toBe('MIT');
      expect(rows[3]?.detail).toBe('Free. Bring your own API keys.');
    });

    it('sits the spec plate in a raised plate frame beside the text', () => {
      const dl = one(feature(), 'dl');
      expect(dl.closest('.plate, figure'), 'the facts list should sit in a plate').not.toBeNull();
      expect(dl.closest('.plate, figure')?.querySelector('h2')).toBeNull();
    });

    it('quotes the result header, with its caption', () => {
      const plate = one(feature(), 'dl').closest('.plate, figure')!;
      const quote = all(plate, 'p').find((p) => textOf(p) === c.quote);
      expect(quote, `no <p> reads "${c.quote}"`).toBeDefined();
      expect(textOf(plate)).toContain(c.quoteCaption);
      expect(all(plate, '*').some((el) => textOf(el) === c.quoteCaption), `nothing in the plate reads exactly "${c.quoteCaption}"`).toBe(true);
    });

    it('has the Callout summary from tools.ts as its body', () => {
      expect(textOf(paragraph(feature(), tool('callout').summary))).toBe(tool('callout').summary);
    });

    it('has the shipped badge reading "Released · vX.Y.Z", with the version the spec plate shows', () => {
      const [badge] = badges(feature());
      expect(badges(feature())).toHaveLength(1);
      expect(badge?.tone).toBe(c.tone);
      expect(badge?.label).toMatch(RELEASED_PATTERN);
      const version = lanes(feature(), 'dl').find((r) => r.term === 'Version')?.detail;
      expect(badge?.label).toBe(`Released · ${version}`);
    });

    it('has one secondary button to /callout/', () => {
      expect(buttons(feature()).map((b) => [b.label, b.href, b.variant])).toEqual([[c.button.label, c.button.href, 'secondary']]);
    });

    it('runs numeral, title, body, badge, button', () => {
      const els = [one(feature(), 'p.numeral'), one(feature(), 'h2'), paragraph(feature(), tool('callout').summary), one(feature(), '.status'), one(feature(), '.btn')];
      expect(inOrder(home(), els)).toBe(true);
    });
  });
});

describe('home: #other', () => {
  const other = () => one(main(), 'section#other', 'main');
  const entries = () => all(other(), 'ol.contents > li.entry');

  it('has the h2 and one ordered list of four entries', () => {
    expect(textOf(one(other(), 'h2'))).toBe(HOME.other.heading);
    expect(all(other(), 'ol.contents')).toHaveLength(1);
    expect(entries()).toHaveLength(4);
    expect(all(other(), 'li')).toHaveLength(4);
  });

  it.each(PROJECTS.map((p, i) => [p.title, i] as const))('lists %s in position %s', (_title, i) => {
    const p = PROJECTS[i]!;
    const entry = entries()[i]!;

    const title = one(entry, 'h3');
    expect(classesOf(title), 'h3 class').toContain('title');
    expect(textOf(title)).toBe(p.title);

    expect(textOf(paragraph(entry, p.line))).toBe(p.line);

    expect(badges(entry).map((b) => [b.tone, b.label])).toEqual([[p.tone, p.status]]);
    expect(attr(one(entry, '.status i'), 'aria-hidden')).toBe('true');

    expect(links(entry)).toEqual([{ label: p.linkLabel, href: p.href }]);

    const img = one(entry, 'img');
    expect(attr(img, 'src')).toBe(p.image.src);
    expect(attr(img, 'width')).toBe(String(p.image.width));
    expect(attr(img, 'height')).toBe(String(p.image.height));
    expect(attr(img, 'alt')).toBe(`${p.title} home page`);
    expect(attr(img, 'loading')).toBe('lazy');
    expect(attr(img, 'decoding')).toBe('async');
  });

  it('runs thumb, title, line, status, address in each entry', () => {
    for (const [i, p] of PROJECTS.entries()) {
      const entry = entries()[i]!;
      const els = [one(entry, 'img'), one(entry, 'h3'), paragraph(entry, p.line), one(entry, '.status'), one(entry, 'a')];
      expect(inOrder(home(), els), p.title).toBe(true);
    }
  });
});

describe('home: #how', () => {
  const how = () => one(main(), 'section#how', 'main');

  it('has the h2 and the text on the left, then the four lanes', () => {
    expect(textOf(one(how(), 'h2'))).toBe(HOME.how.heading);
    expect(textOf(paragraph(how(), HOME.how.text))).toBe(HOME.how.text);
    expect(inOrder(home(), [one(how(), 'h2'), paragraph(how(), HOME.how.text), one(how(), 'dl.lanes')])).toBe(true);
  });

  it('has the four tenets in order', () => {
    expect(lanes(how()).map(({ term, detail }) => ({ term, detail }))).toEqual(HOME.how.lanes.map(({ term, detail }) => ({ term, detail })));
  });

  it('sets the lane names as titles, not headings', () => {
    expect(all(how(), 'dl.lanes dt')).toHaveLength(4);
    expect(all(how(), 'dl.lanes h2, dl.lanes h3')).toHaveLength(0);
    expect(sectionOf(main(), HOME.how.heading)).toBe(how());
  });
});
