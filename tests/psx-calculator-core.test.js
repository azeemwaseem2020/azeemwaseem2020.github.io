import assert from "node:assert/strict";

const round = (n, digits = 2) => Number(n.toFixed(digits));

function trade({ buy, sell, shares, buyCost = 0, sellCost = 0, cgt = 0, days = 0 }) {
  if (![buy, sell, shares, buyCost, sellCost, cgt, days].every(Number.isFinite)) throw new Error("non-finite input");
  if (buy <= 0 || sell < 0 || shares <= 0 || buyCost < 0 || sellCost < 0 || cgt < 0 || cgt > 100 || days < 0) throw new Error("invalid input");
  const invested = buy * shares;
  const saleValue = sell * shares;
  const gross = saleValue - invested;
  const costs = buyCost + sellCost;
  const preTax = gross - costs;
  const taxable = Math.max(0, preTax);
  const tax = taxable * cgt / 100;
  const net = preTax - tax;
  const returnPct = net / invested * 100;
  const breakEven = (invested + costs) / shares;
  const annualized = days > 0 && net > -invested
    ? (Math.pow(Math.max(0.0000001, 1 + returnPct / 100), 365 / days) - 1) * 100
    : null;
  return { invested, saleValue, gross, costs, tax, net, returnPct, breakEven, annualized };
}

function fees({ buy, sell, shares, buyComm, sellComm, feeTax, buyOther, sellOther, fixedFees, minComm = 0 }) {
  if (![buy, sell, shares, buyComm, sellComm, feeTax, buyOther, sellOther, fixedFees, minComm].every(Number.isFinite)) throw new Error("non-finite input");
  if (buy <= 0 || sell < 0 || shares <= 0 || [buyComm, sellComm, feeTax, buyOther, sellOther, fixedFees, minComm].some(v => v < 0)) throw new Error("invalid input");
  const buyValue = buy * shares;
  const sellValue = sell * shares;
  const buyCommission = Math.max(buyValue * buyComm / 100, minComm);
  const sellCommission = Math.max(sellValue * sellComm / 100, minComm);
  const buyFeeTax = buyCommission * feeTax / 100;
  const sellFeeTax = sellCommission * feeTax / 100;
  const buyOtherCost = buyValue * buyOther / 100;
  const sellOtherCost = sellValue * sellOther / 100;
  const buyTotal = buyCommission + buyFeeTax + buyOtherCost + fixedFees;
  const sellTotal = sellCommission + sellFeeTax + sellOtherCost + fixedFees;
  return { buyTotal, sellTotal, total: buyTotal + sellTotal };
}

function dividend({ dps, shares, price, tax }) {
  if (![dps, shares, price, tax].every(Number.isFinite)) throw new Error("non-finite input");
  if (dps < 0 || shares <= 0 || price <= 0 || tax < 0 || tax > 100) throw new Error("invalid input");
  const gross = dps * shares;
  const withholding = gross * tax / 100;
  return { gross, withholding, net: gross - withholding, yieldPct: dps / price * 100 };
}

function average({ q1, p1, q2, p2 }) {
  if (![q1, p1, q2, p2].every(Number.isFinite)) throw new Error("non-finite input");
  if (q1 < 0 || q2 < 0 || p1 <= 0 || p2 <= 0 || q1 + q2 <= 0) throw new Error("invalid input");
  return (q1 * p1 + q2 * p2) / (q1 + q2);
}

function bonus({ shares, bonusShares, totalCost }) {
  if (![shares, bonusShares, totalCost].every(Number.isFinite)) throw new Error("non-finite input");
  if (shares <= 0 || bonusShares < 0 || totalCost < 0) throw new Error("invalid input");
  return { adjustedShares: shares + bonusShares, averageCost: totalCost / (shares + bonusShares) };
}

function rights({ shares, ratio, rightsPrice, averageCost }) {
  if (![shares, ratio, rightsPrice, averageCost].every(Number.isFinite)) throw new Error("non-finite input");
  if (shares < 0 || ratio < 0 || rightsPrice <= 0 || averageCost <= 0 || shares + shares * ratio <= 0) throw new Error("invalid input");
  const rightsShares = shares * ratio;
  const cash = rightsShares * rightsPrice;
  const totalShares = shares + rightsShares;
  return { rightsShares, cash, totalShares, blendedAverage: (shares * averageCost + cash) / totalShares };
}

