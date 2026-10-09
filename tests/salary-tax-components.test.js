import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../pakistan-salary-tax-calculator.html', import.meta.url), 'utf8');
const requiredTopics = [
  'salary-components-tax-treatment',
  'Is a bonus taxable as salary in Pakistan?',
  'Are house rent, travel, utility and medical allowances taxable?',
  'How is provident fund treated for salary tax?',
  'Do gratuity, pension or leave encashment belong in this salary calculator?',
  'Employer-provided benefits and expense reimbursements',
  'annual salary certificate',
  'FBR’s Income Tax Ordinance resources'
];
for (const topic of requiredTopics) {
  assert.ok(html.toLowerCase().includes(topic.toLowerCase()), 'Salary component guide missing: ' + topic);
}
assert.match(html, /does not classify each payroll component for you/i,
  'Must clearly explain that the calculator does not classify components');
assert.match(html, /fixed monthly amount is not automatically tax-free/i,
  'Must avoid implying that allowance labels determine tax treatment');
assert.match(html, /fund's legal status/i,
  'Provident-fund discussion must reflect that tax treatment depends on fund status');

const schemaStart = html.indexOf('<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"');
assert.ok(schemaStart >= 0, 'FAQPage JSON-LD must exist');
const jsonStart = html.indexOf('>', schemaStart) + 1;
const jsonEnd = html.indexOf('</script>', jsonStart);
assert.ok(jsonEnd > jsonStart, 'FAQPage JSON-LD script must close');
const faq = JSON.parse(html.slice(jsonStart, jsonEnd));
assert.equal(faq.mainEntity.length, 8, 'FAQPage should include four original and four salary-component questions');
for (const q of [
  'Is a bonus taxable as salary in Pakistan?',
  'Are house rent, travel, utility and medical allowances taxable?',
  'How is provident fund treated for salary tax?',
  'Do gratuity, pension or leave encashment belong in this salary calculator?'
]) {
  assert.ok(faq.mainEntity.some(item => item.name === q), 'FAQPage schema missing: ' + q);
}

for (const item of faq.mainEntity) {
  assert.ok(html.includes('<h3>' + item.name + '</h3>'),
    'FAQ schema question must be visibly present as an exact heading: ' + item.name);
}
console.log('Salary tax component entity tests passed.');
