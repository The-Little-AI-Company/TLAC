/**
 * Finders for the pieces of a built page that the copy tests talk about: sections by
 * heading, lanes, buttons, status badges, headings. They read the structure the components
 * promise (`section`, `dl.lanes`, `.btn`, `.status`) and nothing else, so a page is free to
 * choose its wrappers.
 */
import { all, attr, classesOf, headingLevel, type El } from './dom';
import { textOf } from './text';

export interface Lane {
  term: string;
  detail: string;
  dt: El;
  dd: El;
}

export interface Button {
  label: string;
  href: string | undefined;
  variant: string | undefined;
  el: El;
}

export interface Badge {
  tone: string | undefined;
  label: string;
  el: El;
}

/** Headings under `root` as `[level, text]`, in document order. */
export function headings(root: El): [number, string][] {
  return all(root, 'h1, h2, h3, h4, h5, h6').map((h) => [headingLevel(h), textOf(h)]);
}

/** The `<section>` (or nearest container) of the heading with this exact text. */
export function sectionOf(root: El, headingText: string): El {
  const heading = all(root, 'h1, h2, h3').find((h) => textOf(h) === headingText);
  if (!heading) throw new Error(`No heading "${headingText}". Headings found: ${headings(root).map(([l, t]) => `h${l} "${t}"`).join(', ')}`);
  const container = heading.closest('section') ?? heading.parentNode;
  if (!container) throw new Error(`Heading "${headingText}" has no section`);
  return container;
}

/** The dt/dd pairs of every `dl` under `root`, in order. A wrapper div around each pair is fine. */
export function lanes(root: El, selector = 'dl.lanes'): Lane[] {
  const found: Lane[] = [];
  for (const dl of all(root, selector)) {
    for (const dt of all(dl, 'dt')) {
      let next = dt.nextElementSibling as El | null;
      while (next && next.rawTagName.toLowerCase() !== 'dd') next = next.nextElementSibling as El | null;
      if (!next) throw new Error(`dt "${textOf(dt)}" has no dd`);
      found.push({ term: textOf(dt), detail: textOf(next), dt, dd: next });
    }
  }
  return found;
}

/**
 * What differs between facts plate rows and what they should say, one message per difference.
 * A string detail must match exactly. A RegExp detail (a version) must match the pattern.
 */
export function rowMismatches(rows: Lane[], expected: readonly { term: string; detail: string | RegExp }[]): string[] {
  const problems: string[] = [];
  if (rows.length !== expected.length) problems.push(`expected ${expected.length} rows, found ${rows.length}`);
  expected.forEach(({ term, detail }, i) => {
    const row = rows[i];
    if (!row) return;
    if (row.term !== term) problems.push(`row ${i + 1} is "${row.term}", expected "${term}"`);
    const ok = typeof detail === 'string' ? row.detail === detail : detail.test(row.detail);
    if (!ok) problems.push(`row "${term}" says "${row.detail}", expected ${String(detail)}`);
  });
  return problems;
}

/** Buttons (`a.btn`) under `root`, in order. */
export function buttons(root: El): Button[] {
  return all(root, 'a.btn').map((el) => ({
    label: textOf(el),
    href: attr(el, 'href'),
    variant: classesOf(el).find((c) => c.startsWith('btn--'))?.slice('btn--'.length),
    el,
  }));
}

/** Status badges (`.status`) under `root`, in order. */
export function badges(root: El): Badge[] {
  return all(root, '.status').map((el) => ({
    tone: classesOf(el).find((c) => c.startsWith('status--'))?.slice('status--'.length),
    label: textOf(el),
    el,
  }));
}

/** Text of paragraphs under `root` that are not inside a `dl`, a button row or a figure. */
export function proseParagraphs(root: El): string[] {
  return all(root, 'p')
    .filter((p) => !p.closest('dl') && !p.closest('figure') && !p.querySelector('.btn') && !p.closest('.actions') && !p.matches('.status, .now, .numeral'))
    .map(textOf);
}

/** Links (`a[href]`) under `root` as label and href. */
export function links(root: El): { label: string; href: string | undefined }[] {
  return all(root, 'a[href]').map((a) => ({ label: textOf(a), href: attr(a, 'href') }));
}

/** The paragraph under `root` whose text is exactly `text`, or an error that lists the paragraphs found. */
export function paragraph(root: El, text: string): El {
  const found = all(root, 'p').find((p) => textOf(p) === text);
  if (!found) throw new Error(`No paragraph reads exactly:\n  ${text}\nParagraphs found:\n${all(root, 'p').map((p) => `  - ${textOf(p)}`).join('\n')}`);
  return found;
}
