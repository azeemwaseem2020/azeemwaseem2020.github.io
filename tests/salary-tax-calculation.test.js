import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../pakistan-salary-tax-calculator.html', import.meta.url), 'utf8');
const match = html.match(/function calculateTax\(x\) \{([\s\S]*?)\n  \}\n  function calc\(\)/);
assert.ok(match, 'Salary tax calculation function must be extractable for regression testing');
const calculateTax = new Function('x', match[1]);

const cases = [
  [0, 0, 0],
  [600000, 0, 0],
  [600001, 0.01, 1],
  [1200000, 6000, 1],
  [1200001, 6000.11, 11],
  [1500000, 39000, 11],
  [2200000, 116000, 11],
  [2200001, 116000.2, 20],
  [2400000, 156000, 20],
  [3200000, 316000, 20],
  [4100000, 541000, 25],
  [5600000, 976000, 29],
  [7000000, 1424000, 32],
  [7000001, 1424000.35, 35]
];
for (const [income, expectedTax, expectedRate] of cases) {
  const result = calculateTax(income);
  assert.ok(Math.abs(result.tax - expectedTax) < 0.001,
    'Wrong annual tax at PKR ' + income + ': expected ' + expectedTax + ', got ' + result.tax);
  assert.equal(result.rate, expectedRate, 'Wrong marginal rate at PKR ' + income);
}

for (const [income, expectedTax] of [[1200000, 6000], [1500000, 39000], [2200000, 116000], [2400000, 156000]]) {
  assert.ok(html.includes('PKR ' + income.toLocaleString('en-US')),
    'Page should document the taxable-income example PKR ' + income);
  assert.ok(html.includes('PKR ' + expectedTax.toLocaleString('en-US')),
    'Page should document the matching tax amount PKR ' + expectedTax);
}
assert.match(html, /does not verify whether salary income exceeds 75%/i,
  'Calculator must disclose the salaried-person eligibility limitation');

const slabs = fs.readFileSync(new URL('../pakistan-income-tax-slabs-2026-27.html', import.meta.url), 'utf8');
assert.match(slabs, /"dateModified":"2026-10-09"/,
  'Tax slab reference should expose its verified update date in structured data');
assert.match(slabs, /article:modified_time" content="2026-10-09"/,
  'Tax slab reference should expose its modified time for sharing metadata');
assert.match(slabs, /Last reviewed:<\/strong> 9 October 2026/i,
  'Tax slab reference should show a visible review date');
console.log('Salary tax calculation and freshness regression tests passed.');
