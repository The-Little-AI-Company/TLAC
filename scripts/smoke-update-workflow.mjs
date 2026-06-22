import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const projectRoot = process.cwd();
const updatesRoot = path.join(projectRoot, "src", "content", "updates");
const updateDocPath = path.join(projectRoot, "documents", "update-authoring.md");
const templatePath = path.join(projectRoot, "templates", "update-entry.md");
const updatesPagePath = path.join(projectRoot, "src", "pages", "updates", "index.astro");
const routeSmokePath = path.join(projectRoot, "scripts", "smoke-routes.mjs");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedStatuses = new Set(["draft", "published"]);
const requiredDocSnippets = [
  "src/content/updates/",
  "YYYY-MM-DD",
  "`draft`",
  "`published`",
  "npm run smoke:content",
  "npm run build",
  "No CMS",
];
const lanePattern =
  /useful AI tools,\s+small apps,\s+learning surfaces,\s+project proof,\s+or studio progress/;
const requiredTemplateSnippets = [
  "title:",
  "status: draft",
  "date: YYYY-MM-DD",
  "summary:",
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

function checkRequiredSnippets(label, source, snippets) {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) {
      failures.push(`${label}: missing ${JSON.stringify(snippet)}`);
    }
  }
}

const updateDoc = readRequired(updateDocPath);
const updateTemplate = readRequired(templatePath);
const updatesPage = readRequired(updatesPagePath);
const routeSmoke = readRequired(routeSmokePath);

if (updateDoc) {
  checkRequiredSnippets("documents/update-authoring.md", updateDoc, requiredDocSnippets);

  if (!lanePattern.test(updateDoc)) {
    failures.push("documents/update-authoring.md: missing TLAC lane check");
  }
}

if (updateTemplate) {
  checkRequiredSnippets("templates/update-entry.md", updateTemplate, requiredTemplateSnippets);
}

if (updatesPage && !updatesPage.includes('status === "published"')) {
  failures.push("src/pages/updates/index.astro: updates page must render published updates only");
}

if (updatesPage && !updatesPage.includes("b.data.date.getTime() - a.data.date.getTime()")) {
  failures.push("src/pages/updates/index.astro: updates page must sort newest first");
}

if (routeSmoke && !routeSmoke.includes("updates/index.html")) {
  failures.push("scripts/smoke-routes.mjs: route smoke must include the updates route");
}

const updateFiles = fs.existsSync(updatesRoot)
  ? fs.readdirSync(updatesRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(updatesRoot, entry.name))
      .sort()
  : [];
const seenSlugs = new Set();
const today = new Date();
const todayUtc = new Date(Date.UTC(
  today.getUTCFullYear(),
  today.getUTCMonth(),
  today.getUTCDate(),
));

for (const filePath of updateFiles) {
  const slug = path.basename(filePath, ".md");
  const entry = readFrontmatter(filePath);

  if (!slugPattern.test(slug)) {
    failures.push(`${toRelative(filePath)}: update slug must be kebab-case`);
  }

  if (seenSlugs.has(slug)) {
    failures.push(`${toRelative(filePath)}: duplicate update slug "${slug}"`);
  }

  seenSlugs.add(slug);

  if (typeof entry.title !== "string" || entry.title.trim().length === 0) {
    failures.push(`${toRelative(filePath)}: title must be non-empty text`);
  }

  if (!allowedStatuses.has(entry.status)) {
    failures.push(`${toRelative(filePath)}: status must be draft or published`);
  }

  if (typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    failures.push(`${toRelative(filePath)}: date must use YYYY-MM-DD`);
  } else {
    const parsedDate = new Date(`${entry.date}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== entry.date) {
      failures.push(`${toRelative(filePath)}: date must be a valid calendar date`);
    }

    if (entry.status === "published" && parsedDate > todayUtc) {
      failures.push(`${toRelative(filePath)}: published updates cannot use a future date`);
    }
  }

  if (typeof entry.summary !== "string" || entry.summary.trim().length < 30) {
    failures.push(`${toRelative(filePath)}: summary must be at least 30 characters`);
  } else if (entry.summary.length > 220) {
    failures.push(`${toRelative(filePath)}: summary must stay under 220 characters`);
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

if (updateFiles.length === 0) {
  failures.push("src/content/updates: expected at least one update entry");
}

if (failures.length > 0) {
  console.error(`Update workflow smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Update workflow smoke passed: ${updateFiles.length} update entry file(s)`);
