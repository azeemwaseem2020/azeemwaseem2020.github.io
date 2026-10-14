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
  field('amount').value = '1e308';
  field('calculate').handlers.click();
  assert.match(field('result').innerHTML, /too large to calculate reliably/);
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

console.log('Zakat and EMI runtime regression tests passed.');
