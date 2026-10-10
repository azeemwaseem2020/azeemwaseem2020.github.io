import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const fertilizerGuides = [
  'blog-fertilizer.html',
  'blog-urea-fertilizer-calculator.html',
  'blog-dap-fertilizer-calculator.html',
  'blog-npk-fertilizer-calculator.html',
  'blog-mop-potash-fertilizer-calculator.html',
  'blog-fertilizer-bags-cost-calculator.html',
  'blog-fertilizer-acre-hectare-conversion.html',
  'blog-fertilizer-blending-math.html',
  'blog-fertilizer-cost-per-nutrient.html',
  'blog-fertilizer-label-reading-guide.html',
  'blog-fertilizer-nutrient-deficit-surplus.html',
  'blog-fertilizer-p2o5-k2o-conversion.html',
  'blog-fertilizer-soil-test-guide.html',
  'blog-fertilizer-split-application.html',
  'blog-fertilizer-spreader-calibration.html',
  'blog-fertilizer-ssp-calculator.html',
  'blog-fertilizer-tsp-calculator.html',
  'blog-fertilizer-uan-calculator.html'
];

for (const filename of fertilizerGuides) {
  const html = fs.readFileSync(new URL(filename, root), 'utf8');
  assert.match(html, /href="fertilizer-calculator\.html"/, filename + ' must link to the primary fertilizer calculator');
  assert.match(html, /href="fertilizer-bag-calculator\.html"/, filename + ' must link to the bag quantity calculator');
  assert.match(html, /<main\b[\s\S]*<\/main>/, filename + ' must retain its main content');
}

