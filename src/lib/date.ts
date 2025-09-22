import { format, parseISO, startOfDay } from 'date-fns';

/**
 * Date utility functions for handling date operations without timezone issues
 */

/**
 * Formats a Date object to YYYY-MM-DD string without timezone conversion
 * This prevents the date from shifting by one day due to timezone differences
 * @param date - The Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateToISOString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parses a YYYY-MM-DD string to a Date object in local timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseISODateString(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Gets today's date in YYYY-MM-DD format without timezone conversion
 * @returns Today's date as YYYY-MM-DD string
 */
export function getTodayISOString(): string {
  return formatDateToISOString(new Date());
}

/**
 * Formats a date for display in a user-friendly format
 * @param date - The Date object to format
 * @param formatString - The format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDateForDisplay(
  date: Date,
  formatString: string = 'MMM dd, yyyy'
): string {
  return format(date, formatString);
}

/**
 * Gets the start of day for a given date to avoid timezone issues
 * @param date - The Date object
 * @returns Date object representing the start of the day
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}
