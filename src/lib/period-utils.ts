/**
 * Utility functions for handling program period display
 */

/**
 * Check if a date is null, undefined, or represents an empty date (1970-01-01)
 */
export function isEmptyDate(date: string | null | undefined): boolean {
  if (!date) return true;

  const dateObj = new Date(date);
  const epochDate = new Date('1970-01-01T00:00:00.000Z');

  return dateObj.getTime() === epochDate.getTime();
}

/**
 * Calculate remaining days between current date and end date
 */
export function calculateRemainingDays(
  endDate: string | null | undefined
): number {
  if (!endDate || isEmptyDate(endDate)) return 0;

  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Format period text for display
 * @param startDate - Program start date
 * @param endDate - Program end date
 * @returns Formatted period text
 */
export function formatPeriodText(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  // If both dates are empty or null, show "Selalu Aktif"
  if (isEmptyDate(startDate) && isEmptyDate(endDate)) {
    return 'Selalu Aktif';
  }

  // If only end date is empty, show "Selalu Aktif"
  if (isEmptyDate(endDate)) {
    return 'Selalu Aktif';
  }

  // If only start date is empty, show remaining days
  if (isEmptyDate(startDate)) {
    const remainingDays = calculateRemainingDays(endDate);
    if (remainingDays > 0) {
      return `${remainingDays} hari lagi`;
    } else {
      return 'Berakhir';
    }
  }

  // Both dates are valid, show date range
  const start = new Date(startDate!);
  const end = new Date(endDate!);

  return `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`;
}

/**
 * Format period text for program cards (shorter version)
 * @param startDate - Program start date
 * @param endDate - Program end date
 * @returns Formatted period text for cards
 */
export function formatPeriodTextForCard(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  // If both dates are empty or null, show "Selalu Aktif"
  if (isEmptyDate(startDate) && isEmptyDate(endDate)) {
    return 'Selalu Aktif';
  }

  // If only end date is empty, show "Selalu Aktif"
  if (isEmptyDate(endDate)) {
    return 'Selalu Aktif';
  }

  // If only start date is empty, show remaining days
  if (isEmptyDate(startDate)) {
    const remainingDays = calculateRemainingDays(endDate);
    if (remainingDays > 0) {
      return `${remainingDays} hari lagi`;
    } else {
      return 'Berakhir';
    }
  }

  // Both dates are valid, show remaining days
  const remainingDays = calculateRemainingDays(endDate);
  if (remainingDays > 0) {
    return `${remainingDays} hari lagi`;
  } else {
    return 'Berakhir';
  }
}
