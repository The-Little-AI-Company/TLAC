import type { Tone } from './status';

export interface Project {
  title: string;
  line: string;
  tone: Tone;
  status: string;
  href: string;
  linkLabel: string;
  image: string;
  // The same picture at 320px wide, for the thumbnail that is drawn 150px wide (88px on a phone).
  thumb: string;
  width: number;
  height: number;
  imageAlt: string;
}

// The other things Jeff has made, as the design system recorded them on Oct 8, 2026.
// Nothing here has been re-checked against the live sites since.
export const projects: Project[] = [
  {
    title: 'Open World Factbook',
    line: 'An open-source database of 262 countries and territories.',
    tone: 'shipped',
    status: 'Shipped',
    href: 'https://worldfactbook.xyz',
    linkLabel: 'worldfactbook.xyz',
    image: '/images/open-world-factbook-2026-10-08.webp',
    thumb: '/images/open-world-factbook-2026-10-08-320.webp',
    width: 960,
    height: 600,
    imageAlt: 'Open World Factbook home page',
  },
  {
    title: 'LLM Arcade',
    line: 'A social arcade with 11 games. AI agents wrote every line.',
    tone: 'alpha',
    status: 'Alpha',
    href: 'https://llmarcade.fun',
    linkLabel: 'llmarcade.fun',
    image: '/images/llm-arcade-jeffkazzee-dev.webp',
    thumb: '/images/llm-arcade-jeffkazzee-dev-320.webp',
    width: 960,
    height: 600,
    imageAlt: 'LLM Arcade home page',
  },
  {
    title: 'Puckwork',
    line: 'Air hockey with a simulated air cushion, in one canvas file.',
    tone: 'demo',
    status: 'Demo',
    href: 'https://puckwork.vercel.app',
    linkLabel: 'puckwork.vercel.app',
    image: '/images/puckwork-jeffkazzee-dev.webp',
    thumb: '/images/puckwork-jeffkazzee-dev-320.webp',
    width: 960,
    height: 548,
    imageAlt: 'Puckwork home page',
  },
  {
    title: 'Neon Noir Detective Agency',
    line: 'A fictional agency site in pure HTML and CSS.',
    tone: 'demo',
    status: 'Demo',
    href: 'https://neon-noir-detective-agency.vercel.app',
    linkLabel: 'neon-noir-detective-agency.vercel.app',
    image: '/images/neon-noir-2026-10-08.webp',
    thumb: '/images/neon-noir-2026-10-08-320.webp',
    width: 960,
    height: 600,
    imageAlt: 'Neon Noir Detective Agency home page',
  },
];
