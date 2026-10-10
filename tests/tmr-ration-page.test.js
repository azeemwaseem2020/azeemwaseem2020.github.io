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

const feedCalc = fs.readFileSync(new URL('tmr-feed-calculator.html', root), 'utf8');
assert.ok(feedCalc.includes('class="priceUnit"'), 'TMR calculator should let farms choose how feed price is quoted');
assert.ok(feedCalc.includes('<option value="bag40">40 kg bag</option>'), 'TMR calculator should support a common 40 kg feed-bag quote');
assert.ok(feedCalc.includes('<option value="bag50">50 kg bag</option>'), 'TMR calculator should support a 50 kg feed-bag quote');
assert.ok(feedCalc.includes("price/(priceUnits[i]==='bag40'?40:priceUnits[i]==='bag50'?50:1)"), 'TMR cost arithmetic should normalize bag quotes to a per-kg cost');
assert.ok(feedCalc.includes('cost+=kg*pricePerKg[i]'), 'TMR ingredient costs should use normalized price per kg');
for (const id of ['tmr-calculator-tool','species','batch','animals','feed','milkYield','rows','mixStatus','add','example','clearExample','calculate','copy','out']) {
  assert.ok(feedCalc.includes('id="' + id + '"'), 'TMR calculator interface missing required control: ' + id);
}
assert.ok(feedCalc.includes('Estimated feed cost per litre of milk'), 'TMR results should estimate feed cost per litre when milk yield is entered');
assert.ok(feedCalc.includes('enter a price for every ingredient'), 'TMR must not show a misleading total when some ingredient prices are missing');
assert.ok(feedCalc.includes("(hasAllPrices?'Rs '+(kg*pricePerKg[i]).toFixed(2):'—')"), 'Ingredient cost rows should use the normalized price basis');
assert.ok(feedCalc.includes("milkYield=document.getElementById('milkYield')"), 'Milk yield input must be wired to the calculation script');

assert.equal(guide.split('<meta name="author"').length - 1, 1, 'TMR guide should identify its visible author once in metadata');
assert.equal(guide.split('property="og:title"').length - 1, 1, 'TMR guide should have one Open Graph title');
assert.equal(guide.split('property="og:description"').length - 1, 1, 'TMR guide should have one Open Graph description');
assert.equal(guide.split('name="twitter:card"').length - 1, 1, 'TMR guide should have one Twitter card declaration');
assert.ok(guide.includes('"dateModified":"2026-10-09"'), 'TMR guide Article schema should include the verified modification date');
assert.ok(!feedCalc.includes('<h2>Transparency &amp; methodology</h2>'), 'TMR feed page should not repeat a generic transparency panel');
assert.ok(dryMatter.includes('Worked example: calculate actual dry-matter intake'));
assert.ok(dryMatter.includes('108 × 0.35 = 37.8 kg DM'));
assert.ok(dryMatter.includes('37.8 ÷ 20 = 1.89 kg DM per animal'));
assert.ok(!dryMatter.includes('id="calcora-semantic-context"'), 'Dry matter page should not retain thin generic context filler');
assert.ok(feedCost.includes('Illustrative example: cost per kg of dry matter'));
assert.ok(feedCost.includes('PKR 18 ÷ 0.30 = PKR 60/kg DM'));
assert.ok(feedCost.includes('PKR 12 ÷ 0.20 = PKR 60/kg DM'));
assert.ok(feedCost.includes('These figures are examples only—not current Pakistani market quotations'));
assert.ok(!feedCost.includes('id="calcora-semantic-context"'), 'Feed cost page should not retain thin generic context filler');
assert.equal(feedCost.split('id="tmr-cost-quality"').length - 1, 1, 'Feed cost normalization example should have one unique section ID');
console.log('TMR expert-content, metadata and duplication checks: PASS');


