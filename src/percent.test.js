import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePercent, formatAmount, formatWon, formatDollars, simulateAveraging } from './percent.js';

test('adds positive percentages and subtracts negative percentages', () => {
  assert.deepEqual(calculatePercent('5000', '10'), { base: '5000', percent: '10', adjustment: '500', total: '5500' });
  assert.deepEqual(calculatePercent('5000', '-10'), { base: '5000', percent: '-10', adjustment: '-500', total: '4500' });
  assert.equal(calculatePercent('5000', '0').total, '5000');
  assert.equal(calculatePercent('5000', '-100').total, '0');
  assert.equal(calculatePercent('5000', '-150').total, '-2500');
  assert.equal(calculatePercent('0', '10').total, '0');
});

test('dollar output rounds to cents exactly, including negative and very large values', () => {
  assert.equal(formatDollars(calculatePercent('5000', '10').total), '$5,500.00');
  assert.equal(formatDollars('1,234.565'), '$1,234.57');
  assert.equal(formatDollars('-1234.565'), '-$1,234.57');
  assert.equal(formatDollars('-0.004'), '$0.00');
  assert.equal(formatDollars('9999999999999999.995'), '$10,000,000,000,000,000.00');
});

test('USD simulator invests $100 through $1000 and computes profit from exact purchased quantities', () => {
  const plan = simulateAveraging('100', '50', '10', 'USD');
  assert.deepEqual(plan.rows.map(row => row.purchaseAmount), [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);
  assert.equal(plan.totalInvestment, 5500);
  assert.equal(plan.rows[1].averagePrice, '60');
  assert.equal(plan.rows[1].targetPrice, '66');
  assert.equal(plan.rows[1].expectedProfit, '30');
  assert.equal(plan.rows[2].averagePrice, '35.29');
  assert.equal(plan.rows[2].targetPrice, '38.82');
  assert.equal(plan.rows[2].expectedProfit, '60');
  assert.equal(simulateAveraging('3', '0', '2.5', 'USD').rows[0].targetPrice, '3.08');
  const fractional = simulateAveraging('123.45', '7.5', '7', 'USD');
  assert.equal(fractional.rows[1].displayPrice, '114.19');
  assert.equal(fractional.rows[2].price, '105.62690625');
});

test('accepts grouped money, decimal rates and amounts without floating-point rounding', () => {
  assert.equal(calculatePercent('5,000', '+2.5').total, '5125');
  assert.equal(calculatePercent('0.1', '20').total, '0.12');
  assert.equal(calculatePercent('1234.56', '-7.5').total, '1141.968');
  assert.equal(calculatePercent('.5', '10').total, '0.55');
  assert.equal(calculatePercent('9999999999999999', '10').total, '10999999999999998.9');
});

test('empty, incomplete and malformed inputs never produce a misleading zero or NaN', () => {
  for (const input of ['', ' ', '-', '.', 'abc', 'Infinity', '1,,000', '50,00', '1e3', '1'.repeat(41)]) {
    assert.equal(calculatePercent(input, '10'), null);
    assert.equal(calculatePercent('5000', input), null);
  }
});

test('formats totals and negative adjustments with grouping and exact decimals', () => {
  assert.equal(formatWon('1234.999'), '1,234');
  assert.equal(formatWon('1,234.999'), '1,234');
  assert.equal(formatWon('.9'), '0');
  assert.equal(formatWon('-1234.999'), '-1,234');
  assert.equal(formatWon('-0.9'), '0');
  assert.equal(formatWon('10999999999999998.9'), '10,999,999,999,999,998');
  assert.equal(formatAmount('5500'), '5,500');
  assert.equal(formatAmount('-1234.56'), '-1,234.56');
  assert.equal(formatAmount('10999999999999998.9'), '10,999,999,999,999,998.9');
});

test('ten purchases include the initial purchase, compound each drop, and sum to 55 million won', () => {
  const plan = simulateAveraging('100,000', '7');
  assert.equal(plan.rows.length, 10);
  assert.deepEqual(plan.rows[0], { step: 1, price: '100000', displayPrice: '100000', purchaseAmount: 1000000, cumulativeInvestment: 1000000, averagePrice: '100000', targetPrice: '100000', expectedProfit: '0' });
  assert.equal(plan.rows[1].price, '93000');
  assert.equal(plan.rows[2].price, '86490');
  assert.deepEqual(plan.rows.map(row => row.purchaseAmount), [1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000]);
  assert.equal(plan.rows[3].cumulativeInvestment, 10000000);
  assert.equal(plan.rows[9].cumulativeInvestment, 55000000);
  assert.equal(plan.totalInvestment, 55000000);
  assert.deepEqual(simulateAveraging('100000', '-7'), plan);
});

test('simulation display rounding never changes subsequent compound purchase prices', () => {
  const plan = simulateAveraging('123.45', '7.5');
  assert.equal(plan.rows[1].price, '114.19125');
  assert.equal(plan.rows[1].displayPrice, '114');
  assert.equal(plan.rows[2].price, '105.62690625');
  assert.equal(plan.rows[2].displayPrice, '105');
  assert.equal(simulateAveraging('5000', '0').rows[9].price, '5000');
  assert.equal(simulateAveraging('1.234567890123456789', '7.1234567890123456789').rows.length, 10);
});

test('simulation rejects invalid prices and drops that would produce zero or negative purchase prices', () => {
  for (const price of ['', '-', '0', '-100', 'abc']) assert.equal(simulateAveraging(price, '7'), null);
  for (const rate of ['', '-', 'abc', '100', '-100', '101']) assert.equal(simulateAveraging('100000', rate), null);
});

test('average cost uses cumulative purchased quantity and each step gets its own profit target', () => {
  const plan = simulateAveraging('100', '50', '10');
  assert.equal(plan.rows[0].averagePrice, '100');
  assert.equal(plan.rows[0].targetPrice, '110');
  // 10,000 shares at 100 + 40,000 shares at 50: 3,000,000 / 50,000 = 60.
  assert.equal(plan.rows[1].averagePrice, '60');
  assert.equal(plan.rows[1].targetPrice, '66');
  assert.equal(plan.rows[1].expectedProfit, '300000');
  // A third purchase at 25 adds 120,000 shares: exact average = 600 / 17.
  assert.equal(plan.rows[2].averagePrice, '35');
  assert.equal(plan.rows[2].targetPrice, '38');
  assert.equal(plan.rows[2].expectedProfit, '600000');
  assert.equal(plan.rows[9].expectedProfit, '5500000');
});

test('profit targets preserve fractional quantities and calculate from unrounded average cost', () => {
  const plan = simulateAveraging('3', '0', '2.5');
  assert.equal(plan.rows[0].averagePrice, '3');
  assert.equal(plan.rows[0].targetPrice, '3');
  assert.equal(plan.rows[0].expectedProfit, '25000');
  const truncated = simulateAveraging('100', '50', '2');
  assert.equal(truncated.rows[2].averagePrice, '35');
  assert.equal(truncated.rows[2].targetPrice, '36');
  assert.equal(simulateAveraging('99.999', '0').rows[0].averagePrice, '99');
  const breakeven = simulateAveraging('100000', '7', '0');
  assert.equal(breakeven.rows[2].targetPrice, breakeven.rows[2].averagePrice);
  assert.equal(simulateAveraging('100', '50', '-10').rows[1].targetPrice, '54');
  assert.equal(simulateAveraging('100', '50', '-10').rows[1].expectedProfit, '-300000');
  for (const profit of ['', '-', 'abc', '-101']) assert.equal(simulateAveraging('100000', '7', profit), null);
});
