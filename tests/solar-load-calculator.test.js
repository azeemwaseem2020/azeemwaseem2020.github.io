import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../solar-load-calculator.html', import.meta.url), 'utf8');

assert.match(html, /<label for="inverterMargin">Continuous inverter headroom \(%\)<\/label>/);
assert.match(html, /id="inverterMargin" type="number" value="25" min="0" max="100"/);
assert.match(html, /inverterMargin=document\.getElementById\('inverterMargin'\)/);
assert.match(html, /Number\(inverterMargin\.value\)/);
assert.match(html, /v\[10\]>=0&&v\[10\]<=100/);
assert.match(html, /<label for="billingDays">Days covered by this electricity bill<\/label>/);
assert.match(html, /id="billingDays" type="number" value="30" min="1" max="62"/);
assert.match(html, /billingDays=document\.getElementById\('billingDays'\)/);
assert.match(html, /v\[11\]>=1&&v\[11\]<=62&&Number\.isInteger\(v\[11\]\)/);
assert.match(html, /Number\(units\.value\)\/Number\(billingDays\.value\)/);
assert.match(html, /daily\*Number\(billingDays\.value\)/);
assert.match(html, /billing-period days you enter/);
assert.match(html, /M=Number\(inverterMargin\.value\)\/100/);
assert.match(html, /Math\.max\(0,totalLoad\/1000\)\*\(1\+M\)/);
assert.match(html, /separate rough starting-surge reference/);
assert.ok(html.includes('Check inverter continuous output and surge rating/duration'));
assert.match(html, /\['Starting surge multiplier','ls',1,'1','0\.1'\]/);
assert.match(html, /querySelectorAll\('\.ls'\)/);
assert.match(html, /surges\.some\(x=>!Number\.isFinite\(x\)\|\|x<1\|\|x>10\)/);
assert.match(html, /largestSurgeIncrement=Math\.max\(largestSurgeIncrement,w\*\(surges\[i\]-1\)\)/);
assert.match(html, /render\(loadOut,daily,assumedRunning,assumedRunning\+largestSurgeIncrement\)/);
assert.match(html, /Illustrative starting-surge reference/);
assert.match(html, /assuming one appliance starts while the other assumed loads are already running/);
assert.match(html, /Check inverter continuous output and surge rating\/duration/);

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
const panelSchemas = [...panelPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, raw]) => JSON.parse(raw));
const panelApp = panelSchemas.find(schema => schema['@type'] === 'SoftwareApplication');
assert.ok(panelApp, 'solar panel SoftwareApplication schema exists');
assert.equal(panelApp.name, 'Solar Panel Calculator: Panel Count & Daily Output | Calcora');
assert.equal(panelApp.url, 'https://azeemwaseem2020.github.io/solar-panel-calculator.html');
assert.match(panelPage, /Last updated: 26 October 2026/);
assert.match(panelPage, /https:\/\/pvwatts\.nrel\.gov\//);
assert.match(panelPage, /https:\/\/sam\.nrel\.gov\/photovoltaic/);
assert.doesNotMatch(panelPage, /https:\/\/(?:pvwatts|sam)\.nlr\.gov/);
assert.doesNotMatch(panelPage, /id="calcora-search-guide"/);
assert.doesNotMatch(panelPage, /class="calcora-quick-guide"/);
const batteryPage = fs.readFileSync(new URL('../solar-battery-calculator.html', import.meta.url), 'utf8');
assert.match(batteryPage, /<title>Solar Battery Calculator \| Backup Time, kWh & Ah \| Calcora<\/title>/);
assert.match(batteryPage, /property="og:title" content="Solar Battery Calculator \| Backup Time, kWh & Ah \| Calcora"/);
assert.doesNotMatch(batteryPage, /og:title[^>]+Pakistan/i);
assert.match(batteryPage, /Updated: October 26, 2026/);
assert.match(batteryPage, /href="blog-home-solar-load-calculator-usa\.html">US Home Solar Load Guide/);
assert.doesNotMatch(batteryPage, /class="calcora-quick-guide"/);
assert.doesNotMatch(batteryPage, /<h2>Next checks<\/h2>/);
const batterySchemas = [...batteryPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, raw]) => JSON.parse(raw));
const batteryApp = batterySchemas.find(schema => schema['@type'] === 'SoftwareApplication');
assert.ok(batteryApp, 'solar battery SoftwareApplication schema exists');
assert.equal(batteryApp.name, 'Solar Battery Calculator | Backup Time, kWh & Ah | Calcora');
assert.equal(batteryApp.url, 'https://azeemwaseem2020.github.io/solar-battery-calculator.html');



assert.match(panelPage, /href="https:\/\/azeemwaseem2020\.github\.io\/solar-panel-calculator\.html"/);


const solarHub = fs.readFileSync(new URL('../solar-calculator-hub.html', import.meta.url), 'utf8');
assert.match(solarHub, /<title>Solar Calculator Hub \| Load, Panels, Battery & Inverter \| Calcora<\/title>/);
assert.match(solarHub, /property="og:title" content="Solar Calculator Hub \| Load, Panels, Battery & Inverter \| Calcora"/);
const solarLoadPage = fs.readFileSync(new URL('../solar-load-calculator.html', import.meta.url), 'utf8');
const loadSchemas = [...solarLoadPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, raw]) => JSON.parse(raw));
const loadApp = loadSchemas.find(schema => schema['@type'] === 'SoftwareApplication');
assert.ok(loadApp, 'solar load SoftwareApplication schema exists');
assert.equal(loadApp.name, 'Home Solar Load Calculator: kWh, Panels & Battery | Calcora');
assert.doesNotMatch(solarLoadPage, /https:\/\/(?:pvwatts|sam)\.nlr\.gov/);
assert.match(solarLoadPage, /https:\/\/pvwatts\.nrel\.gov\//);
assert.match(solarLoadPage, /https:\/\/sam\.nrel\.gov\/photovoltaic/);
const inverterGuide = fs.readFileSync(new URL('../blog-solar-inverter-size-calculator.html', import.meta.url), 'utf8');
assert.match(inverterGuide, /property="og:title" content="Solar Inverter Sizing Guide: kW, kVA &amp; Surge \| Calcora"/);
assert.doesNotMatch(inverterGuide, /https:\/\/(?:pvwatts|sam)\.nlr\.gov/);
assert.match(inverterGuide, /https:\/\/pvwatts\.nrel\.gov\//);
assert.match(inverterGuide, /https:\/\/sam\.nrel\.gov\/photovoltaic/);

console.log('Solar load calculator inverter headroom checks passed.');
