import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = path.join(root, "sitemap.xml");
assert.ok(fs.existsSync(sitemapPath), "sitemap.xml must exist");

const xml = fs.readFileSync(sitemapPath, "utf8");
assert.match(xml, /^<\?xml version=["']1\.0["'] encoding=["']UTF-8["']\?>/i, "XML declaration missing");
assert.match(xml, /<urlset\b[^>]*xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']/i, "Sitemap namespace missing");
assert.match(xml, /<\/urlset>\s*$/, "Sitemap root must close cleanly");

const entries = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)];
assert.ok(entries.length > 0, "No valid URL entries found");
assert.equal((xml.match(/<url>/g) || []).length, entries.length, "Every URL entry must contain exactly one loc and lastmod in the expected structure");

const seen = new Set();
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
for (const [, rawUrl, lastmod] of entries) {
  const url = new URL(rawUrl);
  assert.equal(url.protocol, "https:", `Expected HTTPS URL: ${rawUrl}`);
  assert.equal(url.hostname, "azeemwaseem2020.github.io", `Unexpected sitemap hostname: ${rawUrl}`);
  assert.equal(url.search, "", `Sitemap URL must not include query parameters: ${rawUrl}`);
  assert.equal(url.hash, "", `Sitemap URL must not include fragments: ${rawUrl}`);
  assert.ok(!seen.has(url.href), `Duplicate sitemap URL: ${url.href}`);
  seen.add(url.href);

  assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, `Invalid lastmod format for ${rawUrl}`);
  const parsed = new Date(`${lastmod}T00:00:00Z`);
  assert.ok(!Number.isNaN(parsed.getTime()), `Invalid lastmod date for ${rawUrl}`);
  assert.equal(parsed.toISOString().slice(0, 10), lastmod, `Impossible lastmod date for ${rawUrl}`);
  assert.ok(parsed <= today, `Future lastmod date for ${rawUrl}`);

  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const target = path.resolve(root, relative);
  assert.ok(target.startsWith(root + path.sep) || target === path.join(root, "index.html"), `Unsafe sitemap path: ${rawUrl}`);
  assert.ok(fs.existsSync(target), `Sitemap URL points to a missing local file: ${relative}`);
  assert.ok(fs.statSync(target).isFile(), `Sitemap target is not a file: ${relative}`);
}

console.log(`Sitemap integrity regression checks: PASS (${entries.length} unique URLs)`);
