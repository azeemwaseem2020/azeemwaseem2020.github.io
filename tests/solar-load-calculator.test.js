import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../solar-load-calculator.html', import.meta.url), 'utf8');

assert.match(html, /<label for="inverterMargin">Continuous inverter headroom \(%\)<\/label>/);
assert.match(html, /id="inverterMargin" type="number" value="25" min="0" max="100"/);
assert.match(html, /inverterMargin=document\.getElementById\('inverterMargin'\)/);
assert.match(html, /Number\(inverterMargin\.value\)/);
assert.match(html, /v\[10\]>=0&&v\[10\]<=100/);
assert.match(html, /M=Number\(inverterMargin\.value\)\/100/);
assert.match(html, /Math\.max\(0,totalLoad\/1000\)\*\(1\+M\)/);
assert.match(html, /Starting surge is not included/);
assert.match(html, /Verify both continuous and surge ratings for the actual appliances/);

console.log('Solar load calculator inverter headroom checks passed.');
