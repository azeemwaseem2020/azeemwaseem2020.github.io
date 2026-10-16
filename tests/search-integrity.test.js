import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const home = read("index.html");
const library = read("calculators.html");
const search = read("calculator-search.js");

// Homepage search must pass the visitor's query to the searchable library.
assert.match(home, /<form action="calculators\.html" method="get">/);
assert.match(home, /id="home-calculator-search" name="q" type="search"/);

// The searchable directory must expose accessible controls and real calculator cards.
assert.match(library, /id="calculatorSearch"[^>]*aria-controls="calculator-list"/);
assert.match(library, /id="calculatorCategoryFilters"[^>]*role="group"/);
assert.match(library, /id="calculatorNoResults"[^>]*role="status"[^>]*hidden/);
assert.match(library, /id="calculatorSearchCount"[^>]*aria-live="polite"/);
const cards = [...library.matchAll(/<a[^>]*class="[^"]*calculator-card[^"]*"[^>]*>/g)];
assert.ok(cards.length >= 200, `Expected the calculator library to remain substantial; found ${cards.length} cards`);
assert.ok(cards.every(([card]) => /href=/.test(card)), "Every calculator card must link to its tool");

// Search behavior must preserve homepage queries, category filters, aliases and recovery.
assert.match(search, /new URLSearchParams\(location\.search\)/);
assert.match(search, /monthly loan payment/);
assert.match(search, /take home salary/);
assert.match(search, /cow tmr ration/);
assert.match(search, /Build accessible category filters/);
assert.match(search, /activeCategory === 'All' \|\| entry\.item\.category === activeCategory/);
assert.match(search, /clearButton\.addEventListener/);
assert.match(search, /event\.key === 'Escape'/);

console.log(`Search and navigation regression checks: PASS (${cards.length} calculator cards)`);
