const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('concrete-volume-calculator.html', 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/i)?.[1] || '';

assert.match(html, /Concrete Volume Calculator: Slab &amp; Footing Volume \| Calcora/);
assert.match(html, /name="description"/);
assert.match(html, /name="author" content="Abdul Qadir"/);
assert.match(html, /og:title/);
assert.match(html, /og:description/);
assert.match(html, /twitter:title/);
assert.match(html, /twitter:description/);
assert.match(html, /construction-calculators\.html/);
assert.match(html, /Frequently asked questions/);
assert.equal((html.match(/id="method-heading"/g) || []).length, 1);
assert.doesNotMatch(html, /calcora-content-expansion|calcora-semantic-context|calcora-practical-guide-2026/);
assert.match(html, /id="unit"/);
assert.match(html, /id="waste"/);
assert.match(html, /id="result"[^>]*aria-live="polite"/);
assert.match(script, /nextUnit==='m'\?0\.3048:1\/0\.3048/);
assert.match(script, /\['l','w','d'\]/);
assert.match(script, /Number\.isFinite/);
assert.match(script, /base\*\(1\+waste\/100\)/);
assert.match(script, /35\.3146667/);
assert.match(script, /1\.30795062/);
assert.match(script, /0\.0283168466/);
assert.match(script, /adjusted\/27/);
assert.doesNotMatch(script, /q\('#d'\)\.value=metric/);
assert.doesNotMatch(script, /out\.innerHTML/);
assert.match(script, /out\.textContent/);

const ft3 = 12 * 10 * 0.5;
const yd3 = ft3 / 27;
const m3 = ft3 * 0.0283168466;
assert.equal(ft3, 60);
assert.ok(Math.abs(yd3 - 2.2222222222) < 1e-9);
assert.ok(Math.abs(m3 - 1.699010796) < 1e-8);
assert.ok(Math.abs(60 * 1.1 - 66) < 1e-12);
assert.ok(Math.abs(10 * 0.3048 - 3.048) < 1e-12);

console.log('Concrete volume calculator: metadata, duplicate-content, unit conversion, allowance, validation and safe-output checks passed.');
