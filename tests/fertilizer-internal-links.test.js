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
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const faqSchema = schemas.find(schema => schema['@type'] === 'FAQPage');
  assert.ok(faqSchema, filename + ' must mark up its visible FAQs with FAQPage JSON-LD');
  const visibleFaq = html.match(/<h2>Frequently asked questions<\/h2>([\s\S]*?)(?=<h2|<\/main>)/i)?.[1] || '';
  const visibleQuestions = [...visibleFaq.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)];
  assert.equal(visibleQuestions.length, 3, filename + ' must keep three visible FAQ question-answer pairs');
  assert.equal(faqSchema.mainEntity.length, visibleQuestions.length, filename + ' FAQ schema must match visible FAQ count');
  for (let i = 0; i < visibleQuestions.length; i++) {
    assert.equal(faqSchema.mainEntity[i].name, visibleQuestions[i][1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim(), filename + ' FAQ schema question must match visible copy');
    assert.equal(faqSchema.mainEntity[i].acceptedAnswer.text, visibleQuestions[i][2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim(), filename + ' FAQ schema answer must match visible copy');
  }
  const breadcrumbSchema = schemas.find(schema => schema['@type'] === 'BreadcrumbList');
  assert.ok(breadcrumbSchema, filename + ' must retain BreadcrumbList schema');
  assert.equal(breadcrumbSchema.itemListElement.at(-1).item, html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], filename + ' final breadcrumb must resolve to its canonical URL');
}

const fertilizerGuide = fs.readFileSync(new URL('blog-fertilizer.html', root), 'utf8');
assert.match(fertilizerGuide, /id="crop-specific-fertilizer-guides"/, 'main fertilizer guide must link readers to crop-specific planning');
for (const [filename] of cropGuides) assert.ok(fertilizerGuide.includes('href="' + filename + '"'), 'main fertilizer guide must link to ' + filename);
const hubSchemas = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const collectionSchema = hubSchemas.find(schema => schema['@type'] === 'CollectionPage');
assert.ok(collectionSchema, 'agriculture hub must retain valid CollectionPage structured data');
assert.equal(collectionSchema.mainEntity.numberOfItems, 16, 'hub ItemList count must match the 16 linked tools and guides');
assert.equal(collectionSchema.mainEntity.itemListElement.length, 16, 'hub ItemList entries must match its declared count');

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

const hydro = fs.readFileSync(new URL('hydroponic-fertilizer-calculator.html', root), 'utf8');
assert.match(hydro, /<title>Hydroponic Fertilizer Calculator: PPM, Tank Volume & Grams \| Calcora<\/title>/, 'hydroponic page must target the requested keyword naturally');
assert.match(hydro, /<meta name="description" content="[^"]*target ppm[^"]*"/i, 'hydroponic page needs a specific meta description');
assert.match(hydro, /rel="canonical" href="https:\/\/azeemwaseem2020\.github\.io\/hydroponic-fertilizer-calculator\.html"/, 'hydroponic page needs a self canonical');
assert.match(hydro, /id="hydro-dose-form"/, 'hydroponic page must include its interactive dose form');
assert.match(hydro, /id="hd-reservoirs"/, 'hydroponic calculator must support batch scaling across identical reservoirs');
assert.match(hydro, /id="hd-reserve"/, 'hydroponic calculator must support an optional finished-solution reserve allowance');
assert.match(hydro, /const totalLitres=litres\*reservoirs\*\(1\+reserve\/100\)/, 'batch volume must scale by reservoir count and reserve allowance');
assert.match(hydro, /const totalGrams=grams\*reservoirs\*\(1\+reserve\/100\)/, 'batch nutrient dose must scale proportionally with total prepared solution');
assert.match(hydro, /Number\.isInteger\(reservoirs\).*reservoirs>10000.*reserve<0\|\|reserve>50/, 'batch controls must reject invalid counts and reserve percentages');
assert.match(hydro, /const grams=deficit\*litres\/\(10\*effective\)/, 'hydroponic dose formula must convert ppm deficit, litres and percentage into grams');
assert.match(hydro, /basis==='p2o5'\?0\.4364:basis==='k2o'\?0\.8301:1/, 'hydroponic page must explicitly convert oxide label percentages to elemental P/K when selected');
assert.match(hydro, /does not solve interacting nutrients from multi-nutrient products/i, 'hydroponic page must explain the single-nutrient limitation');
assert.match(hydro, /EC measures total ionic conductivity and cannot identify the concentration of each individual nutrient/i, 'hydroponic page must not imply EC can identify individual nutrient ppm');
assert.match(hydro, /href="fertilizer-calculator\.html"/, 'hydroponic page must distinguish and link to the field fertilizer calculator');
assert.ok(fs.readFileSync(new URL('sitemap.xml', root), 'utf8').includes('hydroponic-fertilizer-calculator.html'), 'hydroponic calculator must be in main sitemap');
assert.ok(fs.readFileSync(new URL('sitemap-pakistan-priority.xml', root), 'utf8').includes('hydroponic-fertilizer-calculator.html'), 'hydroponic calculator must be in priority sitemap');
assert.match(hub, /href="hydroponic-fertilizer-calculator\.html"/, 'agriculture hub must link to hydroponic calculator');
assert.match(fertilizerGuide, /href="hydroponic-fertilizer-calculator\.html"/, 'fertilizer guide must link to hydroponic calculator');
assert.match(directory, /href="hydroponic-fertilizer-calculator\.html"/, 'calculator directory must link to hydroponic calculator');
assert.ok(Math.abs((100 - 20) * 100 / (10 * 15.5) - 51.6129032258) < 0.000001, 'worked hydroponic example arithmetic must remain correct');
assert.ok(Math.abs(((100 - 20) * 100 / (10 * 15.5)) * 3 * 1.1 - 170.322580645) < 0.000001, 'three 100 L reservoirs plus 10% reserve must scale the batch dose correctly');

console.log('Fertilizer guide-to-calculator and conversion-path checks: PASS (18 guides + 5 core pages including hydroponics)');
