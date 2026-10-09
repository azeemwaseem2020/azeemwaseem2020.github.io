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
assert.equal(faq.mainEntity.length, 4, 'FAQ schema should contain the four visible high-intent questions');
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
console.log('Salary tax related FAQ tests passed.');
