import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const css = read("styles.css");
const criticalPages = [
  "index.html",
  "calculators.html",
  "loan-emi-calculator.html",
  "pakistan-salary-tax-calculator.html",
  "psx-calculator.html",
  "tmr-feed-calculator.html",
  "fertilizer-calculator.html",
  "zakat-calculator.html",
  "solar-load-calculator.html"
];

function walkHtml(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, found);
    else if (entry.isFile() && entry.name.endsWith(".html")) found.push(path.relative(root, full));
  }
  return found;
}

for (const page of criticalPages) {
  const html = read(page);
  assert.match(html, /<meta[^>]+name=["']viewport["'][^>]*>/i, page + " must define a mobile viewport");
  assert.match(html, /href=["'][^"']*styles\.css(?:\?[^"']*)?["']/i, page + " must load shared responsive CSS");
}

assert.match(css, /@media\s*\(max-width:\s*580px\)/, "Shared CSS must include a phone breakpoint");
assert.match(css, /@media\s*\(max-width:\s*900px\)/, "Shared CSS must include a tablet breakpoint");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Motion must respect reduced-motion preferences");
assert.match(css, /min-height:\s*44px/, "Calculator form controls must have usable touch targets");
assert.match(css, /\.calcora-search-wrap\s*\{[^}]*flex-wrap:\s*wrap/s, "Search controls must be able to wrap on narrow screens");
assert.match(css, /img,video,iframe,canvas,svg\s*\{max-width:\s*100%\}/, "Media must not exceed its container");
assert.match(css, /pre\s*\{max-width:\s*100%;overflow-x:auto\}/, "Long code or formula blocks must not force page overflow");

const pages = walkHtml(root);
const viewportMissing = [];
const stylesheetMissing = [];
const syncExternalScripts = [];
let imageCount = 0;
let imagesWithoutDimensions = 0;
let imagesWithoutLazyHint = 0;

for (const page of pages) {
  const html = read(page);
  const verificationArtifact = /^google[a-z0-9]+\.html$/i.test(path.basename(page)) ||
    /^[a-f0-9-]{36}\.html$/i.test(path.basename(page)) && /google-site-verification:/i.test(html);
  const redirectStub = /<meta[^>]+name=["']robots["'][^>]*content=["']noindex,follow["']/i.test(html) &&
    (/<meta[^>]+http-equiv=["']refresh["']/i.test(html) || /location\.replace\(/i.test(html));
  const requiresResponsiveViewport = !verificationArtifact && !redirectStub;
  if (requiresResponsiveViewport && !/<meta[^>]+name=["']viewport["'][^>]*>/i.test(html)) viewportMissing.push(page);
  if (requiresResponsiveViewport && !/href=["'][^"']*styles\.css(?:\?[^"']*)?["']/i.test(html)) stylesheetMissing.push(page);
  for (const match of html.matchAll(/<script\b([^>]*)\bsrc=["']https?:\/\/[^"']+["'][^>]*>/gi)) {
    if (!/\b(?:async|defer)\b/i.test(match[0])) syncExternalScripts.push(page);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    imageCount++;
    if (!/\bwidth\s*=/.test(match[0]) || !/\bheight\s*=/.test(match[0])) imagesWithoutDimensions++;
    if (!/\bloading\s*=\s*["'](?:lazy|eager)["']/i.test(match[0])) imagesWithoutLazyHint++;
  }
}

assert.ok(pages.length >= 300, "Expected broad HTML coverage; found " + pages.length);
assert.equal(viewportMissing.length, 0, "HTML pages missing mobile viewport: " + viewportMissing.slice(0, 12).join(", "));
assert.ok(stylesheetMissing.length <= Math.max(3, Math.floor(pages.length * 0.02)),
  "Unexpected number of pages missing shared responsive CSS: " + stylesheetMissing.slice(0, 12).join(", "));

console.log("Responsive/performance safeguards PASS");
console.log("HTML files scanned: " + pages.length + "; missing viewport on indexable pages: " + viewportMissing.length + "; missing shared CSS on indexable pages: " + stylesheetMissing.length + "; utility/redirect files excluded from responsive requirements.");
console.log("Static performance review (manual follow-up): " + syncExternalScripts.length + " page(s) with synchronous external scripts; " +
  imagesWithoutDimensions + "/" + imageCount + " images missing width/height; " +
  imagesWithoutLazyHint + "/" + imageCount + " images without explicit loading hints.");
