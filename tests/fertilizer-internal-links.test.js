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
assert.match(primary, /href="fertilizer-bag-calculator\.html"[^>]*>50 kg bags, whole-bag purchase quantity and estimated cost/);
assert.match(primary, /Last updated: October 9, 2026/);

const blend = fs.readFileSync(new URL('fertilizer-blend-calculator.html', root), 'utf8');
assert.match(blend, /href="fertilizer-bag-calculator\.html"/);
assert.match(blend, /purchase surplus and cost/);

const bags = fs.readFileSync(new URL('fertilizer-bag-calculator.html', root), 'utf8');
assert.match(bags, /href="blog-fertilizer-bags-cost-calculator\.html"/);

const directory = fs.readFileSync(new URL('calculators.html', root), 'utf8');
assert.match(directory, /href="fertilizer-bag-calculator\.html"/);
assert.match(directory, /Fertilizer Bag Calculator/);

console.log('Fertilizer guide-to-calculator and conversion-path checks: PASS (18 guides + 4 core pages)');
