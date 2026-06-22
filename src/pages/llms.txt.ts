import { getCollection } from "astro:content";
import { canonicalUrl, siteDescription, siteName } from "../site/metadata";

export async function GET() {
  const projects = await getCollection("projects");
  const projectLines = projects
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((project) => {
      return `- ${project.data.title}: ${canonicalUrl(`/projects/${project.id}/`)} - ${
        project.data.purpose
      }`;
    });
  const body = [
    `# ${siteName}`,
    "",
    siteDescription,
    "",
    "## Routes",
    `- Home: ${canonicalUrl("/")}`,
    `- Projects: ${canonicalUrl("/projects/")}`,
    `- Updates: ${canonicalUrl("/updates/")}`,
    `- About: ${canonicalUrl("/about/")}`,
    "",
    "## Projects",
    ...projectLines,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
