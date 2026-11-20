import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../solar-panel-calculator.html', import.meta.url), 'utf8');
const schemas = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, raw]) => JSON.parse(raw));
const faq = schemas.find(schema => schema['@type'] === 'FAQPage');

assert.ok(faq, 'solar panel FAQPage schema exists');
assert.ok(page.includes('id="550w-panel-daily-output"'));
assert.ok(page.includes('How much electricity does a 550 W solar panel generate per day?'));
assert.ok(page.includes('<td>1.76 kWh/day</td><td>52.8 kWh</td>'));
assert.ok(page.includes('<td>2.20 kWh/day</td><td>66.0 kWh</td>'));
assert.ok(page.includes('<td>2.64 kWh/day</td><td>79.2 kWh</td>'));
const question = 'How many units does a 550 W solar panel generate per day?';
assert.ok(page.includes(question));
assert.ok(faq.mainEntity.some(item => item.name === question), 'visible production FAQ is represented in FAQPage schema');
assert.ok(page.includes('Last updated: 20 November 2026'));
assert.ok(page.includes('article:modified_time" content="2026-11-20"'));

assert.ok(Math.abs(0.55 * 4 * 0.8 - 1.76) < 1e-10);
assert.ok(Math.abs(0.55 * 5 * 0.8 - 2.2) < 1e-10);
assert.ok(Math.abs(0.55 * 6 * 0.8 - 2.64) < 1e-10);
assert.ok(Math.abs(2.2 * 30 - 66) < 1e-10);

const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
assert.ok(sitemap.includes('<loc>https://azeemwaseem2020.github.io/solar-panel-calculator.html</loc><lastmod>2026-11-20</lastmod>'));
console.log('Solar panel 550 W generation examples and FAQ checks passed.');
