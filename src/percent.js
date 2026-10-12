function decimal(value, maxLength = 40) {
  const text = String(value).trim();
  if (!text || text.length > maxLength) return null;
  if (text.includes(',') && !/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(text)) return null;
  const clean = text.replaceAll(',', '');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(clean)) return null;
  const negative = clean.startsWith('-');
  const [whole, fraction = ''] = clean.replace(/^[+-]/, '').split('.');
  return { value: BigInt((whole || '0') + fraction) * (negative ? -1n : 1n), scale: fraction.length };
}

function decimalText(value, scale) {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(scale + 1, '0');
  const whole = scale ? digits.slice(0, -scale) : digits;
  const fraction = scale ? digits.slice(-scale).replace(/0+$/, '') : '';
  return `${negative ? '-' : ''}${whole}${fraction ? '.' + fraction : ''}`;
}

// Integer arithmetic keeps decimal money exact, including values above the
// safe-integer limit; no rounding or conversion to floating point is needed.
export function calculatePercent(baseInput, percentInput) {
  const base = decimal(baseInput);
  const percent = decimal(percentInput);
  if (!base || !percent) return null;
  const scale = base.scale + percent.scale + 2;
  const adjustment = base.value * percent.value;
  const total = base.value * 10n ** BigInt(percent.scale + 2) + adjustment;
  return {
    base: decimalText(base.value, base.scale),
    percent: decimalText(percent.value, percent.scale),
    adjustment: decimalText(adjustment, scale),
    total: decimalText(total, scale),
  };
}

export function formatAmount(value) {
  const [whole, fraction] = value.split('.');
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction ? '.' + fraction : ''}`;
}

export function formatWon(value) {
  const amount = decimal(value, Infinity);
  return amount ? formatAmount((amount.value / 10n ** BigInt(amount.scale)).toString()) : '—';
}

export function formatDollars(value) {
  const amount = decimal(value, Infinity);
  if (!amount) return '—';
  const absolute = amount.value < 0n ? -amount.value : amount.value;
  const cents = amount.scale <= 2
    ? absolute * 10n ** BigInt(2 - amount.scale)
    : (absolute + 10n ** BigInt(amount.scale - 2) / 2n) / 10n ** BigInt(amount.scale - 2);
  return `${amount.value < 0n && cents > 0n ? '-' : ''}$${formatAmount((cents / 100n).toString())}.${(cents % 100n).toString().padStart(2, '0')}`;
}

function priceText(value, scale, currency) {
  if (currency === 'USD') {
    if (scale <= 2) return decimalText(value, scale);
    const divisor = 10n ** BigInt(scale - 2);
    return decimalText((value + divisor / 2n) / divisor, 2);
  }
  return (value / 10n ** BigInt(scale)).toString();
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

function fractionPrice(numerator, denominator, currency) {
  // Quantize only for display; targets use the exact fraction.
  if (currency === 'USD') return decimalText((numerator * 200n + denominator) / (denominator * 2n), 2);
  return (numerator / denominator).toString();
}

export function simulateAveraging(baseInput, dropInput, profitInput = '0', currency = 'KRW') {
  const base = decimal(baseInput);
  const drop = decimal(dropInput);
  const profit = decimal(profitInput);
  if (!base || !drop || !profit || base.value <= 0n || !['KRW', 'USD'].includes(currency)) return null;
  const profitDenominator = 100n * 10n ** BigInt(profit.scale);
  if (profit.value < -profitDenominator) return null;
  const rate = drop.value < 0n ? -drop.value : drop.value;
  const denominator = 100n * 10n ** BigInt(drop.scale);
  if (rate >= denominator) return null;
  const factor = denominator - rate;
  let value = base.value;
  let scale = base.scale;
  let cumulativeInvestment = 0;
  let quantity = { numerator: 0n, denominator: 1n };
  const rows = [];
  for (let step = 1; step <= 10; step += 1) {
    const purchaseAmount = step * (currency === 'USD' ? 100 : 1_000_000);
    cumulativeInvestment += purchaseAmount;
    // Each purchase buys its own amount / price. Sum exact rational quantities
    // instead of rounding shares before calculating the weighted cost.
    const purchased = fraction(BigInt(purchaseAmount) * 10n ** BigInt(scale), value);
    quantity = fraction(
      quantity.numerator * purchased.denominator + purchased.numerator * quantity.denominator,
      quantity.denominator * purchased.denominator,
    );
    const averageNumerator = BigInt(cumulativeInvestment) * quantity.denominator;
    const averageDenominator = quantity.numerator;
    rows.push({
      step,
      price: decimalText(value, scale),
      displayPrice: priceText(value, scale, currency),
      purchaseAmount,
      cumulativeInvestment,
      averagePrice: fractionPrice(averageNumerator, averageDenominator, currency),
      targetPrice: fractionPrice(averageNumerator * (profitDenominator + profit.value), averageDenominator * profitDenominator, currency),
      expectedProfit: decimalText(BigInt(cumulativeInvestment) * profit.value, profit.scale + 2),
    });
    // Carry the exact compounded price into the next step. Display rounding
    // must never become the basis of a later purchase trigger.
    value *= factor;
    scale += drop.scale + 2;
  }
  return { basePrice: decimalText(base.value, base.scale), dropPercent: decimalText(rate, drop.scale), profitPercent: decimalText(profit.value, profit.scale), rows, totalInvestment: cumulativeInvestment };
}
