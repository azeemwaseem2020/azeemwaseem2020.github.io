import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const pages = ['psx-calculator.html','psx-brokerage-commission-calculator.html','psx-portfolio-calculator.html','psx-average-price-calculator.html','psx-position-size-calculator.html','psx-dividend-reinvestment-calculator.html'];
const sitemap = fs.readFileSync(new URL('sitemap.xml', root), 'utf8');

for (const file of pages) {
  const html = fs.readFileSync(new URL(file, root), 'utf8');
  const canonical = 'https://azeemwaseem2020.github.io/' + file;
  const title = (html.match(/<title>([^<]+)<\/title>/i) || ['', ''])[1];
  const description = (html.match(/<meta\s+name=['"]description['"]\s+content=['"]([^'"]+)/i) || ['', ''])[1];
  assert(title.length >= 25 && title.length <= 75, file + ': title length');
  assert(description.length >= 80 && description.length <= 180, file + ': description length');
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, file + ': exactly one H1');
  assert.equal((html.match(/rel=['"]canonical['"]/gi) || []).length, 1, file + ': exactly one canonical');
  assert.ok(html.includes(canonical), file + ': canonical URL missing');
  assert.doesNotMatch(html, /<meta[^>]+name=['"]robots['"][^>]+content=['"][^'"]*noindex/i);
  assert.match(html, /Abdul Qadir/i);
  assert.match(html, /BreadcrumbList/);
  assert.ok(sitemap.includes(canonical), file + ': missing from sitemap');
}

console.log('PSX SEO integrity regression checks: PASS');