const rationCheck = fs.readFileSync(new URL('tmr-check-my-ration.html', root), 'utf8');
assert.match(rationCheck, /<meta name="author" content="Abdul Qadir">/, 'Advanced TMR checker must identify the actual author');
assert.doesNotMatch(rationCheck, /<meta name="author" content="Calcora">/, 'Generic brand name must not replace the named author');
assert.match(rationCheck, /"priceCurrency":"PKR"/, 'TMR checker price currency should match its Pakistan-focused context');
assert.match(rationCheck, /property="og:image"/, 'TMR checker should define an Open Graph image');
assert.match(rationCheck, /name="twitter:card" content="summary_large_image"/, 'TMR checker should use a large social preview card');
assert.match(rationCheck, /Written and maintained by <a href="abdul-qadir\.html" rel="author">Abdul Qadir<\/a>/, 'TMR checker should display its author');
assert.match(rationCheck, /Worked example: weighted crude protein/);
assert.match(rationCheck, /Total dry matter = 540 kg; total crude protein = 67\.4 kg/);
assert.match(rationCheck, /12\.48% of DM/);
assert.match(rationCheck, /does not prove the ration meets an animal’s needs/i, 'Worked example must clearly avoid implying nutritional adequacy');
console.log('Advanced TMR checker trust, currency and weighted-nutrient example checks: PASS');


assert.match(feedCalc, /Last updated:<\/strong> October 10, 2026/, 'Visible TMR feed calculator review date should match the latest content update');
assert.match(feedCalc, /article:modified_time" content="2026-10-10"/, 'TMR feed calculator modification metadata should match its visible review date');
for (const [path, html] of [
  ['tmr-feed-calculator.html', feedCalc],
  ['tmr-dry-matter-calculator.html', dryMatter],
  ['tmr-feed-cost-calculator.html', feedCost],
  ['tmr-check-my-ration.html', rationCheck],
  ['dairy-cow-tmr-ration.html', page],
  ['tmr-calculator-guide.html', guide],
  ['animal-feed-calculator-hub.html', hub]
]) {
  assert.doesNotMatch(html, /<meta name="author" content="Calcora">/, path + ' should not use the brand as its named author');
}
console.log('TMR cluster author identity and freshness consistency checks: PASS');


assert.match(dryMatter, /Updated: October 9, 2026/, 'Dry matter page visible update date should reflect the worked-example revision');
assert.match(dryMatter, /article:modified_time" content="2026-10-09"/, 'Dry matter modification metadata should match visible update date');
assert.match(feedCost, /Updated October 9, 2026/, 'Feed cost page should show a visible update date');
assert.match(feedCost, /article:modified_time" content="2026-10-09"/, 'Feed cost modification metadata should match visible update date');
assert.match(feedCost, /property="og:site_name" content="Calcora"/, 'Feed cost page should identify the site in social metadata');
const clusterPages = [
  ['TMR Feed Calculator', feedCalc],
  ['TMR Dry Matter Calculator', dryMatter],
  ['TMR Feed Cost Calculator', feedCost],
  ['Advanced TMR Check', rationCheck],
  ['Dairy Cow TMR Guide', page],
  ['TMR Calculator Guide', guide],
  ['Animal Feed Hub', hub]
];
const titles = clusterPages.map(([name, html]) => {
  const match = html.match(/<title>(.*?)<\/title>/i);
  assert.ok(match, name + ' must have a title');
  return match[1].replace(/&amp;/g, '&').trim();
});
assert.equal(new Set(titles).size, titles.length, 'TMR cluster pages must have distinct titles');
for (const [name, html] of clusterPages) {
  assert.equal((html.match(/<link rel="canonical"/gi) || []).length, 1, name + ' must have exactly one canonical');
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, name + ' must have exactly one H1');
  assert.match(html, /<meta name="description" content="[^"]{70,160}">/i, name + ' description should be a useful 70–160 character summary');
}
console.log('TMR cluster search-intent metadata, canonicals, H1s and freshness checks: PASS');
