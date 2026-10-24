import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const pages = [
  "rectangle-area-calculator.html",
  "rectangular-prism-volume-calculator.html",
  "water-intake-calculator.html",
  "root-calculator.html",
  "markup-from-margin-calculator.html",
  "slope-calculator.html",
  "roof-pitch-calculator.html",
  "square-footage-calculator.html",
  "target-heart-rate-calculator.html",
  "sphere-volume-calculator.html",
];

const sitemap = readFileSync("sitemap.xml", "utf8");
for (const path of pages) {
  const html = readFileSync(path, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const descriptions = [...html.matchAll(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/gi)];
  const schemas = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  const canonicalCount = [...html.matchAll(/<link\s+rel=["']canonical["']/gi)].length;
  const scriptBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];

  assert.ok(title.trim().length > 15, `${path}: descriptive title required`);
  assert.ok(canonical, `${path}: canonical URL required`);
  assert.equal(canonicalCount, 1, `${path}: exactly one canonical tag required`);
  assert.equal(h1Count, 1, `${path}: exactly one H1 required`);
  assert.equal(descriptions.length, 1, `${path}: exactly one meta description required`);
  assert.match(html, /<meta\s+name=["']author["']\s+content=["']Abdul Qadir["']/i, `${path}: author metadata missing`);
  assert.match(html, /<meta\s+property=["']og:title["']/i, `${path}: Open Graph title missing`);
  assert.match(html, /<meta\s+name=["']twitter:card["']/i, `${path}: Twitter card metadata missing`);
  assert.ok(schemas.length >= 1, `${path}: JSON-LD schema missing`);

  const parsedSchemas = schemas.map(schemaMatch => JSON.parse(schemaMatch[1]));
  const appSchema = parsedSchemas.find(schema => schema["@type"] === "WebApplication");
  assert.ok(appSchema, `${path}: WebApplication schema missing`);
  assert.equal(appSchema.url, canonical, `${path}: WebApplication schema URL must match canonical`);
  assert.equal(appSchema.author?.name, "Abdul Qadir", `${path}: WebApplication schema author mismatch`);

  let executableScripts = 0;
  for (const [, attrs, source] of scriptBlocks) {
    if (/application\/ld\+json/i.test(attrs) || /text\/json/i.test(attrs)) continue;
    if (!source.trim()) continue;
    new vm.Script(source, { filename: `${path} inline script` });
    executableScripts++;
  }
  assert.ok(executableScripts > 0, `${path}: no executable inline script found`);

  const sitemapEntry = sitemap.split("<url>").map(entry => entry.split("</url>")[0]).find(entry => entry.includes(`<loc>${canonical}</loc>`));
  assert.ok(sitemapEntry, `${path}: canonical URL missing from sitemap`);
  const lastmod = sitemapEntry.match(/<lastmod>(\\d{4}-\\d{2}-\\d{2})<\\/lastmod>/)?.[1];
  assert.ok(lastmod, `${path}: sitemap lastmod missing`);
  assert.ok(!Number.isNaN(Date.parse(lastmod)), `${path}: invalid sitemap lastmod`);
  assert.ok(lastmod <= new Date().toISOString().slice(0, 10), `${path}: sitemap lastmod is in the future`);
}

console.log(`Top-10 thin-page SEO and inline-JavaScript syntax checks: PASS (${pages.length} pages)`);
