import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../psx-portfolio-calculator.html", import.meta.url), "utf8");
assert.match(html, /Dated transactions & annualized return \(XIRR\)/, "dated cash-flow analysis must be visible");
assert.match(html, /id="valuationDate"/, "the terminal valuation date must be explicit");
assert.match(html, /id="exportCashFlows"/, "dated cash flows must be exportable for audit");
assert.match(html, /calcora-psx-dated-cash-flows\.csv/, "export must use a clear CSV filename");
assert.match(html, /maximum of 50 dated transactions/, "the transaction ledger must enforce its documented limit");
assert.match(html, /class="cash-fees"/, "transactions must support explicit broker fees and taxes");
assert.match(html, /Fees\/taxes entered/, "the result must reconcile entered fees and taxes");
assert.match(html, /Net dividends received/, "dividend receipts must be reported separately");


const inlineScript = html.split("<script>").at(-1).split("</script>")[0];
assert.doesNotThrow(() => new Function(inlineScript), "portfolio page JavaScript must parse without syntax errors");
const match = inlineScript.match(/function calculateXirr\(flows\)\{([\s\S]*?)\nfunction readCashFlows\(\)/);
assert.ok(match, "the pure XIRR solver must remain separately testable");
const calculateXirr = new Function("flows", match[1].replace(/\}\s*$/, ""));
const feeMatch = inlineScript.match(/function signedCashFlow\(row\)\{([\s\S]*?)\nfunction calculateXirr/);
assert.ok(feeMatch, "fee-aware cash flow conversion must be testable");
const signedCashFlow = new Function("row", feeMatch[1].replace(/\}\s*$/, ""));
const mockRow = (type, amount, fees, date = "2025-01-01") => ({
  querySelector(selector) {
    const fields = {
      ".cash-type": { value: type },
      ".cash-amount": { value: String(amount) },
      ".cash-fees": { value: String(fees) },
      ".cash-date": { value: date }
    };
    return fields[selector];
  }
});
assert.equal(signedCashFlow(mockRow("buy", 10000, 100)).signed, -10100, "buy cash flow must include fees as an additional outflow");
assert.equal(signedCashFlow(mockRow("sell", 12000, 200)).signed, 11800, "sale cash flow must deduct fees from proceeds");
assert.equal(signedCashFlow(mockRow("dividend", 300, 30)).signed, 270, "net dividend receipt must deduct entered withholding/tax");


const tenPercent = calculateXirr([
  { date: "2025-01-01", amount: -10000 },
  { date: "2026-01-01", amount: 11000 }
]);
assert.ok(Math.abs(tenPercent - 0.1) < 1e-7, `one-year 10% return should solve to 10%, got ${tenPercent}`);

const twentyPercent = calculateXirr([
  { date: "2025-01-01", amount: -10000 },
  { date: "2026-01-01", amount: 12000 }
]);
assert.ok(Math.abs(twentyPercent - 0.2) < 1e-7, `one-year 20% return should solve to 20%, got ${twentyPercent}`);

assert.throws(() => calculateXirr([
  { date: "2025-01-01", amount: 100 },
  { date: "2026-01-01", amount: 200 }
]), /at least one investment outflow/, "XIRR must reject cash flows with no investment outflow");

assert.throws(() => calculateXirr([
  { date: "", amount: -100 },
  { date: "2026-01-01", amount: 200 }
]), /valid date/, "XIRR must reject missing transaction dates");


assert.match(html, /Target allocation & rebalancing planner/, "portfolio rebalancing planner must be visible");
assert.match(html, /class="target-allocation"/, "each holding must accept a target allocation");
assert.match(html, /Target allocations must total 100%/, "rebalancing must validate target weights");
assert.match(html, /Residual gap after whole shares/, "rebalancing must disclose whole-share rounding residuals");
assert.match(html, /Target allocation \(%\)/, "portfolio CSV must preserve target allocations");
const rebalanceMatch = inlineScript.match(/function calculateRebalance\(data,totalValue\)\{([\s\S]*?)\}\nfunction money/);
assert.ok(rebalanceMatch, "the rebalancing calculation must remain separately testable");
const calculateRebalance = new Function("data", "totalValue", rebalanceMatch[1]);
const rebalancePlan = calculateRebalance([
  {symbol:"AAA",q:10,price:100,targetAllocation:50},
  {symbol:"BBB",q:30,price:100,targetAllocation:50}
], 4000);
assert.equal(rebalancePlan[0].shareChange, 10, "underweight holding should suggest buying whole shares");
assert.equal(rebalancePlan[1].shareChange, -10, "overweight holding should suggest selling whole shares");
assert.equal(rebalancePlan[0].residualGap, 0, "exact whole-share rebalance should leave no residual gap");
assert.equal(rebalancePlan[1].residualGap, 0, "exact whole-share rebalance should leave no residual gap for second holding");
const exitPlan = calculateRebalance([
  {symbol:"KEEP",q:10,price:100,targetAllocation:100,targetEntered:true},
  {symbol:"EXIT",q:5,price:100,targetAllocation:0,targetEntered:true}
], 1500);
assert.equal(exitPlan.length, 2, "zero-percent targets must remain in the plan so users can exit a position");
assert.equal(exitPlan[1].shareChange, -5, "a zero-percent target should suggest selling the entire holding at the entered reference price");

console.log("PSX portfolio dated cash-flow XIRR checks: PASS");
