import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const distRoot = fileURLToPath(new URL("../dist/", import.meta.url));

const routeChecks = [
  {
    label: "home",
    file: "index.html",
    includes: ["The Little AI Company", "Proof board", 'href="/projects/"', 'href="/updates/"'],
  },
  {
    label: "projects index",
    file: "projects/index.html",
    includes: ["Useful AI work, easy to scan.", 'href="/projects/obscura/"'],
  },
  {
    label: "projects gallery",
    file: "projects/gallery/index.html",
    includes: ["Compare TLAC projects.", "Project comparison", "Obscura", "Vivary"],
  },
  {
    label: "project detail",
    file: "projects/obscura/index.html",
    includes: ["Obscura", "Project Links", "SoftwareApplication"],
  },
  {
    label: "about",
    file: "about/index.html",
    includes: ["A small studio for useful AI work.", "Find learning surfaces"],
  },
  {
    label: "updates",
    file: "updates/index.html",
    includes: ["A short log of useful-AI progress.", "TLAC site takes its first shape"],
  },
  {
    label: "roadmap",
    file: "roadmap/index.html",
    includes: ["TLAC roadmap", "Active", "Research"],
  },
  {
    label: "learn",
    file: "learn/index.html",
    includes: ["Start using AI with less noise.", "Zo 101", "DesignDojo"],
  },
  {
    label: "project badge",
    file: "project-badge/index.html",
    includes: [
      "Project badge kit.",
      "A Little AI Company project",
      "/brand/tlac-project-badge.svg",
    ],
  },
  {
    label: "proof index",
    file: "proof/index.html",
    includes: ["Practical proof, kept honest.", "Vivary keeps the TLAC build coherent"],
  },
  {
    label: "proof detail",
    file: "proof/vivary-project-memory/index.html",
    includes: ["Problem", "Build", "Proof", "Honest caveats"],
  },
  {
    label: "uses",
    file: "uses/index.html",
    includes: ["The TLAC working kit", "Project memory", "Verification"],
  },
  {
    label: "privacy",
    file: "privacy/index.html",
    includes: ["Measured lightly, explained plainly.", "No ads", "No retargeting"],
  },
  {
    label: "404",
    file: "404.html",
    includes: ["Page not found.", 'href="/projects/"', 'href="/updates/"', 'href="/about/"'],
  },
];

const failures = [];

for (const check of routeChecks) {
  const filePath = join(distRoot, check.file);

  if (!existsSync(filePath)) {
    failures.push(`${check.label}: missing ${check.file}`);
    continue;
  }

  const html = readFileSync(filePath, "utf8");

  for (const expectedText of check.includes) {
    if (!html.includes(expectedText)) {
      failures.push(`${check.label}: missing ${JSON.stringify(expectedText)} in ${check.file}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Route smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Route smoke passed: ${routeChecks.length} core routes`);
