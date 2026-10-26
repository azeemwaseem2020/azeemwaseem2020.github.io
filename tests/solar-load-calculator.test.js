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

const guide = fs.readFileSync(new URL('../blog-home-solar-load-calculator-usa.html', import.meta.url), 'utf8');
assert.match(guide, /Use the electric bill without confusing energy and peak demand/);
assert.match(guide, /https:\/\/pvwatts\.nrel\.gov\//);
assert.match(guide, /https:\/\/sam\.nrel\.gov\/photovoltaic/);
assert.doesNotMatch(guide, /https:\/\/(?:pvwatts|sam)\.nlr\.gov/);
assert.match(guide, /Monthly kWh divided by the number of days in that billing period/);

const panelPage = fs.readFileSync(new URL('../solar-panel-calculator.html', import.meta.url), 'utf8');
assert.match(panelPage, /<title>Solar Panel Calculator: Panel Count & Daily Output \| Calcora<\/title>/);
assert.match(panelPage, /property="og:title" content="Solar Panel Calculator: Panel Count & Daily Output \| Calcora"/);
assert.doesNotMatch(panelPage, /og:title[^>]+Pakistan/i);
assert.match(panelPage, /name="description" content="Estimate solar panel count and daily energy output/);
const panelSchemas = [...panelPage.matchAll(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/g)].map(([, raw]) => JSON.parse(raw));
const panelApp = panelSchemas.find(schema => schema['@type'] === 'SoftwareApplication');
assert.ok(panelApp, 'solar panel SoftwareApplication schema exists');
assert.equal(panelApp.name, 'Solar Panel Calculator: Panel Count & Daily Output | Calcora');
assert.equal(panelApp.url, 'https://azeemwaseem2020.github.io/solar-panel-calculator.html');

assert.match(panelPage, /href="https:\/\/azeemwaseem2020\.github\.io\/solar-panel-calculator\.html"/);

console.log('Solar load calculator inverter headroom checks passed.');
