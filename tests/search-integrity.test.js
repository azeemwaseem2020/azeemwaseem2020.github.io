import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const home = read("index.html");
const library = read("calculators.html");
const search = read("calculator-search.js");
const navigation = read("navigation.js");

// Homepage search must pass the visitor's query to the searchable library.
assert.match(home, /<form action="calculators\.html" method="get">/);
assert.match(home, /id="home-calculator-search" name="q" type="search"/);

// The searchable directory must expose accessible controls and real calculator cards.
assert.match(library, /id="calculatorSearch"[^>]*aria-controls="calculator-list"/);
assert.match(library, /id="calculatorCategoryFilters"[^>]*role="group"/);
assert.match(library, /id="calculatorNoResults"[^>]*role="status"[^>]*hidden/);
assert.match(library, /id="calculatorSearchCount"[^>]*aria-live="polite"/);
const directory = library.slice(library.indexOf('id="calculator-list"'));
const cards = [...directory.matchAll(/<a[^>]*class="[^"]*calculator-card[^"]*"[^>]*>/g)];
const searchableCards = cards.filter(([card]) => !/data-search-ignore="true"/.test(card));
assert.ok(cards.length >= 200, "Expected a substantial calculator directory; found " + cards.length + " cards");
assert.ok(searchableCards.length >= 200, "Expected 200+ searchable cards; found " + searchableCards.length);
assert.ok(cards.every(([card]) => /href=/.test(card)), "Every calculator card must link to its tool");
const searchableHrefs = searchableCards.map(([card]) => card.match(/href="([^"]+)"/)?.[1]);
assert.equal(new Set(searchableHrefs).size, searchableHrefs.length, "Searchable calculator results must not contain duplicate URLs");
for (const [card] of cards) {
  const href = card.match(/href="([^"]+)"/)?.[1];
  if (href && !/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(href)) {
    const localPath = href.replace(/^\.\//, "").split(/[?#]/)[0];
    assert.ok(fs.existsSync(path.join(root, localPath)), "Missing local calculator target: " + href);
  }
}

// Search behavior must preserve homepage queries, category filters, aliases and recovery.
assert.match(search, /new URLSearchParams\(location\.search\)/);
assert.match(search, /monthly loan payment/);
assert.match(search, /take home salary/);
assert.match(search, /cow tmr ration/);
assert.match(search, /Build accessible category filters/);
assert.match(search, /activeCategory === 'All' \|\| entry\.item\.category === activeCategory/);
assert.match(search, /clearButton\.addEventListener/);
assert.match(search, /event\.key === 'Escape'/);
assert.match(search, /normalizedQuery = norm\(rawQuery\)/);
assert.match(library, /navigation\.js\?v=20261016-1/);
assert.match(home, /navigation\.js\?v=20261016-1/);
assert.match(navigation, /event\.key === 'Escape'/);
assert.match(navigation, /aria-expanded/);
assert.match(navigation, /pointerdown/);

console.log("Search and navigation regression checks: PASS (" + searchableCards.length + " unique searchable cards; " + cards.length + " directory card links)");
