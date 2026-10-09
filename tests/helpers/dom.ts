import type { HTMLElement } from 'node-html-parser';
import { textOf } from './text';

export type El = HTMLElement;

/** Short description of an element for failure messages: `<a href="/x" class="btn">Go</a>`. */
export function describe(el: El): string {
  const tag = el.rawTagName.toLowerCase();
  const attrs = Object.entries(el.attributes)
    .filter(([name]) => !name.startsWith('data-astro'))
    .map(([name, value]) => (value === '' ? name : `${name}="${value}"`))
    .join(' ');
  const text = textOf(el);
  return `<${tag}${attrs ? ` ${attrs}` : ''}>${text.length > 40 ? `${text.slice(0, 40)}...` : text}`;
}

/** All elements matching `selector`, in document order. */
export function all(root: El, selector: string): El[] {
  return root.querySelectorAll(selector);
}

/** The single element matching `selector`. Throws a readable error for zero or several. */
export function one(root: El, selector: string, where = 'the page'): El {
  const found = root.querySelectorAll(selector);
  if (found.length !== 1) {
    throw new Error(`Expected exactly one element matching \`${selector}\` in ${where}, found ${found.length}.`);
  }
  return found[0]!;
}

/** The first element matching `selector`. Throws when there is none. */
export function first(root: El, selector: string, where = 'the page'): El {
  const found = root.querySelector(selector);
  if (!found) throw new Error(`Expected an element matching \`${selector}\` in ${where}, found none.`);
  return found;
}

export const attr = (el: El, name: string): string | undefined => el.getAttribute(name) ?? undefined;

/** Position of each element in document order. */
export function documentOrder(root: El): Map<El, number> {
  const order = new Map<El, number>();
  root.querySelectorAll('*').forEach((el, index) => order.set(el, index));
  return order;
}

/** True when the elements appear in the given order in the document. */
export function inOrder(root: El, elements: El[]): boolean {
  const order = documentOrder(root);
  const positions = elements.map((el) => order.get(el));
  if (positions.some((p) => p === undefined)) return false;
  return positions.every((p, i) => i === 0 || (p as number) > (positions[i - 1] as number));
}

/** Elements a keyboard can reach by Tab, in DOM order. Ignores CSS, so `display: none` is not detected. */
export function focusables(root: El): El[] {
  return root
    .querySelectorAll('a[href], button, input, select, textarea, summary, area[href], [tabindex], [contenteditable=""], [contenteditable="true"]')
    .filter((el) => {
      if (el.hasAttribute('disabled') || el.hasAttribute('hidden') || el.closest('[hidden]') || el.closest('[inert]')) return false;
      const tabindex = el.getAttribute('tabindex');
      if (tabindex !== undefined && tabindex !== null && Number(tabindex) < 0) return false;
      return true;
    });
}

/** The heading level of an h1 to h6 element. */
export const headingLevel = (el: El): number => Number(el.rawTagName.slice(1));

/** The classes on an element. */
export const classesOf = (el: El): string[] => (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);

/** Compares text the way copy contracts do: straight quotes, collapsed whitespace. */
export const same = (el: El, expected: string): boolean => textOf(el) === expected;
