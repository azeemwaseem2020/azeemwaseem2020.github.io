import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../solar-battery-calculator.html', import.meta.url), 'utf8');
const schemas = [...page.matchAll(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/g)].map(([, raw]) => JSON.parse(raw));
const faq = schemas.find(schema => schema['@type'] === 'FAQPage');

assert.ok(faq, 'solar battery FAQPage schema exists');
assert.match(page, /id="five-kwh-runtime-example"/);
assert.match(page, /Example: how long will a 5 kWh battery run your appliances\\?/);
assert.match(page, /5\\.00 × 0\\.80 × 0\\.90 = <strong>3\\.60 kWh<\\/strong>/);
assert.match(page, /<th scope="row">500 W<\\/th><td>7\\.2 hours<\\/td>/);
assert.match(page, /<th scope="row">1,000 W<\\/th><td>3\\.6 hours<\\/td>/);
assert.match(page, /<th scope="row">1,500 W<\\/th><td>2\\.4 hours<\\/td>/);
assert.match(page, /<th scope="row">2,000 W<\\/th><td>1\\.8 hours<\\/td>/);

const question = 'How long will a 5 kWh battery run a 1 kW load?';
assert.match(page, /How long will a 5 kWh battery run a 1 kW load\\?/);
assert.ok(faq.mainEntity.some(item => item.name === question), 'visible runtime FAQ is represented in FAQPage schema');
assert.match(page, /Updated: November 20, 2026/);
assert.match(page, /article:modified_time" content="2026-11-20"/);

const deliveredKwh = 5 * 0.8 * 0.9;
assert.equal(deliveredKwh, 3.6);
assert.equal(deliveredKwh / 0.5, 7.2);
assert.equal(deliveredKwh / 1, 3.6);
assert.equal(deliveredKwh / 1.5, 2.4);
assert.equal(deliveredKwh / 2, 1.8);

const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
assert.match(sitemap, /solar-battery-calculator\\.html<\\/loc><lastmod>2026-11-20<\\/lastmod>/);
console.log('Solar battery runtime examples and FAQ checks passed.');
