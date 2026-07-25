import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Smoke + content + basic SEO/a11y checks against the built Home page.
// Run after `astro build` (the `verify`/`test` scripts handle ordering).
const html = readFileSync(resolve('dist/index.html'), 'utf-8');

describe('Home page (built output)', () => {
  it('renders the practical AI education promise', () => {
    expect(html).toContain('Learn to use AI and AI agents with more skill');
    expect(html).toContain('non-technical people');
  });

  it('has a prominent learning CTA', () => {
    expect(html).toContain('Start learning');
    expect(html).toMatch(/href=["']\/start-here["']/);
  });

  it('presents software as tools supporting the mission', () => {
    expect(html).toContain('Vivary');
    expect(html).toContain('Bellamente');
    expect(html).toContain('Agent Relay');
    expect(html).toContain('Tools from the workshop');
  });

  it('uses the teaching owl mascot as the hero image', () => {
    expect(html).toMatch(/\/brand\/mascot\/tlac-owl-teaching\.webp/);
    expect(html).not.toMatch(/\/mascot\/pose-\d+\.png/);
  });

  it('uses product-specific owl artwork instead of legacy robot-era assets', () => {
    expect(html).toContain('/brand/mascot/tlac-owl-memory.webp');
    expect(html).toContain('/brand/mascot/tlac-owl-filing.webp');
    expect(html).toContain('/brand/mascot/tlac-owl-relay.webp');
    expect(html).not.toContain('/owl-logo.png');
  });

  it('uses the canonical owl mark', () => {
    expect(html).toMatch(/\/brand\/mark\/tlac-owl-mark-128\.png/);
    expect(html).toMatch(/aria-label=["']The Little AI Company — home["']/);
    expect(html).not.toMatch(/\/owl-logo\.png/);
  });

  it('makes the free Starter Kit a primary way to begin', () => {
    expect(html).toContain('Build practical AI fluency');
    expect(html).toContain('Use the free AI Starter Kit');
    expect(html).toMatch(/href=["']\/guides["']/);
  });

  it('is accessible/SEO-sound: lang, title, meta description', () => {
    expect(html).toMatch(/<html[^>]*lang=["']en["']/);
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta[^>]*name=["']description["'][^>]*content=/);
  });

  it('exposes Open Graph tags', () => {
    expect(html).toMatch(/property=["']og:title["']/);
    expect(html).toMatch(/\/brand\/social\/tlac-social-card\.png/);
  });
});
