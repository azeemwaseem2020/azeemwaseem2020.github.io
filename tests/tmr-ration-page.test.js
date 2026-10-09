import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const page = fs.readFileSync(new URL('dairy-cow-tmr-ration.html', root), 'utf8');
const hub = fs.readFileSync(new URL('animal-feed-calculator-hub.html', root), 'utf8');
const nav = fs.readFileSync(new URL('calculators.html', root), 'utf8');
const sitemap = fs.readFileSync(new URL('sitemap.xml', root), 'utf8');
const priority = fs.readFileSync(new URL('sitemap-pakistan-priority.xml', root), 'utf8');
const canonical = 'https://azeemwaseem2020.github.io/dairy-cow-tmr-ration.html';

assert.match(page, /<title>Dairy Cow TMR Ration Guide &amp; Calculator \| Calcora Pakistan<\/title>/);
assert.match(page, /<meta name="description"/);
assert.ok(page.includes('<link rel="canonical" href="' + canonical + '">'));
assert.equal((page.match(/<h1\b/gi) || []).length, 1, 'TMR ration page must have exactly one H1');
assert.equal((page.match(/rel="canonical"/gi) || []).length, 1, 'TMR ration page must have exactly one canonical');
assert.match(page, /<html lang="en">/);
assert.match(page, /lang="ur"/);
assert.match(page, /"inLanguage":\["en","ur"\]/);
assert.match(page, /TMR ration for dairy cows/i);
assert.match(page, /silage/i);
assert.match(page, /concentrate/i);
assert.match(page, /wanda/i);
assert.match(page, /feed cost per litre/i);
assert.match(page, /Dry matter \(DM\)/i);
assert.match(page, /daily feed cost ÷ daily milk litres/);
assert.match(page, /does not prescribe one fixed ration for every cow/i);
assert.match(page, /does not prescribe one fixed ration for every cow/i);
assert.ok(page.includes('https://extension.psu.edu/total-mixed-rations-for-dairy-cows'));
assert.ok(page.includes('https://extension.umn.edu/agriculture/animals-and-livestock/dairy/feeding-total-mixed-rations'));
for (const link of ['tmr-feed-calculator.html','tmr-dry-matter-calculator.html','tmr-feed-cost-calculator.html','tmr-check-my-ration.html','animal-feed-calculator-hub.html']) {
  assert.ok(page.includes('href="' + link + '"'), 'TMR ration page missing related internal link: ' + link);
}
assert.ok(sitemap.includes(canonical), 'New page missing from main sitemap');
assert.ok(priority.includes(canonical), 'New page missing from priority sitemap');
assert.ok(hub.includes('href="dairy-cow-tmr-ration.html"'), 'Animal feed hub missing guide link');
assert.ok(nav.includes('href="dairy-cow-tmr-ration.html"'), 'Calculator navigation missing guide link');
const schemas = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(([,json]) => JSON.parse(json));
assert.ok(schemas.some(x => x['@type'] === 'WebPage' && Array.isArray(x.inLanguage) && x.inLanguage.includes('ur') && x.inLanguage.includes('en')), 'Bilingual WebPage structured data missing');
assert.ok(schemas.some(x => x['@type'] === 'BreadcrumbList'), 'BreadcrumbList missing');
const collectionScripts = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(([,json]) => JSON.parse(json));
const collection = collectionScripts.find(x => x['@type'] === 'CollectionPage');
assert.ok(collection, 'Animal feed hub CollectionPage schema missing');
assert.equal(collection.mainEntity.numberOfItems, collection.mainEntity.itemListElement.length, 'Animal feed hub ItemList count mismatch');
assert.ok(collection.mainEntity.itemListElement.some(x => x.url === canonical), 'Animal feed hub schema missing new page');
console.log('Dairy cow TMR ration page checks: PASS');

const dryMatter = fs.readFileSync(new URL('tmr-dry-matter-calculator.html', root), 'utf8');
const feedCost = fs.readFileSync(new URL('tmr-feed-cost-calculator.html', root), 'utf8');
const guide = fs.readFileSync(new URL('tmr-calculator-guide.html', root), 'utf8');
assert.ok(dryMatter.includes('href="dairy-cow-tmr-ration.html"'), 'Dry matter page must link to bilingual dairy TMR context');
assert.ok(feedCost.includes('href="dairy-cow-tmr-ration.html"'), 'Feed cost page must distinguish feed cost per litre and link to the bilingual guide');
assert.ok(guide.includes('href="dairy-cow-tmr-ration.html"'), 'TMR guide must link to the bilingual dairy TMR resource');
assert.equal((feedCost.match(/<meta name="author"/gi) || []).length, 1, 'Feed cost page should not duplicate author metadata');
console.log('TMR cluster intent and internal-link checks: PASS');
