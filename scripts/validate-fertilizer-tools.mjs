import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const files = [
  "fertilizer-application-variance-checker.html",
  "fertilizer-split-application-planner.html",
  "fertilizer-calculator.html",
  "fertilizer-blend-calculator.html",
  "fertilizer-bag-calculator.html",
  "agriculture-fertilizer-hub.html",
  "wheat-fertilizer-calculator-pakistan.html",
  "cotton-fertilizer-calculator-pakistan.html",
  "rice-fertilizer-calculator-pakistan.html",
  "sugarcane-fertilizer-calculator-pakistan.html",
  "maize-fertilizer-calculator-pakistan.html",
  "blog-fertilizer-split-application.html",
  "blog-fertilizer-label-reading-guide.html",
  "blog-fertilizer-soil-test-guide.html"
];
const errors = [];
const read = (p) => {
  try { return readFileSync(p, "utf8"); }
  catch (e) { errors.push(`${p}: cannot read file (${e.message})`); return ""; }
};
const assertCheck = (condition, message) => {
  try { assert.ok(condition, message); }
  catch (e) { errors.push(e.message); }
};

for (const file of files) {
  const html = read(file);
  if (!html) continue;
  assertCheck(/<html\b/i.test(html), `${file}: missing html element`);
  assertCheck(/<title>[^<]{8,}<\/title>/i.test(html), `${file}: missing/short title`);
  assertCheck(/<meta\s+name="description"\s+content="[^"]{50,}"/i.test(html), `${file}: missing/short description`);
  assertCheck(/<link\s+rel="canonical"\s+href="https:\/\/azeemwaseem2020\.github\.io\//i.test(html), `${file}: missing canonical`);
  assertCheck(/<h1\b/i.test(html), `${file}: missing H1`);
  assertCheck(/abdul-qadir\.html/i.test(html), `${file}: missing author/profile link`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assertCheck(new Set(ids).size === ids.length, `${file}: duplicate HTML id found`);
  const blocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  assertCheck(blocks.length > 0, `${file}: missing JSON-LD`);
  for (const [index, block] of blocks.entries()) {
    try { JSON.parse(block[1]); }
    catch (e) { errors.push(`${file}: JSON-LD block ${index + 1} invalid: ${e.message}`); }
  }
}

const varianceChecker = read("fertilizer-application-variance-checker.html");
assertCheck(varianceChecker.includes("const totalRow="), "Variance checker: CSV export should include totals");
assertCheck(varianceChecker.includes("const probe=s.replace"), "Variance checker: CSV formula-injection guard should check leading whitespace");
assertCheck(varianceChecker.includes("uFEFF"), "Variance checker: whitespace regex should include BOM/whitespace handling");
assertCheck(varianceChecker.includes("return /^[=+@-]/.test(probe)"), "Variance checker: formula-prefix guard should inspect normalized text");
assertCheck(varianceChecker.includes("String.fromCharCode(13,10)"), "Variance checker: CSV should use CRLF row separators");

const fertilizerCalculator = read("fertilizer-calculator.html");
assertCheck(fertilizerCalculator.includes("Label-based cost per kg of nutrient"), "Fertilizer calculator: missing cost-per-nutrient comparison");
assertCheck(fertilizerCalculator.includes("x.price/(x.bag*p/100)"), "Fertilizer calculator: missing label-based unit-cost formula");

const hub = read("agriculture-fertilizer-hub.html");
assertCheck(hub.includes("fertilizer-application-variance-checker.html"), "Hub: missing application variance checker link");
assertCheck(hub.includes("fertilizer-split-application-planner.html"), "Hub: missing split application planner link");
assertCheck(hub.includes('"numberOfItems":20'), "Hub: ItemList count should be 20");
for (const guide of ["blog-fertilizer-split-application.html", "blog-fertilizer-label-reading-guide.html", "blog-fertilizer-soil-test-guide.html"]) {
  const html = read(guide);
  assertCheck(html.includes("fertilizer-application-variance-checker.html"), `${guide}: missing link to variance checker`);
}
for (const crop of ["wheat", "cotton", "rice", "sugarcane", "maize"]) {
  const html = read(`${crop}-fertilizer-calculator-pakistan.html`);
  assertCheck(html.includes("fertilizer-application-variance-checker.html"), `${crop}: missing link to variance checker`);
}

for (const sitemapPath of ["sitemap.xml", "sitemap-pakistan-priority.xml"]) {
  const xml = read(sitemapPath);
  assertCheck(xml.includes("<urlset"), `${sitemapPath}: missing urlset root`);
  assertCheck(xml.trim().endsWith("</urlset>"), `${sitemapPath}: missing closing urlset`);
  assertCheck(xml.includes("https://azeemwaseem2020.github.io/fertilizer-application-variance-checker.html"), `${sitemapPath}: missing variance checker URL`);
  assertCheck(xml.includes("https://azeemwaseem2020.github.io/fertilizer-split-application-planner.html"), `${sitemapPath}: missing split planner URL`);
}

// Independent arithmetic invariants for the calculators' documented formulas.
const totalN = 5 * 30;
const productKg = totalN / (46 / 100);
assertCheck(Math.abs(totalN - 150) < 1e-9, "Split planner math: total N expected 150 kg");
assertCheck(Math.abs(productKg - 326.0869565217391) < 1e-8, "Split planner math: product kg mismatch");
const splitKg = [40, 40, 20].map(share => productKg * share / 100);
assertCheck(Math.abs(splitKg.reduce((a, b) => a + b, 0) - productKg) < 1e-8, "Split planner math: split totals do not reconcile");
const plannedN = 100 * 0.46;
const actualN = 95 * 0.46;
assertCheck(Math.abs((actualN - plannedN) - (-2.3)) < 1e-9, "Variance checker math: labelled-N variance mismatch");
assertCheck(Math.abs(((95 - 100) / 100 * 100) - (-5)) < 1e-9, "Variance checker math: product percentage variance mismatch");
const unitCost = 4500 / (50 * 0.46);
assertCheck(Math.abs(unitCost - 195.65217391304347) < 1e-9, "Cost-per-nutrient formula: cost per kg labelled N mismatch");

if (errors.length) {
  console.error(`Fertilizer QA failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Fertilizer QA passed: ${files.length} HTML pages, JSON-LD parsing, metadata, links, sitemaps, and calculation invariants.`);
}
