/**
 * HTML validity: html-validate with its recommended preset over every built page. No rule is
 * disabled. If one ever has to be, add it to `DISABLED` with the reason next to it, and say so in
 * the pull request.
 */
import { describe, expect, it } from 'vitest';
import { HtmlValidate, type ConfigData } from 'html-validate/node';
import { PAGE_CASES, readDist } from '../helpers/dist';

/** Rule id -> why it is off. Empty on purpose. */
const DISABLED: Record<string, string> = {};

const config: ConfigData = {
  extends: ['html-validate:recommended'],
  rules: Object.fromEntries(Object.keys(DISABLED).map((rule) => [rule, 'off'])),
};
const validator = new HtmlValidate(config);

describe.each(PAGE_CASES)('html-validate on %s', (_label, info) => {
  it('finds nothing to report', async () => {
    const html = readDist(info.file);
    const report = await validator.validateString(html, info.file);
    const lines = html.split('\n');
    const problems = report.results.flatMap((result) =>
      result.messages.map((m) => {
        const excerpt = (lines[m.line - 1] ?? '').slice(Math.max(0, m.column - 20), m.column + 60).trim();
        return `${m.ruleId ?? 'parse'}: ${m.message} (line ${m.line}, col ${m.column}) near: ${excerpt}`;
      }),
    );
    expect(problems).toEqual([]);
  });
});

describe('html-validate itself', () => {
  it('is wired up: it does report a broken document', async () => {
    const report = await validator.validateString('<!doctype html><html><head><title>t</title></head><body><img src="a.png"><p><div>x</div></p></body></html>', 'broken.html');
    expect(report.valid).toBe(false);
  });
});
