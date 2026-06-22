import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const assetRoot = path.join(distRoot, "_astro");
const maxImageBytes = 450_000;
const maxTotalImageBytes = 2_500_000;
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const allowedProjectImageStems = [
  "tlac-website-hero-workbench",
  "tlac-bit-pet-sticker",
  "tlac-logo-concept-01-interlocking-ribbons",
  "tlac-logo-concept-02-workbench-tiles",
  "tlac-logo-concept-03-circuit-knot",
  "tlac-logo-concept-05-folded-spark",
];
const forbiddenExplorationStems = [
  "tlac-site-mockup",
  "tlac-logo-in-the-wild",
  "tlac-social-bit-badge",
  "tlac-bit-pet-chromakey",
  "tlac-logo-concept-04-tool-badge",
];
const failures = [];

function listFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

const emittedImages = listFiles(assetRoot).filter((filePath) =>
  imageExtensions.has(path.extname(filePath).toLowerCase()),
);
const totalImageBytes = emittedImages.reduce(
  (total, filePath) => total + fs.statSync(filePath).size,
  0,
);

for (const filePath of emittedImages) {
  const relativePath = toRelative(filePath);
  const fileName = path.basename(filePath).toLowerCase();
  const size = fs.statSync(filePath).size;

  if (size > maxImageBytes) {
    failures.push(`${relativePath}: ${size} bytes exceeds ${maxImageBytes} byte image budget`);
  }

  if (forbiddenExplorationStems.some((stem) => fileName.includes(stem))) {
    failures.push(`${relativePath}: exploration asset should not ship in production`);
  }

  if (!allowedProjectImageStems.some((stem) => fileName.includes(stem))) {
    failures.push(`${relativePath}: emitted raster is not in the intentional project image set`);
  }
}

if (totalImageBytes > maxTotalImageBytes) {
  failures.push(
    `dist/_astro images total ${totalImageBytes} bytes exceeds ${maxTotalImageBytes} byte budget`,
  );
}

const projectsRoot = path.join(distRoot, "projects");
const projectDetailPages = fs.existsSync(projectsRoot)
  ? fs.readdirSync(projectsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(projectsRoot, entry.name, "index.html"))
      .filter((filePath) => fs.existsSync(filePath))
  : [];

for (const filePath of projectDetailPages) {
  const html = fs.readFileSync(filePath, "utf8");
  const relativePath = toRelative(filePath);

  if (!/<figure class="detail-media">[\s\S]*?<img\b[^>]*\bsrcset=/i.test(html)) {
    failures.push(`${relativePath}: project detail image is missing responsive srcset`);
  }

  if (!/<figure class="detail-media">[\s\S]*?<img\b[^>]*\bsizes=/i.test(html)) {
    failures.push(`${relativePath}: project detail image is missing sizes`);
  }
}

if (projectDetailPages.length === 0) {
  failures.push("dist/projects: no project detail pages found for image budget check");
}

if (failures.length > 0) {
  console.error(`Performance smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Performance smoke passed: ${emittedImages.length} image asset(s), ${totalImageBytes} bytes total`,
);
