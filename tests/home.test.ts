import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Smoke + content + basic SEO/a11y checks against the built Home page.
// Run after `astro build` (the `verify`/`test` scripts handle ordering).
const html = readFileSync(resolve('dist/index.html'), 'utf-8');

describe('Home page (built output)', () => {
  it('renders the brand promise', () => {
    expect(html).toContain('Learn AI by making useful things');
  });

  it('has a prominent Start Here CTA', () => {
    expect(html).toMatch(/Start Here/i);
  });

  it('shows the four "what you can make" cards', () => {
    expect(html).toContain('Your first useful thing');
    expect(html).toContain('Know when AI is wrong');
    expect(html).toContain('Prompts that actually work');
    expect(html).toContain('An AI second brain');
  });

  it('uses the robot mascot as the hero image', () => {
    expect(html).toMatch(/\/mascot\/pose-01\.png/);
  });

  it('uses the owl logo', () => {
    expect(html).toMatch(/\/owl-logo\.png/);
  });

  it('routes to the free Starter Kit from the hero', () => {
    expect(html).toContain('Get the free Starter Kit');
    expect(html).toMatch(/href=["']\/guides["']/);
  });

  it('is accessible/SEO-sound: lang, title, meta description', () => {
    expect(html).toMatch(/<html[^>]*lang=["']en["']/);
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/<meta[^>]*name=["']description["'][^>]*content=/);
  });

  it('exposes Open Graph tags', () => {
    expect(html).toMatch(/property=["']og:title["']/);
  });
});
