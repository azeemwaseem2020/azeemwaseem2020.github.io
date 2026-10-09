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

const hubCollection = collection;
const expectedTmrUrls = [
  'tmr-feed-calculator.html',
  'tmr-dry-matter-calculator.html',
  'tmr-feed-cost-calculator.html',
  'tmr-check-my-ration.html',
  'dairy-cow-tmr-ration.html'
].map(path => 'https://azeemwaseem2020.github.io/' + path);
assert.deepEqual(hubCollection.mainEntity.itemListElement.map(x => x.url), expectedTmrUrls, 'Hub schema should list only the relevant visible TMR tools');
assert.equal((hub.match(/name="twitter:card"/gi) || []).length, 1, 'Hub should contain one Twitter card declaration');
assert.equal((hub.match(/name="twitter:image"/gi) || []).length, 1, 'Hub should contain one Twitter image declaration');
assert.match(guide, /Why moisture testing matters on a dairy farm/);
assert.doesNotMatch(guide, /practical SEO topic|Searchers often arrive with a simple question/i, 'Reader-facing guide should not expose SEO-oriented editorial copy');
console.log('TMR hub schema relevance and reader-first content checks: PASS');

assert.equal(guide.split('<meta name="author"').length - 1, 1, 'TMR guide should identify its visible author once in metadata');
assert.equal(guide.split('property="og:title"').length - 1, 1, 'TMR guide should have one Open Graph title');
assert.equal(guide.split('property="og:description"').length - 1, 1, 'TMR guide should have one Open Graph description');
assert.equal(guide.split('name="twitter:card"').length - 1, 1, 'TMR guide should have one Twitter card declaration');
assert.ok(guide.includes('"dateModified":"2026-10-09"'), 'TMR guide Article schema should include the verified modification date');
assert.ok(!feed.includes('<h2>Transparency &amp; methodology</h2>'), 'TMR feed page should not repeat a generic transparency panel');
assert.ok(dm.includes('Worked example: calculate actual dry-matter intake'));
assert.ok(dm.includes('108 × 0.35 = 37.8 kg DM'));
assert.ok(dm.includes('37.8 ÷ 20 = 1.89 kg DM per animal'));
assert.ok(!dm.includes('id="calcora-semantic-context"'), 'Dry matter page should not retain thin generic context filler');
assert.ok(cost.includes('Illustrative example: cost per kg of dry matter'));
assert.ok(cost.includes('PKR 18 ÷ 0.30 = PKR 60/kg DM'));
assert.ok(cost.includes('PKR 12 ÷ 0.20 = PKR 60/kg DM'));
assert.ok(cost.includes('These figures are examples only—not current Pakistani market quotations'));
assert.ok(!cost.includes('id="calcora-semantic-context"'), 'Feed cost page should not retain thin generic context filler');
assert.equal(cost.split('id="tmr-cost-quality"').length - 1, 1, 'Feed cost normalization example should have one unique section ID');
console.log('TMR expert-content, metadata and duplication checks: PASS');
