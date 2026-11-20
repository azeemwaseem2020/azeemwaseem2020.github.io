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
assert.match(batteryPage, /Updated: November 20, 2026/);
assert.match(batteryPage, /dcCurrent=l\/\(v\*e\)/);
assert.match(batteryPage, /Estimated DC current at the entered voltage/);
assert.match(batteryPage, /Battery\/BMS:<\/strong> confirm continuous and peak discharge-current ratings/);
assert.match(batteryPage, /DC current is approximately AC load watts/);

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
assert.equal(loadApp.name, 'Solar Load Calculator Pakistan | Panels & Battery | Calcora');
assert.match(solarLoadPage, /<title>Solar Load Calculator Pakistan \| Panels & Battery \| Calcora<\/title>/);
assert.match(solarLoadPage, /name="description" content="Use this solar load calculator to estimate household watts, daily kWh/);
assert.match(solarLoadPage, /https:\/\/globalsolaratlas\.info\//);
assert.match(solarLoadPage, /Pakistan solar irradiation and PV-potential map data/);
assert.doesNotMatch(solarLoadPage, /preliminary US home planning/);
assert.doesNotMatch(solarLoadPage, /https:\/\/(?:pvwatts|sam)\.nlr\.gov/);
assert.match(solarLoadPage, /https:\/\/pvwatts\.nrel\.gov\//);
assert.match(solarLoadPage, /https:\/\/sam\.nrel\.gov\/photovoltaic/);
const inverterPage = fs.readFileSync(new URL('../solar-inverter-size-calculator.html', import.meta.url), 'utf8');
assert.ok(inverterPage.includes('<title>Solar Inverter Size Calculator: W, kW, VA & Surge | Calcora</title>'));
assert.match(inverterPage, /<link rel="canonical" href="https:\/\/azeemwaseem2020\.github\.io\/solar-inverter-size-calculator\.html"/);
assert.match(inverterPage, /id="runningWatts" type="number"/);
assert.match(inverterPage, /id="largestWatts" type="number"/);
assert.match(inverterPage, /id="surgeMultiplier" type="number"/);
assert.match(inverterPage, /id="powerFactor" type="number"/);
assert.match(inverterPage, /const continuous=running\*\(1\+margin\/100\),continuousVA=continuous\/pf,surge=running-largest\+largest\*multiplier,surgeVA=surge\/pf/);
assert.match(inverterPage, /Check the actual inverter's continuous rating and surge rating\/duration/);
assert.match(inverterPage, /href="solar-load-calculator\.html"/);
assert.match(inverterPage, /href="solar-panel-calculator\.html"/);
assert.match(inverterPage, /href="solar-battery-calculator\.html"/);
assert.doesNotMatch(inverterPage, /http-equiv="refresh"|location\.replace\(/);
const inverterSchemas = [...inverterPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, raw]) => JSON.parse(raw));
assert.ok(inverterSchemas.some(schema => schema['@type'] === 'FAQPage' || schema['@graph']?.some(node => node['@type'] === 'FAQPage')), 'inverter calculator FAQ schema exists');
assert.ok(inverterSchemas.some(schema => schema['@type'] === 'SoftwareApplication' || schema['@graph']?.some(node => node['@type'] === 'SoftwareApplication')), 'inverter calculator application schema exists');
assert.match(solarHub, /href="solar-inverter-size-calculator\.html"/);
const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
assert.match(sitemap, /<loc>https:\/\/azeemwaseem2020\.github\.io\/solar-inverter-size-calculator\.html<\/loc><lastmod>2026-11-19<\/lastmod>/);
assert.match(sitemap, /solar-load-calculator\.html<\/loc><lastmod>2026-11-20<\/lastmod>/);
const inverterGuide = fs.readFileSync(new URL('../blog-solar-inverter-size-calculator.html', import.meta.url), 'utf8');
assert.match(inverterGuide, /property="og:title" content="Solar Inverter Sizing Guide: kW, kVA &amp; Surge \| Calcora"/);
assert.doesNotMatch(inverterGuide, /https:\/\/(?:pvwatts|sam)\.nlr\.gov/);
assert.match(inverterGuide, /https:\/\/pvwatts\.nrel\.gov\//);
assert.match(inverterGuide, /https:\/\/sam\.nrel\.gov\/photovoltaic/);

assert.match(solarLoadPage, /id="pv-sensitivity"[^>]*aria-labelledby="pv-sensitivity-title"/);
assert.match(solarLoadPage, /id="lowSun" type="number" value="3\.5" min="0\.1" max="12"/);
assert.match(solarLoadPage, /id="highSun" type="number" value="6" min="0\.1" max="12"/);
assert.match(solarLoadPage, /id="runPvRange"[^>]*>Compare PV sizing scenarios<\/button>/);
assert.match(solarLoadPage, /document\.getElementById\('runPvRange'\)\.addEventListener\('click'/);
assert.match(solarLoadPage, /!\(low<baseSun&&baseSun<high\)/);
assert.match(solarLoadPage, /Lower peak-sun hours increase the array size needed to meet the same daily energy target/);
assert.match(solarLoadPage, /function validPlanningInputs\(\)/);
assert.match(solarLoadPage, /if\(!validPlanningInputs\(\)\)\{loadOut\.innerHTML=/);
assert.match(solarLoadPage, /id="useRunningLoad"[^>]*>Use estimated running load as backup load<\/button>/);
assert.match(solarLoadPage, /function useRunningLoadAsBackup\(\)/);
assert.match(solarLoadPage, /document\.getElementById\('useRunningLoad'\)\.addEventListener\('click',useRunningLoadAsBackup\)/);
assert.match(solarLoadPage, /The battery estimate uses the separate “Load to back up” input/);
assert.match(solarLoadPage, /Optional: copy the estimated simultaneous running load into the separate battery-backup load input/);

// Search Console query coverage: visible solar FAQs and concise Pakistan-first snippet.
assert.match(solarLoadPage, /name="description" content="Use this solar load calculator to estimate household watts, daily kWh/);
assert.match(solarLoadPage, /How do I calculate the load for a solar system\?/);
assert.match(solarLoadPage, /How do I calculate solar panel load from electricity units\?/);
assert.match(solarLoadPage, /How do I calculate the load for an inverter\?/);
assert.match(solarLoadPage, /"name": "How do I calculate the load for a solar system\?"/);
assert.match(solarLoadPage, /"name": "How do I calculate solar panel load from electricity units\?"/);
assert.match(solarLoadPage, /"name": "How do I calculate the load for an inverter\?"/);

// Solar cluster navigation: hub, Pakistan guide and specialist tools form one clear path.
const solarBattery = fs.readFileSync(new URL('../solar-battery-calculator.html', import.meta.url), 'utf8');
const solarInverter = fs.readFileSync(new URL('../solar-inverter-size-calculator.html', import.meta.url), 'utf8');
const pakistanSolarGuide = fs.readFileSync(new URL('../blog-solar-calculator-pakistan.html', import.meta.url), 'utf8');
const solarSizingGuide = fs.readFileSync(new URL('../blog-solar-sizing-from-load-to-battery.html', import.meta.url), 'utf8');
for (const path of ['solar-load-calculator.html', 'solar-panel-calculator.html', 'solar-battery-calculator.html', 'solar-inverter-size-calculator.html']) {
  assert.ok(solarHub.includes('href="' + path + '"'), 'solar hub links to ' + path);
}
assert.ok(solarHub.includes('href="blog-solar-calculator-pakistan.html"'));
assert.ok(solarBattery.includes('href="solar-inverter-size-calculator.html"'));
assert.ok(solarInverter.includes('href="solar-battery-calculator.html"'));
assert.ok(pakistanSolarGuide.includes('href="solar-calculator-hub.html"'));
assert.ok(solarSizingGuide.includes('href="solar-inverter-size-calculator.html"'));
assert.ok(solarSizingGuide.includes('href="solar-battery-calculator.html"'));


assert.match(solarLoadPage, /id="pakistan-units-reference"/);
assert.match(solarLoadPage, /Pakistan solar system estimate by monthly electricity units/);
assert.match(solarLoadPage, /450 units ÷ 30 = 15 kWh\/day/);
assert.match(solarLoadPage, /How many solar panels do I need for 450 monthly electricity units in Pakistan\?/);
assert.match(solarLoadPage, /Last updated: 20 November 2026/);
assert.match(solarLoadPage, /article:modified_time" content="2026-11-20"/);
assert.ok(loadSchemas.find(schema => schema['@type'] === 'FAQPage').mainEntity.some(item => item.name === 'How many solar panels do I need for 450 monthly electricity units in Pakistan?'));

console.log('Solar load calculator inverter headroom checks passed.');


// Inverter sizing search-intent coverage and Pakistan-specific schema metadata.
assert.ok(inverterPage.includes('<strong>Updated:</strong> November 19, 2026'));
assert.ok(inverterPage.includes('article:modified_time" content="2026-11-19"'));
assert.ok(inverterPage.includes('Can I size an inverter using monthly electricity units (kWh) alone?'));
assert.ok(inverterPage.includes('Is the solar panel array rating the same as inverter output capacity?'));
const inverterUpdatedSchemas = inverterPage.split('<script type="application/ld+json">').slice(1).map(part => JSON.parse(part.split('</script>')[0]));
const inverterUpdatedApp = inverterUpdatedSchemas.flatMap(schema => schema['@graph'] || [schema]).find(schema => schema['@type'] === 'SoftwareApplication');
const inverterUpdatedFaq = inverterUpdatedSchemas.flatMap(schema => schema['@graph'] || [schema]).find(schema => schema['@type'] === 'FAQPage');
assert.equal(inverterUpdatedApp.offers.priceCurrency, 'PKR');
assert.equal(inverterUpdatedApp.dateModified, '2026-11-19');
for (const question of ['Can I size an inverter using monthly electricity units (kWh) alone?','Is the solar panel array rating the same as inverter output capacity?']) {
  assert.ok(inverterUpdatedFaq.mainEntity.some(item => item.name === question), 'inverter FAQ schema missing ' + question);
}
assert.ok(inverterPage.includes('id="inverter-rating-guide"'));
