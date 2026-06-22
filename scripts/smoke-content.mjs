import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const projectRoot = process.cwd();
const projectsRoot = path.join(projectRoot, "src", "content", "projects");
const updatesRoot = path.join(projectRoot, "src", "content", "updates");
const projectImageRegistryPath = path.join(projectRoot, "src", "site", "project-images.ts");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const projectStatuses = new Set(["planned", "in-progress", "live", "paused"]);
const updateStatuses = new Set(["draft", "published"]);
const paletteColors = new Set(["blue", "amber", "green", "red"]);
const failures = [];

function listMarkdownFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(root, entry.name))
    .sort();
}

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function readFrontmatter(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
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

function requireText(entry, filePath, field) {
  if (typeof entry[field] !== "string" || entry[field].trim().length === 0) {
    failures.push(`${toRelative(filePath)}: ${field} must be non-empty text`);
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

function checkLinks(entry, filePath) {
  if (!Array.isArray(entry.links)) {
    failures.push(`${toRelative(filePath)}: links must be an array`);
    return;
  }

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

function checkSlugs(files, collectionName) {
  const seen = new Set();

  for (const filePath of files) {
    const slug = path.basename(filePath, ".md");

    if (!slugPattern.test(slug)) {
      failures.push(`${toRelative(filePath)}: ${collectionName} slug must be kebab-case`);
    }

    if (seen.has(slug)) {
      failures.push(`${toRelative(filePath)}: duplicate ${collectionName} slug "${slug}"`);
    }

    seen.add(slug);
  }
}

function checkProject(entry, filePath, projectImageRegistry) {
  for (const field of ["title", "category", "purpose", "why", "leveledUp"]) {
    requireText(entry, filePath, field);
  }

  if (!Number.isInteger(entry.year) || entry.year < 2020) {
    failures.push(`${toRelative(filePath)}: year must be an integer >= 2020`);
  }

  if (!projectStatuses.has(entry.status)) {
    failures.push(`${toRelative(filePath)}: status must be one of ${[...projectStatuses].join(", ")}`);
  }

  checkLinks(entry, filePath);

  if (!entry.image || typeof entry.image !== "object") {
    failures.push(`${toRelative(filePath)}: image must be an object`);
  } else {
    if (typeof entry.image.src !== "string" || entry.image.src.trim().length === 0) {
      failures.push(`${toRelative(filePath)}: image.src must be non-empty text`);
    } else {
      const imagePath = path.join(projectRoot, entry.image.src);

      if (!fs.existsSync(imagePath)) {
        failures.push(`${toRelative(filePath)}: image.src does not exist (${entry.image.src})`);
      }

      if (!projectImageRegistry.includes(`"${entry.image.src}"`)) {
        failures.push(`${toRelative(filePath)}: image.src is missing from src/site/project-images.ts`);
      }
    }

    if (typeof entry.image.alt !== "string" || entry.image.alt.trim().length === 0) {
      failures.push(`${toRelative(filePath)}: image.alt must be non-empty text`);
    }
  }

  if (!Array.isArray(entry.caveats)) {
    failures.push(`${toRelative(filePath)}: caveats must be an array`);
  }

  if (typeof entry.featured !== "boolean") {
    failures.push(`${toRelative(filePath)}: featured must be true or false`);
  }

  if (!Array.isArray(entry.palette) || entry.palette.length === 0) {
    failures.push(`${toRelative(filePath)}: palette must include at least one color`);
  } else {
    for (const color of entry.palette) {
      if (!paletteColors.has(color)) {
        failures.push(`${toRelative(filePath)}: palette color "${color}" is not approved`);
      }
    }
  }
}

function checkUpdate(entry, filePath) {
  for (const field of ["title", "summary"]) {
    requireText(entry, filePath, field);
  }

  if (!updateStatuses.has(entry.status)) {
    failures.push(`${toRelative(filePath)}: status must be one of ${[...updateStatuses].join(", ")}`);
  }

  if (typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    failures.push(`${toRelative(filePath)}: date must use YYYY-MM-DD`);
  } else {
    const parsedDate = new Date(`${entry.date}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== entry.date) {
      failures.push(`${toRelative(filePath)}: date must be a valid calendar date`);
    }
  }

  checkLinks(entry, filePath);
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

const projectFiles = listMarkdownFiles(projectsRoot);
const updateFiles = listMarkdownFiles(updatesRoot);
const projectImageRegistry = fs.existsSync(projectImageRegistryPath)
  ? fs.readFileSync(projectImageRegistryPath, "utf8")
  : "";

checkSlugs(projectFiles, "project");
checkSlugs(updateFiles, "update");

for (const filePath of projectFiles) {
  checkProject(readFrontmatter(filePath), filePath, projectImageRegistry);
}

for (const filePath of updateFiles) {
  checkUpdate(readFrontmatter(filePath), filePath);
}

if (failures.length > 0) {
  console.error(`Content smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Content smoke passed: ${projectFiles.length} ${pluralize(
    projectFiles.length,
    "project entry",
    "project entries",
  )}, ${updateFiles.length} ${pluralize(updateFiles.length, "update entry", "update entries")}`,
);
