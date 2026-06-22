import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projectStatus = z.enum(["planned", "in-progress", "live", "paused"]);
const updateStatus = z.enum(["draft", "published"]);
const projectPalette = z.enum(["blue", "amber", "green", "red"]);
const linkHref = z.string().min(1).refine(
  (href) => {
    if (href.startsWith("/") && !href.startsWith("//")) {
      return true;
    }

    try {
      new URL(href);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Link href must be an absolute URL or root-relative path." },
);

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string().min(1),
    year: z.number().int().min(2020),
    status: projectStatus,
    category: z.string().min(1),
    purpose: z.string().min(1),
    why: z.string().min(1),
    links: z
      .array(
        z.object({
          label: z.string().min(1),
          href: linkHref,
        }),
      )
      .default([]),
    image: z.object({
      src: z.string().min(1),
      alt: z.string().min(1),
    }),
    leveledUp: z.string().min(1),
    caveats: z.array(z.string().min(1)).default([]),
    featured: z.boolean().default(false),
    palette: z.array(projectPalette).min(1),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/updates" }),
  schema: z.object({
    title: z.string().min(1),
    status: updateStatus,
    date: z.coerce.date(),
    summary: z.string().min(1),
    links: z
      .array(
        z.object({
          label: z.string().min(1),
          href: linkHref,
        }),
      )
      .default([]),
  }),
});

export const collections = { projects, updates };
