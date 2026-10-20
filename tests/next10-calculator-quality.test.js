import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const pages = [
  "hours-to-days-calculator.html",
  "interest-rate-calculator.html",
  "ellipse-area-calculator.html",
  "distance-between-points-calculator.html",
  "eps-calculator.html",
  "amps-to-watts-calculator.html",
  "days-to-weeks-calculator.html",
  "area-calculator.html",
  "down-payment-calculator.html",
  "kg-to-lb-calculator.html"
];
for (const path of pages) {
  const html = readFileSync(path, "utf8");
  const canonical = "https://azeemwaseem2020.github.io/" + path;
  assert.match(html, /<title[^>]*>[^<]+<\/title>/i, path + ": title");
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, path + ": one H1");
  assert.equal((html.match(/<link[^>]+rel=["']canonical["']/gi) || []).length, 1, path + ": one canonical");
  assert.ok(html.includes(canonical), path + ": canonical URL");
  assert.match(html, /<meta[^>]+name=["']author["'][^>]+content=["']Abdul Qadir["']/i, path + ": author metadata");
  assert.match(html, /property=["']og:title["']/i, path + ": OG title");
  assert.match(html, /property=["']og:description["']/i, path + ": OG description");
  assert.match(html, /name=["']twitter:card["']/i, path + ": Twitter card");
  const blocks = [...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  assert.ok(blocks.length, path + ": JSON-LD");
  let app = false;
  for (const [, raw] of blocks) {
    const schema = JSON.parse(raw.trim());
    if (schema["@type"] === "WebApplication" || schema["@type"] === "SoftwareApplication") {
      app = true;
      assert.equal(schema.url, canonical, path + ": schema canonical");
      assert.equal(schema.author?.name, "Abdul Qadir", path + ": schema author");
      const expectedDate = path === "interest-rate-calculator.html" ? "2026-10-20" : "2026-10-19";
      assert.equal(schema.dateModified, expectedDate, path + ": schema date");
    }
  }
  assert.ok(app, path + ": WebApplication schema");
  for (const [, script] of html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (script.trim()) new vm.Script(script, { filename: path });
  }
}
const sitemap = readFileSync("sitemap.xml", "utf8");
for (const path of pages) {
  const expectedLastmod = path === "interest-rate-calculator.html" ? "2026-10-20" : "2026-10-19";
  assert.ok(sitemap.includes("<loc>https://azeemwaseem2020.github.io/" + path + "</loc><lastmod>" + expectedLastmod + "</lastmod>"), path + ": sitemap lastmod");
}
const amps = readFileSync("amps-to-watts-calculator.html", "utf8");
assert.match(amps, /id=['"]pf['"]/i, "amps-to-watts: power factor input");
assert.match(amps, /real=apparent\*pf/, "amps-to-watts: power factor used");
const kg = readFileSync("kg-to-lb-calculator.html", "utf8");
assert.match(kg, /x<0/, "kg-to-lb: rejects negative mass");
const ellipse = readFileSync("ellipse-area-calculator.html", "utf8");
assert.match(ellipse, /a>0&&b>0/, "ellipse: positive semi-axis validation");
console.log("Next-10 calculator quality regression checks: PASS (10 pages)");
