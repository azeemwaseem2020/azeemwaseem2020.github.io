const fs = require("node:fs");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const html = fs.readFileSync("tile-calculator.html", "utf8");
assert.match(html, /Tile Calculator: Tile Count &amp; Waste Allowance|Tile Calculator: Tile Count & Waste Allowance/);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.match(html, /max="100"/);
assert.match(html, /construction-calculators\.html/);
assert.match(html, /With \"\+W\+\"% waste: /);
assert.doesNotMatch(html, /With \"\+waste\+\"% waste:/);

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attrs, source]) => !/application\/ld\+json/i.test(attrs) && source.trim());
assert.ok(scripts.length, "tile calculator must contain executable JavaScript");
const source = scripts[scripts.length - 1][2];

const values = { "#l": "20", "#w": "15", "#tl": "2", "#tw": "2", "#wa": "10" };
const elements = Object.fromEntries(
  ["#l", "#w", "#tl", "#tw", "#wa", "#r", "#calculate-tiles"].map(selector => [
    selector,
    { value: values[selector] ?? "", textContent: "", addEventListener(event, callback) {
      assert.equal(event, "click");
      this.click = callback;
    } },
  ]),
);
const context = { document: { querySelector(selector) {
  assert.ok(elements[selector], `unexpected selector: ${selector}`);
  return elements[selector];
} } };
vm.runInNewContext(source, context, { filename: "tile-calculator.inline.js" });
const calculate = () => elements["#calculate-tiles"].click();

calculate();
assert.match(elements["#r"].textContent, /Room area: 300\.00 square units/);
assert.match(elements["#r"].textContent, /Base estimate: 75 tiles/);
assert.match(elements["#r"].textContent, /With 10% waste: 83 whole tiles/);

elements["#wa"].value = "0";
calculate();
assert.match(elements["#r"].textContent, /With 0% waste: 75 whole tiles/);

elements["#wa"].value = "101";
calculate();
assert.match(elements["#r"].textContent, /waste allowance from 0% to 100%/);

elements["#wa"].value = "10";
elements["#l"].value = "0";
calculate();
assert.match(elements["#r"].textContent, /Enter positive room and tile dimensions/);

console.log("Tile calculator runtime regression tests passed: normal calculation, rounding, zero waste, invalid waste and invalid dimensions.");
