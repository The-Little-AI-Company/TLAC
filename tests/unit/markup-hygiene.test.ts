/**
 * The built markup has no script, no inline style, no emphasis elements, and the shared components
 * (status badge, button, now line, plates, lanes) keep their markup contracts.
 */
import { describe, expect, it } from 'vitest';
import { all, classesOf, show, type El } from '../helpers/dom';
import { PAGE_CASES, parsePage } from '../helpers/dist';
import { visibleText } from '../helpers/text';

const TONES = ['shipped', 'live', 'alpha', 'demo', 'wip', 'retired'];

describe.each(PAGE_CASES)('markup of %s', (_label, info) => {
  const doc = () => parsePage(info);

  it('ships no <script> and no <noscript> (zero client JavaScript)', () => {
    expect(all(doc(), 'script, noscript').map(show)).toEqual([]);
  });

  it('has no javascript: URLs and no inline event handlers', () => {
    const bad: string[] = [];
    for (const el of all(doc(), '*')) {
      for (const [name, value] of Object.entries(el.attributes)) {
        if (/^on[a-z]+$/i.test(name)) bad.push(`${show(el)} has ${name}`);
        if (/^\s*javascript:/i.test(value)) bad.push(`${show(el)} has a javascript: URL`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('has no inline style="" attributes', () => {
    expect(all(doc(), '[style]').map(show)).toEqual([]);
  });

  it('has no <em>, <strong> or <b>', () => {
    expect(all(doc(), 'em, strong, b').map(show)).toEqual([]);
  });

  it('uses <i> only as an empty, aria-hidden decoration', () => {
    const bad = all(doc(), 'i').filter((i) => i.childNodes.some((n) => n.text.trim() !== '') || i.getAttribute('aria-hidden') !== 'true');
    expect(bad.map((i) => i.outerHTML)).toEqual([]);
  });

  it('has nothing that needs script: no buttons, forms, inputs, dialogs, embeds or toggles', () => {
    expect(all(doc(), 'button, form, input, select, textarea, dialog, iframe, object, embed, video, audio, [aria-expanded], [aria-haspopup], [role="switch"], [role="button"]').map(show)).toEqual([]);
  });

  it('has no duplicate ids', () => {
    const ids = all(doc(), '[id]').map((el) => el.getAttribute('id') ?? '');
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('has no empty links and no empty paragraphs', () => {
    expect(all(doc(), 'a').filter((a) => visibleText(a) === '' && !a.querySelector('img')).map(show)).toEqual([]);
    expect(all(doc(), 'main p').filter((p) => visibleText(p) === '' && !p.querySelector('img, picture')).map(show)).toEqual([]);
  });
});

describe.each(PAGE_CASES)('components on %s', (_label, info) => {
  const doc = () => parsePage(info);

  it('renders every StatusBadge as <span class="status status--TONE"><i aria-hidden="true"></i>label</span>', () => {
    const bad: string[] = [];
    for (const badge of all(doc(), '.status')) {
      const classes = classesOf(badge);
      const tone = classes.find((c) => c.startsWith('status--'))?.slice('status--'.length);
      if (badge.rawTagName.toLowerCase() !== 'span') bad.push(`${show(badge)} is not a span`);
      if (!tone || !TONES.includes(tone)) bad.push(`${show(badge)} has no known tone class`);
      const dot = badge.childNodes.find((n): n is El => n.nodeType === 1);
      if (!dot || dot.rawTagName.toLowerCase() !== 'i') bad.push(`${show(badge)} does not start with <i>`);
      else if (dot.getAttribute('aria-hidden') !== 'true') bad.push(`${show(badge)} dot is not aria-hidden`);
      if (visibleText(badge) === '') bad.push(`${show(badge)} has no label word`);
    }
    expect(bad).toEqual([]);
  });

  it('renders every Button as an <a class="btn btn--VARIANT"> with a label and a target', () => {
    const bad: string[] = [];
    for (const btn of all(doc(), '.btn')) {
      const variant = classesOf(btn).find((c) => c.startsWith('btn--'));
      if (btn.rawTagName.toLowerCase() !== 'a') bad.push(`${show(btn)} is not an <a>`);
      if (!variant || !['btn--primary', 'btn--secondary', 'btn--text'].includes(variant)) bad.push(`${show(btn)} has no btn--primary/secondary/text class`);
      if (!btn.getAttribute('href')) bad.push(`${show(btn)} has no href`);
      if (visibleText(btn) === '') bad.push(`${show(btn)} has no label`);
    }
    expect(bad).toEqual([]);
  });

  it('renders every NowLine as <p class="now now--TONE"> with text', () => {
    for (const now of all(doc(), '.now')) {
      expect(now.rawTagName.toLowerCase()).toBe('p');
      expect(classesOf(now).some((c) => c === 'now--live' || c === 'now--wip'), show(now)).toBe(true);
      expect(visibleText(now)).not.toBe('');
    }
  });

  it('renders every Plate as <figure class="plate"> holding an <img>', () => {
    for (const plate of all(doc(), 'figure.plate')) expect(plate.querySelectorAll('img'), show(plate)).toHaveLength(1);
  });

  it('renders every SpecPlate as a <div class="plate"> of facts, with the quote in a figure of its own', () => {
    for (const dl of all(doc(), '.plate dl')) {
      const plate = dl.closest('.plate')!;
      expect(plate.rawTagName.toLowerCase(), 'a figure would be named by the quote caption alone').toBe('div');
      expect(dl.closest('figure'), show(dl)).toBeNull();
      const quotes = all(plate, 'figure.quote');
      expect(quotes.length, 'at most one quote').toBeLessThanOrEqual(1);
      for (const quote of quotes) {
        expect(quote.querySelectorAll('blockquote p'), show(quote)).toHaveLength(1);
        expect(quote.querySelectorAll('figcaption').length, show(quote)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('sets every middle dot in a status badge or the footer as a .sep, which keeps the dot in the text', () => {
    for (const sep of all(doc(), '.sep')) {
      expect(visibleText(sep), show(sep)).toBe('·');
      expect(sep.getAttribute('aria-hidden'), 'the dot is not hidden from assistive technology').toBeUndefined();
    }
    for (const el of all(doc(), '.status, footer p')) {
      expect(el.textContent, `${show(el)} has a spaced middle dot that is not a .sep`).not.toMatch(/ · /);
    }
  });

  it('renders every Lanes list as a <dl class="lanes"> of dt and dd pairs', () => {
    for (const lanes of all(doc(), 'dl.lanes')) {
      const terms = all(lanes, 'dt');
      const details = all(lanes, 'dd');
      expect(terms.length, show(lanes)).toBeGreaterThan(0);
      expect(details.length, show(lanes)).toBe(terms.length);
    }
  });
});
