import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const projectRoot = process.cwd();
const projectsRoot = path.join(projectRoot, "src", "content", "projects");
const proofsRoot = path.join(projectRoot, "src", "content", "proofs");
const proofDocPath = path.join(projectRoot, "documents", "proof-case-study.md");
const proofTemplatePath = path.join(projectRoot, "templates", "proof-entry.md");
const proofIndexPath = path.join(projectRoot, "src", "pages", "proof", "index.astro");
const proofDetailPath = path.join(projectRoot, "src", "pages", "proof", "[slug].astro");
const projectDetailPath = path.join(projectRoot, "src", "pages", "projects", "[slug].astro");
const routeSmokePath = path.join(projectRoot, "scripts", "smoke-routes.mjs");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const proofStatuses = new Set(["draft", "published"]);
const requiredProofFields = ["problem", "build", "proof", "lesson", "nextStep"];
const requiredDocSnippets = [
  "src/content/proofs/",
  "problem",
  "build",
  "proof",
  "lesson",
  "nextStep",
  "caveats",
  "npm run smoke:proofs",
  "honest caveats",
];
const requiredTemplateSnippets = [
  "title:",
  "status: draft",
  "date: YYYY-MM-DD",
  "project:",
  "problem:",
  "build:",
  "proof:",
  "lesson:",
  "nextStep:",
  "caveats:",
  "links:",
];
const failures = [];

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${toRelative(filePath)}: missing`);
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function listMarkdownFiles(root) {
  if (!fs.existsSync(root)) {
    failures.push(`${toRelative(root)}: missing`);
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(root, entry.name))
    .sort();
}

function readFrontmatter(filePath) {
  const source = readRequired(filePath);
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    failures.push(`${toRelative(filePath)}: missing frontmatter`);
    return {};
  }

  try {
    return YAML.parse(match[1]) ?? {};
  } catch (error) {
    failures.push(`${toRelative(filePath)}: invalid frontmatter YAML (${error.message})`);
    return {};
  }
}

function isValidHref(href) {
  if (typeof href !== "string" || href.trim().length === 0) {
    return false;
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    return true;
  }

  try {
    new URL(href);
    return true;
  } catch {
    return false;
  }
}

function checkSnippets(label, source, snippets) {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) {
      failures.push(`${label}: missing ${JSON.stringify(snippet)}`);
    }
  }
}

const proofDoc = readRequired(proofDocPath);
const proofTemplate = readRequired(proofTemplatePath);
const proofIndex = readRequired(proofIndexPath);
const proofDetail = readRequired(proofDetailPath);
const projectDetail = readRequired(projectDetailPath);
const routeSmoke = readRequired(routeSmokePath);

if (proofDoc) {
  checkSnippets("documents/proof-case-study.md", proofDoc, requiredDocSnippets);
}

if (proofTemplate) {
  checkSnippets("templates/proof-entry.md", proofTemplate, requiredTemplateSnippets);
}

if (proofIndex && !proofIndex.includes('getCollection("proofs")')) {
  failures.push("src/pages/proof/index.astro: proof index must render from the proofs collection");
}

if (proofDetail && !proofDetail.includes('getCollection("proofs")')) {
  failures.push("src/pages/proof/[slug].astro: proof detail must render from the proofs collection");
}

if (projectDetail && !projectDetail.includes('getCollection("proofs")')) {
  failures.push("src/pages/projects/[slug].astro: project detail must link related proofs");
}

if (routeSmoke && !routeSmoke.includes("proof/index.html")) {
  failures.push("scripts/smoke-routes.mjs: route smoke must include the proof index route");
}

const projectSlugs = new Set(
  listMarkdownFiles(projectsRoot).map((filePath) => path.basename(filePath, ".md")),
);
const proofFiles = listMarkdownFiles(proofsRoot);
const seenSlugs = new Set();

for (const filePath of proofFiles) {
  const slug = path.basename(filePath, ".md");
  const entry = readFrontmatter(filePath);

  if (!slugPattern.test(slug)) {
    failures.push(`${toRelative(filePath)}: proof slug must be kebab-case`);
  }

  if (seenSlugs.has(slug)) {
    failures.push(`${toRelative(filePath)}: duplicate proof slug "${slug}"`);
  }

  seenSlugs.add(slug);

  for (const field of ["title", "summary", "project", ...requiredProofFields]) {
    if (typeof entry[field] !== "string" || entry[field].trim().length === 0) {
      failures.push(`${toRelative(filePath)}: ${field} must be non-empty text`);
    }
  }

  if (!proofStatuses.has(entry.status)) {
    failures.push(`${toRelative(filePath)}: status must be draft or published`);
  }

  if (!projectSlugs.has(entry.project)) {
    failures.push(`${toRelative(filePath)}: project must reference an existing project slug`);
  }

  if (typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    failures.push(`${toRelative(filePath)}: date must use YYYY-MM-DD`);
  } else {
    const parsedDate = new Date(`${entry.date}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== entry.date) {
      failures.push(`${toRelative(filePath)}: date must be a valid calendar date`);
    }
  }

  if (typeof entry.summary === "string" && (entry.summary.length < 40 || entry.summary.length > 240)) {
    failures.push(`${toRelative(filePath)}: summary must be 40-240 characters`);
  }

  if (!Array.isArray(entry.caveats) || entry.caveats.length === 0) {
    failures.push(`${toRelative(filePath)}: caveats must include at least one honest caveat`);
  }

  if (!Array.isArray(entry.links)) {
    failures.push(`${toRelative(filePath)}: links must be an array`);
  } else {
    for (const [index, link] of entry.links.entries()) {
      if (!link || typeof link !== "object") {
        failures.push(`${toRelative(filePath)}: links[${index}] must be an object`);
        continue;
      }

      if (typeof link.label !== "string" || link.label.trim().length === 0) {
        failures.push(`${toRelative(filePath)}: links[${index}].label must be non-empty text`);
      }

      if (!isValidHref(link.href)) {
        failures.push(`${toRelative(filePath)}: links[${index}].href must be a URL or root-relative path`);
      }
    }
  }
}

if (proofFiles.length === 0) {
  failures.push("src/content/proofs: expected at least one proof entry");
}

if (failures.length > 0) {
  console.error(`Proof smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Proof smoke passed: ${proofFiles.length} proof entry file(s)`);
