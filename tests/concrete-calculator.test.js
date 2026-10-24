const fs = require("node:fs");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const html = fs.readFileSync("concrete-calculator.html", "utf8");
assert.match(html, /Concrete Calculator: Cubic Yards &amp; Bag Estimate|Concrete Calculator: Cubic Yards & Bag Estimate/);
assert.match(html, /og:title/);
assert.match(html, /og:description/);
assert.match(html, /60 lb bag/);
assert.match(html, /80 lb bag/);
assert.match(html, /0\.45/);
assert.match(html, /0\.60/);
assert.match(html, /Math\.ceil\(adjustedFt3\/0\.45\)/);
assert.match(html, /Math\.ceil\(adjustedFt3\/0\.60\)/);
assert.match(html, /Z>100/);
assert.match(html, /Number\.isFinite/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /Bag yields are estimates/);
assert.doesNotMatch(html, /o\.innerHTML/);

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attrs, source]) => !/application\/ld\+json/i.test(attrs) && source.trim());
assert.ok(scripts.length, "concrete calculator must contain executable JavaScript");
const values = { l: "20", w: "10", t: "4", z: "10" };
const elements = Object.fromEntries(
  ["l", "w", "t", "z", "go", "result"].map(id => [id, {
    value: values[id] ?? "",
    textContent: "",
    addEventListener(event, callback) {
      assert.equal(event, "click");
      this.click = callback;
    },
  }]),
);
const context = { document: { getElementById(id) {
  assert.ok(elements[id], `unexpected element id: ${id}`);
  return elements[id];
} } };
vm.runInNewContext(scripts[scripts.length - 1][2], context, { filename: "concrete-calculator.inline.js" });
const calculate = () => elements.go.click();

calculate();
assert.match(elements.result.textContent, /Base volume: 66\.67 ft³/);
assert.match(elements.result.textContent, /With 10% allowance: 73\.33 ft³/);
assert.match(elements.result.textContent, /Approximate bag count at this allowance: 163 × 60 lb bags or 123 × 80 lb bags/);

elements.z.value = "0";
calculate();
assert.match(elements.result.textContent, /With 0% allowance: 66\.67 ft³/);
assert.match(elements.result.textContent, /148 × 60 lb bags or 112 × 80 lb bags/);

elements.z.value = "101";
calculate();
assert.match(elements.result.textContent, /waste allowance from 0% to 100%/);

elements.z.value = "10";
elements.l.value = "0";
calculate();
assert.match(elements.result.textContent, /finite positive dimensions/);

console.log("Concrete calculator runtime regression tests passed: volume, allowance, bag rounding and invalid-input handling.");
