import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../pakistan-salary-tax-calculator.html', import.meta.url), 'utf8');

assert.match(html, /How much tax is deducted on a PKR 100,000 monthly salary in Pakistan\?/i,
  'Must answer the high-intent PKR 100,000 monthly salary tax question');
assert.match(html, /PKR 6,000[\s\S]{0,180}PKR 500/i,
  'Must state annual and monthly-average tax for PKR 100,000 monthly taxable salary');
assert.match(html, /What is the difference between a filer and a non-filer in Pakistan\?/i,
  'Must answer the filer versus non-filer question');
assert.match(html, /does not, by itself, replace the salary tax slab calculation/i,
  'Must distinguish salary slab tax from ATL-dependent withholding on other transactions');
assert.match(html, /Should I calculate salary tax using gross salary or take-home pay\?/i,
  'Must explain the correct taxable salary input');

const faqScript = html.match(/<script type="application\/ld\+json">({\"@context\":\"https:\/\/schema\.org\",\"@type\":\"FAQPage\"[\s\S]*?})<\/script>/);
assert.ok(faqScript, 'Must provide FAQPage JSON-LD for the visible related questions');
const faq = JSON.parse(faqScript[1]);
assert.equal(faq.mainEntity.length, 8, 'FAQ schema should contain the four original and four salary-component questions');
for (const question of [
  'How much tax is deducted on a PKR 100,000 monthly salary in Pakistan?',
  'What is the difference between a filer and a non-filer in Pakistan?',
  'Is PKR 100,000 monthly salary tax-free?',
  'Should I calculate salary tax using gross salary or take-home pay?'
]) {
  assert.ok(faq.mainEntity.some(item => item.name === question), 'FAQ schema missing: ' + question);
}
assert.match(html, /FBR Tax Year 2027 withholding tax rate card/,
  'Filer/non-filer answer should point to the official FBR rate card');

assert.match(html, /id="tax-source-governance"/,
  'Must expose a dedicated tax-year and source-governance section');
assert.match(html, /FBR Finance Act 2026 publication/,
  'Must link the enacted Finance Act as a primary source');
assert.match(html, /A Finance Bill is useful background but is not[\s\S]{0,100}substitute for the enacted law/,
  'Must distinguish a Finance Bill from enacted legislation');
assert.match(html, /Official source set reviewed October 13, 2026\./,
  'Must display the current official-source review date');
assert.match(html, /"dateModified":"2026-10-13"/,
  'Structured data dateModified must match the reviewed page version');
assert.match(html, /article:modified_time" content="2026-10-13"/,
  'Open Graph modified time must match the reviewed page version');

const zakat = fs.readFileSync(new URL('../zakat-calculator.html', import.meta.url), 'utf8');
assert.match(zakat, /<h1>Pakistan Zakat Calculator — Nisab &amp; 2\.5% Estimate<\/h1>/,
  'Zakat page should not label a prior-year Nisab as the current-year default');
assert.match(zakat, /value="" placeholder="Enter the applicable Nisab amount"/,
  'Zakat page must not prefill the historical 1446–47 Nisab as current');
assert.match(zakat, /PKR 503,529[\s\S]{0,220}historical Pakistan government reference/,
  'Zakat page must identify the PKR 503,529 threshold as historical');
assert.match(zakat, /validMoneyInput/,
  'Zakat calculator must reject blank, negative and non-numeric money inputs instead of silently converting them to zero');
assert.match(zakat, /Enter a positive Nisab threshold/,
  'Zakat calculation must require a positive user-confirmed Nisab');
assert.match(zakat, /"dateModified":"2026-10-13"/,
  'Zakat structured-data revision date must match the current page revision');
assert.match(zakat, /article:modified_time" content="2026-10-13"/,
  'Zakat Open Graph modified time must match the current page revision');

const emi = fs.readFileSync(new URL('../loan-emi-calculator.html', import.meta.url), 'utf8');
assert.match(emi, /N>600/,
  'EMI calculator must cap the schedule at 600 monthly payments');
assert.match(emi, /annual>100/,
  'EMI calculator must reject annual rates above its stated 100% input limit');
assert.match(emi, /rate minus entered benchmark/,
  'EMI benchmark output must be labelled as a rate difference rather than a forecast');
assert.match(emi, /total scheduled repayment of approximately PKR 127,482\.27/,
  'EMI worked example must match the reducing-balance formula to two decimal places');
assert.doesNotMatch(emi, /2026-10-09/,
  'EMI structured-data dates must not retain the prior revision date');
assert.equal((emi.match(/"dateModified":"2026-10-13"/g) || []).length, 2,
  'EMI WebApplication and WebPage structured data must share the current revision date');
assert.match(emi, /article:modified_time" content="2026-10-13"/,
  'EMI Open Graph modified time must match the current page revision');

console.log('Finance calculator SEO, source and validation tests passed.');
