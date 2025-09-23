export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Rp 0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

export function formatCurrencyWithDecimals(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Rp 0,00';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function formatCurrencyCompact(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Rp 0';
  }

  const absAmount = Math.abs(numAmount);

  if (absAmount >= 1e12) {
    return `Rp ${(numAmount / 1e12).toFixed(1)}T`;
  } else if (absAmount >= 1e9) {
    return `Rp ${(numAmount / 1e9).toFixed(1)}B`;
  } else if (absAmount >= 1e6) {
    return `Rp ${(numAmount / 1e6).toFixed(1)}M`;
  } else if (absAmount >= 1e3) {
    return `Rp ${(numAmount / 1e3).toFixed(0)}K`;
  } else {
    return `Rp ${Math.round(numAmount).toLocaleString('id-ID')}`;
  }
}

export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and spaces, then parse
  const cleanString = currencyString.replace(/[Rp\s.,]/g, '');
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
}
