import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The free Starter Kit: short, practical, beginner-first guides.
// Source of truth for the prose lives in the private brain; the rendered .md
// files are ported into src/content/guides/ (see brain scripts/port-guides-to-tlac.py).
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pillar: z.string(),
    order: z.number(),
  }),
});

export const collections = { guides };
