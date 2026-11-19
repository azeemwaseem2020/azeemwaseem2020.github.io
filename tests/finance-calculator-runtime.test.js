import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');

function makeDom(html) {
  const elements = new Map();
  for (const match of html.matchAll(/<input\b[^>]*>/g)) {
    const tag = match[0];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (!id) continue;
    elements.set(id, {
      id,
      value: tag.match(/\bvalue="([^"]*)"/)?.[1] ?? '',
      innerHTML: '',
      textContent: '',
      handlers: {},
      addEventListener(type, callback) { this.handlers[type] = callback; }
    });
  }
  for (const match of html.matchAll(/<(?:button|div|a)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    if (!elements.has(match[1])) elements.set(match[1], {
      id: match[1], value: '', innerHTML: '', textContent: '', handlers: {},
      addEventListener(type, callback) { this.handlers[type] = callback; }
    });
  }
  return {
    elements,
    document: {
      head: { appendChild() {} },
      createElement() { return { src: '', onload: null, onerror: null }; },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, {
          id, value: '', innerHTML: '', textContent: '', handlers: {},
          addEventListener(type, callback) { this.handlers[type] = callback; }
        });
        return elements.get(id);
      },
      querySelector(selector) {
        const id = selector.match(/label\[for="([^"]+)"\]/)?.[1] ?? '';
        return { textContent: id || 'Unknown field' };
      }
    }
  };
}

function inlineScript(html, marker) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  const found = scripts.find(script => script.includes(marker));
  assert.ok(found, 'Expected inline calculator script containing: ' + marker);
  return found;
}

// EMI: verify live calculation output and input guardrails, not just page copy.
{
  const html = read('loan-emi-calculator.html');
  const { document, elements } = makeDom(html);
  vm.runInNewContext(inlineScript(html, 'const amount='), { document, window: {}, Math, Number, String, encodeURIComponent });
  const field = id => elements.get(id) ?? document.getElementById(id);
  field('amount').value = '100000';
  field('down').value = '0';
  field('rate').value = '10';
  field('years').value = '5';
  field('fees').value = '0';
  field('kibor').value = '';
  field('calculate').handlers.click();
  assert.match(field('result').innerHTML, /Monthly EMI:<\/strong> PKR 2,124\.70/);
  assert.match(field('result').innerHTML, /Total interest:<\/strong> PKR 27,482\.27/);
  assert.match(field('result').innerHTML, /Total loan repayment:<\/strong> PKR 127,482\.27/);

  field('rate').value = '0';
  field('calculate').handlers.click();
  assert.match(field('result').innerHTML, /Monthly EMI:<\/strong> PKR 1,666\.67/);
  assert.match(field('result').innerHTML, /Total interest:<\/strong> PKR 0\.00/);

  field('rate').value = '101';
  field('calculate').handlers.click();
  assert.match(field('result').innerHTML, /Please enter valid values/);

  field('rate').value = '10';
  field('amount').value = '1.79e308';
  field('calculate').handlers.click();
  assert.match(field('result').innerHTML, /exceed safe numeric precision/);
}

// Zakat: verify the estimate, missing Nisab validation and overflow guard.
{
  const html = read('zakat-calculator.html');
  const { document, elements } = makeDom(html);
  vm.runInNewContext(inlineScript(html, 'const assetIds='), { document, Math, Number, String, encodeURIComponent });
  const field = id => elements.get(id) ?? document.getElementById(id);
  field('nisab').value = '503529';
  field('cash').value = '500000';
  field('bank').value = '200000';
  field('gold').value = '200000';
  field('liabilities').value = '100000';
  field('calc').handlers.click();
  assert.match(field('result').innerHTML, /Net listed assets:<\/strong> PKR 800,000/);
  assert.match(field('result').innerHTML, /Estimated Zakat at 2\.5%:<\/strong> PKR 20,000/);

  field('nisab').value = '';
  field('calc').handlers.click();
  assert.match(field('result').innerHTML, /Check your entries/);

  field('nisab').value = '1';
  for (const id of ['cash', 'bank', 'gold', 'silver', 'investments', 'business', 'receivables']) field(id).value = '1e308';
  field('calc').handlers.click();
  assert.match(field('result').innerHTML, /too large to calculate reliably/);
}

// Loan EMI cluster navigation: core calculator, supporting tools and educational guides.
const emiCore = read('loan-emi-calculator.html');
// Search Console query coverage: Pakistan monthly-installment intent and matching FAQ schema.
assert.match(emiCore, /name="description" content="Calculate your monthly loan installment \(EMI\) in Pakistan/);
assert.match(emiCore, /How is EMI calculated for a loan in Pakistan\?/);
assert.match(emiCore, /Is a monthly installment the same as EMI\?/);
assert.match(emiCore, /Can I calculate EMI for a PKR 100,000 loan\?/);
assert.match(emiCore, /"name": "How is EMI calculated for a loan in Pakistan\?"/);
assert.match(emiCore, /"name": "Is a monthly installment the same as EMI\?"/);
assert.match(emiCore, /"name": "Can I calculate EMI for a PKR 100,000 loan\?"/);

const personalLoan = read('personal-loan-calculator.html');
const interestLoan = read('loan-interest-calculator.html');
const payoffLoan = read('loan-payoff-calculator.html');
const emiGuide = read('blog-loan-emi.html');
const amortizationGuide = read('blog-emi-amortization-schedule.html');
const homeLoanPage = read('home-loan-emi-pakistan.html');
const carLoanPage = read('car-loan-emi-pakistan.html');
assert.match(homeLoanPage, /How does a larger down payment affect home loan EMI\?/);
assert.match(homeLoanPage, /Does a longer home finance tenure reduce the total cost\?/);
assert.match(homeLoanPage, /"name": "How does a larger down payment affect home loan EMI\?"/);
assert.match(homeLoanPage, /"name": "Does a longer home finance tenure reduce the total cost\?"/);
assert.match(carLoanPage, /How does a larger car down payment affect the monthly installment\?/);
assert.match(carLoanPage, /Should I compare car finance offers using EMI alone\?/);
assert.match(carLoanPage, /"name": "How does a larger car down payment affect the monthly installment\?"/);
assert.match(carLoanPage, /"name": "Should I compare car finance offers using EMI alone\?"/);
assert.ok(personalLoan.includes('href="loan-emi-calculator.html"'));
assert.ok(personalLoan.includes('href="loan-comparison-calculator.html"'));
assert.ok(interestLoan.includes('href="blog-emi-amortization-schedule.html"'));
assert.ok(interestLoan.includes('href="reducing-balance-vs-flat-rate-loan.html"'));
assert.ok(payoffLoan.includes('href="loan-interest-calculator.html"'));
assert.ok(payoffLoan.includes('href="loan-comparison-calculator.html"'));
assert.ok(emiGuide.includes('href="blog-emi-amortization-schedule.html"'));
assert.ok(emiGuide.includes('href="home-loan-emi-pakistan.html"'));
assert.ok(amortizationGuide.includes('href="loan-payoff-calculator.html"'));
assert.ok(amortizationGuide.includes('href="loan-comparison-calculator.html"'));
assert.ok(emiCore.includes('href="home-loan-emi-pakistan.html"'));
assert.ok(emiCore.includes('href="car-loan-emi-pakistan.html"'));

console.log('Zakat and EMI runtime regression tests passed.');
