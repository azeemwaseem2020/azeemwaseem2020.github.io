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
assert.match(html, /Use the right salary tool:[\s\S]{0,260}href="salary-calculator\.html"/,
  'Salary tax page should route pay-period conversion intent to the general salary calculator');
const salaryConverter = fs.readFileSync(new URL('../salary-calculator.html', import.meta.url), 'utf8');
assert.match(salaryConverter, /Need a tax estimate instead of a pay-period conversion[\s\S]{0,250}href="pakistan-salary-tax-calculator\.html"/,
  'General salary page should route Pakistan salary-tax intent to the dedicated tax calculator');
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
assert.match(html, /"dateModified":"2026-10-15"/,
  'Structured data dateModified must match the revised salary-tax page');
assert.match(html, /article:modified_time" content="2026-10-15"/,
  'Open Graph modified time must match the revised salary-tax page');


assert.match(html, /id="salary-period"[\\s\\S]{0,160}value="monthly"[\\s\\S]{0,100}value="annual"/,
  'Salary tax calculator must offer monthly and annual salary input');
assert.match(html, /id="tax-year"[\\s\\S]{0,180}Tax Year 2027[\\s\\S]{0,120}Tax Year 2026/,
  'Salary tax calculator must allow selecting FY 2026–27 and FY 2025–26');
assert.match(html, /id="salary-mode"[\\s\\S]{0,240}net-gross/,
  'Salary tax calculator must support reverse net-to-gross estimates');
assert.match(html, /function grossForNet\\(target, y\\)/,
  'Reverse salary calculation must solve gross pay from target net pay');
assert.match(html, /Estimated annual take-home after income tax/,
  'Results must show estimated net salary after income tax');
assert.match(html, /Year-on-year comparison/,
  'Results must compare tax-year estimates at the same gross taxable salary');
assert.match(html, /id="roman-urdu-faq"/,
  'The page must answer relevant salary tax questions in Roman Urdu');
assert.match(html, /if \\(x > 10000000\\) amount \\*= 1\\.09/,
  'Historical FY 2025–26 comparison must account for the 9% surcharge above PKR 10 million');

const zakat = fs.readFileSync(new URL('../zakat-calculator.html', import.meta.url), 'utf8');
assert.match(zakat, /<h1>Pakistan Zakat Calculator — Nisab &amp; 2\.5% Estimate<\/h1>/,
  'Zakat page should not label a prior-year Nisab as the current-year default');
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
assert.match(zakat, /"dateModified":"2026-10-14"/,
  'Zakat structured-data revision date must match the current page revision');
assert.match(zakat, /article:modified_time" content="2026-10-14"/,
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
assert.equal((emi.match(/"dateModified":"2026-10-14"/g) || []).length, 2,
  'EMI WebApplication and WebPage structured data must share the current revision date');
assert.match(emi, /article:modified_time" content="2026-10-14"/,
  'EMI Open Graph modified time must match the current page revision');
assert.equal(emi.split('<h2>Worked EMI example</h2>').length - 1, 1,
  'EMI worked example should appear once after consolidation');
assert.doesNotMatch(emi, /id="emi-content-guide"/,
  'EMI page must not retain the duplicate comparison guide section');
assert.doesNotMatch(emi, /<h2>How to compare two loan offers<\/h2>/,
  'EMI page must not repeat the loan-comparison section');
assert.doesNotMatch(emi, /<h3>What changes the EMI\?<\/h3>/,
  'EMI page must not repeat the rate/principal/term impact list');


const emiIntent = fs.readFileSync(new URL('../loan-emi-calculator.html', import.meta.url), 'utf8');
assert.match(emiIntent, /<title>Loan EMI Calculator Pakistan \| Monthly Payment &amp; Interest \| Calcora<\/title>/,
  'EMI title should match the primary loan EMI search intent');
assert.match(emiIntent, /<h1>EMI Calculator Pakistan — Monthly Loan Payment & Interest<\/h1>/,
  'EMI H1 should promise a monthly loan-payment calculation');
assert.match(emiIntent, /<meta name="description" content="Calculate EMI in Pakistan from loan amount, annual rate and tenure\./,
  'EMI description should state the inputs and Pakistan context');

const psxIntent = fs.readFileSync(new URL('../psx-calculator.html', import.meta.url), 'utf8');
assert.match(psxIntent, /Use this PSX profit calculator to estimate gross and net share profit or loss, net return and break-even price/,
  'PSX lead should prioritize the primary profit/loss intent before secondary modules');
assert.doesNotMatch(psxIntent.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1] || '', /dividend income, weighted average share price, bonus-share adjustment and rights-issue cost from your own trade figures/,
  'PSX lead should not present secondary calculator intents as equal primary targets');

const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const prioritySitemap = fs.readFileSync(new URL('../sitemap-pakistan-priority.xml', import.meta.url), 'utf8');
for (const map of [sitemap, prioritySitemap]) {
  assert.match(map, /<loc>https:\/\/azeemwaseem2020\.github\.io\/zakat-calculator\.html<\/loc><lastmod>2026-10-14<\/lastmod>/,
    'Both sitemaps must record the Zakat page revision date');
  assert.match(map, /<loc>https:\/\/azeemwaseem2020\.github\.io\/loan-emi-calculator\.html<\/loc><lastmod>2026-10-14<\/lastmod>/,
    'Both sitemaps must record the EMI page revision date');
}
console.log('Finance calculator SEO, source and validation tests passed.');
