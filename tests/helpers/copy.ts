/**
 * The copy rules of SPEC section 7 as functions over a piece of text. Each returns what
 * it found, so a failing test can show the offending words.
 */
import { BANNED_WORDS, CAPS_ALLOWLIST, RETIRED_NAMES } from './spec';

/** we, our, ours, us, plus the forms that carry the same voice (ourselves, let's, we're). */
export function firstPersonPlural(text: string): string[] {
  return [...text.matchAll(/\b(?:we|our|ours|ourselves|us)\b|\blet['’]s\b/gi)].map((m) => m[0]);
}

/** Roman numerals up to ten. The spec's own numerals ("II. Released") need them. */
const ROMAN = /^(?:I{1,3}|IV|VI{0,3}|IX|X)$/;

/** Extra all-caps words the spec's own copy needs, on top of the allowlist in SPEC section 7. */
export const CAPS_EXTRA: ReadonlySet<string> = new Set(['ZIP']);

/**
 * Words written in capitals: two or more characters, at least one capital letter, no
 * lowercase letters ("AI", "V1", "ZIP"). Words in the allowlist and Roman numerals pass.
 */
export function allCapsWords(text: string, allowed: ReadonlySet<string> = new Set([...CAPS_ALLOWLIST, ...CAPS_EXTRA])): string[] {
  const found: string[] = [];
  for (const m of text.matchAll(/[A-Za-z0-9]+/g)) {
    const word = m[0];
    if (word.length < 2 || !/[A-Z]/.test(word) || /[a-z]/.test(word)) continue;
    if (allowed.has(word) || ROMAN.test(word)) continue;
    found.push(word);
  }
  return found;
}

/** The banned words with the endings that carry the same meaning. Still whole words: "elevator" is fine. */
const BANNED_FORMS: Record<(typeof BANNED_WORDS)[number], string> = {
  unlock: 'unlock(?:s|ed|ing)?',
  empower: 'empower(?:s|ed|ing|ment)?',
  seamless: 'seamless(?:ly)?',
  robust: 'robust(?:ly|ness)?',
  revolutionary: 'revolutionary',
  'game-changing': 'game-changing',
  elevate: 'elevat(?:e|es|ed|ing)',
};

/** Banned words, whole words, any case, with their verb and adverb forms (unlocks, empowered, elevating, seamlessly). */
export function bannedWords(text: string): string[] {
  const pattern = new RegExp(`\\b(?:${BANNED_WORDS.map((w) => BANNED_FORMS[w]).join('|')})\\b`, 'gi');
  return [...text.matchAll(pattern)].map((m) => m[0]);
}

/** Retired names, case-sensitive and anywhere in the string, as the original test did. */
export function retiredNames(text: string): string[] {
  return RETIRED_NAMES.filter((name) => text.includes(name));
}

export const emDashes = (text: string): number => (text.match(/—/g) ?? []).length;
export const semicolons = (text: string): number => (text.match(/;/g) ?? []).length;
export const exclamations = (text: string): number => (text.match(/!/g) ?? []).length;
export const emoji = (text: string): string[] => text.match(/\p{Extended_Pictographic}/gu) ?? [];

/** Dollar amounts. The spec says no invented prices. */
export const currency = (text: string): string[] => text.match(/[$€£]\s?\d(?:[\d,]*\d)?(?:\.\d+)?/g) ?? [];

/** Dates written as `Sept 22, 2026` or `October 8, 2026`. */
export function dates(text: string): string[] {
  return text.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{1,2}, \d{4}\b/g) ?? [];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Sept', 'Oct', 'Nov', 'Dec'];

/** Words that may start with a capital inside a sentence-case heading, button or label. */
export const PROPER_NOUNS: ReadonlySet<string> = new Set([
  'I', 'AI', 'MIT', 'API', 'APIs', 'LLM', 'HTML', 'CSS', 'CLI', 'OS', 'V1', 'ZIP', 'Callout', 'Vivary', 'Windows', 'GitHub', 'Jeff', 'Kazzee',
  'Claude', 'Code', 'Codex', 'Idaho', 'Zo', 'Computer', 'Mac', 'X', 'Bluesky', 'JeffKazzee', ...MONTHS,
]);

/**
 * Capitalised words in the middle of a sentence-cased phrase that are not proper nouns.
 * A phrase restarts after a full stop, a colon or a middle dot, so "Released · v0.2.0"
 * and "I. The main project" are fine, and "Download For Windows" is not.
 */
export function titleCaseWords(text: string, properNouns: ReadonlySet<string> = PROPER_NOUNS): string[] {
  const found: string[] = [];
  for (const segment of text.split(/(?:[.:!?]\s+|\s*·\s*)/)) {
    const words = segment.trim().split(/\s+/);
    words.slice(1).forEach((raw) => {
      const word = raw.replace(/^[("'‘“]+|[)"',.;:!?’”]+$/g, '').replace(/['’]s$/, '');
      if (!/^[A-Z]/.test(word)) return;
      if (properNouns.has(word) || /^I['’]/.test(word)) return;
      found.push(word);
    });
  }
  return found;
}
