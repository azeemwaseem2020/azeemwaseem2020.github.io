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
  vm.runInNewContext(inlineScript(html, 'const amount='), { document, Math, Number, String, encodeURIComponent });
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

// Loan payoff: verify the normal-rate model, zero-rate branch and invalid-input guardrails.
{
  const html = read('loan-payoff-calculator.html');
  const { document, elements } = makeDom(html);
  vm.runInNewContext(inlineScript(html, "addEventListener('click'"), { document, Math, Number, String });
  const field = id => elements.get(id) ?? document.getElementById(id);
  field('p').value = '10000';
  field('r').value = '8';
  field('m').value = '250';
  field('go').handlers.click();
  assert.match(field('o').textContent, /Estimated payoff: 47 months/);
  assert.match(field('o').textContent, /1,669\.54/);

  field('m').value = '300';
  field('go').handlers.click();
  assert.match(field('o').textContent, /Estimated payoff: 38 months/);
  assert.match(field('o').textContent, /1,346\.80/);

  field('p').value = '1000';
  field('r').value = '0';
  field('m').value = '250';
  field('go').handlers.click();
  assert.match(field('o').textContent, /Estimated payoff: 4 months/);
  assert.match(field('o').textContent, /0\.00/);

  field('r').value = '-2';
  field('go').handlers.click();
  assert.match(field('o').textContent, /non-negative annual rate/);

  field('p').value = '10000';
  field('r').value = '12';
  field('m').value = '50';
  field('go').handlers.click();
  assert.match(field('o').textContent, /greater than the first month/);
}

// Mortgage: validate amortization output, zero-interest behavior and malformed rates.
{
  const html = read('mortgage-calculator.html');
  const { document, elements } = makeDom(html);
  vm.runInNewContext(inlineScript(html, 'function calc()'), { document, Math, Number, String });
  const field = id => elements.get(id) ?? document.getElementById(id);
  field('amount').value = '10000000';
  field('rate').value = '12';
  field('years').value = '20';
  field('calc').handlers.click();
  assert.match(field('out').innerHTML, /Monthly payment:<\/strong> 110,108\.61/);
  assert.match(field('out').innerHTML, /Total interest:<\/strong> 16,426,067\.21/);

  field('rate').value = '0';
  field('amount').value = '1200000';
  field('years').value = '20';
  field('calc').handlers.click();
  assert.match(field('out').innerHTML, /Monthly payment:<\/strong> 5,000\.00/);
  assert.match(field('out').innerHTML, /Total interest:<\/strong> 0\.00/);

  field('rate').value = 'not-a-rate';
  field('calc').handlers.click();
  assert.match(field('out').textContent, /non-negative annual interest rate/);
}

// Sales tax: guard against the former temporal-dead-zone error and verify the entered rate.
{
  const html = read('sales-tax-calculator.html');
  const { document, elements } = makeDom(html);
  vm.runInNewContext(inlineScript(html, "addEventListener('click'"), { document, Math, Number, String });
  const field = id => elements.get(id) ?? document.getElementById(id);
  field('p').value = '10000';
  field('r').value = '18';
  field('b').handlers.click();
  assert.match(field('o').innerHTML, /Tax:<\/strong> 1800\.00/);
  assert.match(field('o').innerHTML, /Total price:<\/strong> 11800\.00/);

  field('r').value = '-1';
  field('b').handlers.click();
  assert.match(field('o').textContent, /non-negative tax rate/);

  field('p').value = '1e309';
  field('r').value = '18';
  field('b').handlers.click();
  assert.match(field('o').textContent, /non-negative price/);
}

console.log('Zakat, EMI, loan payoff, mortgage and sales tax runtime regression tests passed.');
