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
assert.match(html, /Official source set reviewed October 15, 2026\./,
  'Must display the current official-source review date');
assert.match(html, /"dateModified":"2026-10-15"/,
  'Structured data dateModified must match the reviewed page version');
assert.match(html, /article:modified_time" content="2026-10-15"/,
  'Open Graph modified time must match the reviewed page version');

const zakat = fs.readFileSync(new URL('../zakat-calculator.html', import.meta.url), 'utf8');
assert.match(zakat, /<h1>Pakistan Zakat Calculator — Nisab &amp; 2\.5% Estimate<\/h1>/,
  'Zakat page should not label a prior-year Nisab as the current-year default');
assert.match(zakat, /href="#zakat-calculator">Jump to the Zakat calculator<\/a>/, 'Zakat calculator intent should offer an immediate path to the tool');
assert.match(zakat, /<section class="calculator-card" id="zakat-calculator">/, 'Zakat calculator section should expose the jump target');
assert.doesNotMatch(zakat, /Before entering figures, read the/, 'Zakat calculator page should not push users away before they can calculate');
assert.match(zakat, /value="" placeholder="Enter the applicable Nisab amount"/,
  'Zakat page must not prefill the historical 1446–47 Nisab as current');
assert.match(zakat, /PKR 503,529[\s\S]{0,220}historical Pakistan government reference/,
  'Zakat page must identify the PKR 503,529 threshold as historical');
assert.match(zakat, /!Number\.isFinite\(assets\)/,
  'Zakat calculator must stop when the entered asset sum exceeds reliable numeric range');
assert.match(zakat, /validMoneyInput/,
  'Zakat calculator must reject blank, negative and non-numeric money inputs instead of silently converting them to zero');
assert.match(zakat, /Enter a positive Nisab threshold/,
  'Zakat calculation must require a positive user-confirmed Nisab');
assert.match(zakat, /"dateModified":"2026-10-16"/,
  'Zakat structured-data revision date must match the current page revision');
assert.match(zakat, /article:modified_time" content="2026-10-16"/,
  'Zakat Open Graph modified time must match the current page revision');

const emi = fs.readFileSync(new URL('../loan-emi-calculator.html', import.meta.url), 'utf8');
assert.match(emi, /Number\.MAX_SAFE_INTEGER/,
  'EMI calculator must reject amounts beyond safe numeric precision');
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
assert.equal((emi.match(/"dateModified":"2026-10-15"/g) || []).length, 2,
  'EMI WebApplication and WebPage structured data must share the current revision date');
assert.match(emi, /article:modified_time" content="2026-10-15"/,
  'EMI Open Graph modified time must match the current page revision');
assert.equal(emi.split('<h2>Worked EMI example</h2>').length - 1, 1,
  'EMI worked example should appear once after consolidation');
assert.doesNotMatch(emi, /id="emi-content-guide"/,
  'EMI page must not retain the duplicate comparison guide section');
assert.doesNotMatch(emi, /<h2>How to compare two loan offers<\/h2>/,
  'EMI page must not repeat the loan-comparison section');
assert.doesNotMatch(emi, /<h3>What changes the EMI\?<\/h3>/,
  'EMI page must not repeat the rate/principal/term impact list');


assert.match(zakat, /id="zakat-verification-record"/,
  'Zakat page must expose a verification record');
assert.ok(zakat.includes('PKR 900,000 in listed assets') && zakat.includes('PKR 20,000'),
  'Zakat verification record must show a reproducible worked arithmetic example');
assert.ok(zakat.includes('Independent reviewer:</strong> None is currently identified'),
  'Zakat page must not imply independent specialist review without evidence');

assert.match(emi, /id="emi-verification-record"/,
  'EMI page must expose a verification record');
assert.ok(emi.includes('PKR 2,124.70') && emi.includes('PKR 27,482.27') && emi.includes('PKR 127,482.27'),
  'EMI verification record must show the runtime-tested sample outputs');
assert.ok(emi.includes('Independent reviewer:</strong> None is currently identified'),
  'EMI page must not imply independent finance review without evidence');

const author = fs.readFileSync(new URL('../abdul-qadir.html', import.meta.url), 'utf8');
assert.match(author, /Examples of documented software checks/,
  'Author profile should describe verifiable work rather than unsupported credentials');
assert.match(author, /not an independent reviewer of my own work/,
  'Author profile must distinguish maintenance from independent review');
const methodology = fs.readFileSync(new URL('../calculator-methodology.html', import.meta.url), 'utf8');
assert.match(methodology, /Examples of automated checks users can inspect/,
  'Methodology page should provide concrete test evidence');
assert.match(methodology, /do not prove exhaustive correctness/,
  'Methodology page must state the limits of automated test evidence');

const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const prioritySitemap = fs.readFileSync(new URL('../sitemap-pakistan-priority.xml', import.meta.url), 'utf8');
for (const map of [sitemap, prioritySitemap]) {
  assert.match(map, /<loc>https:\/\/azeemwaseem2020\.github\.io\/zakat-calculator\.html<\/loc><lastmod>2026-10-16<\/lastmod>/,
    'Both sitemaps must record the Zakat page revision date');
  assert.match(map, /<loc>https:\/\/azeemwaseem2020\.github\.io\/loan-emi-calculator\.html<\/loc><lastmod>2026-10-15<\/lastmod>/,
    'Both sitemaps must record the EMI page revision date');
}
assert.match(emi, /id="extra-principal"/,
  'EMI page must expose an optional extra-principal input');
assert.match(emi, /id="extra-payoff-result"/,
  'EMI page must expose a separate payoff scenario result');
assert.match(emi, /function calculatePayoff\(\)/,
  'EMI extra-payment scenario must have a dedicated calculation routine');
assert.match(emi, /Potential interest saved/,
  'EMI payoff scenario must explain potential interest savings');
assert.match(emi, /id="affordability-stress-test"/,
  'EMI page must expose the affordability and rate-stress tool');
assert.match(emi, /id="aff-check"/,
  'EMI affordability tool must have a working action control');
assert.match(emi, /Number\.MAX_SAFE_INTEGER/,
  'EMI scenario inputs must include safe-number guardrails');
assert.match(emi, /official-bank-offer-checklist/,
  'EMI page must include an official-source loan-offer comparison checklist');
assert.match(emi, /https:\/\/ubldigital\.com\/Loans\/Consumer-Loans\/UBL-Drive/,
  'EMI comparison checklist must link to the official UBL product page');
assert.match(emi, /https:\/\/www\.meezanbank\.com\/car-ijarah\//,
  'EMI comparison checklist must link to the official Meezan Bank product page');


assert.match(html, /id="salary-period"/,
  'Salary tax calculator must support monthly and annual input modes');
assert.match(html, /Estimated annual net after income tax/,
  'Salary tax result must show estimated annual net pay after income tax');
assert.match(html, /Estimated monthly net after income tax/,
  'Salary tax result must show estimated monthly net pay after income tax');
assert.match(html, /id="salary-net-gross-tools"/,
  'Salary tax page must expose the reverse net-to-gross estimator');
assert.match(html, /function reverseNetToGross\(\)/,
  'Reverse estimator must calculate a gross salary from a target net salary');
assert.match(html, /id="tax-year-comparison"/,
  'Salary tax page must compare current and previous tax years');
assert.match(html, /function previousYearTax\(x\)/,
  'Previous-year comparison must use a separate Tax Year 2026 formula');
assert.match(html, /annual > 10000000/,
  'Previous-year comparison must account for the 9% surcharge above PKR 10 million');

console.log('Finance calculator SEO, source and validation tests passed.');
