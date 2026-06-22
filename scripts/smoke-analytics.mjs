import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const analyticsDocPath = path.join(projectRoot, "documents", "analytics-privacy.md");
const analyticsConfigPath = path.join(projectRoot, "src", "site", "analytics.ts");
const analyticsComponentPath = path.join(projectRoot, "src", "components", "AnalyticsHead.astro");
const baseLayoutPath = path.join(projectRoot, "src", "layouts", "BaseLayout.astro");
const privacyPagePath = path.join(projectRoot, "src", "pages", "privacy.astro");
const footerPath = path.join(projectRoot, "src", "components", "SiteFooter.astro");
const packageJsonPath = path.join(projectRoot, "package.json");
const routeSmokePath = path.join(projectRoot, "scripts", "smoke-routes.mjs");
const accessibilitySmokePath = path.join(projectRoot, "scripts", "smoke-accessibility.mjs");
const deploySmokePath = path.join(projectRoot, "scripts", "smoke-deploy-readiness.mjs");
const sitemapPath = path.join(projectRoot, "src", "pages", "sitemap.xml.ts");
const llmsPath = path.join(projectRoot, "src", "pages", "llms.txt.ts");
const verificationPath = path.join(projectRoot, "verification", "analytics-privacy-smoke.md");

const requiredDocSnippets = [
  "Default provider: `none`",
  "No paid service",
  "explicit Jeff approval",
  "PUBLIC_TLAC_ANALYTICS_PROVIDER",
  "PUBLIC_TLAC_CLOUDFLARE_ANALYTICS_TOKEN",
  "Cloudflare Web Analytics",
  "No private personal context",
];
const requiredPrivacySnippets = [
  "Privacy",
  "No ads",
  "No retargeting",
  "No private personal context",
  "Default measurement setting",
];
const requiredVerificationSnippets = [
  "npm run smoke:analytics",
  "default build contains no analytics beacon",
  "/privacy/",
];
const forbiddenBuiltPatterns = [
  /static\.cloudflareinsights\.com/i,
  /data-cf-beacon/i,
  /cf-beacon/i,
  /googletagmanager/i,
  /google-analytics/i,
  /gtag\(/i,
  /plausible\.io/i,
  /umami/i,
  /localStorage\.setItem/i,
  /document\.cookie/i,
  /PUBLIC_TLAC_CLOUDFLARE_ANALYTICS_TOKEN/i,
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

function listFiles(root) {
  if (!fs.existsSync(root)) {
    failures.push(`${toRelative(root)}: missing`);
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

function checkSnippets(label, source, snippets) {
  for (const snippet of snippets) {
    if (!source.includes(snippet)) {
      failures.push(`${label}: missing ${JSON.stringify(snippet)}`);
    }
  }
}

const analyticsDoc = readRequired(analyticsDocPath);
const analyticsConfig = readRequired(analyticsConfigPath);
const analyticsComponent = readRequired(analyticsComponentPath);
const baseLayout = readRequired(baseLayoutPath);
const privacyPage = readRequired(privacyPagePath);
const footer = readRequired(footerPath);
const packageJson = readRequired(packageJsonPath);
const routeSmoke = readRequired(routeSmokePath);
const accessibilitySmoke = readRequired(accessibilitySmokePath);
const deploySmoke = readRequired(deploySmokePath);
const sitemap = readRequired(sitemapPath);
const llms = readRequired(llmsPath);
const verification = readRequired(verificationPath);

if (analyticsDoc) {
  checkSnippets("documents/analytics-privacy.md", analyticsDoc, requiredDocSnippets);
}

if (privacyPage) {
  checkSnippets("src/pages/privacy.astro", privacyPage, requiredPrivacySnippets);
}

if (verification) {
  checkSnippets("verification/analytics-privacy-smoke.md", verification, requiredVerificationSnippets);
}

if (analyticsConfig) {
  checkSnippets("src/site/analytics.ts", analyticsConfig, [
    "PUBLIC_TLAC_ANALYTICS_PROVIDER",
    "PUBLIC_TLAC_CLOUDFLARE_ANALYTICS_TOKEN",
    "none",
    "cloudflare",
  ]);
}

if (analyticsComponent && !analyticsComponent.includes("analyticsConfig.provider === \"cloudflare\"")) {
  failures.push("src/components/AnalyticsHead.astro: Cloudflare script must be provider-gated");
}

if (baseLayout && !baseLayout.includes("<AnalyticsHead />")) {
  failures.push("src/layouts/BaseLayout.astro: must render AnalyticsHead once in the document head");
}

if (footer && !footer.includes('href="/privacy/"')) {
  failures.push("src/components/SiteFooter.astro: footer must link the privacy page");
}

if (packageJson) {
  const parsed = JSON.parse(packageJson);
  const buildScript = parsed.scripts?.build ?? "";

  if (parsed.scripts?.["smoke:analytics"] !== "node scripts/smoke-analytics.mjs") {
    failures.push("package.json: missing smoke:analytics script");
  }

  if (!buildScript.includes("smoke:analytics")) {
    failures.push("package.json: build must include smoke:analytics after astro build");
  }
}

if (routeSmoke && !routeSmoke.includes("privacy/index.html")) {
  failures.push("scripts/smoke-routes.mjs: route smoke must include the privacy page");
}

if (accessibilitySmoke && !accessibilitySmoke.includes("privacy")) {
  failures.push("scripts/smoke-accessibility.mjs: accessibility smoke must include the privacy page");
}

if (
  deploySmoke
  && !deploySmoke.includes('"privacy", "index.html"')
  && !deploySmoke.includes("privacy/index.html")
) {
  failures.push("scripts/smoke-deploy-readiness.mjs: deploy smoke must require the privacy page");
}

if (sitemap && !sitemap.includes("/privacy/")) {
  failures.push("src/pages/sitemap.xml.ts: sitemap must include privacy");
}

if (llms && !llms.includes("/privacy/")) {
  failures.push("src/pages/llms.txt.ts: llms.txt must include privacy");
}

const builtPrivacyPath = path.join(distRoot, "privacy", "index.html");
if (!fs.existsSync(builtPrivacyPath)) {
  failures.push("dist/privacy/index.html: missing built privacy page");
}

for (const filePath of listFiles(distRoot)) {
  if (![".html", ".js", ".txt", ".xml", ".json"].includes(path.extname(filePath).toLowerCase())) {
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");

  for (const pattern of forbiddenBuiltPatterns) {
    if (pattern.test(source)) {
      failures.push(`${toRelative(filePath)}: default build contains forbidden analytics marker ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Analytics smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Analytics smoke passed: default build is privacy-light and analytics-disabled");
