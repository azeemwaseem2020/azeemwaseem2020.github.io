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
assert.match(html, /A Finance Bill is useful background but is not[\\s\\S]{0,100}substitute for the enacted law/,
  'Must distinguish a Finance Bill from enacted legislation');
assert.match(html, /Official source set reviewed October 13, 2026\./,
  'Must display the current official-source review date');
assert.match(html, /"dateModified":"2026-10-13"/,
  'Structured data dateModified must match the reviewed page version');
assert.match(html, /article:modified_time" content="2026-10-13"/,
  'Open Graph modified time must match the reviewed page version');
console.log('Salary tax related FAQ tests passed.');
