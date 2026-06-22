import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const cssPath = path.join(projectRoot, "src", "styles", "global.css");

const pageChecks = [
  { label: "home", file: "index.html" },
  { label: "projects index", file: path.join("projects", "index.html") },
  { label: "project detail", file: path.join("projects", "obscura", "index.html") },
  { label: "about", file: path.join("about", "index.html") },
  { label: "updates", file: path.join("updates", "index.html") },
  { label: "roadmap", file: path.join("roadmap", "index.html") },
  { label: "learn", file: path.join("learn", "index.html") },
  { label: "uses", file: path.join("uses", "index.html") },
  { label: "404", file: "404.html" },
];

const requiredFocusHooks = [
  ".skip-link:focus",
  ".nav a:focus-visible",
  ".brand:focus-visible",
  ".button:focus-visible",
  ".chip:focus-visible",
  ".text-link:focus-visible",
  ".project-footer a:focus-visible",
  ".detail-links a:focus-visible",
  ".latest-update a:focus-visible",
  ".update-links a:focus-visible",
];

const contrastPairs = [
  ["--ink", "--cream", "primary text on page background"],
  ["--muted", "--cream", "muted text on page background"],
  ["--muted", "--paper", "muted text on card background"],
  ["#ffffff", "--ink", "button text on dark button"],
];

const failures = [];

function readFile(relativeFile) {
  const filePath = path.join(distRoot, relativeFile);

  if (!fs.existsSync(filePath)) {
    failures.push(`${relativeFile}: missing built file`);
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function parseAttributes(source) {
  const attrs = new Map();
  const attrPattern = /([A-Za-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attrPattern.exec(source))) {
    const [, key, doubleQuoted, singleQuoted, unquoted] = match;
    attrs.set(key.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted ?? "");
  }

  return attrs;
}

function textFromHtml(source) {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function findElementById(html, id) {
  for (const match of html.matchAll(/<([A-Za-z][\w:-]*)\b([^>]*)>/g)) {
    const attrs = parseAttributes(match[2]);

    if (attrs.get("id") === id) {
      return { tag: match[1].toLowerCase(), attrs };
    }
  }

  return null;
}

function checkHeadings(label, html) {
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) =>
    Number(match[1]),
  );
  const h1Count = headings.filter((level) => level === 1).length;

  if (h1Count !== 1) {
    failures.push(`${label}: expected exactly one h1, found ${h1Count}`);
  }

  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];

    if (current > previous + 1) {
      failures.push(`${label}: heading order skips from h${previous} to h${current}`);
    }
  }
}

function checkSkipLinks(label, html) {
  const skipLinks = [...html.matchAll(/<a\b([^>]*)>/gi)].filter((match) => {
    const attrs = parseAttributes(match[1]);
    return (attrs.get("class") ?? "").split(/\s+/).includes("skip-link");
  });

  if (skipLinks.length !== 1) {
    failures.push(`${label}: expected one skip link, found ${skipLinks.length}`);
    return;
  }

  const attrs = parseAttributes(skipLinks[0][1]);
  const href = attrs.get("href") ?? "";
  const target = href.startsWith("#") ? findElementById(html, href.slice(1)) : null;

  if (!target) {
    failures.push(`${label}: skip link target is missing or invalid`);
    return;
  }

  if (target.attrs.get("tabindex") !== "-1") {
    failures.push(`${label}: skip link target should be programmatically focusable`);
  }
}

function checkImages(label, html) {
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = parseAttributes(match[1]);

    if (!attrs.has("alt")) {
      failures.push(`${label}: image is missing an alt attribute`);
    }
  }
}

function checkLinks(label, html) {
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = parseAttributes(match[1]);
    const href = attrs.get("href") ?? "";
    const name = attrs.get("aria-label") ?? attrs.get("title") ?? textFromHtml(match[2]);

    if (!href) {
      failures.push(`${label}: link is missing href`);
    }

    if (!name.trim()) {
      failures.push(`${label}: link with href "${href}" has no accessible name`);
    }
  }
}

function parseCssVariables(css) {
  const variables = new Map();

  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
    variables.set(match[1], match[2]);
  }

  return variables;
}

function toRgb(hex) {
  const normalized = hex.length === 4
    ? `#${[...hex.slice(1)].map((char) => `${char}${char}`).join("")}`
    : hex;
  const value = Number.parseInt(normalized.slice(1), 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function luminance(hex) {
  const channels = toRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

function resolveColor(color, variables) {
  if (color.startsWith("--")) {
    const value = variables.get(color);

    if (!value) {
      failures.push(`css: missing color variable ${color}`);
      return "#000000";
    }

    return value;
  }

  return color;
}

function checkCss() {
  if (!fs.existsSync(cssPath)) {
    failures.push("css: missing global stylesheet");
    return;
  }

  const css = fs.readFileSync(cssPath, "utf8");

  for (const hook of requiredFocusHooks) {
    if (!css.includes(hook)) {
      failures.push(`css: missing focus hook ${hook}`);
    }
  }

  if (!css.includes("overflow-wrap: anywhere;")) {
    failures.push("css: missing overflow-wrap support for long interactive text");
  }

  const variables = parseCssVariables(css);

  for (const [foreground, background, label] of contrastPairs) {
    const ratio = contrastRatio(
      resolveColor(foreground, variables),
      resolveColor(background, variables),
    );

    if (ratio < 4.5) {
      failures.push(`css: contrast ratio ${ratio.toFixed(2)} fails for ${label}`);
    }
  }
}

for (const check of pageChecks) {
  const html = readFile(check.file);

  if (!html) {
    continue;
  }

  checkHeadings(check.label, html);
  checkSkipLinks(check.label, html);
  checkImages(check.label, html);
  checkLinks(check.label, html);
}

checkCss();

if (failures.length > 0) {
  console.error(`Accessibility smoke failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Accessibility smoke passed: ${pageChecks.length} core routes`);