const t = trade({ buy: 100, sell: 120, shares: 100, buyCost: 100, sellCost: 100, cgt: 10 });
assert.equal(t.invested, 10000);
assert.equal(t.saleValue, 12000);
assert.equal(t.gross, 2000);
assert.equal(t.costs, 200);
assert.equal(t.tax, 180);
assert.equal(t.net, 1620);
assert.equal(round(t.returnPct), 16.2);
assert.equal(round(t.breakEven), 102);

const loss = trade({ buy: 100, sell: 80, shares: 50, buyCost: 50, sellCost: 50, cgt: 15 });
assert.equal(loss.tax, 0);
assert.equal(loss.net, -1100);
assert.equal(round(loss.returnPct), -22);

const f = fees({ buy: 100, sell: 120, shares: 100, buyComm: 0.15, sellComm: 0.15, feeTax: 15, buyOther: 0.05, sellOther: 0.05, fixedFees: 10 });
const minFee = fees({ buy: 10, sell: 12, shares: 1, buyComm: 0.1, sellComm: 0.1, feeTax: 0, buyOther: 0, sellOther: 0, fixedFees: 0, minComm: 5 });
assert.equal(minFee.buyTotal, 5);
assert.equal(minFee.sellTotal, 5);
assert.equal(round(f.buyTotal), 30.13);
assert.equal(round(f.sellTotal), 36.70);
assert.equal(round(f.total), 68.95);

const d = dividend({ dps: 5, shares: 200, price: 100, tax: 15 });
assert.equal(d.gross, 1000);
assert.equal(d.withholding, 150);
assert.equal(d.net, 850);
assert.equal(d.yieldPct, 5);

assert.equal(round(average({ q1: 100, p1: 100, q2: 50, p2: 130 })), 110);
assert.deepEqual(bonus({ shares: 100, bonusShares: 20, totalCost: 10000 }), { adjustedShares: 120, averageCost: 83.33333333333333 });
assert.deepEqual(rights({ shares: 100, ratio: 0.2, rightsPrice: 80, averageCost: 100 }), { rightsShares: 20, cash: 1600, totalShares: 120, blendedAverage: 96.66666666666667 });

// Boundary: minimum brokerage should apply only when percentage brokerage is lower.
const percentageAboveMinimum = fees({ buy: 1000, sell: 1200, shares: 1, buyComm: 1, sellComm: 1, feeTax: 0, buyOther: 0, sellOther: 0, fixedFees: 0, minComm: 5 });
assert.equal(percentageAboveMinimum.buyTotal, 10);
assert.equal(percentageAboveMinimum.sellTotal, 12);

// Boundary: a losing trade must not create CGT in the core model.
const lossWithCgt = trade({ buy: 100, sell: 90, shares: 100, buyCost: 50, sellCost: 50, cgt: 20 });
assert.equal(lossWithCgt.tax, 0);
assert.equal(lossWithCgt.net, -1100);

// Boundary: break-even includes both supplied transaction costs.
const breakEvenCheck = trade({ buy: 100, sell: 100, shares: 100, buyCost: 125, sellCost: 75, cgt: 20 });
assert.equal(round(breakEvenCheck.breakEven), 102);

// Boundary: annualized return is unavailable when the loss reaches or exceeds the invested amount.
const totalLoss = trade({ buy: 100, sell: 0, shares: 1, days: 365 });
assert.equal(totalLoss.annualized, null);

assert.throws(() => trade({ buy: 0, sell: 100, shares: 1 }));
assert.throws(() => average({ q1: 100, p1: 0, q2: 0, p2: 100 }));
assert.throws(() => dividend({ dps: 5, shares: 0, price: 100, tax: 0 }));
assert.throws(() => rights({ shares: 0, ratio: 0, rightsPrice: 80, averageCost: 100 }));

console.log("PSX calculator core regression tests: PASS");
