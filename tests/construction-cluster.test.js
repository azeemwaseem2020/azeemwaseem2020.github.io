const fs=require('node:fs');const assert=require('node:assert/strict');
const pages=['construction-calculators.html','concrete-calculator.html','gravel-calculator.html','mulch-calculator.html','paint-calculator.html','flooring-cost-calculator.html','tile-calculator.html','square-footage-calculator.html'];
const expected=['concrete-calculator.html','gravel-calculator.html','mulch-calculator.html','paint-calculator.html','flooring-cost-calculator.html','tile-calculator.html','square-footage-calculator.html','area-calculator.html','volume-calculator.html'];
for(const page of pages){const html=fs.readFileSync(page,'utf8');assert.match(html,/<link rel="canonical" href="https:\/\/azeemwaseem2020\.github\.io\//,page+' canonical');for(const link of expected){assert.ok(fs.existsSync(link),link+' target exists');if(page!=='construction-calculators.html')assert.ok(html.includes('href="'+link+'"'),page+' links to '+link);} }
const hub=fs.readFileSync('construction-calculators.html','utf8');assert.match(hub,/"@type":"ItemList"/);assert.match(hub,/"numberOfItems":9/);assert.match(hub,/"@type":"BreadcrumbList"/);
for(const page of ['mulch-calculator.html','paint-calculator.html','tile-calculator.html','square-footage-calculator.html']){assert.match(fs.readFileSync(page,'utf8'),/"@type":"BreadcrumbList"/,page+' breadcrumb schema');}
const gravel=fs.readFileSync('gravel-calculator.html','utf8');
assert.match(gravel, /name="author" content="Abdul Qadir"/, 'Gravel page should identify the author consistently');
assert.match(gravel, /name="twitter:title"/, 'Gravel page should include a Twitter title');
assert.match(gravel, /name="twitter:description"/, 'Gravel page should include a Twitter description');
assert.ok(gravel.includes('"name":"Construction Calculators","item":"https://azeemwaseem2020.github.io/construction-calculators.html"'), 'Gravel breadcrumb should reflect the construction cluster');
assert.doesNotMatch(gravel, /"name":"Utility Calculators"/, 'Gravel breadcrumb should not point to an unrelated utility hub');
const flooring=fs.readFileSync('flooring-cost-calculator.html','utf8');
assert.doesNotMatch(flooring, /id="calcora-semantic-context"/, 'Flooring page should not contain generic semantic filler');
const paint=fs.readFileSync('paint-calculator.html','utf8');
assert.match(paint, /id="paint-unit-conversion"/, 'Paint page should explain metric label conversion for the US-unit calculator');
assert.match(paint, /coverage in ft² per US gallon ≈ coverage in m²\/L × 40\.745/, 'Paint guide should provide a transparent unit conversion');
assert.doesNotMatch(paint, /<h2>How paint quantity is estimated<\/h2>/, 'Paint page should avoid the removed repetitive generic section');
for(const link of ['construction-calculators.html','square-footage-calculator.html','flooring-cost-calculator.html','tile-calculator.html','volume-calculator.html']) {
  assert.ok(paint.includes('href="'+link+'"'), 'Paint page should link to relevant construction tool '+link);
}
console.log('Construction cluster canonical, cross-link, ItemList and breadcrumb checks passed.');