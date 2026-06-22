import { getCollection } from "astro:content";
import { canonicalUrl } from "../site/metadata";

const staticRoutes = [
  "/",
  "/projects/",
  "/learn/",
  "/about/",
  "/updates/",
  "/roadmap/",
  "/uses/",
  "/llms.txt",
];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const projects = await getCollection("projects");
  const routes = [
    ...staticRoutes,
    ...projects.map((project) => `/projects/${project.id}/`),
  ].sort();
  const urls = routes
    .map((route) => {
      return [
        "  <url>",
        `    <loc>${escapeXml(canonicalUrl(route))}</loc>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
