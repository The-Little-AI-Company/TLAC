import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projectStatus = z.enum(["planned", "in-progress", "live", "paused"]);
const projectPalette = z.enum(["blue", "amber", "green", "red"]);

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string().min(1),
    year: z.number().int().min(2020),
    status: projectStatus,
    category: z.string().min(1),
    purpose: z.string().min(1),
    links: z
      .array(
        z.object({
          label: z.string().min(1),
          href: z.url(),
        }),
      )
      .default([]),
    image: z.object({
      src: z.string().min(1),
      alt: z.string().min(1),
    }),
    leveledUp: z.string().min(1),
    featured: z.boolean().default(false),
    palette: z.array(projectPalette).min(1),
  }),
});

export const collections = { projects };
