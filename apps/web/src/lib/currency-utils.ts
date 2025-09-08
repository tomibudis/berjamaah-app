/**
 * Format currency in Indonesian format
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000000000) {
    // Triliun
    return `Rp ${(amount / 1000000000000).toFixed(1)}T`;
  } else if (amount >= 1000000000) {
    // Milyar
    return `Rp ${(amount / 1000000000).toFixed(1)}M`;
  } else if (amount >= 1000000) {
    // Juta
    return `Rp ${(amount / 1000000).toFixed(1)}JT`;
  } else if (amount >= 1000) {
    // Ribu
    return `Rp ${(amount / 1000).toFixed(1)}K`;
  } else {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
}
