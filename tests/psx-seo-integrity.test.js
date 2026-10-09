import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const pages = ['psx-calculator.html','psx-brokerage-commission-calculator.html','psx-portfolio-calculator.html','psx-average-price-calculator.html','psx-position-size-calculator.html','psx-dividend-reinvestment-calculator.html','psx-capital-gains-tax-calculator.html','psx-dividend-yield-calculator.html','psx-investor-calculator-hub.html'];
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

const hub = fs.readFileSync(new URL('psx-investor-calculator-hub.html', root), 'utf8');
const jsonLdScripts = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
const parsedSchemas = jsonLdScripts.map(([, json]) => JSON.parse(json));
const collection = parsedSchemas.find(schema => schema['@type'] === 'CollectionPage');
assert.ok(collection, 'PSX hub: CollectionPage JSON-LD missing');
assert.equal(collection.mainEntity.numberOfItems, collection.mainEntity.itemListElement.length, 'PSX hub: ItemList count must match entries');
assert.equal(collection.mainEntity.itemListElement.length, 8, 'PSX hub: expected eight specific PSX calculators');
for (const item of collection.mainEntity.itemListElement) {
  const file = new URL(item.url).pathname.split('/').pop();
  assert.ok(hub.includes('href="' + file + '"'), 'PSX hub: structured-data item must be linked on page: ' + file);
  assert.ok(sitemap.includes(item.url), 'PSX hub: structured-data item missing from sitemap: ' + file);
}
assert.ok(collection.mainEntity.itemListElement.some(item => item.url.endsWith('/psx-brokerage-commission-calculator.html')), 'PSX hub: brokerage calculator missing from structured data');

const profitPage = fs.readFileSync(new URL('psx-calculator.html', root), 'utf8');
assert.ok(profitPage.includes('<title>PSX Profit Calculator Pakistan | Net P/L &amp; Break-Even | Calcora</title>'), 'PSX profit page: title should preserve the primary profit intent');
assert.ok(profitPage.includes('<h1>PSX Profit Calculator Pakistan — Net Profit, Loss & Break-Even</h1>'), 'PSX profit page: H1 should preserve the primary profit intent');
assert.ok(profitPage.includes('https://www.nccpl.com.pk/cgt'), 'PSX profit page: official NCCPL CGT reference missing');
assert.equal((profitPage.match(/property=['"]og:image:alt['"]/gi) || []).length, 1, 'PSX profit page: Open Graph image alt should not be duplicated');
assert.ok(profitPage.includes('"name":"PSX Profit Calculator Pakistan — Net Profit, Loss & Break-Even"'), 'PSX profit page: WebApplication name should match the page purpose');
assert.ok(profitPage.includes('does not automatically transfer its result'), 'PSX profit page: fee estimator separation must be disclosed near break-even summary');
assert.match(profitPage, /Last updated:\\s*(?:<\\/strong>\\s*)?October 9, 2026/, 'PSX profit page: page information and editorial date should reflect the current revision');


const brokerage = fs.readFileSync(new URL('psx-brokerage-commission-calculator.html', root), 'utf8');
assert.ok(brokerage.includes('https://www.psx.com.pk/psx/resources-and-tools/investors/investor-awareness-guide'), 'Brokerage page: official PSX tariff reference missing');
assert.ok(brokerage.includes('https://www.secp.gov.pk/licensing/capital-markets/agents-and-brokers/'), 'Brokerage page: official SECP broker reference missing');
assert.ok(brokerage.includes('Math.max(v.buyValue*v.buyRate/100,v.buyMin)'), 'Brokerage page: buy-side minimum commission formula missing');
assert.ok(brokerage.includes('pctCandidate*v.sellRate/100>=v.sellMin'), 'Brokerage page: percentage commission break-even branch missing');
assert.ok(brokerage.includes('minCandidate*v.sellRate/100<=v.sellMin'), 'Brokerage page: minimum commission break-even branch missing');

const cgt = fs.readFileSync(new URL('psx-capital-gains-tax-calculator.html', root), 'utf8');
assert.ok(cgt.includes('https://www.nccpl.com.pk/cgt'), 'CGT page: official NCCPL CGT reference missing');
assert.ok(cgt.includes('https://www.fbr.gov.pk/Categ/Income-Tax-Ordinance/326/1000'), 'CGT page: official FBR ordinance reference missing');

const yieldPage = fs.readFileSync(new URL('psx-dividend-yield-calculator.html', root), 'utf8');
assert.ok(yieldPage.includes('https://www.psx.com.pk/psx/resources-and-tools/investors/guide-to-investors'), 'Dividend yield page: official PSX reference missing');

console.log('PSX SEO integrity regression checks: PASS');