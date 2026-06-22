import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const publicBrandRoot = path.join(projectRoot, "public", "brand");
const pagePath = path.join(projectRoot, "src", "pages", "project-badge.astro");
const brandDocPath = path.join(projectRoot, "documents", "brand-assets.md");
const badgeDocPath = path.join(projectRoot, "documents", "project-badge.md");
const badgeFiles = [
  "tlac-project-badge.svg",
  "tlac-project-badge-compact.svg",
];
const requiredSvgSnippets = [
  "<svg",
  "<title",
  "A Little AI Company project",
  "littleaicompany.com",
  "#2563EB",
  "#E0A22E",
  "#2EAD62",
  "#C8312B",
];
const requiredGuidanceSnippets = [
  'rel="author"',
  "https://littleaicompany.com/",
  "/brand/tlac-project-badge.svg",
  "/brand/tlac-project-badge-compact.svg",
  "attribution",
];
const failures = [];

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    failures.push(`${path.relative(projectRoot, filePath)}: missing`);
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

for (const fileName of badgeFiles) {
  const filePath = path.join(publicBrandRoot, fileName);
  const source = readRequired(filePath);

  if (!source) {
    continue;
  }

  for (const snippet of requiredSvgSnippets) {
    if (!source.includes(snippet)) {
      failures.push(`${fileName}: missing ${JSON.stringify(snippet)}`);
    }
  }

  if (/<image\b/i.test(source)) {
    failures.push(`${fileName}: must stay vector/text SVG, not embedded raster image data`);
  }

  if (/assets\/brand\/generated/i.test(source)) {
    failures.push(`${fileName}: must not depend on generated raster brand assets`);
  }
}

for (const [label, filePath] of [
  ["project badge page", pagePath],
  ["project badge docs", badgeDocPath],
  ["brand asset docs", brandDocPath],
]) {
  const source = readRequired(filePath);

  if (!source) {
    continue;
  }

  for (const snippet of requiredGuidanceSnippets) {
    if (!source.includes(snippet)) {
      failures.push(`${label}: missing ${JSON.stringify(snippet)}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Badge smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Badge smoke passed: ${badgeFiles.length} exact SVG badge asset(s)`);
