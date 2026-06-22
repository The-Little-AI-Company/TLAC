import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const deployDocPath = path.join(projectRoot, "documents", "deploy-readiness.md");
const astroConfigPath = path.join(projectRoot, "astro.config.mjs");
const packageJsonPath = path.join(projectRoot, "package.json");
const requiredDistFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  path.join("projects", "index.html"),
  path.join("projects", "obscura", "index.html"),
  path.join("about", "index.html"),
  path.join("updates", "index.html"),
];
const forbiddenDistPatterns = [
  /localhost/i,
  /127\.0\.0\.1/i,
  /file:\/\//i,
  /C:\\Users\\/i,
  /C:\/Users\//i,
  /OPENAI_API_KEY/i,
  /ANTHROPIC_API_KEY/i,
  /CLOUDFLARE_API_TOKEN/i,
];
const forbiddenFileNames = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  "wrangler.toml",
]);
const requiredDocSnippets = [
  "Build command: `npm run build`",
  "Output directory: `dist`",
  "Production branch: `prod`",
  "Development branch: `dev`",
  "Publishing gate: explicit Jeff approval required",
  "No secrets are required for the static build",
  "Do not connect production, publish, change DNS, or promote `dev` to `prod` without approval",
];
const failures = [];

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function listFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

for (const file of requiredDistFiles) {
  const filePath = path.join(distRoot, file);

  if (!fs.existsSync(filePath)) {
    failures.push(`dist: missing required file ${file.replace(/\\/g, "/")}`);
  }
}

for (const filePath of listFiles(distRoot)) {
  const fileName = path.basename(filePath);

  if (forbiddenFileNames.has(fileName)) {
    failures.push(`${toRelative(filePath)}: private/deploy config file should not be in dist`);
  }

  if ([".html", ".txt", ".xml", ".js", ".json"].includes(path.extname(filePath).toLowerCase())) {
    const source = fs.readFileSync(filePath, "utf8");

    for (const pattern of forbiddenDistPatterns) {
      if (pattern.test(source)) {
        failures.push(`${toRelative(filePath)}: contains forbidden deploy/private marker ${pattern}`);
      }
    }
  }
}

if (!fs.existsSync(astroConfigPath)) {
  failures.push("astro.config.mjs: missing Astro config");
} else {
  const astroConfig = fs.readFileSync(astroConfigPath, "utf8");

  if (!/output:\s*["']static["']/.test(astroConfig)) {
    failures.push("astro.config.mjs: output must stay static for Cloudflare Pages readiness");
  }

  if (!/site:\s*["']https:\/\/littleaicompany\.com["']/.test(astroConfig)) {
    failures.push("astro.config.mjs: site must be the public littleaicompany.com origin");
  }
}

if (!fs.existsSync(packageJsonPath)) {
  failures.push("package.json: missing package file");
} else {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const buildScript = packageJson.scripts?.build ?? "";

  if (!buildScript.includes("smoke:deploy-readiness")) {
    failures.push("package.json: build must include smoke:deploy-readiness");
  }
}

if (!fs.existsSync(deployDocPath)) {
  failures.push("documents/deploy-readiness.md: missing Cloudflare Pages readiness doc");
} else {
  const deployDoc = fs.readFileSync(deployDocPath, "utf8");

  for (const snippet of requiredDocSnippets) {
    if (!deployDoc.includes(snippet)) {
      failures.push(`documents/deploy-readiness.md: missing "${snippet}"`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Deploy readiness smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Deploy readiness smoke passed: ${requiredDistFiles.length} required dist file(s)`);
