import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../pakistan-salary-tax-calculator.html', import.meta.url), 'utf8');
const match = html.match(/const tax = \(x, y\) => \{([\s\S]*?)\n  \};\n  function grossForNet/);
assert.ok(match, 'Tax engine must expose a testable two-year slab function');
const calculateTax = new Function('x', 'y', match[1]);

const currentYearCases = [
  [0, 0], [600000, 0], [600001, 0.01], [1200000, 6000],
  [1200001, 6000.11], [1500000, 39000], [2200000, 116000],
  [2200001, 116000.2], [2400000, 156000], [3200000, 316000],
  [4100000, 541000], [5600000, 976000], [7000000, 1424000],
  [7000001, 1424000.35]
];
for (const [income, expectedTax] of currentYearCases) {
  const result = calculateTax(income, '2026');
  assert.ok(Math.abs(result - expectedTax) < 0.001,
    'Wrong FY 2026–27 tax at PKR ' + income + ': expected ' + expectedTax + ', got ' + result);
}

const priorYearCases = [
  [0, 0], [600000, 0], [600001, 0.01], [1200000, 6000],
  [1500000, 39000], [2200000, 116000], [2200001, 116000.23],
  [3200000, 346000], [4100000, 616000], [10000000, 2681000],
  [10000001, 2922290.3815]
];
for (const [income, expectedTax] of priorYearCases) {
  const result = calculateTax(income, '2025');
  assert.ok(Math.abs(result - expectedTax) < 0.01,
    'Wrong FY 2025–26 tax at PKR ' + income + ': expected ' + expectedTax + ', got ' + result);
}

const marginalMatch = html.match(/function marginalRate\(x, y\) \{([\s\S]*?)\n  \}\n  function grossForNet/);
assert.ok(marginalMatch, 'Marginal-rate helper must be available for boundary testing');
const marginalRate = new Function('x', 'y', marginalMatch[1]);
for (const [income, expected] of [[600000,0],[600001,1],[2200000,11],[2200001,20],[4100000,25],[4100001,29],[5600001,32],[7000001,35]]) {
  assert.equal(marginalRate(income, '2026'), expected, 'Wrong current-year marginal rate at PKR ' + income);
}
for (const [income, expected] of [[2200001,23],[3200001,30],[4100001,35]]) {
  assert.equal(marginalRate(income, '2025'), expected, 'Wrong prior-year marginal rate at PKR ' + income);
}

const reverseMatch = html.match(/function grossForNet\(target, y\) \{([\s\S]*?)\n  \}\n  function updateLabels/);
assert.ok(reverseMatch, 'Reverse gross salary solver must be extractable for numerical tests');
const grossForNet = new Function('tax', 'return function(target, y) {' + reverseMatch[1] + '}')((income, taxYear) => calculateTax(income, taxYear));
for (const [targetNet, taxYear] of [[1200000, '2026'], [2400000, '2025']]) {
  const gross = grossForNet(targetNet, taxYear);
  const resultingNet = gross - calculateTax(gross, taxYear);
  assert.ok(Math.abs(resultingNet - targetNet) < 0.01,
    'Reverse salary calculation did not reproduce target net PKR ' + targetNet + ' for year ' + taxYear);
}
assert.match(html, /Estimated monthly gross taxable salary/,
  'Results must show the gross monthly equivalent');
assert.match(html, /Marginal tax rate:/,
  'Results must show marginal tax rate separately from effective tax rate');

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