const hub = fs.readFileSync(new URL('agriculture-fertilizer-hub.html', root), 'utf8');
assert.match(hub, /href="fertilizer-calculator\.html"/);
assert.match(hub, /href="fertilizer-bag-calculator\.html"/);
assert.match(hub, /href="fertilizer-blend-calculator\.html"/);
for (const [slug, crop] of [
  ['wheat-fertilizer-calculator-pakistan.html', 'wheat'],
  ['cotton-fertilizer-calculator-pakistan.html', 'cotton'],
  ['rice-fertilizer-calculator-pakistan.html', 'rice'],
  ['sugarcane-fertilizer-calculator-pakistan.html', 'sugarcane'],
  ['maize-fertilizer-calculator-pakistan.html', 'maize']
]) {
  const page = fs.readFileSync(new URL(slug, root), 'utf8');
  assert.match(hub, new RegExp('href="' + slug.replace(/[.*+?^\{}()|[\]\\]/g, '\\assert.match(hub, /href="fertilizer-blend-calculator\.html"/);') + '"'), crop + ' guide must be linked from agriculture hub');
  assert.match(page, /<h1[^>]*>[^<]+<\/h1>/, crop + ' guide must have one readable primary heading');
  assert.match(page, /rel="canonical" href="https:\/\/azeemwaseem2020\.github\.io\//, crop + ' guide must have an absolute canonical');
  assert.match(page, /"@type":"Article"/, crop + ' guide must have Article structured data');
  assert.match(page, /"@type":"BreadcrumbList"/, crop + ' guide must have breadcrumb structured data');
  assert.match(page, /Frequently asked questions/, crop + ' guide must answer practical FAQs');
  assert.match(page, /soil-test|soil test/i, crop + ' guide must distinguish arithmetic from soil-specific advice');
}


const cropGuides = [
  ['wheat-fertilizer-calculator-pakistan.html', /wheat/i],
  ['cotton-fertilizer-calculator-pakistan.html', /cotton/i],
  ['rice-fertilizer-calculator-pakistan.html', /rice/i],
  ['sugarcane-fertilizer-calculator-pakistan.html', /sugarcane/i],
  ['maize-fertilizer-calculator-pakistan.html', /maize/i]
];
const cropSitemap = fs.readFileSync(new URL('sitemap.xml', root), 'utf8');
const prioritySitemap = fs.readFileSync(new URL('sitemap-pakistan-priority.xml', root), 'utf8');
for (const [filename, topic] of cropGuides) {
  const html = fs.readFileSync(new URL(filename, root), 'utf8');
  const visible = html.replace(/<script[\s\S]*?script>/gi, ' ').replace(/<style[\s\S]*?style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ');
  assert.match(html, /<title>[^<]+<\/title>/, filename + ' needs a descriptive title');
  assert.match(html, /<meta name="description" content="[^"]{70,170}">/, filename + ' needs a useful meta description');
  assert.match(html, /<link rel="canonical" href="https:\/\/azeemwaseem2020\.github\.io\//, filename + ' needs an absolute canonical');
  assert.match(html, /<meta name="author" content="Abdul Qadir">/, filename + ' must identify the site author consistently');
  assert.match(html, /href="fertilizer-calculator\.html"/, filename + ' must link to the primary calculation tool');
  assert.match(html, /href="agriculture-fertilizer-hub\.html"/, filename + ' must link back to the agriculture hub');
  assert.match(html, /sfri\.punjab\.gov\.pk/, filename + ' must cite a relevant Punjab agriculture source');
  assert.match(html, topic, filename + ' must include its crop topic');
  assert.ok(visible.trim().split(/\s+/).length >= 450, filename + ' needs substantial, crop-specific visible content');
  assert.ok(cropSitemap.includes(filename), filename + ' must be present in the main sitemap');
  assert.ok(prioritySitemap.includes(filename), filename + ' must be present in the Pakistan-priority sitemap');
}

const fertilizerGuide = fs.readFileSync(new URL('blog-fertilizer.html', root), 'utf8');
assert.match(fertilizerGuide, /id="crop-specific-fertilizer-guides"/, 'main fertilizer guide must link readers to crop-specific planning');
for (const [filename] of cropGuides) assert.ok(fertilizerGuide.includes('href="' + filename + '"'), 'main fertilizer guide must link to ' + filename);
const hubSchemas = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const collectionSchema = hubSchemas.find(schema => schema['@type'] === 'CollectionPage');
assert.ok(collectionSchema, 'agriculture hub must retain valid CollectionPage structured data');
assert.equal(collectionSchema.mainEntity.numberOfItems, 15, 'hub ItemList count must match the 15 linked tools and guides');
assert.equal(collectionSchema.mainEntity.itemListElement.length, 15, 'hub ItemList entries must match its declared count');

assert.match(hub, /id="crop-specific-fertilizer-planning"/, 'hub must expose the dedicated crop guide cluster');
for (const [filename] of cropGuides) assert.ok(hub.includes('href="' + filename + '"'), 'hub must link to ' + filename);

const primary = fs.readFileSync(new URL('fertilizer-calculator.html', root), 'utf8');
assert.doesNotMatch(primary, /<h2>Transparency &amp; methodology<\/h2>/i, 'remove generic duplicate transparency section');
assert.doesNotMatch(primary, /<h2>Accuracy and safety note<\/h2>/i, 'avoid repeating the same application caveat');
assert.match(primary, /id="fertilizer-calculation-transparency"/, 'retain the specific fertilizer input and soil-context explanation');
assert.match(primary, /Punjab Agriculture/, 'retain the authoritative local soil-testing reference');

const blend = fs.readFileSync(new URL('fertilizer-blend-calculator.html', root), 'utf8');
assert.doesNotMatch(blend, /id="calculation-transparency"/, 'remove the duplicate blend disclaimer section');
assert.doesNotMatch(blend, /id="calcora-semantic-context"/, 'remove thin generic semantic filler');
assert.match(blend, /id="blend-precision-notes"/, 'retain the useful precision and rounding explanation');
assert.match(blend, /id="blend-field-notes"/, 'retain the specific field-practice content');

const hubContent = fs.readFileSync(new URL('agriculture-fertilizer-hub.html', root), 'utf8');
assert.doesNotMatch(hubContent, /<h2>Transparency &amp; source<\/h2>/i, 'remove generic trust panel from the hub');
assert.match(hubContent, /id="fertilizer-verification"/, 'retain the practical field verification workflow');

assert.match(primary, /href="fertilizer-bag-calculator\.html"[^>]*>50 kg bags, whole-bag purchase quantity and estimated cost/);
assert.match(primary, /Last updated:<\/strong> October 10, 2026/);
assert.match(primary, /<option value="acre" selected>Acres<\/option><option value="kanal">Kanal<\/option><option value="ha">Hectares \(ha\)<\/option>/, 'default to Pakistan-relevant acres and support kanal and hectare units');
assert.match(primary, /1 acre = 8 kanal/, 'explain the acre-to-kanal conversion for Pakistan field planning');
assert.match(primary, /areaUnit\.value==='kanal'\?'kanal'/, 'render rates and result summaries using the selected kanal unit');
assert.match(primary, /function allocate\(n\)\{const key=n\.toUpperCase\(\),candidates=active\.filter\(v=>v\[n\]>0\);if\(!candidates\.length\|\|rem\[key\]<=0\)return;/, 'target planner must map lower-case product fields to upper-case nutrient target keys');
assert.match(primary, /items\.filter\(x=>x\.r>0\)\.every\(x=>x\.price!==null\)\?money\(cost\):'Enter all prices'/, 'do not present a partial product-price sum as the total plan cost');
assert.match(primary, /x\.price!==null\?x\.wholeBags\*x\.price:0/, 'an explicitly entered zero price is valid and must not be treated as missing');
assert.match(primary, /x\.price!==null\?money\(x\.cost\):'Enter price'/, 'each unpriced product must be clearly identified in the results');
assert.match(primary, /items\.filter\(x=>x\.r>0\)\.every\(x=>x\.price!==null\)\?money\(cost\):'Incomplete—enter all prices'/, 'copied result summary must not report a partial cost as a total');
assert.equal((primary.match(/"featureList"\s*:/g) || []).length, 1, 'SoftwareApplication schema must not repeat the featureList key');
assert.match(primary, /article:modified_time" content="2026-10-10"/, 'fertilizer modification metadata must match the visible update date');

assert.match(blend, /href="fertilizer-bag-calculator\.html"/);
assert.match(blend, /purchase surplus and cost/);

const bags = fs.readFileSync(new URL('fertilizer-bag-calculator.html', root), 'utf8');
assert.match(bags, /href="blog-fertilizer-bags-cost-calculator\.html"/);

const directory = fs.readFileSync(new URL('calculators.html', root), 'utf8');
assert.match(directory, /href="fertilizer-bag-calculator\.html"/);
assert.match(directory, /Fertilizer Bag Calculator/);

console.log('Fertilizer guide-to-calculator and conversion-path checks: PASS (18 guides + 4 core pages)');
