import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// WIB timezone offset: UTC+7
const WIB_TIMEZONE = 'Asia/Jakarta';

/**
 * Format date to Indonesian format with WIB timezone
 * @param date - Date to format
 * @param formatString - Format string (default: 'dd MMM yyyy')
 * @returns Formatted date string
 */
export function formatDateWIB(
  date: Date | string,
  formatString: string = 'dd MMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: id });
}

/**
 * Format date and time to Indonesian format with WIB timezone
 * @param date - Date to format
 * @param formatString - Format string (default: 'dd MMM yyyy HH:mm')
 * @returns Formatted date and time string
 */
export function formatDateTimeWIB(
  date: Date | string,
  formatString: string = 'dd MMM yyyy HH:mm'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: id });
}

/**
 * Format time to Indonesian format with WIB timezone
 * @param date - Date to format
 * @param formatString - Format string (default: 'HH:mm')
 * @returns Formatted time string
 */
export function formatTimeWIB(
  date: Date | string,
  formatString: string = 'HH:mm'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: id });
}

/**
 * Format date for calendar display (MMM dd, yyyy)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatCalendarDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date for input field (yyyy-MM-dd)
 * @param date - Date to format
 * @returns Formatted date string for input
 */
export function formatInputDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Format time for input field (HH:mm)
 * @param date - Date to format
 * @returns Formatted time string for input
 */
export function formatInputTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm');
}

/**
 * Get current date in WIB timezone
 * @returns Current date in WIB
 */
export function getCurrentDateWIB(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: WIB_TIMEZONE })
  );
}

/**
 * Convert date to WIB timezone
 * @param date - Date to convert
 * @returns Date in WIB timezone
 */
export function toWIB(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.toLocaleString('en-US', { timeZone: WIB_TIMEZONE }));
}
