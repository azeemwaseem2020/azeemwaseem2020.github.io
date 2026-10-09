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
assert.match(primary, /Last updated:<\/strong> October 9, 2026/);

assert.match(blend, /href="fertilizer-bag-calculator\.html"/);
assert.match(blend, /purchase surplus and cost/);

const bags = fs.readFileSync(new URL('fertilizer-bag-calculator.html', root), 'utf8');
assert.match(bags, /href="blog-fertilizer-bags-cost-calculator\.html"/);

const directory = fs.readFileSync(new URL('calculators.html', root), 'utf8');
assert.match(directory, /href="fertilizer-bag-calculator\.html"/);
assert.match(directory, /Fertilizer Bag Calculator/);

console.log('Fertilizer guide-to-calculator and conversion-path checks: PASS (18 guides + 4 core pages)');
