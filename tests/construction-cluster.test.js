const fs=require('node:fs');const assert=require('node:assert/strict');
const pages=['construction-calculators.html','concrete-calculator.html','gravel-calculator.html','mulch-calculator.html','paint-calculator.html','flooring-cost-calculator.html','tile-calculator.html','square-footage-calculator.html'];
const expected=['concrete-calculator.html','gravel-calculator.html','mulch-calculator.html','paint-calculator.html','flooring-cost-calculator.html','tile-calculator.html','square-footage-calculator.html','area-calculator.html','volume-calculator.html'];
for(const page of pages){const html=fs.readFileSync(page,'utf8');assert.match(html,/<link rel="canonical" href="https:\/\/azeemwaseem2020\.github\.io\//,page+' canonical');for(const link of expected){assert.ok(fs.existsSync(link),link+' target exists');if(page!=='construction-calculators.html')assert.ok(html.includes('href="'+link+'"'),page+' links to '+link);} }
const hub=fs.readFileSync('construction-calculators.html','utf8');assert.match(hub,/"@type":"ItemList"/);assert.match(hub,/"numberOfItems":10/);assert.match(hub,/"@type":"BreadcrumbList"/);
for(const page of ['mulch-calculator.html','paint-calculator.html','tile-calculator.html','square-footage-calculator.html']){assert.match(fs.readFileSync(page,'utf8'),/"@type":"BreadcrumbList"/,page+' breadcrumb schema');}
console.log('Construction cluster canonical, cross-link, ItemList and breadcrumb checks passed.');
const concrete = fs.readFileSync('concrete-calculator.html', 'utf8');
assert.match(concrete, /<meta name="author" content="Abdul Qadir">/, 'Concrete calculator should identify its author');
assert.match(concrete, /class="page-author"[\s\S]*?Abdul Qadir[\s\S]*?calculator-methodology\.html/, 'Concrete calculator should show author and methodology links');
assert.match(concrete, /og-image\.png/ , 'Concrete calculator social previews should use the site PNG image');
assert.match(concrete, /"author":\{"@type":"Person","name":"Abdul Qadir"/, 'Concrete WebApplication schema should identify its author');
